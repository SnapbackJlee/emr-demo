# Supabase Database Migrations

This directory contains SQL migration files for your Supabase database.

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste the contents of the migration file
5. Click **Run**

### Option 2: Supabase CLI
If you have the Supabase CLI installed:
```bash
supabase db push
```

## Migration Files

### 001_fix_updated_at_trigger.sql
Fixes the `set_updated_at()` function to prevent infinite recursion when updating the `patients` table. This resolves the "stack depth limit exceeded" error.

## Current Schema

Based on your code, your database should have:

### `patients` table
- `id` (uuid, primary key)
- `first_name` (text)
- `last_name` (text)
- `dob` (date, nullable)
- `status` (text)
- `allergies` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp, nullable)

### `notes` table
- `id` (uuid, primary key)
- `patient_id` (uuid, foreign key to patients.id)
- `note_text` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp, nullable)
- `signed_at` (timestamp, nullable)

