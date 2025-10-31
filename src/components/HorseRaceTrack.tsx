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
    <div className="space-y-2.5">
      {(Object.keys(SUIT_CONFIG) as Suit[]).map((suit) => {
        const config = SUIT_CONFIG[suit];
        const percentage = Math.min((progress[suit] / finishLine) * 100, 100);
        
        return (
          <div key={suit} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlayingCard suit={suit} size="sm" />
                <span className="text-xs font-semibold">{config.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {progress[suit]} / {finishLine}
              </span>
            </div>
            <div className="relative w-full overflow-hidden">
              <Progress value={percentage} className={`h-5 ${config.bgColor} w-full`} />
              {progress[suit] > 0 && (
                <div 
                  className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 pointer-events-none"
                  style={{ 
                    left: `calc(${Math.max(5, Math.min(percentage, 95))}% - 20px)`,
                  }}
                >
                  <PlayingCard suit={suit} size="sm" className="shadow-xl scale-90" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
