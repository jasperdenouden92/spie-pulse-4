import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import { ResponsiveLine } from '@nivo/line';

interface ForecastTargetChartProps {
  buildingName?: string;
}

// Mock data
const generateMockData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return [
    {
      id: 'Actual',
      color: '#2196f3',
      data: months.map((month, i) => ({
        x: month,
        y: 20 + Math.random() * 40 + i * 2
      }))
    },
    {
      id: 'Adjusted forecast',
      color: '#90caf9',
      data: months.map((month, i) => ({
        x: month,
        y: 25 + Math.random() * 35 + i * 2
      }))
    },
    {
      id: 'Forecast',
      color: '#ff9800',
      data: months.map((month, i) => ({
        x: month,
        y: 28 + Math.random() * 30 + i * 2
      }))
    },
    {
      id: 'Previous year',
      color: '#4caf50',
      data: months.map((month, i) => ({
        x: month,
        y: 22 + Math.random() * 38 + i * 2
      }))
    }
  ];
};

export default function ForecastTargetChart({ buildingName }: ForecastTargetChartProps) {
  const [degreeDayCorrection, setDegreeDayCorrection] = useState(false);
  const data = generateMockData();

  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: '#fff', height: 360 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
            Forecast and target
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            580,000 kWh
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<ThermostatIcon sx={{ fontSize: 16 }} />}
          onClick={() => setDegreeDayCorrection(!degreeDayCorrection)}
          sx={{
            textTransform: 'none',
            fontSize: '0.813rem',
            color: degreeDayCorrection ? 'primary.main' : 'text.secondary',
            bgcolor: degreeDayCorrection ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
            '&:hover': {
              bgcolor: degreeDayCorrection ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          Degree day correction
        </Button>
      </Box>

      {/* Chart */}
      <Box sx={{ height: 260 }}>
        <ResponsiveLine
          data={data}
          margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
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
            tickValues: 5,
          }}
          colors={{ datum: 'color' }}
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
              itemWidth: 100,
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
            legends: {
              text: {
                fontSize: 11,
                fill: '#666',
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}
