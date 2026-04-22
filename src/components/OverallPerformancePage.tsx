'use client';

import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Avatar from '@mui/material/Avatar';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import { useThemeMode } from '@/theme-mode-context';
import Button from '@mui/material/Button';
import { buildings, Building } from '@/data/buildings';
import StackedImages from '@/components/StackedImages';
import { PerformanceGrid, GridCard, PerformanceChartCard } from '@/components/performance';
import { useLanguage } from '@/i18n';

// ── Helpers ──

function getStatusColor(score: number, goodAbove: number, moderateAbove: number): string {
  if (score >= goodAbove) return '#4caf50';
  if (score >= moderateAbove) return '#ff9800';
  return '#f44336';
}

function seededRandom(seed: number): () => number {
  let s = seed ^ 0xDEADBEEF;
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
  s = Math.imul(s ^ (s >>> 13), 0x45d9f3b);
  s = (s ^ (s >>> 16)) >>> 0;
  if (s === 0) s = 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

// ── Building score helpers (overall = avg of theme-KPI avg and operational-KPI avg) ──

function getAvgOverallScore(b: Building): number {
  const themeAvg = (b.metrics.sustainability.green + b.metrics.comfort.green + b.metrics.asset_monitoring.green + b.metrics.compliance.green) / 4;
  const opsAvg = (b.metrics.tickets.green + b.metrics.quotations.green + b.metrics.maintenance.green) / 3;
  return Math.round((themeAvg + opsAvg) / 2);
}

function getAvgOverallTrend(b: Building): number {
  const themeAvg = (b.trends.sustainability + b.trends.comfort + b.trends.asset_monitoring + b.trends.compliance) / 4;
  const opsAvg = (b.trends.tickets + b.trends.quotations + b.trends.maintenance) / 3;
  return Math.round((themeAvg + opsAvg) / 2 * 10) / 10;
}

const sortedBest = [...buildings].sort((a, b) => getAvgOverallScore(b) - getAvgOverallScore(a)).slice(0, 7);
const sortedMostImproved = [...buildings].sort((a, b) => getAvgOverallTrend(b) - getAvgOverallTrend(a)).slice(0, 7);
const sortedWorst = [...buildings].sort((a, b) => getAvgOverallScore(a) - getAvgOverallScore(b)).slice(0, 7);
const sortedMostDeteriorated = [...buildings].sort((a, b) => getAvgOverallTrend(a) - getAvgOverallTrend(b)).slice(0, 7);

// ── Cluster aggregation ──

interface ClusterEntry {
  name: string;
  image: string;
  images: string[];
  score: number;
  trend: number;
}

const clusterEntries: ClusterEntry[] = (() => {
  const groups = new Map<string, Building[]>();
  for (const b of buildings) {
    const arr = groups.get(b.group) || [];
    arr.push(b);
    groups.set(b.group, arr);
  }
  return Array.from(groups.entries()).map(([name, blds]) => ({
    name,
    image: blds[0].image,
    images: blds.map(b => b.image),
    score: Math.round(blds.reduce((s, b) => s + getAvgOverallScore(b), 0) / blds.length),
    trend: Math.round(blds.reduce((s, b) => s + getAvgOverallTrend(b), 0) / blds.length * 10) / 10,
  }));
})();

const clusterSortedBest = [...clusterEntries].sort((a, b) => b.score - a.score);
const clusterSortedWorst = [...clusterEntries].sort((a, b) => a.score - b.score);
const clusterSortedMostImproved = [...clusterEntries].sort((a, b) => b.trend - a.trend);
const clusterSortedMostDeteriorated = [...clusterEntries].sort((a, b) => a.trend - b.trend);

// ── KPI over time data ──

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateKpiTimeSeries(topicKey: string, baseScore: number, volatility = 1): number[] {
  const rng = seededRandom(topicKey.length * 1337 + baseScore);
  return MONTHS.map((_, i) => {
    const progress = i / 11;
    const target = baseScore;
    const start = target - 8 * volatility + rng() * 6 * volatility;
    const val = start + (target - start) * progress + (rng() - 0.5) * 4 * volatility;
    return Math.round(Math.max(0, Math.min(100, val)) * 10) / 10;
  });
}

// ── Component ──

interface OverallPerformancePageProps {
  themesScore: number;
  themesTrend: number;
  operationsScore: number;
  operationsTrend: number;
  overallScore: number;
  overallTrend: number;
  onBuildingSelect?: (building: Building) => void;
  onViewAllBuildings?: (sort: 'Best to Worst' | 'Worst to Best') => void;
  buildingMode?: 'buildings' | 'clusters';
}

export default function OverallPerformancePage({
  overallScore, overallTrend,
  onBuildingSelect, onViewAllBuildings, buildingMode = 'buildings',
}: OverallPerformancePageProps) {
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();
  const [leftListMode, setLeftListMode] = useState<'best' | 'improved'>('best');
  const [rightListMode, setRightListMode] = useState<'worst' | 'deteriorated'>('worst');

  const overallSeries = useMemo(() => ({
    label: t('performance.overallPerformance'),
    data: generateKpiTimeSeries('overall_performance', overallScore),
    goodAbove: 75,
    moderateAbove: 55,
  }), [overallScore, t]);

  // Building list renderer
  const renderBuildingList = (
    items: (Building | ClusterEntry)[],
    showTrend: boolean,
  ) => items.map((b, i) => {
    const score = 'metrics' in b ? getAvgOverallScore(b as Building) : (b as ClusterEntry).score;
    const trend = 'trends' in b ? getAvgOverallTrend(b as Building) : (b as ClusterEntry).trend;
    const barColor = getStatusColor(score, 75, 55);
    return (
      <Box
        key={b.name}
        onClick={() => buildingMode === 'buildings' && 'metrics' in b ? onBuildingSelect?.(b as Building) : undefined}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: 1, mx: -1,
          borderRadius: 0.5, cursor: buildingMode === 'buildings' ? 'pointer' : 'default',
          transition: 'background-color 0.15s ease',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Typography variant="caption" sx={{ width: 12, fontWeight: 600, color: 'text.secondary' }}>{i + 1}</Typography>
        {buildingMode === 'clusters' && 'images' in b ? (
          <StackedImages images={(b as ClusterEntry).images} base={24} scaleStep={0.8} peek={4} />
        ) : (
          <Avatar src={(b as Building).image} variant="rounded" sx={{ width: 28, height: 28, flexShrink: 0 }} />
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" noWrap fontWeight={500} sx={{ fontSize: '0.8rem' }}>{b.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 1 }}>
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{score}%</Typography>
              {showTrend && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: trend >= 0 ? 'success.main' : 'error.main' }}>
                  {trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 13 }} /> : <TrendingDownIcon sx={{ fontSize: 13 }} />}
                  <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', lineHeight: 1 }}>{Math.abs(trend)}%</Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Box sx={{ width: '100%', height: 4, bgcolor: c.bgSecondaryHover, borderRadius: 2 }}>
            <Box sx={{ width: `${score}%`, height: '100%', bgcolor: barColor, borderRadius: 2, transition: 'width 0.5s ease' }} />
          </Box>
        </Box>
      </Box>
    );
  });

  return (
    <PerformanceGrid>
      {/* ═══ Overall Performance Chart ═══ */}
      <PerformanceChartCard
        icon={<ShowChartOutlinedIcon sx={{ color: c.brand }} />}
        title={t('performance.overallPerformance')}
        score={overallScore}
        trend={overallTrend}
        data={overallSeries.data}
        label={t('performance.overallPerformance')}
        goodAbove={overallSeries.goodAbove}
        moderateAbove={overallSeries.moderateAbove}
        gradientId="threshold-gradient-overall"
        annotationId="overallperformancepage-grafiek"
      />

      {/* ═══ Top Buildings ═══ */}
      <GridCard
        size="sm"
        icon={<EmojiEventsOutlinedIcon sx={{ color: '#66bb6a' }} />}
        title={buildingMode === 'clusters' ? t('performance.topClusters') : t('performance.topBuildings')}
        headerRight={
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: c.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', border: `1px solid ${c.borderTertiary}` }}>
            <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: leftListMode === 'best' ? c.bgPrimary : 'transparent', color: leftListMode === 'best' ? 'text.primary' : 'text.secondary', boxShadow: leftListMode === 'best' ? c.shadow : 'none' }} onClick={() => setLeftListMode('best')}>{t('performance.top')}</Box>
            <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: leftListMode === 'improved' ? c.bgPrimary : 'transparent', color: leftListMode === 'improved' ? 'text.primary' : 'text.secondary', boxShadow: leftListMode === 'improved' ? c.shadow : 'none' }} onClick={() => setLeftListMode('improved')}>{t('performance.improved')}</Box>
          </Box>
        }
      >
        {renderBuildingList(
          buildingMode === 'clusters'
            ? (leftListMode === 'best' ? clusterSortedBest : clusterSortedMostImproved)
            : (leftListMode === 'best' ? sortedBest : sortedMostImproved),
          leftListMode === 'improved',
        )}
        <Button size="small" onClick={() => onViewAllBuildings?.('Best to Worst')} sx={{ mt: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>{t('performance.viewAll')}</Button>
      </GridCard>

      {/* ═══ Worst Buildings ═══ */}
      <GridCard
        size="sm"
        icon={<WarningAmberOutlinedIcon sx={{ color: '#ef5350' }} />}
        title={buildingMode === 'clusters' ? t('performance.worstClusters') : t('performance.worstBuildings')}
        headerRight={
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: c.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', border: `1px solid ${c.borderTertiary}` }}>
            <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: rightListMode === 'worst' ? c.bgPrimary : 'transparent', color: rightListMode === 'worst' ? 'text.primary' : 'text.secondary', boxShadow: rightListMode === 'worst' ? c.shadow : 'none' }} onClick={() => setRightListMode('worst')}>{t('performance.worst')}</Box>
            <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: rightListMode === 'deteriorated' ? c.bgPrimary : 'transparent', color: rightListMode === 'deteriorated' ? 'text.primary' : 'text.secondary', boxShadow: rightListMode === 'deteriorated' ? c.shadow : 'none' }} onClick={() => setRightListMode('deteriorated')}>{t('performance.dropping')}</Box>
          </Box>
        }
      >
        {renderBuildingList(
          buildingMode === 'clusters'
            ? (rightListMode === 'worst' ? clusterSortedWorst : clusterSortedMostDeteriorated)
            : (rightListMode === 'worst' ? sortedWorst : sortedMostDeteriorated),
          rightListMode === 'deteriorated',
        )}
        <Button size="small" onClick={() => onViewAllBuildings?.('Worst to Best')} sx={{ mt: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>{t('performance.viewAll')}</Button>
      </GridCard>

    </PerformanceGrid>
  );
}
