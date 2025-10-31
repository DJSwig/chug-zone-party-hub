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
import { AnimatedDeck } from "@/components/AnimatedDeck";
import { PlayingCard } from "@/components/PlayingCard";
import { useGameSession } from "@/hooks/useGameSession";
import { HorseRaceBet, HorseRaceState, Suit, SessionPlayer } from "@/types/multiplayer";
import { ArrowLeft, Play, RotateCcw, Trophy, Plus, X, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SUIT_NAMES = {
  spades: "Spades",
  hearts: "Hearts",
  diamonds: "Diamonds",
  clubs: "Clubs",
};

const BET_AMOUNTS = [1, 5, 10, 15, 20];
const FINISH_LINE = 8;

const HorseRaceHost = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { session, players, loading } = useGameSession(sessionId || null);
  const [raceState, setRaceState] = useState<HorseRaceState | null>(null);
  const [racing, setRacing] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");

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

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim() || !sessionId) return;

    const { error } = await supabase
      .from("session_players")
      .insert({
        session_id: sessionId,
        player_name: newPlayerName.trim(),
        player_data: { manual: true },
      });

    if (error) {
      toast.error("Failed to add player");
      return;
    }

    setNewPlayerName("");
    toast.success(`${newPlayerName.trim()} added!`);
  };

  const handleRemovePlayer = async (playerId: string) => {
    const { error } = await supabase
      .from("session_players")
      .delete()
      .eq("id", playerId);

    if (error) {
      toast.error("Failed to remove player");
      return;
    }

    // Remove their bet too
    if (raceState && sessionId) {
      const bets = (raceState.bets as HorseRaceBet[]).filter(b => b.player_id !== playerId);
      await supabase
        .from("horse_race_state")
        .update({ bets: bets as any })
        .eq("session_id", sessionId);
    }

    toast.success("Player removed");
  };

  const handleSetBet = async (playerId: string, playerName: string, suit: Suit | null, amount: number) => {
    if (!sessionId || !raceState) return;

    const bets = raceState.bets as HorseRaceBet[];
    
    if (!suit) {
      // Remove bet
      const newBets = bets.filter(b => b.player_id !== playerId);
      await supabase
        .from("horse_race_state")
        .update({ bets: newBets as any })
        .eq("session_id", sessionId);
      return;
    }

    // Update or add bet (unlocked when changed)
    const newBets = [
      ...bets.filter(b => b.player_id !== playerId),
      { player_id: playerId, player_name: playerName, suit, amount, locked: false },
    ];

    await supabase
      .from("horse_race_state")
      .update({ bets: newBets as any })
      .eq("session_id", sessionId);
  };

  const handleLockBet = async (playerId: string) => {
    if (!sessionId || !raceState) return;

    const bets = raceState.bets as HorseRaceBet[];
    const bet = bets.find(b => b.player_id === playerId);
    if (!bet) return;

    const newBets = [
      ...bets.filter(b => b.player_id !== playerId),
      { ...bet, locked: true },
    ];

    await supabase
      .from("horse_race_state")
      .update({ bets: newBets as any })
      .eq("session_id", sessionId);
  };

  const startRace = async () => {
    if (!sessionId || !raceState) return;

    const bets = raceState.bets;
    if (bets.length === 0) {
      toast.error("Need at least one bet to start!");
      return;
    }

    setRacing(true);

    await supabase
      .from("game_sessions")
      .update({ status: "active" })
      .eq("id", sessionId);

    await supabase
      .from("horse_race_state")
      .update({ current_phase: "racing" })
      .eq("session_id", sessionId);

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

    // Keep odds consistent: 4:1, 3:1, 2:1, 1:1
    const consistentOdds = { spades: 4, hearts: 3, diamonds: 2, clubs: 1 };

    // Unlock all bets for next race
    const bets = raceState.bets as HorseRaceBet[];
    const unlockedBets = bets.map(bet => ({ ...bet, locked: false }));

    await supabase
      .from("horse_race_state")
      .update({
        current_phase: "betting",
        race_progress: { spades: 0, hearts: 0, diamonds: 0, clubs: 0 },
        drawn_cards: [],
        winner: null,
        odds: consistentOdds,
        bets: unlockedBets as any,
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

  // Sort: manual players first, then by join time
  const sortedPlayers = [...players].sort((a, b) => {
    const aManual = (a.player_data as any)?.manual;
    const bManual = (b.player_data as any)?.manual;
    if (aManual && !bManual) return -1;
    if (!aManual && bManual) return 1;
    return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime();
  });

  return (
    <div className="h-screen bg-background relative overflow-hidden flex flex-col">
      <ParticleBackground />
      
      <div className="container mx-auto px-4 py-3 relative z-10 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="hover:bg-primary/10"
            size="sm"
          >
            <ArrowLeft className="mr-2 h-3 w-3" />
            Exit
          </Button>
          <JoinCodeDisplay joinCode={session.join_code} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-3 flex-1 min-h-0">
          {/* Left: Players & Controls */}
          <div className="flex flex-col min-h-0">
            <Card className="p-3 bg-gradient-card border-border flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold">Players ({players.length})</h2>
              </div>

              {/* Add Player */}
              <div className="flex gap-2 mb-2">
                <Input
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddPlayer()}
                  placeholder="Add player..."
                  className="text-xs h-7"
                />
                <Button
                  onClick={handleAddPlayer}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 h-7 px-2"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              {/* Players List */}
              <div className="space-y-1.5 overflow-y-auto flex-1 min-h-0 pr-1 custom-scrollbar">
                {sortedPlayers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Add players or wait for joins...</p>
                ) : (
                  sortedPlayers.map((player) => {
                    const bet = bets.find(b => b.player_id === player.id);
                    const isManual = (player.player_data as any)?.manual;
                    
                    return (
                      <div
                        key={player.id}
                        className={`p-1.5 rounded-lg border ${
                          isManual 
                            ? "border-primary/50 bg-primary/5" 
                            : "border-border bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-xs flex items-center gap-1.5">
                            {player.player_name}
                            {isManual && <span className="text-[10px] text-primary">(host)</span>}
                            {bet?.locked && <Check className="w-3 h-3 text-green-500" />}
                          </div>
                          {raceState.current_phase === "betting" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemovePlayer(player.id)}
                              className="h-5 w-5 hover:text-destructive"
                            >
                              <X className="w-2.5 h-2.5" />
                            </Button>
                          )}
                        </div>

                        {raceState.current_phase === "betting" && (
                          <>
                            <div className="grid grid-cols-2 gap-1.5 mt-1">
                              <Select
                                value={bet?.suit || ""}
                                onValueChange={(v) => handleSetBet(player.id, player.player_name, v as Suit, bet?.amount || 5)}
                              >
                                <SelectTrigger className="h-6 text-[10px]">
                                  <SelectValue placeholder="Suit" />
                                </SelectTrigger>
                                <SelectContent>
                                  {suits.map((suit) => (
                                    <SelectItem key={suit} value={suit} className="text-xs">
                                      {SUIT_NAMES[suit]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Select
                                value={bet?.amount?.toString() || "5"}
                                onValueChange={(v) => handleSetBet(player.id, player.player_name, bet?.suit || null, parseInt(v))}
                                disabled={!bet?.suit}
                              >
                                <SelectTrigger className="h-6 text-[10px]">
                                  <SelectValue placeholder="Amount" />
                                </SelectTrigger>
                                <SelectContent>
                                  {BET_AMOUNTS.map((amount) => (
                                    <SelectItem key={amount} value={amount.toString()} className="text-xs">
                                      {amount}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {bet && !bet.locked && (
                              <Button
                                onClick={() => handleLockBet(player.id)}
                                size="sm"
                                className="w-full mt-1.5 h-6 text-[10px] bg-primary hover:bg-primary/90"
                              >
                                Lock Bet
                              </Button>
                            )}
                          </>
                        )}

                        {bet && raceState.current_phase !== "betting" && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <PlayingCard suit={bet.suit} size="sm" className="scale-75" />
                            <span className="text-[10px] text-muted-foreground">× {bet.amount}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Right: Race Track & Odds */}
          <div className="flex flex-col gap-2 min-h-0">
            <Card className="p-3 bg-gradient-card border-border flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold">🏁 Race Track</h2>
                <div className="text-[10px] text-muted-foreground">
                  {raceState.current_phase === "betting" && "Betting Phase"}
                  {raceState.current_phase === "racing" && "Racing!"}
                  {raceState.current_phase === "finished" && "Race Complete"}
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] gap-3 items-center flex-1 min-h-0 overflow-hidden">
                {/* Deck */}
                <div className="flex items-center justify-center flex-shrink-0">
                  <AnimatedDeck 
                    drawnCards={raceState.drawn_cards}
                    isRacing={raceState.current_phase === "racing"}
                  />
                </div>

                {/* Track */}
                <div className="overflow-hidden min-w-0">
                  <HorseRaceTrack 
                    progress={raceState.race_progress}
                    finishLine={FINISH_LINE}
                  />
                </div>
              </div>

              <div className="mt-2 flex gap-2">
                {raceState.current_phase === "betting" && (
                  <Button
                    onClick={startRace}
                    disabled={racing || bets.length === 0}
                    className="flex-1 bg-primary hover:bg-primary/90 text-sm h-8"
                  >
                    <Play className="mr-1.5 h-3 w-3" />
                    Start Race
                  </Button>
                )}
                {raceState.current_phase === "finished" && (
                  <Button
                    onClick={resetRace}
                    className="flex-1 bg-primary hover:bg-primary/90 text-sm h-8"
                  >
                    <RotateCcw className="mr-1.5 h-3 w-3" />
                    Next Race
                  </Button>
                )}
              </div>
            </Card>

            {/* Compact Odds Display */}
            <Card className="p-2 bg-gradient-card border-border flex-shrink-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold">Odds:</span>
                {suits.map((suit) => (
                  <div key={suit} className="flex items-center gap-1">
                    <PlayingCard suit={suit} size="sm" className="scale-[0.6]" />
                    <span className="text-[10px] font-semibold">{raceState.odds[suit]}:1</span>
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
            <DialogTitle className="text-center text-3xl flex items-center justify-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              {winningSuit && <PlayingCard suit={winningSuit} size="md" />}
              Wins!
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
