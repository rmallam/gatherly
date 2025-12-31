-- Migration: Add Expense Splitting Tables
-- Date: 2025-12-31
-- Description: Add tables for expense splitting and settlement (for group gatherings)
-- Note: Renamed to event_expenses to avoid conflict with budget expenses table

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Event expenses table (for splitting among participants)
CREATE TABLE IF NOT EXISTS event_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'other',
    paid_by UUID NOT NULL REFERENCES users(id),
    receipt_url TEXT,
    expense_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expense splits (who owes what)
CREATE TABLE IF NOT EXISTS event_expense_splits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_id UUID NOT NULL REFERENCES event_expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    settled BOOLEAN DEFAULT FALSE,
    settled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(expense_id, user_id)
);

-- Settlements (payments between users)
CREATE TABLE IF NOT EXISTS event_settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    from_user UUID NOT NULL REFERENCES users(id),
    to_user UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    settled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    CHECK (from_user != to_user)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_expenses_event ON event_expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_event_expenses_paid_by ON event_expenses(paid_by);
CREATE INDEX IF NOT EXISTS idx_event_expenses_date ON event_expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_event_expense_splits_expense ON event_expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_event_expense_splits_user ON event_expense_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_event_expense_splits_settled ON event_expense_splits(settled);
CREATE INDEX IF NOT EXISTS idx_event_settlements_event ON event_settlements(event_id);
CREATE INDEX IF NOT EXISTS idx_event_settlements_users ON event_settlements(from_user, to_user);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_event_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS event_expenses_updated_at ON event_expenses;
CREATE TRIGGER event_expenses_updated_at
    BEFORE UPDATE ON event_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_event_expenses_updated_at();

-- Comments for documentation
COMMENT ON TABLE event_expenses IS 'Stores expenses for splitting among event participants';
COMMENT ON TABLE event_expense_splits IS 'Tracks how expenses are split among participants';
COMMENT ON TABLE event_settlements IS 'Records payments made between users to settle debts';
COMMENT ON COLUMN event_expenses.category IS 'Categories: food, transport, accommodation, activities, entertainment, other';
COMMENT ON COLUMN event_expenses.currency IS 'ISO 4217 currency code (USD, EUR, GBP, INR, AUD, etc)';
