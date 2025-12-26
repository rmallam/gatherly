-- Contact Groups Migration
-- Allows users to organize contacts into groups (e.g., "Family", "Friends")
-- and invite entire groups to events with one click

-- Create contact_groups table
CREATE TABLE IF NOT EXISTS contact_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280', -- Hex color for UI badges
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate group names per user
    UNIQUE(user_id, name)
);

-- Create contact_group_members junction table (many-to-many)
CREATE TABLE IF NOT EXISTS contact_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES contact_groups(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES user_contacts(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate memberships
    UNIQUE(group_id, contact_id)
);

-- Performance indexes
CREATE INDEX idx_contact_groups_user_id ON contact_groups(user_id);
CREATE INDEX idx_contact_group_members_group_id ON contact_group_members(group_id);
CREATE INDEX idx_contact_group_members_contact_id ON contact_group_members(contact_id);

-- Update trigger for contact_groups updated_at
CREATE OR REPLACE FUNCTION update_contact_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_contact_groups_updated_at
    BEFORE UPDATE ON contact_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_groups_updated_at();
