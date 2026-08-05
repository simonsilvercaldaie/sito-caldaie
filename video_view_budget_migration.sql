-- Creazione tabella per il budget di visualizzazione video
CREATE TABLE IF NOT EXISTS public.video_view_budget (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    consumed_seconds INTEGER DEFAULT 0,
    last_consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, course_id)
);

-- Indice per ricerca veloce tramite user_id
CREATE INDEX IF NOT EXISTS video_view_budget_user_id_idx ON public.video_view_budget(user_id);

-- Abilita RLS
ALTER TABLE public.video_view_budget ENABLE ROW LEVEL SECURITY;

-- Policy RLS: gli utenti possono vedere solo il proprio budget
CREATE POLICY "Users can view own video budget"
    ON public.video_view_budget
    FOR SELECT
    USING (auth.uid() = user_id);

-- Funzione per controllare il budget video
CREATE OR REPLACE FUNCTION public.check_video_budget(
    p_user_id UUID,
    p_course_id TEXT,
    p_max_budget INT DEFAULT 3960,
    p_regen_amount INT DEFAULT 1320,
    p_regen_days INT DEFAULT 30
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_record public.video_view_budget%ROWTYPE;
    v_months_idle INT;
    v_regenerated INT;
    v_effective_consumed INT;
    v_available INT;
    v_exhausted BOOLEAN;
    v_next_unlock_at TIMESTAMPTZ;
BEGIN
    -- Cerca il record per l'utente e il corso
    SELECT * INTO v_record
    FROM public.video_view_budget
    WHERE user_id = p_user_id AND course_id = p_course_id;

    -- Se non esiste, il budget è intatto
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'available_seconds', p_max_budget,
            'consumed_seconds', 0,
            'total_budget', p_max_budget,
            'exhausted', false,
            'next_unlock_at', null
        );
    END IF;

    -- Calcola la rigenerazione
    v_effective_consumed := v_record.consumed_seconds;
    
    IF v_record.last_consumed_at IS NOT NULL THEN
        -- Calcola i mesi (periodi) di inattività
        v_months_idle := floor(EXTRACT(EPOCH FROM (now() - v_record.last_consumed_at)) / (p_regen_days * 86400));
        
        IF v_months_idle > 0 THEN
            v_regenerated := LEAST(v_record.consumed_seconds, v_months_idle * p_regen_amount);
            v_effective_consumed := v_record.consumed_seconds - v_regenerated;
            
            -- Se c'è stata una rigenerazione, aggiorna il record
            IF v_effective_consumed > 0 THEN
                UPDATE public.video_view_budget
                SET consumed_seconds = v_effective_consumed
                WHERE user_id = p_user_id AND course_id = p_course_id;
            ELSE
                UPDATE public.video_view_budget
                SET consumed_seconds = 0, last_consumed_at = NULL
                WHERE user_id = p_user_id AND course_id = p_course_id;
                v_effective_consumed := 0;
            END IF;
            
            -- Ri-carica i dati per il resto dei calcoli
            SELECT * INTO v_record
            FROM public.video_view_budget
            WHERE user_id = p_user_id AND course_id = p_course_id;
        END IF;
    END IF;

    -- Calcola i secondi disponibili
    v_available := LEAST(p_max_budget, GREATEST(0, p_max_budget - v_effective_consumed));
    v_exhausted := v_available <= 0;
    
    -- Calcola il prossimo sblocco (quando il tempo consumato più vecchio si rigenera)
    IF v_record.last_consumed_at IS NOT NULL AND v_effective_consumed > 0 THEN
        v_next_unlock_at := v_record.last_consumed_at + (p_regen_days || ' days')::INTERVAL;
    ELSE
        v_next_unlock_at := NULL;
    END IF;

    RETURN jsonb_build_object(
        'available_seconds', v_available,
        'consumed_seconds', v_effective_consumed,
        'total_budget', p_max_budget,
        'exhausted', v_exhausted,
        'next_unlock_at', v_next_unlock_at
    );
END;
$$;

-- Funzione per consumare il budget video
CREATE OR REPLACE FUNCTION public.consume_video_budget(
    p_user_id UUID,
    p_course_id TEXT,
    p_seconds INT,
    p_max_budget INT DEFAULT 3960,
    p_regen_amount INT DEFAULT 1320,
    p_regen_days INT DEFAULT 30
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_status JSONB;
    v_available INT;
    v_consumed INT;
    v_to_consume INT;
BEGIN
    -- Ottieni lo stato attuale e applica la rigenerazione (se necessaria)
    v_status := public.check_video_budget(p_user_id, p_course_id, p_max_budget, p_regen_amount, p_regen_days);
    
    v_available := (v_status->>'available_seconds')::INT;
    
    -- Se non c'è più budget disponibile, ritorna esausto
    IF v_available <= 0 THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'consumed', 0,
            'remaining_seconds', 0,
            'total_budget', p_max_budget,
            'exhausted', true,
            'next_unlock_at', v_status->>'next_unlock_at'
        );
    END IF;

    -- Calcola quanto effettivamente si può consumare
    v_to_consume := LEAST(v_available, p_seconds);
    
    -- Aggiorna il record nel database
    -- Nota: check_video_budget ha già applicato la rigenerazione e aggiornato consumed_seconds
    -- quindi possiamo semplicemente sommare v_to_consume al valore corrente
    INSERT INTO public.video_view_budget (user_id, course_id, consumed_seconds, last_consumed_at)
    VALUES (p_user_id, p_course_id, v_to_consume, now())
    ON CONFLICT (user_id, course_id) DO UPDATE
    SET 
        consumed_seconds = video_view_budget.consumed_seconds + v_to_consume,
        last_consumed_at = now();

    -- Calcola il nuovo stato dopo il consumo
    v_available := v_available - v_to_consume;
    
    RETURN jsonb_build_object(
        'allowed', true,
        'consumed', v_to_consume,
        'remaining_seconds', v_available,
        'total_budget', p_max_budget,
        'exhausted', v_available <= 0,
        'next_unlock_at', now() + (p_regen_days || ' days')::INTERVAL
    );
END;
$$;
