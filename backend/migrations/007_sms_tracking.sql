-- SMS Tracking and Limits Schema
-- Migration: 007_sms_tracking.sql

-- Create sms_logs table for detailed SMS tracking
CREATE TABLE IF NOT EXISTS sms_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    message_type VARCHAR(50), -- 'reminder', 'announcement', 'thank_you', 'invitation'
    status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'failed', 'pending'
    twilio_sid VARCHAR(100),
    cost_units INTEGER DEFAULT 1, -- For multi-part messages
    sent_at TIMESTAMP DEFAULT NOW(),
    error_message TEXT
);

-- Add SMS quota tracking to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS sms_quota_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sms_quota_reset_date DATE DEFAULT CURRENT_DATE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sms_logs_user_id ON sms_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_sent_at ON sms_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_sms_logs_event_id ON sms_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON sms_logs(status);

-- Add comment for documentation
COMMENT ON TABLE sms_logs IS 'Tracks all SMS messages sent through the system for billing and analytics';
COMMENT ON COLUMN sms_logs.cost_units IS 'Number of SMS units consumed (multi-part messages count as multiple)';
COMMENT ON COLUMN users.sms_quota_used IS 'Number of SMS sent in current billing period';
COMMENT ON COLUMN users.sms_quota_reset_date IS 'Date when SMS quota will reset';
