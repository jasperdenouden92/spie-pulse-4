'use client';

import { createTheme } from '@mui/material/styles';
import { getColors } from '@/colors';

export function createAppTheme(mode: 'light' | 'dark') {
  const c = getColors(mode);
  return createTheme({
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontFamily: 'var(--font-jost), "Jost", sans-serif' },
      h2: { fontFamily: 'var(--font-jost), "Jost", sans-serif' },
      h3: { fontFamily: 'var(--font-jost), "Jost", sans-serif' },
      h4: { fontFamily: 'var(--font-jost), "Jost", sans-serif' },
      h5: { fontFamily: 'var(--font-jost), "Jost", sans-serif' },
      h6: { fontFamily: 'var(--font-jost), "Jost", sans-serif' },
      subtitle1: { fontFamily: 'var(--font-jost), "Jost", sans-serif' },
      subtitle2: { fontFamily: 'var(--font-jost), "Jost", sans-serif' },
    },
    shape: {
      borderRadius: 8,
    },
    palette: {
      mode,
      primary: {
        main: c.brand,
      },
      secondary: {
        main: c.brandSecondary,
      },
      success: {
        main: c.brandGreen,
      },
      error: {
        main: c.brandRed,
      },
      text: {
        primary: c.textPrimary,
        secondary: c.textSecondary,
        disabled: c.textDisabled,
      },
      background: {
        default: c.bgSecondary,
        paper: c.bgPrimary,
      },
      divider: c.borderSecondary,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            border: `1px solid ${c.borderSecondary}`,
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            border: `1px solid ${c.borderSecondary}`,
          },
        },
      },
    },
  });
}
