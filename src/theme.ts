'use client';

import { createTheme } from '@mui/material/styles';
import { colors } from '@/colors';

export const theme = createTheme({
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  palette: {
    mode: 'light',
    primary: {
      main: colors.brand,
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
