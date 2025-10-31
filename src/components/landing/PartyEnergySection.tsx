import { Button } from "@/components/ui/button";
import { MessageCircle, Zap, Heart, Star } from "lucide-react";

export const PartyEnergySection = () => {
  const partyMoments = [
    { emoji: "🍻", text: "Cheers!", color: "hsl(var(--secondary))" },
    { emoji: "😂", text: "Hilarious Rules", color: "hsl(var(--accent))" },
    { emoji: "👑", text: "King's Cup Pro", color: "hsl(var(--primary))" },
    { emoji: "🎉", text: "Party Time!", color: "hsl(var(--secondary))" },
    { emoji: "🔥", text: "On Fire!", color: "hsl(var(--accent))" },
    { emoji: "💯", text: "Epic Game", color: "hsl(var(--primary))" },
    { emoji: "🚀", text: "Next Level", color: "hsl(var(--secondary))" },
    { emoji: "⚡", text: "High Energy", color: "hsl(var(--accent))" },
  ];

  return (
    <section className="relative py-32 border-t border-border/50 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent rounded-full blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Bring the Bar Games
            </span>
          </h2>
          <p className="text-2xl font-bold mb-4">
            <span className="text-primary">To Your Screen</span>
          </p>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of players creating unforgettable party moments
          </p>
        </div>

        {/* Scrolling party moments */}
        <div className="relative mb-16 overflow-hidden">
          <div className="flex gap-4 animate-marquee whitespace-nowrap">
            {[...partyMoments, ...partyMoments].map((moment, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-3 px-8 py-6 rounded-2xl bg-card/50 backdrop-blur-sm border-2 hover:scale-110 transition-transform cursor-default"
                style={{ 
                  borderColor: moment.color + '40',
                  boxShadow: `0 0 30px ${moment.color}30`
                }}
              >
                <span className="text-5xl">{moment.emoji}</span>
                <span className="text-xl font-bold" style={{ color: moment.color }}>
                  {moment.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Community features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="text-center p-8 rounded-2xl bg-card/30 backdrop-blur-sm border border-primary/30 hover:border-primary transition-all hover:scale-105">
            <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2 text-foreground">Instant Setup</h3>
            <p className="text-muted-foreground">No downloads or accounts needed. Just click and play.</p>
          </div>

          <div className="text-center p-8 rounded-2xl bg-card/30 backdrop-blur-sm border border-secondary/30 hover:border-secondary transition-all hover:scale-105">
            <Heart className="h-12 w-12 mx-auto mb-4 text-secondary" />
            <h3 className="text-2xl font-bold mb-2 text-foreground">Share the Fun</h3>
            <p className="text-muted-foreground">Send a join code and bring everyone together online.</p>
          </div>

          <div className="text-center p-8 rounded-2xl bg-card/30 backdrop-blur-sm border border-accent/30 hover:border-accent transition-all hover:scale-105">
            <Star className="h-12 w-12 mx-auto mb-4 text-accent" />
            <h3 className="text-2xl font-bold mb-2 text-foreground">Always Free</h3>
            <p className="text-muted-foreground">No premium tiers. Full features for everyone, forever.</p>
          </div>
        </div>

        {/* Discord CTA */}
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-[#5865F2]/10 to-card/50 backdrop-blur-sm rounded-3xl p-12 border-2 border-[#5865F2]/30 shadow-[0_0_50px_#5865F240]">
          <MessageCircle className="h-16 w-16 mx-auto mb-6 text-[#5865F2]" />
          <h3 className="text-3xl md:text-4xl font-black mb-4 text-foreground">
            Join Our Discord Community
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Share custom rules, suggest new games, and party with players worldwide
          </p>
          <Button
            onClick={() => window.open('https://discord.gg/CmHurTx49j', '_blank')}
            size="lg"
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xl px-12 py-7 hover:scale-110 transition-all duration-300 shadow-[0_0_40px_#5865F260]"
          >
            <MessageCircle className="mr-2 h-6 w-6" />
            Join the Party
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};