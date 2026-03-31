'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import NatureOutlinedIcon from '@mui/icons-material/NatureOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Avatar from '@mui/material/Avatar';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import SsidChartOutlinedIcon from '@mui/icons-material/SsidChartOutlined';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ParkOutlinedIcon from '@mui/icons-material/ParkOutlined';
import HeatPumpOutlinedIcon from '@mui/icons-material/HeatPumpOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import DirectionsRunOutlinedIcon from '@mui/icons-material/DirectionsRunOutlined';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import { LineChart, lineClasses } from '@mui/x-charts/LineChart';
import { colors } from '@/colors';
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

function buildTopics(themeScores: { sustainability: number; comfort: number; asset_monitoring: number; compliance: number }, themesTrends: { sustainability: number; comfort: number; asset_monitoring: number; compliance: number }): TopicDef[] {
  const defs = [
    { key: 'sustainability', label: 'Sustainability', icon: <NatureOutlinedIcon sx={{ fontSize: 20 }} />, score: themeScores.sustainability, trend: themesTrends.sustainability, chartColor: '#4caf50', goodAbove: 75, moderateAbove: 55 },
    { key: 'comfort', label: 'Comfort', icon: <SpaOutlinedIcon sx={{ fontSize: 20 }} />, score: themeScores.comfort, trend: themesTrends.comfort, chartColor: '#2196f3', goodAbove: 75, moderateAbove: 55 },
    { key: 'asset_monitoring', label: 'Asset Monitoring', icon: <SecurityOutlinedIcon sx={{ fontSize: 20 }} />, score: themeScores.asset_monitoring, trend: themesTrends.asset_monitoring, chartColor: '#ff9800', goodAbove: 70, moderateAbove: 50 },
    { key: 'compliance', label: 'Compliance', icon: <GavelOutlinedIcon sx={{ fontSize: 20 }} />, score: themeScores.compliance, trend: themesTrends.compliance, chartColor: '#9c27b0', goodAbove: 80, moderateAbove: 60 },
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

// Compute average theme score for each building
function getAvgThemeScore(b: Building): number {
  return Math.round((b.metrics.sustainability.green + b.metrics.comfort.green + b.metrics.asset_monitoring.green + b.metrics.compliance.green) / 4);
}

function getAvgThemeTrend(b: Building): number {
  return Math.round((b.trends.sustainability + b.trends.comfort + b.trends.asset_monitoring + b.trends.compliance) / 4 * 10) / 10;
}

const sortedBest = [...buildings]
  .sort((a, b) => getAvgThemeScore(b) - getAvgThemeScore(a))
  .slice(0, 7);

const sortedMostImproved = [...buildings]
  .sort((a, b) => getAvgThemeTrend(b) - getAvgThemeTrend(a))
  .slice(0, 7);

const sortedWorst = [...buildings]
  .sort((a, b) => getAvgThemeScore(a) - getAvgThemeScore(b))
  .slice(0, 7);

const sortedMostDeteriorated = [...buildings]
  .sort((a, b) => getAvgThemeTrend(a) - getAvgThemeTrend(b))
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
    score: Math.round(blds.reduce((s, b) => s + getAvgThemeScore(b), 0) / blds.length),
    trend: Math.round(blds.reduce((s, b) => s + getAvgThemeTrend(b), 0) / blds.length * 10) / 10,
  }));
})();

const clusterSortedBest = [...clusterEntries].sort((a, b) => b.score - a.score);
const clusterSortedWorst = [...clusterEntries].sort((a, b) => a.score - b.score);
const clusterSortedMostImproved = [...clusterEntries].sort((a, b) => b.trend - a.trend);
const clusterSortedMostDeteriorated = [...clusterEntries].sort((a, b) => a.trend - b.trend);

// ── KPI over time data ──

type ViewMode = 'theme' | 'all_topics' | 'sustainability' | 'comfort' | 'asset_monitoring' | 'compliance';

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

const THEME_GOOD_ABOVE = 75;
const THEME_MODERATE_ABOVE = 55;

// ── All theme dashboards combined ──

interface DashboardLink {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  theme: string;
}

const ALL_THEME_DASHBOARDS: DashboardLink[] = [
  // Sustainability
  { id: 'gebouwtrend', label: 'Building Trend', subtitle: 'Asset trend and energy distribution', icon: <TimelineOutlinedIcon />, theme: 'Sustainability' },
  { id: 'energieverbruik_per_gebouw', label: 'Energy Use per Building', subtitle: 'Consumption breakdown by building', icon: <BarChartOutlinedIcon />, theme: 'Sustainability' },
  { id: 'totaalverbruik_opwekking', label: 'Consumption & Generation', subtitle: 'Electricity and gas totals', icon: <BoltOutlinedIcon />, theme: 'Sustainability' },
  { id: 'kosten_co2', label: 'Costs & CO\u2082', subtitle: 'Energy spend and carbon emissions', icon: <PaidOutlinedIcon />, theme: 'Sustainability' },
  { id: 'week_dagprofielen', label: 'Week & Day Profiles', subtitle: 'Power usage patterns', icon: <SsidChartOutlinedIcon />, theme: 'Sustainability' },
  { id: 'prognose_doelstelling', label: 'Forecast & Target', subtitle: 'Projected vs target performance', icon: <ShowChartIcon />, theme: 'Sustainability' },
  // Comfort
  { id: 'comfort_gebouwoverzicht', label: 'Comfort Building Overview', subtitle: 'Heatmap, scores per building and zone', icon: <GridViewOutlinedIcon />, theme: 'Comfort' },
  { id: 'comforttrend', label: 'Comfort Trend', subtitle: 'Temperature and air quality trends', icon: <TimelineOutlinedIcon />, theme: 'Comfort' },
  { id: 'adaptieve_temperatuurgrenzen', label: 'Adaptive Temperature Limits', subtitle: 'Upper and lower bounds per season', icon: <TuneOutlinedIcon />, theme: 'Comfort' },
  { id: 'frisse_scholen', label: 'Frisse Scholen', subtitle: 'CO₂, temperature and ventilation', icon: <ParkOutlinedIcon />, theme: 'Comfort' },
  // Asset Monitoring
  { id: 'asset_trend', label: 'Asset Trend', subtitle: 'Asset health and performance over time', icon: <TimelineOutlinedIcon />, theme: 'Asset Monitoring' },
  { id: 'warmte_koudeopslag', label: 'Warmte- Koudeopslag (WKO)', subtitle: 'Thermal energy storage performance', icon: <HeatPumpOutlinedIcon />, theme: 'Asset Monitoring' },
  // Compliance
  { id: 'compliance_dashboard', label: 'Compliance Dashboard', subtitle: 'Regulatory compliance overview and status', icon: <GavelOutlinedIcon />, theme: 'Compliance' },
  { id: 'bacs_overview', label: 'BACS Overview', subtitle: 'Building automation and control systems', icon: <SensorsOutlinedIcon />, theme: 'Compliance' },
];

// ── Component ──

interface ThemesPerformancePageProps {
  themeScores: { sustainability: number; comfort: number; asset_monitoring: number; compliance: number };
  themeTrends: { sustainability: number; comfort: number; asset_monitoring: number; compliance: number };
  overallScore?: number;
  overallTrend?: number;
  onNavigateToDashboard?: (dashboardId: string) => void;
  onBuildingSelect?: (building: Building) => void;
  onViewAllBuildings?: (sort: 'Best to Worst' | 'Worst to Best') => void;
  buildingMode?: 'buildings' | 'clusters';
}

export default function ThemesPerformancePage({ themeScores, themeTrends, overallScore = 75, overallTrend = 3, onNavigateToDashboard, onBuildingSelect, onViewAllBuildings, buildingMode = 'buildings' }: ThemesPerformancePageProps) {
  const [chartView, setChartView] = useState<ViewMode>('sustainability');
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

  const topics = useMemo(() => buildTopics(themeScores, themeTrends), [themeScores, themeTrends]);

  const themeSeries = useMemo(() => ({
    label: 'Theme KPIs',
    color: colors.brand,
    data: [48, 52, 58, 54, 45, 56, 64, 70, 76, 73, 78, overallScore],
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
      case 'theme':
        return [themeSeries];
      case 'all_topics':
        return [themeSeries, ...topicSeries];
      case 'sustainability':
        return [topicSeries[0]];
      case 'comfort':
        return [topicSeries[1]];
      case 'asset_monitoring':
        return [topicSeries[2]];
      case 'compliance':
        return [topicSeries[3]];
    }
  }, [chartView, themeSeries, topicSeries]);

  const showThresholds = chartView !== 'all_topics';

  const activeThresholdZones = useMemo(() => {
    if (!showThresholds) return [];
    switch (chartView) {
      case 'theme':
        return buildThresholdZones(THEME_GOOD_ABOVE, THEME_MODERATE_ABOVE);
      case 'sustainability':
        return buildThresholdZones(topics[0].goodAbove, topics[0].moderateAbove);
      case 'comfort':
        return buildThresholdZones(topics[1].goodAbove, topics[1].moderateAbove);
      case 'asset_monitoring':
        return buildThresholdZones(topics[2].goodAbove, topics[2].moderateAbove);
      case 'compliance':
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
    { key: 'sustainability', label: 'Sustainability', icon: <NatureOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'comfort', label: 'Comfort', icon: <SpaOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'asset_monitoring', label: 'Asset Monitoring', icon: <SecurityOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'compliance', label: 'Compliance', icon: <GavelOutlinedIcon sx={{ fontSize: 16 }} /> },
  ];

  // Group dashboards by theme
  const dashboardsByTheme = useMemo(() => {
    const groups: Record<string, DashboardLink[]> = {};
    for (const d of ALL_THEME_DASHBOARDS) {
      if (!groups[d.theme]) groups[d.theme] = [];
      groups[d.theme].push(d);
    }
    return groups;
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ═══ Theme KPIs Combined Score Over Time (card) ═══ */}
      <Paper elevation={0} sx={{ p: 2.5, border: 'none', borderRadius: '12px', bgcolor: '#ffffff', boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.08)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
            Theme KPI Performance
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {overallScore}%
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: overallTrend >= 0 ? 'success.main' : 'error.main' }}>
              {overallTrend >= 0 ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                {Math.abs(overallTrend)}%
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: 1, minHeight: 340 }}>
          <LineChart
            xAxis={[{ data: MONTHS, scaleType: 'point', tickLabelStyle: { fontSize: 10, fill: '#888', fontWeight: 500 } }]}
            yAxis={[{ min: Math.max(0, Math.floor((Math.min(...themeSeries.data, THEME_MODERATE_ABOVE) - 10) / 10) * 10), max: 100, tickLabelStyle: { fontSize: 10, fill: '#888', fontWeight: 500 }, valueFormatter: (v: number | null) => `${v}%` }]}
            series={[{ data: themeSeries.data, label: 'Theme KPIs', color: colors.brand, curve: 'catmullRom' as const, showMark: false, area: true }]}
            height={370}
            margin={{ top: 48, right: 80, bottom: 28, left: 80 }}
            grid={{ horizontal: true }}
            hideLegend
            slotProps={{ tooltip: { trigger: 'none' } }}
            axisHighlight={{ x: 'none', y: 'none' }}
            sx={{
              '& .MuiLineElement-root': { stroke: 'url(#threshold-gradient-themes-line)', strokeWidth: 1.5, strokeLinecap: 'round', strokeDasharray: 'none !important' },
              [`& .${lineClasses.area}`]: { fill: 'url(#threshold-gradient-themes-combined)', filter: 'none', opacity: 0.15 },
              '& .MuiChartsGrid-line': { stroke: '#e8e8e8', strokeWidth: 1 },
              '& .MuiChartsAxis-line': { stroke: 'transparent' },
              '& .MuiChartsAxis-tick': { stroke: 'transparent' },
            }}
          >
            <HorizontalThresholdGradient data={themeSeries.data} goodAbove={THEME_GOOD_ABOVE} moderateAbove={THEME_MODERATE_ABOVE} id="threshold-gradient-themes-combined" />
            <HorizontalThresholdGradient data={themeSeries.data} goodAbove={THEME_GOOD_ABOVE} moderateAbove={THEME_MODERATE_ABOVE} id="threshold-gradient-themes-line" goodColor="#43a047" moderateColor="#ef6c00" poorColor="#c62828" />
            <InteractiveThresholdLine y={THEME_GOOD_ABOVE} label={`Good: ${THEME_GOOD_ABOVE}–100%`} />
            <InteractiveThresholdLine y={THEME_MODERATE_ABOVE} label={`Moderate: ${THEME_MODERATE_ABOVE}–${THEME_GOOD_ABOVE}%`} />
            <ChartHoverOverlay
              data={themeSeries.data}
              labels={MONTHS}
              getColor={(v) => v >= THEME_GOOD_ABOVE ? '#66bb6a' : v >= THEME_MODERATE_ABOVE ? '#ffa726' : '#ef5350'}
            />
          </LineChart>
        </Box>
      </Paper>

      {/* ═══ SECTION 2: Best/Worst + KPI Over Time ═══ */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 3 }}>
        {/* Best performing / Most improved */}
        <Paper elevation={0} sx={{ p: 2.5, border: 'none', borderRadius: '12px', bgcolor: '#ffffff', boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEventsOutlinedIcon sx={{ fontSize: 18, color: '#66bb6a' }} />
              <Typography variant="body2" fontWeight={600}>{buildingMode === 'clusters' ? 'Top Clusters' : 'Top Buildings'}</Typography>
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
            const score = 'metrics' in b ? getAvgThemeScore(b as Building) : (b as ClusterEntry).score;
            const trend = 'trends' in b ? getAvgThemeTrend(b as Building) : (b as ClusterEntry).trend;
            const showTrend = leftListMode === 'improved';
            const barColor = getStatusColor(score, 75, 55);
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
                  <Box sx={{ width: '100%', height: 4, bgcolor: '#f0f0f0', borderRadius: 2 }}>
                    <Box sx={{ width: `${score}%`, height: '100%', bgcolor: barColor, borderRadius: 2, transition: 'width 0.5s ease' }} />
                  </Box>
                </Box>
              </Box>
            );
          })}
          <Button size="small" onClick={() => onViewAllBuildings?.('Best to Worst')} sx={{ mt: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>View all</Button>
        </Paper>

        {/* Worst performing / Most deteriorated */}
        <Paper elevation={0} sx={{ p: 2.5, border: 'none', borderRadius: '12px', bgcolor: '#ffffff', boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: '#ef5350' }} />
              <Typography variant="body2" fontWeight={600}>{buildingMode === 'clusters' ? 'Worst Clusters' : 'Worst Buildings'}</Typography>
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
            const score = 'metrics' in b ? getAvgThemeScore(b as Building) : (b as ClusterEntry).score;
            const trend = 'trends' in b ? getAvgThemeTrend(b as Building) : (b as ClusterEntry).trend;
            const showTrend = rightListMode === 'deteriorated';
            const barColor = getStatusColor(score, 75, 55);
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
                  <Box sx={{ width: '100%', height: 4, bgcolor: '#f0f0f0', borderRadius: 2 }}>
                    <Box sx={{ width: `${score}%`, height: '100%', bgcolor: barColor, borderRadius: 2, transition: 'width 0.5s ease' }} />
                  </Box>
                </Box>
              </Box>
            );
          })}
          <Button size="small" onClick={() => onViewAllBuildings?.('Worst to Best')} sx={{ mt: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>View all</Button>
        </Paper>

        {/* KPI Score over time */}
        <Paper elevation={0} sx={{ p: 2.5, border: 'none', borderRadius: '12px', bgcolor: '#ffffff', boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.08)', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShowChartOutlinedIcon sx={{ fontSize: 18, color: colors.brand }} />
              <Typography variant="body2" fontWeight={600}>KPI Score Over Time</Typography>
            </Box>
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
                    <Box sx={{ display: 'flex', color: isActive ? colors.brand : 'text.disabled', transition: 'color 0.15s ease' }}>{item.icon}</Box>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: isActive ? 600 : 400, color: isActive ? colors.brand : 'text.secondary', transition: 'all 0.15s ease' }}>{item.label}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {(() => {
            const currentData = chartSeries.length === 1 ? chartSeries[0].data : chartSeries[0].data;
            const goodAbove = showThresholds ? (activeThresholdZones.find(z => z.label === 'Good')?.min ?? 75) : 75;
            const modAbove = showThresholds ? (activeThresholdZones.find(z => z.label === 'Moderate')?.min ?? 55) : 55;
            const gradientId = `threshold-gradient-sub-${chartView}`;
            const lineGradientId = `threshold-gradient-sub-line-${chartView}`;
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

    </Box>
  );
}
