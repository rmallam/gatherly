-- Migration: Add event schedule items table
-- This table stores daily activities and itinerary items for shared events

-- Create event_schedule_items table
CREATE TABLE IF NOT EXISTS event_schedule_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    category VARCHAR(50) DEFAULT 'activity',
    assigned_to JSONB, -- Array of user IDs who are assigned to this activity
    estimated_cost DECIMAL(10,2),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_schedule_event ON event_schedule_items(event_id);
CREATE INDEX idx_schedule_date ON event_schedule_items(date);
CREATE INDEX idx_schedule_event_date ON event_schedule_items(event_id, date);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_schedule_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER schedule_items_updated_at
    BEFORE UPDATE ON event_schedule_items
    FOR EACH ROW
    EXECUTE FUNCTION update_schedule_items_updated_at();

-- Add comment for documentation
COMMENT ON TABLE event_schedule_items IS 'Stores daily schedule and itinerary items for shared events';
COMMENT ON COLUMN event_schedule_items.category IS 'Categories: meals, transport, accommodation, activities, meetings, other';
COMMENT ON COLUMN event_schedule_items.assigned_to IS 'JSON array of user IDs assigned to this activity';
