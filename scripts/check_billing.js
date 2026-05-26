require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
    // Find user by email
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 10000 })
    const user = users.find(u => u.email === 'kumy981@gmail.com')
    
    if (!user) {
        console.log('Utente NON trovato con email kumy981@gmail.com')
        return
    }

    console.log('=== DATI UTENTE ===')
    console.log('ID:', user.id)
    console.log('Email:', user.email)
    console.log('Provider:', user.app_metadata?.provider)
    console.log('Registrato:', user.created_at)
    console.log('Ultimo login:', user.last_sign_in_at)

    // Get billing profile
    const { data: billing } = await supabase
        .from('billing_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

    console.log('\n=== DATI FATTURAZIONE (billing_profiles) ===')
    if (billing) {
        console.log(JSON.stringify(billing, null, 2))
    } else {
        console.log('NESSUN billing profile trovato!')
    }

    // Get purchases
    const { data: purchases } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)

    console.log('\n=== ACQUISTI ===')
    if (purchases && purchases.length > 0) {
        for (const p of purchases) {
            console.log(`- ${p.product_code} | €${(p.amount_cents/100).toFixed(2)} | ${p.created_at} | PayPal: ${p.paypal_capture_id}`)
        }
    } else {
        console.log('Nessun acquisto')
    }

    // Get profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

    console.log('\n=== PROFILO ===')
    if (profile) {
        console.log('Nome:', profile.full_name)
        console.log('Profilo completo:', profile.profile_completed)
    }
}

main().catch(console.error)
