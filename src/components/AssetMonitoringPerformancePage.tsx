'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PerformanceGrid, GridCard, PerformanceIndicatorsCard } from '@/components/performance';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ThermostatOutlinedIcon from '@mui/icons-material/ThermostatOutlined';
import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined';
import AirOutlinedIcon from '@mui/icons-material/AirOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ElevatorOutlinedIcon from '@mui/icons-material/ElevatorOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Avatar from '@mui/material/Avatar';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import HeatPumpOutlinedIcon from '@mui/icons-material/HeatPumpOutlined';
import { LineChart, lineClasses } from '@mui/x-charts/LineChart';
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine';
import { useDrawingArea, useYScale } from '@mui/x-charts/hooks';
import { useThemeMode } from '@/theme-mode-context';
import { HorizontalThresholdGradient, InteractiveThresholdLine, ChartHoverOverlay } from '@/components/KpiChartComponents';
import Button from '@mui/material/Button';
import { buildings, Building } from '@/data/buildings';
import StackedImages from '@/components/StackedImages';

// ── Threshold gradient ──

function ThresholdGradient({ goodAbove, moderateAbove, id }: { goodAbove: number; moderateAbove: number; id: string }) {
  const { left, top, height, bottom } = useDrawingArea();
  const svgHeight = top + height + bottom;
  const scale = useYScale() as import('@mui/x-charts-vendor/d3-scale').ScaleLinear<number, number>;

  const goodOff = (scale(goodAbove) as number) / svgHeight;
  const modOff = (scale(moderateAbove) as number) / svgHeight;

  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2={`${svgHeight}px`} gradientUnits="userSpaceOnUse">
          <stop offset={goodOff} stopColor="#4caf50" stopOpacity={1} />
          <stop offset={goodOff} stopColor="#ff9800" stopOpacity={1} />
          <stop offset={modOff} stopColor="#ff9800" stopOpacity={1} />
          <stop offset={modOff} stopColor="#f44336" stopOpacity={1} />
        </linearGradient>
      </defs>
      <rect x={left - 5} y={top} width={5} height={height} fill={`url(#${id})`} rx={2} />
    </>
  );
}

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

const TOPIC_DEFS = [
  { key: 'heating', label: 'Heating', icon: <ThermostatOutlinedIcon sx={{ fontSize: 20 }} />, offset: 4, trend: 3, chartColor: '#e91e63', goodAbove: 75, moderateAbove: 55 },
  { key: 'cooling', label: 'Cooling', icon: <AcUnitOutlinedIcon sx={{ fontSize: 20 }} />, offset: -6, trend: -2, chartColor: '#00bcd4', goodAbove: 70, moderateAbove: 50 },
  { key: 'ventilation', label: 'Ventilation', icon: <AirOutlinedIcon sx={{ fontSize: 20 }} />, offset: 2, trend: 5, chartColor: '#9c27b0', goodAbove: 75, moderateAbove: 55 },
  { key: 'distribution', label: 'Distribution', icon: <AccountTreeOutlinedIcon sx={{ fontSize: 20 }} />, offset: -3, trend: -1, chartColor: '#ff9800', goodAbove: 70, moderateAbove: 50 },
  { key: 'lighting', label: 'Lighting', icon: <LightbulbOutlinedIcon sx={{ fontSize: 20 }} />, offset: 7, trend: 4, chartColor: '#ffc107', goodAbove: 80, moderateAbove: 60 },
  { key: 'transport', label: 'Transport', icon: <ElevatorOutlinedIcon sx={{ fontSize: 20 }} />, offset: -8, trend: -3, chartColor: '#0288d1', goodAbove: 70, moderateAbove: 50 },
];

function buildTopics(themeScore: number): TopicDef[] {
  return TOPIC_DEFS.map(d => {
    const score = Math.max(0, Math.min(100, themeScore + d.offset));
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

const sortedBest = [...buildings]
  .sort((a, b) => b.metrics.asset_monitoring.green - a.metrics.asset_monitoring.green)
  .slice(0, 7);

const sortedMostImproved = [...buildings]
  .sort((a, b) => b.trends.asset_monitoring - a.trends.asset_monitoring)
  .slice(0, 7);

const sortedWorst = [...buildings]
  .sort((a, b) => a.metrics.asset_monitoring.green - b.metrics.asset_monitoring.green)
  .slice(0, 7);

const sortedMostDeteriorated = [...buildings]
  .sort((a, b) => a.trends.asset_monitoring - b.trends.asset_monitoring)
  .slice(0, 7);

// ── Cluster aggregation for asset monitoring ──

interface ClusterEntry {
  name: string;
  image: string;
  images: string[];
  metrics: { asset_monitoring: { green: number; yellow: number; red: number } };
  trends: { asset_monitoring: number };
}

const clusterEntries: ClusterEntry[] = (() => {
  const groups = new Map<string, Building[]>();
  for (const b of buildings) {
    const arr = groups.get(b.group) || [];
    arr.push(b);
    groups.set(b.group, arr);
  }
  return Array.from(groups.entries()).map(([name, blds]) => {
    const avg = (fn: (b: Building) => number) => Math.round(blds.reduce((s, b) => s + fn(b), 0) / blds.length);
    return {
      name,
      image: blds[0].image,
      images: blds.map(b => b.image),
      metrics: {
        asset_monitoring: {
          green: avg(b => b.metrics.asset_monitoring.green),
          yellow: avg(b => b.metrics.asset_monitoring.yellow),
          red: avg(b => b.metrics.asset_monitoring.red),
        },
      },
      trends: {
        asset_monitoring: Math.round(blds.reduce((s, b) => s + b.trends.asset_monitoring, 0) / blds.length * 10) / 10,
      },
    };
  });
})();

const clusterSortedBest = [...clusterEntries].sort((a, b) => b.metrics.asset_monitoring.green - a.metrics.asset_monitoring.green);
const clusterSortedWorst = [...clusterEntries].sort((a, b) => a.metrics.asset_monitoring.green - b.metrics.asset_monitoring.green);
const clusterSortedMostImproved = [...clusterEntries].sort((a, b) => b.trends.asset_monitoring - a.trends.asset_monitoring);
const clusterSortedMostDeteriorated = [...clusterEntries].sort((a, b) => a.trends.asset_monitoring - b.trends.asset_monitoring);

// ── KPI over time data ──

type ViewMode = 'theme' | 'all_topics' | 'heating' | 'cooling' | 'ventilation' | 'distribution' | 'lighting' | 'transport';

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

interface ThresholdZone {
  label: string;
  min: number;
  max: number;
  color: string;
}

function buildThresholdZones(goodAbove: number, moderateAbove: number): ThresholdZone[] {
  return [
    { label: 'Poor', min: 0, max: moderateAbove, color: 'rgba(239,83,80,0.10)' },
    { label: 'Moderate', min: moderateAbove, max: goodAbove, color: 'rgba(255,167,38,0.10)' },
    { label: 'Good', min: goodAbove, max: 100, color: 'rgba(102,187,106,0.08)' },
  ];
}

const THEME_GOOD_ABOVE = 75;
const THEME_MODERATE_ABOVE = 55;

// ── Dashboard links ──

interface DashboardLink {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
}

const ASSET_MONITORING_DASHBOARDS: DashboardLink[] = [
  { id: 'asset_trend', label: 'Asset Trend', subtitle: 'Asset health and performance over time', icon: <TimelineOutlinedIcon /> },
  { id: 'warmte_koudeopslag', label: 'Warmte- Koudeopslag (WKO)', subtitle: 'Thermal energy storage performance', icon: <HeatPumpOutlinedIcon /> },
];

// ── Component ──

interface AssetMonitoringPerformancePageProps {
  themeScore?: number;
  themeTrend?: number;
  onNavigateToDashboard?: (dashboardId: string) => void;
  onBuildingSelect?: (building: Building) => void;
  onViewAllBuildings?: (sort: 'Best to Worst' | 'Worst to Best') => void;
  buildingMode?: 'buildings' | 'clusters';
}

export default function AssetMonitoringPerformancePage({ themeScore = 62, themeTrend = 2, onNavigateToDashboard, onBuildingSelect, onViewAllBuildings, buildingMode = 'buildings' }: AssetMonitoringPerformancePageProps) {
  const { themeColors: c } = useThemeMode();
  const [chartView, setChartView] = useState<ViewMode>('theme');
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

  const topics = useMemo(() => buildTopics(themeScore), [themeScore]);

  const themeSeries = useMemo(() => ({
    label: 'Asset Monitoring KPI',
    color: c.brand,
    data: generateKpiTimeSeries('asset_monitoring_theme', themeScore),
  }), [themeScore]);

  const topicSeries = useMemo(() => topics.map(t => ({
    label: t.label,
    color: t.chartColor,
    data: generateKpiTimeSeries(t.key, t.score),
    goodAbove: t.goodAbove,
    moderateAbove: t.moderateAbove,
  })), [topics]);

  const chartSeries = useMemo(() => {
    switch (chartView) {
      case 'theme':
        return [themeSeries];
      case 'all_topics':
        return [themeSeries, ...topicSeries];
      case 'heating':
        return [topicSeries[0]];
      case 'cooling':
        return [topicSeries[1]];
      case 'ventilation':
        return [topicSeries[2]];
      case 'distribution':
        return [topicSeries[3]];
      case 'lighting':
        return [topicSeries[4]];
      case 'transport':
        return [topicSeries[5]];
    }
  }, [chartView, themeSeries, topicSeries]);

  const showThresholds = chartView !== 'all_topics';

  const activeThresholdZones = useMemo(() => {
    if (!showThresholds) return [];
    switch (chartView) {
      case 'theme':
        return buildThresholdZones(THEME_GOOD_ABOVE, THEME_MODERATE_ABOVE);
      case 'heating':
        return buildThresholdZones(topics[0].goodAbove, topics[0].moderateAbove);
      case 'cooling':
        return buildThresholdZones(topics[1].goodAbove, topics[1].moderateAbove);
      case 'ventilation':
        return buildThresholdZones(topics[2].goodAbove, topics[2].moderateAbove);
      case 'distribution':
        return buildThresholdZones(topics[3].goodAbove, topics[3].moderateAbove);
      case 'lighting':
        return buildThresholdZones(topics[4].goodAbove, topics[4].moderateAbove);
      case 'transport':
        return buildThresholdZones(topics[5].goodAbove, topics[5].moderateAbove);
      default:
        return [];
    }
  }, [chartView, showThresholds, topics]);

  const yRange = useMemo(() => {
    const allValues = chartSeries.flatMap(s => s.data);
    const dataMin = Math.min(...allValues);
    const modAbove = activeThresholdZones.find(z => z.label === 'Moderate')?.min ?? 55;
    const relevantMin = showThresholds ? Math.min(dataMin, modAbove) : dataMin;
    const yMin = Math.max(0, Math.floor((relevantMin - 10) / 10) * 10);
    return { min: yMin, max: 100 };
  }, [chartSeries, activeThresholdZones, showThresholds]);

  const menuItems: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: 'theme', label: 'Asset Monitoring KPI', icon: <MonitorHeartOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'heating', label: 'Heating', icon: <ThermostatOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'cooling', label: 'Cooling', icon: <AcUnitOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'ventilation', label: 'Ventilation', icon: <AirOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'distribution', label: 'Distribution', icon: <AccountTreeOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'lighting', label: 'Lighting', icon: <LightbulbOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'transport', label: 'Transport', icon: <ElevatorOutlinedIcon sx={{ fontSize: 16 }} /> },
  ];

  return (
    <PerformanceGrid>
      {/* ═══ SECTION 1: Topic KPI Cards ═══ */}
      <PerformanceIndicatorsCard
        icon={<MonitorHeartOutlinedIcon sx={{ color: c.brand }} />}
        title="Asset Monitoring Performance"
        score={themeScore}
        trend={themeTrend}
        topics={topics}
      />

      {/* ═══ SECTION 2: Best/Worst + KPI Over Time ═══ */}
      {/* ═══ Top/Worst Buildings + KPI Over Time ═══ */}
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
            const score = b.metrics.asset_monitoring.green;
            const trend = b.trends.asset_monitoring;
            const showTrend = leftListMode === 'improved';
            const barColor = getStatusColor(score, 75, 55);
            return (
              <Box
                key={b.name}
                onClick={() => buildingMode === 'buildings' ? onBuildingSelect?.(b as Building) : undefined}
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
                  <Avatar src={b.image} variant="rounded" sx={{ width: 28, height: 28, flexShrink: 0 }} />
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
          <Button
            size="small"
            onClick={() => onViewAllBuildings?.('Best to Worst')}
            sx={{ mt: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
          >
            View all
          </Button>
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
            const score = b.metrics.asset_monitoring.green;
            const trend = b.trends.asset_monitoring;
            const showTrend = rightListMode === 'deteriorated';
            const barColor = getStatusColor(score, 75, 55);
            return (
              <Box
                key={b.name}
                onClick={() => buildingMode === 'buildings' ? onBuildingSelect?.(b as Building) : undefined}
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
                  <Avatar src={b.image} variant="rounded" sx={{ width: 28, height: 28, flexShrink: 0 }} />
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
          <Button
            size="small"
            onClick={() => onViewAllBuildings?.('Worst to Best')}
            sx={{ mt: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
          >
            View all
          </Button>
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
                    <Box sx={{
                      display: 'flex',
                      color: isActive ? c.brand : 'text.disabled',
                      transition: 'color 0.15s ease',
                    }}>
                      {item.icon}
                    </Box>
                    <Typography variant="body2" sx={{
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? c.brand : 'text.secondary',
                      transition: 'all 0.15s ease',
                    }}>
                      {item.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
        }
      >

          {(() => {
            const currentData = chartSeries.length === 1 ? chartSeries[0].data : chartSeries[0].data;
            const goodAbove = showThresholds ? (activeThresholdZones.find(z => z.label === 'Good')?.min ?? 75) : 75;
            const modAbove = showThresholds ? (activeThresholdZones.find(z => z.label === 'Moderate')?.min ?? 55) : 55;
            const gradientId = `threshold-gradient-am-area`;
            const lineGradientId = `threshold-gradient-am-line`;
            return (
              <Box sx={{ flex: 1, minHeight: 370 }}>
                <LineChart data-annotation-id="assetmonitoringperformancepage-grafiek"
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

      {/* ═══ SECTION 3: Related Dashboards ═══ */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontFamily: 'var(--font-jost), "Jost", sans-serif', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', mb: 1.5 }}>
          Asset Monitoring Dashboards
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1.5 }}>
          {ASSET_MONITORING_DASHBOARDS.map(dash => (
            <Paper
              key={dash.id}
              elevation={0}
              onClick={() => onNavigateToDashboard?.(dash.id)}
              sx={{
                py: 1.5,
                px: 2,
                border: `1px solid ${c.cardBorder}`,
                borderRadius: '12px',
                bgcolor: c.bgPrimary,
                boxShadow: c.cardShadow,
                cursor: 'pointer',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s ease',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1.5,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              <Box sx={{ color: 'text.secondary', display: 'flex', flexShrink: 0 }}>
                {dash.icon}
              </Box>
              <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
                <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.3, fontSize: '0.8rem', mb: 0 }}>{dash.label}</Typography>
                <Typography variant="caption" sx={{ lineHeight: 1.3, fontSize: '0.7rem', color: 'text.secondary', mt: 0 }}>{dash.subtitle}</Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </PerformanceGrid>
  );
}
