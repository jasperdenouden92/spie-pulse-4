'use client';

import React, { useState, useMemo } from 'react';
import { PerformanceGrid, GridCard, PerformanceIndicatorsCard, BuildingRankingCard, KpiScoreOverTimeCard, toRanked, TicketStatusOverviewCard, TicketActiveListCard } from '@/components/performance';
import type { TicketItem, StatusCount } from '@/components/performance';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import QuickreplyOutlinedIcon from '@mui/icons-material/QuickreplyOutlined';
import SettingsBackupRestoreOutlinedIcon from '@mui/icons-material/SettingsBackupRestoreOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import TagOutlinedIcon from '@mui/icons-material/TagOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Avatar from '@mui/material/Avatar';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import { LineChart, lineClasses } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
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

// Topics: respond time, restore time
const TOPIC_DEFS = [
  { key: 'respond_time', label: 'Response time', icon: <QuickreplyOutlinedIcon sx={{ fontSize: 20 }} />, offset: 3, trend: 4, chartColor: '#2196f3', goodAbove: 80, moderateAbove: 60 },
  { key: 'restore_time', label: 'Restore time', icon: <SettingsBackupRestoreOutlinedIcon sx={{ fontSize: 20 }} />, offset: -5, trend: -2, chartColor: '#ff9800', goodAbove: 75, moderateAbove: 55 },
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

function getBuildingSortedLists() {
  const scored = buildings.map(b => ({
    ...b,
    adjustedScore: b.metrics.tickets.green,
    adjustedTrend: b.trends.tickets,
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

function getClusterEntries(): ClusterEntry[] {
  const groups = new Map<string, Building[]>();
  for (const b of buildings) {
    const arr = groups.get(b.group) || [];
    arr.push(b);
    groups.set(b.group, arr);
  }
  return Array.from(groups.entries()).map(([name, blds]) => {
    const avgScore = Math.round(blds.reduce((s, b) => s + b.metrics.tickets.green, 0) / blds.length);
    const avgTrend = Math.round(blds.reduce((s, b) => s + b.trends.tickets, 0) / blds.length * 10) / 10;
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

type ViewMode = 'theme' | 'all_topics' | 'respond_time' | 'restore_time';

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

// ── Ticket status data ─────────────────────────────────────────────────────

const STATUS_COUNTS: StatusCount[] = [
  { status: 'Received', count: 8, color: '#2196f3' },
  { status: 'In operation', count: 5, color: '#ff9800' },
  { status: 'To approve', count: 3, color: '#e91e63' },
  { status: 'Function restored', count: 4, color: '#7c4dff' },
  { status: 'Completed', count: 12, color: '#4caf50' },
  { status: 'Invoiced', count: 6, color: '#78909c' },
];

const ACTIVE_TICKETS: TicketItem[] = [
  { id: 'T-2026-0041', title: 'Test', building: 'Efteling/Hoofdkantoor', status: 'Received', category: 'Storing', priority: 'High', createdDate: '24-03-2026 10:45', assignee: 'M. Neuten', werkbon: '-/-', referentie: '-' },
  { id: 'T-2026-0040', title: 'Kapotte band', building: 'Efteling/Carnaval Festival', status: 'Received', category: 'Regie', priority: 'Medium', createdDate: '24-03-2026 15:30', assignee: 'B. Sevenge', werkbon: '-/-', referentie: '-' },
  { id: 'T-2026-0039', title: 'Testticket', building: 'Efteling/Hoofdkantoor', status: 'Received', category: 'Storing', priority: 'High', createdDate: '24-03-2026 14:32', assignee: 'H.C.M. Mond', werkbon: '-/-', referentie: '-' },
  { id: 'T-2026-0038', title: 'Testticket', building: 'Efteling/Hoofdkantoor', status: 'Received', category: 'Storing', priority: 'High', createdDate: '24-03-2026 14:50', assignee: 'R.R.H.M. Zij', werkbon: '-/-', referentie: '-' },
  { id: 'T-2026-0037', title: '.', building: '0413 Z - B&O Son', status: 'In operation', category: 'Storing', priority: 'Medium', createdDate: '11-03-2026 11:52', assignee: 'M. Neuten', werkbon: '440291', referentie: 'REF-2026-112' },
  { id: 'T-2026-0036', title: 'HVAC system failure', building: 'Rijksmuseum', status: 'In operation', category: 'Storing', priority: 'Critical', createdDate: '09-03-2026 08:15', assignee: 'B. Sevenge', werkbon: '440287', referentie: 'REF-2026-098' },
  { id: 'T-2026-0035', title: 'Emergency lighting fault', building: 'Gemeentehuis Meierijstad', status: 'In operation', category: 'Storing', priority: 'High', createdDate: '07-03-2026 16:20', assignee: 'H.C.M. Mond', werkbon: '440283', referentie: 'REF-2026-091' },
  { id: 'T-2026-0034', title: 'Elevator maintenance', building: 'Jaarbeurs Utrecht', status: 'Function restored', category: 'Regie', priority: 'Medium', createdDate: '05-03-2026 09:45', assignee: 'R.R.H.M. Zij', werkbon: '440279', referentie: 'REF-2026-085' },
  { id: 'T-2026-0033', title: 'Fire alarm inspection', building: 'TU Eindhoven', status: 'In operation', category: 'Regie', priority: 'High', createdDate: '03-03-2026 11:00', assignee: 'M. Neuten', werkbon: '440275', referentie: 'REF-2026-079' },
  { id: 'T-2026-0032', title: 'Cooling tower service', building: 'De Efteling', status: 'Function restored', category: 'Storing', priority: 'Medium', createdDate: '28-02-2026 14:30', assignee: 'B. Sevenge', werkbon: '440271', referentie: 'REF-2026-074' },
  { id: 'T-2026-0031', title: 'BMS controller reset', building: 'Rijksmuseum', status: 'Received', category: 'Storing', priority: 'High', createdDate: '25-02-2026 10:10', assignee: 'H.C.M. Mond', werkbon: '-/-', referentie: '-' },
  { id: 'T-2026-0030', title: 'Water leak in basement', building: 'Gemeentehuis Meierijstad', status: 'In operation', category: 'Storing', priority: 'Critical', createdDate: '22-02-2026 07:30', assignee: 'R.R.H.M. Zij', werkbon: '440263', referentie: 'REF-2026-061' },
  { id: 'T-2026-0029', title: 'Access card system', building: 'Jaarbeurs Utrecht', status: 'Function restored', category: 'Regie', priority: 'Low', createdDate: '20-02-2026 13:45', assignee: 'M. Neuten', werkbon: '440259', referentie: 'REF-2026-054' },
  { id: 'T-2026-0028', title: 'Solar panel cleaning', building: 'TU Eindhoven', status: 'Function restored', category: 'Regie', priority: 'Low', createdDate: '18-02-2026 09:00', assignee: 'B. Sevenge', werkbon: '440255', referentie: 'REF-2026-048' },
  { id: 'T-2026-0027', title: 'Sprinkler test report', building: 'De Efteling', status: 'Received', category: 'Regie', priority: 'Medium', createdDate: '15-02-2026 11:20', assignee: 'H.C.M. Mond', werkbon: '-/-', referentie: '-' },
  { id: 'T-2026-0026', title: 'Generator load test', building: 'Rijksmuseum', status: 'To approve', category: 'Regie', priority: 'Medium', createdDate: '12-02-2026 10:00', assignee: 'B. Sevenge', werkbon: '440251', referentie: 'REF-2026-042', amount: 3250 },
  { id: 'T-2026-0025', title: 'UPS battery replacement', building: 'Jaarbeurs Utrecht', status: 'To approve', category: 'Storing', priority: 'High', createdDate: '10-02-2026 14:30', assignee: 'M. Neuten', werkbon: '440247', referentie: 'REF-2026-038', amount: 8750 },
  { id: 'T-2026-0024', title: 'Climate control calibration', building: 'TU Eindhoven', status: 'To approve', category: 'Regie', priority: 'Low', createdDate: '08-02-2026 09:15', assignee: 'R.R.H.M. Zij', werkbon: '440243', referentie: 'REF-2026-033', amount: 1480 },
  { id: 'T-2026-0023', title: 'Ventilation overhaul', building: 'De Efteling', status: 'Completed', category: 'Regie', priority: 'Medium', createdDate: '05-02-2026 08:30', assignee: 'M. Neuten', werkbon: '440239', referentie: 'REF-2026-028', amount: 4200 },
  { id: 'T-2026-0022', title: 'Electrical panel upgrade', building: 'Rijksmuseum', status: 'Completed', category: 'Storing', priority: 'High', createdDate: '01-02-2026 11:00', assignee: 'B. Sevenge', werkbon: '440235', referentie: 'REF-2026-022', amount: 12500 },
  { id: 'T-2026-0021', title: 'Boiler replacement', building: 'Gemeentehuis Meierijstad', status: 'Invoiced', category: 'Storing', priority: 'High', createdDate: '28-01-2026 09:45', assignee: 'H.C.M. Mond', werkbon: '440231', referentie: 'REF-2026-018', amount: 18900 },
  { id: 'T-2026-0020', title: 'Air handling unit service', building: 'TU Eindhoven', status: 'Invoiced', category: 'Regie', priority: 'Medium', createdDate: '25-01-2026 14:15', assignee: 'R.R.H.M. Zij', werkbon: '440227', referentie: 'REF-2026-014', amount: 6350 },
];

// ── Component ────────────────────────────────────────────────────────────────

interface TicketsPerformancePageProps {
  themeScore?: number;
  themeTrend?: number;
  onNavigateToDashboard?: (dashboardId: string) => void;
  onBuildingSelect?: (building: Building) => void;
  onViewAllBuildings?: (sort: 'Best to Worst' | 'Worst to Best') => void;
  onStatusFilter?: (status: string) => void;
  buildingMode?: 'buildings' | 'clusters';
}

export default function TicketsPerformancePage({ themeScore = 71, themeTrend = 1, onNavigateToDashboard, onBuildingSelect, onViewAllBuildings, onStatusFilter, buildingMode = 'buildings' }: TicketsPerformancePageProps) {
  const { themeColors: c } = useThemeMode();
  const [chartView, setChartView] = useState<ViewMode>('theme');
  const [leftListMode, setLeftListMode] = useState<'best' | 'improved'>('best');
  const [rightListMode, setRightListMode] = useState<'worst' | 'deteriorated'>('worst');

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

  const topics = useMemo(() => buildTopics(themeScore), [themeScore]);

  const themeSeries = useMemo(() => ({
    label: 'Tickets KPI',
    color: c.brand,
    data: generateKpiTimeSeries('tickets_theme', themeScore),
  }), [themeScore]);

  const topicSeries = useMemo(() => topics.map(t => ({
    label: t.label,
    color: t.chartColor,
    data: generateKpiTimeSeries(`tickets_${t.key}`, t.score, t.key === 'restore_time' ? 3 : 1),
    goodAbove: t.goodAbove,
    moderateAbove: t.moderateAbove,
  })), [topics]);

  const chartSeries = useMemo(() => {
    switch (chartView) {
      case 'theme':
        return [themeSeries];
      case 'all_topics':
        return [themeSeries, ...topicSeries];
      case 'respond_time':
        return [topicSeries[0]];
      case 'restore_time':
        return [topicSeries[1]];
    }
  }, [chartView, themeSeries, topicSeries]);

  const showThresholds = chartView !== 'all_topics';

  const activeThresholdZones = useMemo(() => {
    if (!showThresholds) return [];
    switch (chartView) {
      case 'theme':
        return buildThresholdZones(THEME_GOOD_ABOVE, THEME_MODERATE_ABOVE);
      case 'respond_time':
        return buildThresholdZones(topics[0].goodAbove, topics[0].moderateAbove);
      case 'restore_time':
        return buildThresholdZones(topics[1].goodAbove, topics[1].moderateAbove);
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
    { key: 'theme', label: 'Tickets KPI', icon: <ConfirmationNumberOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'respond_time', label: 'Response time', icon: <QuickreplyOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'restore_time', label: 'Restore time', icon: <SettingsBackupRestoreOutlinedIcon sx={{ fontSize: 16 }} /> },
  ];

  // Building / cluster lists
  const buildingLists = useMemo(() => getBuildingSortedLists(), []);
  const clusterList = useMemo(() => getClusterEntries(), []);
  const clusterSortedBest = useMemo(() => [...clusterList].sort((a, b) => b.adjustedScore - a.adjustedScore), [clusterList]);
  const clusterSortedWorst = useMemo(() => [...clusterList].sort((a, b) => a.adjustedScore - b.adjustedScore), [clusterList]);
  const clusterSortedMostImproved = useMemo(() => [...clusterList].sort((a, b) => b.adjustedTrend - a.adjustedTrend), [clusterList]);
  const clusterSortedMostDeteriorated = useMemo(() => [...clusterList].sort((a, b) => a.adjustedTrend - b.adjustedTrend), [clusterList]);

  return (
    <PerformanceGrid>
      {/* ═══ SECTION 1: Theme KPI + Topic KPI Cards ═══ */}
      <PerformanceIndicatorsCard
        icon={<ConfirmationNumberOutlinedIcon sx={{ color: c.brand }} />}
        title="Tickets Performance"
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
        primaryItems={toRanked(buildingMode === 'clusters' ? clusterSortedBest : buildingLists.sortedBest)}
        secondaryItems={toRanked(buildingMode === 'clusters' ? clusterSortedMostImproved : buildingLists.sortedMostImproved)}
        onBuildingSelect={onBuildingSelect}
        onViewAllBuildings={onViewAllBuildings}
      />

      {/* ═══ Worst Buildings ═══ */}
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
        gradientId="threshold-gradient-tickets"
        annotationId="ticketsperformancepage-grafiek-2"
      />

      {/* ═══ SECTION 3: Tickets Overview ═══ */}
      <TicketStatusOverviewCard
        statusCounts={STATUS_COUNTS}
        onStatusFilter={onStatusFilter}
      />
      <TicketActiveListCard
        size="lg"
        tickets={ACTIVE_TICKETS}
        statusCounts={STATUS_COUNTS}
      />
    </PerformanceGrid>
  );
}
