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
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-5xl md:text-6xl animate-pulse">🍺</span>
              <h1 className="text-6xl md:text-8xl font-bold leading-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Get The Party Started
                </span>
              </h1>
              <span className="text-5xl md:text-6xl animate-pulse delay-500">🍻</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Drink. Play. Repeat. 🎉
            </h2>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              The ultimate online drinking game platform for wild Discord parties, streaming sessions, and late-night shenanigans. No downloads, no BS — just pure drinking game fun! 🎮🍾
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Button
                onClick={scrollToGames}
                size="lg"
                className="bg-gradient-primary text-primary-foreground font-bold text-lg px-8 py-6 shadow-glow-emerald hover:scale-105 transition-all group"
              >
                <Beer className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                🎲 Start Playing Now
              </Button>
              
              <Button
                onClick={() => window.open('https://discord.gg/CmHurTx49j', '_blank')}
                size="lg"
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-lg px-8 py-6 shadow-[0_0_40px_rgba(88,101,242,0.5)] hover:shadow-[0_0_60px_rgba(88,101,242,0.7)] transition-all animate-pulse"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                🎉 Join Discord Party
              </Button>
            </div>

            {/* Discord Promo Badge */}
            <div className="pt-6 animate-bounce">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2]/20 border-2 border-[#5865F2] rounded-full">
                <PartyPopper className="h-5 w-5 text-[#5865F2]" />
                <span className="text-sm font-bold text-[#5865F2]">
                  500+ partiers in our Discord! Join the madness →
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
              <div className="text-center group hover:scale-110 transition-transform">
                <div className="text-3xl font-bold text-primary mb-1">🍺 {games.length}+</div>
                <div className="text-sm text-muted-foreground">Epic Games</div>
              </div>
              <div className="text-center group hover:scale-110 transition-transform">
                <div className="text-3xl font-bold text-primary mb-1">🎯 ∞</div>
                <div className="text-sm text-muted-foreground">Custom Rules</div>
              </div>
              <div className="text-center group hover:scale-110 transition-transform">
                <div className="text-3xl font-bold text-primary mb-1">🌙 24/7</div>
                <div className="text-sm text-muted-foreground">Party Time</div>
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
              <span className="bg-gradient-primary bg-clip-text text-transparent">🍻 Pick Your Poison</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From Kings Cup to Horse Races — we've got the drinks flowing and the games glowing ✨
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

      {/* Discord Mega Promo Section */}
      <section className="relative py-20 border-t border-border overflow-hidden">
        <div className="absolute inset-0 bg-[#5865F2]/5 pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#5865F2]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 md:p-12 bg-gradient-card border-2 border-[#5865F2] shadow-[0_0_60px_rgba(88,101,242,0.4)] backdrop-blur-sm">
              <div className="text-center space-y-6">
                <div className="inline-block p-4 bg-[#5865F2]/20 rounded-full animate-pulse">
                  <MessageCircle className="h-16 w-16 text-[#5865F2]" />
                </div>
                
                <h2 className="text-4xl md:text-6xl font-bold">
                  🎉 Join the ChugZone Discord! 🍻
                </h2>
                
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-bold">
                  Where the REAL party happens! 500+ players drinking, gaming, and vibing 24/7
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
                  <div className="flex items-center gap-3 p-5 rounded-lg bg-[#5865F2]/10 border-2 border-[#5865F2]/30 hover:bg-[#5865F2]/20 transition-all group">
                    <Beer className="h-6 w-6 text-[#5865F2] flex-shrink-0 group-hover:rotate-12 transition-transform" />
                    <span className="text-base font-bold">🎮 Weekly game nights & tournaments</span>
                  </div>
                  <div className="flex items-center gap-3 p-5 rounded-lg bg-[#5865F2]/10 border-2 border-[#5865F2]/30 hover:bg-[#5865F2]/20 transition-all group">
                    <Trophy className="h-6 w-6 text-[#5865F2] flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-base font-bold">🏆 Share epic custom rules</span>
                  </div>
                  <div className="flex items-center gap-3 p-5 rounded-lg bg-[#5865F2]/10 border-2 border-[#5865F2]/30 hover:bg-[#5865F2]/20 transition-all group">
                    <Gift className="h-6 w-6 text-[#5865F2] flex-shrink-0 group-hover:rotate-12 transition-transform" />
                    <span className="text-base font-bold">🎁 Get early access to new games</span>
                  </div>
                  <div className="flex items-center gap-3 p-5 rounded-lg bg-[#5865F2]/10 border-2 border-[#5865F2]/30 hover:bg-[#5865F2]/20 transition-all group">
                    <Sparkles className="h-6 w-6 text-[#5865F2] flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-base font-bold">✨ Exclusive memes & drinking tips</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => window.open('https://discord.gg/CmHurTx49j', '_blank')}
                    size="lg"
                    className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xl px-16 py-8 shadow-[0_0_60px_rgba(88,101,242,0.6)] hover:shadow-[0_0_80px_rgba(88,101,242,0.8)] transition-all hover:scale-105"
                  >
                    <MessageCircle className="mr-3 h-6 w-6" />
                    🚀 Join the Discord Party NOW
                    <ExternalLink className="ml-3 h-5 w-5" />
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4 animate-pulse">
                    🔥 Most active drinking game community online!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold">
              Why ChugZone? 🤔🍺
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We're not just another gaming site — we're your digital bartender, game master, and party starter all rolled into one. 
              Perfect for Discord streams, house parties, bar nights, or those legendary 3 AM gaming sessions. 
              No downloads, no complicated setup, just pure unfiltered drinking game chaos! 🎉
            </p>
            <p className="text-base text-muted-foreground italic">
              Remember: Drink responsibly, game irresponsibly 😎🍻
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
                  🍺 ChugZone
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your #1 online drinking game destination
                </p>
              </div>

              <div className="flex flex-wrap gap-6 justify-center items-center">
                <Button
                  onClick={() => window.open('https://discord.gg/CmHurTx49j', '_blank')}
                  variant="ghost"
                  className="text-[#5865F2] hover:text-[#5865F2] hover:bg-[#5865F2]/10 font-bold"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  🎉 Discord
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

            <div className="mt-8 pt-8 border-t border-border text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                © 2025 ChugZone. Drink Responsibly, Game Wildly 🍻🎮
              </p>
              <p className="text-xs text-muted-foreground">
                Made with 🍺 and ❤️ for party animals everywhere
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
