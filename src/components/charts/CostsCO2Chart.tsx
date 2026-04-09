import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ResponsiveBar } from '@nivo/bar';
import { useThemeMode } from '@/theme-mode-context';
import { seededRandomFromKey } from '@/data/generators';

interface CostsCO2ChartProps {
  buildingName?: string;
}

// Mock data - represents energy spend with two components
const generateMockData = (buildingName?: string) => {
  const rand = buildingName ? seededRandomFromKey(buildingName) : null;
  const offset = (base: number) => rand ? Math.round(base + (rand() * 40 - 20)) : base;
  return [
    {
      week: 'Energy spend · Week 1',
      primary: offset(280),
      secondary: offset(45),
      primaryColor: '#9c27b0',
      secondaryColor: '#ffa726'
    },
    {
      week: 'Energy spend · Week 2',
      primary: offset(180),
      secondary: offset(25),
      primaryColor: '#9c27b0',
      secondaryColor: '#ffa726'
    },
    {
      week: 'Energy spend · Week 3',
      primary: offset(320),
      secondary: offset(55),
      primaryColor: '#9c27b0',
      secondaryColor: '#ffa726'
    }
  ];
};

export default function CostsCO2Chart({ buildingName }: CostsCO2ChartProps) {
  const { themeColors: c } = useThemeMode();
  const mockData = generateMockData(buildingName);
  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: c.bgPrimary, height: 300 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Costs and CO₂
        </Typography>
        <IconButton size="small" sx={{ borderRadius: "50%", aspectRatio: 1 }}>
          <MoreHorizIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Chart */}
      <Box sx={{ height: 220 }}>
        <ResponsiveBar
          data={mockData}
          keys={['primary', 'secondary']}
          indexBy="week"
          layout="horizontal"
          margin={{ top: 10, right: 80, bottom: 20, left: 160 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          colors={({ id, data }) => {
            const colorKey = `${id}Color` as keyof typeof data;
            return (data as any)[colorKey];
          }}
          borderRadius={4}
          axisTop={null}
          axisRight={null}
          axisBottom={null}
          axisLeft={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
            renderTick: (tick) => {
              return (
                <g transform={`translate(${tick.x - 10},${tick.y})`}>
                  <text
                    textAnchor="end"
                    dominantBaseline="central"
                    style={{
                      fontSize: 11,
                      fill: c.chartAxisText
                    }}
                  >
                    {tick.value}
                  </text>
                </g>
              );
            }
          }}
          enableGridY={false}
          enableGridX={false}
          enableLabel={true}
          label={(d) => `{{value}}`}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={c.chartAxisText}
          legends={[]}
          theme={{
            axis: {
              ticks: {
                text: {
                  fontSize: 11,
                  fill: c.chartAxisText,
                },
              },
            },
            labels: {
              text: {
                fontSize: 11,
                fill: c.chartAxisText,
              }
            }
          }}
        />
      </Box>
    </Box>
  );
}
