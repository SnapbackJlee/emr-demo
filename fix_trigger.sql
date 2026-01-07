-- First, let's check what the current function does
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'set_updated_at';

-- If the function is causing recursion, replace it with this safe version:
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only update if updated_at is actually being changed
  -- This prevents infinite loops
  IF NEW.updated_at IS DISTINCT FROM OLD.updated_at THEN
    -- Don't update, just return
    RETURN NEW;
  END IF;
  
  -- Set updated_at to current timestamp
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- The trigger should already be correct, but let's verify it's BEFORE UPDATE:
-- If you need to recreate it:
DROP TRIGGER IF EXISTS patients_updated_at ON public.patients;

CREATE TRIGGER patients_updated_at 
BEFORE UPDATE ON public.patients 
FOR EACH ROW 
EXECUTE FUNCTION set_updated_at();

