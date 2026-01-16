-- Plus-Ones Tracking Schema
-- Migration: 008_plus_ones_tracking.sql

-- Add plus-ones tracking columns to guests table
ALTER TABLE guests ADD COLUMN IF NOT EXISTS expected_party_size INTEGER DEFAULT 1;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS actual_party_size INTEGER DEFAULT 0;

-- Migrate existing data: if guest attended, set actual_party_size to 1
UPDATE guests 
SET actual_party_size = 1 
WHERE attended = true AND actual_party_size = 0;

-- Add indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_guests_expected_party_size ON guests(expected_party_size);
CREATE INDEX IF NOT EXISTS idx_guests_actual_party_size ON guests(actual_party_size);

-- Add comments for documentation
COMMENT ON COLUMN guests.expected_party_size IS 'Number of guests expected to attend (set during RSVP or manual entry, includes the primary guest)';
COMMENT ON COLUMN guests.actual_party_size IS 'Actual number of guests who checked in (set during check-in)';
