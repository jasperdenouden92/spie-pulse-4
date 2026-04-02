'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { LineChart, lineClasses } from '@mui/x-charts/LineChart';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useThemeMode } from '@/theme-mode-context';
import { HorizontalThresholdGradient, InteractiveThresholdLine, ChartHoverOverlay } from '@/components/KpiChartComponents';
import { GridCard } from '@/components/performance';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface PerformanceChartCardProps {
  icon?: React.ReactNode;
  title: string;
  score: number;
  trend: number;
  data: number[];
  label: string;
  goodAbove: number;
  moderateAbove: number;
  gradientId: string;
  annotationId?: string;
}

export default function PerformanceChartCard({
  icon,
  title,
  score,
  trend,
  data,
  label,
  goodAbove,
  moderateAbove,
  gradientId,
  annotationId,
}: PerformanceChartCardProps) {
  const { themeColors: c } = useThemeMode();
  const isNarrow = useMediaQuery('(max-width:960px)');

  const yMin = Math.max(0, Math.floor((Math.min(...data, moderateAbove) - 10) / 10) * 10);
  const areaGradientId = `${gradientId}-area`;
  const lineGradientId = `${gradientId}-line`;

  const scoreTrend = (
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

  return (
    <GridCard size="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        {icon && (
          <Box sx={{ display: 'flex', color: 'text.secondary', '& .MuiSvgIcon-root': { fontSize: 18 } }}>
            {icon}
          </Box>
        )}
        <Typography variant="body2" fontWeight={600}>
          {title}
        </Typography>
        {scoreTrend}
      </Box>
      <Box sx={{ flex: 1, minHeight: 340 }}>
        <LineChart
          {...(annotationId ? { 'data-annotation-id': annotationId } : {})}
          xAxis={[{ data: MONTHS, scaleType: 'point', tickLabelStyle: { fontSize: 10, fill: c.chartAxisText, fontWeight: 500 } }]}
          yAxis={[{ min: yMin, max: 100, tickLabelStyle: { fontSize: 10, fill: c.chartAxisText, fontWeight: 500 }, valueFormatter: (v: number | null) => `${v}%` }]}
          series={[{ data, label, color: c.brand, curve: 'catmullRom' as const, showMark: false, area: true }]}
          height={370}
          margin={{ top: 48, right: isNarrow ? 16 : 80, bottom: 28, left: isNarrow ? 40 : 80 }}
          grid={{ horizontal: true }}
          hideLegend
          slotProps={{ tooltip: { trigger: 'none' } }}
          axisHighlight={{ x: 'none', y: 'none' }}
          sx={{
            '& .MuiLineElement-root': { stroke: `url(#${lineGradientId})`, strokeWidth: 1.5, strokeLinecap: 'round', strokeDasharray: 'none !important' },
            [`& .${lineClasses.area}`]: { fill: `url(#${areaGradientId})`, filter: 'none', opacity: 0.15 },
            '& .MuiChartsGrid-line': { stroke: c.chartGridLine, strokeWidth: 1 },
            '& .MuiChartsAxis-line': { stroke: 'transparent' },
            '& .MuiChartsAxis-tick': { stroke: 'transparent' },
          }}
        >
          <HorizontalThresholdGradient data={data} goodAbove={goodAbove} moderateAbove={moderateAbove} id={areaGradientId} />
          <HorizontalThresholdGradient data={data} goodAbove={goodAbove} moderateAbove={moderateAbove} id={lineGradientId} goodColor="#43a047" moderateColor="#ef6c00" poorColor="#c62828" />
          <InteractiveThresholdLine y={goodAbove} label={`Good: ${goodAbove}–100%`} />
          <InteractiveThresholdLine y={moderateAbove} label={`Moderate: ${moderateAbove}–${goodAbove}%`} />
          <ChartHoverOverlay
            data={data}
            labels={MONTHS}
            getColor={(v) => v >= goodAbove ? '#66bb6a' : v >= moderateAbove ? '#ffa726' : '#ef5350'}
          />
        </LineChart>
      </Box>
    </GridCard>
  );
}
