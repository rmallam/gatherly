-- Columns that exist in production but were never captured in any migration.
-- Found by scanning every column the code references against a DB rebuilt from
-- the migration history. Idempotent: a no-op on prod, fills the gap on fresh DBs.
ALTER TABLE users  ADD COLUMN IF NOT EXISTS is_admin        BOOLEAN   NOT NULL DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
