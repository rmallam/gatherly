-- Make email optional for phone-based signups
-- Users can sign up with either email OR phone number

-- Update users table to allow NULL email (if phone is provided)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Add constraint: must have either email or phone
ALTER TABLE users ADD CONSTRAINT user_contact_required 
CHECK (email IS NOT NULL OR phone IS NOT NULL);

-- Update unique constraints to handle NULLs properly
-- Drop existing constraint and recreate as partial unique indexes
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_phone;

-- Create unique indexes that ignore NULL values
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
