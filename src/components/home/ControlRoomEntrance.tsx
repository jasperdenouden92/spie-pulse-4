'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import NatureOutlinedIcon from '@mui/icons-material/NatureOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import { LineChart } from '@mui/x-charts/LineChart';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage, type TranslationKey } from '@/i18n';
import KPICard, { type PerformanceRating } from '@/components/KPICard';
import { themeMetrics, operationsMetrics } from '@/data/metrics';

export type HomeVariant = 'A' | 'B' | 'C';

/** i18n keys for the section header label shown above the entrance, per variant. */
export const VARIANT_TITLE_KEYS: Record<HomeVariant, TranslationKey> = {
  A: 'controlRoom.title',
  B: 'home.portfolioPulse',
  C: 'home.latestImpact',
};

// Mirrors `getPerformanceRating` in the Control Room so the home-page KPI cards
// get the same colored trend line and Good/Moderate/Poor chip.
function getPerformanceRating(score: number, t: (k: TranslationKey) => string): PerformanceRating {
  if (score >= 80) return { label: t('performance.good'), color: '#4caf50' };
  if (score >= 60) return { label: t('performance.moderate'), color: '#ff9800' };
  return { label: t('performance.poor'), color: '#f44336' };
}

// ── Variant A: Overall / Theme KPIs / Operational KPIs ───────────

/** Average a set of equal-length sparkline series element-wise. */
function averageSparkline(series: number[][]): number[] {
  if (series.length === 0) return [];
  const len = series[0].length;
  const out: number[] = [];
  for (let i = 0; i < len; i++) {
    let sum = 0;
    for (const s of series) sum += s[i] ?? 0;
    out.push(Math.round(sum / series.length));
  }
  return out;
}

function VariantA({ onOpen }: { onOpen: () => void }) {
  const { t } = useLanguage();

  // Mirror the Control Room's aggregation: Overall = average across all
  // theme + operations metrics (see getOverallTopics / the overall score block
  // in control-room/page.tsx). This guarantees the home card shows the same
  // percentage and trendline the user sees on the Control Room page.
  const allMetrics = [...themeMetrics, ...operationsMetrics];
  const overallScore = Math.round(allMetrics.reduce((acc, m) => acc + m.score, 0) / allMetrics.length);
  const overallTrend = Math.round(allMetrics.reduce((acc, m) => acc + m.trend, 0) / allMetrics.length);
  const overallSparkline = averageSparkline(allMetrics.map(m => m.sparklineData));

  // Theme KPIs aggregate = average across theme metrics (Sustainability, Comfort, Asset Monitoring, Compliance).
  const themeScore = Math.round(themeMetrics.reduce((acc, m) => acc + m.score, 0) / themeMetrics.length);
  const themeTrend = Math.round(themeMetrics.reduce((acc, m) => acc + m.trend, 0) / themeMetrics.length);
  const themeSparkline = averageSparkline(themeMetrics.map(m => m.sparklineData));

  // Operational KPIs aggregate = average across operations metrics (Tickets, Quotations, Maintenance).
  const opsScore = Math.round(operationsMetrics.reduce((acc, m) => acc + m.score, 0) / operationsMetrics.length);
  const opsTrend = Math.round(operationsMetrics.reduce((acc, m) => acc + m.trend, 0) / operationsMetrics.length);
  const opsSparkline = averageSparkline(operationsMetrics.map(m => m.sparklineData));

  const items: Array<{ title: string; score: number; trend: number; sparklineData: number[]; icon: React.ReactNode; onClick: () => void }> = [
    {
      title: t('home.overallScore'),
      score: overallScore,
      trend: overallTrend,
      sparklineData: overallSparkline,
      icon: <SpeedOutlinedIcon />,
      onClick: onOpen,
    },
    {
      title: t('performance.themeKpis'),
      score: themeScore,
      trend: themeTrend,
      sparklineData: themeSparkline,
      icon: <StyleOutlinedIcon />,
      onClick: onOpen,
    },
    {
      title: t('performance.operationalKpis'),
      score: opsScore,
      trend: opsTrend,
      sparklineData: opsSparkline,
      icon: <EngineeringOutlinedIcon />,
      onClick: onOpen,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: 1.5,
      }}
    >
      {items.map(it => (
        <KPICard
          key={it.title}
          title={it.title}
          icon={it.icon}
          score={it.score}
          trend={it.trend}
          sparklineData={it.sparklineData}
          onClick={it.onClick}
          performanceRating={getPerformanceRating(it.score, t)}
        />
      ))}
    </Box>
  );
}

// ── Variant B: KPI score over time ───────────────────────────────

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type VariantBView = 'overall' | 'themes' | 'contract';

// Synthetic 12-month series per view. Each series lands on the current score
// for its view so the chart reads consistently with Variant A's cards and the
// Control Room. Endpoints: Overall≈85 (avg themes+ops), Themes≈86, Ops≈84.
const VARIANT_B_SERIES: Record<VariantBView, number[]> = {
  overall:  [55, 59, 63, 60, 57, 64, 70, 75, 80, 82, 84, 85],
  themes:   [52, 56, 61, 58, 55, 62, 70, 75, 80, 82, 84, 86],
  contract: [54, 58, 62, 59, 56, 63, 69, 74, 79, 81, 83, 84],
};

function VariantB() {
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();
  const [view, setView] = useState<VariantBView>('overall');

  const menuItems: Array<{ key: VariantBView; label: string; icon: React.ReactNode }> = [
    { key: 'overall',  label: t('home.overallScore'),  icon: <SpeedOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'themes',   label: t('performance.themeKpis'), icon: <StyleOutlinedIcon sx={{ fontSize: 16 }} /> },
    { key: 'contract', label: t('home.contractKpis'), icon: <EngineeringOutlinedIcon sx={{ fontSize: 16 }} /> },
  ];

  const data = VARIANT_B_SERIES[view];

  return (
    <Box
      sx={{
        border: `1px solid ${c.cardBorder}`,
        borderRadius: '12px',
        bgcolor: c.bgPrimary,
        boxShadow: c.cardShadow,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        minWidth: 0,
      }}
    >
      {/* Segmented control */}
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {menuItems.map(item => {
          const isActive = view === item.key;
          return (
            <Box
              key={item.key}
              onClick={() => setView(item.key)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.75,
                px: 1.25, py: 0.5, borderRadius: 1,
                cursor: 'pointer', userSelect: 'none',
                bgcolor: isActive ? `${c.brand}14` : 'transparent',
                transition: 'background-color 0.15s ease',
                '&:hover': { bgcolor: isActive ? `${c.brand}20` : 'action.hover' },
              }}
            >
              <Box sx={{ display: 'flex', color: isActive ? c.brand : 'text.disabled' }}>
                {item.icon}
              </Box>
              <Typography variant="body2" sx={{
                fontSize: '0.75rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? c.brand : 'text.secondary',
                whiteSpace: 'nowrap',
              }}>
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Chart */}
      <Box sx={{ width: '100%', minWidth: 0 }}>
        <LineChart
          xAxis={[{
            data: MONTHS_SHORT,
            scaleType: 'point',
            tickLabelStyle: { fontSize: 10, fill: c.chartAxisText, fontWeight: 500 },
          }]}
          yAxis={[{
            min: 30,
            max: 100,
            tickLabelStyle: { fontSize: 10, fill: c.chartAxisText, fontWeight: 500 },
            valueFormatter: (v: number | null) => `${v}%`,
          }]}
          series={[{ data, label: t('controlRoom.kpiScoreOverTime'), color: c.brand, curve: 'catmullRom' as const, showMark: false }]}
          height={220}
          margin={{ top: 8, right: 12, bottom: 24, left: 36 }}
          grid={{ horizontal: true }}
          hideLegend
          slotProps={{ tooltip: { trigger: 'none' } }}
          axisHighlight={{ x: 'none', y: 'none' }}
          sx={{
            '& .MuiLineElement-root': { strokeWidth: 1.75, strokeLinecap: 'round' },
            '& .MuiChartsGrid-line': { stroke: c.chartGridLine, strokeWidth: 1 },
            '& .MuiChartsAxis-line': { stroke: 'transparent' },
            '& .MuiChartsAxis-tick': { stroke: 'transparent' },
          }}
        />
      </Box>
    </Box>
  );
}

// ── Variant C: Latest impact stories ─────────────────────────────

type ImpactSentiment = 'positive' | 'moderate' | 'negative';

interface ImpactItem {
  kpiKey: TranslationKey;
  icon: React.ReactNode;
  /** Bolded phrase — the "what happened" part that carries the story. */
  emphasisKey: TranslationKey;
  /** Rest of the sentence, continues straight after `emphasis` with a leading space if needed. */
  contextKey: TranslationKey;
  sentiment: ImpactSentiment;
  metricKey: string;
  /** Drop the user into a specific Control Room tab (e.g. `performance`). */
  tab?: string;
  /** Preselect a date range (values from URL_DEFAULTS, e.g. `This Year`, `Last Month`). */
  dateRange?: string;
}

const SENTIMENT_COLORS: Record<ImpactSentiment, string> = {
  positive: '#2e7d32',
  moderate: '#f57c00',
  negative: '#c62828',
};

// Hand-authored impact stories. These would be generated by an insight engine
// in production — surface the "so what?" behind the numbers.
const IMPACT_ITEMS: ImpactItem[] = [
  {
    kpiKey: 'metric.sustainability',
    icon: <NatureOutlinedIcon />,
    emphasisKey: 'home.impact.sustainability.emphasis',
    contextKey: 'home.impact.sustainability.context',
    sentiment: 'moderate',
    metricKey: 'sustainability',
    tab: 'performance',
    dateRange: 'This Year',
  },
  {
    kpiKey: 'metric.maintenance',
    icon: <BuildOutlinedIcon />,
    emphasisKey: 'home.impact.maintenanceGrowth.emphasis',
    contextKey: 'home.impact.maintenanceGrowth.context',
    sentiment: 'positive',
    metricKey: 'maintenance',
    tab: 'performance',
    dateRange: 'Last Month',
  },
  {
    kpiKey: 'metric.maintenance',
    icon: <BuildOutlinedIcon />,
    emphasisKey: 'home.impact.buildingsImproved.emphasis',
    contextKey: 'home.impact.buildingsImproved.context',
    sentiment: 'positive',
    metricKey: 'maintenance',
    tab: 'performance',
    dateRange: 'Last Month',
  },
  {
    kpiKey: 'metric.overall',
    icon: <DashboardOutlinedIcon />,
    emphasisKey: 'home.impact.buildingsPerformingGood.emphasis',
    contextKey: 'home.impact.buildingsPerformingGood.context',
    sentiment: 'positive',
    metricKey: 'overall',
    tab: 'performance',
  },
];

function VariantC({ onOpenImpact }: { onOpenImpact: (item: ImpactItem) => void }) {
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 1.5,
      }}
    >
      {IMPACT_ITEMS.map((item, idx) => {
        const color = SENTIMENT_COLORS[item.sentiment];
        return (
          <Box
            key={`${item.kpiKey}-${idx}`}
            onClick={() => onOpenImpact(item)}
            sx={{
              border: `1px solid ${c.cardBorder}`,
              borderRadius: '12px',
              bgcolor: c.bgPrimary,
              boxShadow: c.cardShadow,
              p: 2,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.25,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 20px 0 ${c.shadowMedium}`,
              },
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: `${color}1a`,
                color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                '& .MuiSvgIcon-root': { fontSize: 18 },
              }}
            >
              {item.icon}
            </Box>
            <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {t(item.kpiKey)}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: '0.8125rem', lineHeight: 1.4, color: 'text.primary' }}
              >
                <Box component="span" sx={{ fontWeight: 700 }}>{t(item.emphasisKey)}</Box>
                {t(item.contextKey)}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// ── Public component ─────────────────────────────────────────────

export interface ControlRoomEntranceProps {
  variant: HomeVariant;
}

export default function ControlRoomEntrance({ variant }: ControlRoomEntranceProps) {
  const router = useRouter();
  const onOpen = () => router.push('/control-room');
  const onOpenImpact = (item: ImpactItem) => {
    const qs = new URLSearchParams();
    if (item.metricKey && item.metricKey !== 'overall') qs.set('metric', item.metricKey);
    if (item.tab) qs.set('tab', item.tab);
    if (item.dateRange && item.dateRange !== 'This Month') qs.set('dateRange', item.dateRange);
    const suffix = qs.toString();
    router.push(`/control-room${suffix ? `?${suffix}` : ''}`);
  };

  switch (variant) {
    case 'A': return <VariantA onOpen={onOpen} />;
    case 'B': return <VariantB />;
    case 'C': return <VariantC onOpenImpact={onOpenImpact} />;
  }
}
