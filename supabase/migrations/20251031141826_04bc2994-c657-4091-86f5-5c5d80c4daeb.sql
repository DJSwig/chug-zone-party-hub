-- Fix customizations RLS policies to allow upserts
DROP POLICY IF EXISTS "Users can insert their own customizations" ON public.customizations;
DROP POLICY IF EXISTS "Users can update their own customizations" ON public.customizations;

CREATE POLICY "Users can insert their own customizations"
  ON public.customizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customizations"
  ON public.customizations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);