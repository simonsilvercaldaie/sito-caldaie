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
        const page = pdfDoc.addPage([595.28, 841.89]) // A4
        const { width, height } = page.getSize()

        // Fonts
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
        const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
        const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)
        const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman)

        // Colors
        const navy = rgb(0.08, 0.12, 0.20)
        const gold = rgb(0.85, 0.65, 0.20)
        const orange = rgb(0.93, 0.45, 0.12)
        const gray = rgb(0.40, 0.43, 0.47)
        const lightGray = rgb(0.85, 0.88, 0.90)

        // --- GORGEOUS BORDERS ---
        const outerMargin = 30
        const innerMargin = 40

        // Outer crisp line
        page.drawRectangle({
            x: outerMargin, y: outerMargin,
            width: width - outerMargin * 2, height: height - outerMargin * 2,
            borderColor: navy, borderWidth: 1,
        })
        
        // Inner elegant gold/orange thick frame
        page.drawRectangle({
            x: innerMargin, y: innerMargin,
            width: width - innerMargin * 2, height: height - innerMargin * 2,
            borderColor: orange, borderWidth: 5, opacity: 0.85
        })
        
        // Very thin inner-inner line for depth
        page.drawRectangle({
            x: innerMargin + 6, y: innerMargin + 6,
            width: width - (innerMargin + 6) * 2, height: height - (innerMargin + 6) * 2,
            borderColor: gold, borderWidth: 0.5,
        })

        // --- EMBED LOGO ---
        let logoImage;
        try {
            // Force fetch from live domain to avoid Vercel edge/local filesystem bugs with public folder
            const logoResponse = await fetch('https://www.simonsilvercaldaie.it/logo.png')
            if (logoResponse.ok) {
                const logoArrayBuffer = await logoResponse.arrayBuffer()
                logoImage = await pdfDoc.embedPng(logoArrayBuffer)
            }
        } catch (err) {
            console.error("Failed to embed logo from URL", err)
        }

        const logoY = height - 120
        if (logoImage) {
            const logoDims = logoImage.scale(0.40)
            page.drawImage(logoImage, {
                x: width / 2 - logoDims.width / 2,
                y: logoY - logoDims.height / 2,
                width: logoDims.width,
                height: logoDims.height,
            })
        } else {
            const brandText = 'SIMON SILVER CALDAIE'
            const brandWidth = helveticaBold.widthOfTextAtSize(brandText, 24)
            page.drawText(brandText, {
                x: (width - brandWidth) / 2, y: logoY, size: 24, font: helveticaBold, color: navy
            })
        }

        // --- CERTIFICATE TITLE ---
        const titleY = logoY - 110
        const titleText = 'CERTIFICATO DI COMPLETAMENTO'
        const titleWidth = timesBold.widthOfTextAtSize(titleText, 28)
        page.drawText(titleText, {
            x: (width - titleWidth) / 2, y: titleY, size: 28, font: timesBold, color: navy
        })

        // Subtle underline centered
        page.drawLine({
            start: { x: width / 2 - 160, y: titleY - 15 },
            end: { x: width / 2 + 160, y: titleY - 15 },
            thickness: 1.5, color: gold, opacity: 0.9
        })

        // --- "Si certifica che" ---
        const certifyY = titleY - 60
        const certifyText = 'Si certifica che'
        const certifyWidth = timesItalic.widthOfTextAtSize(certifyText, 20)
        page.drawText(certifyText, {
            x: (width - certifyWidth) / 2, y: certifyY, size: 20, font: timesItalic, color: gray
        })

        // --- EMPLOYEE NAME ---
        const nameY = certifyY - 70
        const nameText = member.display_name || 'Nome Cognome'
        const nameWidth = timesBold.widthOfTextAtSize(nameText, 42)
        page.drawText(nameText, {
            x: (width - nameWidth) / 2, y: nameY, size: 42, font: timesBold, color: navy
        })

        // Decorative ornament underneath name
        page.drawCircle({ x: width / 2 - 12, y: nameY - 25, size: 2, color: orange })
        page.drawCircle({ x: width / 2, y: nameY - 25, size: 4, color: orange })
        page.drawCircle({ x: width / 2 + 12, y: nameY - 25, size: 2, color: orange })

        // --- "dipendente di" ---
        const dipendenteY = nameY - 60
        const ofText = 'dipendente di'
        const ofWidth = timesItalic.widthOfTextAtSize(ofText, 16)
        page.drawText(ofText, {
            x: (width - ofWidth) / 2, y: dipendenteY, size: 16, font: timesItalic, color: gray
        })

        // --- COMPANY NAME (Word Wrapped) ---
        const maxCompanyWidth = width - 140
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

        let companyYPos = dipendenteY - 45
        for (const line of companyLines) {
            const lineWidth = timesBold.widthOfTextAtSize(line, 26)
            page.drawText(line, {
                x: (width - lineWidth) / 2, y: companyYPos, size: 26, font: timesBold, color: navy
            })
            companyYPos -= 32
        }

        // --- DIVIDER ---
        const dividerY = companyYPos - 10
        page.drawLine({
            start: { x: 140, y: dividerY },
            end: { x: width - 140, y: dividerY },
            thickness: 1, color: lightGray
        })

        // --- COURSE DETAILS ---
        const descY = dividerY - 45
        const line1 = 'ha completato con successo l\'intero percorso di formazione professionale:'
        const line1Width = timesRoman.widthOfTextAtSize(line1, 16)
        page.drawText(line1, {
            x: (width - line1Width) / 2, y: descY, size: 16, font: timesRoman, color: navy
        })

        const descCourseY = descY - 35
        const courseName = 'CORSO TECNICO DIAGNOSTICA CALDAIE'
        const courseWidth = timesBold.widthOfTextAtSize(courseName, 20)
        page.drawText(courseName, {
            x: (width - courseWidth) / 2, y: descCourseY, size: 20, font: timesBold, color: navy
        })

        const descResY = descCourseY - 30
        const durationText = 'Esito Positivo • 27 Moduli Completati'
        const durWidth = helveticaBold.widthOfTextAtSize(durationText, 14)
        page.drawText(durationText, {
            x: (width - durWidth) / 2, y: descResY, size: 14, font: helveticaBold, color: gold
        })

        // --- BOTTOM SECTION (Date & Signature) ---
        const bottomY = 100
        const today = new Date()
        const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
            'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
        const dateStr = `Data di conseguimento: ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`
        
        // Date Block (Left)
        page.drawText(dateStr, {
            x: 80, y: bottomY + 15, size: 12, font: timesRoman, color: gray
        })

        // Signature cursive fetching
        let signatureFont = timesItalic
        try {
            const fontUrl = 'https://github.com/google/fonts/raw/main/ofl/greatvibes/GreatVibes-Regular.ttf'
            const fontRes = await fetch(fontUrl)
            if (fontRes.ok) {
                const fontBuffer = await fontRes.arrayBuffer()
                signatureFont = await pdfDoc.embedFont(fontBuffer)
            }
        } catch (e) {
            console.log("Could not load cursive font, falling back to TimesItalic")
        }

        // Signature Block (Right)
        const sigLine = '_________________________'
        page.drawText(sigLine, {
            x: width - 260, y: bottomY + 35, size: 12, font: helvetica, color: lightGray
        })

        const sigName = 'Simon Silver'
        const sigNameWidth = signatureFont.widthOfTextAtSize(sigName, 32)
        page.drawText(sigName, {
            x: width - 135 - sigNameWidth / 2, y: bottomY + 5, size: 32, font: signatureFont, color: navy
        })

        const sigRole = 'Docente e Fondatore'
        const sigRoleWidth = timesRoman.widthOfTextAtSize(sigRole, 11)
        page.drawText(sigRole, {
            x: width - 135 - sigRoleWidth / 2, y: bottomY - 15, size: 11, font: timesRoman, color: gray
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
