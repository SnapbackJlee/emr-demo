# Supabase Project Connection Guide

This guide will help you connect your Supabase project to this repository.

## Step 1: Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")

## Step 2: Create Environment Variables File

Create a `.env.local` file in the root of this project with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace `your-project-url-here` and `your-anon-key-here` with your actual values from Step 1.

### Quick Setup (PowerShell)

Run this command in PowerShell (replace with your actual values):

```powershell
@"
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
"@ | Out-File -FilePath .env.local -Encoding utf8
```

## Step 3: Verify Connection

After creating `.env.local`, restart your development server:

```bash
npm run dev
```

The Supabase client is already configured in `lib/supabaseClient.ts` and will automatically use these environment variables.

## Supabase CLI Setup (Already Installed ✅)

The Supabase CLI has been installed and initialized in this project. To connect it to your remote Supabase project:

### Step 1: Login to Supabase CLI

Run this command in your terminal (it will open a browser for authentication):

```bash
npx supabase login
```

Alternatively, you can use an access token:
1. Go to https://supabase.com/dashboard/account/tokens
2. Generate a new access token
3. Run: `npx supabase login --token YOUR_ACCESS_TOKEN`

### Step 2: Link Your Project

After logging in, link your local project to your remote Supabase project:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

**To find your Project Ref:**
- Look at your Supabase dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
- Or go to **Settings** → **General** → **Reference ID**

### Step 3: Push Migrations

Once linked, you can push your local migrations to the remote database:

```bash
npx supabase db push
```

### Step 4: Pull Remote Schema (Without Docker)

**Note:** The `supabase db pull` command requires Docker. If you don't have Docker installed, use one of these alternatives:

#### Option A: Using Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard → **SQL Editor**
2. Run the queries in `scripts/get-remote-schema.sql` to inspect your schema
3. Or use the **Database** → **Schema Visualizer** to see your schema
4. Manually create migration files in `supabase/migrations/` based on what you see

#### Option B: Export Schema via Dashboard

1. Go to **Database** → **Schema** in your Supabase Dashboard
2. Use the schema visualizer to understand your current structure
3. Create migration files manually to match your remote schema

#### Option C: Use pg_dump (If you have PostgreSQL client)

If you have `pg_dump` installed, you can export the schema:

```bash
# Get your database connection string from Supabase Dashboard
# Settings → Database → Connection string → URI
pg_dump -h <host> -U postgres -d postgres --schema-only --schema=public > supabase/migrations/002_remote_schema.sql
```

#### Option D: Manual Migration Creation

1. Inspect your remote database using the Supabase Dashboard
2. Create new migration files in `supabase/migrations/` with the naming pattern: `002_description.sql`, `003_description.sql`, etc.
3. Write SQL to match your remote schema
4. Push the migrations: `npx supabase db push`

### Useful CLI Commands

- `npx supabase status` - Check the status of your linked project
- `npx supabase db diff` - Generate a migration from schema changes
- `npx supabase db reset` - Reset your local database (requires Docker)
- `npx supabase start` - Start local Supabase instance (requires Docker)

## Current Database Schema

Your project expects the following tables:
- `patients` - Patient records
- `notes` - Clinical notes linked to patients

See `supabase/README.md` for migration details.

