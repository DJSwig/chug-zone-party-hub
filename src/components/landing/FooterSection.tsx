import { Button } from "@/components/ui/button";
import { MessageCircle, Beer, Github, Twitter } from "lucide-react";

export const FooterSection = () => {
  return (
    <footer className="relative border-t border-border/50 bg-background/95 backdrop-blur-sm">
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-neon opacity-50" />
      
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Brand column */}
            <div className="text-center md:text-left space-y-4">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <Beer className="h-10 w-10 text-[hsl(var(--neon-green))] drop-shadow-[0_0_15px_hsl(var(--neon-green))]" />
                <h3 className="text-3xl font-black bg-gradient-hero bg-clip-text text-transparent">
                  ChugZone
                </h3>
              </div>
              <p className="text-muted-foreground max-w-xs mx-auto md:mx-0">
                The ultimate online drinking game hub. Play classics with friends, anywhere.
              </p>
              <div className="flex gap-3 justify-center md:justify-start">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-[hsl(var(--neon-purple))] hover:bg-[hsl(var(--neon-purple))]/10 transition-colors"
                  onClick={() => window.open('https://discord.gg/CmHurTx49j', '_blank')}
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-[hsl(var(--neon-green))] hover:bg-[hsl(var(--neon-green))]/10 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-[hsl(var(--neon-cyan))] hover:bg-[hsl(var(--neon-cyan))]/10 transition-colors"
                >
                  <Github className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Quick links */}
            <div className="text-center">
              <h4 className="text-lg font-bold mb-4 text-foreground">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#games" className="text-muted-foreground hover:text-[hsl(var(--neon-purple))] transition-colors">
                    Browse Games
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[hsl(var(--neon-purple))] transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="https://discord.gg/CmHurTx49j" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[hsl(var(--neon-purple))] transition-colors">
                    Discord Community
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal & Contact */}
            <div className="text-center md:text-right">
              <h4 className="text-lg font-bold mb-4 text-foreground">Legal & Contact</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/terms" className="text-muted-foreground hover:text-[hsl(var(--neon-purple))] transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-muted-foreground hover:text-[hsl(var(--neon-purple))] transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="https://discord.gg/CmHurTx49j" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[hsl(var(--neon-purple))] transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-border/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                © 2025 ChugZone.com 🍻 
                <span className="mx-2">•</span>
                <span className="text-foreground font-semibold">Please drink responsibly</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Made with <span className="text-[hsl(var(--neon-purple))]">💜</span> for party people everywhere
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-neon opacity-30 blur-sm" />
    </footer>
  );
};