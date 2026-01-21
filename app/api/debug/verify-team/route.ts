import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Use Service Role for Setup/Teardown
function getAdmin() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET(request: NextRequest) {
    const log = [] as string[]
    const writeLog = (msg: string) => {
        console.log(msg)
        log.push(msg)
    }

    try {
        writeLog('STARTING STRICT TEAM VERIFICATION')

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 })
        }

        const admin = getAdmin()

        const searchParams = request.nextUrl.searchParams
        if (searchParams.get('simulate') !== 'true') {
            return NextResponse.json({ error: 'Please add ?simulate=true' })
        }

        // 0. CHECK TABLES EXIST
        const { error: tableCheck } = await admin.from('team_licenses').select('id').limit(1)
        if (tableCheck && tableCheck.code === '42P01') { // undefined_table
            return NextResponse.json({
                success: false,
                error: 'TABELLE MANCANTI. Esegui la migrazione SQL.',
                details: 'team_licenses non trovata.'
            }, { status: 400 })
        }

        writeLog('Listing Users...')
        const { data: users, error: userErr } = await admin.auth.admin.listUsers()
        if (userErr) throw userErr

        if (!users || users.users.length < 2) {
            // Fallback if no users: Mock flow (insert explicit IDs? No, keys constraint)
            writeLog("Warning: Not enough users found. Skipping logic verification.")
            return NextResponse.json({ success: false, log, error: "Need 2 users" })
        }

        const owner = users.users[0]
        const invitee = users.users[1]

        writeLog(`Owner: ${owner.email}, Invitee: ${invitee.email}`)

        // 2. CREATE LICENSE
        writeLog('Creating License...')
        const { data: license, error: licErr } = await admin.from('team_licenses').insert({
            owner_user_id: owner.id,
            seats: 2
        }).select().single()

        if (licErr) throw licErr
        writeLog(`Created License ${license.id}`)

        // 3. ADD OWNER
        writeLog('Adding Owner...')
        const { error: memErr } = await admin.from('team_members').insert({ team_license_id: license.id, user_id: owner.id })
        if (memErr) throw memErr
        writeLog('Owner added')

        // 4. CREATE INVITE
        writeLog('Creating Invite...')
        const rawToken = crypto.randomBytes(32).toString('hex')
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

        const { error: invErr } = await admin.from('team_invitations').insert({
            team_license_id: license.id,
            email: invitee.email!,
            token_hash: tokenHash,
            status: 'pending'
        })
        if (invErr) throw invErr
        writeLog('Invite created')

        // 6. ACCEPT INVITE
        writeLog('Accepting Invite...')
        const { data: result, error: rpcErr } = await admin.rpc('accept_team_invitation', {
            p_token_hash: tokenHash,
            p_user_id: invitee.id
        })

        if (rpcErr) throw rpcErr
        if (!result.success) {
            throw new Error(`Acceptance logic failed: ${result.error}`)
        }
        writeLog('Invite Accepted')

        // 7. VERIFY SEATS
        writeLog('Verifying Seats...')
        const { count } = await admin.from('team_members').select('*', { count: 'exact', head: true }).eq('team_license_id', license.id).is('removed_at', null)
        writeLog(`Seats used: ${count}/2`)

        if (count !== 2) throw new Error('Seat count mismatch')

        // 8. TRY OVERFLOW
        writeLog('Testing Overflow...')
        const rawToken2 = crypto.randomBytes(32).toString('hex')
        const tokenHash2 = crypto.createHash('sha256').update(rawToken2).digest('hex')
        await admin.from('team_invitations').insert({
            team_license_id: license.id,
            email: 'overflow@test.com',
            token_hash: tokenHash2,
            status: 'pending'
        })

        const { data: resExisting } = await admin.rpc('accept_team_invitation', {
            p_token_hash: tokenHash2,
            p_user_id: owner.id
        })

        if (resExisting.success) throw new Error('Should fail for existing member')
        writeLog(`Overflow/Duplicate check OK: ${resExisting.error}`)

        // CLEANUP
        writeLog('Cleaning up...')
        await admin.from('team_licenses').delete().eq('id', license.id)
        writeLog('Done.')

        return NextResponse.json({ success: true, log })

    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ success: false, log, error: e.message }, { status: 500 })
    }
}
