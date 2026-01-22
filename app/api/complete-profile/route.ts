import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function POST(request: NextRequest) {
    try {
        // 1. Auth
        const authHeader = request.headers.get('authorization') || ''
        const token = authHeader.replace(/^Bearer\s+/i, '').trim()
        if (!token) {
            return NextResponse.json({ error: 'Token mancante' }, { status: 401 })
        }

        const supabaseAdmin = getSupabaseAdmin()
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
        }

        // 2. Parse body
        const body = await request.json()
        const {
            customer_type,
            first_name,
            last_name,
            company_name,
            vat_number,
            sdi_code,
            fiscal_code,
            address,
            city,
            postal_code
        } = body

        // 3. Validazioni
        if (!first_name?.trim() || !last_name?.trim()) {
            return NextResponse.json({ error: 'Nome e cognome obbligatori' }, { status: 400 })
        }

        if (!address?.trim() || !city?.trim() || !postal_code?.trim()) {
            return NextResponse.json({ error: 'Indirizzo completo obbligatorio' }, { status: 400 })
        }

        if (!['private', 'company'].includes(customer_type)) {
            return NextResponse.json({ error: 'Tipo cliente non valido' }, { status: 400 })
        }

        if (customer_type === 'company') {
            if (!vat_number?.trim()) {
                return NextResponse.json({ error: 'Partita IVA obbligatoria per aziende' }, { status: 400 })
            }
            if (!company_name?.trim()) {
                return NextResponse.json({ error: 'Ragione sociale obbligatoria per aziende' }, { status: 400 })
            }
        }

        // 4. Upsert billing profile
        const billingData = {
            user_id: user.id,
            customer_type,
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            company_name: customer_type === 'company' ? company_name?.trim() || null : null,
            vat_number: customer_type === 'company' ? vat_number?.trim() || null : null,
            sdi_code: customer_type === 'company' ? sdi_code?.trim() || null : null,
            fiscal_code: customer_type === 'private' ? fiscal_code?.trim() || null : null,
            address: address.trim(),
            city: city.trim(),
            postal_code: postal_code.trim(),
            updated_at: new Date().toISOString()
        }

        const { error: billingError } = await supabaseAdmin
            .from('billing_profiles')
            .upsert(billingData, { onConflict: 'user_id' })

        if (billingError) {
            console.error('[complete-profile] Billing insert error:', billingError)
            return NextResponse.json({ error: 'Errore salvataggio dati fiscali' }, { status: 500 })
        }

        // 5. Mark profile as completed
        const fullName = `${first_name.trim()} ${last_name.trim()}`
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                full_name: fullName,
                profile_completed: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

        if (profileError) {
            console.error('[complete-profile] Profile update error:', profileError)
            return NextResponse.json({ error: 'Errore aggiornamento profilo' }, { status: 500 })
        }

        // 6. Update user metadata (for consistency)
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: {
                ...user.user_metadata,
                full_name: fullName,
                profile_completed: true
            }
        })

        console.log(`[complete-profile] Profile completed for user: ${user.email}`)

        return NextResponse.json({ ok: true })

    } catch (e) {
        console.error('[complete-profile] Unexpected error:', e)
        return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
    }
}
