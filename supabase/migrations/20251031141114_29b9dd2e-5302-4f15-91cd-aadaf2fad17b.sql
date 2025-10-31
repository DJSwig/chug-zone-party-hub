-- Update page_notes policies to only allow owner to view all notes
DROP POLICY IF EXISTS "Admins can view all notes" ON public.page_notes;

CREATE POLICY "Owner can view all notes"
  ON public.page_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.discord_id = '954112814379839548'
    )
  );

-- Create storage bucket for card backs
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-backs', 'card-backs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for card backs
CREATE POLICY "Anyone can view card backs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'card-backs');

CREATE POLICY "Authenticated users can upload card backs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'card-backs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own card backs"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'card-backs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own card backs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'card-backs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );