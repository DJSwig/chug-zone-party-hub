import { Game } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GameCardProps {
  game: Game;
}

export const GameCard = ({ game }: GameCardProps) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/game/${game.id}/settings`)}
      className="group relative overflow-hidden rounded-xl bg-gradient-card border-2 border-border hover:border-primary transition-all duration-300 animate-slide-in hover:shadow-glow-cyan hover:scale-105 cursor-pointer p-6"
    >
      <div className="flex flex-col items-center text-center">
        {/* Centered Emoji */}
        <div className="text-7xl mb-4 group-hover:scale-110 group-hover:animate-glow-pulse transition-all duration-300">
          {game.emoji}
        </div>
        
        {/* Game Title */}
        <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
          {game.name}
        </h3>
        
        {/* Description */}
        <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
          {game.description}
        </p>
        
        {/* Player Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Users className="w-4 h-4" />
          <span>
            {game.minPlayers}
            {game.maxPlayers ? `-${game.maxPlayers}` : "+"} players
          </span>
        </div>
        
        {/* Play Button */}
        <Button
          className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-bold py-4 shadow-glow-cyan hover:shadow-glow-purple transition-all duration-300 group-hover:scale-105"
        >
          Play Now
        </Button>
      </div>
    </div>
  );
};
