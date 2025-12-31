-- Rollback: Remove Event Types
-- Date: 2025-12-31
-- Description: Rollback migration for event types

-- Drop index
DROP INDEX IF EXISTS idx_events_type;

-- Drop columns
ALTER TABLE events DROP COLUMN IF EXISTS organizers;
ALTER TABLE events DROP COLUMN IF EXISTS event_type;
