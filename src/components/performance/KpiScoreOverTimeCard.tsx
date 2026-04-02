'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import { LineChart, lineClasses } from '@mui/x-charts/LineChart';
import { useThemeMode } from '@/theme-mode-context';
import { HorizontalThresholdGradient, InteractiveThresholdLine, ChartHoverOverlay } from '@/components/KpiChartComponents';
import { GridCard } from '@/components/performance';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface ViewMenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface KpiScoreOverTimeCardProps {
  menuItems: ViewMenuItem[];
  activeView: string;
  onViewChange: (key: string) => void;
  chartSeries: { data: number[]; label: string }[];
  showThresholds: boolean;
  goodAbove: number;
  moderateAbove: number;
  yRange: { min: number; max: number };
  gradientId: string;
  annotationId?: string;
}

export default function KpiScoreOverTimeCard({
  menuItems,
  activeView,
  onViewChange,
  chartSeries,
  showThresholds,
  goodAbove,
  moderateAbove,
  yRange,
  gradientId,
  annotationId,
}: KpiScoreOverTimeCardProps) {
  const { themeColors: c } = useThemeMode();

  const areaGradientId = `${gradientId}-area`;
  const lineGradientId = `${gradientId}-line`;
  const currentData = chartSeries[0].data;

  return (
    <GridCard
      size="md"
      icon={<ShowChartOutlinedIcon sx={{ color: c.brand }} />}
      title="KPI Score Over Time"
      headerRight={
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, flexShrink: 0 }}>
          {menuItems.map(item => {
            const isActive = activeView === item.key;
            return (
              <Box
                key={item.key}
                onClick={() => onViewChange(item.key)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.75,
                  px: 1.5, py: 0.75, borderRadius: 1,
                  cursor: 'pointer', userSelect: 'none',
                  bgcolor: isActive ? `${c.brand}14` : 'transparent',
                  transition: 'all 0.15s ease',
                  '&:hover': { bgcolor: isActive ? `${c.brand}20` : 'action.hover' },
                }}
              >
                <Box sx={{ display: 'flex', color: isActive ? c.brand : 'text.disabled', transition: 'color 0.15s ease' }}>
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
      <Box sx={{ flex: 1, minHeight: 370 }}>
        <LineChart
          {...(annotationId ? { 'data-annotation-id': annotationId } : {})}
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
            [`& .${lineClasses.area}`]: { fill: showThresholds ? `url(#${areaGradientId})` : undefined, filter: 'none', opacity: 0.15 },
            '& .MuiChartsGrid-line': { stroke: c.chartGridLine, strokeWidth: 1 },
            '& .MuiChartsAxis-line': { stroke: 'transparent' },
            '& .MuiChartsAxis-tick': { stroke: 'transparent' },
          }}
        >
          {showThresholds && (
            <>
              <HorizontalThresholdGradient data={currentData} goodAbove={goodAbove} moderateAbove={moderateAbove} id={areaGradientId} />
              <HorizontalThresholdGradient data={currentData} goodAbove={goodAbove} moderateAbove={moderateAbove} id={lineGradientId} goodColor="#43a047" moderateColor="#ef6c00" poorColor="#c62828" />
              <InteractiveThresholdLine y={goodAbove} label={`Good: ${goodAbove}–100%`} />
              <InteractiveThresholdLine y={moderateAbove} label={`Moderate: ${moderateAbove}–${goodAbove}%`} />
            </>
          )}
          {showThresholds && (
            <ChartHoverOverlay
              data={currentData}
              labels={MONTHS}
              getColor={(v) => v >= goodAbove ? '#66bb6a' : v >= moderateAbove ? '#ffa726' : '#ef5350'}
            />
          )}
        </LineChart>
      </Box>
    </GridCard>
  );
}
