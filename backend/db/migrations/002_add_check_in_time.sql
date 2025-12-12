-- Add check_in_time column to guests table
ALTER TABLE guests 
ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMP;
