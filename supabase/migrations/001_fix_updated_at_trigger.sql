-- Fix the set_updated_at function to prevent recursion
-- This function is called by the BEFORE UPDATE trigger on patients table

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only update updated_at if it's not already being set
  -- This prevents infinite loops
  IF NEW.updated_at IS DISTINCT FROM OLD.updated_at THEN
    -- updated_at is being explicitly changed, don't override it
    RETURN NEW;
  END IF;
  
  -- Set updated_at to current timestamp
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Ensure the trigger is set up correctly
DROP TRIGGER IF EXISTS patients_updated_at ON public.patients;

CREATE TRIGGER patients_updated_at 
BEFORE UPDATE ON public.patients 
FOR EACH ROW 
EXECUTE FUNCTION set_updated_at();

