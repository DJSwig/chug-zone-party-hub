import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ParticleBackground } from "@/components/ParticleBackground";
import { HorseRaceTrack } from "@/components/HorseRaceTrack";
import { HorseRaceState, Suit } from "@/types/multiplayer";
import { Check, Trophy } from "lucide-react";

const SUIT_CONFIG = {
  spades: { emoji: "♠️", name: "Spades" },
  hearts: { emoji: "♥️", name: "Hearts" },
  diamonds: { emoji: "♦️", name: "Diamonds" },
  clubs: { emoji: "♣️", name: "Clubs" },
};

const BET_AMOUNTS = [1, 5, 10, 15, 20];
const FINISH_LINE = 8;

const HorseRacePlayer = () => {
  const { sessionId, playerId } = useParams();
  const [raceState, setRaceState] = useState<HorseRaceState | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [selectedSuit, setSelectedSuit] = useState<Suit | "">("");
  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [betLocked, setBetLocked] = useState(false);

  useEffect(() => {
    if (!sessionId || !playerId) return;

    const fetchData = async () => {
      // Get player name
      const { data: playerData } = await supabase
        .from("session_players")
        .select("player_name")
        .eq("id", playerId)
        .single();

      if (playerData) {
        setPlayerName(playerData.player_name);
      }

      // Get race state
      const { data: raceData } = await supabase
        .from("horse_race_state")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      if (raceData) {
        setRaceState(raceData as unknown as HorseRaceState);
        
        // Check if player has already bet
        const bets = raceData.bets as any[];
        const existingBet = bets.find(b => b.player_id === playerId);
        if (existingBet) {
          setSelectedSuit(existingBet.suit);
          setSelectedAmount(existingBet.amount);
          setBetLocked(true);
        }
      }
    };

    fetchData();

    // Subscribe to race state updates
    const channel = supabase
      .channel(`race-state-player-${sessionId}`)
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
            const newState = payload.new as unknown as HorseRaceState;
            setRaceState(newState);
            
            // Reset bet lock if race restarts
            if (newState.current_phase === "betting") {
              setBetLocked(false);
              setSelectedSuit("");
              setSelectedAmount(5);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, playerId]);

  const placeBet = async () => {
    if (!selectedSuit || !sessionId || !playerId || !raceState) {
      toast.error("Please select a suit");
      return;
    }

    const bets = raceState.bets as any[];
    const newBets = [
      ...bets.filter(b => b.player_id !== playerId),
      {
        player_id: playerId,
        player_name: playerName,
        suit: selectedSuit,
        amount: selectedAmount,
      },
    ];

    const { error } = await supabase
      .from("horse_race_state")
      .update({ bets: newBets as any })
      .eq("session_id", sessionId);

    if (error) {
      toast.error("Failed to place bet");
      return;
    }

    setBetLocked(true);
    toast.success("Bet placed!");
  };

  if (!raceState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const suits: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
  const winningSuit = raceState.winner as Suit | null;
  const myBet = (raceState.bets as any[]).find(b => b.player_id === playerId);
  const didIWin = winningSuit && myBet && myBet.suit === winningSuit;
  const payout = didIWin ? myBet.amount * raceState.odds[winningSuit] : 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticleBackground />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient mb-2">🐎 Horse Race</h1>
            <p className="text-lg text-muted-foreground">Welcome, {playerName}!</p>
          </div>

          {/* Betting Phase */}
          {raceState.current_phase === "betting" && (
            <Card className="p-6 bg-gradient-card border-border">
              <h2 className="text-2xl font-bold mb-4">Place Your Bet</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Choose Your Suit</label>
                  <div className="grid grid-cols-2 gap-3">
                    {suits.map((suit) => (
                      <button
                        key={suit}
                        onClick={() => !betLocked && setSelectedSuit(suit)}
                        disabled={betLocked}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedSuit === suit
                            ? "border-primary bg-primary/10 shadow-glow-cyan"
                            : "border-border bg-muted/30 hover:border-primary/50"
                        } ${betLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="text-4xl mb-2">{SUIT_CONFIG[suit].emoji}</div>
                        <div className="font-semibold">{SUIT_CONFIG[suit].name}</div>
                        <div className="text-xs text-muted-foreground">
                          {raceState.odds[suit]}:1 odds
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Bet Amount (drinks)</label>
                  <Select
                    value={selectedAmount.toString()}
                    onValueChange={(v) => !betLocked && setSelectedAmount(parseInt(v))}
                    disabled={betLocked}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BET_AMOUNTS.map((amount) => (
                        <SelectItem key={amount} value={amount.toString()}>
                          {amount} drinks
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!betLocked ? (
                  <Button
                    onClick={placeBet}
                    disabled={!selectedSuit}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Lock In Bet
                  </Button>
                ) : (
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary text-center">
                    <Check className="inline-block mr-2 h-5 w-5" />
                    Bet Locked! Waiting for race to start...
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Racing Phase */}
          {raceState.current_phase === "racing" && (
            <Card className="p-6 bg-gradient-card border-border">
              <h2 className="text-2xl font-bold mb-4 text-center">🏁 Race in Progress!</h2>
              <HorseRaceTrack 
                progress={raceState.race_progress}
                finishLine={FINISH_LINE}
              />
              {myBet && (
                <div className="mt-4 text-center p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="text-sm text-muted-foreground">Your Bet:</div>
                  <div className="text-lg font-bold">
                    {SUIT_CONFIG[myBet.suit as Suit].emoji} {myBet.amount} drinks
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Finished Phase */}
          {raceState.current_phase === "finished" && (
            <Card className="p-6 bg-gradient-card border-2 border-primary">
              <div className="text-center space-y-4">
                <Trophy className="inline-block h-16 w-16 text-primary" />
                <h2 className="text-3xl font-bold">
                  {winningSuit && SUIT_CONFIG[winningSuit].emoji} {winningSuit && SUIT_CONFIG[winningSuit].name} Wins!
                </h2>
                
                {didIWin ? (
                  <div className="p-6 rounded-lg bg-primary/10 border border-primary">
                    <div className="text-2xl font-bold text-primary mb-2">You Won! 🎉</div>
                    <div className="text-lg">
                      Give out <span className="font-bold text-primary">{payout} drinks</span>!
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      ({myBet.amount} × {winningSuit && raceState.odds[winningSuit]}:1 odds)
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="text-lg text-muted-foreground">
                      Better luck next race!
                    </div>
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  Waiting for host to start next race...
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HorseRacePlayer;
