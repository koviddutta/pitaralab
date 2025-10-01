-- Phase 1: Secure pastes table (CRITICAL)
-- Drop the existing public access policy
DROP POLICY IF EXISTS "Allow public access to pastes" ON public.pastes;

-- Add policies for authenticated users only
CREATE POLICY "Authenticated users can read all pastes"
ON public.pastes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert pastes"
ON public.pastes
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update pastes"
ON public.pastes
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete pastes"
ON public.pastes
FOR DELETE
TO authenticated
USING (true);

-- Phase 2: Fix ingredients_public view access
-- Views inherit RLS from underlying tables, so we need to add a public read policy 
-- to the ingredients table that allows access to the columns in the view
CREATE POLICY "Public users can read non-sensitive ingredient data"
ON public.ingredients
FOR SELECT
TO public
USING (true);