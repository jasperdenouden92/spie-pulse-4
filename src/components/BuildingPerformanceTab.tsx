'use client';

import React, { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Chip from '@mui/material/Chip';
import { useLanguage } from '@/i18n';
import { useURLState } from '@/hooks/useURLState';
import { useThemeMode } from '@/theme-mode-context';
import type { Building } from '@/data/buildings';
import KPICard from '@/components/KPICard';
import BuildingPerformanceDetail from '@/components/BuildingPerformanceDetail';
import BuildingOverallPerformanceDetail from '@/components/BuildingOverallPerformanceDetail';
import {
  getMetricSpec,
  generateKpiTimeSeries,
  computeAverageTopicScore,
  THEME_METRIC_KEYS,
  OPERATIONAL_METRIC_KEYS,
  type BuildingMetricKey,
} from '@/components/buildingPerformanceMetricConfig';

const ALL_METRIC_KEYS: BuildingMetricKey[] = [...THEME_METRIC_KEYS, ...OPERATIONAL_METRIC_KEYS];

function isBuildingMetricKey(value: string): value is BuildingMetricKey {
  return (ALL_METRIC_KEYS as string[]).includes(value);
}

function getRating(score: number, t: (k: 'performance.good' | 'performance.moderate' | 'performance.poor') => string) {
  if (score >= 80) return { label: t('performance.good'), color: '#4caf50' };
  if (score >= 60) return { label: t('performance.moderate'), color: '#ff9800' };
  return { label: t('performance.poor'), color: '#f44336' };
}

interface MetricKpiTileProps {
  building: Building;
  metricKey: BuildingMetricKey;
  onClick: () => void;
}

function MetricKpiTile({ building, metricKey, onClick }: MetricKpiTileProps) {
  const { t } = useLanguage();
  const spec = getMetricSpec(metricKey);
  const baseScore = building.metrics[metricKey].green;
  const score = useMemo(() => computeAverageTopicScore(metricKey, baseScore), [metricKey, baseScore]);
  const trend = building.trends[metricKey];
  const sparkline = useMemo(
    () => generateKpiTimeSeries(`${building.id}-${metricKey}-tile`, score),
    [building.id, metricKey, score],
  );
  return (
    <KPICard
      title={t(spec.metricLabelKey)}
      icon={spec.icon}
      score={score}
      trend={trend}
      sparklineData={sparkline}
      periodLabel=""
      isCompact
      performanceRating={getRating(score, t)}
      onClick={onClick}
    />
  );
}

interface OverallCardProps {
  building: Building;
  onClick?: () => void;
}

function renderHeroSparkline(data: number[], color: string, w = 120, h = 40) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * h,
  }));
  if (pts.length < 2) return null;
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const tension = 0.3;
    d += ` C ${p1.x + (p2.x - p0.x) * tension},${p1.y + (p2.y - p0.y) * tension} ${p2.x - (p3.x - p1.x) * tension},${p2.y - (p3.y - p1.y) * tension} ${p2.x},${p2.y}`;
  }
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OverallCard({ building, onClick }: OverallCardProps) {
  const { t } = useLanguage();
  const { themeColors: c } = useThemeMode();
  const score = building.performance.green;
  const trend = building.trends.overall;
  const sparkline = useMemo(
    () => generateKpiTimeSeries(`${building.id}-overall`, score),
    [building.id, score],
  );
  const rating = getRating(score, t);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ display: 'flex', color: 'text.secondary', '& .MuiSvgIcon-root': { fontSize: 18 } }}>
          <SpeedOutlinedIcon />
        </Box>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'var(--font-jost), "Jost", sans-serif',
            fontWeight: 600,
            color: 'text.secondary',
          }}
        >
          {t('performance.overallPerformance')}
        </Typography>
      </Box>
      <Box
        component={onClick ? 'button' : 'div'}
        onClick={onClick}
        sx={{
          p: 2.25,
          borderRadius: '14px',
          bgcolor: c.bgPrimary,
          border: `1px solid ${c.cardBorder}`,
          boxShadow: `0 2px 12px 0 ${c.shadowMedium}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          textAlign: 'left',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s ease',
          ...(onClick && {
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 24px 0 ${c.shadowMedium}`,
            },
          }),
        }}
      >
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 1.25, flexWrap: 'wrap', minWidth: 0 }}>
          <Typography sx={{ fontFamily: 'var(--font-jost), "Jost", sans-serif', fontWeight: 700, fontSize: '1.875rem', lineHeight: 1, color: 'text.primary' }}>
            {score}%
          </Typography>
          <Chip
            label={rating.label}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.7rem',
              fontWeight: 600,
              bgcolor: `${rating.color}18`,
              color: rating.color,
              '& .MuiChip-label': { px: 1 },
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: trend >= 0 ? 'success.main' : 'error.main' }}>
            {trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 18 }} /> : <TrendingDownIcon sx={{ fontSize: 18 }} />}
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
              {Math.abs(trend)}%
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {renderHeroSparkline(sparkline, rating.color)}
        </Box>
      </Box>
    </Box>
  );
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  label: string;
  score: number;
  trend: number;
}

function SectionHeader({ icon, label, score, trend }: SectionHeaderProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'flex', color: 'text.secondary', '& .MuiSvgIcon-root': { fontSize: 18 } }}>
        {icon}
      </Box>
      <Typography
        variant="body2"
        sx={{
          fontFamily: 'var(--font-jost), "Jost", sans-serif',
          fontWeight: 600,
          color: 'text.secondary',
        }}
      >
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, ml: 0.5 }}>
        {score}%
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: trend >= 0 ? 'success.main' : 'error.main' }}>
        {trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
          {Math.abs(trend)}%
        </Typography>
      </Box>
    </Box>
  );
}

interface BuildingPerformanceTabProps {
  building: Building;
}

export default function BuildingPerformanceTab({ building }: BuildingPerformanceTabProps) {
  const { t } = useLanguage();
  const { setURLParams } = useURLState();
  const searchParams = useSearchParams();

  const perfMetricRaw = searchParams.get('perfMetric') ?? '';
  const perfMetric: BuildingMetricKey | null = isBuildingMetricKey(perfMetricRaw) ? perfMetricRaw : null;
  const isOverallDetail = perfMetricRaw === 'overall';

  const handleSelect = (key: BuildingMetricKey) => setURLParams({ perfMetric: key });
  const handleSelectOverall = () => setURLParams({ perfMetric: 'overall' });
  const handleBack = () => setURLParams({ perfMetric: '' });

  const themeAggregate = useMemo(() => {
    const score = Math.round(
      THEME_METRIC_KEYS.reduce((sum, k) => sum + computeAverageTopicScore(k, building.metrics[k].green), 0) / THEME_METRIC_KEYS.length,
    );
    const trend = Math.round(
      THEME_METRIC_KEYS.reduce((sum, k) => sum + building.trends[k], 0) / THEME_METRIC_KEYS.length,
    );
    return { score, trend };
  }, [building.metrics, building.trends]);

  const opsAggregate = useMemo(() => {
    const score = Math.round(
      OPERATIONAL_METRIC_KEYS.reduce((sum, k) => sum + computeAverageTopicScore(k, building.metrics[k].green), 0) / OPERATIONAL_METRIC_KEYS.length,
    );
    const trend = Math.round(
      OPERATIONAL_METRIC_KEYS.reduce((sum, k) => sum + building.trends[k], 0) / OPERATIONAL_METRIC_KEYS.length,
    );
    return { score, trend };
  }, [building.metrics, building.trends]);

  if (isOverallDetail) {
    return (
      <Box sx={{ pb: 3 }}>
        <BuildingOverallPerformanceDetail building={building} onBack={handleBack} />
      </Box>
    );
  }

  if (perfMetric) {
    return (
      <Box sx={{ pb: 3 }}>
        <BuildingPerformanceDetail
          building={building}
          metricKey={perfMetric}
          onBack={handleBack}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2, pb: 3 }}>
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          fontSize: '0.75rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          mt: -1,
        }}
      >
        {t('performance.averageScoreLastMonth')}
      </Typography>
      <OverallCard building={building} onClick={handleSelectOverall} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <SectionHeader
          icon={<CategoryOutlinedIcon />}
          label={t('performance.themeKpis')}
          score={themeAggregate.score}
          trend={themeAggregate.trend}
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
          {THEME_METRIC_KEYS.map(key => (
            <MetricKpiTile
              key={key}
              building={building}
              metricKey={key}
              onClick={() => handleSelect(key)}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <SectionHeader
          icon={<EngineeringOutlinedIcon />}
          label={t('performance.operationalKpis')}
          score={opsAggregate.score}
          trend={opsAggregate.trend}
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
          {OPERATIONAL_METRIC_KEYS.map(key => (
            <MetricKpiTile
              key={key}
              building={building}
              metricKey={key}
              onClick={() => handleSelect(key)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
