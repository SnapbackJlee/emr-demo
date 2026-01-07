# Expected Database Schema

Based on your application code, here's what your database should have:

## Tables

### `patients` table
- `id` (uuid, primary key)
- `first_name` (text)
- `last_name` (text)
- `dob` (date, nullable)
- `status` (text) - values: "active", "discharged", "pending"
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

## Functions

### `set_updated_at()` function
- Trigger function to automatically update `updated_at` timestamp
- Already exists in migration `001_fix_updated_at_trigger.sql`

## Triggers

### `patients_updated_at` trigger
- BEFORE UPDATE trigger on `patients` table
- Calls `set_updated_at()` function

## Next Steps

1. Run the queries in `scripts/inspect-remote-schema.sql` in your Supabase Dashboard SQL Editor
2. Compare the results with the expected schema above
3. Create migration files for any missing tables, columns, or functions
4. Push migrations: `npm run supabase:push`

