-- Fix for communications table
-- Run this script on your production database if the original migration failed

-- Drop the table if it exists with the wrong UUID function
DROP TABLE IF EXISTS communications CASCADE;

-- Recreate with the correct UUID function
CREATE TABLE communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'announcement' or 'thank_you'
    message TEXT NOT NULL,
    recipient_filter VARCHAR(50) NOT NULL, -- 'all', 'attended', 'confirmed'
    recipients_count INTEGER NOT NULL DEFAULT 0,
    sent_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'sending', 'completed', 'failed'
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    error_message TEXT
);

-- Recreate indexes
CREATE INDEX idx_communications_event_id ON communications(event_id);
CREATE INDEX idx_communications_created_at ON communications(created_at DESC);
CREATE INDEX idx_communications_status ON communications(status);
