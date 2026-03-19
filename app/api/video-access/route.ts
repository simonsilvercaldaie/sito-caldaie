import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { checkCourseAccess } from '@/lib/accessControl'
import { courses } from '@/lib/coursesData'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

/**
 * POST /api/video-access
 * 
 * Verifies if the authenticated user has access to a specific course.
 * If authorized, returns the video URL (currently Supabase signed URL, future: Bunny).
 * 
 * Body: { courseId: string }
 * Auth: Bearer token
 * 
 * Returns:
 *   200 { authorized: true, videoUrl, courseTitle }
 *   403 { authorized: false, requiredLevel, courseTitle }
 *   401 { error: 'unauthorized' }
 *   404 { error: 'course_not_found' }
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Auth
        const authHeader = request.headers.get('authorization') || ''
        const token = authHeader.replace(/^Bearer\s+/i, '').trim()
        if (!token) {
            return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
        }

        const supabase = getSupabaseAdmin()
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (authError || !user) {
            return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
        }

        // 2. Parse body
        const body = await request.json()
        const { courseId } = body

        if (!courseId || typeof courseId !== 'string') {
            return NextResponse.json({ error: 'missing_course_id' }, { status: 400 })
        }

        // 3. Check access using centralized logic
        const access = await checkCourseAccess(user.id, courseId)

        if (access.courseNotFound) {
            return NextResponse.json({ error: 'course_not_found' }, { status: 404 })
        }

        if (!access.authorized) {
            return NextResponse.json({
                authorized: false,
                requiredLevel: access.requiredLevel,
                courseTitle: access.courseTitle
            }, { status: 403 })
        }

        // 4. Generate video URL
        // Currently: Supabase Storage signed URL
        // Future: Bunny.net signed URL
        const course = courses.find(c => c.id === courseId)
        const videoFilename = `${courseId}.mp4` // Convention: video filename = courseId.mp4

        const { data: fileData, error: fileError } = await supabase
            .storage
            .from('videos')
            .createSignedUrl(videoFilename, 21600) // 6 hours

        let videoUrl = ''
        if (fileError) {
            console.warn(`[video-access] Video file not found: ${videoFilename}`, fileError.message)
            // Fallback to placeholder for development
            videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        } else {
            videoUrl = fileData.signedUrl
        }

        return NextResponse.json({
            authorized: true,
            videoUrl,
            courseTitle: access.courseTitle,
            courseLevel: access.requiredLevel
        })

    } catch (e: any) {
        console.error('[video-access] Error:', e)
        return NextResponse.json({ error: 'internal_error' }, { status: 500 })
    }
}
