import { useEffect, useState } from "react";
import { Suit } from "@/types/multiplayer";
import { PlayingCard } from "./PlayingCard";

interface AnimatedDeckProps {
  drawnCards: string[];
  isRacing: boolean;
}

export const AnimatedDeck = ({ drawnCards, isRacing }: AnimatedDeckProps) => {
  const [currentCard, setCurrentCard] = useState<Suit | null>(null);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (drawnCards.length === 0) return;
    
    const latestCard = drawnCards[drawnCards.length - 1] as Suit;
    setCurrentCard(latestCard);
    setShowCard(true);

    const timer = setTimeout(() => {
      setShowCard(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [drawnCards]);

  return (
    <div className="relative flex items-center justify-center h-32">
      {/* Deck Stack */}
      <div className="relative">
        <div className="absolute inset-0 w-20 h-28 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-xl border-2 border-blue-400 transform translate-x-1 translate-y-1" />
        <div className="absolute inset-0 w-20 h-28 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-xl border-2 border-blue-400 transform translate-x-0.5 translate-y-0.5" />
        <div className="w-20 h-28 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-xl border-2 border-blue-400 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="text-white text-xs font-bold text-center">
            CHUG<br/>ZONE
          </div>
        </div>
      </div>

      {/* Drawn Card Animation */}
      {currentCard && showCard && (
        <div className="absolute left-1/2 -translate-x-1/2 animate-card-draw">
          <PlayingCard suit={currentCard} size="lg" className="shadow-2xl" />
        </div>
      )}

      {/* Card Count */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
        {drawnCards.length} drawn
      </div>
    </div>
  );
};
