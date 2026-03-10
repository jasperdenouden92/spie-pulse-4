import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ResponsiveBar } from '@nivo/bar';

interface CostsCO2ChartProps {
  buildingName?: string;
}

// Mock data - represents energy spend with two components
const mockData = [
  {
    week: 'Energy spend · Week 1',
    primary: 280,
    secondary: 45,
    primaryColor: '#9c27b0',
    secondaryColor: '#ffa726'
  },
  {
    week: 'Energy spend · Week 2',
    primary: 180,
    secondary: 25,
    primaryColor: '#9c27b0',
    secondaryColor: '#ffa726'
  },
  {
    week: 'Energy spend · Week 3',
    primary: 320,
    secondary: 55,
    primaryColor: '#9c27b0',
    secondaryColor: '#ffa726'
  }
];

export default function CostsCO2Chart({ buildingName }: CostsCO2ChartProps) {
  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: '#fff', height: 300 }}>
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
                      fill: '#666'
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
          labelTextColor="#666"
          legends={[]}
          theme={{
            axis: {
              ticks: {
                text: {
                  fontSize: 11,
                  fill: '#666',
                },
              },
            },
            labels: {
              text: {
                fontSize: 11,
                fill: '#666',
              }
            }
          }}
        />
      </Box>
    </Box>
  );
}
