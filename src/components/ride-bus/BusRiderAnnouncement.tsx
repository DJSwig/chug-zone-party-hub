import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface BusRiderAnnouncementProps {
  playerName: string;
  playerColor: string;
  matchCount: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const BusRiderAnnouncement = ({ 
  playerName, 
  playerColor, 
  matchCount,
  onPlayAgain, 
  onBackToMenu 
}: BusRiderAnnouncementProps) => {
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center animate-scale-in">
      <div className="text-center max-w-2xl px-8">
        {/* Animated bus */}
        <div className="mb-8 relative">
          <div className="text-9xl animate-shot-bounce">🚍</div>
          <div 
            className="absolute inset-0 blur-3xl opacity-50 animate-glow-pulse"
            style={{ backgroundColor: playerColor }}
          />
        </div>

        {/* Player name */}
        <div className="mb-6">
          <h2 
            className="text-6xl font-bold mb-3 animate-text-glow"
            style={{ color: playerColor }}
          >
            {playerName}
          </h2>
          <h3 className="text-4xl font-bold text-foreground mb-2">
            RIDES THE BUS!
          </h3>
        </div>

        {/* Stats */}
        <div 
          className="inline-block px-6 py-3 rounded-xl mb-4 border-2"
          style={{ 
            backgroundColor: `${playerColor}20`,
            borderColor: playerColor,
            color: playerColor
          }}
        >
          <p className="text-lg font-bold">
            Most Matches: {matchCount} cards
          </p>
        </div>

        <div 
          className="inline-block px-8 py-4 rounded-xl text-3xl font-bold mb-10"
          style={{ 
            backgroundColor: `${playerColor}15`,
            border: `3px solid ${playerColor}`,
            color: playerColor,
            boxShadow: `0 0 40px ${playerColor}40`
          }}
        >
          Take 5 Drinks! 🍻
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <Button
            onClick={onPlayAgain}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-xl shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
          >
            <RotateCcw className="w-6 h-6 mr-2" />
            Play Again
          </Button>
          <Button
            onClick={onBackToMenu}
            variant="outline"
            size="lg"
            className="w-full border-2 border-secondary text-secondary hover:bg-secondary/10 font-bold py-6 text-xl"
          >
            Back to Menu
          </Button>
        </div>
      </div>
    </div>
  );
};
