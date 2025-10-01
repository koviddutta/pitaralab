-- Secure recipes table from public access
-- Currently: Anyone can read/modify all recipe formulations (security risk!)
-- After: Only authenticated users can access recipes

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Allow public access to recipes" ON public.recipes;

-- Enable RLS (should already be enabled, but ensuring)
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Create authenticated-only policies for recipes
CREATE POLICY "Authenticated users can read all recipes"
  ON public.recipes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert recipes"
  ON public.recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update recipes"
  ON public.recipes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete recipes"
  ON public.recipes
  FOR DELETE
  TO authenticated
  USING (true);

COMMENT ON TABLE public.recipes IS 
  'Proprietary recipe formulations - restricted to authenticated users only. Contains trade secrets including ingredient ratios, product metrics, and formulation details.';