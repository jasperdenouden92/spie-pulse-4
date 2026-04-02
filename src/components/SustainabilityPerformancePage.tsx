'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import SolarPowerOutlinedIcon from '@mui/icons-material/SolarPowerOutlined';
import FilterDramaOutlinedIcon from '@mui/icons-material/FilterDramaOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import NatureOutlinedIcon from '@mui/icons-material/NatureOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Avatar from '@mui/material/Avatar';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import SsidChartOutlinedIcon from '@mui/icons-material/SsidChartOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import { LineChart, lineClasses } from '@mui/x-charts/LineChart';
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine';
import { useDrawingArea, useYScale } from '@mui/x-charts/hooks';
import Tooltip from '@mui/material/Tooltip';
import { useThemeMode } from '@/theme-mode-context';
import { HorizontalThresholdGradient, InteractiveThresholdLine, ChartHoverOverlay } from '@/components/KpiChartComponents';
import Button from '@mui/material/Button';
import { buildings, Building } from '@/data/buildings';
import StackedImages from '@/components/StackedImages';
import { buildingOperationalStats } from '@/data/buildingOperationalStats';

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
  { key: 'consumption', label: 'Consumption', icon: <BoltOutlinedIcon sx={{ fontSize: 20 }} />, offset: 5, trend: 4, chartColor: '#f57c00', goodAbove: 75, moderateAbove: 55 },
  { key: 'generation', label: 'Generation', icon: <SolarPowerOutlinedIcon sx={{ fontSize: 20 }} />, offset: -8, trend: 6, chartColor: '#66bb6a', goodAbove: 70, moderateAbove: 50 },
  { key: 'emissions', label: 'Emissions', icon: <FilterDramaOutlinedIcon sx={{ fontSize: 20 }} />, offset: -3, trend: -2, chartColor: '#9c27b0', goodAbove: 80, moderateAbove: 60 },
  { key: 'cost', label: 'Cost', icon: <PaidOutlinedIcon sx={{ fontSize: 20 }} />, offset: 6, trend: 3, chartColor: '#0288d1', goodAbove: 75, moderateAbove: 55 },
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
  .sort((a, b) => b.metrics.sustainability.green - a.metrics.sustainability.green)
  .slice(0, 7);

const sortedMostImproved = [...buildings]
  .sort((a, b) => b.trends.sustainability - a.trends.sustainability)
  .slice(0, 7);

const sortedWorst = [...buildings]
  .sort((a, b) => a.metrics.sustainability.green - b.metrics.sustainability.green)
  .slice(0, 7);

const sortedMostDeteriorated = [...buildings]
  .sort((a, b) => a.trends.sustainability - b.trends.sustainability)
  .slice(0, 7);

// ── Cluster aggregation for sustainability ──

interface ClusterEntry {
  name: string;
  image: string;
  images: string[];
  metrics: { sustainability: { green: number; yellow: number; red: number } };
  trends: { sustainability: number };
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
        sustainability: {
          green: avg(b => b.metrics.sustainability.green),
          yellow: avg(b => b.metrics.sustainability.yellow),
          red: avg(b => b.metrics.sustainability.red),
        },
      },
      trends: {
        sustainability: Math.round(blds.reduce((s, b) => s + b.trends.sustainability, 0) / blds.length * 10) / 10,
      },
    };
  });
})();

const clusterSortedBest = [...clusterEntries].sort((a, b) => b.metrics.sustainability.green - a.metrics.sustainability.green);
const clusterSortedWorst = [...clusterEntries].sort((a, b) => a.metrics.sustainability.green - b.metrics.sustainability.green);
const clusterSortedMostImproved = [...clusterEntries].sort((a, b) => b.trends.sustainability - a.trends.sustainability);
const clusterSortedMostDeteriorated = [...clusterEntries].sort((a, b) => a.trends.sustainability - b.trends.sustainability);

// ── KPI over time data ──

type ViewMode = 'theme' | 'all_topics' | 'consumption' | 'generation' | 'emissions' | 'cost';

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

// ── WEii chart data ──

const WEII_LABELS = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'A+'] as const;

const WEII_LABEL_COLORS: Record<string, string> = {
  'G': '#d0021b',
  'F': '#e8601c',
  'E': '#f5a623',
  'D': '#ffd500',
  'C': '#d4e34a',
  'B': '#8cc63f',
  'A': '#00843d',
  'A+': '#00602b',
};

// Expected consumption for the ideal curve (kWh/m2)
const WEII_EXPECTED: Record<string, number> = {
  'G': 180, 'F': 145, 'E': 115, 'D': 85, 'C': 60, 'B': 38, 'A': 18, 'A+': 5,
};

// Generate deterministic mock consumption for each building
function generateWeiiData() {
  const rng = seededRandom(42);
  return buildings.map(b => {
    const stats = buildingOperationalStats[b.name];
    const rating = stats?.sustainability.weiiRating || 'C';
    const baseRating = rating.replace('+', '') as string;
    const expected = WEII_EXPECTED[baseRating] ?? WEII_EXPECTED[rating] ?? 80;
    // Actual consumption deviates from expected: some buildings over-perform, some under-perform
    const offset = (rng() - 0.45) * 50;
    const consumption = Math.round(Math.max(-10, expected + offset));
    return { name: b.name, rating, consumption, image: b.image };
  });
}

const weiiChartData = generateWeiiData();

// ── WEii cluster aggregation ──

function generateWeiiClusterData() {
  const groups = new Map<string, typeof weiiChartData>();
  for (const entry of weiiChartData) {
    const building = buildings.find(b => b.name === entry.name);
    if (!building) continue;
    const arr = groups.get(building.group) || [];
    arr.push(entry);
    groups.set(building.group, arr);
  }
  return Array.from(groups.entries()).map(([name, entries]) => {
    const avgConsumption = Math.round(entries.reduce((s, e) => s + e.consumption, 0) / entries.length);
    const ratings = entries.map(e => e.rating);
    const ratingCounts = new Map<string, number>();
    for (const r of ratings) ratingCounts.set(r, (ratingCounts.get(r) || 0) + 1);
    const rating = [...ratingCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    return { name, rating, consumption: avgConsumption, image: entries[0].image };
  });
}

const weiiClusterData = generateWeiiClusterData();

function getConsumptionColor(value: number): string {
  if (value <= 20) return '#00843d';
  if (value <= 45) return '#4caf50';
  if (value <= 70) return '#8cc63f';
  if (value <= 100) return '#ffc107';
  if (value <= 140) return '#f5a623';
  return '#f44336';
}

// ── Sustainability dashboard links ──

interface DashboardLink {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
}

const SUSTAINABILITY_DASHBOARDS: DashboardLink[] = [
  { id: 'gebouwtrend', label: 'Building Trend', subtitle: 'Asset trend and energy distribution', icon: <TimelineOutlinedIcon /> },
  { id: 'energieverbruik_per_gebouw', label: 'Energy Use per Building', subtitle: 'Consumption breakdown by building', icon: <BarChartOutlinedIcon /> },
  { id: 'totaalverbruik_opwekking', label: 'Consumption & Generation', subtitle: 'Electricity and gas totals', icon: <BoltOutlinedIcon /> },
  { id: 'kosten_co2', label: 'Costs & CO\u2082', subtitle: 'Energy spend and carbon emissions', icon: <PaidOutlinedIcon /> },
  { id: 'week_dagprofielen', label: 'Week & Day Profiles', subtitle: 'Power usage patterns', icon: <SsidChartOutlinedIcon /> },
  { id: 'prognose_doelstelling', label: 'Forecast & Target', subtitle: 'Projected vs target performance', icon: <ShowChartOutlinedIcon /> },
];

// ── WEii data types ──

interface WeiiDataPoint {
  name: string;
  rating: string;
  consumption: number;
  image?: string;
}

function getExpectationIcon(rating: string, consumption: number): { icon: '↑' | '↓' | '~'; tooltip: string; color: string } {
  const baseRating = rating.replace(/\+/g, '');
  const expected = WEII_EXPECTED[baseRating] ?? WEII_EXPECTED[rating] ?? 80;
  const diff = consumption - expected;
  if (diff < -15) return { icon: '↑', tooltip: 'Above expectation', color: '#4caf50' };
  if (diff > 15) return { icon: '↓', tooltip: 'Below expectation', color: '#f44336' };
  return { icon: '~', tooltip: 'As expected', color: '#bbb' };
}

// ── WEii Sidebar ──

type SidebarGroupMode = 'rating' | 'performance';

const EXPECTATION_GROUPS = [
  { key: 'above', label: 'Above Expectation', icon: '↑', color: '#4caf50' },
  { key: 'expected', label: 'As Expected', icon: '~', color: '#9e9e9e' },
  { key: 'below', label: 'Below Expectation', icon: '↓', color: '#f44336' },
] as const;

function getExpectationKey(rating: string, consumption: number): 'above' | 'expected' | 'below' {
  const baseRating = rating.replace(/\+/g, '');
  const expected = WEII_EXPECTED[baseRating] ?? WEII_EXPECTED[rating] ?? 80;
  const diff = consumption - expected;
  if (diff < -15) return 'above';
  if (diff > 15) return 'below';
  return 'expected';
}

function WeiiSidebar({ data, onBuildingClick, hoveredName, onHover, groupMode, onGroupModeChange }: { data: WeiiDataPoint[]; onBuildingClick?: (building: Building) => void; hoveredName: string | null; onHover: (name: string | null) => void; groupMode: SidebarGroupMode; onGroupModeChange: (mode: SidebarGroupMode) => void }) {
  const { themeColors: c } = useThemeMode();
  // Group by rating
  const groupedByRating = useMemo(() => {
    const groups: Record<string, WeiiDataPoint[]> = {};
    for (const label of WEII_LABELS) {
      const items = data.filter(d => d.rating === label);
      if (items.length > 0) {
        groups[label] = items.sort((a, b) => a.consumption - b.consumption);
      }
    }
    return groups;
  }, [data]);

  // Group by performance expectation
  const groupedByPerformance = useMemo(() => {
    const groups: Record<string, WeiiDataPoint[]> = { above: [], expected: [], below: [] };
    for (const point of data) {
      const key = getExpectationKey(point.rating, point.consumption);
      groups[key].push(point);
    }
    // Sort: above by lowest consumption first, below by highest consumption first
    groups.above.sort((a, b) => a.consumption - b.consumption);
    groups.expected.sort((a, b) => a.consumption - b.consumption);
    groups.below.sort((a, b) => b.consumption - a.consumption);
    return groups;
  }, [data]);

  const renderBuildingRow = (point: WeiiDataPoint) => {
    const expectation = getExpectationIcon(point.rating, point.consumption);
    const isHovered = hoveredName === point.name;
    return (
      <Box
        key={point.name}
        onClick={() => {
          const building = buildings.find(b => b.name === point.name);
          if (building && onBuildingClick) onBuildingClick(building);
        }}
        onMouseEnter={() => onHover(point.name)}
        onMouseLeave={() => onHover(null)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1, py: 0.75, px: 2, mx: -2,
          borderRadius: 0.5, cursor: 'pointer', transition: 'background-color 0.15s',
          bgcolor: isHovered ? 'action.hover' : 'transparent',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0, fontWeight: 500, fontSize: '0.8rem' }}>
          {point.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary' }}>
            {point.consumption} kWh
          </Typography>
          <Tooltip title={expectation.tooltip} arrow placement="left">
            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: expectation.color, width: 16, textAlign: 'center', lineHeight: 1, cursor: 'default' }}>
              {expectation.icon}
            </Typography>
          </Tooltip>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Segmented control header */}
      <Box sx={{ px: 2, py: 1.25, flexShrink: 0, bgcolor: c.bgPrimaryHover, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ fontFamily: 'var(--font-jost), "Jost", sans-serif', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', flexShrink: 0 }}>
          Buildings
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: c.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', border: `1px solid ${c.borderTertiary}` }}>
          <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: groupMode === 'rating' ? c.bgPrimary : 'transparent', color: groupMode === 'rating' ? 'text.primary' : 'text.secondary', boxShadow: groupMode === 'rating' ? c.shadow : 'none', whiteSpace: 'nowrap' }} onClick={() => onGroupModeChange('rating')}>By Label</Box>
          <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: groupMode === 'performance' ? c.bgPrimary : 'transparent', color: groupMode === 'performance' ? 'text.primary' : 'text.secondary', boxShadow: groupMode === 'performance' ? c.shadow : 'none', whiteSpace: 'nowrap' }} onClick={() => onGroupModeChange('performance')}>By Performance</Box>
        </Box>
      </Box>
      {/* Scrollable list */}
      <Box sx={{ overflowY: 'auto', flex: 1, px: 2, pt: 1, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#ddd', borderRadius: 2 } }}>
        {groupMode === 'rating' ? (
          // Grouped by WEii rating
          Object.entries(groupedByRating).map(([rating, points]) => (
            <Box key={rating} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', position: 'relative', height: 18, minWidth: 28 }}>
                  <svg width="32" height="18" viewBox="0 0 32 18" fill="none">
                    <rect width="22" height="18" rx="2.5" fill={WEII_LABEL_COLORS[rating]} />
                    <polygon points="22,0 32,9 22,18" fill={WEII_LABEL_COLORS[rating]} />
                  </svg>
                  <Typography sx={{ position: 'absolute', left: 0, width: 22, textAlign: 'center', fontWeight: 700, fontSize: '0.7rem', lineHeight: 1, color: c.bgPrimary }}>
                    {rating}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                  {points.length} {points.length === 1 ? 'building' : 'buildings'}
                </Typography>
              </Box>
              {points.map(renderBuildingRow)}
            </Box>
          ))
        ) : (
          // Grouped by performance expectation
          EXPECTATION_GROUPS.map(group => {
            const points = groupedByPerformance[group.key];
            if (points.length === 0) return null;
            return (
              <Box key={group.key} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: group.color, width: 16, textAlign: 'center', lineHeight: 1 }}>
                    {group.icon}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                    {group.label}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.disabled', fontSize: '0.7rem' }}>
                    ({points.length})
                  </Typography>
                </Box>
                {points.map(renderBuildingRow)}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}

// ── WEii Scatter Chart ──

function WeiiScatterChart({ data, onBuildingClick, hoveredName, onHover }: { data: WeiiDataPoint[]; onBuildingClick?: (building: Building) => void; hoveredName: string | null; onHover: (name: string | null) => void }) {
  const { themeColors: c } = useThemeMode();
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(700);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(Math.round(entry.contentRect.width));
      }
    });
    ro.observe(el);
    setContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const chartWidth = containerWidth;
  const chartHeight = 464;
  const margin = { top: 16, right: 16, bottom: 64, left: 48 };
  const plotW = chartWidth - margin.left - margin.right;
  const plotH = chartHeight - margin.top - margin.bottom;

  // X-axis: energy consumption (kWh/m2) — dynamic range based on data
  const dataMax = useMemo(() => Math.max(...data.map(d => d.consumption), ...Object.values(WEII_EXPECTED)), [data]);
  const xMin = Math.min(-10, Math.min(...data.map(d => d.consumption)) - 10);
  const xMax = Math.ceil((dataMax + 20) / 25) * 25; // round up to nearest 25
  const xRange = xMax - xMin;

  const xForValue = (val: number): number => {
    return margin.left + ((val - xMin) / xRange) * plotW;
  };

  // Y-axis: WEii labels (G at top = high consumption, A+ at bottom = efficient)
  const yForRating = (rating: string): number => {
    const baseRating = rating.replace(/\+/g, '');
    let idx = WEII_LABELS.indexOf(baseRating as typeof WEII_LABELS[number]);
    if (idx < 0) idx = WEII_LABELS.indexOf(rating as typeof WEII_LABELS[number]);
    if (rating === 'A+') idx = 7;
    if (idx < 0) return margin.top + plotH / 2;
    return margin.top + (idx / (WEII_LABELS.length - 1)) * plotH;
  };

  // X-axis grid ticks — dynamic
  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = 25;
    for (let t = 0; t <= xMax; t += step) ticks.push(t);
    return ticks;
  }, [xMax]);

  // Ideal curve points (now x=consumption, y=rating)
  const idealCurvePoints = WEII_LABELS.map(label => ({
    x: xForValue(WEII_EXPECTED[label]),
    y: yForRating(label),
  }));

  const buildSmoothPath = (points: { x: number; y: number }[]): string => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];
      const t = 0.3;
      d += ` C ${p1.x + (p2.x - p0.x) * t},${p1.y + (p2.y - p0.y) * t} ${p2.x - (p3.x - p1.x) * t},${p2.y - (p3.y - p1.y) * t} ${p2.x},${p2.y}`;
    }
    return d;
  };

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        width={chartWidth}
        height={chartHeight}
        style={{ display: 'block' }}
      >
        {/* Background gradient: red at top (G) to green at bottom (A+) */}
        <defs>
          <linearGradient id="weii-bg-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f44336" stopOpacity={0.04} />
            <stop offset="50%" stopColor="#ffc107" stopOpacity={0.03} />
            <stop offset="100%" stopColor="#4caf50" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <rect
          x={margin.left}
          y={margin.top}
          width={plotW}
          height={plotH}
          fill="url(#weii-bg-gradient)"
        />

        {/* Horizontal grid lines per WEii label */}
        {WEII_LABELS.map(label => (
          <line
            key={label}
            x1={margin.left}
            y1={yForRating(label)}
            x2={chartWidth - margin.right}
            y2={yForRating(label)}
            stroke="#e8e8e8"
            strokeWidth={1}
          />
        ))}

        {/* Vertical grid lines for consumption ticks */}
        {xTicks.map(tick => (
          <g key={tick}>
            <line
              x1={xForValue(tick)}
              y1={margin.top}
              x2={xForValue(tick)}
              y2={margin.top + plotH}
              stroke="#e8e8e8"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
            <text
              x={xForValue(tick)}
              y={chartHeight - margin.bottom + 16}
              textAnchor="middle"
              fill="#888"
              fontSize={10}
              fontWeight={500}
            >
              {tick}
            </text>
          </g>
        ))}

        {/* X-axis label */}
        <text
          x={margin.left + plotW / 2}
          y={chartHeight - 12}
          textAnchor="middle"
          fill="#888"
          fontSize={11}
          fontWeight={500}
        >
          Totale WEii Energiegebruik (kWh/m²)
        </text>

        {/* Ideal curve - very subtle */}
        <path
          d={buildSmoothPath(idealCurvePoints)}
          fill="none"
          stroke="#4caf50"
          strokeWidth={1.5}
          strokeDasharray="6 4"
          opacity={0.25}
        />

        {/* Data points — exact Y on rating line, X varies by consumption */}
        {data.map((point) => {
          const cx = xForValue(point.consumption);
          const cy = yForRating(point.rating);
          const dotColor = getConsumptionColor(point.consumption);
          const isHovered = hoveredName === point.name;

          return (
            <g key={point.name}>
              {/* Highlight ring when hovered from sidebar */}
              {isHovered && (
                <circle cx={cx} cy={cy} r={12} fill="none" stroke={dotColor} strokeWidth={2} opacity={0.4} />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 7 : 5}
                fill={dotColor}
                stroke="white"
                strokeWidth={1.5}
                opacity={hoveredName && !isHovered ? 0.25 : 0.85}
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={(e) => {
                  onHover(point.name);
                  const svg = e.currentTarget.closest('svg');
                  if (svg) {
                    const rect = svg.getBoundingClientRect();
                    setTooltipPos({
                      x: rect.left + cx * (rect.width / chartWidth),
                      y: rect.top + cy * (rect.height / chartHeight),
                    });
                  }
                }}
                onMouseLeave={() => onHover(null)}
                onClick={() => {
                  const building = buildings.find(b => b.name === point.name);
                  if (building && onBuildingClick) onBuildingClick(building);
                }}
              />
              {/* Label when hovered */}
              {isHovered && (
                <text x={cx} y={cy - 14} textAnchor="middle" fill="#333" fontSize={10} fontWeight={600}>
                  {point.name}
                </text>
              )}
            </g>
          );
        })}

        {/* Y-axis energy labels */}
        {WEII_LABELS.map((label) => {
          const y = yForRating(label);
          const x = margin.left - 4;
          const color = WEII_LABEL_COLORS[label];
          const labelW = 26;
          const labelH = 16;
          return (
            <g key={label}>
              <rect
                x={x - labelW - 8}
                y={y - labelH / 2}
                width={labelW}
                height={labelH}
                rx={2.5}
                fill={color}
              />
              {/* Arrow point facing right */}
              <polygon
                points={`${x - 8},${y - labelH / 2} ${x - 1},${y} ${x - 8},${y + labelH / 2}`}
                fill={color}
              />
              <text
                x={x - labelW / 2 - 8}
                y={y + 4}
                textAnchor="middle"
                fill="white"
                fontSize={9}
                fontWeight={700}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip - only show when hovering from chart directly */}
      {hoveredName && tooltipPos.x > 0 && (() => {
        const hp = data.find(d => d.name === hoveredName);
        return hp ? (
          <Box
            sx={{
              position: 'fixed',
              left: tooltipPos.x,
              top: tooltipPos.y - 44,
              transform: 'translateX(-50%)',
              bgcolor: 'rgba(33,33,33,0.92)',
              color: c.bgPrimary,
              px: 1.5,
              py: 0.75,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 500,
              pointerEvents: 'none',
              zIndex: 1300,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            {hp.name} — {hp.consumption} kWh/m²
          </Box>
        ) : null;
      })()}
    </Box>
  );
}

// ── Component ──

interface SustainabilityPerformancePageProps {
  themeScore?: number;
  themeTrend?: number;
  onNavigateToDashboard?: (dashboardId: string) => void;
  onBuildingSelect?: (building: Building) => void;
  onViewAllBuildings?: (sort: 'Best to Worst' | 'Worst to Best') => void;
  buildingMode?: 'buildings' | 'clusters';
}

export default function SustainabilityPerformancePage({ themeScore = 72, themeTrend = 4, onNavigateToDashboard, onBuildingSelect, onViewAllBuildings, buildingMode = 'buildings' }: SustainabilityPerformancePageProps) {
  const { themeColors: c } = useThemeMode();
  const [chartView, setChartView] = useState<ViewMode>('theme');
  const [leftListMode, setLeftListMode] = useState<'best' | 'improved'>('best');
  const [rightListMode, setRightListMode] = useState<'worst' | 'deteriorated'>('worst');
  const [hoveredWeiiBuilding, setHoveredWeiiBuilding] = useState<string | null>(null);
  const [weiiSidebarGroupMode, setWeiiSidebarGroupMode] = useState<SidebarGroupMode>('rating');

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

  const topics = useMemo(() => buildTopics(themeScore), [themeScore]);

  const themeSeries = useMemo(() => ({
    label: 'Sustainability KPI',
    color: '#2e7d32',
    data: generateKpiTimeSeries('sustainability_theme', themeScore),
  }), [themeScore]);

  const topicSeries = useMemo(() => topics.map(t => ({
    label: t.label,
    color: t.chartColor,
    data: generateKpiTimeSeries(t.key, t.score, t.key === 'generation' ? 3 : 1),
    goodAbove: t.goodAbove,
    moderateAbove: t.moderateAbove,
  })), [topics]);

  const chartSeries = useMemo(() => {
    switch (chartView) {
      case 'theme':
        return [themeSeries];
      case 'all_topics':
        return [themeSeries, ...topicSeries];
      case 'consumption':
        return [topicSeries[0]];
      case 'generation':
        return [topicSeries[1]];
      case 'emissions':
        return [topicSeries[2]];
      case 'cost':
        return [topicSeries[3]];
    }
  }, [chartView, themeSeries, topicSeries]);

  const showThresholds = chartView !== 'all_topics';

  const activeThresholdZones = useMemo(() => {
    if (!showThresholds) return [];
    switch (chartView) {
      case 'theme':
        return buildThresholdZones(THEME_GOOD_ABOVE, THEME_MODERATE_ABOVE);
      case 'consumption':
        return buildThresholdZones(topics[0].goodAbove, topics[0].moderateAbove);
      case 'generation':
        return buildThresholdZones(topics[1].goodAbove, topics[1].moderateAbove);
      case 'emissions':
        return buildThresholdZones(topics[2].goodAbove, topics[2].moderateAbove);
      case 'cost':
        return buildThresholdZones(topics[3].goodAbove, topics[3].moderateAbove);
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
    { key: 'theme', label: 'Sustainability KPI', icon: <NatureOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'consumption', label: 'Consumption', icon: <BoltOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'generation', label: 'Generation', icon: <SolarPowerOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'emissions', label: 'Emissions', icon: <FilterDramaOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'cost', label: 'Cost', icon: <PaidOutlinedIcon sx={{ fontSize: 16 }} /> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ═══ SECTION 1: Topic KPI Cards ═══ */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <NatureOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="subtitle2" sx={{ fontFamily: 'var(--font-jost), "Jost", sans-serif', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
            Sustainability Performance
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

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
          {topics.map(topic => (
            <Paper
              key={topic.key}
              elevation={0}
              sx={{
                p: 2.5,
                border: `1px solid ${c.cardBorder}`,
                borderRadius: '12px',
                bgcolor: c.bgPrimary,
                boxShadow: c.shadow,
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
                    <Chip
                      label={getStatusLabel(topic.score, topic.goodAbove, topic.moderateAbove)}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        bgcolor: `${getStatusColor(topic.score, topic.goodAbove, topic.moderateAbove)}18`,
                        color: getStatusColor(topic.score, topic.goodAbove, topic.moderateAbove),
                        '& .MuiChip-label': { px: 0.75 },
                      }}
                    />
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
        <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${c.cardBorder}`, borderRadius: '12px', bgcolor: c.bgPrimary, boxShadow: c.shadow }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEventsOutlinedIcon sx={{ fontSize: 18, color: '#66bb6a' }} />
              <Typography variant="subtitle2" fontWeight={600}>{buildingMode === 'clusters' ? 'Top Clusters' : 'Top Buildings'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: c.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', border: `1px solid ${c.borderTertiary}` }}>
              <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: leftListMode === 'best' ? c.bgPrimary : 'transparent', color: leftListMode === 'best' ? 'text.primary' : 'text.secondary', boxShadow: leftListMode === 'best' ? c.shadow : 'none' }} onClick={() => setLeftListMode('best')}>Top</Box>
              <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: leftListMode === 'improved' ? c.bgPrimary : 'transparent', color: leftListMode === 'improved' ? 'text.primary' : 'text.secondary', boxShadow: leftListMode === 'improved' ? c.shadow : 'none' }} onClick={() => setLeftListMode('improved')}>Improved</Box>
            </Box>
          </Box>
          {(buildingMode === 'clusters'
            ? (leftListMode === 'best' ? clusterSortedBest : clusterSortedMostImproved)
            : (leftListMode === 'best' ? sortedBest : sortedMostImproved)
          ).map((b, i) => {
            const score = b.metrics.sustainability.green;
            const trend = b.trends.sustainability;
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
        </Paper>

        {/* Worst performing / Most deteriorated */}
        <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${c.cardBorder}`, borderRadius: '12px', bgcolor: c.bgPrimary, boxShadow: c.shadow }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: '#ef5350' }} />
              <Typography variant="subtitle2" fontWeight={600}>{buildingMode === 'clusters' ? 'Worst Clusters' : 'Worst Buildings'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: c.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', border: `1px solid ${c.borderTertiary}` }}>
              <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: rightListMode === 'worst' ? c.bgPrimary : 'transparent', color: rightListMode === 'worst' ? 'text.primary' : 'text.secondary', boxShadow: rightListMode === 'worst' ? c.shadow : 'none' }} onClick={() => setRightListMode('worst')}>Worst</Box>
              <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: rightListMode === 'deteriorated' ? c.bgPrimary : 'transparent', color: rightListMode === 'deteriorated' ? 'text.primary' : 'text.secondary', boxShadow: rightListMode === 'deteriorated' ? c.shadow : 'none' }} onClick={() => setRightListMode('deteriorated')}>Dropping</Box>
            </Box>
          </Box>
          {(buildingMode === 'clusters'
            ? (rightListMode === 'worst' ? clusterSortedWorst : clusterSortedMostDeteriorated)
            : (rightListMode === 'worst' ? sortedWorst : sortedMostDeteriorated)
          ).map((b, i) => {
            const score = b.metrics.sustainability.green;
            const trend = b.trends.sustainability;
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
        </Paper>

        {/* KPI Score over time */}
        <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${c.cardBorder}`, borderRadius: '12px', bgcolor: c.bgPrimary, boxShadow: c.shadow, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShowChartOutlinedIcon sx={{ fontSize: 18, color: c.brand }} />
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
          </Box>

          {(() => {
            const currentData = chartSeries.length === 1 ? chartSeries[0].data : chartSeries[0].data;
            const goodAbove = showThresholds ? (activeThresholdZones.find(z => z.label === 'Good')?.min ?? 75) : 75;
            const modAbove = showThresholds ? (activeThresholdZones.find(z => z.label === 'Moderate')?.min ?? 55) : 55;
            const gradientId = `threshold-gradient-sust-area`;
            const lineGradientId = `threshold-gradient-sust-line`;
            return (
              <Box sx={{ flex: 1, minHeight: 370 }}>
                <LineChart
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
        </Paper>
      </Box>

      {/* ═══ SECTION 3: Sustainability Dashboards ═══ */}
      {/* ═══ Sustainability Key Dashboards ═══ */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontFamily: 'var(--font-jost), "Jost", sans-serif', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', mb: 1.5 }}>
          Sustainability Key Dashboards
        </Typography>
        <Paper elevation={0} sx={{ border: `1px solid ${c.cardBorder}`, borderRadius: '12px', bgcolor: c.bgPrimary, boxShadow: c.shadow, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 360px', height: 528, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SpeedOutlinedIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                  <Typography variant="subtitle2" fontWeight={600}>WEii Energy Performance</Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                  sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                >
                  View details
                </Button>
              </Box>
              <Box sx={{ px: 2.5, pb: 0, flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'flex-start' }}>
                <WeiiScatterChart data={buildingMode === 'clusters' ? weiiClusterData : weiiChartData} onBuildingClick={buildingMode === 'buildings' ? onBuildingSelect : undefined} hoveredName={hoveredWeiiBuilding} onHover={setHoveredWeiiBuilding} />
              </Box>
            </Box>
            <Box sx={{ borderLeft: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <WeiiSidebar data={buildingMode === 'clusters' ? weiiClusterData : weiiChartData} onBuildingClick={buildingMode === 'buildings' ? onBuildingSelect : undefined} hoveredName={hoveredWeiiBuilding} onHover={setHoveredWeiiBuilding} groupMode={weiiSidebarGroupMode} onGroupModeChange={setWeiiSidebarGroupMode} />
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* ═══ Other Sustainability Dashboards ═══ */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontFamily: 'var(--font-jost), "Jost", sans-serif', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', mb: 1.5 }}>
          Other Sustainability Dashboards
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1.5 }}>
          {SUSTAINABILITY_DASHBOARDS.map(dash => (
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
                boxShadow: c.shadow,
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
