-- Add monetization fields to users table
ALTER TABLE users 
ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'free',
ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'active',
ADD COLUMN sms_credits INTEGER DEFAULT 0,
ADD COLUMN event_count INTEGER DEFAULT 0, -- Track total created events for limit enforcement
ADD COLUMN revenuecat_id VARCHAR(255);

-- Create table for tracking SMS credit usage
CREATE TABLE IF NOT EXISTS sms_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    credits_used INTEGER NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'announcement', 'thank_you'
    recipient_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_users_subscription ON users(subscription_tier);
