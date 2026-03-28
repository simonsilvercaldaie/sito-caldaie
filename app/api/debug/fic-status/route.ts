import { NextResponse } from 'next/server'

/**
 * Diagnostic endpoint to check FIC configuration on production.
 * GET /api/debug/fic-status
 * 
 * Returns the current FIC config status (no secrets exposed).
 */
export async function GET() {
    const config = {
        FIC_ENABLED: process.env.FIC_ENABLED,
        FIC_COMPANY_ID_SET: !!process.env.FIC_COMPANY_ID,
        FIC_ACCESS_TOKEN_SET: !!process.env.FIC_ACCESS_TOKEN,
        FIC_ACCESS_TOKEN_LENGTH: process.env.FIC_ACCESS_TOKEN?.length || 0,
        FIC_VAT_RATE: process.env.FIC_VAT_RATE,
        FIC_VAT_ID: process.env.FIC_VAT_ID,
        FIC_SEND_COURTESY_EMAIL: process.env.FIC_SEND_COURTESY_EMAIL,
        SUPABASE_SERVICE_ROLE_KEY_SET: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        PAYPAL_CLIENT_SECRET_SET: !!process.env.PAYPAL_CLIENT_SECRET,
    }

    // Also test FIC API connectivity
    let ficApiStatus = 'not_tested'
    if (process.env.FIC_ENABLED === 'true' && process.env.FIC_ACCESS_TOKEN && process.env.FIC_COMPANY_ID) {
        try {
            const res = await fetch(`https://api-v2.fattureincloud.it/c/${process.env.FIC_COMPANY_ID}/info`, {
                headers: {
                    'Authorization': `Bearer ${process.env.FIC_ACCESS_TOKEN}`,
                    'Accept': 'application/json'
                }
            })
            if (res.ok) {
                ficApiStatus = 'connected_ok'
            } else {
                const body = await res.text()
                ficApiStatus = `error_${res.status}: ${body.substring(0, 200)}`
            }
        } catch (e: any) {
            ficApiStatus = `exception: ${e.message}`
        }
    }

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        config,
        ficApiStatus,
        nodeEnv: process.env.NODE_ENV,
    })
}
