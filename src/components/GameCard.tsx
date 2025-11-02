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
    } else if (game.id === "beer-pong") {
      navigate(`/game/beer-pong/setup`);
    } else if (game.id === "ride-bus") {
      navigate(`/game/ride-bus/setup`);
    } else {
      navigate(`/game/${game.id}/settings`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative overflow-hidden rounded-xl bg-card border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] hover:scale-[1.02] cursor-pointer h-full"
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-transparent transition-all duration-500" />
      
      <div className="relative p-6 flex flex-col h-full">
        {/* Centered Emoji */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-3 group-hover:scale-110 transition-all duration-300 inline-block">
            {game.emoji}
          </div>
        </div>
        
        {/* Game Title */}
        <h3 className="text-2xl font-bold mb-3 text-center text-foreground group-hover:text-primary transition-colors">
          {game.name}
        </h3>
        
        {/* Description */}
        <p className="text-muted-foreground mb-4 text-sm leading-relaxed text-center flex-1">
          {game.description}
        </p>
        
        {/* Player Count */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
          <Users className="w-4 h-4" />
          <span>
            {game.minPlayers}
            {game.maxPlayers ? `-${game.maxPlayers}` : "+"} players
          </span>
        </div>
        
        {/* Play Button */}
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 shadow-[0_0_30px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.7)] transition-all duration-300 group-hover:scale-105"
        >
          Play Now
        </Button>
      </div>
    </div>
  );
};
