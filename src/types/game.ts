export interface Game {
  id: string;
  name: string;
  description: string;
  emoji: string;
  minPlayers: number;
  maxPlayers?: number;
}

export interface KingsCupRule {
  card: string;
  rule: string;
}

export interface KingsCupPreset {
  name: string;
  description: string;
  rules: KingsCupRule[];
}

export interface Player {
  id: string;
  name: string;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  drawnCards: string[];
  rules: KingsCupRule[];
}
