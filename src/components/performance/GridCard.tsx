'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { SxProps } from '@mui/material';
import { useThemeMode } from '@/theme-mode-context';

type GridCardSize = 'sm' | 'md' | 'lg';

const COLUMN_SPAN: Record<GridCardSize, object | string> = {
  sm: 'span 1',
  md: { xs: 'span 1', md: 'span 1', lg: 'span 2' },
  lg: { xs: 'span 1', md: 'span 2', lg: 'span 4' },
};

interface GridCardProps {
  size?: GridCardSize;
  icon?: React.ReactNode;
  title?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  sx?: SxProps;
}

export default function GridCard({
  size = 'sm',
  icon,
  title,
  headerRight,
  children,
  sx,
}: GridCardProps) {
  const { themeColors: c } = useThemeMode();
  const hasHeader = !!(icon || title || headerRight);

  return (
    <Paper
      elevation={0}
      sx={[
        {
          gridColumn: COLUMN_SPAN[size],
          p: 2.5,
          border: `1px solid ${c.cardBorder}`,
          borderRadius: '12px',
          bgcolor: c.bgPrimary,
          boxShadow: c.cardShadow,
          display: 'flex',
          flexDirection: 'column',
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {hasHeader && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon && (
              <Box sx={{ display: 'flex', color: 'text.secondary', '& .MuiSvgIcon-root': { fontSize: 18 } }}>
                {icon}
              </Box>
            )}
            {title && (
              <Typography variant="body2" fontWeight={600}>
                {title}
              </Typography>
            )}
          </Box>
          {headerRight}
        </Box>
      )}
      {children}
    </Paper>
  );
}
