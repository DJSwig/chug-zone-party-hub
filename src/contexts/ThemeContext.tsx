import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'classic-neon' | 'purple-haze' | 'emerald-glow' | 'gold-rush' | 'halloween' | 'ocean-deep' | 'sunset-blaze' | 'midnight-blue' | 'cherry-blossom';

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
    popover: '40 50% 12%',
    'popover-foreground': '45 30% 95%',
    input: '40 30% 20%',
    ring: '45 100% 50%',
  },
  'halloween': {
    primary: '25 100% 50%',
    'primary-foreground': '0 0% 0%',
    secondary: '280 100% 40%',
    'secondary-foreground': '0 0% 100%',
    accent: '35 100% 45%',
    'accent-foreground': '0 0% 0%',
    'neon-purple': '280 100% 60%',
    'neon-green': '120 100% 35%',
    'neon-cyan': '25 100% 50%',
    background: '0 0% 5%',
    foreground: '25 100% 95%',
    card: '0 0% 8%',
    'card-foreground': '25 100% 95%',
    border: '25 100% 50%',
    muted: '0 0% 15%',
    'muted-foreground': '25 50% 70%',
    popover: '0 0% 8%',
    'popover-foreground': '25 100% 95%',
    input: '0 0% 15%',
    ring: '25 100% 50%',
  },
  'ocean-deep': {
    primary: '200 100% 50%',
    'primary-foreground': '0 0% 100%',
    secondary: '190 90% 40%',
    'secondary-foreground': '0 0% 100%',
    accent: '210 100% 60%',
    'accent-foreground': '0 0% 0%',
    'neon-purple': '220 80% 60%',
    'neon-green': '180 100% 50%',
    'neon-cyan': '190 100% 60%',
    background: '200 80% 5%',
    foreground: '200 30% 95%',
    card: '200 70% 8%',
    'card-foreground': '200 30% 95%',
    border: '200 100% 50%',
    muted: '200 40% 20%',
    'muted-foreground': '200 20% 70%',
    popover: '200 70% 8%',
    'popover-foreground': '200 30% 95%',
    input: '200 40% 20%',
    ring: '200 100% 50%',
  },
  'sunset-blaze': {
    primary: '15 100% 60%',
    'primary-foreground': '0 0% 0%',
    secondary: '340 90% 55%',
    'secondary-foreground': '0 0% 100%',
    accent: '30 100% 50%',
    'accent-foreground': '0 0% 0%',
    'neon-purple': '340 80% 60%',
    'neon-green': '30 100% 50%',
    'neon-cyan': '15 100% 70%',
    background: '15 50% 6%',
    foreground: '15 30% 95%',
    card: '15 60% 10%',
    'card-foreground': '15 30% 95%',
    border: '15 100% 60%',
    muted: '15 40% 20%',
    'muted-foreground': '15 20% 70%',
    popover: '15 60% 10%',
    'popover-foreground': '15 30% 95%',
    input: '15 40% 20%',
    ring: '15 100% 60%',
  },
  'midnight-blue': {
    primary: '230 100% 60%',
    'primary-foreground': '0 0% 100%',
    secondary: '240 80% 50%',
    'secondary-foreground': '0 0% 100%',
    accent: '220 90% 55%',
    'accent-foreground': '0 0% 100%',
    'neon-purple': '260 80% 60%',
    'neon-green': '220 70% 50%',
    'neon-cyan': '200 90% 60%',
    background: '230 60% 6%',
    foreground: '230 30% 95%',
    card: '230 50% 10%',
    'card-foreground': '230 30% 95%',
    border: '230 100% 60%',
    muted: '230 40% 20%',
    'muted-foreground': '230 20% 70%',
    popover: '230 50% 10%',
    'popover-foreground': '230 30% 95%',
    input: '230 40% 20%',
    ring: '230 100% 60%',
  },
  'cherry-blossom': {
    primary: '330 100% 70%',
    'primary-foreground': '0 0% 0%',
    secondary: '320 80% 60%',
    'secondary-foreground': '0 0% 0%',
    accent: '340 90% 65%',
    'accent-foreground': '0 0% 0%',
    'neon-purple': '300 80% 70%',
    'neon-green': '140 60% 70%',
    'neon-cyan': '330 100% 80%',
    background: '330 40% 95%',
    foreground: '330 60% 10%',
    card: '330 50% 98%',
    'card-foreground': '330 60% 10%',
    border: '330 100% 70%',
    muted: '330 30% 90%',
    'muted-foreground': '330 40% 40%',
    popover: '330 50% 98%',
    'popover-foreground': '330 60% 10%',
    input: '330 30% 90%',
    ring: '330 100% 70%',
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>('classic-neon');

  useEffect(() => {
    if (user) {
      fetchTheme();
    } else {
      // Reset to default theme when user signs out
      setThemeState('classic-neon');
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
