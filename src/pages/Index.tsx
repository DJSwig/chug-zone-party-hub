import { GameCard } from "@/components/GameCard";
import { games } from "@/data/games";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ParticleBackground } from "@/components/ParticleBackground";
import { ExternalLink, Users, Sparkles, MessageCircle, Zap, Crown } from "lucide-react";

const Index = () => {
  const scrollToGames = () => {
    document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Glow Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Main Headline */}
            <h1 className="text-6xl md:text-8xl font-bold leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Play Drinking Games
              </span>
              <br />
              <span className="text-foreground">Online With Friends</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Host classics like King's Cup or try new party games — built for Discord nights.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Button
                onClick={scrollToGames}
                size="lg"
                className="bg-gradient-primary text-primary-foreground font-bold text-lg px-8 py-6 shadow-glow-emerald hover:scale-105 transition-all"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Play Now
              </Button>
              
              <Button
                onClick={() => window.open('https://discord.gg/CmHurTx49j', '_blank')}
                size="lg"
                variant="outline"
                className="border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2]/10 font-bold text-lg px-8 py-6 shadow-[0_0_30px_rgba(88,101,242,0.3)] hover:shadow-[0_0_40px_rgba(88,101,242,0.5)] transition-all"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Join the Party on Discord
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{games.length}+</div>
                <div className="text-sm text-muted-foreground">Games</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">∞</div>
                <div className="text-sm text-muted-foreground">Custom Rules</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Always On</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Game Showcase Section */}
      <section id="games" className="relative py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-primary bg-clip-text text-transparent">Choose Your Game</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Classic drinking games reimagined for the digital age
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {games.map((game) => (
              <div key={game.id} className="transform transition-all duration-300 hover:scale-105">
                <GameCard game={game} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="relative py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 md:p-12 bg-gradient-card border-2 border-[#5865F2]/50 shadow-[0_0_40px_rgba(88,101,242,0.2)] backdrop-blur-sm">
              <div className="text-center space-y-6">
                <div className="inline-block p-4 bg-[#5865F2]/10 rounded-full">
                  <MessageCircle className="h-12 w-12 text-[#5865F2]" />
                </div>
                
                <h2 className="text-3xl md:text-5xl font-bold">
                  🎉 Join the ChugZone Discord
                </h2>
                
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Host games, share rules, and party online with the community
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                    <Users className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Weekly game nights</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                    <Crown className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Custom rule sharing</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Suggest new games</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                    <Zap className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">Early access to updates</span>
                  </div>
                </div>

                <Button
                  onClick={() => window.open('https://discord.gg/CmHurTx49j', '_blank')}
                  size="lg"
                  className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-lg px-12 py-6 shadow-[0_0_40px_rgba(88,101,242,0.4)] hover:shadow-[0_0_60px_rgba(88,101,242,0.6)] transition-all"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Join Our Discord
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-muted-foreground leading-relaxed">
              ChugZone brings your favorite drinking games online with style — 
              built for friends, bars, and Discord streams.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  ChugZone
                </h3>
                <p className="text-sm text-muted-foreground">
                  The ultimate drinking game hub
                </p>
              </div>

              <div className="flex flex-wrap gap-6 justify-center items-center">
                <Button
                  onClick={() => window.open('https://discord.gg/CmHurTx49j', '_blank')}
                  variant="ghost"
                  className="text-[#5865F2] hover:text-[#5865F2] hover:bg-[#5865F2]/10"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Join Discord
                </Button>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Use
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                © 2025 ChugZone. Drink Responsibly 🍻
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
