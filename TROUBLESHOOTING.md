# Troubleshooting Guide

## Fixed: VercelPostgresError - 'invalid_connection_string'

This error has been resolved by updating the database connection to use `createPool` which supports both pooled and direct connection strings.

### What Was Changed

Updated `src/lib/db/index.ts` to use `createPool` instead of the global `sql` tag:

```typescript
const db = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export const sql = db.sql; // Now works with any connection string format
```

### Next Steps

1. **Verify Your Environment Variables**

   Check that `.env.local` exists and has the correct connection string:

   ```bash
   cat .env.local
   ```

   Should show:
   ```
   POSTGRES_URL="postgresql://postgres:password@localhost:5432/req_tracker_dev"
   ```

   If the file doesn't exist:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual database credentials
   ```

2. **Verify Database Exists**

   ```bash
   psql -l | grep req_tracker_dev
   ```

   If not found, create it:
   ```bash
   createdb req_tracker_dev
   ```

3. **Run Database Migrations**

   ```bash
   npm run db:migrate
   ```

   Or manually:
   ```bash
   psql $POSTGRES_URL -f src/lib/db/schema.sql
   ```

4. **Restart Development Server**

   Stop the current server (Ctrl+C) and restart:

   ```bash
   npm run dev
   ```

5. **Test the Connection**

   Open http://localhost:3000 in your browser. You should now be able to:
   - See the project setup page (if no project exists)
   - Create a new project
   - Add requirements

## Common Connection Issues

### Issue: "connection refused"

**Cause:** PostgreSQL is not running

**Solution:**
```bash
# macOS
brew services start postgresql@15

# Ubuntu
sudo systemctl start postgresql

# Check status
pg_isready
```

### Issue: "password authentication failed"

**Cause:** Incorrect username or password in connection string

**Solution:**
1. Check your PostgreSQL user password:
   ```bash
   psql -U postgres
   # If this fails, reset password:
   ```

2. Reset password if needed:
   ```bash
   psql -U postgres
   ALTER USER postgres PASSWORD 'your_new_password';
   \q
   ```

3. Update `.env.local` with correct password

### Issue: "database does not exist"

**Cause:** Database hasn't been created yet

**Solution:**
```bash
createdb req_tracker_dev
# Then run migrations
npm run db:migrate
```

### Issue: "ECONNREFUSED 127.0.0.1:5432"

**Cause:** PostgreSQL not listening on the expected port

**Solution:**
1. Check PostgreSQL is running:
   ```bash
   ps aux | grep postgres
   ```

2. Check which port it's listening on:
   ```bash
   psql -U postgres -c "SHOW port;"
   ```

3. Update connection string in `.env.local` if using a different port

### Issue: "relation does not exist"

**Cause:** Database tables haven't been created

**Solution:**
```bash
npm run db:migrate
```

## Verifying Everything Works

Run this test query to verify the database is working:

```bash
psql $POSTGRES_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"
```

Expected output:
```
  table_name
--------------
 projects
 requirements
 preferences
(3 rows)
```

## Still Having Issues?

1. **Check Environment Variable is Loaded**

   Add this to your API route temporarily to debug:
   ```typescript
   console.log('POSTGRES_URL:', process.env.POSTGRES_URL);
   ```

2. **Check Database Connection Directly**

   ```bash
   psql $POSTGRES_URL -c "SELECT 1;"
   ```

   Should return:
   ```
    ?column?
   ----------
           1
   (1 row)
   ```

3. **Check Server Logs**

   Look at the terminal where `npm run dev` is running for detailed error messages.

4. **Reset Everything**

   If all else fails, start fresh:
   ```bash
   # Stop server
   # Drop database
   dropdb req_tracker_dev

   # Recreate
   createdb req_tracker_dev

   # Run migrations
   npm run db:migrate

   # Restart server
   npm run dev
   ```

## Getting Help

If you're still stuck:
1. Check the error message in the browser console (F12)
2. Check the server logs in your terminal
3. Verify your PostgreSQL version: `psql --version` (should be 15+)
4. Check DATABASE_SETUP.md for more detailed setup instructions

## Quick Reference

**Essential Commands:**
```bash
# Check if PostgreSQL is running
pg_isready

# Connect to database
psql $POSTGRES_URL

# List databases
psql -l

# Run migrations
npm run db:migrate

# Reset database
npm run db:reset

# Start dev server
npm run dev
```

**Connection String Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Default Local Values:**
- User: `postgres`
- Host: `localhost`
- Port: `5432`
- Database: `req_tracker_dev`
