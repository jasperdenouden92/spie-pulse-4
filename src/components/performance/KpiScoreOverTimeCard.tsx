'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
  menuVariant?: 'inline' | 'dropdown';
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
  menuVariant = 'inline',
}: KpiScoreOverTimeCardProps) {
  const { themeColors: c } = useThemeMode();
  const [dropdownAnchor, setDropdownAnchor] = useState<HTMLElement | null>(null);

  const areaGradientId = `${gradientId}-area`;
  const lineGradientId = `${gradientId}-line`;
  const currentData = chartSeries[0].data;

  const activeItem = menuItems.find(i => i.key === activeView);

  const headerRight = menuVariant === 'dropdown' ? (
    <>
      <Box
        onClick={(e) => setDropdownAnchor(e.currentTarget)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 0.75,
          height: 30, borderRadius: '6px',
          border: '1px solid', borderColor: c.borderSecondary,
          bgcolor: c.bgPrimary, px: 1.25,
          cursor: 'pointer',
          '&:hover': { borderColor: c.borderSecondary },
          transition: 'border-color 0.15s ease',
        }}
      >
        {activeItem && (
          <Box sx={{ display: 'flex', color: c.brand, '& .MuiSvgIcon-root': { fontSize: 14 } }}>
            {activeItem.icon}
          </Box>
        )}
        <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap' }}>
          {activeItem?.label}
        </Typography>
        <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.secondary', ml: 0.25 }} />
      </Box>
      <Menu
        anchorEl={dropdownAnchor}
        open={Boolean(dropdownAnchor)}
        onClose={() => setDropdownAnchor(null)}
        slotProps={{ paper: { sx: { borderRadius: '8px', mt: 0.5, minWidth: 200 } } }}
      >
        {menuItems.map(item => (
          <MenuItem
            key={item.key}
            selected={activeView === item.key}
            onClick={() => { onViewChange(item.key); setDropdownAnchor(null); }}
          >
            <ListItemIcon sx={{ color: activeView === item.key ? c.brand : 'text.secondary', '& .MuiSvgIcon-root': { fontSize: 18 } }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: activeView === item.key ? 600 : 400 }}>
              {item.label}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  ) : (
    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
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
  );

  return (
    <GridCard
      size="md"
      icon={<ShowChartOutlinedIcon sx={{ color: c.brand }} />}
      title="KPI Score Over Time"
      headerRight={headerRight}
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
