import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ParticleBackground } from "@/components/ParticleBackground";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Users, Trophy, Loader2 } from "lucide-react";
import { generateJoinCode } from "@/utils/joinCodeGenerator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BeerPongSettings = () => {
  const navigate = useNavigate();
  const [hostName, setHostName] = useState("");
  const [mode, setMode] = useState<'head_to_head' | 'tournament'>('head_to_head');
  const [creating, setCreating] = useState(false);

  const handleCreateSession = async () => {
    if (!hostName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setCreating(true);

    try {
      const joinCode = generateJoinCode();

      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          join_code: joinCode,
          game_type: 'beer-pong',
          host_name: hostName,
          status: 'waiting',
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Initialize cups in a 10-cup triangle formation
      const generateCups = (side: 'left' | 'right') => {
        const cups = [];
        let cupId = 0;
        const baseX = side === 'left' ? 70 : 30;
        
        // 4-3-2-1 formation
        for (let row = 0; row < 4; row++) {
          const cupsInRow = 4 - row;
          for (let col = 0; col < cupsInRow; col++) {
            cups.push({
              id: `${side}-${cupId++}`,
              x: baseX + (col - cupsInRow / 2) * 8,
              y: 30 + row * 15,
              hit: false,
            });
          }
        }
        return cups;
      };

      const { error: stateError } = await supabase
        .from('beer_pong_state')
        .insert({
          session_id: session.id,
          mode,
          current_phase: 'lobby',
          game_state: {
            team1: {
              name: 'Team 1',
              cups: generateCups('left'),
              score: 0,
              players: [],
            },
            team2: {
              name: 'Team 2',
              cups: generateCups('right'),
              score: 0,
              players: [],
            },
            currentTurn: 'team1',
            shots: [],
            settings: {
              cupsPerSide: 10,
              allowBounce: true,
              allowReracks: true,
              redemption: true,
            },
          },
          bracket_data: mode === 'tournament' ? {
            matches: [],
            currentRound: 1,
            champion: null,
          } : null,
        });

      if (stateError) throw stateError;

      toast.success("Game session created!");
      navigate(`/game/beer-pong/host/${session.id}`);
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create session");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <ParticleBackground />
      
      <div className="relative z-10 w-full max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4 hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Games
        </Button>

        <Card className="p-8 bg-gradient-card border-2 border-primary/20 shadow-glow-cyan">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-bounce">🏓</div>
            <h1 className="text-5xl font-bold mb-3 text-gradient">
              Beer Pong
            </h1>
            <p className="text-muted-foreground text-lg">
              Set up your game and get ready to play!
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-primary">
                Host Name
              </label>
              <Input
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Enter your name"
                className="text-lg h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-primary">
                Game Mode
              </label>
              <Select value={mode} onValueChange={(value: 'head_to_head' | 'tournament') => setMode(value)}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="head_to_head">
                    <div className="flex items-center gap-3 py-2">
                      <Users className="w-5 h-5 text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">Head-to-Head</div>
                        <div className="text-xs text-muted-foreground">2 players or teams</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="tournament">
                    <div className="flex items-center gap-3 py-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">Tournament</div>
                        <div className="text-xs text-muted-foreground">4-16 players, bracket style</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <h3 className="font-semibold mb-3 text-primary flex items-center gap-2">
                <span className="text-xl">🎮</span> How to Play
              </h3>
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Players connect with their phones to control shots</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Adjust power and angle, then throw the ball</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Hit all opponent's cups to win</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Host can test shots solo before players join</span>
                </li>
                {mode === 'tournament' && (
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Compete in bracket-style elimination rounds</span>
                  </li>
                )}
              </ul>
            </Card>

            <Button
              onClick={handleCreateSession}
              disabled={creating}
              className="w-full text-lg font-bold py-7 shadow-glow-cyan hover:scale-105 transition-transform"
              size="lg"
            >
              {creating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Session...
                </>
              ) : (
                <>
                  🎮 Create Game Session
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BeerPongSettings;
