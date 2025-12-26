-- Create user_contacts table for reusable guest library
-- Allows users to save and reuse guest information across multiple events

CREATE TABLE IF NOT EXISTS user_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure at least one contact method
    CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

-- Prevent duplicate contacts for same user
-- Using partial unique indexes to handle NULLs properly
CREATE UNIQUE INDEX idx_user_contacts_user_phone 
    ON user_contacts(user_id, phone) 
    WHERE phone IS NOT NULL;

CREATE UNIQUE INDEX idx_user_contacts_user_email 
    ON user_contacts(user_id, email) 
    WHERE email IS NOT NULL;

-- Performance indexes
CREATE INDEX idx_user_contacts_user_id ON user_contacts(user_id);
CREATE INDEX idx_user_contacts_name ON user_contacts(name);

-- Add contact_id to guests table to link to user_contacts
ALTER TABLE guests ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES user_contacts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_guests_contact_id ON guests(contact_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_contacts_updated_at
    BEFORE UPDATE ON user_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_contacts_updated_at();
