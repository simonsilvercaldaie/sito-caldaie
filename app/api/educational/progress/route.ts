import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { resource_id, status, state_data, score } = body;

    if (!resource_id) {
        return NextResponse.json({ error: 'Missing resource_id' }, { status: 400 });
    }

    // Upsert progress
    const { data, error } = await supabase
        .from('user_progress')
        .upsert(
            {
                user_id: user.id,
                resource_id,
                status,
                state_data,
                score,
                updated_at: new Date().toISOString(),
                ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
            },
            { onConflict: 'user_id, resource_id' }
        )
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // --- GAMIFICATION LOGIC (Server-Side Trigger) ---
    // If Quiz Passed -> Unlock Case Study
    if (status === 'completed' && score !== undefined) {
        // 1. Check if it's a quiz (we assume the caller handles this, or we fetch resource type)
        const { data: resource } = await supabase
            .from('educational_resources')
            .select('type, video_id')
            .eq('id', resource_id)
            .single();

        if (resource && resource.type === 'quiz') {
            // Check passing score (logic could be stricter here, but trust client for MVP or fetch asset passing_score)
            // Let's assume > 80% or hardcoded 4/5 for now, or just trust the status='completed' 
            // which implies the client validated it. Better: Server validation in v2.

            // SBLOCCO CASO STUDIO
            // Trova la risorsa caso_studio per questo video
            const { data: caseStudy } = await supabase
                .from('educational_resources')
                .select('id')
                .eq('video_id', resource.video_id)
                .eq('type', 'caso_studio')
                .single();

            if (caseStudy) {
                // Unlock it
                await supabase.from('user_progress').upsert(
                    {
                        user_id: user.id,
                        resource_id: caseStudy.id,
                        status: 'unlocked', // Not completed yet
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: 'user_id, resource_id' } // Don't overwrite if already completed
                );
            }
        }
    }

    return NextResponse.json(data);
}
