-- Migration: Add Smart Reminders
-- Created: 2024-12-15

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) NOT NULL,
  recipient_type VARCHAR(20) NOT NULL, -- 'host' or 'guests'
  send_at TIMESTAMP NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reminders_event ON reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_reminders_send_at ON reminders(send_at) WHERE sent = FALSE;
CREATE INDEX IF NOT EXISTS idx_reminders_type ON reminders(reminder_type);

-- Comments
COMMENT ON TABLE reminders IS 'Automated reminders for events';
COMMENT ON COLUMN reminders.reminder_type IS 'rsvp_followup, event_tomorrow, event_starting, vendor_payment, task_deadline';
COMMENT ON COLUMN reminders.recipient_type IS 'host or guests';
