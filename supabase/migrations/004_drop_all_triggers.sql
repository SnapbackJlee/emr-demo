-- Drop all triggers from the database
-- This removes all trigger-based functionality

-- Drop triggers on patients table
DROP TRIGGER IF EXISTS patients_updated_at ON public.patients;

-- Drop triggers on allergies table
DROP TRIGGER IF EXISTS allergies_updated_at ON public.allergies;

-- Drop triggers on notes table
DROP TRIGGER IF EXISTS trg_notes_updated_at ON public.notes;

-- Drop triggers on profiles table
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;

-- Drop triggers on encounters table
DROP TRIGGER IF EXISTS encounters_updated_at ON public.encounters;

-- Drop triggers on documents table
DROP TRIGGER IF EXISTS documents_updated_at ON public.documents;

-- Drop triggers on staff_profiles table
DROP TRIGGER IF EXISTS staff_profiles_set_updated_at ON public.staff_profiles;

-- Drop any other triggers that might exist
-- This uses a dynamic approach to find and drop all triggers
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT trigger_name, event_object_table, event_object_schema
        FROM information_schema.triggers
        WHERE event_object_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I CASCADE',
            r.trigger_name,
            r.event_object_schema,
            r.event_object_table
        );
    END LOOP;
END $$;

