-- Rollback: Remove Expense Splitting Tables
-- Date: 2025-12-31
-- Description: Rollback migration for expense splitting

-- Drop triggers
DROP TRIGGER IF EXISTS event_expenses_updated_at ON event_expenses;
DROP FUNCTION IF EXISTS update_event_expenses_updated_at();

-- Drop indexes
DROP INDEX IF EXISTS idx_event_settlements_users;
DROP INDEX IF EXISTS idx_event_settlements_event;
DROP INDEX IF EXISTS idx_event_expense_splits_settled;
DROP INDEX IF EXISTS idx_event_expense_splits_user;
DROP INDEX IF EXISTS idx_event_expense_splits_expense;
DROP INDEX IF EXISTS idx_event_expenses_date;
DROP INDEX IF EXISTS idx_event_expenses_paid_by;
DROP INDEX IF EXISTS idx_event_expenses_event;

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS event_settlements;
DROP TABLE IF EXISTS event_expense_splits;
DROP TABLE IF EXISTS event_expenses;
