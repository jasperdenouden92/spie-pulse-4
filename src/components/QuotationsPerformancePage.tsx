'use client';

import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PerformanceGrid, GridCard, PerformanceIndicatorsCard, BuildingRankingCard, KpiScoreOverTimeCard, toRanked } from '@/components/performance';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import QuickreplyOutlinedIcon from '@mui/icons-material/QuickreplyOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Avatar from '@mui/material/Avatar';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
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

// Topics: run time, response time, approval time
// Offsets: run_time +5, response_time -8, approval_time +3 → sum = 0
const TOPIC_DEFS = [
  { key: 'run_time', label: 'Run time', icon: <TimerOutlinedIcon sx={{ fontSize: 20 }} />, offset: 5, trend: 3, chartColor: '#2196f3', goodAbove: 80, moderateAbove: 60 },
  { key: 'response_time', label: 'Response time', icon: <QuickreplyOutlinedIcon sx={{ fontSize: 20 }} />, offset: -8, trend: -3, chartColor: '#ff9800', goodAbove: 75, moderateAbove: 55 },
  { key: 'approval_time', label: 'Approval time', icon: <ThumbUpAltOutlinedIcon sx={{ fontSize: 20 }} />, offset: 3, trend: 6, chartColor: '#9c27b0', goodAbove: 80, moderateAbove: 60 },
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
    adjustedScore: b.metrics.quotations.green,
    adjustedTrend: b.trends.quotations,
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
    const avgScore = Math.round(blds.reduce((s, b) => s + b.metrics.quotations.green, 0) / blds.length);
    const avgTrend = Math.round(blds.reduce((s, b) => s + b.trends.quotations, 0) / blds.length * 10) / 10;
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

type ViewMode = 'theme' | 'all_topics' | 'run_time' | 'response_time' | 'approval_time';

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

// ── Quotation status data ─────────────────────────────────────────────────────

type QuotationStatus = 'In progress' | 'Open' | 'Assigned' | 'Rejected' | 'Received';

const STATUS_COUNTS: { status: QuotationStatus; count: number; color: string }[] = [
  { status: 'In progress', count: 6, color: '#2196f3' },
  { status: 'Open', count: 2, color: '#ff9800' },
  { status: 'Assigned', count: 5, color: '#7c4dff' },
  { status: 'Rejected', count: 9, color: '#ef5350' },
  { status: 'Received', count: 7, color: '#4caf50' },
];

interface QuotationItem {
  id: string;
  title: string;
  building: string;
  status: QuotationStatus;
  amount: number;
  validFrom: string;
  validUntil: string;
  assignee: string;
}

const ACTIVE_QUOTATIONS: QuotationItem[] = [
  { id: 'Q044901071', title: 'Test automation update', building: 'De Efteling', status: 'Open', amount: 11550, validFrom: '02-12-2025', validUntil: '03-12-2025', assignee: 'H.C.M. Mond' },
  { id: 'Q045900006', title: 'Twan-Focus-Tst 07:02', building: 'De Efteling', status: 'In progress', amount: 0, validFrom: '12-06-2025', validUntil: '22-01-2026', assignee: 'M. Neuten' },
  { id: 'Q044901072', title: 'Twan-Focus-TST 08:23', building: 'De Efteling', status: 'In progress', amount: 0, validFrom: '03-06-2024', validUntil: '04-05-2025', assignee: 'B. Sevenge' },
  { id: 'Q044901070', title: 'HVAC system inspection', building: 'De Efteling', status: 'Open', amount: 30, validFrom: '16-07-2024', validUntil: '15-08-2024', assignee: 'R.R.H.M. Zij' },
  { id: 'Q044901066', title: 'Electrical panel upgrade', building: 'De Efteling', status: 'In progress', amount: 0, validFrom: '09-07-2024', validUntil: '08-08-2024', assignee: 'B. Sevenge' },
  { id: 'Q044901067', title: 'Fire safety compliance', building: 'De Efteling', status: 'Assigned', amount: 10000, validFrom: '09-07-2024', validUntil: '08-08-2024', assignee: 'B. Sevenge' },
  { id: 'Q044901064', title: 'Plumbing maintenance', building: 'De Efteling', status: 'In progress', amount: 0, validFrom: '05-07-2024', validUntil: '04-08-2024', assignee: 'M. Neuten' },
  { id: 'Q044901058', title: 'Security system upgrade', building: 'De Efteling', status: 'Assigned', amount: 8500, validFrom: '01-07-2024', validUntil: '30-07-2024', assignee: 'H.C.M. Mond' },
  { id: 'Q044901052', title: 'LED lighting replacement', building: 'Rijksmuseum', status: 'Received', amount: 24000, validFrom: '25-06-2024', validUntil: '25-07-2024', assignee: 'R.R.H.M. Zij' },
  { id: 'Q044901049', title: 'Elevator maintenance contract', building: 'Rijksmuseum', status: 'In progress', amount: 0, validFrom: '20-06-2024', validUntil: '20-07-2024', assignee: 'B. Sevenge' },
  { id: 'Q044901045', title: 'Roof inspection & repair', building: 'Gemeentehuis Meierijstad', status: 'Assigned', amount: 15200, validFrom: '15-06-2024', validUntil: '15-07-2024', assignee: 'M. Neuten' },
  { id: 'Q044901041', title: 'Water heater replacement', building: 'Gemeentehuis Meierijstad', status: 'Received', amount: 4800, validFrom: '10-06-2024', validUntil: '10-07-2024', assignee: 'H.C.M. Mond' },
  { id: 'Q044901038', title: 'Air quality monitoring install', building: 'Gemeentehuis Meierijstad', status: 'In progress', amount: 0, validFrom: '05-06-2024', validUntil: '05-07-2024', assignee: 'R.R.H.M. Zij' },
  { id: 'Q044901035', title: 'Parking garage ventilation', building: 'Jaarbeurs Utrecht', status: 'Received', amount: 32000, validFrom: '01-06-2024', validUntil: '01-07-2024', assignee: 'B. Sevenge' },
  { id: 'Q044901031', title: 'Emergency generator service', building: 'Jaarbeurs Utrecht', status: 'Assigned', amount: 7600, validFrom: '28-05-2024', validUntil: '28-06-2024', assignee: 'M. Neuten' },
  { id: 'Q044901028', title: 'Window sealing renovation', building: 'Jaarbeurs Utrecht', status: 'Received', amount: 19500, validFrom: '22-05-2024', validUntil: '22-06-2024', assignee: 'H.C.M. Mond' },
  { id: 'Q044901024', title: 'Solar panel maintenance', building: 'TU Eindhoven', status: 'Received', amount: 6200, validFrom: '18-05-2024', validUntil: '18-06-2024', assignee: 'R.R.H.M. Zij' },
  { id: 'Q044901020', title: 'Insulation upgrade floors 3-5', building: 'TU Eindhoven', status: 'Assigned', amount: 28000, validFrom: '14-05-2024', validUntil: '14-06-2024', assignee: 'B. Sevenge' },
  { id: 'Q044901017', title: 'Sprinkler system test', building: 'TU Eindhoven', status: 'Received', amount: 3400, validFrom: '10-05-2024', validUntil: '10-06-2024', assignee: 'M. Neuten' },
  { id: 'Q044901013', title: 'BMS controller replacement', building: 'TU Eindhoven', status: 'Received', amount: 14200, validFrom: '06-05-2024', validUntil: '06-06-2024', assignee: 'H.C.M. Mond' },
];

const ACTIVE_STATUSES: QuotationStatus[] = ['In progress', 'Open', 'Assigned', 'Received'];
const ACTION_REQUIRED_STATUSES: QuotationStatus[] = ['Open', 'Assigned'];

function getQuotationStatusColor(status: QuotationStatus): string {
  return STATUS_COUNTS.find(s => s.status === status)?.color ?? '#888';
}

function formatDeadline(ddmmyyyy: string): string {
  const [d, m, y] = ddmmyyyy.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Today';
  if (diff === 1) return 'In 1 day';
  return `In ${diff} days`;
}

function formatCreationDate(ddmmyyyy: string): string {
  const [d, m, y] = ddmmyyyy.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[m - 1]} ${y}`;
}

// ── Component ────────────────────────────────────────────────────────────────

interface QuotationsPerformancePageProps {
  themeScore?: number;
  themeTrend?: number;
  onNavigateToDashboard?: (dashboardId: string) => void;
  onBuildingSelect?: (building: Building) => void;
  onViewAllBuildings?: (sort: 'Best to Worst' | 'Worst to Best') => void;
  onStatusFilter?: (status: string) => void;
  buildingMode?: 'buildings' | 'clusters';
}

export default function QuotationsPerformancePage({ themeScore = 74, themeTrend = 2, onNavigateToDashboard, onBuildingSelect, onViewAllBuildings, onStatusFilter, buildingMode = 'buildings' }: QuotationsPerformancePageProps) {
  const { themeColors: c } = useThemeMode();
  const [chartView, setChartView] = useState<ViewMode>('theme');
  const [leftListMode, setLeftListMode] = useState<'best' | 'improved'>('best');
  const [rightListMode, setRightListMode] = useState<'worst' | 'deteriorated'>('worst');
  const [quotationsActionFilter, setQuotationsActionFilter] = useState(false);

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
    label: 'Quotations KPI',
    color: c.brand,
    data: generateKpiTimeSeries('quotations_theme', themeScore),
  }), [themeScore]);

  const topicSeries = useMemo(() => topics.map(t => ({
    label: t.label,
    color: t.chartColor,
    data: generateKpiTimeSeries(`quotations_${t.key}`, t.score, t.key === 'response_time' ? 3 : 1),
    goodAbove: t.goodAbove,
    moderateAbove: t.moderateAbove,
  })), [topics]);

  const chartSeries = useMemo(() => {
    switch (chartView) {
      case 'theme':
        return [themeSeries];
      case 'all_topics':
        return [themeSeries, ...topicSeries];
      case 'run_time':
        return [topicSeries[0]];
      case 'response_time':
        return [topicSeries[1]];
      case 'approval_time':
        return [topicSeries[2]];
    }
  }, [chartView, themeSeries, topicSeries]);

  const showThresholds = chartView !== 'all_topics';

  const activeThresholdZones = useMemo(() => {
    if (!showThresholds) return [];
    switch (chartView) {
      case 'theme':
        return buildThresholdZones(THEME_GOOD_ABOVE, THEME_MODERATE_ABOVE);
      case 'run_time':
        return buildThresholdZones(topics[0].goodAbove, topics[0].moderateAbove);
      case 'response_time':
        return buildThresholdZones(topics[1].goodAbove, topics[1].moderateAbove);
      case 'approval_time':
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
    { key: 'theme', label: 'Quotations KPI', icon: <RequestQuoteOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'run_time', label: 'Run time', icon: <TimerOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'response_time', label: 'Response time', icon: <QuickreplyOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'approval_time', label: 'Approval time', icon: <ThumbUpAltOutlinedIcon sx={{ fontSize: 16 }} /> },
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
        icon={<RequestQuoteOutlinedIcon sx={{ color: c.brand }} />}
        title="Quotations Performance"
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
        gradientId="threshold-gradient-quot"
        annotationId="quotationsperformancepage-grafiek-2"
      />

      {/* ═══ SECTION 3: Quotations Overview ═══ */}
      <GridCard
        size="lg"
        icon={<RequestQuoteOutlinedIcon sx={{ color: c.brand }} />}
        title="Quotations Overview"
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 7fr', gap: 2 }}>
          {/* Card 1: Status distribution donut */}
          <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${c.cardBorder}`, borderRadius: '12px', bgcolor: c.bgPrimary, boxShadow: c.cardShadow, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Status Overview</Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <PieChart data-annotation-id="quotationsperformancepage-grafiek"
                series={[{
                  data: STATUS_COUNTS.map((s, i) => ({ id: i, value: s.count, label: s.status, color: s.color })),
                  innerRadius: 46,
                  outerRadius: 70,
                  paddingAngle: 2,
                  cornerRadius: 3,
                }]}
                width={180}
                height={160}
                hideLegend
                margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
              />
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1 }}>
                  {STATUS_COUNTS.reduce((s, c) => s + c.count, 0)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>total</Typography>
              </Box>
            </Box>

            {/* Legend */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
              {STATUS_COUNTS.map(s => (
                <Box
                  key={s.status}
                  onClick={() => onStatusFilter?.(s.status)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    px: 1, py: 0.5, mx: -1, borderRadius: 0.5,
                    cursor: 'pointer', transition: 'background-color 0.15s ease',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <FiberManualRecordIcon sx={{ fontSize: 8, color: s.color }} />
                  <Typography variant="caption" sx={{ flex: 1, fontSize: '0.75rem' }}>{s.status}</Typography>
                  <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>{s.count}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Card 2: Active quotations list */}
          <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${c.cardBorder}`, borderRadius: '12px', bgcolor: c.bgPrimary, boxShadow: c.cardShadow, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>Active Quotations</Typography>
                <Chip
                  icon={<FilterListIcon sx={{ fontSize: 13 }} />}
                  label="Action required"
                  size="small"
                  onClick={() => setQuotationsActionFilter(f => !f)}
                  sx={{
                    height: 22, fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer',
                    bgcolor: quotationsActionFilter ? `${c.brand}14` : 'transparent',
                    color: quotationsActionFilter ? c.brand : 'text.secondary',
                    border: '1px solid', borderColor: quotationsActionFilter ? c.brand : 'divider',
                    '& .MuiChip-icon': { ml: 0.5, mr: -0.25, color: quotationsActionFilter ? c.brand : 'text.secondary' },
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />
              </Box>
              <Button
                size="small"
                endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.7rem', minWidth: 0 }}
              >
                View all
              </Button>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', maxHeight: 320, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {ACTIVE_QUOTATIONS.filter(q => quotationsActionFilter ? ACTION_REQUIRED_STATUSES.includes(q.status) : ACTIVE_STATUSES.includes(q.status)).map(q => (
                <Box
                  key={q.id}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: 1.5,
                    borderBottom: '1px solid', borderColor: 'divider',
                    borderRadius: 0.5,
                    cursor: 'pointer', transition: 'background-color 0.15s ease',
                    '&:hover': { bgcolor: 'action.hover' },
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.8rem' }}>
                        {q.id}
                      </Typography>
                      <Typography variant="body2" fontWeight={500} noWrap sx={{ fontSize: '0.8rem', color: 'text.primary' }}>
                        {q.title}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                        {q.building}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                        {formatCreationDate(q.validFrom)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                        •
                      </Typography>
                      <Typography variant="caption" fontWeight={500} sx={{ fontSize: '0.7rem', color: formatDeadline(q.validUntil).includes('overdue') ? '#ef5350' : 'text.secondary' }}>
                        {formatDeadline(q.validUntil)}
                      </Typography>
                    </Box>
                  </Box>
                  {q.amount > 0 && (
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem', flexShrink: 0, minWidth: 70, textAlign: 'right' }}>
                      €{q.amount.toLocaleString('nl-NL')}
                    </Typography>
                  )}
                  <Chip
                    label={q.status}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      bgcolor: `${getQuotationStatusColor(q.status)}14`,
                      color: getQuotationStatusColor(q.status),
                      '& .MuiChip-label': { px: 0.75 },
                      flexShrink: 0,
                      minWidth: 80,
                      justifyContent: 'center',
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </GridCard>
    </PerformanceGrid>
  );
}
