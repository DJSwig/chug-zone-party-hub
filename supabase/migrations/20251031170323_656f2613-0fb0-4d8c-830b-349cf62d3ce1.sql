-- Create beer_pong_state table for managing game state
CREATE TABLE IF NOT EXISTS public.beer_pong_state (
  session_id UUID NOT NULL PRIMARY KEY REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'head_to_head' CHECK (mode IN ('head_to_head', 'tournament')),
  current_phase TEXT NOT NULL DEFAULT 'lobby' CHECK (current_phase IN ('lobby', 'playing', 'finished')),
  game_state JSONB NOT NULL DEFAULT '{
    "team1": {"name": "Team 1", "cups": [], "score": 0, "players": []},
    "team2": {"name": "Team 2", "cups": [], "score": 0, "players": []},
    "currentTurn": "team1",
    "shots": [],
    "settings": {
      "cupsPerSide": 10,
      "allowBounce": true,
      "allowReracks": true,
      "redemption": true
    }
  }'::jsonb,
  bracket_data JSONB DEFAULT NULL,
  current_match_index INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.beer_pong_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view beer pong state"
  ON public.beer_pong_state
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create beer pong state"
  ON public.beer_pong_state
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update beer pong state"
  ON public.beer_pong_state
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete beer pong state"
  ON public.beer_pong_state
  FOR DELETE
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_beer_pong_state_updated_at
  BEFORE UPDATE ON public.beer_pong_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.beer_pong_state;