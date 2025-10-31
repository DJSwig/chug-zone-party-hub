import { GameCard } from "@/components/GameCard";
import { games } from "@/data/games";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ParticleBackground } from "@/components/ParticleBackground";
import { ExternalLink, Users, Sparkles, MessageCircle, Zap, Crown, Beer, PartyPopper, Trophy, Gift } from "lucide-react";

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
            {/* Main Headline with Beer Emojis */}
            <div className="flex items-center justify-center gap-4 mb-4 animate-fade-in">
              <span className="text-5xl md:text-6xl animate-glow-pulse">🍺</span>
              <h1 className="text-6xl md:text-8xl font-bold leading-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent animate-text-glow">
                  The Ultimate Drinking Game Hub
                </span>
              </h1>
              <span className="text-5xl md:text-6xl animate-glow-pulse" style={{ animationDelay: '0.5s' }}>🍻</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Play Classic Party Games Online 🎉
            </h2>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Stream-optimized drinking games with customizable rules. Perfect for Discord parties, game nights, and unforgettable moments with friends.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <Button
                onClick={scrollToGames}
                size="lg"
                className="bg-gradient-primary text-primary-foreground font-bold text-lg px-10 py-6 shadow-glow-emerald hover:scale-110 hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] transition-all duration-300 group"
              >
                <Beer className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                Start Playing Now
              </Button>
              
              <Button
                onClick={() => window.open('https://discord.gg/CmHurTx49j', '_blank')}
                size="lg"
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-lg px-10 py-6 shadow-[0_0_40px_rgba(88,101,242,0.5)] hover:shadow-[0_0_80px_rgba(88,101,242,0.8)] hover:scale-110 transition-all duration-300"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Join Discord Community
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="text-center group hover:scale-110 transition-all duration-300 cursor-default">
                <div className="text-4xl font-bold text-primary mb-2 group-hover:animate-glow-pulse">{games.length}</div>
                <div className="text-sm text-muted-foreground font-semibold">Party Games</div>
              </div>
              <div className="text-center group hover:scale-110 transition-all duration-300 cursor-default">
                <div className="text-4xl font-bold text-primary mb-2 group-hover:animate-glow-pulse">∞</div>
                <div className="text-sm text-muted-foreground font-semibold">Custom Rules</div>
              </div>
              <div className="text-center group hover:scale-110 transition-all duration-300 cursor-default">
                <div className="text-4xl font-bold text-primary mb-2 group-hover:animate-glow-pulse">24/7</div>
                <div className="text-sm text-muted-foreground font-semibold">Always Available</div>
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
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 animate-text-glow">
              <span className="bg-gradient-primary bg-clip-text text-transparent">Choose Your Game</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Classic drinking games reimagined for the digital age with style and customization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {games.map((game, index) => (
              <div 
                key={game.id} 
                className="transform transition-all duration-500 hover:scale-105 hover:z-10 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <GameCard game={game} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discord Community Section */}
      <section className="relative py-20 border-t border-border overflow-hidden">
        <div className="absolute inset-0 bg-[#5865F2]/5 pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#5865F2]/10 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <Card className="p-8 md:p-12 bg-gradient-card border-2 border-[#5865F2] shadow-[0_0_60px_rgba(88,101,242,0.4)] backdrop-blur-sm hover:shadow-[0_0_100px_rgba(88,101,242,0.6)] transition-all duration-500">
              <div className="text-center space-y-8">
                <div className="inline-block p-5 bg-[#5865F2]/20 rounded-full animate-glow-pulse">
                  <MessageCircle className="h-16 w-16 text-[#5865F2]" />
                </div>
                
                <div>
                  <h2 className="text-4xl md:text-6xl font-bold mb-4 animate-text-glow">
                    Join Our Discord Community
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Connect with fellow players, share custom rules, and stay updated on new features
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="flex items-center gap-3 p-5 rounded-lg bg-[#5865F2]/10 border-2 border-[#5865F2]/30 hover:bg-[#5865F2]/20 hover:scale-105 transition-all duration-300 group">
                    <Users className="h-6 w-6 text-[#5865F2] flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-base font-semibold">Weekly game nights</span>
                  </div>
                  <div className="flex items-center gap-3 p-5 rounded-lg bg-[#5865F2]/10 border-2 border-[#5865F2]/30 hover:bg-[#5865F2]/20 hover:scale-105 transition-all duration-300 group">
                    <Trophy className="h-6 w-6 text-[#5865F2] flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-base font-semibold">Share custom rules</span>
                  </div>
                  <div className="flex items-center gap-3 p-5 rounded-lg bg-[#5865F2]/10 border-2 border-[#5865F2]/30 hover:bg-[#5865F2]/20 hover:scale-105 transition-all duration-300 group">
                    <Gift className="h-6 w-6 text-[#5865F2] flex-shrink-0 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="text-base font-semibold">Early feature access</span>
                  </div>
                  <div className="flex items-center gap-3 p-5 rounded-lg bg-[#5865F2]/10 border-2 border-[#5865F2]/30 hover:bg-[#5865F2]/20 hover:scale-105 transition-all duration-300 group">
                    <Sparkles className="h-6 w-6 text-[#5865F2] flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-base font-semibold">Community events</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => window.open('https://discord.gg/CmHurTx49j', '_blank')}
                    size="lg"
                    className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xl px-12 py-7 shadow-[0_0_60px_rgba(88,101,242,0.6)] hover:shadow-[0_0_100px_rgba(88,101,242,0.9)] hover:scale-110 transition-all duration-300"
                  >
                    <MessageCircle className="mr-3 h-6 w-6" />
                    Join Discord Community
                    <ExternalLink className="ml-3 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Why Choose ChugZone?
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Stream-optimized gameplay, customizable rules, and seamless multiplayer make ChugZone perfect for Discord parties, 
              house gatherings, and virtual game nights. No downloads required — just instant fun with friends.
            </p>
            <p className="text-base text-muted-foreground italic font-semibold">
              Please drink responsibly 🍻
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
                <h3 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  ChugZone
                </h3>
                <p className="text-sm text-muted-foreground">
                  The Ultimate Online Drinking Game Platform
                </p>
              </div>

              <div className="flex flex-wrap gap-6 justify-center items-center">
                <Button
                  onClick={() => window.open('https://discord.gg/CmHurTx49j', '_blank')}
                  variant="ghost"
                  className="text-[#5865F2] hover:text-[#5865F2] hover:bg-[#5865F2]/10 hover:scale-105 transition-all duration-300"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Discord
                </Button>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Use
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
                <a href="mailto:contact@chugzone.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                © 2025 ChugZone. Play Responsibly. 🍻
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
