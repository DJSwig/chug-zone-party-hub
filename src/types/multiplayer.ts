export interface GameSession {
  id: string;
  join_code: string;
  game_type: string;
  host_name: string;
  status: 'waiting' | 'active' | 'finished';
  created_at: string;
  updated_at: string;
}

export interface SessionPlayer {
  id: string;
  session_id: string;
  player_name: string;
  player_data: any;
  joined_at: string;
}

export interface HorseRaceBet {
  player_id: string;
  player_name: string;
  suit: 'spades' | 'hearts' | 'diamonds' | 'clubs';
  amount: number;
  locked?: boolean;
}

export interface HorseRaceState {
  session_id: string;
  current_phase: 'betting' | 'racing' | 'finished';
  bets: HorseRaceBet[];
  race_progress: {
    spades: number;
    hearts: number;
    diamonds: number;
    clubs: number;
  };
  odds: {
    spades: number;
    hearts: number;
    diamonds: number;
    clubs: number;
  };
  drawn_cards: string[];
  winner: string | null;
  updated_at: string;
}

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export interface RideBusPlayerCards {
  player_id: string;
  player_name: string;
  cards: string[];
  drinks_given: number;
  drinks_taken: number;
}

export interface RideBusChoice {
  player_id: string;
  player_name: string;
  choice: string;
  result?: 'correct' | 'wrong';
  card?: string;
}

export interface RideBusState {
  session_id: string;
  current_phase: 'round1' | 'round2' | 'round3' | 'round4' | 'bus' | 'finished';
  current_round: number;
  current_player_index: number;
  player_cards: RideBusPlayerCards[];
  bus_cards: string[];
  flipped_bus_cards: number;
  choices: RideBusChoice[];
  updated_at: string;
}
