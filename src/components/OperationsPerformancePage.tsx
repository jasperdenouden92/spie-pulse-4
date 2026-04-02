'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PerformanceGrid, GridCard, PerformanceChartCard } from '@/components/performance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Avatar from '@mui/material/Avatar';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import { LineChart, lineClasses } from '@mui/x-charts/LineChart';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useThemeMode } from '@/theme-mode-context';
import { HorizontalThresholdGradient, InteractiveThresholdLine, ChartHoverOverlay } from '@/components/KpiChartComponents';
import Button from '@mui/material/Button';
import { buildings, Building } from '@/data/buildings';
import StackedImages from '@/components/StackedImages';

// ── Topic definitions ──

interface TopicDef {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  chartColor: string;
  score: number;
  trend: number;
  sparkline: number[];
  goodAbove: number;
  moderateAbove: number;
}

function getStatusColor(score: number, goodAbove: number, moderateAbove: number): string {
  if (score >= goodAbove) return '#4caf50';
  if (score >= moderateAbove) return '#ff9800';
  return '#f44336';
}

function getStatusLabel(score: number, goodAbove: number, moderateAbove: number): string {
  if (score >= goodAbove) return 'Good';
  if (score >= moderateAbove) return 'Moderate';
  return 'Poor';
}

function buildTopics(opsScores: { tickets: number; quotations: number; maintenance: number }, opsTrends: { tickets: number; quotations: number; maintenance: number }): TopicDef[] {
  const defs = [
    { key: 'tickets', label: 'Tickets', icon: <ConfirmationNumberOutlinedIcon sx={{ fontSize: 20 }} />, score: opsScores.tickets, trend: opsTrends.tickets, chartColor: '#2196f3', goodAbove: 80, moderateAbove: 60 },
    { key: 'quotations', label: 'Quotations', icon: <RequestQuoteOutlinedIcon sx={{ fontSize: 20 }} />, score: opsScores.quotations, trend: opsTrends.quotations, chartColor: '#ff9800', goodAbove: 80, moderateAbove: 60 },
    { key: 'maintenance', label: 'Maintenance', icon: <EngineeringOutlinedIcon sx={{ fontSize: 20 }} />, score: opsScores.maintenance, trend: opsTrends.maintenance, chartColor: '#9c27b0', goodAbove: 80, moderateAbove: 60 },
  ];
  return defs.map(d => {
    const score = Math.max(0, Math.min(100, d.score));
    const sparkline = Array.from({ length: 10 }, (_, i) => {
      const progress = i / 9;
      const start = score - Math.abs(d.trend) * (d.trend >= 0 ? 1 : -1);
      return Math.round(Math.max(0, Math.min(100, start + (score - start) * progress + (Math.sin(i * 1.3) * 2))));
    });
    sparkline[9] = score;
    return {
      key: d.key,
      label: d.label,
      icon: d.icon,
      color: getStatusColor(score, d.goodAbove, d.moderateAbove),
      chartColor: d.chartColor,
      score,
      trend: d.trend,
      sparkline,
      goodAbove: d.goodAbove,
      moderateAbove: d.moderateAbove,
    };
  });
}

// ── Mock data helpers ──

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

// Compute average ops score for each building
function getAvgOpsScore(b: Building): number {
  return Math.round((b.metrics.tickets.green + b.metrics.quotations.green + b.metrics.maintenance.green) / 3);
}

function getAvgOpsTrend(b: Building): number {
  return Math.round((b.trends.tickets + b.trends.quotations + b.trends.maintenance) / 3 * 10) / 10;
}

const sortedBest = [...buildings]
  .sort((a, b) => getAvgOpsScore(b) - getAvgOpsScore(a))
  .slice(0, 7);

const sortedMostImproved = [...buildings]
  .sort((a, b) => getAvgOpsTrend(b) - getAvgOpsTrend(a))
  .slice(0, 7);

const sortedWorst = [...buildings]
  .sort((a, b) => getAvgOpsScore(a) - getAvgOpsScore(b))
  .slice(0, 7);

const sortedMostDeteriorated = [...buildings]
  .sort((a, b) => getAvgOpsTrend(a) - getAvgOpsTrend(b))
  .slice(0, 7);

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
    score: Math.round(blds.reduce((s, b) => s + getAvgOpsScore(b), 0) / blds.length),
    trend: Math.round(blds.reduce((s, b) => s + getAvgOpsTrend(b), 0) / blds.length * 10) / 10,
  }));
})();

const clusterSortedBest = [...clusterEntries].sort((a, b) => b.score - a.score);
const clusterSortedWorst = [...clusterEntries].sort((a, b) => a.score - b.score);
const clusterSortedMostImproved = [...clusterEntries].sort((a, b) => b.trend - a.trend);
const clusterSortedMostDeteriorated = [...clusterEntries].sort((a, b) => a.trend - b.trend);

// ── KPI over time data ──

type ViewMode = 'tickets' | 'quotations' | 'maintenance';

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

// ── Thresholds ──

interface ThresholdZone { label: string; min: number; max: number; color: string; }

function buildThresholdZones(goodAbove: number, moderateAbove: number): ThresholdZone[] {
  return [
    { label: 'Poor', min: 0, max: moderateAbove, color: 'rgba(239,83,80,0.10)' },
    { label: 'Moderate', min: moderateAbove, max: goodAbove, color: 'rgba(255,167,38,0.10)' },
    { label: 'Good', min: goodAbove, max: 100, color: 'rgba(102,187,106,0.08)' },
  ];
}

const OPS_GOOD_ABOVE = 80;
const OPS_MODERATE_ABOVE = 60;

// ── All ops dashboards ──

interface DashboardLink {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  theme: string;
}

const ALL_OPS_DASHBOARDS: DashboardLink[] = [
  // Maintenance
  { id: 'preventief_onderhoud', label: 'Preventive Maintenance', subtitle: 'Scheduled maintenance compliance', icon: <BuildOutlinedIcon />, theme: 'Maintenance' },
  { id: 'process_orders', label: 'Process Orders', subtitle: 'Work order tracking and completion', icon: <AssignmentOutlinedIcon />, theme: 'Maintenance' },
  { id: 'mjob', label: 'Multi-year Maintenance Budget', subtitle: 'Long-term maintenance planning', icon: <DateRangeOutlinedIcon />, theme: 'Maintenance' },
];

// ── Component ──

interface OperationsPerformancePageProps {
  opsScores: { tickets: number; quotations: number; maintenance: number };
  opsTrends: { tickets: number; quotations: number; maintenance: number };
  overallScore?: number;
  overallTrend?: number;
  onNavigateToDashboard?: (dashboardId: string) => void;
  onBuildingSelect?: (building: Building) => void;
  onViewAllBuildings?: (sort: 'Best to Worst' | 'Worst to Best') => void;
  buildingMode?: 'buildings' | 'clusters';
}

export default function OperationsPerformancePage({ opsScores, opsTrends, overallScore = 75, overallTrend = 3, onNavigateToDashboard, onBuildingSelect, onViewAllBuildings, buildingMode = 'buildings' }: OperationsPerformancePageProps) {
  const { themeColors: c } = useThemeMode();
  const isNarrow = useMediaQuery('(max-width:960px)');
  const [chartView, setChartView] = useState<ViewMode>('tickets');
  const [leftListMode, setLeftListMode] = useState<'best' | 'improved'>('best');
  const [rightListMode, setRightListMode] = useState<'worst' | 'deteriorated'>('worst');

  const renderSparkline = useCallback((data: number[], color: string, w = 80, h = 28) => {
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
      const t = 0.3;
      d += ` C ${p1.x + (p2.x - p0.x) * t},${p1.y + (p2.y - p0.y) * t} ${p2.x - (p3.x - p1.x) * t},${p2.y - (p3.y - p1.y) * t} ${p2.x},${p2.y}`;
    }
    return (
      <svg width={w} height={h} style={{ overflow: 'visible' }}>
        <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }, []);

  const topics = useMemo(() => buildTopics(opsScores, opsTrends), [opsScores, opsTrends]);

  const opsSeries = useMemo(() => ({
    label: 'Operational KPIs',
    color: c.brand,
    data: [55, 52, 58, 62, 48, 60, 65, 68, 72, 70, 75, overallScore],
  }), [overallScore]);

  const topicSeries = useMemo(() => topics.map(t => ({
    label: t.label,
    color: t.chartColor,
    data: generateKpiTimeSeries(t.key, t.score),
    goodAbove: t.goodAbove,
    moderateAbove: t.moderateAbove,
  })), [topics]);

  const chartSeries = useMemo(() => {
    switch (chartView) {
      case 'tickets':
        return [topicSeries[0]];
      case 'quotations':
        return [topicSeries[1]];
      case 'maintenance':
        return [topicSeries[2]];
    }
  }, [chartView, topicSeries]);

  const showThresholds = true;

  const activeThresholdZones = useMemo(() => {
    switch (chartView) {
      case 'tickets':
        return buildThresholdZones(topics[0].goodAbove, topics[0].moderateAbove);
      case 'quotations':
        return buildThresholdZones(topics[1].goodAbove, topics[1].moderateAbove);
      case 'maintenance':
        return buildThresholdZones(topics[2].goodAbove, topics[2].moderateAbove);
      default:
        return [];
    }
  }, [chartView, topics]);

  const yRange = useMemo(() => {
    const allValues = chartSeries.flatMap(s => s.data);
    const dataMin = Math.min(...allValues);
    const modAbove = activeThresholdZones.find(z => z.label === 'Moderate')?.min ?? 60;
    const relevantMin = showThresholds ? Math.min(dataMin, modAbove) : dataMin;
    const yMin = Math.max(0, Math.floor((relevantMin - 10) / 10) * 10);
    return { min: yMin, max: 100 };
  }, [chartSeries, activeThresholdZones, showThresholds]);

  const menuItems: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: 'tickets', label: 'Tickets', icon: <ConfirmationNumberOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'quotations', label: 'Quotations', icon: <RequestQuoteOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'maintenance', label: 'Maintenance', icon: <EngineeringOutlinedIcon sx={{ fontSize: 16 }} /> },
  ];

  // Group dashboards by theme
  const dashboardsByTheme = useMemo(() => {
    const groups: Record<string, DashboardLink[]> = {};
    for (const d of ALL_OPS_DASHBOARDS) {
      if (!groups[d.theme]) groups[d.theme] = [];
      groups[d.theme].push(d);
    }
    return groups;
  }, []);

  return (
    <PerformanceGrid>
      {/* ═══ Operational KPIs Combined Score Over Time (card) ═══ */}
      <PerformanceChartCard
        icon={<BuildOutlinedIcon sx={{ color: c.brand }} />}
        title="Operational KPI Performance"
        score={overallScore}
        trend={overallTrend}
        data={opsSeries.data}
        label="Operational KPIs"
        goodAbove={OPS_GOOD_ABOVE}
        moderateAbove={OPS_MODERATE_ABOVE}
        gradientId="threshold-gradient-ops"
        annotationId="operationsperformancepage-grafiek-2"
      />

      {/* ═══ Top Buildings ═══ */}
      <GridCard
        size="sm"
        icon={<EmojiEventsOutlinedIcon sx={{ color: '#66bb6a' }} />}
        title={buildingMode === 'clusters' ? 'Top Clusters' : 'Top Buildings'}
        headerRight={
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: c.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', border: `1px solid ${c.borderTertiary}` }}>
            <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: leftListMode === 'best' ? c.bgPrimary : 'transparent', color: leftListMode === 'best' ? 'text.primary' : 'text.secondary', boxShadow: leftListMode === 'best' ? c.shadow : 'none' }} onClick={() => setLeftListMode('best')}>Top</Box>
            <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: leftListMode === 'improved' ? c.bgPrimary : 'transparent', color: leftListMode === 'improved' ? 'text.primary' : 'text.secondary', boxShadow: leftListMode === 'improved' ? c.shadow : 'none' }} onClick={() => setLeftListMode('improved')}>Improved</Box>
          </Box>
        }
      >
          {(buildingMode === 'clusters'
            ? (leftListMode === 'best' ? clusterSortedBest : clusterSortedMostImproved)
            : (leftListMode === 'best' ? sortedBest : sortedMostImproved)
          ).map((b, i) => {
            const score = 'metrics' in b ? getAvgOpsScore(b as Building) : (b as ClusterEntry).score;
            const trend = 'trends' in b ? getAvgOpsTrend(b as Building) : (b as ClusterEntry).trend;
            const showTrend = leftListMode === 'improved';
            const barColor = getStatusColor(score, 80, 60);
            return (
              <Box
                key={b.name}
                onClick={() => buildingMode === 'buildings' && 'metrics' in b ? onBuildingSelect?.(b as Building) : undefined}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: 1, mx: -1,
                  borderRadius: 0.5, cursor: buildingMode === 'buildings' ? 'pointer' : 'default', transition: 'background-color 0.15s ease',
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
          })}
          <Button size="small" onClick={() => onViewAllBuildings?.('Best to Worst')} sx={{ mt: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>View all</Button>
      </GridCard>

      {/* ═══ Worst Buildings ═══ */}
      <GridCard
        size="sm"
        icon={<WarningAmberOutlinedIcon sx={{ color: '#ef5350' }} />}
        title={buildingMode === 'clusters' ? 'Worst Clusters' : 'Worst Buildings'}
        headerRight={
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: c.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', border: `1px solid ${c.borderTertiary}` }}>
            <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: rightListMode === 'worst' ? c.bgPrimary : 'transparent', color: rightListMode === 'worst' ? 'text.primary' : 'text.secondary', boxShadow: rightListMode === 'worst' ? c.shadow : 'none' }} onClick={() => setRightListMode('worst')}>Worst</Box>
            <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: rightListMode === 'deteriorated' ? c.bgPrimary : 'transparent', color: rightListMode === 'deteriorated' ? 'text.primary' : 'text.secondary', boxShadow: rightListMode === 'deteriorated' ? c.shadow : 'none' }} onClick={() => setRightListMode('deteriorated')}>Dropping</Box>
          </Box>
        }
      >
          {(buildingMode === 'clusters'
            ? (rightListMode === 'worst' ? clusterSortedWorst : clusterSortedMostDeteriorated)
            : (rightListMode === 'worst' ? sortedWorst : sortedMostDeteriorated)
          ).map((b, i) => {
            const score = 'metrics' in b ? getAvgOpsScore(b as Building) : (b as ClusterEntry).score;
            const trend = 'trends' in b ? getAvgOpsTrend(b as Building) : (b as ClusterEntry).trend;
            const showTrend = rightListMode === 'deteriorated';
            const barColor = getStatusColor(score, 80, 60);
            return (
              <Box
                key={b.name}
                onClick={() => buildingMode === 'buildings' && 'metrics' in b ? onBuildingSelect?.(b as Building) : undefined}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: 1, mx: -1,
                  borderRadius: 0.5, cursor: buildingMode === 'buildings' ? 'pointer' : 'default', transition: 'background-color 0.15s ease',
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
          })}
          <Button size="small" onClick={() => onViewAllBuildings?.('Worst to Best')} sx={{ mt: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>View all</Button>
      </GridCard>

      {/* ═══ KPI Score Over Time ═══ */}
      <GridCard
        size="md"
        icon={<ShowChartOutlinedIcon sx={{ color: c.brand }} />}
        title="KPI Score Over Time"
        headerRight={
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, flexShrink: 0 }}>
            {menuItems.map(item => {
              const isActive = chartView === item.key;
              return (
                <Box
                  key={item.key}
                  onClick={() => setChartView(item.key)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.75,
                    px: 1.5, py: 0.75, borderRadius: 1,
                    cursor: 'pointer', userSelect: 'none',
                    bgcolor: isActive ? `${c.brand}14` : 'transparent',
                    transition: 'all 0.15s ease',
                    '&:hover': { bgcolor: isActive ? `${c.brand}20` : 'action.hover' },
                  }}
                >
                  <Box sx={{ display: 'flex', color: isActive ? c.brand : 'text.disabled', transition: 'color 0.15s ease' }}>{item.icon}</Box>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: isActive ? 600 : 400, color: isActive ? c.brand : 'text.secondary', transition: 'all 0.15s ease' }}>{item.label}</Typography>
                </Box>
              );
            })}
          </Box>
        }
      >

          {(() => {
            const currentData = chartSeries[0].data;
            const goodAbove = activeThresholdZones.find(z => z.label === 'Good')?.min ?? 80;
            const modAbove = activeThresholdZones.find(z => z.label === 'Moderate')?.min ?? 60;
            const gradientId = `threshold-gradient-sub-${chartView}`;
            const lineGradientId = `threshold-gradient-sub-line-${chartView}`;
            return (
              <Box sx={{ flex: 1, minHeight: 370 }}>
                <LineChart data-annotation-id="operationsperformancepage-grafiek"
                  xAxis={[{ data: MONTHS, scaleType: 'point', tickLabelStyle: { fontSize: 10, fill: c.chartAxisText, fontWeight: 500 } }]}
                  yAxis={[{ min: yRange.min, max: yRange.max, tickLabelStyle: { fontSize: 10, fill: c.chartAxisText, fontWeight: 500 }, valueFormatter: (v: number | null) => `${v}%` }]}
                  series={chartSeries.map(s => ({ data: s.data, label: s.label, color: c.brand, curve: 'catmullRom' as const, showMark: false, area: showThresholds }))}
                  height={370}
                  margin={{ top: 48, right: 50, bottom: 28, left: 50 }}
                  grid={{ horizontal: true }}
                  hideLegend
                  slotProps={{ tooltip: { trigger: 'none' } }}
                  axisHighlight={{ x: 'none', y: 'none' }}
                  sx={{
                    '& .MuiLineElement-root': { stroke: showThresholds ? `url(#${lineGradientId})` : c.brand, strokeWidth: 1.5, strokeLinecap: 'round', strokeDasharray: 'none !important' },
                    [`& .${lineClasses.area}`]: { fill: showThresholds ? `url(#${gradientId})` : undefined, filter: 'none', opacity: 0.15 },
                    '& .MuiChartsGrid-line': { stroke: c.chartGridLine, strokeWidth: 1 },
                    '& .MuiChartsAxis-line': { stroke: 'transparent' },
                    '& .MuiChartsAxis-tick': { stroke: 'transparent' },
                  }}
                >
                  {showThresholds && (
                    <>
                      <HorizontalThresholdGradient data={currentData} goodAbove={goodAbove} moderateAbove={modAbove} id={gradientId} />
                      <HorizontalThresholdGradient data={currentData} goodAbove={goodAbove} moderateAbove={modAbove} id={lineGradientId} goodColor="#43a047" moderateColor="#ef6c00" poorColor="#c62828" />
                      <InteractiveThresholdLine y={goodAbove} label={`Good: ${goodAbove}–100%`} />
                      <InteractiveThresholdLine y={modAbove} label={`Moderate: ${modAbove}–${goodAbove}%`} />
                    </>
                  )}
                  {showThresholds && (
                    <ChartHoverOverlay
                      data={currentData}
                      labels={MONTHS}
                      getColor={(v) => v >= goodAbove ? '#66bb6a' : v >= modAbove ? '#ffa726' : '#ef5350'}
                    />
                  )}
                </LineChart>
              </Box>
            );
          })()}
      </GridCard>
    </PerformanceGrid>
  );
}
