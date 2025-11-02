import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, Users } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

export default function RideBusSettings() {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate("/game/ride-bus/play");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>

          <div className="text-center mb-8 animate-slide-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Ride the Bus 🚌
            </h1>
            <p className="text-xl text-muted-foreground">
              The ultimate card guessing game!
            </p>
          </div>

          <Card className="p-8 bg-card/80 backdrop-blur-sm border-border mb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground mb-3">How to Play</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-primary">Round 1 - Red or Black:</strong> Guess the card color. Wrong = 1 drink</p>
                <p><strong className="text-secondary">Round 2 - Higher or Lower:</strong> Guess vs your first card. Wrong = 2 drinks</p>
                <p><strong className="text-accent">Round 3 - Inside or Outside:</strong> Guess if next card is between your two cards. Wrong = 3 drinks</p>
                <p><strong className="text-primary">Round 4 - Pick a Suit:</strong> Choose Hearts, Clubs, Diamonds, or Spades. Wrong = 4 drinks</p>
                <p><strong className="text-secondary">Final Phase - Ride the Bus:</strong> 8 cards flip - match your cards to give/keep drinks!</p>
              </div>
            </div>
          </Card>

          <Button
            onClick={handleStartGame}
            className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-primary-foreground font-bold text-2xl py-8 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <Play className="w-6 h-6 mr-3" />
            Start Game
          </Button>

          <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/20 text-center">
            <Users className="w-5 h-5 inline-block mr-2 text-accent" />
            <span className="text-sm text-foreground">
              2-12 players • Add players manually in-game
            </span>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
