-- Drop the existing public access policy
DROP POLICY IF EXISTS "Allow public access to batches" ON public.batches;

-- Add policies for authenticated users only
CREATE POLICY "Authenticated users can read all batches"
ON public.batches
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert batches"
ON public.batches
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update batches"
ON public.batches
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete batches"
ON public.batches
FOR DELETE
TO authenticated
USING (true);