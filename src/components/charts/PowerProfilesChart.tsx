import { useThemeMode } from '@/theme-mode-context';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ResponsiveLine } from '@nivo/line';
import { seededRandomFromKey } from '@/data/generators';

interface PowerProfilesChartProps {
  buildingName?: string;
}

// Mock data
const generateMockData = (buildingName?: string) => {
  const rand = buildingName ? seededRandomFromKey(buildingName) : null;
  const offset = (base: number) => rand ? Math.round(base + (rand() * 20 - 10)) : base;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return [
    {
      id: 'Peak demand',
      color: '#2196f3',
      data: months.map((month, i) => ({
        x: month,
        y: offset(30 + ((i * 37 + 13) % 30))
      }))
    },
    {
      id: 'Average load',
      color: '#64b5f6',
      data: months.map((month, i) => ({
        x: month,
        y: offset(28 + ((i * 41 + 7) % 28))
      }))
    }
  ];
};

export default function PowerProfilesChart({ buildingName }: PowerProfilesChartProps) {
  const { themeColors: c } = useThemeMode();
  const data = generateMockData(buildingName);

  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: c.bgPrimary, height: 300 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
            Power profiles
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            38 kW
          </Typography>
        </Box>
      </Box>

      {/* Chart */}
      <Box sx={{ height: 200 }}>
        <ResponsiveLine
          data={data}
          margin={{ top: 10, right: 10, bottom: 50, left: 50 }}
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
            tickValues: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
            tickValues: 5,
          }}
          colors={['#2196f3', '#64b5f6']}
          lineWidth={2}
          pointSize={0}
          enableGridX={false}
          gridYValues={5}
          curve="monotoneX"
          useMesh={true}
          enableArea={false}
          legends={[
            {
              anchor: 'bottom',
              direction: 'row',
              justify: false,
              translateX: 0,
              translateY: 45,
              itemsSpacing: 20,
              itemDirection: 'left-to-right',
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 1,
              symbolSize: 8,
              symbolShape: 'circle',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
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
            legends: {
              text: {
                fontSize: 11,
                fill: c.chartAxisText,
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}
