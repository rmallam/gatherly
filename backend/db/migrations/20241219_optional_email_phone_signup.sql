-- Make email optional for phone-based signups
-- Users can sign up with either email OR phone number

-- Step 1: Add phone column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Step 2: Make email optional (if phone is provided)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Step 3: Add constraint: must have either email or phone
ALTER TABLE users ADD CONSTRAINT user_contact_required 
CHECK (email IS NOT NULL OR phone IS NOT NULL);

-- Step 4: Update unique constraints to handle NULLs properly
-- Drop existing constraint and recreate as partial unique indexes
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_phone;

-- Step 5: Create unique indexes that ignore NULL values
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
