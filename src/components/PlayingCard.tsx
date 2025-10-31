import { Suit } from "@/types/multiplayer";

interface PlayingCardProps {
  suit: Suit;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SUIT_CONFIG = {
  spades: { symbol: "♠", color: "text-gray-900", name: "A" },
  hearts: { symbol: "♥", color: "text-red-600", name: "A" },
  diamonds: { symbol: "♦", color: "text-red-600", name: "A" },
  clubs: { symbol: "♣", color: "text-gray-900", name: "A" },
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

export const PlayingCard = ({ suit, size = "md", className = "" }: PlayingCardProps) => {
  const config = SUIT_CONFIG[suit];
  
  return (
    <div
      className={`${SIZE_CLASSES[size]} bg-white rounded-lg shadow-lg flex flex-col items-center justify-center gap-1 p-2 ${className}`}
    >
      <div className={`${FONT_SIZES[size]} font-bold ${config.color} leading-none`}>
        {config.name}
      </div>
      <div className={`${FONT_SIZES[size]} ${config.color} leading-none`}>
        {config.symbol}
      </div>
    </div>
  );
};
