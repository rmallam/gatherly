-- Communications table for announcements and thank you messages
CREATE TABLE IF NOT EXISTS communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_communications_event_id ON communications(event_id);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON communications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);
