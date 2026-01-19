import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ videoId: string }> } // Params are async in Next.js 15+
) {
    const { videoId } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch Resources for this video
    const { data: resources, error: resError } = await supabase
        .from('educational_resources')
        .select('*')
        .eq('video_id', videoId)
        .eq('is_active', true);

    if (resError) {
        return NextResponse.json({ error: resError.message }, { status: 500 });
    }

    // 2. Fetch User Progress for these resources
    const resourceIds = resources.map((r) => r.id);
    let progressMap: Record<string, any> = {};

    if (resourceIds.length > 0) {
        const { data: progress, error: progError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .in('resource_id', resourceIds);

        if (progError) {
            console.error('Progress fetch error:', progError);
            // We don't fail, just return empty progress
        } else {
            progress?.forEach((p) => {
                progressMap[p.resource_id] = p;
            });
        }
    }

    return NextResponse.json({
        resources,
        progress: progressMap,
    });
}
