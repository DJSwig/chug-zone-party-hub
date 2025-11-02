import { Suit } from "@/types/multiplayer";
import { useCardBack } from "@/hooks/useCardBack";

interface PlayingCardProps {
  suit: Suit;
  rank?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  faceDown?: boolean;
}

const SUIT_CONFIG = {
  spades: { symbol: "♠", color: "text-foreground" },
  hearts: { symbol: "♥", color: "text-primary" },
  diamonds: { symbol: "♦", color: "text-primary" },
  clubs: { symbol: "♣", color: "text-foreground" },
};

const SIZE_CLASSES = {
  sm: "w-10 h-14",
  md: "w-16 h-24",
  lg: "w-20 h-28",
};

const FONT_SIZES = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-4xl",
};

export const PlayingCard = ({ suit, rank = "A", size = "md", className = "", faceDown = false }: PlayingCardProps) => {
  const config = SUIT_CONFIG[suit];
  const { cardBackUrl } = useCardBack();
  
  if (faceDown) {
    return (
      <div
        className={`${SIZE_CLASSES[size]} rounded-lg shadow-lg overflow-hidden ${className}`}
      >
        {cardBackUrl ? (
          <img 
            src={cardBackUrl} 
            alt="Card back" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
            <div className="text-foreground text-2xl font-bold opacity-70">♠♥♦♣</div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div
      className={`${SIZE_CLASSES[size]} bg-card rounded-lg shadow-lg flex flex-col items-center justify-center gap-1 p-2 ${className}`}
    >
      <div className={`${FONT_SIZES[size]} font-bold ${config.color} leading-none`}>
        {rank}
      </div>
      <div className={`${FONT_SIZES[size]} ${config.color} leading-none`}>
        {config.symbol}
      </div>
    </div>
  );
};
