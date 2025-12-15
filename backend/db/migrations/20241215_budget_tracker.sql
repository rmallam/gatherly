-- Migration: Add Budget and Expense tracking
-- Created: 2024-12-15

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  total_budget DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id)
);

-- Add expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  vendor VARCHAR(255),
  paid BOOLEAN DEFAULT FALSE,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_budgets_event ON budgets(event_id);
CREATE INDEX IF NOT EXISTS idx_expenses_event ON expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- Comments
COMMENT ON TABLE budgets IS 'Event budget tracking';
COMMENT ON TABLE expenses IS 'Event expenses by category';
COMMENT ON COLUMN expenses.category IS 'Venue, Catering, Decorations, Entertainment, Photography, Transportation, Gifts, Misc';
