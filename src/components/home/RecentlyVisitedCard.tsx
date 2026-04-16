'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { useThemeMode } from '@/theme-mode-context';
import { timeAgo } from '@/utils/timeAgo';
import type { RecentItem, RecentItemKind } from '@/context/AppStateContext';
import { colorForRecentKind, labelForRecentKind } from './recentHelpers';

const ICONS: Record<RecentItemKind, React.ElementType> = {
  building: BusinessOutlinedIcon,
  zone: LayersOutlinedIcon,
  asset: SettingsInputAntennaIcon,
  ticket: AssignmentOutlinedIcon,
  quotation: ReceiptLongOutlinedIcon,
};

export interface RecentlyVisitedCardProps {
  item: RecentItem;
  onClick: (e: React.MouseEvent) => void;
}

export default function RecentlyVisitedCard({ item, onClick }: RecentlyVisitedCardProps) {
  const { themeColors: c } = useThemeMode();
  const Icon = ICONS[item.kind];
  const color = colorForRecentKind(item.kind);

  return (
    <Box
      onClick={onClick}
      sx={{
        border: `1px solid ${c.cardBorder}`,
        borderRadius: '12px',
        bgcolor: c.bgPrimary,
        boxShadow: c.cardShadow,
        p: 2,
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 4px 16px 0 ${c.shadowMedium}` },
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            bgcolor: `${color}14`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color,
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.3 }} noWrap>
            {item.label}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }} noWrap>
            {labelForRecentKind(item.kind)}{item.subtitle ? ` · ${item.subtitle}` : ''}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
          {timeAgo(item.visitedAt, new Date())}
        </Typography>
      </Box>
    </Box>
  );
}
