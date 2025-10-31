import { useEffect, useState } from "react";
import { Suit } from "@/types/multiplayer";
import { PlayingCard } from "./PlayingCard";
import { useCardBack } from "@/hooks/useCardBack";

interface AnimatedDeckProps {
  drawnCards: string[];
  isRacing: boolean;
}

export const AnimatedDeck = ({ drawnCards, isRacing }: AnimatedDeckProps) => {
  const [currentCard, setCurrentCard] = useState<Suit | null>(null);
  const [showCard, setShowCard] = useState(false);
  const { cardBackUrl } = useCardBack();

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
        <div className="absolute inset-0 w-20 h-28 rounded-lg shadow-xl transform translate-x-1 translate-y-1 overflow-hidden">
          {cardBackUrl ? (
            <img src={cardBackUrl} alt="Card back" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-accent" />
          )}
        </div>
        <div className="absolute inset-0 w-20 h-28 rounded-lg shadow-xl transform translate-x-0.5 translate-y-0.5 overflow-hidden">
          {cardBackUrl ? (
            <img src={cardBackUrl} alt="Card back" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-accent" />
          )}
        </div>
        <div className="w-20 h-28 rounded-lg shadow-xl flex items-center justify-center relative overflow-hidden">
          {cardBackUrl ? (
            <img src={cardBackUrl} alt="Card back" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
              <div className="text-foreground text-xs font-bold text-center z-10">
                CHUG<br/>ZONE
              </div>
            </div>
          )}
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
