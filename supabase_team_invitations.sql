-- TEAM INVITATIONS MIGRATION (STRICT SECURITY)
-- Esegui nel Supabase SQL Editor

-- 1. Create Table
CREATE TABLE IF NOT EXISTS team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_license_id UUID NOT NULL REFERENCES team_licenses(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
    accepted_at TIMESTAMPTZ,
    accepted_user_id UUID REFERENCES auth.users(id)
);

-- 2. Security Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_invitations_token_hash 
    ON team_invitations(token_hash);

-- Prevent duplicate pending invites for same email in same team
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_invitations_pending_email
    ON team_invitations(team_license_id, email)
    WHERE status = 'pending';

-- 3. RLS (Strict: Owner Only, No Public Access)
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can view/manage invitations for their teams
CREATE POLICY "Owners can view invitations" ON team_invitations
    FOR ALL
    USING (
        team_license_id IN (
            SELECT id FROM team_licenses WHERE owner_user_id = auth.uid()
        )
    );

-- 4. Helper for validation (Lower casing email)
-- (Application layer should handle this, but trigger ensures consistency if needed. 
-- For now, relying on API/App to trim/lower).

-- 5. Transactional Acceptance Function (Critical for Seat Atomicity)
CREATE OR REPLACE FUNCTION accept_team_invitation(
    p_token_hash TEXT,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invite RECORD;
    v_license_id UUID;
    v_seats INT;
    v_count INT;
    v_owner_id UUID;
BEGIN
    -- 1. Find & Lock Invitation
    SELECT * INTO v_invite
    FROM team_invitations
    WHERE token_hash = p_token_hash
    FOR UPDATE; -- Lock invitation row

    IF v_invite IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'invitation_not_found');
    END IF;

    IF v_invite.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'invitation_not_pending');
    END IF;

    IF v_invite.expires_at < now() THEN
        RETURN jsonb_build_object('success', false, 'error', 'invitation_expired');
    END IF;

    v_license_id := v_invite.team_license_id;

    -- 2. Check if user is already in THIS team
    IF EXISTS (SELECT 1 FROM team_members WHERE team_license_id = v_license_id AND user_id = p_user_id AND removed_at IS NULL) THEN
         RETURN jsonb_build_object('success', false, 'error', 'already_member');
    END IF;

    -- 3. Lock License & Check Seats (Atomicity)
    SELECT seats, owner_user_id INTO v_seats, v_owner_id
    FROM team_licenses
    WHERE id = v_license_id
    FOR UPDATE; -- Critical: Prevent race conditions

    -- 4. Count Active Members
    SELECT COUNT(*) INTO v_count
    FROM team_members
    WHERE team_license_id = v_license_id AND removed_at IS NULL;

    IF v_count >= v_seats THEN
        RETURN jsonb_build_object('success', false, 'error', 'seats_full');
    END IF;

    -- 5. Execute Acceptance
    -- Add Member
    INSERT INTO team_members(team_license_id, user_id)
    VALUES (v_license_id, p_user_id);

    -- Update Invitation
    UPDATE team_invitations
    SET status = 'accepted',
        accepted_at = now(),
        accepted_user_id = p_user_id
    WHERE id = v_invite.id;

    RETURN jsonb_build_object('success', true, 'team_license_id', v_license_id);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
