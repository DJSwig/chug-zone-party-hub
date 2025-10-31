import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Palette, Image as ImageIcon, Upload } from 'lucide-react';

const THEMES = [
  { id: 'classic-neon', name: 'Classic Neon', colors: 'from-neon-purple to-neon-green' },
  { id: 'purple-haze', name: 'Purple Haze', colors: 'from-purple-600 to-purple-900' },
  { id: 'emerald-glow', name: 'Emerald Glow', colors: 'from-emerald-500 to-emerald-800' },
  { id: 'gold-rush', name: 'Gold Rush', colors: 'from-yellow-400 to-amber-600' },
];

const PREMADE_CARD_BACKS = [
  { id: 'default', name: 'Classic', preview: '/card-backs/default.png' },
  { id: 'neon-grid', name: 'Neon Grid', preview: '/card-backs/neon-grid.png' },
  { id: 'purple-swirl', name: 'Purple Swirl', preview: '/card-backs/purple-swirl.png' },
  { id: 'emerald-diamond', name: 'Emerald Diamond', preview: '/card-backs/emerald-diamond.png' },
  { id: 'slime', name: 'Slime', preview: '/card-backs/slime.png' },
  { id: 'halloween', name: 'Halloween', preview: '/card-backs/halloween.png' },
];

export default function Customization() {
  const { user, profile, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [selectedCardBack, setSelectedCardBack] = useState<string>('default');
  const [customCardBackUrl, setCustomCardBackUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
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
        setTheme((data.theme as 'classic-neon' | 'purple-haze' | 'emerald-glow' | 'gold-rush') || 'classic-neon');
        setCustomCardBackUrl(data.card_back_url);
        if (data.card_back_url) {
          // Check if it's a premade card back or custom
          const premade = PREMADE_CARD_BACKS.find(cb => cb.preview === data.card_back_url);
          if (premade) {
            setSelectedCardBack(premade.id);
          } else {
            setSelectedCardBack('custom');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching customizations:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      console.log('Uploading file:', file.name, 'Size:', file.size);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      console.log('Upload path:', fileName);

      const { error: uploadError } = await supabase.storage
        .from('card-backs')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('card-backs')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);
      setCustomCardBackUrl(publicUrl);
      setSelectedCardBack('custom');
      toast.success('Card back uploaded!');
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload card back';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const saveCustomizations = async () => {
    setSaving(true);
    try {
      let cardBackUrl = null;
      if (selectedCardBack === 'custom') {
        cardBackUrl = customCardBackUrl;
      } else if (selectedCardBack !== 'default') {
        // Find the premade card back URL
        const premade = PREMADE_CARD_BACKS.find(cb => cb.id === selectedCardBack);
        if (premade) {
          cardBackUrl = premade.preview;
        }
      }

      console.log('Selected card back:', selectedCardBack);
      console.log('Resolved card back URL:', cardBackUrl);
      console.log('Saving customizations:', {
        user_id: user?.id,
        theme: theme,
        card_back_url: cardBackUrl,
      });

      const { data, error } = await supabase
        .from('customizations')
        .upsert(
          {
            user_id: user?.id!,
            theme: theme,
            card_back_url: cardBackUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Save successful:', data);
      setTheme(theme);
      toast.success('Customizations saved!');
    } catch (error) {
      console.error('Error saving customizations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save customizations';
      toast.error(errorMessage);
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
              <p className="text-sm text-muted-foreground mb-4">
                This theme will apply across the entire site
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {THEMES.map((themeOption) => (
                  <button
                    key={themeOption.id}
                    onClick={() => setTheme(themeOption.id as any)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      theme === themeOption.id
                        ? 'border-primary bg-primary/10'
                        : 'border-primary/20 hover:border-primary/40'
                    }`}
                  >
                    <div className={`h-20 rounded-lg bg-gradient-to-r ${themeOption.colors} mb-3`} />
                    <p className="font-medium">{themeOption.name}</p>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-neon-green" />
                Card Backs
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Pre-made Designs</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {PREMADE_CARD_BACKS.map((cardBack) => (
                      <button
                        key={cardBack.id}
                        onClick={() => setSelectedCardBack(cardBack.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedCardBack === cardBack.id
                            ? 'border-primary bg-primary/10'
                            : 'border-primary/20 hover:border-primary/40'
                        }`}
                      >
                        <div className="aspect-[2/3] bg-background/50 rounded mb-2 overflow-hidden">
                          <img 
                            src={cardBack.preview} 
                            alt={cardBack.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm font-medium">{cardBack.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Custom Upload</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                        id="card-back-upload"
                      />
                      <label htmlFor="card-back-upload">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploading}
                          onClick={() => document.getElementById('card-back-upload')?.click()}
                          asChild
                        >
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            {uploading ? 'Uploading...' : 'Upload Image'}
                          </span>
                        </Button>
                      </label>
                      {customCardBackUrl && (
                        <button
                          onClick={() => setSelectedCardBack('custom')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedCardBack === 'custom'
                              ? 'border-primary bg-primary/10'
                              : 'border-primary/20 hover:border-primary/40'
                          }`}
                        >
                          <img
                            src={customCardBackUrl}
                            alt="Custom card back"
                            className="w-12 h-18 object-cover rounded"
                          />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload a custom image for your card backs (max 5MB)
                    </p>
                  </div>
                </div>
              </div>
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
