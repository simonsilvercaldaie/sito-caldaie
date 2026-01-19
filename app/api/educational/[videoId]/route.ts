import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ videoId: string }> } // Params are async in Next.js 15+
) {
    const { videoId } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch Resources for this video (Attempt public/auth access)
    // Note: RLS must allow 'anon' or 'authenticated' to read these.
    const { data: resources, error: resError } = await supabase
        .from('educational_resources')
        .select('*')
        .eq('video_id', videoId)
        .eq('is_active', true);

    if (resError) {
        return NextResponse.json({ error: resError.message }, { status: 500 });
    }

    // 2. Fetch User Progress (Only if user exists)
    let progressMap: Record<string, any> = {};
    if (user && resources && resources.length > 0) {
        const resourceIds = resources.map((r) => r.id);
        const { data: progress, error: progError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .in('resource_id', resourceIds);

        if (!progError && progress) {
            progress.forEach((p) => {
                progressMap[p.resource_id] = p;
            });
        }
    }

    return NextResponse.json({
        resources: resources || [],
        progress: progressMap,
        isGuest: !user
    });
}
