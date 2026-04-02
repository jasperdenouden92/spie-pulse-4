import { useThemeMode } from '@/theme-mode-context';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ResponsiveBar } from '@nivo/bar';

interface EnergyUseByBuildingChartProps {
  buildingName?: string;
}

// Mock data
const mockData = [
  {
    category: 'All energy',
    used: 180,
    available: 70,
    usedColor: '#ff9800',
    availableColor: '#ffc107'
  },
  {
    category: 'Electricity',
    used: 150,
    available: 100,
    usedColor: '#ff9800',
    availableColor: '#ffc107'
  },
  {
    category: 'Gas',
    used: 220,
    available: 30,
    usedColor: '#9c27b0',
    availableColor: '#ce93d8'
  }
];

export default function EnergyUseByBuildingChart({ buildingName }: EnergyUseByBuildingChartProps) {
  const { themeColors: c } = useThemeMode();
  const [selectedView, setSelectedView] = useState('Per m²');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: c.bgPrimary, height: 300 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Energy use by building
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: '6px',
            bgcolor: c.bgPrimaryHover,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: c.bgSecondaryHover
            }
          }}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <Typography variant="body2" sx={{ fontSize: '0.813rem', fontWeight: 500 }}>
            {selectedView}
          </Typography>
          <ExpandMoreIcon sx={{ fontSize: 16 }} />
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => { setSelectedView('Per m²'); setAnchorEl(null); }}>Per m²</MenuItem>
          <MenuItem onClick={() => { setSelectedView('Total'); setAnchorEl(null); }}>Total</MenuItem>
        </Menu>
      </Box>

      {/* Chart */}
      <Box sx={{ height: 220 }}>
        <ResponsiveBar
          data={mockData}
          keys={['used', 'available']}
          indexBy="category"
          layout="horizontal"
          margin={{ top: 10, right: 60, bottom: 30, left: 120 }}
          padding={0.4}
          valueScale={{ type: 'linear' }}
          colors={({ id, data }) => {
            const colorKey = `${id}Color` as keyof typeof data;
            return (data as any)[colorKey];
          }}
          borderRadius={4}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
          }}
          enableGridY={false}
          enableLabel={false}
          legends={[]}
          theme={{
            axis: {
              domain: {
                line: {
                  stroke: c.borderSecondary,
                  strokeWidth: 1,
                },
              },
              ticks: {
                text: {
                  fontSize: 11,
                  fill: c.chartAxisText,
                },
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}
