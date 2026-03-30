import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

// Video durations in seconds (premium videos ~22 min each)
const VIDEO_DURATION_SECONDS = 1320 // 22 min default

export async function POST(request: NextRequest) {
    try {
        // 1. Auth check
        const authHeader = request.headers.get('authorization')
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const token = authHeader.replace('Bearer ', '')
        const supabaseAdmin = getSupabaseAdmin()

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Parse body
        const { courseId, secondsWatched } = await request.json()

        if (!courseId || typeof secondsWatched !== 'number' || secondsWatched <= 0) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }

        // Sanity check: max 60 seconds per ping (prevent abuse)
        const sanitizedSeconds = Math.min(secondsWatched, 60)

        // 3. Upsert progress using the DB function
        const { data, error } = await supabaseAdmin.rpc('upsert_video_progress', {
            p_user_id: user.id,
            p_course_id: courseId,
            p_seconds: sanitizedSeconds,
            p_video_duration: VIDEO_DURATION_SECONDS
        })

        if (error) {
            console.error('[video-progress] RPC error:', error)
            return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
        }

        return NextResponse.json(data || { success: true })

    } catch (e: any) {
        console.error('[video-progress] Error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

// GET: Fetch user's own progress (for dashboard)
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const token = authHeader.replace('Bearer ', '')
        const supabaseAdmin = getSupabaseAdmin()

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch all progress for this user
        const { data: progress, error } = await supabaseAdmin
            .from('video_watch_progress')
            .select('course_id, watch_seconds, completed, completed_at, last_watched_at')
            .eq('user_id', user.id)

        if (error) {
            console.error('[video-progress] Fetch error:', error)
            return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
        }

        return NextResponse.json({ progress: progress || [] })

    } catch (e: any) {
        console.error('[video-progress] Error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
