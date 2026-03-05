import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';

interface EnergyTemperatureChartProps {
  buildingName?: string;
}

// Generate mock scatter data
const generateMockData = () => {
  const points = [];

  // Generate clustered points showing correlation between temperature and energy
  for (let i = 0; i < 25; i++) {
    const temp = 10 + Math.random() * 15; // Temperature range 10-25
    const baseEnergy = 62 + (25 - temp) * 0.4; // Inverse correlation
    const energy = baseEnergy + (Math.random() - 0.5) * 2; // Add some variance

    points.push({
      x: temp,
      y: energy
    });
  }

  return [
    {
      id: 'energy-temp',
      data: points
    }
  ];
};

export default function EnergyTemperatureChart({ buildingName }: EnergyTemperatureChartProps) {
  const [selectedMeter, setSelectedMeter] = useState('Meter');
  const [meterAnchorEl, setMeterAnchorEl] = useState<null | HTMLElement>(null);
  const data = generateMockData();

  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: '#fff', height: 400 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Energy vs outside temperature
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Filter button */}
          <IconButton size="small" sx={{ border: 1, borderColor: 'divider', borderRadius: '6px' }}>
            <FilterListIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {/* Meter dropdown */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              border: 1,
              borderColor: 'divider',
              borderRadius: '6px',
              bgcolor: '#fff',
              cursor: 'pointer',
              minWidth: 90,
              justifyContent: 'space-between',
              '&:hover': {
                bgcolor: '#f5f5f5'
              }
            }}
            onClick={(e) => setMeterAnchorEl(e.currentTarget)}
          >
            <Typography variant="body2" sx={{ fontSize: '0.813rem', fontWeight: 500 }}>
              {selectedMeter}
            </Typography>
            <ExpandMoreIcon sx={{ fontSize: 16 }} />
          </Box>
          <Menu
            anchorEl={meterAnchorEl}
            open={Boolean(meterAnchorEl)}
            onClose={() => setMeterAnchorEl(null)}
          >
            <MenuItem onClick={() => { setSelectedMeter('Meter'); setMeterAnchorEl(null); }}>Meter</MenuItem>
            <MenuItem onClick={() => { setSelectedMeter('Meter 1'); setMeterAnchorEl(null); }}>Meter 1</MenuItem>
            <MenuItem onClick={() => { setSelectedMeter('Meter 2'); setMeterAnchorEl(null); }}>Meter 2</MenuItem>
            <MenuItem onClick={() => { setSelectedMeter('All Meters'); setMeterAnchorEl(null); }}>All Meters</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Chart */}
      <Box sx={{ height: 320 }}>
        <ResponsiveScatterPlot
          data={data}
          margin={{ top: 20, right: 40, bottom: 60, left: 60 }}
          xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
          yScale={{ type: 'linear', min: 60, max: 72 }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
            legend: '',
            legendPosition: 'middle',
            legendOffset: 46,
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
            format: (value: number) => `${value}kW`,
            tickValues: [60, 62, 64, 66, 68, 70, 72],
          }}
          colors="#2196f3"
          blendMode="normal"
          nodeSize={8}
          useMesh={false}
          gridXValues={8}
          gridYValues={[60, 62, 64, 66, 68, 70, 72]}
          theme={{
            axis: {
              domain: {
                line: {
                  stroke: '#e0e0e0',
                  strokeWidth: 1,
                },
              },
              ticks: {
                text: {
                  fontSize: 11,
                  fill: '#666',
                },
              },
            },
            grid: {
              line: {
                stroke: '#f0f0f0',
                strokeWidth: 1,
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}
