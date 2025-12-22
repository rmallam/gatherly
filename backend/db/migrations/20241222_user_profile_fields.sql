-- Add profile management fields to users table
-- Allows users to customize their profile with picture and bio

-- Add profile picture URL column (stores base64 or cloud URL)
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Add bio/description column
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add updated_at timestamp to track profile changes
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at on user profile changes
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
