import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ParticleBackground } from "@/components/ParticleBackground";
import { ShotController } from "@/components/ShotController";
import { supabase } from "@/integrations/supabase/client";
import { BeerPongState } from "@/types/beerPong";
import { useGameSession } from "@/hooks/useGameSession";

const BeerPongPlayer = () => {
  const { sessionId, playerId } = useParams();
  const { players } = useGameSession(sessionId || null);
  const [beerPongState, setBeerPongState] = useState<BeerPongState | null>(null);
  const [playerName, setPlayerName] = useState("");

  const currentPlayer = players.find(p => p.id === playerId);

  useEffect(() => {
    if (currentPlayer) {
      setPlayerName(currentPlayer.player_name);
    }
  }, [currentPlayer]);

  useEffect(() => {
    if (!sessionId) return;

    const fetchState = async () => {
      const { data, error } = await supabase
        .from('beer_pong_state')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) {
        console.error("Error fetching state:", error);
        return;
      }

      setBeerPongState(data as any);
    };

    fetchState();

    const channel = supabase
      .channel(`beer-pong-player-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'beer_pong_state',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setBeerPongState(payload.new as any);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const handleShoot = async (power: number, angle: number) => {
    if (!sessionId || !playerId || !beerPongState) return;

    const shot = {
      playerId,
      playerName,
      power,
      angle,
      hit: false,
      timestamp: Date.now(),
    };

    // The host will handle the shot simulation
    // For now, just update the state to trigger the animation
    await supabase
      .from('beer_pong_state')
      .update({
        game_state: {
          ...beerPongState.game_state,
          shots: [...beerPongState.game_state.shots, shot],
        } as any,
      })
      .eq('session_id', sessionId);
  };

  if (!beerPongState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  const isMyTurn = beerPongState.current_phase === 'playing';

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-2xl">
        <Card className="p-6 bg-gradient-card border-primary/20 shadow-glow-cyan">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2 text-primary">
              🏓 {playerName}
            </h1>
            <p className="text-muted-foreground">
              {beerPongState.current_phase === 'lobby' && "Waiting for game to start..."}
              {beerPongState.current_phase === 'playing' && (isMyTurn ? "Your turn!" : "Wait for your turn...")}
              {beerPongState.current_phase === 'finished' && "Game finished!"}
            </p>
          </div>

          {beerPongState.current_phase === 'playing' && (
            <>
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 rounded-lg bg-background/50 border border-primary/10">
                    <p className="text-sm text-muted-foreground">Team 1 Cups</p>
                    <p className="text-2xl font-bold text-primary">
                      {beerPongState.game_state.team1.cups.filter(c => !c.hit).length}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-background/50 border border-primary/10">
                    <p className="text-sm text-muted-foreground">Team 2 Cups</p>
                    <p className="text-2xl font-bold text-primary">
                      {beerPongState.game_state.team2.cups.filter(c => !c.hit).length}
                    </p>
                  </div>
                </div>
              </div>

              <ShotController
                onShoot={handleShoot}
                disabled={!isMyTurn || beerPongState.current_phase !== 'playing'}
              />
            </>
          )}

          {beerPongState.current_phase === 'finished' && (
            <div className="text-center p-6 rounded-lg bg-primary/20 border border-primary">
              <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
              <p className="text-lg">
                Winner: {beerPongState.game_state.team1.cups.every(c => c.hit) ? 'Team 2' : 'Team 1'}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BeerPongPlayer;
