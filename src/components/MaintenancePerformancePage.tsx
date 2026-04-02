'use client';

import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PerformanceGrid, GridCard, PerformanceIndicatorsCard, BuildingRankingCard, DashboardLinksCard, KpiScoreOverTimeCard, toRanked } from '@/components/performance';
import type { DashboardLink } from '@/components/performance';
import Chip from '@mui/material/Chip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Avatar from '@mui/material/Avatar';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import { LineChart, lineClasses } from '@mui/x-charts/LineChart';
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine';
import { useDrawingArea, useYScale } from '@mui/x-charts/hooks';
import { useThemeMode } from '@/theme-mode-context';
import { HorizontalThresholdGradient, InteractiveThresholdLine, ChartHoverOverlay } from '@/components/KpiChartComponents';
import Button from '@mui/material/Button';
import { buildings, Building } from '@/data/buildings';
import StackedImages from '@/components/StackedImages';

// ── Threshold gradient (rendered inside LineChart SVG) ──

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

// ── Topic definitions ────────────────────────────────────────────────────────

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

// Topics: progress, timeliness, reporting
// Offsets: progress +4, timeliness -7, reporting +3 → sum = 0
const TOPIC_DEFS = [
  { key: 'progress', label: 'Progress', icon: <TaskAltOutlinedIcon sx={{ fontSize: 20 }} />, offset: 4, trend: 5, chartColor: '#2196f3', goodAbove: 80, moderateAbove: 60 },
  { key: 'timeliness', label: 'Timeliness', icon: <ScheduleOutlinedIcon sx={{ fontSize: 20 }} />, offset: -7, trend: -2, chartColor: '#ff9800', goodAbove: 75, moderateAbove: 55 },
  { key: 'reporting', label: 'Reporting', icon: <AssessmentOutlinedIcon sx={{ fontSize: 20 }} />, offset: 3, trend: 8, chartColor: '#9c27b0', goodAbove: 80, moderateAbove: 60 },
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

// Compliance levels affect scores — simulate per-building variations
type ComplianceLevel = 'all' | 'wetgeving' | 'overige_regelgeving' | 'regulier_onderhoud';

const COMPLIANCE_OPTIONS: { key: ComplianceLevel; label: string; description: string }[] = [
  { key: 'all', label: 'All levels', description: 'All compliance levels' },
  { key: 'wetgeving', label: 'Legislation', description: 'Mandatory' },
  { key: 'overige_regelgeving', label: 'Other regulations', description: 'E.g. insurer requirements' },
  { key: 'regulier_onderhoud', label: 'Regular maintenance', description: 'N/A compliance' },
];

// Generate compliance-adjusted scores per building
function getComplianceAdjustedScore(buildingName: string, baseScore: number, level: ComplianceLevel): number {
  if (level === 'all') return baseScore;
  const rng = seededRandom(buildingName.length * 997 + level.length * 31);
  const offset = level === 'wetgeving' ? (rng() * 10 - 3) : level === 'overige_regelgeving' ? (rng() * 14 - 7) : (rng() * 12 - 4);
  return Math.round(Math.max(0, Math.min(100, baseScore + offset)));
}

function getComplianceAdjustedTrend(buildingName: string, baseTrend: number, level: ComplianceLevel): number {
  if (level === 'all') return baseTrend;
  const rng = seededRandom(buildingName.length * 443 + level.length * 71);
  const offset = (rng() - 0.5) * 6;
  return Math.round((baseTrend + offset) * 10) / 10;
}

function getBuildingSortedLists(level: ComplianceLevel) {
  const scored = buildings.map(b => ({
    ...b,
    adjustedScore: getComplianceAdjustedScore(b.name, b.metrics.maintenance.green, level),
    adjustedTrend: getComplianceAdjustedTrend(b.name, b.trends.maintenance, level),
  }));

  return {
    sortedBest: [...scored].sort((a, b) => b.adjustedScore - a.adjustedScore).slice(0, 7),
    sortedWorst: [...scored].sort((a, b) => a.adjustedScore - b.adjustedScore).slice(0, 7),
    sortedMostImproved: [...scored].sort((a, b) => b.adjustedTrend - a.adjustedTrend).slice(0, 7),
    sortedMostDeteriorated: [...scored].sort((a, b) => a.adjustedTrend - b.adjustedTrend).slice(0, 7),
  };
}

// ── Cluster aggregation ──

interface ClusterEntry {
  name: string;
  image: string;
  images: string[];
  adjustedScore: number;
  adjustedTrend: number;
}

function getClusterEntries(level: ComplianceLevel): ClusterEntry[] {
  const groups = new Map<string, Building[]>();
  for (const b of buildings) {
    const arr = groups.get(b.group) || [];
    arr.push(b);
    groups.set(b.group, arr);
  }
  return Array.from(groups.entries()).map(([name, blds]) => {
    const avgScore = Math.round(blds.reduce((s, b) => s + getComplianceAdjustedScore(b.name, b.metrics.maintenance.green, level), 0) / blds.length);
    const avgTrend = Math.round(blds.reduce((s, b) => s + getComplianceAdjustedTrend(b.name, b.trends.maintenance, level), 0) / blds.length * 10) / 10;
    return {
      name,
      image: blds[0].image,
      images: blds.map(b => b.image),
      adjustedScore: avgScore,
      adjustedTrend: avgTrend,
    };
  });
}

// ── KPI over time data ───────────────────────────────────────────────────────

type ViewMode = 'theme' | 'all_topics' | 'progress' | 'timeliness' | 'reporting';

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

const THEME_GOOD_ABOVE = 80;
const THEME_MODERATE_ABOVE = 60;

// ── Maintenance dashboard links ──────────────────────────────────────────────

const MAINTENANCE_DASHBOARDS: DashboardLink[] = [
  { id: 'preventief_onderhoud', label: 'Preventive maintenance', subtitle: 'Scheduled maintenance, execution and status', icon: <GridViewOutlinedIcon /> },
  { id: 'process_orders', label: 'Process orders', subtitle: 'Work orders, lead times and completion', icon: <TimelineOutlinedIcon /> },
  { id: 'mjob', label: 'Multi-year maintenance budget', subtitle: 'Long-term maintenance planning and budget', icon: <CalendarMonthOutlinedIcon /> },
];

// ── Component ────────────────────────────────────────────────────────────────

interface MaintenancePerformancePageProps {
  themeScore?: number;
  themeTrend?: number;
  onNavigateToDashboard?: (dashboardId: string) => void;
  onBuildingSelect?: (building: Building) => void;
  onViewAllBuildings?: (sort: 'Best to Worst' | 'Worst to Best') => void;
  buildingMode?: 'buildings' | 'clusters';
}

export default function MaintenancePerformancePage({ themeScore = 78, themeTrend = 3, onNavigateToDashboard, onBuildingSelect, onViewAllBuildings, buildingMode = 'buildings' }: MaintenancePerformancePageProps) {
  const { themeColors: c } = useThemeMode();
  const [chartView, setChartView] = useState<ViewMode>('theme');
  const [leftListMode, setLeftListMode] = useState<'best' | 'improved'>('best');
  const [rightListMode, setRightListMode] = useState<'worst' | 'deteriorated'>('worst');
  const [complianceLevel, setComplianceLevel] = useState<ComplianceLevel>('all');

  // Compliance-adjusted theme score
  const adjustedThemeScore = useMemo(() => {
    if (complianceLevel === 'all') return themeScore;
    const rng = seededRandom(complianceLevel.length * 1009);
    const offset = complianceLevel === 'wetgeving' ? 5 : complianceLevel === 'overige_regelgeving' ? -4 : 2;
    return Math.max(0, Math.min(100, themeScore + offset + Math.round((rng() - 0.5) * 4)));
  }, [themeScore, complianceLevel]);

  const adjustedThemeTrend = useMemo(() => {
    if (complianceLevel === 'all') return themeTrend;
    const rng = seededRandom(complianceLevel.length * 773);
    return Math.round((themeTrend + (rng() - 0.5) * 4) * 10) / 10;
  }, [themeTrend, complianceLevel]);

  // Sparkline renderer
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

  const topics = useMemo(() => buildTopics(adjustedThemeScore), [adjustedThemeScore]);

  const themeSeries = useMemo(() => ({
    label: 'Maintenance KPI',
    color: c.brand,
    data: generateKpiTimeSeries(`maintenance_theme_${complianceLevel}`, adjustedThemeScore),
  }), [adjustedThemeScore, complianceLevel]);

  const topicSeries = useMemo(() => topics.map(t => ({
    label: t.label,
    color: t.chartColor,
    data: generateKpiTimeSeries(`${t.key}_${complianceLevel}`, t.score, t.key === 'timeliness' ? 3 : 1),
    goodAbove: t.goodAbove,
    moderateAbove: t.moderateAbove,
  })), [topics, complianceLevel]);

  const chartSeries = useMemo(() => {
    switch (chartView) {
      case 'theme':
        return [themeSeries];
      case 'all_topics':
        return [themeSeries, ...topicSeries];
      case 'progress':
        return [topicSeries[0]];
      case 'timeliness':
        return [topicSeries[1]];
      case 'reporting':
        return [topicSeries[2]];
    }
  }, [chartView, themeSeries, topicSeries]);

  const showThresholds = chartView !== 'all_topics';

  const activeThresholdZones = useMemo(() => {
    if (!showThresholds) return [];
    switch (chartView) {
      case 'theme':
        return buildThresholdZones(THEME_GOOD_ABOVE, THEME_MODERATE_ABOVE);
      case 'progress':
        return buildThresholdZones(topics[0].goodAbove, topics[0].moderateAbove);
      case 'timeliness':
        return buildThresholdZones(topics[1].goodAbove, topics[1].moderateAbove);
      case 'reporting':
        return buildThresholdZones(topics[2].goodAbove, topics[2].moderateAbove);
      default:
        return [];
    }
  }, [chartView, showThresholds, topics]);

  const yRange = useMemo(() => {
    const allValues = chartSeries.flatMap(s => s.data);
    const dataMin = Math.min(...allValues);
    const modAbove = activeThresholdZones.find(z => z.label === 'Moderate')?.min ?? 60;
    const relevantMin = showThresholds ? Math.min(dataMin, modAbove) : dataMin;
    const yMin = Math.max(0, Math.floor((relevantMin - 10) / 10) * 10);
    return { min: yMin, max: 100 };
  }, [chartSeries, activeThresholdZones, showThresholds]);

  const menuItems: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: 'theme', label: 'Maintenance KPI', icon: <BuildOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'progress', label: 'Progress', icon: <TaskAltOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'timeliness', label: 'Timeliness', icon: <ScheduleOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'reporting', label: 'Reporting', icon: <AssessmentOutlinedIcon sx={{ fontSize: 16 }} /> },
  ];

  // Building / cluster lists based on compliance level
  const buildingLists = useMemo(() => getBuildingSortedLists(complianceLevel), [complianceLevel]);
  const clusterList = useMemo(() => getClusterEntries(complianceLevel), [complianceLevel]);
  const clusterSortedBest = useMemo(() => [...clusterList].sort((a, b) => b.adjustedScore - a.adjustedScore), [clusterList]);
  const clusterSortedWorst = useMemo(() => [...clusterList].sort((a, b) => a.adjustedScore - b.adjustedScore), [clusterList]);
  const clusterSortedMostImproved = useMemo(() => [...clusterList].sort((a, b) => b.adjustedTrend - a.adjustedTrend), [clusterList]);
  const clusterSortedMostDeteriorated = useMemo(() => [...clusterList].sort((a, b) => a.adjustedTrend - b.adjustedTrend), [clusterList]);

  return (
    <PerformanceGrid>
      {/* ═══ SECTION 0: Compliance Level Selector ═══ */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: c.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', border: `1px solid ${c.borderTertiary}` }}>
          {COMPLIANCE_OPTIONS.map(opt => {
            const isActive = complianceLevel === opt.key;
            return (
              <Box
                key={opt.key}
                onClick={() => setComplianceLevel(opt.key)}
                sx={{
                  px: 1.5, py: 0.5, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px',
                  cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                  bgcolor: isActive ? c.bgPrimary : 'transparent',
                  color: isActive ? 'text.primary' : 'text.secondary',
                  boxShadow: isActive ? c.shadow : 'none',
                }}
              >
                {opt.label}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ═══ SECTION 1: Theme KPI + Topic KPI Cards ═══ */}
      <PerformanceIndicatorsCard
        icon={<BuildOutlinedIcon sx={{ color: c.brand }} />}
        title="Maintenance Performance"
        score={adjustedThemeScore}
        trend={adjustedThemeTrend}
        topics={topics}
      />

      {/* ═══ SECTION 2: Best/Worst + KPI Over Time ═══ */}
      {/* ═══ Top/Worst Buildings + KPI Over Time ═══ */}
      <BuildingRankingCard
        variant="top"
        buildingMode={buildingMode}
        primaryItems={toRanked(buildingMode === 'clusters' ? clusterSortedBest : buildingLists.sortedBest)}
        secondaryItems={toRanked(buildingMode === 'clusters' ? clusterSortedMostImproved : buildingLists.sortedMostImproved)}
        onBuildingSelect={onBuildingSelect}
        onViewAllBuildings={onViewAllBuildings}
      />

      <BuildingRankingCard
        variant="worst"
        buildingMode={buildingMode}
        primaryItems={toRanked(buildingMode === 'clusters' ? clusterSortedWorst : buildingLists.sortedWorst)}
        secondaryItems={toRanked(buildingMode === 'clusters' ? clusterSortedMostDeteriorated : buildingLists.sortedMostDeteriorated)}
        onBuildingSelect={onBuildingSelect}
        onViewAllBuildings={onViewAllBuildings}
      />

      {/* ═══ KPI Score Over Time ═══ */}
      <KpiScoreOverTimeCard
        menuItems={menuItems}
        activeView={chartView}
        onViewChange={(key) => setChartView(key as ViewMode)}
        chartSeries={chartSeries}
        showThresholds={showThresholds}
        goodAbove={activeThresholdZones.find(z => z.label === 'Good')?.min ?? 80}
        moderateAbove={activeThresholdZones.find(z => z.label === 'Moderate')?.min ?? 60}
        yRange={yRange}
        gradientId="threshold-gradient-maint"
        annotationId="maintenanceperformancepage-grafiek"
      />

      {/* ═══ SECTION 3: Maintenance Dashboards ═══ */}
      <DashboardLinksCard title="Maintenance Dashboards" dashboards={MAINTENANCE_DASHBOARDS} onNavigate={onNavigateToDashboard} />
    </PerformanceGrid>
  );
}
