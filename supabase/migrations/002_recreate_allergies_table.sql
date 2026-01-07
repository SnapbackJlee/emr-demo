-- Drop and recreate allergies table
-- This migration drops the existing allergies table (if it exists) and creates a new one

-- Drop the table if it exists (this will also drop any dependent objects like foreign keys)
DROP TABLE IF EXISTS public.allergies CASCADE;

-- Create the allergies table with a normalized structure
CREATE TABLE public.allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    allergen_name TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')) DEFAULT 'moderate',
    reaction TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    
    -- Ensure a patient can't have duplicate allergies
    UNIQUE(patient_id, allergen_name)
);

-- Create an index on patient_id for faster lookups
CREATE INDEX idx_allergies_patient_id ON public.allergies(patient_id);

-- Create an index on allergen_name for searching
CREATE INDEX idx_allergies_allergen_name ON public.allergies(allergen_name);

-- Add a trigger to automatically update updated_at
CREATE TRIGGER allergies_updated_at
    BEFORE UPDATE ON public.allergies
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Add a comment to the table
COMMENT ON TABLE public.allergies IS 'Stores patient allergies in a normalized structure';
COMMENT ON COLUMN public.allergies.allergen_name IS 'Name of the allergen (e.g., Peanuts, Penicillin)';
COMMENT ON COLUMN public.allergies.severity IS 'Severity of the allergic reaction: mild, moderate, or severe';
COMMENT ON COLUMN public.allergies.reaction IS 'Description of the allergic reaction';

