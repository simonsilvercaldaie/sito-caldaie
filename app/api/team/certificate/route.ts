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
        let yPos = height - 160
        let logoImage;
        try {
            const logoUrl = new URL('/logo.png', request.url).href;
            const logoResponse = await fetch(logoUrl);
            if (logoResponse.ok) {
                const logoArrayBuffer = await logoResponse.arrayBuffer();
                logoImage = await pdfDoc.embedPng(logoArrayBuffer);
            }
        } catch (err) {
            console.error("Failed to embed logo from URL", err);
        }

        if (logoImage) {
            const logoDims = logoImage.scale(0.35) // Adjust scale as needed
            page.drawImage(logoImage, {
                x: width / 2 - logoDims.width / 2,
                y: yPos,
                width: logoDims.width,
                height: logoDims.height,
            })
            yPos -= 20
        } else {
            // Fallback Text if logo.png fails
            const brandText = 'SIMON SILVER CALDAIE'
            const brandWidth = helveticaBold.widthOfTextAtSize(brandText, 22)
            page.drawText(brandText, {
                x: (width - brandWidth) / 2, y: yPos + 60,
                size: 22, font: helveticaBold, color: navy
            })
        }

        // --- CERTIFICATE TITLE ---
        yPos -= 80
        const titleText = 'CERTIFICATO DI COMPLETAMENTO'
        const titleWidth = timesBold.widthOfTextAtSize(titleText, 26)
        page.drawText(titleText, {
            x: (width - titleWidth) / 2, y: yPos,
            size: 26, font: timesBold, color: navy
        })

        // Subtle underline
        page.drawLine({
            start: { x: width / 2 - 140, y: yPos - 12 },
            end: { x: width / 2 + 140, y: yPos - 12 },
            thickness: 1.5, color: gold, opacity: 0.8
        })

        // --- "Si certifica che" ---
        yPos -= 50
        const certifyText = 'Si certifica che'
        const certifyWidth = timesItalic.widthOfTextAtSize(certifyText, 18)
        page.drawText(certifyText, {
            x: (width - certifyWidth) / 2, y: yPos,
            size: 18, font: timesItalic, color: gray
        })

        // --- EMPLOYEE NAME ---
        yPos -= 65
        const nameText = member.display_name
        const nameWidth = timesBold.widthOfTextAtSize(nameText, 38)
        page.drawText(nameText, {
            x: (width - nameWidth) / 2, y: yPos,
            size: 38, font: timesBold, color: navy
        })

        // Decorative dot underneath name
        page.drawCircle({
            x: width / 2, y: yPos - 20, size: 3, color: orange
        })

        // --- "dipendente di" ---
        yPos -= 55
        const ofText = 'dipendente di'
        const ofWidth = timesItalic.widthOfTextAtSize(ofText, 14)
        page.drawText(ofText, {
            x: (width - ofWidth) / 2, y: yPos,
            size: 14, font: timesItalic, color: gray
        })

        // --- COMPANY NAME (Word Wrapped) ---
        yPos -= 35
        const maxCompanyWidth = width - 160
        const words = finalCompanyName.split(' ')
        let currentLine = words[0] || ''
        const companyLines = []

        for (let i = 1; i < words.length; i++) {
            const word = words[i]
            const cw = timesBold.widthOfTextAtSize(currentLine + ' ' + word, 24)
            if (cw < maxCompanyWidth) {
                currentLine += ' ' + word
            } else {
                companyLines.push(currentLine)
                currentLine = word
            }
        }
        if (currentLine) companyLines.push(currentLine)

        for (const line of companyLines) {
            const lineWidth = timesBold.widthOfTextAtSize(line, 24)
            page.drawText(line, {
                x: (width - lineWidth) / 2, y: yPos,
                size: 24, font: timesBold, color: navy
            })
            yPos -= 30
        }
        // yPos is now at the line underneath the company name
        yPos -= 20

        // --- DIVIDER ---
        yPos -= 50
        page.drawLine({
            start: { x: 120, y: yPos },
            end: { x: width - 120, y: yPos },
            thickness: 1, color: lightGray
        })

        // --- COURSE DETAILS ---
        yPos -= 40
        const line1 = 'ha completato con successo l\'intero percorso di formazione professionale:'
        const line1Width = timesRoman.widthOfTextAtSize(line1, 14)
        page.drawText(line1, {
            x: (width - line1Width) / 2, y: yPos,
            size: 14, font: timesRoman, color: navy
        })

        yPos -= 35
        const courseName = 'CORSO TECNICO DIAGNOSTICA CALDAIE'
        const courseWidth = timesBold.widthOfTextAtSize(courseName, 18)
        page.drawText(courseName, {
            x: (width - courseWidth) / 2, y: yPos,
            size: 18, font: timesBold, color: navy
        })

        yPos -= 30
        const durationText = 'Esito Positivo • 27 Moduli Completati'
        const durWidth = helveticaBold.widthOfTextAtSize(durationText, 12)
        page.drawText(durationText, {
            x: (width - durWidth) / 2, y: yPos,
            size: 12, font: helveticaBold, color: gold
        })

        // --- BOTTOM SECTION (Date & Signature) ---
        const bottomY = 120
        const today = new Date()
        const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
            'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
        const dateStr = `Data: ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`
        
        // Date Block (Left)
        page.drawText(dateStr, {
            x: 90, y: bottomY + 20, size: 12, font: timesRoman, color: navy
        })

        // Signature Block (Right)
        const sigLine = '_________________________'
        page.drawText(sigLine, {
            x: width - 240, y: bottomY + 25, size: 12, font: helvetica, color: gray
        })

        const sigName = 'Simon Silver'
        const sigNameWidth = timesBold.widthOfTextAtSize(sigName, 18)
        page.drawText(sigName, {
            x: width - 180 - sigNameWidth / 2, y: bottomY, size: 18, font: timesBold, color: navy
        })

        const sigRole = 'Docente e Fondatore'
        const sigRoleWidth = timesItalic.widthOfTextAtSize(sigRole, 12)
        page.drawText(sigRole, {
            x: width - 180 - sigRoleWidth / 2, y: bottomY - 15, size: 12, font: timesItalic, color: gray
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
