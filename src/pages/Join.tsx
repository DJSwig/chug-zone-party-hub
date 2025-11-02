import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ParticleBackground } from "@/components/ParticleBackground";
import { validateJoinCode } from "@/utils/joinCodeGenerator";
import { Loader2 } from "lucide-react";

const Join = () => {
  const [joinCode, setJoinCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!validateJoinCode(joinCode)) {
      toast.error("Please enter a valid 4-6 character code");
      return;
    }

    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setLoading(true);

    try {
      // Find session (allow joining active sessions too)
      const { data: session, error: sessionError } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("join_code", joinCode.toUpperCase())
        .in("status", ["waiting", "active"])
        .single();

      if (sessionError || !session) {
        toast.error("Session not found");
        setLoading(false);
        return;
      }

      // Add player to session
      const { data: player, error: playerError } = await supabase
        .from("session_players")
        .insert({
          session_id: session.id,
          player_name: playerName.trim(),
          player_data: {},
        })
        .select()
        .single();

      if (playerError) {
        toast.error("Failed to join session");
        setLoading(false);
        return;
      }

      toast.success("Joined successfully!");
      
      // Navigate to appropriate player view based on game type
      if (session.game_type === "horse-race") {
        navigate(`/game/horse-race/player/${session.id}/${player.id}`);
      } else if (session.game_type === "beer-pong") {
        navigate(`/game/beer-pong/player/${session.id}/${player.id}`);
      } else if (session.game_type === "ride-bus") {
        navigate(`/game/ride-bus/player/${session.id}/${player.id}`);
      } else {
        // Fallback for any other game types
        toast.info("Game type not recognized, staying on join screen");
      }
    } catch (error) {
      console.error("Error joining session:", error);
      toast.error("Failed to join session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticleBackground />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-md mx-auto">
          <h1 className="text-5xl font-bold text-center mb-2 text-gradient">
            ChugZone
          </h1>
          <p className="text-center text-muted-foreground mb-8">Join the party</p>

          <Card className="p-6 bg-gradient-card border-border">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Game Code</label>
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g., ABC12)"
                  className="text-center text-2xl font-mono tracking-widest uppercase"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Your Name</label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  onKeyPress={(e) => e.key === "Enter" && handleJoin()}
                />
              </div>

              <Button
                onClick={handleJoin}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Game"
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Join;
