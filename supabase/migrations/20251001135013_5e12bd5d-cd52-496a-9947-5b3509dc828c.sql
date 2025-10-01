-- Make public access to ingredients_public view explicit
-- Views cannot have RLS policies, but we can grant explicit permissions

-- Grant public read access to the ingredients_public view
GRANT SELECT ON public.ingredients_public TO anon;
GRANT SELECT ON public.ingredients_public TO authenticated;

COMMENT ON VIEW public.ingredients_public IS 
  'Public view that exposes only non-sensitive ingredient data (excludes cost_per_kg). Intentionally accessible to anonymous users for calculator functionality. Uses security_invoker=true to respect caller permissions on underlying ingredients table.';