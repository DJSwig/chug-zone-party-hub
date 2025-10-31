import { GameCard } from "@/components/GameCard";
import { games } from "@/data/games";
import { Button } from "@/components/ui/button";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Beer, MessageCircle, Users, Trophy, Sparkles } from "lucide-react";

const Index = () => {
  const scrollToGames = () => {
    document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Logo */}
            <div className="mb-8">
              <Beer className="h-20 w-20 mx-auto text-primary" />
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                ChugZone
              </span>
            </h1>
            
            <h2 className="text-2xl md:text-4xl font-semibold text-foreground">
              The Ultimate Online Drinking Game Hub
            </h2>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Play classic drinking games with friends on Discord. Stream-optimized, fully customizable, and always free.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Button
                onClick={scrollToGames}
                size="lg"
                className="bg-gradient-primary text-primary-foreground font-semibold text-lg px-8 py-6 hover:scale-105 transition-transform"
              >
                <Beer className="mr-2 h-5 w-5" />
                Browse Games
              </Button>
              
              <Button
                onClick={() => window.open('https://discord.gg/CmHurTx49j', '_blank')}
                size="lg"
                variant="outline"
                className="font-semibold text-lg px-8 py-6 hover:scale-105 transition-transform"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Join Discord
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-12">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{games.length}</div>
                <div className="text-sm text-muted-foreground">Games</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">∞</div>
                <div className="text-sm text-muted-foreground">Rules</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-primary rounded-full" />
          </div>
        </div>
      </section>

      {/* Game Showcase Section */}
      <section id="games" className="relative py-24 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-primary bg-clip-text text-transparent">Choose Your Game</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Classic drinking games reimagined for online play
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {games.map((game) => (
              <div key={game.id} className="transition-transform hover:scale-105">
                <GameCard game={game} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Why ChugZone?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built for Discord parties and online hangouts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4 p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Multiplayer Ready</h3>
                <p className="text-muted-foreground">
                  Host games with unlimited players. Share a simple join code and start playing instantly.
                </p>
              </div>

              <div className="text-center space-y-4 p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Fully Customizable</h3>
                <p className="text-muted-foreground">
                  Edit every rule to match your group's style. Save presets for future games.
                </p>
              </div>

              <div className="text-center space-y-4 p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Stream Optimized</h3>
                <p className="text-muted-foreground">
                  Beautiful card animations and clear layouts perfect for Discord streaming.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discord Community Section */}
      <section className="relative py-24 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#5865F2]/10">
              <MessageCircle className="h-10 w-10 text-[#5865F2]" />
            </div>
            
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Join Our Community
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Connect with players, share custom rules, and get updates on new features
              </p>
            </div>

            <Button
              onClick={() => window.open('https://discord.gg/CmHurTx49j', '_blank')}
              size="lg"
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-lg px-10 py-6 hover:scale-105 transition-transform"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Join Discord
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
                  ChugZone
                </h3>
                <p className="text-sm text-muted-foreground">
                  Online Drinking Games
                </p>
              </div>

              <div className="flex flex-wrap gap-6 justify-center items-center">
                <Button
                  onClick={() => window.open('https://discord.gg/CmHurTx49j', '_blank')}
                  variant="ghost"
                  size="sm"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Discord
                </Button>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </a>
                <a href="mailto:contact@chugzone.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </div>
            </div>

            <div className="text-center pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                © 2025 ChugZone. Please drink responsibly.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
