-- Rollback: Remove Expense Tracking Tables
-- Date: 2025-12-31
-- Description: Rollback migration for expense tracking

-- Drop triggers
DROP TRIGGER IF EXISTS expenses_updated_at ON expenses;
DROP FUNCTION IF EXISTS update_expenses_updated_at();

-- Drop indexes
DROP INDEX IF EXISTS idx_settlements_users;
DROP INDEX IF EXISTS idx_settlements_event;
DROP INDEX IF EXISTS idx_expense_splits_settled;
DROP INDEX IF EXISTS idx_expense_splits_user;
DROP INDEX IF EXISTS idx_expense_splits_expense;
DROP INDEX IF EXISTS idx_expenses_date;
DROP INDEX IF EXISTS idx_expenses_paid_by;
DROP INDEX IF EXISTS idx_expenses_event;

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS settlements;
DROP TABLE IF EXISTS expense_splits;
DROP TABLE IF EXISTS expenses;
