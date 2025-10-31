-- Create table to manage game visibility
CREATE TABLE IF NOT EXISTS public.game_configs (
  game_id TEXT PRIMARY KEY,
  hidden BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.game_configs ENABLE ROW LEVEL SECURITY;

-- Everyone can read configs
CREATE POLICY "Anyone can view game configs"
  ON public.game_configs
  FOR SELECT
  USING (true);

-- Only owner can insert/update/delete (based on owner Discord id pattern used elsewhere)
CREATE POLICY "Only owner can insert game configs"
  ON public.game_configs
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.discord_id = '954112814379839548'
  ));

CREATE POLICY "Only owner can update game configs"
  ON public.game_configs
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.discord_id = '954112814379839548'
  ));

CREATE POLICY "Only owner can delete game configs"
  ON public.game_configs
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.discord_id = '954112814379839548'
  ));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_configs;