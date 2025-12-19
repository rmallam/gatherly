-- Event Social Wall - Database Schema
-- Phase 1: Core Tables for event community features

-- Table for guests who join the event wall
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  profile_photo_url VARCHAR(500),
  bio TEXT,
  fun_fact TEXT,
  relationship_to_host VARCHAR(100),
  notification_enabled BOOLEAN DEFAULT TRUE,
  UNIQUE(event_id, guest_id)
);

-- Social wall posts (messages and photos)
CREATE TABLE IF NOT EXISTS event_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES event_participants(id) ON DELETE CASCADE,
  post_type VARCHAR(20) NOT NULL CHECK (post_type IN ('message', 'photo', 'announcement')),
  content TEXT, -- Message text or photo caption
  photo_url VARCHAR(500), -- For photo posts
  is_pinned BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE, -- For moderation
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Likes on posts
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES event_posts(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES event_participants(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, participant_id)
);

-- Comments on posts
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES event_posts(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES event_participants(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add optional profile fields to existing guests table
ALTER TABLE guests ADD COLUMN IF NOT EXISTS profile_photo_url VARCHAR(500);
ALTER TABLE guests ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add social wall toggle to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS social_wall_enabled BOOLEAN DEFAULT FALSE;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_guest ON event_participants(guest_id);
CREATE INDEX IF NOT EXISTS idx_event_posts_event_created ON event_posts(event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_posts_participant ON event_posts(participant_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id, created_at DESC);

-- Insert test data (optional, for development)
-- Will be commented out in production migration
/*
INSERT INTO event_participants (event_id, guest_id, bio, fun_fact, relationship_to_host)
SELECT 
  e.id,
  g.id,
  'Excited to celebrate!',
  'I love parties!',
  'Friend'
FROM events e
CROSS JOIN guests g
WHERE e.id IN (SELECT id FROM events LIMIT 1)
  AND g.id IN (SELECT id FROM guests WHERE event_id = e.id LIMIT 3);
*/
