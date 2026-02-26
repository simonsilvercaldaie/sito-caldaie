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
            .select('id, seats, owner_user_id, free_reassignments_total, free_reassignments_used')
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

        // 6. Check if free reassignments are available
        const freeTotal = license.free_reassignments_total || license.seats
        const freeUsed = license.free_reassignments_used || 0
        const freeRemaining = freeTotal - freeUsed

        if (freeRemaining <= 0) {
            return NextResponse.json({
                success: false,
                error: 'Hai esaurito i riassegnamenti gratuiti. Contatta simonsilvercaldaie@gmail.com per acquistare nuovi riassegnamenti (€400 cad.)',
                needsPayment: true,
                cost: 400,
                freeTotal,
                freeUsed
            }, { status: 402 }) // 402 Payment Required
        }

        // 7. Soft-delete member
        const { error: removeError } = await supabase
            .from('team_members')
            .update({ removed_at: new Date().toISOString() })
            .eq('id', memberId)

        if (removeError) {
            console.error('[remove-member] Remove error:', removeError)
            return NextResponse.json({ success: false, error: 'Errore nella rimozione' }, { status: 500 })
        }

        // 8. Increment reassignment counter
        const { error: counterError } = await supabase
            .from('team_licenses')
            .update({ free_reassignments_used: freeUsed + 1 })
            .eq('id', teamLicenseId)

        if (counterError) {
            console.error('[remove-member] Counter update error:', counterError)
            // Don't fail the removal, just log
        }

        // 9. Get user email for logging
        const { data: removedUser } = await supabase.auth.admin.getUserById(member.user_id)

        console.log(`[remove-member] User ${removedUser?.user?.email || member.user_id} removed from team ${teamLicenseId} by ${user.email}. Reassignments: ${freeUsed + 1}/${freeTotal}`)

        return NextResponse.json({
            success: true,
            freeRemaining: freeRemaining - 1,
            freeTotal,
            freeUsed: freeUsed + 1
        })

    } catch (e) {
        console.error('[remove-member] Unexpected error:', e)
        return NextResponse.json({ success: false, error: 'Errore interno' }, { status: 500 })
    }
}
