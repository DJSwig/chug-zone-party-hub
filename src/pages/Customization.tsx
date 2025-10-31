import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Palette, Image as ImageIcon } from 'lucide-react';

const THEMES = [
  { id: 'classic-neon', name: 'Classic Neon', colors: 'from-neon-purple to-neon-green' },
  { id: 'purple-haze', name: 'Purple Haze', colors: 'from-purple-600 to-purple-900' },
  { id: 'emerald-glow', name: 'Emerald Glow', colors: 'from-emerald-500 to-emerald-800' },
  { id: 'gold-rush', name: 'Gold Rush', colors: 'from-yellow-400 to-amber-600' },
];

export default function Customization() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState('classic-neon');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      toast.error('Please sign in to customize');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCustomizations();
    }
  }, [user]);

  const fetchCustomizations = async () => {
    try {
      const { data } = await supabase
        .from('customizations')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setSelectedTheme(data.theme || 'classic-neon');
      }
    } catch (error) {
      console.error('Error fetching customizations:', error);
    }
  };

  const saveCustomizations = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('customizations')
        .upsert({
          user_id: user?.id,
          theme: selectedTheme,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success('Customizations saved!');
    } catch (error) {
      console.error('Error saving customizations:', error);
      toast.error('Failed to save customizations');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return null;
  }

  if (!profile?.is_server_member) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <ParticleBackground />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md p-8 bg-card/80 backdrop-blur-sm border-primary/20 text-center">
            <h2 className="text-2xl font-bold mb-4">Join the ChugZone Discord</h2>
            <p className="text-muted-foreground mb-6">
              Unlock custom card designs and exclusive perks by joining our Discord server!
            </p>
            <Button
              onClick={() => window.open('https://discord.gg/chugzone', '_blank')}
              className="w-full"
            >
              Join Discord Server
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="w-full mt-4"
            >
              Back to Home
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-4xl mx-auto py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-primary hover:text-primary/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-neon-purple via-neon-green to-neon-cyan bg-clip-text text-transparent">
              Customization
            </h1>
            <p className="text-muted-foreground">
              Personalize your ChugZone experience
            </p>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Palette className="w-6 h-6 text-neon-purple" />
                Select Theme
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      selectedTheme === theme.id
                        ? 'border-primary bg-primary/10'
                        : 'border-primary/20 hover:border-primary/40'
                    }`}
                  >
                    <div className={`h-20 rounded-lg bg-gradient-to-r ${theme.colors} mb-3`} />
                    <p className="font-medium">{theme.name}</p>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-neon-green" />
                Card Backs
              </h2>
              <p className="text-muted-foreground mb-4">
                Custom card back uploads coming soon...
              </p>
            </Card>

            <Button
              onClick={saveCustomizations}
              disabled={saving}
              className="w-full"
              size="lg"
            >
              {saving ? 'Saving...' : 'Save Customizations'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
