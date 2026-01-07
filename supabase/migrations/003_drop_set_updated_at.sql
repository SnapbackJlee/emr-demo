-- Drop all set_updated_at triggers and the function
-- This removes the automatic updated_at functionality to prevent recursion issues

-- Drop all triggers that use set_updated_at (drop all that exist)
DROP TRIGGER IF EXISTS patients_updated_at ON public.patients;
DROP TRIGGER IF EXISTS allergies_updated_at ON public.allergies;
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS encounters_updated_at ON public.encounters;
DROP TRIGGER IF EXISTS documents_updated_at ON public.documents;
DROP TRIGGER IF EXISTS trg_notes_updated_at ON public.notes;
DROP TRIGGER IF EXISTS staff_profiles_set_updated_at ON public.staff_profiles;

-- Drop the function (now that all triggers are dropped)
DROP FUNCTION IF EXISTS set_updated_at();

