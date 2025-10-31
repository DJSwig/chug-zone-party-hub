import { useEffect, useState } from "react";
import { GameCard } from "@/components/GameCard";
import { games } from "@/data/games";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const GamesSection = () => {
  const [hiddenGames, setHiddenGames] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGameConfigs();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('game-configs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_configs',
        },
        () => {
          fetchGameConfigs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchGameConfigs = async () => {
    try {
      const { data } = await supabase
        .from('game_configs')
        .select('game_id, hidden');
      
      if (data) {
        const hidden = new Set(
          data.filter(config => config.hidden).map(config => config.game_id)
        );
        setHiddenGames(hidden);
      }
    } catch (error) {
      console.error('Error fetching game configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const visibleGames = games.filter(game => !hiddenGames.has(game.id));

  if (loading) {
    return (
      <section id="games" className="relative py-32 border-t border-border/50">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-muted-foreground">Loading games...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="games" className="relative py-32 border-t border-border/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Choose Your Game
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Classic drinking games reimagined for online play
          </p>
          
          {/* Coming soon badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border-2 border-primary/30 animate-pulse">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">
              More Games Coming Soon!
            </span>
          </div>
        </div>

        {visibleGames.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <p>No games available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {visibleGames.map((game) => (
              <div 
                key={game.id} 
                className="transition-all duration-300 hover:scale-105 hover:-translate-y-2"
              >
                <GameCard game={game} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
