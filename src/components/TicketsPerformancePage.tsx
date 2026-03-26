'use client';

import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
import { LineChart, lineClasses } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine';
import { useDrawingArea, useYScale } from '@mui/x-charts/hooks';
import { colors } from '@/colors';
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
  { key: 'respond_time', label: 'Respond time', icon: <QuickreplyOutlinedIcon sx={{ fontSize: 20 }} />, offset: 3, trend: 4, chartColor: '#2196f3', goodAbove: 80, moderateAbove: 60 },
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

type TicketStatus = 'Received' | 'In operation' | 'Function restored' | 'Completed' | 'Invoiced';

const STATUS_COUNTS: { status: TicketStatus; count: number; color: string }[] = [
  { status: 'Received', count: 8, color: '#2196f3' },
  { status: 'In operation', count: 5, color: '#ff9800' },
  { status: 'Function restored', count: 4, color: '#7c4dff' },
  { status: 'Completed', count: 12, color: '#4caf50' },
  { status: 'Invoiced', count: 6, color: '#78909c' },
];

interface TicketItem {
  id: string;
  title: string;
  building: string;
  status: TicketStatus;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  createdDate: string;
  assignee: string;
  werkbon: string;
  referentie: string;
}

const ACTIVE_TICKETS: TicketItem[] = [
  { id: 'T-2026-0041', title: 'Test', building: 'Efteling/Hoofdkantoor', status: 'Received', category: 'Storing', priority: 'High', createdDate: '24-03-2026 10:45', assignee: 'M. Neuten', werkbon: '-/-', referentie: '-' },
  { id: 'T-2026-0040', title: 'Kapotte band', building: 'Efteling/Carnaval Festival', status: 'Received', category: 'Regie', priority: 'Medium', createdDate: '24-03-2026 15:30', assignee: 'B. Sevenge', werkbon: '-/-', referentie: '-' },
  { id: 'T-2026-0039', title: 'Testticket', building: 'Efteling/Hoofdkantoor', status: 'Received', category: 'Storing', priority: 'High', createdDate: '24-03-2026 14:32', assignee: 'H.C.M. Mond', werkbon: '-/-', referentie: '-' },
  { id: 'T-2026-0038', title: 'Testticket', building: 'Efteling/Hoofdkantoor', status: 'Received', category: 'Storing', priority: 'High', createdDate: '24-03-2026 14:50', assignee: 'R.R.H.M. Zij', werkbon: '-/-', referentie: '-' },
  { id: 'T-2026-0037', title: '.', building: '0413 Z - B&O Son', status: 'In operation', category: 'Storing', priority: 'Medium', createdDate: '11-03-2026 11:52', assignee: 'M. Neuten', werkbon: '440291', referentie: 'REF-2026-112' },
  { id: 'T-2026-0036', title: 'HVAC system failure', building: 'Rijksmuseum', status: 'In operation', category: 'Storing', priority: 'Critical', createdDate: '09-03-2026 08:15', assignee: 'B. Sevenge', werkbon: '440287', referentie: 'REF-2026-098' },
  { id: 'T-2026-0035', title: 'Emergency lighting fault', building: 'Gemeentehuis Meierijstad', status: 'In operation', category: 'Storing', priority: 'High', createdDate: '07-03-2026 16:20', assignee: 'H.C.M. Mond', werkbon: '440283', referentie: '-' },
  { id: 'T-2026-0034', title: 'Elevator maintenance', building: 'Jaarbeurs Utrecht', status: 'Function restored', category: 'Regie', priority: 'Medium', createdDate: '05-03-2026 09:45', assignee: 'R.R.H.M. Zij', werkbon: '440279', referentie: 'REF-2026-085' },
  { id: 'T-2026-0033', title: 'Fire alarm inspection', building: 'TU Eindhoven', status: 'In operation', category: 'Regie', priority: 'High', createdDate: '03-03-2026 11:00', assignee: 'M. Neuten', werkbon: '440275', referentie: '-' },
  { id: 'T-2026-0032', title: 'Cooling tower service', building: 'De Efteling', status: 'Function restored', category: 'Storing', priority: 'Medium', createdDate: '28-02-2026 14:30', assignee: 'B. Sevenge', werkbon: '440271', referentie: 'REF-2026-074' },
  { id: 'T-2026-0031', title: 'BMS controller reset', building: 'Rijksmuseum', status: 'Received', category: 'Storing', priority: 'High', createdDate: '25-02-2026 10:10', assignee: 'H.C.M. Mond', werkbon: '-/-', referentie: '-' },
  { id: 'T-2026-0030', title: 'Water leak in basement', building: 'Gemeentehuis Meierijstad', status: 'In operation', category: 'Storing', priority: 'Critical', createdDate: '22-02-2026 07:30', assignee: 'R.R.H.M. Zij', werkbon: '440263', referentie: 'REF-2026-061' },
  { id: 'T-2026-0029', title: 'Access card system', building: 'Jaarbeurs Utrecht', status: 'Function restored', category: 'Regie', priority: 'Low', createdDate: '20-02-2026 13:45', assignee: 'M. Neuten', werkbon: '440259', referentie: '-' },
  { id: 'T-2026-0028', title: 'Solar panel cleaning', building: 'TU Eindhoven', status: 'Function restored', category: 'Regie', priority: 'Low', createdDate: '18-02-2026 09:00', assignee: 'B. Sevenge', werkbon: '440255', referentie: 'REF-2026-048' },
  { id: 'T-2026-0027', title: 'Sprinkler test report', building: 'De Efteling', status: 'Received', category: 'Regie', priority: 'Medium', createdDate: '15-02-2026 11:20', assignee: 'H.C.M. Mond', werkbon: '-/-', referentie: '-' },
];

const ACTIVE_STATUSES: TicketStatus[] = ['Received', 'In operation', 'Function restored'];

function getTicketStatusColor(status: TicketStatus): string {
  return STATUS_COUNTS.find(s => s.status === status)?.color ?? '#888';
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'Critical': return '#f44336';
    case 'High': return '#ff9800';
    case 'Medium': return '#2196f3';
    case 'Low': return '#4caf50';
    default: return '#888';
  }
}

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
    color: colors.brand,
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
    { key: 'respond_time', label: 'Respond time', icon: <QuickreplyOutlinedIcon sx={{ fontSize: 16 }} /> },
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ═══ SECTION 1: Theme KPI + Topic KPI Cards ═══ */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
            Tickets Performance
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {themeScore}%
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: themeTrend >= 0 ? 'success.main' : 'error.main' }}>
              {themeTrend >= 0 ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                {Math.abs(themeTrend)}%
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Topic cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {topics.map(topic => (
            <Paper
              key={topic.key}
              elevation={0}
              sx={{
                p: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ color: 'text.secondary', display: 'flex' }}>{topic.icon}</Box>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>{topic.label}</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="h5" fontWeight={700}>{topic.score}%</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: topic.trend >= 0 ? 'success.main' : 'error.main' }}>
                    {topic.trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
                    <Typography variant="caption" fontWeight={600}>{Math.abs(topic.trend)}%</Typography>
                  </Box>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  {renderSparkline(topic.sparkline, getStatusColor(topic.score, topic.goodAbove, topic.moderateAbove))}
                </Box>
              </Box>

              <Chip
                label={getStatusLabel(topic.score, topic.goodAbove, topic.moderateAbove)}
                size="small"
                sx={{
                  alignSelf: 'flex-start',
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  bgcolor: `${getStatusColor(topic.score, topic.goodAbove, topic.moderateAbove)}18`,
                  color: getStatusColor(topic.score, topic.goodAbove, topic.moderateAbove),
                  '& .MuiChip-label': { px: 1 },
                }}
              />
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
        <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEventsOutlinedIcon sx={{ fontSize: 18, color: '#66bb6a' }} />
              <Typography variant="body2" fontWeight={600}>{buildingMode === 'clusters' ? 'Top Clusters' : 'Top Buildings'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: colors.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', border: `1px solid ${colors.borderTertiary}` }}>
              <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: leftListMode === 'best' ? 'white' : 'transparent', color: leftListMode === 'best' ? 'text.primary' : 'text.secondary', boxShadow: leftListMode === 'best' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }} onClick={() => setLeftListMode('best')}>Best Performing</Box>
              <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: leftListMode === 'improved' ? 'white' : 'transparent', color: leftListMode === 'improved' ? 'text.primary' : 'text.secondary', boxShadow: leftListMode === 'improved' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }} onClick={() => setLeftListMode('improved')}>Most Improved</Box>
            </Box>
          </Box>
          {(buildingMode === 'clusters'
            ? (leftListMode === 'best' ? clusterSortedBest : clusterSortedMostImproved)
            : (leftListMode === 'best' ? buildingLists.sortedBest : buildingLists.sortedMostImproved)
          ).map((b, i) => {
            const score = 'adjustedScore' in b ? b.adjustedScore : (b as Building).metrics.tickets.green;
            const trend = 'adjustedTrend' in b ? b.adjustedTrend : (b as Building).trends.tickets;
            const showTrend = leftListMode === 'improved';
            const barColor = getStatusColor(score, 80, 60);
            return (
              <Box
                key={b.name}
                onClick={() => buildingMode === 'buildings' && 'address' in b ? onBuildingSelect?.(b as Building) : undefined}
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
          <Button
            size="small"
            onClick={() => onViewAllBuildings?.('Best to Worst')}
            sx={{ mt: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
          >
            View all
          </Button>
        </Paper>

        {/* Worst performing / Most deteriorated */}
        <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: '#ef5350' }} />
              <Typography variant="body2" fontWeight={600}>{buildingMode === 'clusters' ? 'Worst Clusters' : 'Worst Buildings'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: colors.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', border: `1px solid ${colors.borderTertiary}` }}>
              <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: rightListMode === 'worst' ? 'white' : 'transparent', color: rightListMode === 'worst' ? 'text.primary' : 'text.secondary', boxShadow: rightListMode === 'worst' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }} onClick={() => setRightListMode('worst')}>Worst Performing</Box>
              <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: rightListMode === 'deteriorated' ? 'white' : 'transparent', color: rightListMode === 'deteriorated' ? 'text.primary' : 'text.secondary', boxShadow: rightListMode === 'deteriorated' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }} onClick={() => setRightListMode('deteriorated')}>Most Deteriorated</Box>
            </Box>
          </Box>
          {(buildingMode === 'clusters'
            ? (rightListMode === 'worst' ? clusterSortedWorst : clusterSortedMostDeteriorated)
            : (rightListMode === 'worst' ? buildingLists.sortedWorst : buildingLists.sortedMostDeteriorated)
          ).map((b, i) => {
            const score = 'adjustedScore' in b ? b.adjustedScore : (b as Building).metrics.tickets.green;
            const trend = 'adjustedTrend' in b ? b.adjustedTrend : (b as Building).trends.tickets;
            const showTrend = rightListMode === 'deteriorated';
            const barColor = getStatusColor(score, 80, 60);
            return (
              <Box
                key={b.name}
                onClick={() => buildingMode === 'buildings' && 'address' in b ? onBuildingSelect?.(b as Building) : undefined}
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
          <Button
            size="small"
            onClick={() => onViewAllBuildings?.('Worst to Best')}
            sx={{ mt: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
          >
            View all
          </Button>
        </Paper>

        {/* KPI Score over time */}
        <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, display: 'flex', flexDirection: 'column' }}>
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

          <Box sx={{ flex: 1, minHeight: 340 }}>
            <LineChart
              xAxis={[{
                data: MONTHS,
                scaleType: 'point',
                tickLabelStyle: { fontSize: 10, fill: '#888', fontWeight: 500 },
              }]}
              yAxis={[{
                min: yRange.min,
                max: yRange.max,
                tickLabelStyle: { fontSize: 10, fill: '#888', fontWeight: 500 },
                valueFormatter: (v: number | null) => `${v}%`,
              }]}
              series={chartSeries.map(s => ({
                data: s.data,
                label: s.label,
                color: colors.brand,
                curve: 'catmullRom' as const,
                showMark: false,
                area: showThresholds,
              }))}
              height={340}
              margin={{ top: 8, right: 8, bottom: 28, left: 10 }}
              grid={{ horizontal: true }}
              hideLegend
              sx={{
                '& .MuiLineElement-root': {
                  strokeWidth: 2.5,
                  strokeLinecap: 'round',
                  strokeDasharray: 'none !important',
                },
                [`& .${lineClasses.area}`]: {
                  fill: showThresholds ? 'url(#threshold-gradient-tickets)' : undefined,
                  filter: 'none',
                  opacity: showThresholds ? 0.2 : 0.08,
                },
                '& .MuiChartsGrid-line': {
                  stroke: '#e8e8e8',
                  strokeWidth: 1,
                },
                '& .MuiChartsAxis-line': {
                  stroke: '#ccc',
                },
                '& .MuiChartsAxis-tick': {
                  stroke: 'transparent',
                },
              }}
            >
              {showThresholds && (() => {
                const good = activeThresholdZones.find(z => z.label === 'Good');
                const moderate = activeThresholdZones.find(z => z.label === 'Moderate');
                const goodAbove = good?.min ?? 80;
                const modAbove = moderate?.min ?? 60;
                return (
                  <>
                    <ThresholdGradient goodAbove={goodAbove} moderateAbove={modAbove} id="threshold-gradient-tickets" />
                    <ChartsReferenceLine
                      y={goodAbove}
                      lineStyle={{ stroke: '#4caf50', strokeWidth: 1.5, strokeDasharray: '6 4', opacity: 0.7 }}
                    />
                    <ChartsReferenceLine
                      y={modAbove}
                      lineStyle={{ stroke: '#f44336', strokeWidth: 1.5, strokeDasharray: '6 4', opacity: 0.7 }}
                    />
                  </>
                );
              })()}
            </LineChart>
          </Box>

          {showThresholds && (
            <Box sx={{ display: 'flex', gap: 2.5, mt: 0.5, justifyContent: 'center' }}>
              {activeThresholdZones.map(zone => (
                <Box key={zone.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: zone.color.replace('0.10', '0.5').replace('0.08', '0.5') }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>{zone.label} ({zone.min}–{zone.max}%)</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>

      {/* ═══ SECTION 3: Tickets Overview ═══ */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem', mb: 1.5 }}>
          Tickets Overview
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 7fr', gap: 2 }}>
          {/* Card 1: Status distribution donut */}
          <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Status Overview</Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <PieChart
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

          {/* Card 2: Active tickets list */}
          <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" fontWeight={600}>Active Tickets</Typography>
              <Button
                size="small"
                endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.7rem', minWidth: 0 }}
              >
                View all
              </Button>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', maxHeight: 320, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {ACTIVE_TICKETS.filter(t => ACTIVE_STATUSES.includes(t.status)).map(t => (
                <Box
                  key={t.id}
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
                        {t.id}
                      </Typography>
                      <Typography variant="body2" fontWeight={500} noWrap sx={{ fontSize: '0.8rem', color: 'text.primary' }}>
                        {t.title}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnOutlinedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>{t.building}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>{t.createdDate}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ReceiptLongOutlinedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>{t.werkbon}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TagOutlinedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>{t.referentie}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonOutlineOutlinedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>{t.assignee}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Chip
                    icon={t.category === 'Storing'
                      ? <ErrorOutlineIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                      : <SupportAgentOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />}
                    label={t.category}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 500,
                      bgcolor: 'action.hover',
                      color: 'text.secondary',
                      '& .MuiChip-label': { px: 0.5 },
                      '& .MuiChip-icon': { ml: 0.5, mr: 0 },
                      flexShrink: 0,
                    }}
                  />
                  <Chip
                    label={t.status}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      bgcolor: `${getTicketStatusColor(t.status)}14`,
                      color: getTicketStatusColor(t.status),
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
      </Box>
    </Box>
  );
}
