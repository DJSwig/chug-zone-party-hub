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
import { Slider } from "@/components/ui/slider";
import { Trophy, Users, Target } from "lucide-react";

const BeerPongHost = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { session, players, loading } = useGameSession(sessionId || null);
  const [beerPongState, setBeerPongState] = useState<BeerPongState | null>(null);
  const [showShot, setShowShot] = useState(false);
  const [testPower, setTestPower] = useState(50);
  const [testAngle, setTestAngle] = useState(0);

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
          setBeerPongState(newState);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

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

  const testShot = () => {
    if (!beerPongState) return;
    
    const shot = {
      playerId: 'host-test',
      playerName: 'Host',
      power: testPower,
      angle: testAngle,
      hit: false,
      timestamp: Date.now(),
    };

    simulateShot(shot);
  };

  const simulateShot = async (shot: Shot) => {
    if (!sessionId || !beerPongState) return;

    setShowShot(true);
    
    // Simulate shot calculation
    const hitChance = (shot.power / 100) * (1 - Math.abs(shot.angle) / 90) * 0.7;
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
        toast.success("Hit! 🎯");
      }
    } else {
      toast.error("Miss! 💦");
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
        
        const winner = currentTeam === 'team1' ? 'Team 1' : 'Team 2';
        toast.success(`🏆 ${winner} wins!`, { duration: 5000 });
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-pulse text-6xl mb-4">🏓</div>
          <p className="text-xl text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!session || !beerPongState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <ParticleBackground />
        <Card className="p-8 text-center relative z-10 bg-gradient-card border-primary/20">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-xl mb-4 text-foreground">Session not found</p>
          <Button onClick={() => navigate('/')} size="lg">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  const team1Cups = beerPongState.game_state.team1.cups.filter(c => !c.hit).length;
  const team2Cups = beerPongState.game_state.team2.cups.filter(c => !c.hit).length;
  const currentTeamName = beerPongState.game_state.currentTurn === 'team1' ? 'Team 1' : 'Team 2';

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-background via-background to-primary/5">
      <ParticleBackground />

      <div className="relative z-10 max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-5xl">🏓</div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gradient">Beer Pong</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                {players.length} {players.length === 1 ? 'player' : 'players'} connected
              </p>
            </div>
          </div>
          <JoinCodeDisplay joinCode={session.join_code} />
        </div>

        {/* Tournament Bracket */}
        {beerPongState.mode === 'tournament' && beerPongState.bracket_data && (
          <Tabs defaultValue="game" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="game">Game</TabsTrigger>
              <TabsTrigger value="bracket">
                <Trophy className="w-4 h-4 mr-2" />
                Bracket
              </TabsTrigger>
            </TabsList>
            <TabsContent value="bracket">
              <Card className="p-6 bg-gradient-card border-primary/20 shadow-glow-cyan">
                <TournamentBracket
                  matches={beerPongState.bracket_data.matches}
                  currentRound={beerPongState.bracket_data.currentRound}
                />
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <Card className="lg:col-span-3 p-6 bg-gradient-card border-primary/20 shadow-glow-cyan">
            {/* Score Display */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <h3 className="text-xl font-bold text-primary mb-2">
                  {beerPongState.game_state.team1.name}
                </h3>
                <div className="text-4xl font-bold text-foreground">{team1Cups}</div>
                <p className="text-sm text-muted-foreground mt-1">cups remaining</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20">
                <h3 className="text-xl font-bold text-cyan-400 mb-2">
                  {beerPongState.game_state.team2.name}
                </h3>
                <div className="text-4xl font-bold text-foreground">{team2Cups}</div>
                <p className="text-sm text-muted-foreground mt-1">cups remaining</p>
              </div>
            </div>

            {/* Current Turn Indicator */}
            {beerPongState.current_phase === 'playing' && (
              <div className="text-center mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20 animate-pulse">
                <Target className="w-5 h-5 inline-block mr-2" />
                <span className="font-semibold text-primary">
                  Current Turn: {currentTeamName}
                </span>
              </div>
            )}

            {/* Cup Formations */}
            <div className="grid grid-cols-2 gap-4 min-h-[400px]">
              <div className="border-r border-primary/10">
                <CupFormation
                  cups={beerPongState.game_state.team1.cups}
                  side="left"
                  showAnimation={beerPongState.game_state.currentTurn === 'team2' && showShot}
                />
              </div>
              <div>
                <CupFormation
                  cups={beerPongState.game_state.team2.cups}
                  side="right"
                  showAnimation={beerPongState.game_state.currentTurn === 'team1' && showShot}
                />
              </div>
            </div>

            {/* Game Controls */}
            <div className="mt-6 space-y-4">
              {beerPongState.current_phase === 'lobby' && (
                <Button onClick={startGame} size="lg" className="w-full text-lg">
                  🎮 Start Game
                </Button>
              )}

              {beerPongState.current_phase === 'finished' && (
                <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/20 to-transparent border-2 border-primary">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-primary animate-bounce" />
                  <h2 className="text-3xl font-bold mb-2 text-primary">
                    {team1Cups === 0 ? 'Team 2' : 'Team 1'} Wins!
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Final Score: {beerPongState.game_state.team1.score} - {beerPongState.game_state.team2.score}
                  </p>
                  <Button onClick={() => navigate('/')} size="lg">
                    New Game
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Side Panel */}
          <Card className="p-6 bg-gradient-card border-primary/20 space-y-6">
            {/* Test Controls */}
            {beerPongState.current_phase === 'playing' && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Test Shot
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Power: {testPower}%
                    </label>
                    <Slider
                      value={[testPower]}
                      onValueChange={([value]) => setTestPower(value)}
                      min={20}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Angle: {testAngle > 0 ? `${testAngle}° R` : testAngle < 0 ? `${Math.abs(testAngle)}° L` : 'Center'}
                    </label>
                    <Slider
                      value={[testAngle]}
                      onValueChange={([value]) => setTestAngle(value)}
                      min={-45}
                      max={45}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <Button 
                    onClick={testShot} 
                    disabled={showShot}
                    className="w-full"
                    variant="outline"
                  >
                    🏓 Test Throw
                  </Button>
                </div>
              </div>
            )}

            {/* Players List */}
            <div>
              <h3 className="font-bold text-lg mb-3 text-primary">Connected Players</h3>
              <div className="space-y-2">
                {players.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No players yet. Share the code!
                  </p>
                ) : (
                  players.map((player) => (
                    <div
                      key={player.id}
                      className="p-3 rounded-lg bg-background/50 border border-primary/10 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="font-medium">{player.player_name}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Game Stats */}
            <div>
              <h3 className="font-bold text-lg mb-3 text-primary">Game Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Shots:</span>
                  <span className="font-semibold">{beerPongState.game_state.shots.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hits:</span>
                  <span className="font-semibold text-green-500">
                    {beerPongState.game_state.shots.filter(s => s.hit).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accuracy:</span>
                  <span className="font-semibold">
                    {beerPongState.game_state.shots.length > 0
                      ? Math.round((beerPongState.game_state.shots.filter(s => s.hit).length / beerPongState.game_state.shots.length) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BeerPongHost;
