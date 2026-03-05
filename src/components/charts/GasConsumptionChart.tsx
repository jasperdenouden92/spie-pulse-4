import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { ResponsiveLine } from '@nivo/line';

interface GasConsumptionChartProps {
  buildingName?: string;
}

// Mock data - replace with real data
const generateMockData = () => {
  const dates = [];
  const startDate = new Date('2024-01-26');
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }

  return [
    {
      id: 'gas',
      data: [
        { x: dates[0], y: 25 },
        { x: dates[1], y: 38 },
        { x: dates[2], y: 48 },
        { x: dates[3], y: 55 },
        { x: dates[4], y: 60 },
        { x: dates[5], y: 52 },
        { x: dates[6], y: 30 }
      ]
    }
  ];
};

export default function GasConsumptionChart({ buildingName }: GasConsumptionChartProps) {
  const data = generateMockData();

  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: '#fff', height: 300 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
            Gas consumption over time
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              47kW
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main' }}>
              <TrendingDownIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                12%
              </Typography>
            </Box>
          </Box>
        </Box>
        <IconButton size="small">
          <MoreHorizIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Chart */}
      <Box sx={{ height: 200 }}>
        <ResponsiveLine
          data={data}
          margin={{ top: 10, right: 10, bottom: 40, left: 50 }}
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: 0,
            max: 80,
            stacked: false,
          }}
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
            format: (value) => `${value}kW`,
            tickValues: 5,
          }}
          colors={['#2196f3']}
          lineWidth={2}
          pointSize={6}
          pointColor="#2196f3"
          pointBorderWidth={2}
          pointBorderColor="#fff"
          enableGridX={false}
          gridYValues={5}
          curve="monotoneX"
          useMesh={true}
          enableArea={false}
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
