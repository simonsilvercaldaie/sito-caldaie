-- ============================================================
-- SLOT REASSIGNMENT SYSTEM — Migration
-- Adds reassignment tracking to team_licenses
-- ============================================================

-- Add columns for tracking reassignments
ALTER TABLE team_licenses 
  ADD COLUMN IF NOT EXISTS free_reassignments_total INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS free_reassignments_used INT DEFAULT 0;

-- Backfill: set free_reassignments_total = seats for all existing licenses
UPDATE team_licenses 
SET free_reassignments_total = seats 
WHERE free_reassignments_total = 0;

-- Ensure used is never negative
ALTER TABLE team_licenses 
  ADD CONSTRAINT chk_reassignments_used_nonnegative CHECK (free_reassignments_used >= 0);
