import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

/**
 * POST /api/team/remove-member
 * Body: { teamLicenseId: string, memberId: string (team_members.id) }
 * 
 * Removes a team member (soft-delete) and tracks reassignment usage.
 * Returns whether the team has free reassignments remaining.
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Auth
        const authHeader = request.headers.get('authorization') || ''
        const token = authHeader.replace(/^Bearer\s+/i, '').trim()
        if (!token) {
            return NextResponse.json({ success: false, error: 'Token mancante' }, { status: 401 })
        }

        const supabase = getSupabaseAdmin()
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Token non valido' }, { status: 401 })
        }

        // 2. Parse body
        const body = await request.json()
        const { teamLicenseId, memberId } = body

        if (!teamLicenseId || !memberId) {
            return NextResponse.json({ success: false, error: 'Parametri mancanti' }, { status: 400 })
        }

        // 3. Verify ownership
        const { data: license, error: licError } = await supabase
            .from('team_licenses')
            .select('id, seats, owner_user_id')
            .eq('id', teamLicenseId)
            .single()

        if (licError || !license) {
            return NextResponse.json({ success: false, error: 'Licenza non trovata' }, { status: 404 })
        }

        if (license.owner_user_id !== user.id) {
            return NextResponse.json({ success: false, error: 'Non sei il proprietario di questa licenza' }, { status: 403 })
        }

        // 4. Check if member exists and is active
        const { data: member, error: memError } = await supabase
            .from('team_members')
            .select('id, user_id, removed_at')
            .eq('id', memberId)
            .eq('team_license_id', teamLicenseId)
            .single()

        if (memError || !member) {
            return NextResponse.json({ success: false, error: 'Membro non trovato' }, { status: 404 })
        }

        if (member.removed_at) {
            return NextResponse.json({ success: false, error: 'Membro già rimosso' }, { status: 400 })
        }

        // 5. Don't allow removing yourself (owner)
        if (member.user_id === user.id) {
            return NextResponse.json({ success: false, error: 'Non puoi rimuovere te stesso dal team' }, { status: 400 })
        }

        // 6. Soft-delete member (frees the seat)
        const { error: removeError } = await supabase
            .from('team_members')
            .update({ removed_at: new Date().toISOString() })
            .eq('id', memberId)

        if (removeError) {
            console.error('[remove-member] Remove error:', removeError)
            return NextResponse.json({ success: false, error: 'Errore nella rimozione' }, { status: 500 })
        }

        // 7. Log
        const { data: removedUser } = await supabase.auth.admin.getUserById(member.user_id)
        console.log(`[remove-member] User ${removedUser?.user?.email || member.user_id} removed from team ${teamLicenseId} by ${user.email}`)

        return NextResponse.json({ success: true })

    } catch (e) {
        console.error('[remove-member] Unexpected error:', e)
        return NextResponse.json({ success: false, error: 'Errore interno' }, { status: 500 })
    }
}
