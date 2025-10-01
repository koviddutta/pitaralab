-- Fix security linter warnings from previous migration

-- Fix 1: Remove SECURITY DEFINER from view (it's not needed and triggers warning)
-- Re-create view as regular view (without SECURITY DEFINER)
DROP VIEW IF EXISTS public.ingredients_public;

CREATE VIEW public.ingredients_public 
WITH (security_invoker = true)  -- Use caller's permissions, not creator's
AS
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
FROM public.ingredients;

-- Re-grant permissions
GRANT SELECT ON public.ingredients_public TO anon;
GRANT SELECT ON public.ingredients_public TO authenticated;

-- Fix 2: Update function to have immutable search_path
DROP FUNCTION IF EXISTS public.log_ingredient_access() CASCADE;

CREATE OR REPLACE FUNCTION public.log_ingredient_access()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- Fixed: explicit search_path
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.ingredient_access_log (user_id, ingredient_id, action)
    VALUES (auth.uid(), NEW.id, TG_OP);
  END IF;
  RETURN NEW;
END;
$$;

-- Re-apply trigger
DROP TRIGGER IF EXISTS log_ingredient_access_trigger ON public.ingredients;

CREATE TRIGGER log_ingredient_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.ingredients
  FOR EACH ROW
  EXECUTE FUNCTION public.log_ingredient_access();

COMMENT ON VIEW public.ingredients_public IS 'Public view of ingredients without sensitive cost data. Uses security_invoker to respect caller permissions.';
COMMENT ON FUNCTION public.log_ingredient_access IS 'Audit logging function with secure search_path to prevent injection attacks.';