import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ParticleBackground } from "@/components/ParticleBackground";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <ParticleBackground />
      
      <div className="relative z-10 w-full max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Games
        </Button>

        <Card className="p-8 bg-gradient-card border-primary/20 shadow-glow-cyan">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              🏓 Beer Pong
            </h1>
            <p className="text-muted-foreground">
              Set up your game and get ready to play!
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-primary">
                Your Name
              </label>
              <Input
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Enter your name"
                className="text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-primary">
                Game Mode
              </label>
              <Select value={mode} onValueChange={(value: 'head_to_head' | 'tournament') => setMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="head_to_head">Head-to-Head</SelectItem>
                  <SelectItem value="tournament">Tournament (4-16 players)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-background/50 p-4 rounded-lg border border-primary/10">
              <h3 className="font-semibold mb-2 text-primary">How to Play</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Players connect with their phones to control shots</li>
                <li>• Adjust power and angle, then throw the ball</li>
                <li>• Hit all opponent's cups to win</li>
                <li>• Tournament mode: Compete in bracket-style elimination</li>
              </ul>
            </div>

            <Button
              onClick={handleCreateSession}
              disabled={creating}
              className="w-full text-lg font-bold py-6"
            >
              {creating ? "Creating..." : "Create Game Session"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BeerPongSettings;
