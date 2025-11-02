import { Game } from "@/types/game";

export const games: Game[] = [
  {
    id: "kings-cup",
    name: "King's Cup",
    description: "The classic card-based drinking game with customizable rules",
    emoji: "👑♣️",
    minPlayers: 2,
    maxPlayers: 12,
  },
  {
    id: "horse-race",
    name: "Horse Race",
    description: "Bet on suits, watch the race unfold, and dish out drinks!",
    emoji: "🐎🏁",
    minPlayers: 2,
    maxPlayers: 20,
  },
  {
    id: "beer-pong",
    name: "Beer Pong",
    description: "Classic beer pong with phone controllers and tournament brackets!",
    emoji: "🏓🍺",
    minPlayers: 2,
    maxPlayers: 16,
  },
];
