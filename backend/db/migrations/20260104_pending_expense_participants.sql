-- Migration: Support Unregistered Guests in Expense Splits
-- Date: 2026-01-04
-- Description: Allow adding guests without user accounts to expense splits
--              Leverages existing guest-to-user linking system

-- Add columns for pending (unregistered) participants
ALTER TABLE event_expense_splits 
  ADD COLUMN IF NOT EXISTS pending_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS pending_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS pending_phone VARCHAR(50);

-- Make user_id nullable (was previously required)
ALTER TABLE event_expense_splits 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add check constraint: must have either user_id OR pending participant info
ALTER TABLE event_expense_splits
  DROP CONSTRAINT IF EXISTS check_participant_info;

ALTER TABLE event_expense_splits
  ADD CONSTRAINT check_participant_info CHECK (
    user_id IS NOT NULL OR 
    pending_name IS NOT NULL
  );

-- Create indexes for efficient auto-linking
CREATE INDEX IF NOT EXISTS idx_expense_splits_pending_email 
  ON event_expense_splits(pending_email) 
  WHERE pending_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_expense_splits_pending_phone 
  ON event_expense_splits(pending_phone) 
  WHERE pending_phone IS NOT NULL;

-- Function to auto-link expense splits when user signs up
-- This mirrors the guest linking logic
CREATE OR REPLACE FUNCTION link_expense_splits_to_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Link by email (if provided)
  IF NEW.email IS NOT NULL THEN
    UPDATE event_expense_splits
    SET user_id = NEW.id,
        pending_email = NULL,
        pending_phone = NULL,
        pending_name = NULL
    WHERE user_id IS NULL 
      AND pending_email = NEW.email;
  END IF;
  
  -- Link by phone (if email didn't match and phone is provided)
  IF NEW.phone IS NOT NULL THEN
    UPDATE event_expense_splits
    SET user_id = NEW.id,
        pending_email = NULL,
        pending_phone = NULL,
        pending_name = NULL
    WHERE user_id IS NULL 
      AND pending_phone = NEW.phone;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on user creation
DROP TRIGGER IF EXISTS trigger_link_expense_splits ON users;

CREATE TRIGGER trigger_link_expense_splits
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION link_expense_splits_to_user();

-- Add comments for documentation
COMMENT ON COLUMN event_expense_splits.pending_name IS 'Name of unregistered participant (NULL if user_id is set)';
COMMENT ON COLUMN event_expense_splits.pending_email IS 'Email of unregistered participant for auto-linking';
COMMENT ON COLUMN event_expense_splits.pending_phone IS 'Phone of unregistered participant for auto-linking';
