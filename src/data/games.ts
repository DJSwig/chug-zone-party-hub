import { Game } from "@/types/game";
import kingsCupThumb from "@/assets/kings-cup-thumb.jpg";

export const games: Game[] = [
  {
    id: "kings-cup",
    name: "King's Cup",
    description: "The classic card-based drinking game with customizable rules",
    thumbnail: kingsCupThumb,
    minPlayers: 2,
    maxPlayers: 12,
  },
  // More games coming soon!
];
