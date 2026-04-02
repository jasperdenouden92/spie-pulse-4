'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PerformanceGrid, GridCard, PerformanceIndicatorsCard, BuildingRankingCard, DashboardLinksCard, toRanked } from '@/components/performance';
import type { DashboardLink } from '@/components/performance';
import Chip from '@mui/material/Chip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import DirectionsRunOutlinedIcon from '@mui/icons-material/DirectionsRunOutlined';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Avatar from '@mui/material/Avatar';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
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
  { key: 'bacs', label: 'BACS', icon: <SensorsOutlinedIcon sx={{ fontSize: 20 }} />, offset: 5, trend: 3, chartColor: '#2196f3', goodAbove: 80, moderateAbove: 60 },
  { key: 'escape_routes', label: 'Escape Routes', icon: <DirectionsRunOutlinedIcon sx={{ fontSize: 20 }} />, offset: -4, trend: -2, chartColor: '#ff9800', goodAbove: 75, moderateAbove: 55 },
  { key: 'fire_safety', label: 'Fire Safety', icon: <LocalFireDepartmentOutlinedIcon sx={{ fontSize: 20 }} />, offset: 3, trend: 5, chartColor: '#f44336', goodAbove: 80, moderateAbove: 60 },
  { key: 'legionella_prevention', label: 'Legionella Prevention', icon: <VaccinesOutlinedIcon sx={{ fontSize: 20 }} />, offset: -6, trend: -1, chartColor: '#9c27b0', goodAbove: 75, moderateAbove: 55 },
  { key: 'maintenance_inspection', label: 'Maintenance & Inspection', icon: <HandymanOutlinedIcon sx={{ fontSize: 20 }} />, offset: 2, trend: 4, chartColor: '#00bcd4', goodAbove: 75, moderateAbove: 55 },
  { key: 'permits', label: 'Permits', icon: <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />, offset: 7, trend: 2, chartColor: '#4caf50', goodAbove: 80, moderateAbove: 60 },
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
  .sort((a, b) => b.metrics.compliance.green - a.metrics.compliance.green)
  .slice(0, 7);

const sortedMostImproved = [...buildings]
  .sort((a, b) => b.trends.compliance - a.trends.compliance)
  .slice(0, 7);

const sortedWorst = [...buildings]
  .sort((a, b) => a.metrics.compliance.green - b.metrics.compliance.green)
  .slice(0, 7);

const sortedMostDeteriorated = [...buildings]
  .sort((a, b) => a.trends.compliance - b.trends.compliance)
  .slice(0, 7);

// ── Cluster aggregation for asset monitoring ──

interface ClusterEntry {
  name: string;
  image: string;
  images: string[];
  metrics: { compliance: { green: number; yellow: number; red: number } };
  trends: { compliance: number };
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
        compliance: {
          green: avg(b => b.metrics.compliance.green),
          yellow: avg(b => b.metrics.compliance.yellow),
          red: avg(b => b.metrics.compliance.red),
        },
      },
      trends: {
        compliance: Math.round(blds.reduce((s, b) => s + b.trends.compliance, 0) / blds.length * 10) / 10,
      },
    };
  });
})();

const clusterSortedBest = [...clusterEntries].sort((a, b) => b.metrics.compliance.green - a.metrics.compliance.green);
const clusterSortedWorst = [...clusterEntries].sort((a, b) => a.metrics.compliance.green - b.metrics.compliance.green);
const clusterSortedMostImproved = [...clusterEntries].sort((a, b) => b.trends.compliance - a.trends.compliance);
const clusterSortedMostDeteriorated = [...clusterEntries].sort((a, b) => a.trends.compliance - b.trends.compliance);

// ── KPI over time data ──

type ViewMode = 'theme' | 'all_topics' | 'bacs' | 'escape_routes' | 'fire_safety' | 'legionella_prevention' | 'maintenance_inspection' | 'permits';

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

const COMPLIANCE_DASHBOARDS: DashboardLink[] = [
  { id: 'compliance_dashboard', label: 'Compliance Dashboard', subtitle: 'Regulatory compliance overview and status', icon: <GavelOutlinedIcon /> },
  { id: 'bacs_overview', label: 'BACS Overview', subtitle: 'Building automation and control systems', icon: <SensorsOutlinedIcon /> },
];

// ── Component ──

interface CompliancePerformancePageProps {
  themeScore?: number;
  themeTrend?: number;
  onNavigateToDashboard?: (dashboardId: string) => void;
  onBuildingSelect?: (building: Building) => void;
  onViewAllBuildings?: (sort: 'Best to Worst' | 'Worst to Best') => void;
  buildingMode?: 'buildings' | 'clusters';
}

export default function CompliancePerformancePage({ themeScore = 88, themeTrend = 6, onNavigateToDashboard, onBuildingSelect, onViewAllBuildings, buildingMode = 'buildings' }: CompliancePerformancePageProps) {
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
    label: 'Compliance KPI',
    color: c.brand,
    data: generateKpiTimeSeries('compliance_theme', themeScore),
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
      case 'bacs':
        return [topicSeries[0]];
      case 'escape_routes':
        return [topicSeries[1]];
      case 'fire_safety':
        return [topicSeries[2]];
      case 'legionella_prevention':
        return [topicSeries[3]];
      case 'maintenance_inspection':
        return [topicSeries[4]];
      case 'permits':
        return [topicSeries[5]];
    }
  }, [chartView, themeSeries, topicSeries]);

  const showThresholds = chartView !== 'all_topics';

  const activeThresholdZones = useMemo(() => {
    if (!showThresholds) return [];
    switch (chartView) {
      case 'theme':
        return buildThresholdZones(THEME_GOOD_ABOVE, THEME_MODERATE_ABOVE);
      case 'bacs':
        return buildThresholdZones(topics[0].goodAbove, topics[0].moderateAbove);
      case 'escape_routes':
        return buildThresholdZones(topics[1].goodAbove, topics[1].moderateAbove);
      case 'fire_safety':
        return buildThresholdZones(topics[2].goodAbove, topics[2].moderateAbove);
      case 'legionella_prevention':
        return buildThresholdZones(topics[3].goodAbove, topics[3].moderateAbove);
      case 'maintenance_inspection':
        return buildThresholdZones(topics[4].goodAbove, topics[4].moderateAbove);
      case 'permits':
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
    { key: 'theme', label: 'Compliance KPI', icon: <GavelOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'bacs', label: 'BACS', icon: <SensorsOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'escape_routes', label: 'Escape Routes', icon: <DirectionsRunOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'fire_safety', label: 'Fire Safety', icon: <LocalFireDepartmentOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'legionella_prevention', label: 'Legionella Prevention', icon: <VaccinesOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'maintenance_inspection', label: 'Maintenance & Inspection', icon: <HandymanOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'permits', label: 'Permits', icon: <DescriptionOutlinedIcon sx={{ fontSize: 16 }} /> },
  ];

  return (
    <PerformanceGrid>
      {/* ═══ SECTION 1: Topic KPI Cards ═══ */}
      <PerformanceIndicatorsCard
        icon={<GavelOutlinedIcon sx={{ color: c.brand }} />}
        title="Compliance Performance"
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
        primaryItems={toRanked(buildingMode === 'clusters' ? clusterSortedBest : sortedBest, b => ({ score: b.metrics.compliance.green, trend: b.trends.compliance }))}
        secondaryItems={toRanked(buildingMode === 'clusters' ? clusterSortedMostImproved : sortedMostImproved, b => ({ score: b.metrics.compliance.green, trend: b.trends.compliance }))}
        onBuildingSelect={onBuildingSelect}
        onViewAllBuildings={onViewAllBuildings}
      />

      <BuildingRankingCard
        variant="worst"
        buildingMode={buildingMode}
        primaryItems={toRanked(buildingMode === 'clusters' ? clusterSortedWorst : sortedWorst, b => ({ score: b.metrics.compliance.green, trend: b.trends.compliance }))}
        secondaryItems={toRanked(buildingMode === 'clusters' ? clusterSortedMostDeteriorated : sortedMostDeteriorated, b => ({ score: b.metrics.compliance.green, trend: b.trends.compliance }))}
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
            const goodAbove = showThresholds ? (activeThresholdZones.find(z => z.label === 'Good')?.min ?? 75) : 75;
            const modAbove = showThresholds ? (activeThresholdZones.find(z => z.label === 'Moderate')?.min ?? 55) : 55;
            const gradientId = `threshold-gradient-comp-area`;
            const lineGradientId = `threshold-gradient-comp-line`;
            return (
              <Box sx={{ flex: 1, minHeight: 370 }}>
                <LineChart data-annotation-id="complianceperformancepage-grafiek"
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
      <DashboardLinksCard title="Compliance Dashboards" dashboards={COMPLIANCE_DASHBOARDS} onNavigate={onNavigateToDashboard} />
    </PerformanceGrid>
  );
}
