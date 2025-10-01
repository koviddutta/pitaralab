-- Ensure recipes table has no public access
-- First, revoke any default table-level permissions
REVOKE ALL ON public.recipes FROM anon;
REVOKE ALL ON public.recipes FROM authenticated;

-- Grant only necessary permissions back to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipes TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they're properly configured
DROP POLICY IF EXISTS "Authenticated users can read all recipes" ON public.recipes;
DROP POLICY IF EXISTS "Authenticated users can insert recipes" ON public.recipes;
DROP POLICY IF EXISTS "Authenticated users can update recipes" ON public.recipes;
DROP POLICY IF EXISTS "Authenticated users can delete recipes" ON public.recipes;

-- Recreate policies with explicit role restrictions
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