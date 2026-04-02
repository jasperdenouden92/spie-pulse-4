'use client';

import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PerformanceGrid, GridCard, PerformanceIndicatorsCard, BuildingRankingCard, DashboardLinksCard, toRanked } from '@/components/performance';
import type { DashboardLink } from '@/components/performance';
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
import { useThemeMode } from '@/theme-mode-context';
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
  const { themeColors: c } = useThemeMode();
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
    color: c.brand,
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
    <PerformanceGrid>
      {/* ═══ SECTION 1: Theme KPI + Topic KPI Cards ═══ */}
      <PerformanceIndicatorsCard
        icon={<SpaOutlinedIcon sx={{ color: c.brand }} />}
        title="Comfort Performance"
        score={themeScore}
        trend={themeTrend}
        topics={topics}
      />

      {/* ═══ SECTION 2: Best/Worst + KPI Over Time ═══ */}
      {/* ═══ Top/Worst Buildings + KPI Over Time ═══ */}
      {/* ═══ Top Buildings ═══ */}
      <BuildingRankingCard
        variant="top"
        buildingMode={buildingMode}
        primaryItems={toRanked(buildingMode === 'clusters' ? clusterSortedBest : sortedBest, b => ({ score: b.metrics.comfort.green, trend: b.trends.comfort }))}
        secondaryItems={toRanked(buildingMode === 'clusters' ? clusterSortedMostImproved : sortedMostImproved, b => ({ score: b.metrics.comfort.green, trend: b.trends.comfort }))}
        onBuildingSelect={onBuildingSelect}
        onViewAllBuildings={onViewAllBuildings}
      />

      {/* ═══ Worst Buildings ═══ */}
      <BuildingRankingCard
        variant="worst"
        buildingMode={buildingMode}
        primaryItems={toRanked(buildingMode === 'clusters' ? clusterSortedWorst : sortedWorst, b => ({ score: b.metrics.comfort.green, trend: b.trends.comfort }))}
        secondaryItems={toRanked(buildingMode === 'clusters' ? clusterSortedMostDeteriorated : sortedMostDeteriorated, b => ({ score: b.metrics.comfort.green, trend: b.trends.comfort }))}
        onBuildingSelect={onBuildingSelect}
        onViewAllBuildings={onViewAllBuildings}
      />

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
            const goodAbove = showThresholds ? (activeThresholdZones.find(z => z.label === 'Good')?.min ?? 80) : 80;
            const modAbove = showThresholds ? (activeThresholdZones.find(z => z.label === 'Moderate')?.min ?? 60) : 60;
            const gradientId = `threshold-gradient-comfort-area`;
            const lineGradientId = `threshold-gradient-comfort-line`;
            return (
              <Box sx={{ flex: 1, minHeight: 370 }}>
                <LineChart data-annotation-id="comfortperformancepage-grafiek"
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

      {/* ═══ SECTION 3: Comfort Dashboards ═══ */}
      <DashboardLinksCard title="Comfort Dashboards" dashboards={COMFORT_DASHBOARDS} onNavigate={onNavigateToDashboard} />
    </PerformanceGrid>
  );
}
