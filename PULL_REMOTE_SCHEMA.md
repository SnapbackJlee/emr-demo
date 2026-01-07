# Pull Remote Schema - Step by Step Guide

This guide will help you inspect your remote Supabase database schema and create migration files.

## Step 1: Open Supabase Dashboard SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New query**

## Step 2: Run Schema Inspection Queries

Copy and paste the queries from `scripts/get-remote-schema.sql` one at a time, or run them all together.

### Quick Schema Overview

Run this first to see all your tables:

```sql
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

## Step 3: Get Full Schema Details

Run the complete query set from `scripts/get-remote-schema.sql` to get:
- All tables
- All columns with data types
- Foreign key relationships
- Functions
- Triggers

## Step 4: Create Migration Files

Based on the results, create migration files in `supabase/migrations/`:

1. Review the schema information from the queries
2. Create a new migration file (e.g., `002_remote_schema.sql`)
3. Write CREATE statements for any tables/functions/triggers that don't exist locally
4. Save the file

## Step 5: Push Migrations

Once you've created the migration files:

```bash
npm run supabase:push
```

This will apply your migrations to keep local and remote in sync.

## Alternative: Export Full Schema

If you want the complete schema dump, you can also:

1. Go to **Database** → **Schema** in Supabase Dashboard
2. Use the visual schema viewer to understand your structure
3. Or use **Database** → **Connection string** to get connection details for `pg_dump` (if you have PostgreSQL client tools)

