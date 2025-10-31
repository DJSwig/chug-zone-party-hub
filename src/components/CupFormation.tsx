import { Cup } from "@/types/beerPong";

interface CupFormationProps {
  cups: Cup[];
  side: 'left' | 'right';
  showAnimation?: boolean;
}

export const CupFormation = ({ cups, side, showAnimation = false }: CupFormationProps) => {
  return (
    <div className={`relative h-full flex items-center justify-center ${side === 'left' ? 'pr-8' : 'pl-8'}`}>
      <div className="relative w-64 h-80">
        {cups.map((cup) => (
          <div
            key={cup.id}
            className={`absolute transition-all duration-500 ${
              cup.hit 
                ? 'opacity-0 scale-0 rotate-180' 
                : 'opacity-100 scale-100 rotate-0'
            }`}
            style={{
              left: `${cup.x}%`,
              top: `${cup.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className={`relative w-14 h-14 rounded-full transition-all duration-300 ${
                showAnimation
                  ? 'border-4 border-primary bg-primary/30 animate-pulse shadow-[0_0_30px_hsl(var(--primary))] scale-110'
                  : 'border-4 border-primary/70 bg-primary/15 hover:border-primary hover:bg-primary/25 hover:scale-105 shadow-[0_0_15px_hsl(var(--primary)/0.3)]'
              }`}
            >
              {/* Inner gradient */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 via-transparent to-transparent" />
              
              {/* Shine effect */}
              <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-white/40 blur-sm" />
              
              {/* Liquid effect */}
              <div className="absolute bottom-1 inset-x-1 h-8 rounded-b-full bg-gradient-to-t from-primary/50 to-transparent" />
              
              {/* Rim highlight */}
              <div className="absolute inset-0 rounded-full border-t-2 border-white/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
