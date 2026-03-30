import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { certificateTemplateBase64 } from '@/lib/certificateTemplate'

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
            const rawBase64 = certificateTemplateBase64.replace(/^data:image\/\w+;base64,/, '');
            const bgBuffer = Buffer.from(rawBase64, 'base64')
            bgImage = await pdfDoc.embedPng(bgBuffer)
        } catch (e) {
            console.error("Failed to decode inline base64 template", e)
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
            // Draw background spanning entire page (it will be 724x1024 inherently)
            page.drawImage(bgImage, { x: 0, y: 0, width, height })
        } else {
            // Fallback (if somehow it fails)
            page.drawText("CERTIFICATO DI COMPLETAMENTO", { x: 100, y: height - 100, size: 30, font: timesBold })
        }

        // 2. WRITE DYNAMIC TEXT
        // In PDF coordinates, 0 is at bottom! Height is 1024. Width is 724.
        
        // --- NAME ---
        // Tracker Box: CenterX=364, Baseline Y=497
        const nameText = member.display_name || 'Nome Cognome'
        const nameFontSize = 36;
        const nameWidth = timesBold.widthOfTextAtSize(nameText, nameFontSize)
        const nameX = 364 - (nameWidth / 2);
        page.drawText(nameText, {
            x: nameX, y: 497, size: nameFontSize, font: timesBold, color: navy
        })

        // --- COMPANY ---
        // Tracker Box: CenterX=361.5, Baseline Y=328, Width=373
        const companyFontSize = 24;
        const maxCompanyWidth = 373;
        const words = finalCompanyName.split(' ')
        let currentLine = words[0] || ''
        const companyLines = []
        for (let i = 1; i < words.length; i++) {
            const word = words[i]
            const cw = timesBold.widthOfTextAtSize(currentLine + ' ' + word, companyFontSize)
            if (cw < maxCompanyWidth) {
                currentLine += ' ' + word
            } else {
                companyLines.push(currentLine)
                currentLine = word
            }
        }
        if (currentLine) companyLines.push(currentLine)

        let currY = 328 + ((companyLines.length - 1) * 14) // Center vertically if multiline
        for (const line of companyLines) {
            const lineWidth = timesBold.widthOfTextAtSize(line, companyFontSize)
            page.drawText(line, {
                x: 361.5 - (lineWidth / 2), y: currY, size: companyFontSize, font: timesBold, color: navy
            })
            currY -= (companyFontSize * 1.2)
        }

        // --- DATE ---
        // Tracker Box: CenterX=345, Baseline Y=98
        const dateFontSize = 18;
        const today = new Date()
        const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
        const dateStr = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`
        
        const dateWidth = timesBold.widthOfTextAtSize(dateStr, dateFontSize)
        const dateX = 345 - (dateWidth / 2);
        
        page.drawText(dateStr, {
            x: dateX, y: 98, size: dateFontSize, font: timesBold, color: navy
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
