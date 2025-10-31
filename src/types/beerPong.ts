export interface Cup {
  id: string;
  x: number;
  y: number;
  hit: boolean;
}

export interface Team {
  name: string;
  cups: Cup[];
  score: number;
  players: string[];
}

export interface Shot {
  playerId: string;
  playerName: string;
  power: number;
  angle: number;
  hit: boolean;
  timestamp: number;
}

export interface GameSettings {
  cupsPerSide: number;
  allowBounce: boolean;
  allowReracks: boolean;
  redemption: boolean;
}

export interface BracketMatch {
  id: string;
  round: number;
  team1: string | null;
  team2: string | null;
  winner: string | null;
  score: { team1: number; team2: number } | null;
}

export interface BeerPongState {
  session_id: string;
  mode: 'head_to_head' | 'tournament';
  current_phase: 'lobby' | 'playing' | 'finished';
  game_state: {
    team1: Team;
    team2: Team;
    currentTurn: 'team1' | 'team2';
    shots: Shot[];
    settings: GameSettings;
  };
  bracket_data: {
    matches: BracketMatch[];
    currentRound: number;
    champion: string | null;
  } | null;
  current_match_index: number;
  updated_at: string;
}
