'use client';

import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Avatar from '@mui/material/Avatar';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import { LineChart, lineClasses } from '@mui/x-charts/LineChart';
import { useThemeMode } from '@/theme-mode-context';
import { HorizontalThresholdGradient, InteractiveThresholdLine, ChartHoverOverlay } from '@/components/KpiChartComponents';
import Button from '@mui/material/Button';
import { buildings, Building } from '@/data/buildings';
import StackedImages from '@/components/StackedImages';
import { PerformanceGrid, GridCard } from '@/components/performance';

// ── Helpers ──

function getStatusColor(score: number, goodAbove: number, moderateAbove: number): string {
  if (score >= goodAbove) return '#4caf50';
  if (score >= moderateAbove) return '#ff9800';
  return '#f44336';
}

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

// ── Building score helpers (overall = all 7 KPIs) ──

function getAvgOverallScore(b: Building): number {
  return Math.round(
    (b.metrics.sustainability.green + b.metrics.comfort.green + b.metrics.asset_monitoring.green + b.metrics.compliance.green +
     b.metrics.tickets.green + b.metrics.quotations.green + b.metrics.maintenance.green) / 7
  );
}

function getAvgOverallTrend(b: Building): number {
  return Math.round(
    (b.trends.sustainability + b.trends.comfort + b.trends.asset_monitoring + b.trends.compliance +
     b.trends.tickets + b.trends.quotations + b.trends.maintenance) / 7 * 10
  ) / 10;
}

const sortedBest = [...buildings].sort((a, b) => getAvgOverallScore(b) - getAvgOverallScore(a)).slice(0, 7);
const sortedMostImproved = [...buildings].sort((a, b) => getAvgOverallTrend(b) - getAvgOverallTrend(a)).slice(0, 7);
const sortedWorst = [...buildings].sort((a, b) => getAvgOverallScore(a) - getAvgOverallScore(b)).slice(0, 7);
const sortedMostDeteriorated = [...buildings].sort((a, b) => getAvgOverallTrend(a) - getAvgOverallTrend(b)).slice(0, 7);

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
    score: Math.round(blds.reduce((s, b) => s + getAvgOverallScore(b), 0) / blds.length),
    trend: Math.round(blds.reduce((s, b) => s + getAvgOverallTrend(b), 0) / blds.length * 10) / 10,
  }));
})();

const clusterSortedBest = [...clusterEntries].sort((a, b) => b.score - a.score);
const clusterSortedWorst = [...clusterEntries].sort((a, b) => a.score - b.score);
const clusterSortedMostImproved = [...clusterEntries].sort((a, b) => b.trend - a.trend);
const clusterSortedMostDeteriorated = [...clusterEntries].sort((a, b) => a.trend - b.trend);

// ── KPI over time data ──

type ViewMode = 'themes' | 'operations';

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

// ── Component ──

interface OverallPerformancePageProps {
  themesScore: number;
  themesTrend: number;
  operationsScore: number;
  operationsTrend: number;
  overallScore: number;
  overallTrend: number;
  onBuildingSelect?: (building: Building) => void;
  onViewAllBuildings?: (sort: 'Best to Worst' | 'Worst to Best') => void;
  buildingMode?: 'buildings' | 'clusters';
}

export default function OverallPerformancePage({
  themesScore, themesTrend, operationsScore, operationsTrend,
  onBuildingSelect, onViewAllBuildings, buildingMode = 'buildings',
}: OverallPerformancePageProps) {
  const { themeColors: c } = useThemeMode();
  const [chartView, setChartView] = useState<ViewMode>('themes');
  const [leftListMode, setLeftListMode] = useState<'best' | 'improved'>('best');
  const [rightListMode, setRightListMode] = useState<'worst' | 'deteriorated'>('worst');

  const themesSeries = useMemo(() => ({
    label: 'Theme KPIs',
    color: c.brand,
    data: generateKpiTimeSeries('themes_overall', themesScore),
    goodAbove: 75,
    moderateAbove: 55,
  }), [themesScore]);

  const operationsSeries = useMemo(() => ({
    label: 'Operational KPIs',
    color: '#ff9800',
    data: generateKpiTimeSeries('operations_overall', operationsScore),
    goodAbove: 75,
    moderateAbove: 55,
  }), [operationsScore]);

  const chartSeries = useMemo(() => {
    switch (chartView) {
      case 'themes':
        return [themesSeries];
      case 'operations':
        return [operationsSeries];
    }
  }, [chartView, themesSeries, operationsSeries]);

  const activeThresholdZones = useMemo(() => {
    const s = chartView === 'themes' ? themesSeries : operationsSeries;
    return buildThresholdZones(s.goodAbove, s.moderateAbove);
  }, [chartView, themesSeries, operationsSeries]);

  const yRange = useMemo(() => {
    const allValues = chartSeries.flatMap(s => s.data);
    const dataMin = Math.min(...allValues);
    const modAbove = activeThresholdZones.find(z => z.label === 'Moderate')?.min ?? 55;
    const relevantMin = Math.min(dataMin, modAbove);
    const yMin = Math.max(0, Math.floor((relevantMin - 10) / 10) * 10);
    return { min: yMin, max: 100 };
  }, [chartSeries, activeThresholdZones]);

  const menuItems: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: 'themes', label: 'Theme KPIs', icon: <StyleOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'operations', label: 'Operational KPIs', icon: <EngineeringOutlinedIcon sx={{ fontSize: 16 }} /> },
  ];

  // Score+trend display helper
  const ScoreTrend = ({ score, trend }: { score: number; trend: number }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>
        {score}%
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: trend >= 0 ? 'success.main' : 'error.main' }}>
        {trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
          {Math.abs(trend)}%
        </Typography>
      </Box>
    </Box>
  );

  // Toggle button helper
  const ToggleButton = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
    <Box
      sx={{
        px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px',
        cursor: 'pointer', transition: 'all 0.15s',
        bgcolor: active ? c.bgPrimary : 'transparent',
        color: active ? 'text.primary' : 'text.secondary',
        boxShadow: active ? c.shadow : 'none',
      }}
      onClick={onClick}
    />
  );

  // Building list renderer
  const renderBuildingList = (
    items: (Building | ClusterEntry)[],
    showTrend: boolean,
  ) => items.map((b, i) => {
    const score = 'metrics' in b ? getAvgOverallScore(b as Building) : (b as ClusterEntry).score;
    const trend = 'trends' in b ? getAvgOverallTrend(b as Building) : (b as ClusterEntry).trend;
    const barColor = getStatusColor(score, 75, 55);
    return (
      <Box
        key={b.name}
        onClick={() => buildingMode === 'buildings' && 'metrics' in b ? onBuildingSelect?.(b as Building) : undefined}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: 1, mx: -1,
          borderRadius: 0.5, cursor: buildingMode === 'buildings' ? 'pointer' : 'default',
          transition: 'background-color 0.15s ease',
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
          <Box sx={{ width: '100%', height: 4, bgcolor: c.bgSecondaryHover, borderRadius: 2 }}>
            <Box sx={{ width: `${score}%`, height: '100%', bgcolor: barColor, borderRadius: 2, transition: 'width 0.5s ease' }} />
          </Box>
        </Box>
      </Box>
    );
  });

  return (
    <PerformanceGrid>
      {/* ═══ Theme KPIs Score Card ═══ */}
      <GridCard
        size="md"
        icon={<StyleOutlinedIcon />}
        title="Theme KPIs"
        headerRight={<ScoreTrend score={themesScore} trend={themesTrend} />}
      >
        <Box />
      </GridCard>

      {/* ═══ Operational KPIs Score Card ═══ */}
      <GridCard
        size="md"
        icon={<EngineeringOutlinedIcon />}
        title="Operational KPIs"
        headerRight={<ScoreTrend score={operationsScore} trend={operationsTrend} />}
      >
        <Box />
      </GridCard>

      {/* ═══ Top Buildings ═══ */}
      <GridCard
        size="sm"
        icon={<EmojiEventsOutlinedIcon sx={{ color: '#66bb6a' }} />}
        title={buildingMode === 'clusters' ? 'Top Clusters' : 'Top Buildings'}
        headerRight={
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: c.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', border: `1px solid ${c.borderTertiary}` }}>
            <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: leftListMode === 'best' ? c.bgPrimary : 'transparent', color: leftListMode === 'best' ? 'text.primary' : 'text.secondary', boxShadow: leftListMode === 'best' ? c.shadow : 'none' }} onClick={() => setLeftListMode('best')}>Top</Box>
            <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: leftListMode === 'improved' ? c.bgPrimary : 'transparent', color: leftListMode === 'improved' ? 'text.primary' : 'text.secondary', boxShadow: leftListMode === 'improved' ? c.shadow : 'none' }} onClick={() => setLeftListMode('improved')}>Improved</Box>
          </Box>
        }
      >
        {renderBuildingList(
          buildingMode === 'clusters'
            ? (leftListMode === 'best' ? clusterSortedBest : clusterSortedMostImproved)
            : (leftListMode === 'best' ? sortedBest : sortedMostImproved),
          leftListMode === 'improved',
        )}
        <Button size="small" onClick={() => onViewAllBuildings?.('Best to Worst')} sx={{ mt: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>View all</Button>
      </GridCard>

      {/* ═══ Worst Buildings ═══ */}
      <GridCard
        size="sm"
        icon={<WarningAmberOutlinedIcon sx={{ color: '#ef5350' }} />}
        title={buildingMode === 'clusters' ? 'Worst Clusters' : 'Worst Buildings'}
        headerRight={
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: c.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', border: `1px solid ${c.borderTertiary}` }}>
            <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: rightListMode === 'worst' ? c.bgPrimary : 'transparent', color: rightListMode === 'worst' ? 'text.primary' : 'text.secondary', boxShadow: rightListMode === 'worst' ? c.shadow : 'none' }} onClick={() => setRightListMode('worst')}>Worst</Box>
            <Box sx={{ px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', bgcolor: rightListMode === 'deteriorated' ? c.bgPrimary : 'transparent', color: rightListMode === 'deteriorated' ? 'text.primary' : 'text.secondary', boxShadow: rightListMode === 'deteriorated' ? c.shadow : 'none' }} onClick={() => setRightListMode('deteriorated')}>Dropping</Box>
          </Box>
        }
      >
        {renderBuildingList(
          buildingMode === 'clusters'
            ? (rightListMode === 'worst' ? clusterSortedWorst : clusterSortedMostDeteriorated)
            : (rightListMode === 'worst' ? sortedWorst : sortedMostDeteriorated),
          rightListMode === 'deteriorated',
        )}
        <Button size="small" onClick={() => onViewAllBuildings?.('Worst to Best')} sx={{ mt: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>View all</Button>
      </GridCard>

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
                  <Box sx={{ display: 'flex', color: isActive ? c.brand : 'text.disabled', transition: 'color 0.15s ease' }}>{item.icon}</Box>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: isActive ? 600 : 400, color: isActive ? c.brand : 'text.secondary', transition: 'all 0.15s ease' }}>{item.label}</Typography>
                </Box>
              );
            })}
          </Box>
        }
      >
        {(() => {
          const currentData = chartSeries[0].data;
          const goodAbove = activeThresholdZones.find(z => z.label === 'Good')?.min ?? 75;
          const modAbove = activeThresholdZones.find(z => z.label === 'Moderate')?.min ?? 55;
          const gradientId = `threshold-gradient-sub-${chartView}`;
          const lineGradientId = `threshold-gradient-sub-line-${chartView}`;
          return (
            <Box sx={{ flex: 1, minHeight: 370 }}>
              <LineChart data-annotation-id="overallperformancepage-grafiek"
                xAxis={[{ data: MONTHS, scaleType: 'point', tickLabelStyle: { fontSize: 10, fill: c.chartAxisText, fontWeight: 500 } }]}
                yAxis={[{ min: yRange.min, max: yRange.max, tickLabelStyle: { fontSize: 10, fill: c.chartAxisText, fontWeight: 500 }, valueFormatter: (v: number | null) => `${v}%` }]}
                series={chartSeries.map(s => ({ data: s.data, label: s.label, color: s.color, curve: 'catmullRom' as const, showMark: false, area: true }))}
                height={370}
                margin={{ top: 48, right: 50, bottom: 28, left: 50 }}
                grid={{ horizontal: true }}
                hideLegend
                slotProps={{ tooltip: { trigger: 'none' } }}
                axisHighlight={{ x: 'none', y: 'none' }}
                sx={{
                  '& .MuiLineElement-root': { stroke: `url(#${lineGradientId})`, strokeWidth: 1.5, strokeLinecap: 'round', strokeDasharray: 'none !important' },
                  [`& .${lineClasses.area}`]: { fill: `url(#${gradientId})`, filter: 'none', opacity: 0.15 },
                  '& .MuiChartsGrid-line': { stroke: c.chartGridLine, strokeWidth: 1 },
                  '& .MuiChartsAxis-line': { stroke: 'transparent' },
                  '& .MuiChartsAxis-tick': { stroke: 'transparent' },
                }}
              >
                <HorizontalThresholdGradient data={currentData} goodAbove={goodAbove} moderateAbove={modAbove} id={gradientId} />
                <HorizontalThresholdGradient data={currentData} goodAbove={goodAbove} moderateAbove={modAbove} id={lineGradientId} goodColor="#43a047" moderateColor="#ef6c00" poorColor="#c62828" />
                <InteractiveThresholdLine y={goodAbove} label={`Good: ${goodAbove}–100%`} />
                <InteractiveThresholdLine y={modAbove} label={`Moderate: ${modAbove}–${goodAbove}%`} />
                <ChartHoverOverlay
                  data={currentData}
                  labels={MONTHS}
                  getColor={(v) => v >= goodAbove ? '#66bb6a' : v >= modAbove ? '#ffa726' : '#ef5350'}
                />
              </LineChart>
            </Box>
          );
        })()}
      </GridCard>
    </PerformanceGrid>
  );
}
