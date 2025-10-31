import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PlayCircle, Crown, Sparkles } from "lucide-react";
import kingsCupHero from "@/assets/kings-cup-hero.jpg";

export const FeaturedGameSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-32 border-t border-border/50 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary rounded-full blur-[150px] opacity-10" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Crown className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Featured Game</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              King's Cup
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The classic drinking game, reimagined for Discord parties
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image side */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative rounded-3xl overflow-hidden border-2 border-primary/30 hover:scale-105 transition-transform duration-500">
                <img 
                  src={kingsCupHero} 
                  alt="King's Cup Game" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
              </div>
              
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground px-6 py-3 rounded-full font-bold text-lg animate-pulse">
                Most Popular! 🔥
              </div>
            </div>

            {/* Features side */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4 group cursor-default">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-foreground">Fully Customizable Rules</h4>
                    <p className="text-muted-foreground">Edit every card to match your group's style. Save presets for quick starts.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group cursor-default">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Crown className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-foreground">Mate System Built-In</h4>
                    <p className="text-muted-foreground">Automatic tracking of drink mates. Never miss a synchronized sip.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group cursor-default">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PlayCircle className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-foreground">Beautiful Animations</h4>
                    <p className="text-muted-foreground">Smooth card flips and glowing effects perfect for streaming.</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/game/kings-cup/settings')}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground font-bold text-xl px-12 py-7 hover:scale-110 transition-all duration-300 group"
              >
                <PlayCircle className="mr-2 h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                Start Playing Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};