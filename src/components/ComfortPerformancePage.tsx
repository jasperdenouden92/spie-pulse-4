'use client';

import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ThermostatOutlinedIcon from '@mui/icons-material/ThermostatOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import AirOutlinedIcon from '@mui/icons-material/AirOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Avatar from '@mui/material/Avatar';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ParkOutlinedIcon from '@mui/icons-material/ParkOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import SsidChartOutlinedIcon from '@mui/icons-material/SsidChartOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import { LineChart, lineClasses } from '@mui/x-charts/LineChart';
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine';
import { useDrawingArea, useYScale } from '@mui/x-charts/hooks';
import { colors } from '@/colors';
import { HorizontalThresholdGradient, InteractiveThresholdLine, ChartHoverOverlay } from '@/components/KpiChartComponents';
import Button from '@mui/material/Button';
import { buildings, Building } from '@/data/buildings';
import StackedImages from '@/components/StackedImages';

// ── Threshold gradient (rendered inside LineChart SVG, follows MUI AreaChartFillByValue pattern) ──

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
      {/* Gradient bar indicator on the left */}
      <rect x={left - 5} y={top} width={5} height={height} fill={`url(#${id})`} rx={2} />
    </>
  );
}

// ── Topic definitions ────────────────────────────────────────────────────────

interface TopicDef {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;        // status color (green/orange/red)
  chartColor: string;   // line color in charts (non-status)
  score: number;
  trend: number;
  sparkline: number[];
  goodAbove: number;    // score >= this = Good
  moderateAbove: number; // score >= this = Moderate
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

// Topic definitions — offsets from theme score so they always average to exactly the theme KPI
// Offsets: temperature +7, humidity -13, air_quality +6 → sum = 0
// Per-topic thresholds: [good threshold, moderate threshold] — below moderate = poor
const TOPIC_DEFS = [
  { key: 'temperature', label: 'Temperature', icon: <ThermostatOutlinedIcon sx={{ fontSize: 20 }} />, offset: 7, trend: 3, chartColor: '#e91e63', goodAbove: 80, moderateAbove: 60 },
  { key: 'humidity', label: 'Relative Humidity', icon: <WaterDropOutlinedIcon sx={{ fontSize: 20 }} />, offset: -13, trend: -4, chartColor: '#9c27b0', goodAbove: 80, moderateAbove: 55 },
  { key: 'air_quality', label: 'Air Quality', icon: <AirOutlinedIcon sx={{ fontSize: 20 }} />, offset: 6, trend: 7, chartColor: '#00bcd4', goodAbove: 85, moderateAbove: 65 },
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

// ── Mock data helpers ────────────────────────────────────────────────────────

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

function getBuildingComfortScore(name: string): number {
  const b = buildings.find(b => b.name === name);
  return b ? b.metrics.comfort.green : 50;
}

const sortedBest = [...buildings]
  .sort((a, b) => b.metrics.comfort.green - a.metrics.comfort.green)
  .slice(0, 7);

const sortedMostImproved = [...buildings]
  .sort((a, b) => b.trends.comfort - a.trends.comfort)
  .slice(0, 7);

const sortedWorst = [...buildings]
  .sort((a, b) => a.metrics.comfort.green - b.metrics.comfort.green)
  .slice(0, 7);

const sortedMostDeteriorated = [...buildings]
  .sort((a, b) => a.trends.comfort - b.trends.comfort)
  .slice(0, 7);

// ── Cluster aggregation for comfort ──

interface ClusterEntry {
  name: string;
  image: string;
  images: string[];
  metrics: { comfort: { green: number; yellow: number; red: number } };
  trends: { comfort: number };
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
        comfort: {
          green: avg(b => b.metrics.comfort.green),
          yellow: avg(b => b.metrics.comfort.yellow),
          red: avg(b => b.metrics.comfort.red),
        },
      },
      trends: {
        comfort: Math.round(blds.reduce((s, b) => s + b.trends.comfort, 0) / blds.length * 10) / 10,
      },
    };
  });
})();

const clusterSortedBest = [...clusterEntries].sort((a, b) => b.metrics.comfort.green - a.metrics.comfort.green);
const clusterSortedWorst = [...clusterEntries].sort((a, b) => a.metrics.comfort.green - b.metrics.comfort.green);
const clusterSortedMostImproved = [...clusterEntries].sort((a, b) => b.trends.comfort - a.trends.comfort);
const clusterSortedMostDeteriorated = [...clusterEntries].sort((a, b) => a.trends.comfort - b.trends.comfort);

// ── KPI over time data ───────────────────────────────────────────────────────

type ViewMode = 'theme' | 'all_topics' | 'temperature' | 'humidity' | 'air_quality';

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

// Chart series are built inside the component since they depend on props

// ── Thresholds ───────────────────────────────────────────────────────────────

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

// Theme-level thresholds (used for Comfort KPI view)
const THEME_GOOD_ABOVE = 80;
const THEME_MODERATE_ABOVE = 60;

// ── Comfort dashboard links ──────────────────────────────────────────────────

interface DashboardLink {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
}

const COMFORT_DASHBOARDS: DashboardLink[] = [
  { id: 'comfort_gebouwoverzicht', label: 'Comfort Building Overview', subtitle: 'Heatmap, scores per building and zone', icon: <GridViewOutlinedIcon /> },
  { id: 'comforttrend', label: 'Comfort Trend', subtitle: 'Temperature and air quality trends over time', icon: <TimelineOutlinedIcon /> },
  { id: 'adaptieve_temperatuurgrenzen', label: 'Adaptive Temperature Limits', subtitle: 'Upper and lower bounds per season', icon: <TuneOutlinedIcon /> },
  { id: 'frisse_scholen', label: 'Frisse Scholen', subtitle: 'CO₂, temperature and ventilation per school', icon: <ParkOutlinedIcon /> },
];

// ── Component ────────────────────────────────────────────────────────────────

interface ComfortPerformancePageProps {
  themeScore?: number;
  themeTrend?: number;
  onNavigateToDashboard?: (dashboardId: string) => void;
  onBuildingSelect?: (building: Building) => void;
  onViewAllBuildings?: (sort: 'Best to Worst' | 'Worst to Best') => void;
  buildingMode?: 'buildings' | 'clusters';
}

export default function ComfortPerformancePage({ themeScore = 92, themeTrend = 5, onNavigateToDashboard, onBuildingSelect, onViewAllBuildings, buildingMode = 'buildings' }: ComfortPerformancePageProps) {
  const [chartView, setChartView] = useState<ViewMode>('theme');
  const [leftListMode, setLeftListMode] = useState<'best' | 'improved'>('best');
  const [rightListMode, setRightListMode] = useState<'worst' | 'deteriorated'>('worst');

  // Sparkline renderer (smooth Catmull-Rom curves)
  const renderSparkline = (data: number[], color: string, w = 80, h = 28) => {
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
  };

  // Build topics from theme score so averages always match the KPI card
  const topics = useMemo(() => buildTopics(themeScore), [themeScore]);

  // Build chart series from current topics
  const themeSeries = useMemo(() => ({
    label: 'Comfort KPI',
    color: colors.brand,
    data: generateKpiTimeSeries('comfort_theme', themeScore),
  }), [themeScore]);

  const topicSeries = useMemo(() => topics.map(t => ({
    label: t.label,
    color: t.chartColor,
    data: generateKpiTimeSeries(t.key, t.score, t.key === 'humidity' ? 4 : 1),
    goodAbove: t.goodAbove,
    moderateAbove: t.moderateAbove,
  })), [topics]);

  // Chart series based on view mode
  const chartSeries = useMemo(() => {
    switch (chartView) {
      case 'theme':
        return [themeSeries];
      case 'all_topics':
        return [themeSeries, ...topicSeries];
      case 'temperature':
        return [topicSeries[0]];
      case 'humidity':
        return [topicSeries[1]];
      case 'air_quality':
        return [topicSeries[2]];
    }
  }, [chartView, themeSeries, topicSeries]);

  const showThresholds = chartView !== 'all_topics';

  // Per-view threshold zones
  const activeThresholdZones = useMemo(() => {
    if (!showThresholds) return [];
    switch (chartView) {
      case 'theme':
        return buildThresholdZones(THEME_GOOD_ABOVE, THEME_MODERATE_ABOVE);
      case 'temperature':
        return buildThresholdZones(topics[0].goodAbove, topics[0].moderateAbove);
      case 'humidity':
        return buildThresholdZones(topics[1].goodAbove, topics[1].moderateAbove);
      case 'air_quality':
        return buildThresholdZones(topics[2].goodAbove, topics[2].moderateAbove);
      default:
        return [];
    }
  }, [chartView, showThresholds, topics]);

  // Dynamic y-axis range based on data and thresholds
  const yRange = useMemo(() => {
    const allValues = chartSeries.flatMap(s => s.data);
    const dataMin = Math.min(...allValues);
    const modAbove = activeThresholdZones.find(z => z.label === 'Moderate')?.min ?? 60;
    const relevantMin = showThresholds ? Math.min(dataMin, modAbove) : dataMin;
    const yMin = Math.max(0, Math.floor((relevantMin - 10) / 10) * 10);
    return { min: yMin, max: 100 };
  }, [chartSeries, activeThresholdZones, showThresholds]);

  const menuItems: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: 'theme', label: 'Comfort KPI', icon: <SpaOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'temperature', label: 'Temperature', icon: <ThermostatOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'humidity', label: 'Relative Humidity', icon: <WaterDropOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'air_quality', label: 'Air Quality', icon: <AirOutlinedIcon sx={{ fontSize: 16 }} /> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ═══ SECTION 1: Theme KPI + Topic KPI Cards ═══ */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <SpaOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="subtitle2" sx={{ fontFamily: 'var(--font-jost), "Jost", sans-serif', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
            Comfort Performance
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
            {themeScore}%
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: themeTrend >= 0 ? 'success.main' : 'error.main' }}>
            {themeTrend >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
              {Math.abs(themeTrend)}%
            </Typography>
          </Box>
        </Box>

        {/* Topic cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {topics.map(topic => (
            <Paper
              key={topic.key}
              elevation={0}
              sx={{
                p: 2.5,
                border: 'none',
                borderRadius: '12px',
                bgcolor: '#ffffff',
                boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              {/* Row 1: Icon + Title */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ color: 'text.secondary', display: 'flex', '& .MuiSvgIcon-root': { fontSize: '18px !important' } }}>{topic.icon}</Box>
                <Typography variant="body2" fontWeight={600} sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{topic.label}</Typography>
              </Box>

              {/* Row 2+3 left: Score + Trend/Label, right: Sparkline */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.15rem', lineHeight: 1.2 }}>{topic.score}%</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: topic.trend >= 0 ? 'success.main' : 'error.main' }}>
                      {topic.trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 12 }} /> : <TrendingDownIcon sx={{ fontSize: 12 }} />}
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>{Math.abs(topic.trend)}%</Typography>
                    </Box>
                    <Chip label={getStatusLabel(topic.score, topic.goodAbove, topic.moderateAbove)} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: `${getStatusColor(topic.score, topic.goodAbove, topic.moderateAbove)}18`, color: getStatusColor(topic.score, topic.goodAbove, topic.moderateAbove), '& .MuiChip-label': { px: 0.75 } }} />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  {renderSparkline(topic.sparkline, getStatusColor(topic.score, topic.goodAbove, topic.moderateAbove))}
                </Box>
              </Box>

            </Paper>
          ))}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
          >
            View performance indicators
          </Button>
        </Box>
      </Box>

      {/* ═══ SECTION 2: Best/Worst + KPI Over Time ═══ */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 3 }}>
        {/* Best performing / Most improved */}
        <Paper elevation={0} sx={{ p: 2.5, border: 'none', borderRadius: '12px', bgcolor: '#ffffff', boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEventsOutlinedIcon sx={{ fontSize: 18, color: '#66bb6a' }} />
              <Typography variant="subtitle2" fontWeight={600}>{buildingMode === 'clusters' ? 'Top Clusters' : 'Top Buildings'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: colors.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', border: `1px solid ${colors.borderTertiary}` }}>
              <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: leftListMode === 'best' ? 'white' : 'transparent', color: leftListMode === 'best' ? 'text.primary' : 'text.secondary', boxShadow: leftListMode === 'best' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }} onClick={() => setLeftListMode('best')}>Top</Box>
              <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: leftListMode === 'improved' ? 'white' : 'transparent', color: leftListMode === 'improved' ? 'text.primary' : 'text.secondary', boxShadow: leftListMode === 'improved' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }} onClick={() => setLeftListMode('improved')}>Improved</Box>
            </Box>
          </Box>
          {(buildingMode === 'clusters'
            ? (leftListMode === 'best' ? clusterSortedBest : clusterSortedMostImproved)
            : (leftListMode === 'best' ? sortedBest : sortedMostImproved)
          ).map((b, i) => {
            const score = b.metrics.comfort.green;
            const trend = b.trends.comfort;
            const showTrend = leftListMode === 'improved';
            const barColor = getStatusColor(score, 80, 60);
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
                  <Box sx={{ width: '100%', height: 4, bgcolor: '#f0f0f0', borderRadius: 2 }}>
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
        </Paper>

        {/* Worst performing / Most deteriorated */}
        <Paper elevation={0} sx={{ p: 2.5, border: 'none', borderRadius: '12px', bgcolor: '#ffffff', boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: '#ef5350' }} />
              <Typography variant="subtitle2" fontWeight={600}>{buildingMode === 'clusters' ? 'Worst Clusters' : 'Worst Buildings'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: colors.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', border: `1px solid ${colors.borderTertiary}` }}>
              <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: rightListMode === 'worst' ? 'white' : 'transparent', color: rightListMode === 'worst' ? 'text.primary' : 'text.secondary', boxShadow: rightListMode === 'worst' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }} onClick={() => setRightListMode('worst')}>Worst</Box>
              <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: rightListMode === 'deteriorated' ? 'white' : 'transparent', color: rightListMode === 'deteriorated' ? 'text.primary' : 'text.secondary', boxShadow: rightListMode === 'deteriorated' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }} onClick={() => setRightListMode('deteriorated')}>Dropping</Box>
            </Box>
          </Box>
          {(buildingMode === 'clusters'
            ? (rightListMode === 'worst' ? clusterSortedWorst : clusterSortedMostDeteriorated)
            : (rightListMode === 'worst' ? sortedWorst : sortedMostDeteriorated)
          ).map((b, i) => {
            const score = b.metrics.comfort.green;
            const trend = b.trends.comfort;
            const showTrend = rightListMode === 'deteriorated';
            const barColor = getStatusColor(score, 80, 60);
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
                  <Box sx={{ width: '100%', height: 4, bgcolor: '#f0f0f0', borderRadius: 2 }}>
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
        </Paper>

        {/* KPI Score over time */}
        <Paper elevation={0} sx={{ p: 2.5, border: 'none', borderRadius: '12px', bgcolor: '#ffffff', boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.08)', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShowChartOutlinedIcon sx={{ fontSize: 18, color: colors.brand }} />
              <Typography variant="subtitle2" fontWeight={600}>KPI Score Over Time</Typography>
            </Box>
            {/* View selector */}
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
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
                      bgcolor: isActive ? `${colors.brand}14` : 'transparent',
                      transition: 'all 0.15s ease',
                      '&:hover': { bgcolor: isActive ? `${colors.brand}20` : 'action.hover' },
                    }}
                  >
                    <Box sx={{
                      display: 'flex',
                      color: isActive ? colors.brand : 'text.disabled',
                      transition: 'color 0.15s ease',
                    }}>
                      {item.icon}
                    </Box>
                    <Typography variant="body2" sx={{
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? colors.brand : 'text.secondary',
                      transition: 'all 0.15s ease',
                    }}>
                      {item.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
          {(() => {
            const currentData = chartSeries.length === 1 ? chartSeries[0].data : chartSeries[0].data;
            const goodAbove = showThresholds ? (activeThresholdZones.find(z => z.label === 'Good')?.min ?? 80) : 80;
            const modAbove = showThresholds ? (activeThresholdZones.find(z => z.label === 'Moderate')?.min ?? 60) : 60;
            const gradientId = `threshold-gradient-comfort-area`;
            const lineGradientId = `threshold-gradient-comfort-line`;
            return (
              <Box sx={{ flex: 1, minHeight: 370 }}>
                <LineChart
                  xAxis={[{ data: MONTHS, scaleType: 'point', tickLabelStyle: { fontSize: 10, fill: '#888', fontWeight: 500 } }]}
                  yAxis={[{ min: yRange.min, max: yRange.max, tickLabelStyle: { fontSize: 10, fill: '#888', fontWeight: 500 }, valueFormatter: (v: number | null) => `${v}%` }]}
                  series={chartSeries.map(s => ({ data: s.data, label: s.label, color: colors.brand, curve: 'catmullRom' as const, showMark: false, area: showThresholds }))}
                  height={370}
                  margin={{ top: 48, right: 50, bottom: 28, left: 50 }}
                  grid={{ horizontal: true }}
                  hideLegend
                  slotProps={{ tooltip: { trigger: 'none' } }}
                  axisHighlight={{ x: 'none', y: 'none' }}
                  sx={{
                    '& .MuiLineElement-root': { stroke: showThresholds ? `url(#${lineGradientId})` : colors.brand, strokeWidth: 1.5, strokeLinecap: 'round', strokeDasharray: 'none !important' },
                    [`& .${lineClasses.area}`]: { fill: showThresholds ? `url(#${gradientId})` : undefined, filter: 'none', opacity: 0.15 },
                    '& .MuiChartsGrid-line': { stroke: '#e8e8e8', strokeWidth: 1 },
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
        </Paper>
      </Box>

      {/* ═══ SECTION 3: Comfort Dashboards ═══ */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontFamily: 'var(--font-jost), "Jost", sans-serif', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', mb: 1.5 }}>
          Comfort Dashboards
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1.5 }}>
          {COMFORT_DASHBOARDS.map(dash => (
            <Paper
              key={dash.id}
              elevation={0}
              onClick={() => onNavigateToDashboard?.(dash.id)}
              sx={{
                py: 1.5,
                px: 2,
                border: 'none',
                borderRadius: '12px',
                bgcolor: '#ffffff',
                boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.08)',
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
    </Box>
  );
}
