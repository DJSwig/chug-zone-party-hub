-- Create ride_bus_state table for Ride the Bus game
CREATE TABLE IF NOT EXISTS public.ride_bus_state (
  session_id UUID NOT NULL PRIMARY KEY REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  current_phase TEXT NOT NULL DEFAULT 'round1',
  current_round INTEGER NOT NULL DEFAULT 1,
  current_player_index INTEGER NOT NULL DEFAULT 0,
  player_cards JSONB DEFAULT '[]'::jsonb,
  bus_cards JSONB DEFAULT '[]'::jsonb,
  flipped_bus_cards INTEGER DEFAULT 0,
  choices JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ride_bus_state ENABLE ROW LEVEL SECURITY;

-- Create policies for ride_bus_state
CREATE POLICY "Anyone can view ride bus state"
  ON public.ride_bus_state
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create ride bus state"
  ON public.ride_bus_state
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update ride bus state"
  ON public.ride_bus_state
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete ride bus state"
  ON public.ride_bus_state
  FOR DELETE
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_bus_state;