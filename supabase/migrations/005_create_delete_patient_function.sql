-- Create a function to safely delete a patient and all related records
-- This avoids any potential recursion issues

CREATE OR REPLACE FUNCTION delete_patient(patient_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete in order: notes, allergies, then patient
  -- Using explicit deletes to avoid any cascade recursion issues
  
  DELETE FROM public.notes WHERE patient_id = patient_uuid;
  DELETE FROM public.allergies WHERE patient_id = patient_uuid;
  DELETE FROM public.patients WHERE id = patient_uuid;
END;
$$;

