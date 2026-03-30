import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization') || ''
        const token = authHeader.replace(/^Bearer\s+/i, '').trim()
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const supabase = getSupabaseAdmin()
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { memberId, teamLicenseId } = await request.json()

        // 1. Verify the requester owns this team
        const { data: license } = await supabase
            .from('team_licenses')
            .select('id, company_name, owner_user_id')
            .eq('id', teamLicenseId)
            .eq('owner_user_id', user.id)
            .maybeSingle()

        if (!license) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

        // 2. Fix Company Name Fallback (If admin script saved email instead of Ragione Sociale)
        let finalCompanyName = license.company_name || 'Azienda'
        if (finalCompanyName.includes('@') || finalCompanyName === 'La mia azienda') {
            const { data: billing } = await supabase
                .from('billing_profiles')
                .select('company_name')
                .eq('user_id', license.owner_user_id)
                .maybeSingle()
            if (billing && billing.company_name) {
                finalCompanyName = billing.company_name
            }
        }

        // 3. Get member details
        const { data: member } = await supabase
            .from('team_members')
            .select('user_id, display_name')
            .eq('id', memberId)
            .eq('team_license_id', teamLicenseId)
            .is('removed_at', null)
            .maybeSingle()

        if (!member) return NextResponse.json({ error: 'Membro non trovato' }, { status: 404 })
        if (!member.display_name) return NextResponse.json({ error: 'Inserisci Nome e Cognome prima di generare il certificato' }, { status: 400 })

        // 4. Check completion
        const { data: progress } = await supabase
            .from('video_watch_progress')
            .select('course_id, completed')
            .eq('user_id', member.user_id)

        const completedCount = (progress || []).filter((p: any) => p.completed).length
        if (completedCount < 27) {
            return NextResponse.json({ 
                error: `Il dipendente ha completato solo ${completedCount}/27 video. Deve completare tutto il corso.` 
            }, { status: 400 })
        }

        // 5. Generate PDF
        const pdfDoc = await PDFDocument.create()

        // Fetch the EXACT AI mockup
        let bgImage;
        try {
            const imagePath = join(process.cwd(), 'public', 'certificate_template.png')
            if (existsSync(imagePath)) {
                const bgBuffer = readFileSync(imagePath)
                bgImage = await pdfDoc.embedPng(bgBuffer)
            } else {
                console.error("Local template image not found at", imagePath)
            }
        } catch (e) {
            console.error("Failed to load background template", e)
        }

        // Set page size exactly to the image's dimensions!
        let width = 1024, height = 768
        if (bgImage) {
            width = bgImage.width
            height = bgImage.height
        }
        
        const page = pdfDoc.addPage([width, height])

        // Fonts
        const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
        const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman)
        const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)
        const navy = rgb(0.1, 0.15, 0.25)
        const gray = rgb(0.3, 0.3, 0.3)

        if (bgImage) {
            // Draw background spanning entire page
            page.drawImage(bgImage, { x: 0, y: 0, width, height })

            // 1. MASK THE OLD AI TEXT
            // The parchment color: 
            const parchment = rgb(0.992, 0.984, 0.965)
            
            // Mask "Marco Bianchi" all the way down to course name
            // Y grows from bottom to top. 
            // In a landscape image (e.g. 1024x768), names are around Y=50% to Y=25%
            page.drawRectangle({
                x: width * 0.15,
                y: height * 0.23, // from above the date/signature line
                width: width * 0.70,
                height: height * 0.33, // up to below "Si certifica che"
                color: parchment
            })

            // Mask the Date at bottom left
            page.drawRectangle({
                x: width * 0.15,
                y: height * 0.15, // around 15% from bottom
                width: width * 0.40, // up to middle
                height: height * 0.08,
                color: parchment
            })
        } else {
            // Fallback (if image absolutely fails)
            page.drawText("CERTIFICATO DI COMPLETAMENTO", { x: 100, y: height - 100, size: 30, font: timesBold })
        }

        // 2. WRITE DYNAMIC TEXT
        // In PDF coordinates, 0 is at bottom!
        const nameY = height * 0.48
        const nameText = member.display_name || 'Nome Cognome'
        const nameWidth = timesBold.widthOfTextAtSize(nameText, 48)
        page.drawText(nameText, {
            x: (width - nameWidth) / 2, y: nameY, size: 48, font: timesBold, color: navy
        })

        const dipendenteY = height * 0.40
        const ofText = 'dipendente di'
        const ofWidth = timesItalic.widthOfTextAtSize(ofText, 18)
        page.drawText(ofText, {
            x: (width - ofWidth) / 2, y: dipendenteY, size: 18, font: timesItalic, color: gray
        })

        const companyY = height * 0.34
        // Wrap logic
        const maxCompanyWidth = width * 0.7
        const words = finalCompanyName.split(' ')
        let currentLine = words[0] || ''
        const companyLines = []
        for (let i = 1; i < words.length; i++) {
            const word = words[i]
            const cw = timesBold.widthOfTextAtSize(currentLine + ' ' + word, 26)
            if (cw < maxCompanyWidth) {
                currentLine += ' ' + word
            } else {
                companyLines.push(currentLine)
                currentLine = word
            }
        }
        if (currentLine) companyLines.push(currentLine)

        let currY = companyY
        for (const line of companyLines) {
            const lineWidth = timesBold.widthOfTextAtSize(line, 26)
            page.drawText(line, {
                x: (width - lineWidth) / 2, y: currY, size: 26, font: timesBold, color: navy
            })
            currY -= 32
        }

        const courseY = currY - 20
        const courseName = 'CORSO TECNICO DIAGNOSTICA CALDAIE'
        const courseWidth = timesBold.widthOfTextAtSize(courseName, 22)
        page.drawText(courseName, {
            x: (width - courseWidth) / 2, y: courseY, size: 22, font: timesBold, color: navy
        })

        const dateY = height * 0.18
        const today = new Date()
        const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
        const dateStr = `Data di conseguimento: ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`
        page.drawText(dateStr, {
            x: width * 0.18, y: dateY, size: 16, font: timesRoman, color: gray
        })

        // Serialize and return
        const pdfBytes = await pdfDoc.save()
        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Certificato_${member.display_name.replace(/\s+/g, '_')}.pdf"`
            }
        })

    } catch (error: any) {
        console.error('[team/certificate] Error:', error)
        return NextResponse.json({ error: 'Errore durante la generazione del certificato' }, { status: 500 })
    }
}
