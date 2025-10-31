import { Cup } from "@/types/beerPong";

interface CupFormationProps {
  cups: Cup[];
  side: 'left' | 'right';
  showAnimation?: boolean;
}

export const CupFormation = ({ cups, side, showAnimation = false }: CupFormationProps) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <div className="relative" style={{ width: '300px', height: '400px' }}>
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
              className={`relative transition-all duration-300 ${
                showAnimation
                  ? 'w-16 h-16 animate-pulse shadow-[0_0_40px_hsl(var(--primary))] scale-125'
                  : 'w-14 h-14 hover:scale-110 shadow-[0_0_20px_hsl(var(--primary)/0.3)]'
              }`}
            >
              {/* Red cup body */}
              <div className="relative w-full h-full rounded-t-lg">
                {/* Main cup color - bright red like iMessage */}
                <div className={`absolute inset-0 rounded-t-lg ${
                  showAnimation 
                    ? 'bg-red-500 border-4 border-red-600' 
                    : 'bg-red-500 border-2 border-red-600'
                }`}>
                  {/* Top rim white highlight */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-white/30 rounded-t-lg" />
                  
                  {/* Middle white line */}
                  <div className="absolute top-1/3 left-0 right-0 h-1 bg-white/40" />
                  
                  {/* Shine effect on left side */}
                  <div className="absolute top-2 left-1 w-1 h-8 bg-white/50 rounded-full blur-[1px]" />
                  
                  {/* Shadow inside cup */}
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-red-900/40 to-transparent" />
                </div>
                
                {/* Bottom base */}
                <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-3 ${
                  showAnimation 
                    ? 'bg-red-600 border-2 border-red-700' 
                    : 'bg-red-600 border border-red-700'
                } rounded-b-full`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
