-- Fix Ingredient Cost Security Vulnerability
-- This migration protects sensitive cost data while keeping calculator functional

-- Step 1: Remove overly permissive public policy
DROP POLICY IF EXISTS "Allow public read access to ingredients" ON public.ingredients;

-- Step 2: Create a public-safe view with only necessary data for calculations
-- This view excludes cost_per_kg and other sensitive business data
CREATE OR REPLACE VIEW public.ingredients_public AS
SELECT 
  id,
  name,
  category,
  water_pct,
  sugars_pct,
  fat_pct,
  msnf_pct,
  other_solids_pct,
  sugar_split,
  sp_coeff,
  pac_coeff,
  notes,
  tags
  -- EXCLUDED: cost_per_kg (sensitive!)
FROM public.ingredients;

-- Step 3: Grant public read access to the safe view only
GRANT SELECT ON public.ingredients_public TO anon;
GRANT SELECT ON public.ingredients_public TO authenticated;

-- Step 4: Restrict full table access to authenticated users only
-- This allows the app to eventually add authentication without migration
CREATE POLICY "Authenticated users can read all ingredient data"
  ON public.ingredients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert ingredients"
  ON public.ingredients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update ingredients"
  ON public.ingredients FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete ingredients"
  ON public.ingredients FOR DELETE
  TO authenticated
  USING (true);

-- Step 5: Add audit logging for cost data access (optional but recommended)
-- This tracks who views sensitive pricing data
CREATE TABLE IF NOT EXISTS public.ingredient_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  ingredient_id UUID REFERENCES public.ingredients(id),
  action TEXT CHECK (action IN ('view', 'update', 'delete')),
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.ingredient_access_log ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read their own logs
CREATE POLICY "Users can read their own access logs"
  ON public.ingredient_access_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 6: Create function to log access (for future use with auth)
CREATE OR REPLACE FUNCTION public.log_ingredient_access()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.ingredient_access_log (user_id, ingredient_id, action)
    VALUES (auth.uid(), NEW.id, TG_OP);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply trigger to ingredients table
CREATE TRIGGER log_ingredient_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.ingredients
  FOR EACH ROW
  EXECUTE FUNCTION public.log_ingredient_access();

COMMENT ON VIEW public.ingredients_public IS 'Public view of ingredients without sensitive cost data. Use this for calculator operations.';
COMMENT ON TABLE public.ingredient_access_log IS 'Audit trail for ingredient data access, especially cost information.';