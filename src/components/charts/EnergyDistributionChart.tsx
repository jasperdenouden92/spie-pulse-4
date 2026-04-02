import { useThemeMode } from '@/theme-mode-context';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { ResponsivePie } from '@nivo/pie';

interface EnergyDistributionChartProps {
  buildingName?: string;
}

// Mock data
const mockData = [
  {
    id: 'Electricity',
    label: 'Electricity',
    value: 65,
    color: '#2196f3'
  },
  {
    id: 'Gas',
    label: 'Gas',
    value: 35,
    color: '#90caf9'
  }
];

export default function EnergyDistributionChart({ buildingName }: EnergyDistributionChartProps) {
  const { themeColors: c } = useThemeMode();
  const [selectedType, setSelectedType] = useState('Electricity');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: c.bgPrimary, height: 300 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Energy distribution
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
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
            {selectedType}
          </Typography>
          <ExpandMoreIcon sx={{ fontSize: 16 }} />
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => { setSelectedType('Electricity'); setAnchorEl(null); }}>Electricity</MenuItem>
          <MenuItem onClick={() => { setSelectedType('Gas'); setAnchorEl(null); }}>Gas</MenuItem>
          <MenuItem onClick={() => { setSelectedType('Both'); setAnchorEl(null); }}>Both</MenuItem>
        </Menu>
      </Box>

      {/* Chart */}
      <Box sx={{ height: 220, position: 'relative' }}>
        {/* Center text */}
        <Box
          sx={{
            position: 'absolute',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
            12k kWh
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: 'error.main' }}>
            <TrendingDownIcon sx={{ fontSize: 14 }} />
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.813rem' }}>
              12%
            </Typography>
          </Box>
        </Box>

        <ResponsivePie
          data={mockData}
          margin={{ top: 20, right: 120, bottom: 20, left: 20 }}
          innerRadius={0.7}
          padAngle={2}
          cornerRadius={2}
          activeOuterRadiusOffset={4}
          colors={{ datum: 'data.color' }}
          borderWidth={0}
          enableArcLinkLabels={false}
          enableArcLabels={false}
          legends={[
            {
              anchor: 'right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 12,
              itemWidth: 100,
              itemHeight: 20,
              itemTextColor: c.chartAxisText,
              itemDirection: 'left-to-right',
              itemOpacity: 1,
              symbolSize: 12,
              symbolShape: 'circle',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemTextColor: c.textPrimary
                  }
                }
              ]
            }
          ]}
        />
      </Box>
    </Box>
  );
}
