import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ParticleBackground } from "@/components/ParticleBackground";
import { JoinCodeDisplay } from "@/components/JoinCodeDisplay";
import { CupFormation } from "@/components/CupFormation";
import { TournamentBracket } from "@/components/TournamentBracket";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useGameSession } from "@/hooks/useGameSession";
import { BeerPongState, Shot } from "@/types/beerPong";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BeerPongHost = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { session, players, loading } = useGameSession(sessionId || null);
  const [beerPongState, setBeerPongState] = useState<BeerPongState | null>(null);
  const [showShot, setShowShot] = useState(false);

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
      .channel(`beer-pong-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'beer_pong_state',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newState = payload.new as any;
          const oldState = beerPongState;
          
          // Check if a new shot was added
          if (oldState && newState.game_state.shots.length > oldState.game_state.shots.length) {
            const newShot = newState.game_state.shots[newState.game_state.shots.length - 1];
            simulateShot(newShot);
          }
          
          setBeerPongState(newState);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, beerPongState]);

  const startGame = async () => {
    if (!sessionId || !beerPongState) return;

    try {
      await supabase
        .from('beer_pong_state')
        .update({
          current_phase: 'playing',
        })
        .eq('session_id', sessionId);

      await supabase
        .from('game_sessions')
        .update({ status: 'active' })
        .eq('id', sessionId);

      toast.success("Game started!");
    } catch (error) {
      console.error("Error starting game:", error);
      toast.error("Failed to start game");
    }
  };

  const simulateShot = async (shot: Shot) => {
    if (!sessionId || !beerPongState) return;

    setShowShot(true);
    
    // Simulate shot calculation
    const hitChance = (shot.power / 100) * (1 - Math.abs(shot.angle) / 90);
    const isHit = Math.random() < hitChance;

    const currentTeam = beerPongState.game_state.currentTurn;
    const targetTeam = currentTeam === 'team1' ? 'team2' : 'team1';

    let updatedCups = [...beerPongState.game_state[targetTeam].cups];
    
    if (isHit) {
      const hitableCups = updatedCups.filter(c => !c.hit);
      if (hitableCups.length > 0) {
        const randomCup = hitableCups[Math.floor(Math.random() * hitableCups.length)];
        updatedCups = updatedCups.map(c => 
          c.id === randomCup.id ? { ...c, hit: true } : c
        );
      }
    }

    setTimeout(async () => {
      const newShot = { ...shot, hit: isHit };
      
      await supabase
        .from('beer_pong_state')
        .update({
          game_state: {
            ...beerPongState.game_state,
            [targetTeam]: {
              ...beerPongState.game_state[targetTeam],
              cups: updatedCups,
              score: beerPongState.game_state[targetTeam].score + (isHit ? 1 : 0),
            },
            currentTurn: currentTeam === 'team1' ? 'team2' : 'team1',
            shots: [...beerPongState.game_state.shots, newShot],
          } as any,
        })
        .eq('session_id', sessionId);

      setShowShot(false);

      const remainingCups = updatedCups.filter(c => !c.hit).length;
      if (remainingCups === 0) {
        await supabase
          .from('beer_pong_state')
          .update({ current_phase: 'finished' })
          .eq('session_id', sessionId);
        
        toast.success(`${currentTeam === 'team1' ? 'Team 1' : 'Team 2'} wins!`);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!session || !beerPongState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-xl mb-4">Session not found</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative p-4">
      <ParticleBackground />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">🏓 Beer Pong</h1>
          <JoinCodeDisplay joinCode={session.join_code} />
        </div>

        {beerPongState.mode === 'tournament' && beerPongState.bracket_data && (
          <Tabs defaultValue="game" className="mb-6">
            <TabsList>
              <TabsTrigger value="game">Game</TabsTrigger>
              <TabsTrigger value="bracket">Bracket</TabsTrigger>
            </TabsList>
            <TabsContent value="bracket">
              <Card className="p-6 bg-gradient-card border-primary/20">
                <TournamentBracket
                  matches={beerPongState.bracket_data.matches}
                  currentRound={beerPongState.bracket_data.currentRound}
                />
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 bg-gradient-card border-primary/20">
            <div className="grid grid-cols-2 gap-4 h-[500px]">
              <div className="border-r border-primary/20">
                <h3 className="text-center font-bold text-xl mb-4 text-primary">
                  {beerPongState.game_state.team1.name}
                </h3>
                <CupFormation
                  cups={beerPongState.game_state.team1.cups}
                  side="left"
                  showAnimation={beerPongState.game_state.currentTurn === 'team2' && showShot}
                />
                <p className="text-center mt-4">
                  Cups: {beerPongState.game_state.team1.cups.filter(c => !c.hit).length}
                </p>
              </div>

              <div>
                <h3 className="text-center font-bold text-xl mb-4 text-primary">
                  {beerPongState.game_state.team2.name}
                </h3>
                <CupFormation
                  cups={beerPongState.game_state.team2.cups}
                  side="right"
                  showAnimation={beerPongState.game_state.currentTurn === 'team1' && showShot}
                />
                <p className="text-center mt-4">
                  Cups: {beerPongState.game_state.team2.cups.filter(c => !c.hit).length}
                </p>
              </div>
            </div>

            {beerPongState.current_phase === 'lobby' && (
              <div className="mt-6 text-center">
                <Button onClick={startGame} size="lg" className="text-lg">
                  Start Game
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-6 bg-gradient-card border-primary/20">
            <h3 className="font-bold text-xl mb-4 text-primary">Players ({players.length})</h3>
            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="p-3 rounded-lg bg-background/50 border border-primary/10"
                >
                  {player.player_name}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-2 text-primary">Current Turn</h4>
              <p className="text-lg">
                {beerPongState.game_state.currentTurn === 'team1' ? 'Team 1' : 'Team 2'}
              </p>
            </div>

            {beerPongState.current_phase === 'finished' && (
              <div className="mt-6 p-4 rounded-lg bg-primary/20 border border-primary">
                <h3 className="font-bold text-xl text-center">
                  Winner: {beerPongState.game_state.team1.cups.every(c => c.hit) ? 'Team 2' : 'Team 1'}!
                </h3>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BeerPongHost;
