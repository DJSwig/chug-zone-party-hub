import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, SkipForward } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { JoinCodeDisplay } from "@/components/JoinCodeDisplay";
import { PlayingCard } from "@/components/PlayingCard";
import { useGameSession } from "@/hooks/useGameSession";
import { useCardBack } from "@/hooks/useCardBack";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { RideBusState, RideBusPlayerCards } from "@/types/multiplayer";

const SUITS = ["hearts", "clubs", "diamonds", "spades"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export default function RideBusHost() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { session, players, loading } = useGameSession(sessionId || null);
  const { cardBackUrl } = useCardBack();
  const [gameState, setGameState] = useState<RideBusState | null>(null);
  const [drawnDeck, setDrawnDeck] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!sessionId) return;

    const fetchGameState = async () => {
      const { data } = await supabase
        .from("ride_bus_state")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      if (data) {
        setGameState(data as any);
      }
    };

    fetchGameState();

    const channel = supabase
      .channel(`ride-bus-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ride_bus_state",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setGameState(payload.new as any);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const drawCard = (): string => {
    let card: string;
    do {
      const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
      const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
      card = `${rank}-${suit}`;
    } while (drawnDeck.has(card));
    
    setDrawnDeck(new Set([...drawnDeck, card]));
    return card;
  };

  const handleStartGame = async () => {
    if (!sessionId || !session || players.length < 2) {
      toast.error("Need at least 2 players to start");
      return;
    }

    await supabase
      .from("game_sessions")
      .update({ status: "active" })
      .eq("id", sessionId);

    toast.success("Game started!");
  };

  const handleNextTurn = async () => {
    if (!gameState || !sessionId) return;

    const currentPlayerIndex = gameState.current_player_index;
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    const isRoundComplete = nextPlayerIndex === 0;

    let updates: any = {
      current_player_index: nextPlayerIndex,
    };

    if (isRoundComplete && gameState.current_round < 4) {
      // Move to next round
      const roundPhases = ["round1", "round2", "round3", "round4"];
      updates.current_round = gameState.current_round + 1;
      updates.current_phase = roundPhases[gameState.current_round];
    } else if (isRoundComplete && gameState.current_round === 4) {
      // Move to bus phase
      updates.current_phase = "bus";
      const busCards = Array.from({ length: 8 }, () => drawCard());
      updates.bus_cards = busCards;
      updates.flipped_bus_cards = 0;
    }

    await supabase
      .from("ride_bus_state")
      .update(updates)
      .eq("session_id", sessionId);
  };

  const handlePlayerChoice = async (playerId: string, choice: string) => {
    if (!gameState || !sessionId) return;

    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    const card = drawCard();
    const playerCards = (gameState.player_cards as RideBusPlayerCards[]) || [];
    const currentPlayer = playerCards.find((pc) => pc.player_id === playerId) || {
      player_id: playerId,
      player_name: player.player_name,
      cards: [],
      drinks_given: 0,
      drinks_taken: 0,
    };

    let isCorrect = false;
    const [rank, suit] = card.split("-");

    // Determine if choice is correct based on current phase
    if (gameState.current_phase === "round1") {
      const isRed = suit === "hearts" || suit === "diamonds";
      isCorrect = (choice === "red" && isRed) || (choice === "black" && !isRed);
    } else if (gameState.current_phase === "round2") {
      const lastCard = currentPlayer.cards[currentPlayer.cards.length - 1];
      const lastRank = RANKS.indexOf(lastCard.split("-")[0]);
      const currentRank = RANKS.indexOf(rank);
      isCorrect = (choice === "higher" && currentRank > lastRank) || (choice === "lower" && currentRank < lastRank);
    } else if (gameState.current_phase === "round3") {
      const card1Rank = RANKS.indexOf(currentPlayer.cards[0].split("-")[0]);
      const card2Rank = RANKS.indexOf(currentPlayer.cards[1].split("-")[0]);
      const currentRank = RANKS.indexOf(rank);
      const min = Math.min(card1Rank, card2Rank);
      const max = Math.max(card1Rank, card2Rank);
      const isInside = currentRank > min && currentRank < max;
      isCorrect = (choice === "inside" && isInside) || (choice === "outside" && !isInside);
    } else if (gameState.current_phase === "round4") {
      isCorrect = choice === suit;
    }

    currentPlayer.cards.push(card);
    if (isCorrect) {
      currentPlayer.drinks_given += gameState.current_round;
    } else {
      currentPlayer.drinks_taken += gameState.current_round;
    }

    const updatedPlayerCards = playerCards.filter((pc) => pc.player_id !== playerId);
    updatedPlayerCards.push(currentPlayer);

    await supabase
      .from("ride_bus_state")
      .update({
        player_cards: updatedPlayerCards,
        choices: [
          ...gameState.choices,
          {
            player_id: playerId,
            player_name: player.player_name,
            choice,
            result: isCorrect ? "correct" : "wrong",
            card,
          },
        ],
      })
      .eq("session_id", sessionId);

    toast.success(
      `${player.player_name} guessed ${choice} and got ${rank}${suit === "hearts" ? "♥️" : suit === "diamonds" ? "♦️" : suit === "clubs" ? "♣️" : "♠️"} - ${isCorrect ? "Correct! ✅" : "Wrong! ❌"}`
    );
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-xl text-foreground">Loading...</div>
        </div>
      </PageTransition>
    );
  }

  if (!session) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-xl text-foreground">Session not found</div>
        </div>
      </PageTransition>
    );
  }

  const currentPlayer = players[gameState?.current_player_index || 0];
  const playerCards = (gameState?.player_cards as RideBusPlayerCards[]) || [];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Leave
            </Button>
            
            {session.status === "waiting" && <JoinCodeDisplay code={session.join_code} />}
            
            <div className="text-sm text-muted-foreground">
              {players.length} Player{players.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="max-w-7xl mx-auto p-6">
          {session.status === "waiting" ? (
            <Card className="p-8 text-center bg-card/80">
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                Waiting for players...
              </h2>
              <p className="text-muted-foreground mb-6">
                {players.length} player{players.length !== 1 ? "s" : ""} joined
              </p>
              <Button
                onClick={handleStartGame}
                disabled={players.length < 2}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 text-xl"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </Button>
            </Card>
          ) : (
            <>
              {/* Round Indicator */}
              <div className="text-center mb-6">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
                  {gameState?.current_phase === "round1" && "Round 1: Red or Black"}
                  {gameState?.current_phase === "round2" && "Round 2: Higher or Lower"}
                  {gameState?.current_phase === "round3" && "Round 3: Inside or Outside"}
                  {gameState?.current_phase === "round4" && "Round 4: Pick a Suit"}
                  {gameState?.current_phase === "bus" && "Final Phase: Ride the Bus! 🚌"}
                </h2>
                {currentPlayer && (
                  <p className="text-xl text-foreground">
                    Current turn: <span className="text-primary font-bold">{currentPlayer.player_name}</span>
                  </p>
                )}
              </div>

              {/* Player Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {players.map((player) => {
                  const pc = playerCards.find((p) => p.player_id === player.id);
                  return (
                    <Card
                      key={player.id}
                      className={`p-4 bg-card/80 ${
                        currentPlayer?.id === player.id
                          ? "border-primary shadow-[0_0_30px_hsl(var(--primary)/0.5)]"
                          : "border-border"
                      }`}
                    >
                      <h3 className="font-bold text-foreground mb-2">{player.player_name}</h3>
                      <div className="flex gap-1 mb-2 flex-wrap">
                        {pc?.cards.map((card, idx) => (
                          <PlayingCard key={idx} card={card} size="xs" />
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <div>Gave: {pc?.drinks_given || 0} 🍺</div>
                        <div>Took: {pc?.drinks_taken || 0} 🍺</div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleNextTurn}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-4"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Next Turn
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
