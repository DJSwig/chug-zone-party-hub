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
    <div className="group relative overflow-hidden rounded-xl bg-gradient-card border border-border hover:border-primary/50 transition-all duration-300 animate-slide-in hover:shadow-glow-cyan">
      <div className="aspect-square flex items-center justify-center bg-muted/20">
        <div className="text-9xl group-hover:scale-110 transition-transform duration-500">
          {game.emoji}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
          {game.name}
        </h3>
        
        <p className="text-muted-foreground mb-4 text-sm">
          {game.description}
        </p>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Users className="w-4 h-4" />
          <span>
            {game.minPlayers}
            {game.maxPlayers ? `-${game.maxPlayers}` : "+"} players
          </span>
        </div>
        
        <Button
          onClick={() => navigate(`/game/${game.id}/settings`)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-6 shadow-glow-cyan hover:shadow-glow-purple transition-all duration-300"
        >
          Play Now
        </Button>
      </div>
    </div>
  );
};
