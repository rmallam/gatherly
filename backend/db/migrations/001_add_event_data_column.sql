-- Migration: Add data column to events table
-- Run this on your PostgreSQL database

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;

-- Update existing rows to have empty object
UPDATE events SET data = '{}'::jsonb WHERE data IS NULL;
