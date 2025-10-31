import { Game } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GameCardProps {
  game: Game;
}

export const GameCard = ({ game }: GameCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (game.id === "horse-race") {
      navigate(`/game/horse-race/setup`);
    } else {
      navigate(`/game/${game.id}/settings`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative overflow-hidden rounded-xl bg-gradient-card border-2 border-border hover:border-primary transition-all duration-300 animate-slide-in hover:shadow-glow-cyan hover:scale-[1.02] cursor-pointer p-5"
    >
      <div className="flex flex-col items-center text-center">
        {/* Centered Emoji */}
        <div className="text-6xl mb-3 group-hover:scale-110 transition-all duration-300 animate-glow-pulse">
          {game.emoji}
        </div>
        
        {/* Game Title */}
        <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
          {game.name}
        </h3>
        
        {/* Description */}
        <p className="text-muted-foreground mb-3 text-xs leading-relaxed">
          {game.description}
        </p>
        
        {/* Player Count */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Users className="w-3.5 h-3.5" />
          <span>
            {game.minPlayers}
            {game.maxPlayers ? `-${game.maxPlayers}` : "+"} players
          </span>
        </div>
        
        {/* Play Button */}
        <Button
          className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-bold py-3 shadow-glow-cyan hover:shadow-glow-purple transition-all duration-300 group-hover:scale-105"
        >
          Play Now
        </Button>
      </div>
    </div>
  );
};
