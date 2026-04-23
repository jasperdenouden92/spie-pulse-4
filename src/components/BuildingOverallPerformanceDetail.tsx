'use client';

import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import { useLanguage } from '@/i18n';
import type { Building } from '@/data/buildings';
import { KpiScoreOverTimeCard } from '@/components/performance';
import type { ViewMenuItem } from '@/components/performance';
import {
  generateKpiTimeSeries,
  computeAverageTopicScore,
  THEME_METRIC_KEYS,
  OPERATIONAL_METRIC_KEYS,
} from '@/components/buildingPerformanceMetricConfig';

function getRating(score: number, t: (k: 'performance.good' | 'performance.moderate' | 'performance.poor') => string) {
  if (score >= 80) return { label: t('performance.good'), color: '#4caf50' };
  if (score >= 60) return { label: t('performance.moderate'), color: '#ff9800' };
  return { label: t('performance.poor'), color: '#f44336' };
}

type OverviewView = 'overall' | 'themes' | 'operations';

interface BuildingOverallPerformanceDetailProps {
  building: Building;
  onBack: () => void;
}

export default function BuildingOverallPerformanceDetail({ building, onBack }: BuildingOverallPerformanceDetailProps) {
  const { t } = useLanguage();
  const score = building.performance.green;
  const trend = building.trends.overall;
  const rating = getRating(score, t);

  const [view, setView] = useState<OverviewView>('overall');

  const seriesByView = useMemo(() => {
    const themeAvg = Math.round(
      THEME_METRIC_KEYS.reduce((sum, k) => sum + computeAverageTopicScore(k, building.metrics[k].green), 0) / THEME_METRIC_KEYS.length,
    );
    const opsAvg = Math.round(
      OPERATIONAL_METRIC_KEYS.reduce((sum, k) => sum + computeAverageTopicScore(k, building.metrics[k].green), 0) / OPERATIONAL_METRIC_KEYS.length,
    );
    return {
      overall: {
        label: t('performance.overallPerformance'),
        data: generateKpiTimeSeries(`${building.id}-overall-chart`, building.performance.green),
      },
      themes: {
        label: t('performance.themeKpis'),
        data: generateKpiTimeSeries(`${building.id}-themes-chart`, themeAvg),
      },
      operations: {
        label: t('performance.operationalKpis'),
        data: generateKpiTimeSeries(`${building.id}-ops-chart`, opsAvg),
      },
    };
  }, [building.id, building.metrics, building.performance.green, t]);

  const menuItems: ViewMenuItem[] = useMemo(() => [
    { key: 'overall', label: t('performance.overallPerformance'), icon: <SpeedOutlinedIcon /> },
    { key: 'themes', label: t('performance.themeKpis'), icon: <CategoryOutlinedIcon /> },
    { key: 'operations', label: t('performance.operationalKpis'), icon: <EngineeringOutlinedIcon /> },
  ], [t]);

  const chartSeries = useMemo(() => [seriesByView[view]], [view, seriesByView]);

  const yRange = useMemo(() => {
    const values = chartSeries.flatMap(s => s.data);
    const dataMin = Math.min(...values);
    const yMin = Math.max(0, Math.floor((dataMin - 10) / 10) * 10);
    return { min: yMin, max: 100 };
  }, [chartSeries]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Tooltip title={t('common.back')}>
          <IconButton size="small" onClick={onBack} sx={{ color: 'text.secondary' }}>
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
        <Box sx={{ color: 'text.secondary', display: 'flex', '& .MuiSvgIcon-root': { fontSize: 22 } }}>
          <SpeedOutlinedIcon />
        </Box>
        <Typography variant="h6" sx={{ fontFamily: 'var(--font-jost), "Jost", sans-serif', fontWeight: 600 }}>
          {t('performance.overallPerformance')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ml: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
            {score}%
          </Typography>
          <Chip
            label={rating.label}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 600,
              bgcolor: `${rating.color}18`,
              color: rating.color,
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: trend >= 0 ? 'success.main' : 'error.main', ml: 0.5 }}>
          {trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
            {Math.abs(trend)}%
          </Typography>
        </Box>
      </Box>

      <KpiScoreOverTimeCard
        menuItems={menuItems}
        activeView={view}
        onViewChange={(k) => setView(k as OverviewView)}
        chartSeries={chartSeries}
        showThresholds={false}
        goodAbove={80}
        moderateAbove={60}
        yRange={yRange}
        gradientId={`bldg-perf-overall-${building.id}`}
        menuVariant="dropdown"
      />
    </Box>
  );
}
