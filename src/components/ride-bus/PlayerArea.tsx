import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RideBusCard } from "@/components/RideBusCard";

interface PlayerAreaProps {
  name: string;
  color: string;
  cards: string[];
  isActive?: boolean;
  position?: "top" | "right" | "bottom" | "left";
}

export const PlayerArea = ({ name, color, cards, isActive = false, position = "bottom" }: PlayerAreaProps) => {
  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "flex-col items-center";
      case "right":
        return "flex-row-reverse items-center";
      case "bottom":
        return "flex-col-reverse items-center";
      case "left":
        return "flex-row items-center";
      default:
        return "flex-col-reverse items-center";
    }
  };

  const getCardContainerClasses = () => {
    switch (position) {
      case "top":
      case "bottom":
        return "flex-row";
      case "left":
      case "right":
        return "flex-col";
      default:
        return "flex-row";
    }
  };

  return (
    <div 
      className={`flex gap-3 p-4 rounded-xl transition-all duration-300 ${getPositionClasses()} ${
        isActive ? 'scale-110 z-20' : 'scale-100 z-10'
      }`}
      style={{
        backgroundColor: isActive ? `${color}15` : 'transparent',
        border: isActive ? `2px solid ${color}` : '2px solid transparent',
        boxShadow: isActive ? `0 0 30px ${color}40` : 'none',
      }}
    >
      {/* Player info */}
      <div className="flex flex-col items-center gap-2 min-w-[80px]">
        <div className="relative">
          <Avatar className="w-12 h-12 border-2" style={{ borderColor: isActive ? color : 'transparent' }}>
            <AvatarFallback style={{ backgroundColor: `${color}40`, color }}>
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isActive && (
            <div 
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-glow-pulse"
              style={{ backgroundColor: color }}
            />
          )}
        </div>
        <div 
          className="text-sm font-bold text-center px-2 py-1 rounded"
          style={{ 
            color: isActive ? color : 'hsl(var(--muted-foreground))',
            backgroundColor: isActive ? `${color}20` : 'transparent'
          }}
        >
          {name}
        </div>
      </div>

      {/* Player cards */}
      {cards.length > 0 && (
        <div className={`flex gap-2 ${getCardContainerClasses()}`}>
          {cards.map((card, idx) => (
            <div 
              key={idx} 
              className="animate-scale-in"
              style={{ 
                animationDelay: `${idx * 0.05}s`,
                transform: position === "left" || position === "right" ? 'scale(0.85)' : 'scale(1)'
              }}
            >
              <RideBusCard card={card} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
