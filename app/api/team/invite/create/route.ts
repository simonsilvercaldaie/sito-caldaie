import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendEmail } from '@/lib/email'

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
        if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 })

        const supabase = getSupabaseAdmin()
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { teamLicenseId, email } = body

        if (!teamLicenseId || !email) {
            return NextResponse.json({ error: 'Missing teamLicenseId or email' }, { status: 400 })
        }

        // 1. Verify Ownership & Seat "Soft" Check
        const { data: license, error: licErr } = await supabase
            .from('team_licenses')
            .select('seats, owner_user_id')
            .eq('id', teamLicenseId)
            .single()

        if (licErr || !license) return NextResponse.json({ error: 'License not found' }, { status: 404 })
        if (license.owner_user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        // Check active members
        const { count: memberCount } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('team_license_id', teamLicenseId)
            .is('removed_at', null)

        if ((memberCount || 0) >= license.seats) {
            return NextResponse.json({ error: 'Tutti i posti sono occupati' }, { status: 400 })
        }

        // 2. Generate Token
        const rawToken = crypto.randomBytes(32).toString('hex')
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

        // 3. Insert Invite
        const { error: insErr } = await supabase
            .from('team_invitations')
            .insert({
                team_license_id: teamLicenseId,
                email: email.toLowerCase().trim(),
                token_hash: tokenHash,
                status: 'pending'
            })

        if (insErr) {
            if (insErr.code === '23505') {
                return NextResponse.json({ error: 'Invito già pendente per questa email' }, { status: 409 })
            }
            throw insErr
        }

        // 4. Build invite URL
        const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://simonsilvercaldaie.it'}/azienda/accetta-invito?token=${rawToken}`

        // 5. Send invite email
        const emailSent = await sendEmail('INVITO_TEAM', {
            to_email: email.toLowerCase().trim(),
            inviteUrl,
            ownerName: user.email || 'il tuo responsabile'
        })

        return NextResponse.json({
            success: true,
            message: emailSent ? 'Invito inviato via email' : 'Invito creato (email non inviata, usa il link)',
            emailSent,
            debugUrl: inviteUrl
        })

    } catch (e: any) {
        console.error('Invite Error', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
