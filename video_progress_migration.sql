-- ============================================================
-- VIDEO WATCH PROGRESS - Migration
-- Sistema di tracking progressi video per utenti
-- ============================================================

-- 1. Tabella principale progressi video
CREATE TABLE IF NOT EXISTS video_watch_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    watch_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    last_watched_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Un solo record per utente + corso
CREATE UNIQUE INDEX IF NOT EXISTS idx_watch_progress_user_course 
    ON video_watch_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_watch_progress_user 
    ON video_watch_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_progress_completed 
    ON video_watch_progress(completed) WHERE completed = true;

-- 2. RLS
ALTER TABLE video_watch_progress ENABLE ROW LEVEL SECURITY;

-- Gli utenti possono vedere solo i propri progressi
CREATE POLICY "Users can view own progress" 
    ON video_watch_progress FOR SELECT 
    USING (auth.uid() = user_id);

-- Solo il server (service_role) può inserire/aggiornare
-- (non creiamo policy INSERT/UPDATE per utenti normali —
--  tutto passa dall'API server-side)

-- 3. Aggiungere display_name ai team_members
ALTER TABLE team_members 
    ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 4. Funzione UPSERT per aggiornare i progressi (atomica)
CREATE OR REPLACE FUNCTION upsert_video_progress(
    p_user_id UUID,
    p_course_id TEXT,
    p_seconds INTEGER,
    p_video_duration INTEGER DEFAULT 1320  -- default 22 min = 1320s
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_total_seconds INTEGER;
    v_completed BOOLEAN;
    v_threshold INTEGER;
BEGIN
    -- Soglia completamento: 90% della durata
    v_threshold := (p_video_duration * 90) / 100;
    
    INSERT INTO video_watch_progress (user_id, course_id, watch_seconds, last_watched_at)
    VALUES (p_user_id, p_course_id, p_seconds, now())
    ON CONFLICT (user_id, course_id) DO UPDATE SET
        watch_seconds = video_watch_progress.watch_seconds + p_seconds,
        last_watched_at = now()
    RETURNING watch_seconds, completed INTO v_total_seconds, v_completed;
    
    -- Se non era ancora completato ma ora ha superato la soglia
    IF NOT v_completed AND v_total_seconds >= v_threshold THEN
        UPDATE video_watch_progress 
        SET completed = TRUE, completed_at = now()
        WHERE user_id = p_user_id AND course_id = p_course_id;
        v_completed := TRUE;
    END IF;
    
    RETURN jsonb_build_object(
        'total_seconds', v_total_seconds,
        'completed', v_completed,
        'threshold', v_threshold
    );
END;
$$;
