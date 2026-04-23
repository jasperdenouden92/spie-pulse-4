'use client';

import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useLanguage } from '@/i18n';
import type { Building } from '@/data/buildings';
import { TopicCardsGrid, KpiScoreOverTimeCard } from '@/components/performance';
import type { ViewMenuItem } from '@/components/performance';
import {
  getMetricSpec,
  buildTopicsForMetric,
  generateKpiTimeSeries,
  computeAverageTopicScore,
  type BuildingMetricKey,
} from '@/components/buildingPerformanceMetricConfig';

function getRating(score: number, t: (k: 'performance.good' | 'performance.moderate' | 'performance.poor') => string) {
  if (score >= 80) return { label: t('performance.good'), color: '#4caf50' };
  if (score >= 60) return { label: t('performance.moderate'), color: '#ff9800' };
  return { label: t('performance.poor'), color: '#f44336' };
}

interface BuildingPerformanceDetailProps {
  building: Building;
  metricKey: BuildingMetricKey;
  onBack: () => void;
}

export default function BuildingPerformanceDetail({ building, metricKey, onBack }: BuildingPerformanceDetailProps) {
  const { t } = useLanguage();

  const spec = getMetricSpec(metricKey);
  const baseScore = building.metrics[metricKey].green;
  const score = useMemo(() => computeAverageTopicScore(metricKey, baseScore), [metricKey, baseScore]);
  const trend = building.trends[metricKey];
  const rating = getRating(score, t);

  const topics = useMemo(
    () => buildTopicsForMetric(metricKey, building.id, baseScore, t),
    [metricKey, building.id, baseScore, t],
  );

  const [chartView, setChartView] = useState<string>('theme');

  const themeSeries = useMemo(() => ({
    label: t(spec.kpiLabelKey),
    data: generateKpiTimeSeries(`${building.id}-${metricKey}-theme`, score),
  }), [spec.kpiLabelKey, building.id, metricKey, score, t]);

  const topicSeriesByKey = useMemo(() => {
    const map: Record<string, { label: string; data: number[] }> = {};
    for (const topic of topics) {
      map[topic.key] = {
        label: topic.label,
        data: generateKpiTimeSeries(`${building.id}-${metricKey}-${topic.key}`, topic.score),
      };
    }
    return map;
  }, [topics, building.id, metricKey]);

  const chartSeries = useMemo(() => {
    if (chartView === 'theme') return [themeSeries];
    const topic = topicSeriesByKey[chartView];
    return topic ? [topic] : [themeSeries];
  }, [chartView, themeSeries, topicSeriesByKey]);

  const activeThresholds = useMemo(() => {
    if (chartView === 'theme') {
      return { goodAbove: spec.themeGoodAbove, moderateAbove: spec.themeModerateAbove };
    }
    const topic = topics.find(tp => tp.key === chartView);
    return topic
      ? { goodAbove: topic.goodAbove, moderateAbove: topic.moderateAbove }
      : { goodAbove: spec.themeGoodAbove, moderateAbove: spec.themeModerateAbove };
  }, [chartView, topics, spec.themeGoodAbove, spec.themeModerateAbove]);

  const yRange = useMemo(() => {
    const values = chartSeries.flatMap(s => s.data);
    const dataMin = Math.min(...values);
    const relevantMin = Math.min(dataMin, activeThresholds.moderateAbove);
    const yMin = Math.max(0, Math.floor((relevantMin - 10) / 10) * 10);
    return { min: yMin, max: 100 };
  }, [chartSeries, activeThresholds.moderateAbove]);

  const menuItems: ViewMenuItem[] = useMemo(() => [
    { key: 'theme', label: t(spec.kpiLabelKey), icon: spec.icon },
    ...topics.map(topic => ({ key: topic.key, label: topic.label, icon: topic.icon })),
  ], [spec.kpiLabelKey, spec.icon, topics, t]);

  // Wrap topics into rows of at most 3 to keep tiles legible inside the peek.
  const topicColumns = Math.min(topics.length, 3);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Tooltip title={t('common.back')}>
          <IconButton size="small" onClick={onBack} sx={{ color: 'text.secondary' }}>
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
        <Box sx={{ color: 'text.secondary', display: 'flex', '& .MuiSvgIcon-root': { fontSize: 22 } }}>
          {spec.icon}
        </Box>
        <Typography variant="h6" sx={{ fontFamily: 'var(--font-jost), "Jost", sans-serif', fontWeight: 600 }}>
          {t(spec.titleKey)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ml: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
            {score}%
          </Typography>
          <Chip
            label={rating.label}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 600,
              bgcolor: `${rating.color}18`,
              color: rating.color,
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: trend >= 0 ? 'success.main' : 'error.main', ml: 0.5 }}>
          {trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
            {Math.abs(trend)}%
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TopicCardsGrid topics={topics} columns={topicColumns} />
        <KpiScoreOverTimeCard
          menuItems={menuItems}
          activeView={chartView}
          onViewChange={setChartView}
          chartSeries={chartSeries}
          showThresholds
          goodAbove={activeThresholds.goodAbove}
          moderateAbove={activeThresholds.moderateAbove}
          yRange={yRange}
          gradientId={`bldg-perf-${building.id}-${metricKey}`}
          menuVariant="dropdown"
        />
      </Box>
    </Box>
  );
}
