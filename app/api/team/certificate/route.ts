import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

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
            .select('id, company_name')
            .eq('id', teamLicenseId)
            .eq('owner_user_id', user.id)
            .maybeSingle()

        if (!license) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

        // 2. Get member details
        const { data: member } = await supabase
            .from('team_members')
            .select('user_id, display_name')
            .eq('id', memberId)
            .eq('team_license_id', teamLicenseId)
            .is('removed_at', null)
            .maybeSingle()

        if (!member) return NextResponse.json({ error: 'Membro non trovato' }, { status: 404 })
        if (!member.display_name) return NextResponse.json({ error: 'Inserisci Nome e Cognome prima di generare il certificato' }, { status: 400 })

        // 3. Check completion
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

        // 4. Generate PDF
        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage([595.28, 841.89]) // A4
        const { width, height } = page.getSize()

        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
        const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
        const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)
        const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman)

        // Colors
        const navy = rgb(0.12, 0.15, 0.25)
        const orange = rgb(0.93, 0.45, 0.12)
        const gray = rgb(0.45, 0.48, 0.52)
        const lightGray = rgb(0.75, 0.78, 0.82)

        // --- BORDER FRAME ---
        const borderMargin = 30
        page.drawRectangle({
            x: borderMargin, y: borderMargin,
            width: width - borderMargin * 2, height: height - borderMargin * 2,
            borderColor: lightGray, borderWidth: 2,
        })
        // Inner border
        page.drawRectangle({
            x: borderMargin + 8, y: borderMargin + 8,
            width: width - (borderMargin + 8) * 2, height: height - (borderMargin + 8) * 2,
            borderColor: orange, borderWidth: 0.5, opacity: 0.4,
        })

        // --- LOGO AREA (text-based since we can't easily embed complex PNGs) ---
        let yPos = height - 100

        // Orange accent line
        page.drawLine({
            start: { x: width / 2 - 80, y: yPos + 15 },
            end: { x: width / 2 + 80, y: yPos + 15 },
            thickness: 3, color: orange, opacity: 0.6
        })

        // Brand name
        const brandText = 'SIMON SILVER CALDAIE'
        const brandWidth = helveticaBold.widthOfTextAtSize(brandText, 18)
        page.drawText(brandText, {
            x: (width - brandWidth) / 2, y: yPos - 10,
            size: 18, font: helveticaBold, color: navy
        })

        // --- CERTIFICATE TITLE ---
        yPos -= 70
        const titleText = 'CERTIFICATO DI COMPLETAMENTO'
        const titleWidth = timesBold.widthOfTextAtSize(titleText, 28)
        page.drawText(titleText, {
            x: (width - titleWidth) / 2, y: yPos,
            size: 28, font: timesBold, color: navy
        })

        // Orange underline
        page.drawLine({
            start: { x: width / 2 - 120, y: yPos - 10 },
            end: { x: width / 2 + 120, y: yPos - 10 },
            thickness: 2, color: orange, opacity: 0.8
        })

        // --- "Si certifica che" ---
        yPos -= 55
        const certifyText = 'Si certifica che'
        const certifyWidth = timesItalic.widthOfTextAtSize(certifyText, 16)
        page.drawText(certifyText, {
            x: (width - certifyWidth) / 2, y: yPos,
            size: 16, font: timesItalic, color: gray
        })

        // --- EMPLOYEE NAME ---
        yPos -= 50
        const nameText = member.display_name
        const nameWidth = timesBold.widthOfTextAtSize(nameText, 32)
        page.drawText(nameText, {
            x: (width - nameWidth) / 2, y: yPos,
            size: 32, font: timesBold, color: navy
        })

        // Name underline
        page.drawLine({
            start: { x: width / 2 - 150, y: yPos - 12 },
            end: { x: width / 2 + 150, y: yPos - 12 },
            thickness: 1, color: lightGray
        })

        // --- "dipendente di" ---
        yPos -= 45
        const ofText = 'dipendente di'
        const ofWidth = timesItalic.widthOfTextAtSize(ofText, 14)
        page.drawText(ofText, {
            x: (width - ofWidth) / 2, y: yPos,
            size: 14, font: timesItalic, color: gray
        })

        // --- COMPANY NAME ---
        yPos -= 35
        const companyName = license.company_name || 'Azienda'
        const companyWidth = timesBold.widthOfTextAtSize(companyName, 22)
        page.drawText(companyName, {
            x: (width - companyWidth) / 2, y: yPos,
            size: 22, font: timesBold, color: navy
        })

        // --- DIVIDER ---
        yPos -= 40
        page.drawLine({
            start: { x: 80, y: yPos },
            end: { x: width - 80, y: yPos },
            thickness: 1, color: lightGray
        })

        // --- COURSE DETAILS ---
        yPos -= 40
        const line1 = 'Ha completato con successo l\'intero corso di formazione professionale'
        const line1Width = timesRoman.widthOfTextAtSize(line1, 14)
        page.drawText(line1, {
            x: (width - line1Width) / 2, y: yPos,
            size: 14, font: timesRoman, color: navy
        })

        yPos -= 35
        const courseName = 'SIMON SILVER CALDAIE — Metodo UKT'
        const courseWidth = timesBold.widthOfTextAtSize(courseName, 20)
        page.drawText(courseName, {
            x: (width - courseWidth) / 2, y: yPos,
            size: 20, font: timesBold, color: navy
        })

        yPos -= 30
        const subTitle = 'Diagnostica Avanzata Caldaie'
        const subWidth = timesItalic.widthOfTextAtSize(subTitle, 16)
        page.drawText(subTitle, {
            x: (width - subWidth) / 2, y: yPos,
            size: 16, font: timesItalic, color: gray
        })

        yPos -= 35
        const durationText = 'Durata totale: 15 ore  •  27 moduli completati'
        const durWidth = helvetica.widthOfTextAtSize(durationText, 13)
        page.drawText(durationText, {
            x: (width - durWidth) / 2, y: yPos,
            size: 13, font: helvetica, color: gray
        })

        // --- BOTTOM SECTION ---
        // Date on the left
        const today = new Date()
        const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
            'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
        const dateStr = `Data di completamento: ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`

        page.drawText(dateStr, {
            x: 80, y: 160, size: 11, font: helvetica, color: gray
        })

        // Signature on the right
        const sigLine = '____________________________'
        page.drawText(sigLine, {
            x: width - 260, y: 170, size: 12, font: helvetica, color: lightGray
        })

        const sigName = 'Simon Silver'
        const sigNameWidth = timesBold.widthOfTextAtSize(sigName, 14)
        page.drawText(sigName, {
            x: width - 180 - sigNameWidth / 2, y: 150, size: 14, font: timesBold, color: navy
        })

        const sigRole = 'Docente e Fondatore'
        const sigRoleWidth = timesItalic.widthOfTextAtSize(sigRole, 11)
        page.drawText(sigRole, {
            x: width - 180 - sigRoleWidth / 2, y: 135, size: 11, font: timesItalic, color: gray
        })

        // --- FOOTER ---
        const footerText = 'www.simonsilvercaldaie.it'
        const footerWidth = helvetica.widthOfTextAtSize(footerText, 10)
        page.drawText(footerText, {
            x: (width - footerWidth) / 2, y: 50,
            size: 10, font: helvetica, color: lightGray
        })

        // --- Orange accent bottom line ---
        page.drawLine({
            start: { x: width / 2 - 60, y: 45 },
            end: { x: width / 2 + 60, y: 45 },
            thickness: 2, color: orange, opacity: 0.5
        })

        // 5. Return PDF
        const pdfBytes = await pdfDoc.save()

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Certificato_${member.display_name.replace(/\s+/g, '_')}.pdf"`,
            }
        })

    } catch (e: any) {
        console.error('[certificate] Error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
