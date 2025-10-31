-- Create game sessions table
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  join_code TEXT NOT NULL UNIQUE,
  game_type TEXT NOT NULL,
  host_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_status CHECK (status IN ('waiting', 'active', 'finished'))
);

-- Create session players table
CREATE TABLE public.session_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  player_data JSONB DEFAULT '{}'::jsonb,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create horse race state table
CREATE TABLE public.horse_race_state (
  session_id UUID NOT NULL PRIMARY KEY REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  current_phase TEXT NOT NULL DEFAULT 'betting',
  bets JSONB DEFAULT '[]'::jsonb,
  race_progress JSONB DEFAULT '{"spades": 0, "hearts": 0, "diamonds": 0, "clubs": 0}'::jsonb,
  odds JSONB DEFAULT '{"spades": 4, "hearts": 3, "diamonds": 2, "clubs": 1}'::jsonb,
  drawn_cards TEXT[] DEFAULT ARRAY[]::TEXT[],
  winner TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_phase CHECK (current_phase IN ('betting', 'racing', 'finished'))
);

-- Enable RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horse_race_state ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for casual game sessions)
CREATE POLICY "Anyone can view game sessions"
  ON public.game_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create game sessions"
  ON public.game_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update game sessions"
  ON public.game_sessions FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete game sessions"
  ON public.game_sessions FOR DELETE
  USING (true);

CREATE POLICY "Anyone can view session players"
  ON public.session_players FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join sessions"
  ON public.session_players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update session players"
  ON public.session_players FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can remove session players"
  ON public.session_players FOR DELETE
  USING (true);

CREATE POLICY "Anyone can view race state"
  ON public.horse_race_state FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create race state"
  ON public.horse_race_state FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update race state"
  ON public.horse_race_state FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete race state"
  ON public.horse_race_state FOR DELETE
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.horse_race_state;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON public.game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_horse_race_state_updated_at
  BEFORE UPDATE ON public.horse_race_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();