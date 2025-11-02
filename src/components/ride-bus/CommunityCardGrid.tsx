import { Button } from "@/components/ui/button";
import { RideBusCard } from "@/components/RideBusCard";

interface CommunityCardGridProps {
  cards: string[];
  flippedCount: number;
  onFlipNext: () => void;
}

export const CommunityCardGrid = ({ cards, flippedCount, onFlipNext }: CommunityCardGridProps) => {
  return (
    <div className="flex flex-col items-center gap-6 animate-scale-in">
      <div className="text-center mb-2">
        <h3 className="text-3xl font-bold text-foreground mb-2">Community Cards</h3>
        <p className="text-muted-foreground">Match your cards to give or take drinks!</p>
      </div>

      {/* Top row - 4 cards */}
      <div className="flex gap-3">
        {cards.slice(0, 4).map((card, idx) => (
          <div 
            key={idx}
            className={`transition-all duration-500 ${
              idx === flippedCount && idx < 4 ? 'animate-card-flip' : ''
            } ${idx < flippedCount ? 'opacity-100' : 'opacity-90'}`}
          >
            <RideBusCard 
              card={card} 
              size="md" 
              faceDown={idx >= flippedCount}
            />
          </div>
        ))}
      </div>

      {/* Bottom row - 4 cards */}
      <div className="flex gap-3">
        {cards.slice(4, 8).map((card, idx) => (
          <div 
            key={idx + 4}
            className={`transition-all duration-500 ${
              idx + 4 === flippedCount ? 'animate-card-flip' : ''
            } ${idx + 4 < flippedCount ? 'opacity-100' : 'opacity-90'}`}
          >
            <RideBusCard 
              card={card} 
              size="md" 
              faceDown={idx + 4 >= flippedCount}
            />
          </div>
        ))}
      </div>

      <Button
        onClick={onFlipNext}
        disabled={flippedCount >= cards.length}
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 text-xl animate-button-pulse shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
      >
        {flippedCount >= cards.length ? "Determine Bus Rider" : `Flip Card ${flippedCount + 1}/8`}
      </Button>
    </div>
  );
};
