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
    secondary: '150 100% 50%',
    'secondary-foreground': '0 0% 0%',
    accent: '180 100% 50%',
    'accent-foreground': '0 0% 0%',
    'neon-purple': '280 100% 70%',
    'neon-green': '150 100% 50%',
    'neon-cyan': '180 100% 50%',
    background: '0 0% 0%',
    foreground: '0 0% 100%',
    card: '0 0% 5%',
    'card-foreground': '0 0% 100%',
    border: '280 100% 70%',
    muted: '0 0% 15%',
    'muted-foreground': '0 0% 70%',
    // Added to ensure full theming coverage
    popover: '0 0% 5%',
    'popover-foreground': '0 0% 100%',
    input: '0 0% 15%',
    ring: '280 100% 70%',
  },
  'purple-haze': {
    primary: '270 80% 60%',
    'primary-foreground': '0 0% 100%',
    secondary: '280 70% 50%',
    'secondary-foreground': '0 0% 100%',
    accent: '290 75% 55%',
    'accent-foreground': '0 0% 100%',
    'neon-purple': '270 80% 60%',
    'neon-green': '270 60% 40%',
    'neon-cyan': '280 70% 50%',
    background: '270 50% 5%',
    foreground: '270 20% 95%',
    card: '270 40% 10%',
    'card-foreground': '270 20% 95%',
    border: '270 80% 60%',
    muted: '270 30% 20%',
    'muted-foreground': '270 20% 70%',
    // Added to ensure full theming coverage
    popover: '270 40% 10%',
    'popover-foreground': '270 20% 95%',
    input: '270 30% 20%',
    ring: '270 80% 60%',
  },
  'emerald-glow': {
    primary: '150 80% 50%',
    'primary-foreground': '0 0% 0%',
    secondary: '160 70% 40%',
    'secondary-foreground': '0 0% 100%',
    accent: '170 80% 45%',
    'accent-foreground': '0 0% 0%',
    'neon-purple': '160 70% 40%',
    'neon-green': '150 80% 50%',
    'neon-cyan': '170 80% 45%',
    background: '150 30% 5%',
    foreground: '150 20% 95%',
    card: '150 40% 8%',
    'card-foreground': '150 20% 95%',
    border: '150 80% 50%',
    muted: '150 30% 15%',
    'muted-foreground': '150 20% 70%',
    // Added to ensure full theming coverage
    popover: '150 40% 8%',
    'popover-foreground': '150 20% 95%',
    input: '150 30% 15%',
    ring: '150 80% 50%',
  },
  'gold-rush': {
    primary: '45 100% 50%',
    'primary-foreground': '0 0% 0%',
    secondary: '40 90% 45%',
    'secondary-foreground': '0 0% 0%',
    accent: '50 100% 55%',
    'accent-foreground': '0 0% 0%',
    'neon-purple': '40 90% 50%',
    'neon-green': '50 100% 45%',
    'neon-cyan': '45 100% 55%',
    background: '40 40% 8%',
    foreground: '45 30% 95%',
    card: '40 50% 12%',
    'card-foreground': '45 30% 95%',
    border: '45 100% 50%',
    muted: '40 30% 20%',
    'muted-foreground': '45 20% 70%',
    // Added to ensure full theming coverage
    popover: '40 50% 12%',
    'popover-foreground': '45 30% 95%',
    input: '40 30% 20%',
    ring: '45 100% 50%',
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
