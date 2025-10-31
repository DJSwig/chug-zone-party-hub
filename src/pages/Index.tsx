import { GameCard } from "@/components/GameCard";
import { games } from "@/data/games";
import { Sparkles } from "lucide-react";
import { ParticleBackground } from "@/components/ParticleBackground";
import { PageTransition } from "@/components/PageTransition";

const Index = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Animated Background */}
        <ParticleBackground />
        
        {/* Animated spotlight sweep */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-primary/10 via-transparent to-transparent animate-spotlight" />
        </div>
        {/* Hero Section */}
        <div className="relative border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/10 to-background" />
          
          <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
            <div className="flex items-center justify-center mb-6 animate-slide-in">
              <Sparkles className="w-12 h-12 text-primary animate-glow-pulse" />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-slide-in">
              <span className="bg-gradient-primary bg-clip-text text-transparent animate-text-glow">
                ChugZone
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-in">
              The ultimate online drinking game hub for your next party.
              <br />
              Stream-ready and packed with fun.
            </p>

            <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground animate-slide-in">
              <div className="px-4 py-2 rounded-full bg-muted/50 border border-border hover:border-primary/50 hover:shadow-glow-cyan transition-all duration-300">
                🎮 Multiple Games
              </div>
              <div className="px-4 py-2 rounded-full bg-muted/50 border border-border hover:border-primary/50 hover:shadow-glow-cyan transition-all duration-300">
                🎨 Stream-Optimized
              </div>
              <div className="px-4 py-2 rounded-full bg-muted/50 border border-border hover:border-primary/50 hover:shadow-glow-cyan transition-all duration-300">
                ✨ Custom Rules
              </div>
              <div className="px-4 py-2 rounded-full bg-muted/50 border border-border hover:border-primary/50 hover:shadow-glow-cyan transition-all duration-300">
                🎉 Party Ready
              </div>
            </div>
          </div>
        </div>

        {/* Games Section */}
        <div className="relative max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Choose Your Game
            </h2>
            <p className="text-xl text-muted-foreground">
              Pick a game, set your rules, and let the party begin!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-lg">
              More games coming soon! 🚀
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative border-t border-border py-8">
          <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground">
            <p>ChugZone - Drink Responsibly 🍻</p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Index;
