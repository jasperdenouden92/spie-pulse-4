'use client';

import { createTheme } from '@mui/material/styles';
import { colors } from '@/colors';

export const theme = createTheme({
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
    mode: 'light',
    primary: {
      main: colors.brand,
    },
    secondary: {
      main: colors.brandSecondary,
    },
    success: {
      main: colors.brandGreen,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
      disabled: colors.textDisabled,
    },
    background: {
      default: colors.bgSecondary,
      paper: colors.bgPrimary,
    },
  },
});
