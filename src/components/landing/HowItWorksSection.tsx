import { Gamepad2, Users, PartyPopper } from "lucide-react";

export const HowItWorksSection = () => {
  const steps = [
    {
      icon: Gamepad2,
      title: "Choose Your Game",
      description: "Pick from classics like King's Cup or explore new party games",
      color: "hsl(var(--neon-purple))",
      glow: "shadow-glow-purple"
    },
    {
      icon: Users,
      title: "Add Your Friends",
      description: "Share a join code and get everyone in the virtual room",
      color: "hsl(var(--neon-green))",
      glow: "shadow-glow-emerald"
    },
    {
      icon: PartyPopper,
      title: "Start the Party",
      description: "Draw cards, follow rules, and let the good times roll",
      color: "hsl(var(--neon-cyan))",
      glow: "shadow-glow-cyan"
    }
  ];

  return (
    <section className="relative py-32 border-t border-border/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-neon bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in seconds. No downloads, no hassle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index}
                className="group relative"
              >
                {/* Connection line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-20 left-[60%] w-[80%] h-1 bg-gradient-to-r from-[hsl(var(--border))] to-transparent" />
                )}

                {/* Card */}
                <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border hover:border-[var(--color)] transition-all duration-500 hover:scale-105 hover:[box-shadow:var(--glow)]"
                  style={{ 
                    '--color': step.color,
                    '--glow': `0 0 40px ${step.color}40`
                  } as React.CSSProperties}
                >
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-2xl font-black text-primary-foreground">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--color)]/10 mb-6 ${step.glow} group-hover:scale-110 transition-transform`}
                    style={{ '--color': step.color } as React.CSSProperties}
                  >
                    <Icon className="h-10 w-10" style={{ color: step.color }} />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:[text-shadow:0_0_20px_var(--color)]"
                    style={{ '--color': step.color } as React.CSSProperties}
                  >
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};