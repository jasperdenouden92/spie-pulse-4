'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { useThemeMode } from '@/theme-mode-context';
import { Building } from '@/data/buildings';
import StackedImages from '@/components/StackedImages';
import { GridCard } from '@/components/performance';
import { getStatusColor } from './PerformanceIndicatorsCard';

export interface RankedEntry {
  name: string;
  image: string;
  images?: string[];
  score: number;
  trend: number;
  building?: Building;
}

/** Convert building/cluster items into RankedEntry[]. Pass getMetrics for raw Building arrays, omit for items with adjustedScore/adjustedTrend. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toRanked(items: readonly any[], getMetrics?: (b: any) => { score: number; trend: number }): RankedEntry[] {
  return items.map(b => {
    const { score, trend } = getMetrics ? getMetrics(b) : { score: b.adjustedScore ?? 0, trend: b.adjustedTrend ?? 0 };
    return {
      name: b.name,
      image: b.image,
      images: b.images,
      score,
      trend,
      building: 'address' in b ? b : undefined,
    };
  });
}

interface BuildingRankingCardProps {
  variant: 'top' | 'worst';
  buildingMode?: 'buildings' | 'clusters';
  primaryItems: RankedEntry[];
  secondaryItems: RankedEntry[];
  goodAbove?: number;
  moderateAbove?: number;
  onBuildingSelect?: (building: Building) => void;
  onViewAllBuildings?: (sort: 'Best to Worst' | 'Worst to Best') => void;
}

export default function BuildingRankingCard({
  variant,
  buildingMode = 'buildings',
  primaryItems,
  secondaryItems,
  goodAbove = 80,
  moderateAbove = 60,
  onBuildingSelect,
  onViewAllBuildings,
}: BuildingRankingCardProps) {
  const { themeColors: c } = useThemeMode();
  const isTop = variant === 'top';

  const [mode, setMode] = useState<'primary' | 'secondary'>('primary');
  const items = mode === 'primary' ? primaryItems : secondaryItems;
  const showTrend = mode === 'secondary';

  const primaryLabel = isTop ? 'Top' : 'Worst';
  const secondaryLabel = isTop ? 'Improved' : 'Dropping';

  return (
    <GridCard
      size="sm"
      icon={isTop
        ? <EmojiEventsOutlinedIcon sx={{ color: '#66bb6a' }} />
        : <WarningAmberOutlinedIcon sx={{ color: '#ef5350' }} />
      }
      title={isTop
        ? (buildingMode === 'clusters' ? 'Top Clusters' : 'Top Buildings')
        : (buildingMode === 'clusters' ? 'Worst Clusters' : 'Worst Buildings')
      }
      headerRight={
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: c.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', border: `1px solid ${c.borderTertiary}` }}>
          <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: mode === 'primary' ? c.bgPrimary : 'transparent', color: mode === 'primary' ? 'text.primary' : 'text.secondary', boxShadow: mode === 'primary' ? c.shadow : 'none' }} onClick={() => setMode('primary')}>{primaryLabel}</Box>
          <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: mode === 'secondary' ? c.bgPrimary : 'transparent', color: mode === 'secondary' ? 'text.primary' : 'text.secondary', boxShadow: mode === 'secondary' ? c.shadow : 'none' }} onClick={() => setMode('secondary')}>{secondaryLabel}</Box>
        </Box>
      }
    >
      {items.map((b, i) => {
        const barColor = getStatusColor(b.score, goodAbove, moderateAbove);
        return (
          <Box
            key={b.name}
            onClick={() => b.building && buildingMode === 'buildings' ? onBuildingSelect?.(b.building) : undefined}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: 1, mx: -1,
              borderRadius: 0.5, cursor: buildingMode === 'buildings' ? 'pointer' : 'default', transition: 'background-color 0.15s ease',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Typography variant="caption" sx={{ width: 12, fontWeight: 600, color: 'text.secondary' }}>{i + 1}</Typography>
            {buildingMode === 'clusters' && b.images ? (
              <StackedImages images={b.images} base={24} scaleStep={0.8} peek={4} />
            ) : (
              <Avatar src={b.image} variant="rounded" sx={{ width: 28, height: 28, flexShrink: 0 }} />
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" noWrap fontWeight={500} sx={{ fontSize: '0.8rem', minWidth: 0 }}>{b.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 1 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{b.score}%</Typography>
                  {showTrend && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: b.trend >= 0 ? 'success.main' : 'error.main' }}>
                      {b.trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 13 }} /> : <TrendingDownIcon sx={{ fontSize: 13 }} />}
                      <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', lineHeight: 1 }}>{Math.abs(b.trend)}%</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              <Box sx={{ width: '100%', height: 4, bgcolor: c.bgSecondaryHover, borderRadius: 2 }}>
                <Box sx={{ width: `${b.score}%`, height: '100%', bgcolor: barColor, borderRadius: 2, transition: 'width 0.5s ease' }} />
              </Box>
            </Box>
          </Box>
        );
      })}
      <Button
        size="small"
        onClick={() => onViewAllBuildings?.(isTop ? 'Best to Worst' : 'Worst to Best')}
        sx={{ mt: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
      >
        View all
      </Button>
    </GridCard>
  );
}
