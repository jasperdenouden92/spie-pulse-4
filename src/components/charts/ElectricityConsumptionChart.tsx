import { useThemeMode } from '@/theme-mode-context';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { ResponsiveLine } from '@nivo/line';
import { seededRandomFromKey } from '@/data/generators';

interface ElectricityConsumptionChartProps {
  buildingName?: string;
}

// Mock data - replace with real data
const generateMockData = (buildingName?: string) => {
  const rand = buildingName ? seededRandomFromKey(buildingName) : null;
  const offset = (base: number) => rand ? Math.round(base + (rand() * 20 - 10)) : base;

  const dates = [];
  const startDate = new Date('2024-01-26');
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }

  return [
    {
      id: 'electricity',
      data: [
        { x: dates[0], y: offset(28) },
        { x: dates[1], y: offset(42) },
        { x: dates[2], y: offset(51) },
        { x: dates[3], y: offset(58) },
        { x: dates[4], y: offset(62) },
        { x: dates[5], y: offset(56) },
        { x: dates[6], y: offset(32) }
      ]
    }
  ];
};

export default function ElectricityConsumptionChart({ buildingName }: ElectricityConsumptionChartProps) {
  const { themeColors: c } = useThemeMode();
  const data = generateMockData(buildingName);

  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: c.bgPrimary, height: 300 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
            Electricity consumption over time
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              47kW
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
              <TrendingUpIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                23%
              </Typography>
            </Box>
          </Box>
        </Box>
        <IconButton size="small" sx={{ borderRadius: "50%", aspectRatio: 1 }}>
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
          pointBorderColor={c.chartPointBorder}
          enableGridX={false}
          gridYValues={5}
          curve="monotoneX"
          useMesh={true}
          enableArea={false}
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
            grid: {
              line: {
                stroke: c.chartGridLine,
                strokeWidth: 1,
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}
