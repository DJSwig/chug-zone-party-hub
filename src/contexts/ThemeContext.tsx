import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'classic-neon' | 'purple-haze' | 'emerald-glow' | 'gold-rush';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'classic-neon',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const themeColors = {
  'classic-neon': {
    primary: '280 100% 70%',
    'primary-foreground': '0 0% 100%',
    'neon-purple': '280 100% 70%',
    'neon-green': '150 100% 50%',
    'neon-cyan': '180 100% 50%',
  },
  'purple-haze': {
    primary: '270 80% 60%',
    'primary-foreground': '0 0% 100%',
    'neon-purple': '270 80% 60%',
    'neon-green': '270 60% 40%',
    'neon-cyan': '280 70% 50%',
  },
  'emerald-glow': {
    primary: '150 80% 50%',
    'primary-foreground': '0 0% 0%',
    'neon-purple': '160 70% 40%',
    'neon-green': '150 80% 50%',
    'neon-cyan': '170 80% 45%',
  },
  'gold-rush': {
    primary: '45 100% 50%',
    'primary-foreground': '0 0% 0%',
    'neon-purple': '40 90% 50%',
    'neon-green': '50 100% 45%',
    'neon-cyan': '45 100% 55%',
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>('classic-neon');

  useEffect(() => {
    if (user) {
      fetchTheme();
    }
  }, [user]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const fetchTheme = async () => {
    try {
      const { data } = await supabase
        .from('customizations')
        .select('theme')
        .eq('user_id', user?.id)
        .single();

      if (data?.theme) {
        setThemeState(data.theme as Theme);
      }
    } catch (error) {
      console.error('Error fetching theme:', error);
    }
  };

  const applyTheme = (theme: Theme) => {
    const colors = themeColors[theme];
    const root = document.documentElement;

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
