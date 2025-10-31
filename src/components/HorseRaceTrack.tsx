import { Suit } from "@/types/multiplayer";
import { Progress } from "@/components/ui/progress";
import { PlayingCard } from "./PlayingCard";

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
  spades: { name: "Spades", bgColor: "bg-slate-700/30" },
  hearts: { name: "Hearts", bgColor: "bg-red-900/30" },
  diamonds: { name: "Diamonds", bgColor: "bg-red-900/30" },
  clubs: { name: "Clubs", bgColor: "bg-slate-700/30" },
};

export const HorseRaceTrack = ({ progress, finishLine = 8 }: HorseRaceTrackProps) => {
  return (
    <div className="space-y-3">
      {(Object.keys(SUIT_CONFIG) as Suit[]).map((suit) => {
        const config = SUIT_CONFIG[suit];
        const percentage = (progress[suit] / finishLine) * 100;
        
        return (
          <div key={suit} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlayingCard suit={suit} size="sm" />
                <span className="text-sm font-semibold">{config.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {progress[suit]} / {finishLine}
              </span>
            </div>
            <div className="relative">
              <Progress value={percentage} className={`h-6 ${config.bgColor}`} />
              <div 
                className="absolute top-0 transition-all duration-500 pointer-events-none"
                style={{ 
                  left: `calc(${percentage}% - 20px)`,
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              >
                {progress[suit] > 0 && (
                  <PlayingCard suit={suit} size="sm" className="shadow-xl" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
