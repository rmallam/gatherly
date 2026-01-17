-- Upgrade User to Pro Tier for Testing AI Features
-- Run this in Render's PostgreSQL console

-- First, check your current subscription tier
SELECT id, email, subscription_tier, subscription_status 
FROM users 
WHERE email = 'your_email@example.com';

-- Update to Pro tier (replace with your actual email)
UPDATE users 
SET 
    subscription_tier = 'pro',
    subscription_status = 'active',
    subscription_start_date = NOW(),
    subscription_end_date = NOW() + INTERVAL '1 year'
WHERE email = 'your_email@example.com';

-- Verify the update
SELECT id, email, subscription_tier, subscription_status, subscription_start_date
FROM users 
WHERE email = 'your_email@example.com';

-- Alternative: Upgrade by user ID
-- UPDATE users SET subscription_tier = 'pro', subscription_status = 'active' WHERE id = 'your-user-id';
