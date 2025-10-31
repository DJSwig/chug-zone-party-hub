import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ParticleBackground } from "@/components/ParticleBackground";
import { JoinCodeDisplay } from "@/components/JoinCodeDisplay";
import { HorseRaceTrack } from "@/components/HorseRaceTrack";
import { useGameSession } from "@/hooks/useGameSession";
import { HorseRaceBet, HorseRaceState, Suit } from "@/types/multiplayer";
import { ArrowLeft, Play, RotateCcw, Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SUIT_EMOJIS = {
  spades: "♠️",
  hearts: "♥️",
  diamonds: "♦️",
  clubs: "♣️",
};

const FINISH_LINE = 8;

const HorseRaceHost = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { session, players, loading } = useGameSession(sessionId || null);
  const [raceState, setRaceState] = useState<HorseRaceState | null>(null);
  const [racing, setRacing] = useState(false);
  const [showVictory, setShowVictory] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const fetchRaceState = async () => {
      const { data, error } = await supabase
        .from("horse_race_state")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      if (!error && data) {
        setRaceState(data as unknown as HorseRaceState);
      }
    };

    fetchRaceState();

    // Subscribe to race state updates
    const channel = supabase
      .channel(`race-state-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "horse_race_state",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setRaceState(payload.new as unknown as HorseRaceState);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const startRace = async () => {
    if (!sessionId || !raceState) return;

    const bets = raceState.bets;
    if (bets.length === 0) {
      toast.error("Need at least one bet to start!");
      return;
    }

    setRacing(true);

    // Update session status
    await supabase
      .from("game_sessions")
      .update({ status: "active" })
      .eq("id", sessionId);

    // Update race phase
    await supabase
      .from("horse_race_state")
      .update({ current_phase: "racing" })
      .eq("session_id", sessionId);

    // Simulate race
    simulateRace();
  };

  const simulateRace = async () => {
    if (!sessionId || !raceState) return;

    const suits: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
    const deck = suits.flatMap((suit) => Array(13).fill(suit));
    const shuffled = deck.sort(() => Math.random() - 0.5);

    let progress = { ...raceState.race_progress };
    let winner: Suit | null = null;

    for (const suit of shuffled) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      progress[suit]++;

      await supabase
        .from("horse_race_state")
        .update({ 
          race_progress: progress,
          drawn_cards: [...raceState.drawn_cards, suit]
        })
        .eq("session_id", sessionId);

      if (progress[suit] >= FINISH_LINE && !winner) {
        winner = suit;
        break;
      }
    }

    if (winner) {
      await supabase
        .from("horse_race_state")
        .update({ 
          current_phase: "finished",
          winner
        })
        .eq("session_id", sessionId);

      await supabase
        .from("game_sessions")
        .update({ status: "finished" })
        .eq("id", sessionId);

      setShowVictory(true);
    }

    setRacing(false);
  };

  const resetRace = async () => {
    if (!sessionId || !raceState) return;

    // Adjust odds based on winner
    const newOdds = { ...raceState.odds };
    if (raceState.winner) {
      const winner = raceState.winner as Suit;
      // Decrease winner's odds, increase others slightly
      newOdds[winner] = Math.max(1, newOdds[winner] - 0.5);
      suits.forEach((suit) => {
        if (suit !== winner) {
          newOdds[suit as Suit] = Math.min(5, newOdds[suit as Suit] + 0.2);
        }
      });
    }

    await supabase
      .from("horse_race_state")
      .update({
        current_phase: "betting",
        race_progress: { spades: 0, hearts: 0, diamonds: 0, clubs: 0 },
        drawn_cards: [],
        winner: null,
        odds: newOdds,
      })
      .eq("session_id", sessionId);

    await supabase
      .from("game_sessions")
      .update({ status: "waiting" })
      .eq("id", sessionId);

    setShowVictory(false);
    toast.success("Ready for next race!");
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!session || !raceState) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Session not found</div>;
  }

  const suits: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
  const bets = raceState.bets as HorseRaceBet[];
  const winningSuit = raceState.winner as Suit | null;
  const winners = winningSuit ? bets.filter(bet => bet.suit === winningSuit) : [];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticleBackground />
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Exit
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Join Code & Players */}
          <div className="space-y-6">
            <JoinCodeDisplay joinCode={session.join_code} />

            <Card className="p-5 bg-gradient-card border-border">
              <h2 className="text-xl font-bold mb-4">
                Players ({players.length})
              </h2>
              {players.length === 0 ? (
                <p className="text-sm text-muted-foreground">Waiting for players...</p>
              ) : (
                <div className="space-y-2">
                  {players.map((player) => {
                    const bet = bets.find(b => b.player_id === player.id);
                    return (
                      <div
                        key={player.id}
                        className="px-3 py-2 rounded-lg border border-border bg-muted/30"
                      >
                        <div className="font-medium">{player.player_name}</div>
                        {bet && (
                          <div className="text-xs text-muted-foreground">
                            {SUIT_EMOJIS[bet.suit]} × {bet.amount} drinks
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Center: Race Track */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-gradient-card border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">🐎 Race Track</h2>
                <div className="text-sm text-muted-foreground">
                  {raceState.current_phase === "betting" && "Betting Phase"}
                  {raceState.current_phase === "racing" && "Racing!"}
                  {raceState.current_phase === "finished" && "Race Complete"}
                </div>
              </div>

              <HorseRaceTrack 
                progress={raceState.race_progress}
                finishLine={FINISH_LINE}
              />

              <div className="mt-6 flex gap-3">
                {raceState.current_phase === "betting" && (
                  <Button
                    onClick={startRace}
                    disabled={racing || bets.length === 0}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Race
                  </Button>
                )}
                {raceState.current_phase === "finished" && (
                  <Button
                    onClick={resetRace}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Next Race
                  </Button>
                )}
              </div>
            </Card>

            {/* Odds Display */}
            <Card className="p-5 bg-gradient-card border-border">
              <h3 className="text-lg font-bold mb-3">Current Odds</h3>
              <div className="grid grid-cols-4 gap-3">
                {suits.map((suit) => (
                  <div key={suit} className="text-center p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="text-2xl mb-1">{SUIT_EMOJIS[suit]}</div>
                    <div className="text-sm font-semibold">{raceState.odds[suit]}:1</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Victory Modal */}
      <Dialog open={showVictory} onOpenChange={setShowVictory}>
        <DialogContent className="bg-gradient-card border-2 border-primary">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">
              <Trophy className="inline-block mr-2 h-8 w-8 text-primary" />
              {winningSuit && SUIT_EMOJIS[winningSuit]} Wins!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {winners.length > 0 ? (
              <>
                <p className="text-center text-lg">Winners:</p>
                {winners.map((winner) => (
                  <div key={winner.player_id} className="p-4 rounded-lg bg-primary/10 border border-primary">
                    <div className="font-bold text-lg">{winner.player_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Bet: {winner.amount} drinks × {winningSuit && raceState.odds[winningSuit]}:1 = 
                      <span className="font-bold text-primary ml-1">
                        {winner.amount * (winningSuit ? raceState.odds[winningSuit] : 1)} drinks to give!
                      </span>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-center text-muted-foreground">No one bet on the winner!</p>
            )}
            <Button onClick={resetRace} className="w-full bg-primary hover:bg-primary/90">
              Next Race
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HorseRaceHost;
