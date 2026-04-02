'use client';

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getColors, type ColorTokens } from '@/colors';

type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeModeContextValue {
  preference: ThemePreference;
  colorMode: 'light' | 'dark';
  themeColors: ColorTokens;
  setThemePreference: (pref: ThemePreference) => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue>({
  preference: 'system',
  colorMode: 'light',
  themeColors: getColors('light'),
  setThemePreference: () => {},
});

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const systemPrefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme-mode') as ThemePreference | null;
    if (stored && ['system', 'light', 'dark'].includes(stored)) {
      setPreference(stored);
    }
    setMounted(true);
  }, []);

  const colorMode = useMemo<'light' | 'dark'>(() => {
    if (preference === 'system') return systemPrefersDark ? 'dark' : 'light';
    return preference;
  }, [preference, systemPrefersDark]);

  const themeColors = useMemo(() => getColors(colorMode), [colorMode]);

  const handleSetPreference = (pref: ThemePreference) => {
    setPreference(pref);
    localStorage.setItem('theme-mode', pref);
  };

  // Update data-theme attribute on html element
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', colorMode);
    }
  }, [colorMode, mounted]);

  if (!mounted) return null;

  return (
    <ThemeModeContext.Provider value={{ preference, colorMode, themeColors, setThemePreference: handleSetPreference }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export const useThemeMode = () => useContext(ThemeModeContext);
