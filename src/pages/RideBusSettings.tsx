import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, Users } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { generateJoinCode } from "@/utils/joinCodeGenerator";
import { toast } from "sonner";

export default function RideBusSettings() {
  const navigate = useNavigate();
  const [hostName, setHostName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleStartGame = async () => {
    if (!hostName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsCreating(true);
    try {
      const joinCode = generateJoinCode();

      // Create game session
      const { data: session, error: sessionError } = await supabase
        .from("game_sessions")
        .insert({
          join_code: joinCode,
          game_type: "ride-bus",
          host_name: hostName.trim(),
          status: "waiting",
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Initialize Ride the Bus state
      const { error: stateError } = await supabase
        .from("ride_bus_state")
        .insert({
          session_id: session.id,
          current_phase: "round1",
          current_round: 1,
          current_player_index: 0,
          player_cards: [],
          bus_cards: [],
          flipped_bus_cards: 0,
          choices: [],
        });

      if (stateError) throw stateError;

      toast.success("Game created!");
      navigate(`/game/ride-bus/host/${session.id}`);
    } catch (error) {
      console.error("Error creating game:", error);
      toast.error("Failed to create game");
    } finally {
      setIsCreating(false);
    }
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
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Your Name
                </label>
                <Input
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="Enter your name..."
                  className="bg-input border-border text-foreground"
                  onKeyDown={(e) => e.key === "Enter" && handleStartGame()}
                />
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-bold text-foreground mb-3">How to Play</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-primary">Round 1 - Red or Black:</strong> Guess the card color. Wrong = 1 drink</p>
                  <p><strong className="text-secondary">Round 2 - Higher or Lower:</strong> Guess vs your first card. Wrong = 2 drinks</p>
                  <p><strong className="text-accent">Round 3 - Inside or Outside:</strong> Guess if next card is between your two cards. Wrong = 3 drinks</p>
                  <p><strong className="text-primary">Round 4 - Pick a Suit:</strong> Choose Hearts, Clubs, Diamonds, or Spades. Wrong = 4 drinks</p>
                  <p><strong className="text-secondary">Final Phase - Ride the Bus:</strong> 8 cards flip - match your cards to give/keep drinks!</p>
                </div>
              </div>
            </div>
          </Card>

          <Button
            onClick={handleStartGame}
            disabled={isCreating || !hostName.trim()}
            className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-primary-foreground font-bold text-2xl py-8 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50"
          >
            {isCreating ? (
              <>Creating Game...</>
            ) : (
              <>
                <Play className="w-6 h-6 mr-3" />
                Create Game
              </>
            )}
          </Button>

          <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/20 text-center">
            <Users className="w-5 h-5 inline-block mr-2 text-accent" />
            <span className="text-sm text-foreground">
              2-12 players • Multiplayer via join codes
            </span>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
