import { PlayingCard } from "@/components/PlayingCard";
import { Suit } from "@/types/multiplayer";

interface RideBusCardProps {
  card: string; // Format: "A-spades" or "10-hearts"
  size?: "sm" | "md" | "lg";
  className?: string;
  faceDown?: boolean;
}

export const RideBusCard = ({ card, size = "sm", className = "", faceDown = false }: RideBusCardProps) => {
  // Parse card string format: "rank-suit"
  const [rank, suitStr] = card.split("-");
  const suit = suitStr as Suit;
  
  return (
    <PlayingCard 
      suit={suit} 
      size={size} 
      className={className} 
      faceDown={faceDown} 
    />
  );
};
