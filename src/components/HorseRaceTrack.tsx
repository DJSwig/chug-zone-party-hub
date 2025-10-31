import { Suit } from "@/types/multiplayer";
import { Progress } from "@/components/ui/progress";

interface HorseRaceTrackProps {
  progress: {
    spades: number;
    hearts: number;
    diamonds: number;
    clubs: number;
  };
  finishLine?: number;
}

const SUIT_CONFIG = {
  spades: { emoji: "♠️", name: "Spades", color: "text-foreground" },
  hearts: { emoji: "♥️", name: "Hearts", color: "text-red-500" },
  diamonds: { emoji: "♦️", name: "Diamonds", color: "text-red-500" },
  clubs: { emoji: "♣️", name: "Clubs", color: "text-foreground" },
};

export const HorseRaceTrack = ({ progress, finishLine = 8 }: HorseRaceTrackProps) => {
  return (
    <div className="space-y-4">
      {(Object.keys(SUIT_CONFIG) as Suit[]).map((suit) => {
        const config = SUIT_CONFIG[suit];
        const percentage = (progress[suit] / finishLine) * 100;
        
        return (
          <div key={suit} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-3xl ${config.color}`}>{config.emoji}</span>
                <span className="text-lg font-semibold">{config.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {progress[suit]} / {finishLine}
              </span>
            </div>
            <div className="relative">
              <Progress value={percentage} className="h-8" />
              <div 
                className="absolute top-0 text-2xl transition-all duration-500"
                style={{ 
                  left: `calc(${percentage}% - 16px)`,
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              >
                {config.emoji}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
