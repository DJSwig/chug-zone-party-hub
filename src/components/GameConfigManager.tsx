import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { games } from '@/data/games';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

interface GameConfig {
  game_id: string;
  hidden: boolean;
}

export const GameConfigManager = () => {
  const [configs, setConfigs] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data } = await supabase
        .from('game_configs')
        .select('*');

      if (data) {
        const configMap = new Map(
          data.map((config: GameConfig) => [config.game_id, config.hidden])
        );
        setConfigs(configMap);
      }
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast.error('Failed to load game configurations');
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (gameId: string, currentlyHidden: boolean) => {
    try {
      const newHidden = !currentlyHidden;

      // Check if config exists
      const { data: existing } = await supabase
        .from('game_configs')
        .select('game_id')
        .eq('game_id', gameId)
        .single();

      if (existing) {
        // Update existing
        await supabase
          .from('game_configs')
          .update({ hidden: newHidden })
          .eq('game_id', gameId);
      } else {
        // Insert new
        await supabase
          .from('game_configs')
          .insert({ game_id: gameId, hidden: newHidden });
      }

      setConfigs(new Map(configs.set(gameId, newHidden)));
      toast.success(newHidden ? 'Game hidden' : 'Game visible');
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error('Failed to update game visibility');
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="space-y-4">
      {games.map((game) => {
        const isHidden = configs.get(game.id) || false;
        
        return (
          <div
            key={game.id}
            className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-primary/10 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">{game.emoji}</div>
              <div>
                <h3 className="font-semibold">{game.name}</h3>
                <p className="text-sm text-muted-foreground">{game.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isHidden ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <EyeOff className="w-4 h-4" />
                  <span className="text-sm">Hidden</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-primary">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Visible</span>
                </div>
              )}
              
              <Switch
                checked={!isHidden}
                onCheckedChange={() => toggleVisibility(game.id, isHidden)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
