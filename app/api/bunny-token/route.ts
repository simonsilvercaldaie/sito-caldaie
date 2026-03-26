import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const videoId = searchParams.get('videoId')

        if (!videoId) {
            return NextResponse.json({ error: 'Video ID mancante' }, { status: 400 })
        }

        // 1. Auth check
        const authHeader = request.headers.get('authorization') || ''
        const token = authHeader.replace(/^Bearer\s+/i, '').trim()
        
        if (!token) {
            return NextResponse.json({ error: 'Token non fornito' }, { status: 401 })
        }

        const supabaseAdmin = getSupabaseAdmin()
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'Utente non autorizzato' }, { status: 401 })
        }

        // 2. Load Bunny Stream configuration
        const securityKey = process.env.BUNNY_STREAM_TOKEN_KEY
        // Using the Library ID provided by the user
        const libraryId = process.env.BUNNY_LIBRARY_ID || '625781'

        if (!securityKey) {
            console.error('[bunny-token] ERRORE: BUNNY_STREAM_TOKEN_KEY non impostata nel server.')
            return NextResponse.json({ error: 'Configurazione server mancante' }, { status: 500 })
        }

        // 3. Generate Token Authentication
        // Expire in 6 hours
        const expires = Math.floor(Date.now() / 1000) + (6 * 60 * 60)
        
        // Formula: sha256(securityKey + videoId + expires)
        const hashString = `${securityKey}${videoId}${expires}`
        const hash = crypto.createHash('sha256').update(hashString).digest('hex')

        const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${hash}&expires=${expires}&autoplay=false&preload=true`

        return NextResponse.json({ embedUrl, expires })

    } catch (e) {
        console.error('[bunny-token] Unexpected error:', e)
        return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
    }
}
