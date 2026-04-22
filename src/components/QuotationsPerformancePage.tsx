'use client';

import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import MuiButton from '@mui/material/Button';
import { PerformanceGrid, GridCard, PerformanceIndicatorsCard, BuildingRankingCard, KpiScoreOverTimeCard, toRanked, StatusOverviewCard } from '@/components/performance';
import type { StatusCount } from '@/components/performance';
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
import { LineChart, lineClasses } from '@mui/x-charts/LineChart';
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine';
import { useDrawingArea, useYScale } from '@mui/x-charts/hooks';
import { useThemeMode } from '@/theme-mode-context';
import { HorizontalThresholdGradient, InteractiveThresholdLine, ChartHoverOverlay } from '@/components/KpiChartComponents';
import { buildings, Building } from '@/data/buildings';
import StackedImages from '@/components/StackedImages';
import { useLanguage, type TranslationKey } from '@/i18n';

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
  { key: 'run_time', labelKey: 'topic.runTime', icon: <TimerOutlinedIcon sx={{ fontSize: 20 }} />, offset: 5, trend: 3, chartColor: '#2196f3', goodAbove: 80, moderateAbove: 60 },
  { key: 'response_time', labelKey: 'topic.responseTime', icon: <QuickreplyOutlinedIcon sx={{ fontSize: 20 }} />, offset: -8, trend: -3, chartColor: '#ff9800', goodAbove: 75, moderateAbove: 55 },
  { key: 'approval_time', labelKey: 'topic.approvalTime', icon: <ThumbUpAltOutlinedIcon sx={{ fontSize: 20 }} />, offset: 3, trend: 6, chartColor: '#9c27b0', goodAbove: 80, moderateAbove: 60 },
];

function buildTopics(themeScore: number, t: (key: TranslationKey) => string): TopicDef[] {
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
      label: t(d.labelKey as TranslationKey),
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

const STATUS_COUNTS: StatusCount[] = [
  { status: 'Pending', count: 8, color: '#ff9800' },
  { status: 'Open', count: 5, color: '#2196f3' },
  { status: 'Received', count: 7, color: '#4caf50' },
  { status: 'Assigned', count: 6, color: '#7c4dff' },
  { status: 'Rejected', count: 3, color: '#ef5350' },
];

const ACTIVE_STATUSES = ['Pending', 'Open', 'Received', 'Assigned'];
const ACTION_REQUIRED_STATUSES = ['Open', 'Assigned'];

interface QuotationItem {
  id: string;
  title: string;
  building: string;
  contactPerson: string;
  status: string;
  createdDate: string;
  validUntil: string;
  amount: number;
}

const ACTIVE_QUOTATIONS: QuotationItem[] = [
  { id: 'Q044901071', title: 'Test automation update', building: 'De Efteling', contactPerson: 'H.C.M. Mond', status: 'Open', createdDate: '02-12-2025', validUntil: '03-01-2026', amount: 11550 },
  { id: 'Q045900006', title: 'HVAC system overhaul', building: 'De Efteling', contactPerson: 'M. Neuten', status: 'Pending', createdDate: '12-06-2025', validUntil: '22-01-2026', amount: 45000 },
  { id: 'Q044901072', title: 'Electrical panel upgrade', building: 'De Efteling', contactPerson: 'B. Sevenge', status: 'Pending', createdDate: '03-06-2024', validUntil: '04-08-2024', amount: 18200 },
  { id: 'Q044901070', title: 'Fire safety compliance', building: 'De Efteling', contactPerson: 'R.R.H.M. Zij', status: 'Open', createdDate: '16-07-2024', validUntil: '15-08-2024', amount: 10000 },
  { id: 'Q044901066', title: 'Plumbing maintenance', building: 'De Efteling', contactPerson: 'B. Sevenge', status: 'Pending', createdDate: '09-07-2024', validUntil: '08-08-2024', amount: 3200 },
  { id: 'Q044901067', title: 'Security system upgrade', building: 'De Efteling', contactPerson: 'B. Sevenge', status: 'Assigned', createdDate: '09-07-2024', validUntil: '08-08-2024', amount: 8500 },
  { id: 'Q044901064', title: 'LED lighting replacement', building: 'De Efteling', contactPerson: 'M. Neuten', status: 'Pending', createdDate: '05-07-2024', validUntil: '04-08-2024', amount: 24000 },
  { id: 'Q044901058', title: 'Elevator maintenance contract', building: 'Rijksmuseum', contactPerson: 'H.C.M. Mond', status: 'Assigned', createdDate: '01-07-2024', validUntil: '30-07-2024', amount: 7600 },
  { id: 'Q044901052', title: 'Roof inspection & repair', building: 'Rijksmuseum', contactPerson: 'R.R.H.M. Zij', status: 'Received', createdDate: '25-06-2024', validUntil: '25-07-2024', amount: 15200 },
  { id: 'Q044901049', title: 'Water heater replacement', building: 'Rijksmuseum', contactPerson: 'B. Sevenge', status: 'Pending', createdDate: '20-06-2024', validUntil: '20-07-2024', amount: 4800 },
  { id: 'Q044901045', title: 'Air quality monitoring install', building: 'Gemeentehuis Meierijstad', contactPerson: 'M. Neuten', status: 'Assigned', createdDate: '15-06-2024', validUntil: '15-07-2024', amount: 12800 },
  { id: 'Q044901041', title: 'Parking garage ventilation', building: 'Gemeentehuis Meierijstad', contactPerson: 'H.C.M. Mond', status: 'Received', createdDate: '10-06-2024', validUntil: '10-07-2024', amount: 32000 },
  { id: 'Q044901038', title: 'Emergency generator service', building: 'Gemeentehuis Meierijstad', contactPerson: 'R.R.H.M. Zij', status: 'Pending', createdDate: '05-06-2024', validUntil: '05-07-2024', amount: 9400 },
  { id: 'Q044901035', title: 'Window sealing renovation', building: 'Jaarbeurs Utrecht', contactPerson: 'B. Sevenge', status: 'Received', createdDate: '01-06-2024', validUntil: '01-07-2024', amount: 19500 },
  { id: 'Q044901031', title: 'Solar panel maintenance', building: 'Jaarbeurs Utrecht', contactPerson: 'M. Neuten', status: 'Assigned', createdDate: '28-05-2024', validUntil: '28-06-2024', amount: 6200 },
  { id: 'Q044901028', title: 'Insulation upgrade floors 3-5', building: 'Jaarbeurs Utrecht', contactPerson: 'H.C.M. Mond', status: 'Received', createdDate: '22-05-2024', validUntil: '22-06-2024', amount: 28000 },
  { id: 'Q044901024', title: 'Sprinkler system test', building: 'TU Eindhoven', contactPerson: 'R.R.H.M. Zij', status: 'Received', createdDate: '18-05-2024', validUntil: '18-06-2024', amount: 3400 },
  { id: 'Q044901020', title: 'BMS controller replacement', building: 'TU Eindhoven', contactPerson: 'B. Sevenge', status: 'Assigned', createdDate: '14-05-2024', validUntil: '14-06-2024', amount: 14200 },
  { id: 'Q044901017', title: 'Facade cleaning contract', building: 'TU Eindhoven', contactPerson: 'M. Neuten', status: 'Received', createdDate: '10-05-2024', validUntil: '10-06-2024', amount: 8900 },
  { id: 'Q044901013', title: 'Access control modernization', building: 'TU Eindhoven', contactPerson: 'H.C.M. Mond', status: 'Received', createdDate: '06-05-2024', validUntil: '06-06-2024', amount: 21500 },
];

function formatAmount(amount: number) {
  return `€\u202f${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatTableDate(ddmmyyyy: string): string {
  const [d, m, y] = ddmmyyyy.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Active Quotations Table ──

function ActiveQuotationsTable({ themeColors: c, items, statusCounts, onViewAll }: {
  themeColors: ReturnType<typeof useThemeMode>['themeColors'];
  items: QuotationItem[];
  statusCounts: StatusCount[];
  onViewAll?: (actionRequired: boolean) => void;
}) {
  const { t } = useLanguage();
  const [actionFilter, setActionFilter] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  function getStatusColor(status: string): string {
    return statusCounts.find(s => s.status === status)?.color ?? '#888';
  }

  const filtered = items.filter(item =>
    actionFilter ? ACTION_REQUIRED_STATUSES.includes(item.status) : ACTIVE_STATUSES.includes(item.status)
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <GridCard
      size="lg"
      title={t('performance.activeQuotations')}
      headerRight={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: c.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', border: `1px solid ${c.borderTertiary}` }}>
            <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: !actionFilter ? c.bgPrimary : 'transparent', color: !actionFilter ? 'text.primary' : 'text.secondary', boxShadow: !actionFilter ? c.shadow : 'none' }} onClick={() => { setActionFilter(false); setPage(0); }}>{t('performance.allActive')}</Box>
            <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: actionFilter ? c.bgPrimary : 'transparent', color: actionFilter ? 'text.primary' : 'text.secondary', boxShadow: actionFilter ? c.shadow : 'none' }} onClick={() => { setActionFilter(true); setPage(0); }}>{t('performance.actionRequired')}</Box>
          </Box>
          <MuiButton
            size="small"
            endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.7rem', minWidth: 0 }}
            onClick={() => onViewAll?.(actionFilter)}
          >
            {t('performance.viewAll')}
          </MuiButton>
        </Box>
      }
    >
      <TableContainer>
        <Table sx={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '11%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <TableHead>
            <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
              {[t('operations.quotationNo'), t('operations.titleColumn'), t('common.building'), t('operations.contactPerson'), t('common.status'), t('operations.creationDate'), t('operations.expirationDate')].map(h => (
                <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1 }}>{h}</TableCell>
              ))}
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1, textAlign: 'right' }}>{t('common.amount')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((q) => (
              <TableRow
                key={q.id}
                sx={{ '&:hover': { bgcolor: c.bgPrimaryHover }, cursor: 'pointer' }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                    {q.id}
                  </Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 280 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }} noWrap>
                    {q.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }} noWrap>
                    {q.building}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }} noWrap>
                    {q.contactPerson}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.375, bgcolor: c.bgPrimaryHover, borderRadius: '6px' }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: getStatusColor(q.status), flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap' }}>
                      {q.status}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', color: 'text.secondary' }}>
                    {formatTableDate(q.createdDate)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', color: 'text.secondary' }}>
                    {formatTableDate(q.validUntil)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {formatAmount(q.amount)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">{t('performance.noActiveQuotations')}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Pagination */}
      {filtered.length > rowsPerPage && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', pt: 1.5, gap: 0.5 }}>
          <IconButton size="small" disabled={page === 0} onClick={() => setPage(0)} sx={{ color: 'text.secondary' }}>
            <FirstPageIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton size="small" disabled={page === 0} onClick={() => setPage(p => p - 1)} sx={{ color: 'text.secondary' }}>
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', mx: 1 }}>
            {page * rowsPerPage + 1} – {Math.min((page + 1) * rowsPerPage, filtered.length)} {t('common.of')} {filtered.length}
          </Typography>
          <IconButton size="small" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} sx={{ color: 'text.secondary' }}>
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton size="small" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)} sx={{ color: 'text.secondary' }}>
            <LastPageIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      )}
    </GridCard>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

interface QuotationsPerformancePageProps {
  themeScore?: number;
  themeTrend?: number;
  onNavigateToDashboard?: (dashboardId: string) => void;
  onBuildingSelect?: (building: Building) => void;
  onViewAllBuildings?: (sort: 'Best to Worst' | 'Worst to Best') => void;
  onStatusFilter?: (status: string) => void;
  onViewAllQuotations?: (actionRequired: boolean) => void;
  buildingMode?: 'buildings' | 'clusters';
}

export default function QuotationsPerformancePage({ themeScore = 74, themeTrend = 2, onNavigateToDashboard, onBuildingSelect, onViewAllBuildings, onStatusFilter, onViewAllQuotations, buildingMode = 'buildings' }: QuotationsPerformancePageProps) {
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();
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

  const topics = useMemo(() => buildTopics(themeScore, t), [themeScore, t]);

  const themeSeries = useMemo(() => ({
    label: t('performance.quotationsKpi'),
    color: c.brand,
    data: generateKpiTimeSeries('quotations_theme', themeScore),
  }), [themeScore, t]);

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
    { key: 'theme', label: t('performance.quotationsKpi'), icon: <RequestQuoteOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'run_time', label: t('topic.runTime'), icon: <TimerOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'response_time', label: t('topic.responseTime'), icon: <QuickreplyOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'approval_time', label: t('topic.approvalTime'), icon: <ThumbUpAltOutlinedIcon sx={{ fontSize: 16 }} /> },
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
        title={t('performance.quotationsPerformance')}
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
      <StatusOverviewCard
        statusCounts={STATUS_COUNTS}
        onStatusFilter={onStatusFilter}
      />
      <ActiveQuotationsTable
        themeColors={c}
        items={ACTIVE_QUOTATIONS}
        statusCounts={STATUS_COUNTS}
        onViewAll={onViewAllQuotations}
      />
    </PerformanceGrid>
  );
}
