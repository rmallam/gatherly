-- Rollback migration: Remove event schedule items table

-- Drop trigger
DROP TRIGGER IF EXISTS schedule_items_updated_at ON event_schedule_items;

-- Drop function
DROP FUNCTION IF EXISTS update_schedule_items_updated_at();

-- Drop indexes
DROP INDEX IF EXISTS idx_schedule_event_date;
DROP INDEX IF EXISTS idx_schedule_date;
DROP INDEX IF EXISTS idx_schedule_event;

-- Drop table
DROP TABLE IF EXISTS event_schedule_items;
