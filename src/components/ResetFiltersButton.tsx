'use client';

import React from 'react';
import Box from '@mui/material/Box';
import ReplayIcon from '@mui/icons-material/Replay';
import type { SxProps, Theme } from '@mui/material/styles';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage } from '@/i18n';

interface ResetFiltersButtonProps {
  /** When false, renders nothing. */
  show: boolean;
  onReset: () => void;
  sx?: SxProps<Theme>;
}

export default function ResetFiltersButton({ show, onReset, sx }: ResetFiltersButtonProps) {
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();
  if (!show) return null;
  return (
    <Box
      component="button"
      type="button"
      onClick={onReset}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        height: 30,
        px: 1,
        borderRadius: '6px',
        border: 'none',
        bgcolor: 'transparent',
        color: 'text.secondary',
        fontSize: '0.8125rem',
        fontFamily: 'inherit',
        cursor: 'pointer',
        flexShrink: 0,
        whiteSpace: 'nowrap',
        '&:hover': { bgcolor: c.bgPrimaryHover, color: 'text.primary' },
        ...(sx ?? {}),
      }}
    >
      <ReplayIcon sx={{ fontSize: 14 }} />
      {t('filters.reset')}
    </Box>
  );
}
