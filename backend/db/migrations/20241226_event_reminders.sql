-- Event Reminders Migration
-- Description: Add table to track sent event reminder notifications
-- Created: 2024-12-26

CREATE TABLE IF NOT EXISTS event_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    reminder_type VARCHAR(20) NOT NULL CHECK (reminder_type IN ('3_days', '2_days', '1_day', '2_hours', '5_minutes')),
    sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
    recipient_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(event_id, reminder_type)
);

CREATE INDEX idx_event_reminders_event_id ON event_reminders(event_id);
CREATE INDEX idx_event_reminders_sent_at ON event_reminders(sent_at);
CREATE INDEX idx_event_reminders_type ON event_reminders(reminder_type);

COMMENT ON TABLE event_reminders IS 'Tracks which event reminder notifications have been sent';
COMMENT ON COLUMN event_reminders.reminder_type IS 'Type of reminder: 3_days, 2_days, 1_day, 2_hours, or 5_minutes';
COMMENT ON COLUMN event_reminders.recipient_count IS 'Number of users who received this reminder';
