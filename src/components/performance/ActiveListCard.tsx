'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import FilterListIcon from '@mui/icons-material/FilterList';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage } from '@/i18n';
import GridCard from './GridCard';
import type { GridCardSize } from './GridCard';
import type { StatusCount } from './StatusOverviewCard';

export interface ActiveListItem {
  id: string;
  title: string;
  status: string;
  amount?: number;
}

interface ActiveListCardProps {
  size?: GridCardSize;
  title?: string;
  items: ActiveListItem[];
  statusCounts: StatusCount[];
  activeStatuses: string[];
  actionRequiredStatuses: string[];
  actionFilterLabel?: string;
  onViewAll?: () => void;
  renderMeta: (item: ActiveListItem) => React.ReactNode;
  renderChip?: (item: ActiveListItem) => React.ReactNode;
  renderRowActions?: (item: ActiveListItem) => React.ReactNode;
}

export default function ActiveListCard({
  size = 'lg',
  title = 'Active Items',
  items,
  statusCounts,
  activeStatuses,
  actionRequiredStatuses,
  actionFilterLabel = 'Action required',
  onViewAll,
  renderMeta,
  renderChip,
  renderRowActions,
}: ActiveListCardProps) {
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();
  const [actionFilter, setActionFilter] = useState(false);

  function getStatusColor(status: string): string {
    return statusCounts.find(s => s.status === status)?.color ?? '#888';
  }

  const filtered = items.filter(item =>
    actionFilter ? actionRequiredStatuses.includes(item.status) : activeStatuses.includes(item.status)
  );

  return (
    <GridCard
      size={size}
      title={title}
      headerRight={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<FilterListIcon sx={{ fontSize: 13 }} />}
            label={actionFilterLabel}
            size="small"
            onClick={() => setActionFilter(f => !f)}
            sx={{
              height: 22, fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer',
              bgcolor: actionFilter ? `${c.brand}14` : 'transparent',
              color: actionFilter ? c.brand : 'text.secondary',
              border: '1px solid', borderColor: actionFilter ? c.brand : 'divider',
              '& .MuiChip-icon': { ml: 0.5, mr: -0.25, color: actionFilter ? c.brand : 'text.secondary' },
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
          <Button
            size="small"
            endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
            onClick={onViewAll}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.7rem', minWidth: 0 }}
          >
            {t('performance.viewAll')}
          </Button>
        </Box>
      }
    >
      <Box sx={{ flex: 1, overflow: 'auto', maxHeight: 320, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {filtered.map(item => (
          <Box
            key={item.id}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: 1.5,
              borderBottom: '1px solid', borderColor: 'divider',
              borderRadius: 0.5,
              cursor: 'pointer', transition: 'background-color 0.15s ease',
              '&:hover': { bgcolor: 'action.hover' },
              '&:last-child': { borderBottom: 'none' },
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.8rem' }}>{item.id}</Typography>
                <Typography variant="body2" fontWeight={500} noWrap sx={{ fontSize: '0.8rem', color: 'text.primary' }}>{item.title}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                {renderMeta(item)}
              </Box>
            </Box>
            {renderChip?.(item)}
            {item.amount != null && item.amount > 0 && (
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem', flexShrink: 0, minWidth: 70, textAlign: 'right', color: 'text.secondary' }}>
                €{item.amount.toLocaleString('nl-NL')}
              </Typography>
            )}
            <Chip
              label={item.status}
              size="small"
              sx={{
                height: 20, fontSize: '0.65rem', fontWeight: 600,
                bgcolor: `${getStatusColor(item.status)}14`,
                color: getStatusColor(item.status),
                '& .MuiChip-label': { px: 0.75 },
                flexShrink: 0, minWidth: 80, justifyContent: 'center',
              }}
            />
            {renderRowActions && (
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, width: 56, justifyContent: 'center' }}>
                {renderRowActions(item)}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </GridCard>
  );
}
