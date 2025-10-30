import { GameCard } from "@/components/GameCard";
import { games } from "@/data/games";
import heroImage from "@/assets/kings-cup-hero.jpg";
import { Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32 text-center">
          <div className="flex items-center justify-center mb-6 animate-slide-in">
            <Sparkles className="w-12 h-12 text-primary animate-glow-pulse" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-slide-in">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              ChugZone
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-in">
            The ultimate online drinking game hub for your next party.
            <br />
            Stream-ready and packed with fun.
          </p>

          <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground animate-slide-in">
            <div className="px-4 py-2 rounded-full bg-muted/50 border border-border">
              🎮 Multiple Games
            </div>
            <div className="px-4 py-2 rounded-full bg-muted/50 border border-border">
              🎨 Stream-Optimized
            </div>
            <div className="px-4 py-2 rounded-full bg-muted/50 border border-border">
              ✨ Custom Rules
            </div>
            <div className="px-4 py-2 rounded-full bg-muted/50 border border-border">
              🎉 Party Ready
            </div>
          </div>
        </div>
      </div>

      {/* Games Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Choose Your Game
          </h2>
          <p className="text-xl text-muted-foreground">
            Pick a game, set your rules, and let the party begin!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground">
          <p>ChugZone - Drink Responsibly 🍻</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
