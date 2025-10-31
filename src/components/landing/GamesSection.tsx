import { GameCard } from "@/components/GameCard";
import { games } from "@/data/games";
import { Sparkles } from "lucide-react";

export const GamesSection = () => {
  return (
    <section id="games" className="relative py-32 border-t border-border/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-neon bg-clip-text text-transparent">
              Choose Your Game
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Classic drinking games reimagined for online play
          </p>
          
          {/* Coming soon badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-hero/10 border-2 border-[hsl(var(--neon-purple))]/30 animate-pulse">
            <Sparkles className="h-5 w-5 text-[hsl(var(--neon-purple))]" />
            <span className="text-sm font-bold text-[hsl(var(--neon-purple))] uppercase tracking-wider">
              More Games Coming Soon!
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {games.map((game) => (
            <div 
              key={game.id} 
              className="transition-all duration-300 hover:scale-105 hover:-translate-y-2"
            >
              <GameCard game={game} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};