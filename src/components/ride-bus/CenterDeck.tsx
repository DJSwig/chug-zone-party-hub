import { useCardBack } from "@/hooks/useCardBack";

interface CenterDeckProps {
  cardCount: number;
  glowColor?: string;
  isAnimating?: boolean;
}

export const CenterDeck = ({ cardCount, glowColor = "hsl(142 76% 45%)", isAnimating = false }: CenterDeckProps) => {
  const { cardBackUrl } = useCardBack();

  return (
    <div className="relative">
      {/* Glow effect */}
      <div 
        className={`absolute inset-0 rounded-xl blur-2xl opacity-50 transition-all duration-500 ${isAnimating ? 'animate-glow-pulse' : ''}`}
        style={{ backgroundColor: glowColor }}
      />
      
      {/* Deck stack */}
      <div className="relative">
        {[...Array(Math.min(3, Math.ceil(cardCount / 17)))].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-xl shadow-2xl transition-all duration-300"
            style={{
              width: '120px',
              height: '168px',
              transform: `translate(${i * 3}px, ${i * 3}px)`,
              zIndex: 3 - i,
              boxShadow: `0 ${8 + i * 4}px ${24 + i * 8}px rgba(0, 0, 0, 0.6)`,
            }}
          >
            {cardBackUrl ? (
              <img 
                src={cardBackUrl} 
                alt="Deck" 
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-accent rounded-xl flex items-center justify-center">
                <div className="text-foreground text-3xl font-bold opacity-70">♠♥♦♣</div>
              </div>
            )}
          </div>
        ))}
        
        {/* Card count */}
        <div 
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border whitespace-nowrap"
          style={{ 
            backgroundColor: `${glowColor}20`,
            borderColor: glowColor,
            color: glowColor
          }}
        >
          {cardCount} cards
        </div>
      </div>
      
      {/* Spacer for positioning */}
      <div style={{ width: '120px', height: '168px', transform: 'translate(6px, 6px)' }} />
    </div>
  );
};
