-- Change photo_url column to TEXT to support base64 image storage
ALTER TABLE event_posts ALTER COLUMN photo_url TYPE TEXT;
