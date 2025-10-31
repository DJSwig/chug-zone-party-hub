import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ParticleBackground } from "@/components/ParticleBackground";
import { generateJoinCode } from "@/utils/joinCodeGenerator";
import { ArrowLeft, Loader2 } from "lucide-react";

const HorseRaceSettings = () => {
  const [hostName, setHostName] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateSession = async () => {
    if (!hostName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setCreating(true);

    try {
      const joinCode = generateJoinCode();

      // Create game session
      const { data: session, error: sessionError } = await supabase
        .from("game_sessions")
        .insert({
          join_code: joinCode,
          game_type: "horse-race",
          host_name: hostName.trim(),
          status: "waiting",
        })
        .select()
        .single();

      if (sessionError || !session) {
        toast.error("Failed to create session");
        setCreating(false);
        return;
      }

      // Create initial race state with consistent odds
      const { error: raceError } = await supabase
        .from("horse_race_state")
        .insert({
          session_id: session.id,
          current_phase: "betting",
          bets: [],
          race_progress: { spades: 0, hearts: 0, diamonds: 0, clubs: 0 },
          odds: { spades: 4, hearts: 3, diamonds: 2, clubs: 1 },
          drawn_cards: [],
        });

      if (raceError) {
        toast.error("Failed to initialize race");
        setCreating(false);
        return;
      }

      toast.success("Session created!");
      navigate(`/game/horse-race/host/${session.id}`);
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create session");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticleBackground />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-2 text-gradient">
            🐎 Horse Race
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Bet on suits, watch the race, and dish out drinks!
          </p>

          <Card className="p-8 bg-gradient-card border-border">
            <h2 className="text-2xl font-bold mb-6">Host Setup</h2>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Name (Host)</label>
                <Input
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="Enter your name"
                  onKeyPress={(e) => e.key === "Enter" && handleCreateSession()}
                />
              </div>

              <div className="bg-muted/30 p-4 rounded-lg border border-border">
                <h3 className="font-semibold mb-2">How to Play:</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Players bet on a suit (♠️ ♥️ ♦️ ♣️) and amount (1-20 drinks)</li>
                  <li>Each card drawn moves that suit's "horse" forward</li>
                  <li>First suit to 8 wins!</li>
                  <li>Winners give out drinks = bet × odds</li>
                </ol>
              </div>

              <Button
                onClick={handleCreateSession}
                disabled={creating}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Game Session"
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HorseRaceSettings;
