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
            className={`absolute transition-all duration-300 ${
              cup.hit ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
            }`}
            style={{
              left: `${cup.x}%`,
              top: `${cup.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className={`w-12 h-12 rounded-full border-4 transition-all ${
                showAnimation
                  ? 'border-primary bg-primary/20 animate-pulse shadow-glow-cyan'
                  : 'border-primary/60 bg-primary/10'
              }`}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-transparent" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
