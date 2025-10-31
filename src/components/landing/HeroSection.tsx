import { Button } from "@/components/ui/button";
import { Beer, Sparkles, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserMenu } from "@/components/UserMenu";

export const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToGames = () => {
    document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* User menu in top right */}
      <div className="absolute top-6 right-6 z-20">
        <UserMenu />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(var(--neon-purple))] rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[hsl(var(--neon-green))] rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(var(--neon-cyan))] rounded-full blur-[140px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-slide-in">
          {/* Animated icon */}
          <div className="mb-6 relative inline-block">
            <div className="absolute inset-0 bg-gradient-hero blur-xl opacity-50 animate-pulse" />
            <Beer className="h-24 w-24 mx-auto relative z-10 text-primary drop-shadow-[0_0_20px_hsl(var(--neon-green))]" />
            <Sparkles className="h-8 w-8 absolute -top-2 -right-2 text-[hsl(var(--neon-purple))] animate-spin" style={{ animationDuration: '3s' }} />
          </div>

          {/* Main headline with neon glow effect */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black leading-tight">
              <span className="bg-gradient-neon bg-clip-text text-transparent animate-glow-pulse">
                Play Drinking Games
              </span>
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              With Your Friends — 
              <span className="text-[hsl(var(--neon-purple))]"> Anytime</span>, 
              <span className="text-[hsl(var(--neon-green))]"> Anywhere</span>
            </h2>
          </div>

          {/* Subtext */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            King's Cup, Flip Cup, and more — all in one fun, interactive site. 
            <span className="text-foreground font-semibold"> Perfect for Discord calls.</span>
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button
              onClick={scrollToGames}
              size="lg"
              className="group relative bg-gradient-hero text-white font-bold text-xl px-10 py-7 hover:scale-110 transition-all duration-300 shadow-glow-purple overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              <Play className="mr-2 h-6 w-6 relative z-10" />
              <span className="relative z-10">Play Now</span>
            </Button>
            
            <Button
              onClick={() => navigate('/game/kings-cup/settings')}
              size="lg"
              variant="outline"
              className="font-bold text-xl px-10 py-7 border-2 border-[hsl(var(--neon-green))] text-[hsl(var(--neon-green))] hover:bg-[hsl(var(--neon-green))]/10 hover:scale-110 transition-all duration-300 shadow-glow-emerald"
            >
              <Beer className="mr-2 h-6 w-6" />
              Try King's Cup
            </Button>
          </div>

          {/* Animated stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-16">
            <div className="text-center group cursor-default">
              <div className="text-5xl md:text-6xl font-black bg-gradient-hero bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                ∞
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Fun</div>
            </div>
            <div className="text-center group cursor-default">
              <div className="text-5xl md:text-6xl font-black text-[hsl(var(--neon-green))] mb-2 group-hover:scale-110 transition-transform drop-shadow-[0_0_15px_hsl(var(--neon-green))]">
                FREE
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Always</div>
            </div>
            <div className="text-center group cursor-default">
              <div className="text-5xl md:text-6xl font-black text-[hsl(var(--neon-cyan))] mb-2 group-hover:scale-110 transition-transform drop-shadow-[0_0_15px_hsl(var(--neon-cyan))]">
                24/7
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Online</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 border-2 border-[hsl(var(--neon-purple))]/50 rounded-full flex items-start justify-center p-2 shadow-glow-purple">
          <div className="w-2 h-4 bg-gradient-hero rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};