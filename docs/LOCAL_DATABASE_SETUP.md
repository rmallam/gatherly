# Local Database Setup Guide

## 🐳 Option 1: Docker (Recommended - Easiest)

### Prerequisites:
- Install Docker Desktop: https://www.docker.com/products/docker-desktop

### Setup Steps:

1. **Start the database:**
```bash
cd /Users/rakeshkumarmallam/Rakesh-work/guest-scanner
docker-compose up -d
```

2. **Verify it's running:**
```bash
docker ps
# Should show: gatherly-dev-db (postgres) and gatherly-pgadmin
```

3. **Run migrations:**
```bash
cd backend
npm run migrate:dev
```

4. **Start backend:**
```bash
npm start
# Backend will connect to local database
```

### Database Access:

**Connection String:**
```
postgresql://gatherly_dev:dev_password_123@localhost:5432/gatherlydb_dev
```

**pgAdmin UI:**
- URL: http://localhost:5050
- Email: admin@gatherly.local
- Password: admin123

**Connect to database in pgAdmin:**
1. Open http://localhost:5050
2. Add New Server:
   - Name: Gatherly Dev
   - Host: postgres (or host.docker.internal on Mac)
   - Port: 5432
   - Database: gatherlydb_dev
   - Username: gatherly_dev
   - Password: dev_password_123

### Useful Commands:

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v

# View logs
docker-compose logs -f postgres

# Access PostgreSQL CLI
docker exec -it gatherly-dev-db psql -U gatherly_dev -d gatherlydb_dev
```

---

## 💻 Option 2: Native PostgreSQL Installation

### macOS (using Homebrew):

1. **Install PostgreSQL:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

2. **Create database and user:**
```bash
psql postgres

CREATE DATABASE gatherlydb_dev;
CREATE USER gatherly_dev WITH PASSWORD 'dev_password_123';
GRANT ALL PRIVILEGES ON DATABASE gatherlydb_dev TO gatherly_dev;
\q
```

3. **Update backend/.env.development:**
```
DATABASE_URL=postgresql://gatherly_dev:dev_password_123@localhost:5432/gatherlydb_dev
```

4. **Run migrations:**
```bash
cd backend
npm run migrate:dev
```

### Useful Commands:

```bash
# Start PostgreSQL
brew services start postgresql@15

# Stop PostgreSQL
brew services stop postgresql@15

# Restart PostgreSQL
brew services restart postgresql@15

# Access PostgreSQL CLI
psql -U gatherly_dev -d gatherlydb_dev
```

---

## 🔧 Migration Scripts

Add these to `backend/package.json`:

```json
{
  "scripts": {
    "migrate:dev": "node scripts/migrate.js development",
    "migrate:prod": "node scripts/migrate.js production",
    "migrate:rollback": "node scripts/rollback.js"
  }
}
```

---

## 📊 Database Management Tools

### 1. **pgAdmin** (Web UI - included in Docker setup)
- URL: http://localhost:5050
- Best for: Visual database management

### 2. **psql** (Command Line)
```bash
# Docker
docker exec -it gatherly-dev-db psql -U gatherly_dev -d gatherlydb_dev

# Native
psql -U gatherly_dev -d gatherlydb_dev
```

### 3. **TablePlus** (GUI - Optional)
- Download: https://tableplus.com
- Best for: Modern, beautiful database UI

### 4. **DBeaver** (GUI - Free)
- Download: https://dbeaver.io
- Best for: Feature-rich, cross-platform

---

## 🎯 Development Workflow

### Daily Development:

1. **Start database:**
```bash
docker-compose up -d
```

2. **Start backend:**
```bash
cd backend
npm start
```

3. **Start frontend:**
```bash
cd frontend
npm run dev
```

### Running Migrations:

```bash
# Apply all migrations
cd backend/migrations
psql "postgresql://gatherly_dev:dev_password_123@localhost:5432/gatherlydb_dev" -f 001_initial_schema.sql
psql "postgresql://gatherly_dev:dev_password_123@localhost:5432/gatherlydb_dev" -f 002_add_reminders.sql
psql "postgresql://gatherly_dev:dev_password_123@localhost:5432/gatherlydb_dev" -f 003_add_event_wall.sql
psql "postgresql://gatherly_dev:dev_password_123@localhost:5432/gatherlydb_dev" -f 004_add_expense_tracking.sql
psql "postgresql://gatherly_dev:dev_password_123@localhost:5432/gatherlydb_dev" -f 005_add_event_types.sql
```

### Fresh Database:

```bash
# Stop and remove database
docker-compose down -v

# Start fresh
docker-compose up -d

# Wait for database to be ready
sleep 5

# Run migrations
cd backend/migrations
for file in *.sql; do
  if [[ $file != *"_down.sql" ]]; then
    psql "postgresql://gatherly_dev:dev_password_123@localhost:5432/gatherlydb_dev" -f "$file"
  fi
done
```

---

## 🔍 Troubleshooting

### Port 5432 already in use:
```bash
# Check what's using port 5432
lsof -i :5432

# Stop existing PostgreSQL
brew services stop postgresql@15

# Or change port in docker-compose.yml:
ports:
  - "5433:5432"  # Use 5433 instead
```

### Can't connect to database:
```bash
# Check if container is running
docker ps

# Check logs
docker-compose logs postgres

# Restart container
docker-compose restart postgres
```

### Migrations failed:
```bash
# Check current schema
docker exec -it gatherly-dev-db psql -U gatherly_dev -d gatherlydb_dev -c "\dt"

# Drop and recreate database
docker-compose down -v
docker-compose up -d
# Run migrations again
```

---

## 🎨 Environment Comparison

| Environment | Database | URL |
|------------|----------|-----|
| **Local Dev** | Docker PostgreSQL | localhost:5432 |
| **Production** | Render PostgreSQL | dpg-d4t4hl56ubrc73ed5ucg-a.oregon-postgres.render.com |

---

## 💡 Best Practices

1. **Never use production database for testing**
2. **Keep local database in sync with production schema**
3. **Test migrations on local database first**
4. **Use Docker for consistent environment**
5. **Backup production database before major changes**

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. Start database
docker-compose up -d

# 2. Run migrations
cd backend/migrations
psql "postgresql://gatherly_dev:dev_password_123@localhost:5432/gatherlydb_dev" -f 001_initial_schema.sql
# ... run other migrations

# 3. Start backend
cd ../
npm start

# 4. Start frontend
cd ../frontend
npm run dev

# Done! App running with local database
```
