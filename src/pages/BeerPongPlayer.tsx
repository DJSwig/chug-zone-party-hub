import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ParticleBackground } from "@/components/ParticleBackground";
import { ShotController } from "@/components/ShotController";
import { supabase } from "@/integrations/supabase/client";
import { BeerPongState } from "@/types/beerPong";
import { useGameSession } from "@/hooks/useGameSession";
import { Trophy, Target, Timer } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <ParticleBackground />
        <div className="text-center relative z-10">
          <div className="animate-pulse text-6xl mb-4">🏓</div>
          <p className="text-xl text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  const isMyTurn = beerPongState.current_phase === 'playing';
  const team1Cups = beerPongState.game_state.team1.cups.filter(c => !c.hit).length;
  const team2Cups = beerPongState.game_state.team2.cups.filter(c => !c.hit).length;
  const currentTeamName = beerPongState.game_state.currentTurn === 'team1' ? 'Team 1' : 'Team 2';

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-2xl space-y-6">
        {/* Player Header */}
        <Card className="p-6 bg-gradient-card border-primary/20 shadow-glow-cyan text-center">
          <div className="text-5xl mb-3">🏓</div>
          <h1 className="text-3xl font-bold mb-2 text-gradient">
            {playerName}
          </h1>
          
          {beerPongState.current_phase === 'lobby' && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Timer className="w-4 h-4 animate-pulse" />
              <p>Waiting for game to start...</p>
            </div>
          )}
          
          {beerPongState.current_phase === 'playing' && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <p className={`font-semibold ${isMyTurn ? 'text-primary animate-pulse' : 'text-muted-foreground'}`}>
                  {isMyTurn ? "Your turn! 🎯" : `${currentTeamName}'s turn`}
                </p>
              </div>
            </div>
          )}
          
          {beerPongState.current_phase === 'finished' && (
            <div className="flex items-center justify-center gap-2 text-primary">
              <Trophy className="w-5 h-5 animate-bounce" />
              <p className="font-semibold">Game finished!</p>
            </div>
          )}
        </Card>

        {/* Score Display */}
        {(beerPongState.current_phase === 'playing' || beerPongState.current_phase === 'finished') && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6 text-center bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
              <h3 className="text-sm font-semibold text-primary mb-2">
                {beerPongState.game_state.team1.name}
              </h3>
              <div className="text-4xl font-bold mb-1">{team1Cups}</div>
              <p className="text-xs text-muted-foreground">cups left</p>
            </Card>
            
            <Card className="p-6 text-center bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border-cyan-500/20">
              <h3 className="text-sm font-semibold text-cyan-400 mb-2">
                {beerPongState.game_state.team2.name}
              </h3>
              <div className="text-4xl font-bold mb-1">{team2Cups}</div>
              <p className="text-xs text-muted-foreground">cups left</p>
            </Card>
          </div>
        )}

        {/* Shot Controller */}
        {beerPongState.current_phase === 'playing' && (
          <ShotController
            onShoot={handleShoot}
            disabled={!isMyTurn}
          />
        )}

        {/* Game Finished */}
        {beerPongState.current_phase === 'finished' && (
          <Card className="p-8 text-center bg-gradient-card border-primary/20 shadow-glow-cyan">
            <Trophy className="w-20 h-20 mx-auto mb-4 text-primary animate-bounce" />
            <h2 className="text-3xl font-bold mb-2 text-primary">
              {team1Cups === 0 ? 'Team 2' : 'Team 1'} Wins!
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              Final Score: {beerPongState.game_state.team1.score} - {beerPongState.game_state.team2.score}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-background/50">
                <p className="text-muted-foreground">Total Shots</p>
                <p className="text-2xl font-bold">{beerPongState.game_state.shots.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50">
                <p className="text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold text-green-500">
                  {beerPongState.game_state.shots.length > 0
                    ? Math.round((beerPongState.game_state.shots.filter(s => s.hit).length / beerPongState.game_state.shots.length) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Stats */}
        {beerPongState.current_phase === 'playing' && (
          <Card className="p-4 bg-gradient-card border-primary/10">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Shots</p>
                <p className="text-xl font-bold">{beerPongState.game_state.shots.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Hits</p>
                <p className="text-xl font-bold text-green-500">
                  {beerPongState.game_state.shots.filter(s => s.hit).length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Accuracy</p>
                <p className="text-xl font-bold">
                  {beerPongState.game_state.shots.length > 0
                    ? Math.round((beerPongState.game_state.shots.filter(s => s.hit).length / beerPongState.game_state.shots.length) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BeerPongPlayer;
