# Database Setup Guide
## Requirement & Effort Tracker - PostgreSQL Migration

This guide will help you set up the PostgreSQL database for the Requirement & Effort Tracker application.

## Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **PostgreSQL** 15.x or higher

## Quick Start

### 1. Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql-15
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/)

**Verify Installation:**
```bash
psql --version
# Should show: psql (PostgreSQL) 15.x
```

### 2. Create Database

**Option A: Using createdb command**
```bash
createdb req_tracker_dev
```

**Option B: Using psql**
```bash
psql -U postgres
CREATE DATABASE req_tracker_dev;
\q
```

### 3. Install Dependencies

```bash
npm install
```

This will install `@vercel/postgres` and other required packages.

### 4. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and update the database connection string
# Example: POSTGRES_URL="postgresql://postgres:password@localhost:5432/req_tracker_dev"
```

**Connection String Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Common Examples:**
- Local development: `postgresql://postgres:password@localhost:5432/req_tracker_dev`
- Vercel Postgres: Auto-configured (no need to set manually)
- Docker: `postgresql://postgres:password@localhost:5432/req_tracker_dev`

### 5. Run Database Migrations

```bash
# Run the schema to create tables
npm run db:migrate

# OR manually with psql
psql $POSTGRES_URL -f src/lib/db/schema.sql
```

This will create:
- `projects` table
- `requirements` table
- `preferences` table
- Necessary indexes and triggers
- Default preferences row

### 6. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see the application!

## Database Schema

### Tables

#### `projects`
```sql
- id (SERIAL, PRIMARY KEY)
- name (VARCHAR(100))
- created_at (TIMESTAMP)
- last_modified_at (TIMESTAMP)
```

#### `requirements`
```sql
- id (SERIAL, PRIMARY KEY)
- project_id (INTEGER, FOREIGN KEY → projects.id)
- description (VARCHAR(500))
- effort (DECIMAL(10,2))
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- last_modified_at (TIMESTAMP)
```

#### `preferences`
```sql
- id (SERIAL, PRIMARY KEY)
- effort_column_visible (BOOLEAN)
- show_total_when_effort_hidden (BOOLEAN)
- language (VARCHAR(10))
- last_updated_at (TIMESTAMP)
```

## Database Management Commands

### Reset Database
```bash
# WARNING: This will delete ALL data
npm run db:reset
```

### Manual Database Operations

**Connect to database:**
```bash
psql $POSTGRES_URL
```

**View all projects:**
```sql
SELECT * FROM projects;
```

**View all requirements:**
```sql
SELECT * FROM requirements;
```

**View preferences:**
```sql
SELECT * FROM preferences;
```

**Check total active effort:**
```sql
SELECT SUM(effort) as total_active_effort
FROM requirements
WHERE is_active = true;
```

**Delete all data (keep schema):**
```sql
TRUNCATE projects CASCADE;
TRUNCATE preferences CASCADE;
-- Re-insert default preferences
INSERT INTO preferences (effort_column_visible, show_total_when_effort_hidden, language)
VALUES (true, true, 'en');
```

## Troubleshooting

### Connection Errors

**Error: "connection refused"**
- Check if PostgreSQL is running:
  ```bash
  pg_isready
  ```
- Start PostgreSQL:
  ```bash
  # macOS
  brew services start postgresql@15

  # Ubuntu
  sudo systemctl start postgresql
  ```

**Error: "password authentication failed"**
- Check your connection string in `.env.local`
- Verify username and password
- Update PostgreSQL user password:
  ```bash
  psql -U postgres
  ALTER USER postgres PASSWORD 'your_new_password';
  ```

**Error: "database does not exist"**
- Create the database:
  ```bash
  createdb req_tracker_dev
  ```

### Permission Errors

**Error: "permission denied for table"**
```bash
psql -U postgres -d req_tracker_dev
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

### Migration Errors

**Error: "table already exists"**
- Tables were already created. Either:
  1. Drop and recreate: `npm run db:reset`
  2. Continue using existing tables

**Error: "syntax error in SQL"**
- Ensure you're using PostgreSQL 15+
- Check that the schema.sql file is not corrupted

## Deploying to Production

### Vercel Postgres

1. **Create Vercel Postgres Database:**
   - Go to your Vercel project dashboard
   - Navigate to the Storage tab
   - Create a new Postgres database

2. **Vercel Automatically Sets Environment Variables:**
   - `POSTGRES_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_PRISMA_URL` (if needed)

3. **Run Migrations:**
   - Option A: Use Vercel's SQL editor in the dashboard
     - Copy contents of `src/lib/db/schema.sql`
     - Paste and execute in the SQL editor

   - Option B: Connect locally and run migrations
     ```bash
     # Get connection string from Vercel dashboard
     export POSTGRES_URL="<your-vercel-postgres-url>"
     npm run db:migrate
     ```

4. **Deploy Application:**
   ```bash
   vercel deploy --prod
   ```

### Other Cloud Providers

#### Railway

1. Create a PostgreSQL database in Railway
2. Copy the connection string
3. Set `POSTGRES_URL` environment variable in Railway
4. Connect locally and run migrations:
   ```bash
   export POSTGRES_URL="<railway-postgres-url>"
   npm run db:migrate
   ```

#### Supabase

1. Create a project in Supabase
2. Get the connection string (Transaction pooling mode)
3. Run migrations using Supabase SQL editor or locally
4. Set environment variable in your deployment platform

#### Heroku

1. Add Heroku Postgres addon:
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```
2. Connection string automatically set as `DATABASE_URL`
3. Run migrations:
   ```bash
   heroku pg:psql < src/lib/db/schema.sql
   ```

## Development Tips

### View Database Logs

```bash
# macOS
tail -f /usr/local/var/log/postgresql@15.log

# Ubuntu
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Backup Database

```bash
# Create backup
pg_dump $POSTGRES_URL > backup.sql

# Restore from backup
psql $POSTGRES_URL < backup.sql
```

### Performance Monitoring

```sql
-- View slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- View table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Migration from localStorage

**Important:** This PostgreSQL version starts with a fresh database. Data from the localStorage version is NOT automatically migrated.

If you need to preserve old data:
1. Export data from localStorage version (browser console):
   ```javascript
   // Copy this to console in old version
   const data = {
     project: localStorage.getItem('req-tracker:project'),
     requirements: localStorage.getItem('req-tracker:requirements'),
     preferences: localStorage.getItem('req-tracker:preferences')
   };
   console.log(JSON.stringify(data, null, 2));
   ```

2. Manually create project and requirements in the new version through the UI

## Support

For issues specific to:
- **PostgreSQL Setup**: Check [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- **Vercel Postgres**: Check [Vercel Docs](https://vercel.com/docs/storage/vercel-postgres)
- **Application Issues**: Check GitHub issues or create a new one

## Additional Resources

- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [@vercel/postgres Documentation](https://vercel.com/docs/storage/vercel-postgres/sdk)
- [Database Schema File](./src/lib/db/schema.sql)
- [Technical Specification](./docs/technical-spec.md)
- [Functional Requirements](./docs/requirement-2.md)
