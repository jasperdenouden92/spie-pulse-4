'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Tooltip from '@mui/material/Tooltip';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage } from '@/i18n';
import type { HomeVariant } from './ControlRoomEntrance';

/**
 * Each home variant pairs a Control Room entrance concept with a Work in
 * progress layout so the floating toolbar previews both together.
 */
const VARIANT_LABELS: Record<HomeVariant, string> = {
  A: 'KPI strip + grouped WIP',
  B: 'Portfolio pulse + stacked WIP cards',
  C: 'Latest impact + flat WIP list',
};

export interface HomeVariantToolbarProps {
  value: HomeVariant;
  onChange: (v: HomeVariant) => void;
}

export default function HomeVariantToolbar({ value, onChange }: HomeVariantToolbarProps) {
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1200,
        bgcolor: c.bgPrimary,
        border: `1px solid ${c.cardBorder}`,
        borderRadius: '999px',
        boxShadow: `0 8px 32px 0 ${c.shadowMedium}`,
        px: 1,
        py: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          fontWeight: 600,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          px: 1.5,
        }}
      >
        {t('home.homeVariant')}
      </Typography>
      {(Object.keys(VARIANT_LABELS) as HomeVariant[]).map(v => {
        const active = v === value;
        return (
          <Tooltip key={v} title={VARIANT_LABELS[v]}>
            <ButtonBase
              onClick={() => onChange(v)}
              sx={{
                px: 1.75,
                py: 0.75,
                borderRadius: '999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                bgcolor: active ? c.brand : 'transparent',
                color: active ? '#fff' : 'text.primary',
                transition: 'background-color 0.15s ease, color 0.15s ease',
                '&:hover': { bgcolor: active ? c.brand : c.bgSecondary },
              }}
            >
              {v}
            </ButtonBase>
          </Tooltip>
        );
      })}
    </Box>
  );
}
