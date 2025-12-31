#!/bin/bash
# Run all database migrations in order

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database URL (default to development)
DB_URL="${DATABASE_URL:-postgresql://gatherly_dev:dev_password_123@localhost:5432/gatherlydb_dev}"

echo -e "${BLUE}Running database migrations...${NC}"
echo -e "${BLUE}Database: $DB_URL${NC}\n"

# Change to migrations directory
cd "$(dirname "$0")/../migrations"

# Run each migration file in order
for file in 00*.sql; do
  if [[ $file != *"_down.sql" ]]; then
    echo -e "${GREEN}Running: $file${NC}"
    psql "$DB_URL" -f "$file"
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ $file completed${NC}\n"
    else
      echo -e "${RED}✗ $file failed${NC}\n"
      exit 1
    fi
  fi
done

echo -e "${GREEN}All migrations completed successfully!${NC}"
