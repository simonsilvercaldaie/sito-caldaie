-- Add invite tracking columns to team_licenses
-- max_invites_total: maximum total invites that can be accepted (seats * 2)
-- invites_used: how many invites have been accepted so far

ALTER TABLE team_licenses 
ADD COLUMN IF NOT EXISTS max_invites_total INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS invites_used INTEGER DEFAULT 0;

-- Set max_invites_total = seats * 2 for existing licenses
UPDATE team_licenses SET max_invites_total = seats * 2 WHERE max_invites_total IS NULL OR max_invites_total = 10;

-- Set invites_used to current active member count for existing licenses
UPDATE team_licenses tl 
SET invites_used = (
    SELECT COUNT(*) FROM team_members tm 
    WHERE tm.team_license_id = tl.id
);
