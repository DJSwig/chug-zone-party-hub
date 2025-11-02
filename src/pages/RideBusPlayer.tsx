import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/PageTransition";
import { PlayingCard } from "@/components/PlayingCard";
import { useGameSession } from "@/hooks/useGameSession";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { RideBusState, RideBusPlayerCards } from "@/types/multiplayer";

export default function RideBusPlayer() {
  const { sessionId, playerId } = useParams();
  const { session, players } = useGameSession(sessionId || null);
  const [gameState, setGameState] = useState<RideBusState | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const currentPlayer = players.find((p) => p.id === playerId);
  const playerCards = (gameState?.player_cards as RideBusPlayerCards[])?.find(
    (pc) => pc.player_id === playerId
  );

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
      .channel(`ride-bus-player-${sessionId}`)
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
            setSelectedChoice(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const handleChoice = async (choice: string) => {
    if (!sessionId || !playerId) return;
    
    setSelectedChoice(choice);
    
    // Send choice to host
    await supabase
      .from("ride_bus_state")
      .update({
        choices: [
          ...(gameState?.choices || []),
          {
            player_id: playerId,
            player_name: currentPlayer?.player_name || "Unknown",
            choice,
          },
        ],
      })
      .eq("session_id", sessionId);
  };

  const isMyTurn = gameState && players[gameState.current_player_index]?.id === playerId;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="p-8 bg-card/95 backdrop-blur-sm border-border">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
                {currentPlayer?.player_name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {gameState?.current_phase === "round1" && "Round 1: Red or Black"}
                {gameState?.current_phase === "round2" && "Round 2: Higher or Lower"}
                {gameState?.current_phase === "round3" && "Round 3: Inside or Outside"}
                {gameState?.current_phase === "round4" && "Round 4: Pick a Suit"}
                {gameState?.current_phase === "bus" && "Ride the Bus! 🚌"}
              </p>
            </div>

            {/* Player's Cards */}
            {playerCards && playerCards.cards.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Your Cards</h3>
                <div className="flex gap-2 justify-center flex-wrap">
                  {playerCards.cards.map((card, idx) => (
                    <PlayingCard key={idx} card={card} size="sm" />
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex justify-around mb-6 p-4 bg-background/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{playerCards?.drinks_given || 0}</div>
                <div className="text-xs text-muted-foreground">Gave</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{playerCards?.drinks_taken || 0}</div>
                <div className="text-xs text-muted-foreground">Took</div>
              </div>
            </div>

            {/* Turn Indicator */}
            <div className="mb-6">
              {isMyTurn ? (
                <div className="p-4 rounded-lg bg-primary/20 border-2 border-primary text-center animate-pulse">
                  <p className="text-lg font-bold text-primary">Your Turn!</p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">Waiting for other players...</p>
                </div>
              )}
            </div>

            {/* Choice Buttons */}
            {isMyTurn && !selectedChoice && (
              <div className="space-y-3">
                {gameState?.current_phase === "round1" && (
                  <>
                    <Button
                      onClick={() => handleChoice("red")}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg"
                    >
                      ❤️ Red
                    </Button>
                    <Button
                      onClick={() => handleChoice("black")}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-6 text-lg"
                    >
                      ♠️ Black
                    </Button>
                  </>
                )}

                {gameState?.current_phase === "round2" && (
                  <>
                    <Button
                      onClick={() => handleChoice("higher")}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg"
                    >
                      ⬆️ Higher
                    </Button>
                    <Button
                      onClick={() => handleChoice("lower")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg"
                    >
                      ⬇️ Lower
                    </Button>
                  </>
                )}

                {gameState?.current_phase === "round3" && (
                  <>
                    <Button
                      onClick={() => handleChoice("inside")}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg"
                    >
                      📍 Inside
                    </Button>
                    <Button
                      onClick={() => handleChoice("outside")}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 text-lg"
                    >
                      🌐 Outside
                    </Button>
                  </>
                )}

                {gameState?.current_phase === "round4" && (
                  <>
                    <Button
                      onClick={() => handleChoice("hearts")}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4"
                    >
                      ♥️ Hearts
                    </Button>
                    <Button
                      onClick={() => handleChoice("clubs")}
                      className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4"
                    >
                      ♣️ Clubs
                    </Button>
                    <Button
                      onClick={() => handleChoice("diamonds")}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4"
                    >
                      ♦️ Diamonds
                    </Button>
                    <Button
                      onClick={() => handleChoice("spades")}
                      className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-4"
                    >
                      ♠️ Spades
                    </Button>
                  </>
                )}
              </div>
            )}

            {selectedChoice && (
              <div className="p-4 rounded-lg bg-accent/20 border border-accent text-center">
                <p className="text-sm text-foreground">
                  Waiting for host to reveal...
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
