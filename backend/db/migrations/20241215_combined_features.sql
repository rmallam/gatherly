-- Combined Migration: Budget Tracker + Smart Reminders
-- Created: 2024-12-15

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- BUDGET TRACKER TABLES
-- ========================================

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

-- ========================================
-- SMART REMINDERS TABLES
-- ========================================

-- Add reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) NOT NULL,
  recipient_type VARCHAR(20) NOT NULL,
  send_at TIMESTAMP NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================

-- Budget indexes
CREATE INDEX IF NOT EXISTS idx_budgets_event ON budgets(event_id);
CREATE INDEX IF NOT EXISTS idx_expenses_event ON expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- Reminder indexes
CREATE INDEX IF NOT EXISTS idx_reminders_event ON reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_reminders_send_at ON reminders(send_at) WHERE sent = FALSE;
CREATE INDEX IF NOT EXISTS idx_reminders_type ON reminders(reminder_type);

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE budgets IS 'Event budget tracking';
COMMENT ON TABLE expenses IS 'Event expenses by category';
COMMENT ON COLUMN expenses.category IS 'Venue, Catering, Decorations, Entertainment, Photography, Transportation, Gifts, Misc';

COMMENT ON TABLE reminders IS 'Automated reminders for events';
COMMENT ON COLUMN reminders.reminder_type IS 'rsvp_followup, event_tomorrow, event_starting, vendor_payment, task_deadline';
COMMENT ON COLUMN reminders.recipient_type IS 'host or guests';
