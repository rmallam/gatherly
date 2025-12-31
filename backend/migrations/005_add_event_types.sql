-- Migration: Add Event Types (Host vs Shared)
-- Date: 2025-12-31
-- Description: Add event_type and organizers fields to support both host events and shared events

-- Add event_type column (host or shared)
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type VARCHAR(20) DEFAULT 'host';

-- Add organizers array for shared events (stores user IDs who can manage the event)
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizers JSONB DEFAULT '[]';

-- Add comment for documentation
COMMENT ON COLUMN events.event_type IS 'Event type: host (birthday, wedding) or shared (trip, outing)';
COMMENT ON COLUMN events.organizers IS 'Array of user IDs who are organizers (for shared events)';

-- Create index for event type filtering
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
