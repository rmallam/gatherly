-- Link guests to user accounts
-- This enables showing "invited events" on the landing page

-- Add user_id column to guests table to link guests to registered users
ALTER TABLE guests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Create index for efficient lookup
CREATE INDEX IF NOT EXISTS idx_guests_user_id ON guests(user_id);

-- Auto-link existing guests to users based on email match
UPDATE guests g
SET user_id = u.id
FROM users u
WHERE g.email = u.email
  AND g.user_id IS NULL;

-- Auto-link existing guests to users based on phone match (if email doesn't match)
UPDATE guests g
SET user_id = u.id
FROM users u
WHERE g.phone = u.phone
  AND g.email IS NULL
  AND g.user_id IS NULL;
