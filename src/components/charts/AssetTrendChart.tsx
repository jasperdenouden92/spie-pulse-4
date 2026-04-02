import { secondaryAlpha } from '@/colors';
import { useThemeMode } from '@/theme-mode-context';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ResponsiveLine } from '@nivo/line';

interface AssetTrendChartProps {
  buildingName?: string;
  assetFilter?: string;
}

// Generate mock data for asset metrics over time
const generateMockData = (assetFilter?: string) => {
  const hours = [];
  const baseDate = new Date('2025-01-26');

  // Generate hourly data points for 7 days
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour += 2) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + day);
      date.setHours(hour);
      hours.push(date);
    }
  }

  const series = [
    {
      id: 'Supply Temperature - CV Buffer',
      color: '#ef5350',
      data: hours.map((date, i) => ({
        x: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        y: 45 + ((i * 37 + 13) % 15)
      }))
    },
    {
      id: 'Supply Temperature - CV Boiler',
      color: '#42a5f5',
      data: hours.map((date, i) => ({
        x: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        y: 40 + ((i * 41 + 7) % 12)
      }))
    },
    {
      id: 'Outside Temperature',
      color: '#66bb6a',
      data: hours.map((date, i) => ({
        x: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        y: 5 + ((i * 53 + 17) % 10)
      }))
    },
    {
      id: 'Return Temperature',
      color: '#ffa726',
      data: hours.map((date, i) => ({
        x: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        y: 30 + ((i * 59 + 23) % 10)
      }))
    }
  ];

  return assetFilter ? series.slice(0, 2) : series;
};

export default function AssetTrendChart({ buildingName, assetFilter }: AssetTrendChartProps) {
  const { themeColors: c } = useThemeMode();
  const data = generateMockData(assetFilter);

  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: c.bgPrimary }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Asset trend
          </Typography>
          <IconButton size="small">
            <InfoOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
            sx={{
              textTransform: 'none',
              fontSize: '0.813rem',
              color: 'primary.main',
              '&:hover': {
                bgcolor: secondaryAlpha(0.08)
              }
            }}
          >
            EDIT
          </Button>
          <IconButton size="small" sx={{ borderRadius: '50%', aspectRatio: 1 }}>
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Chart */}
      <Box sx={{ height: 300 }}>
        <ResponsiveLine
          data={data}
          margin={{ top: 20, right: 20, bottom: 80, left: 60 }}
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: 0,
            max: 70,
            stacked: false,
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
            tickValues: 'every 24 hours',
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
            format: (value: number) => `${value}°C`,
            tickValues: 7,
          }}
          colors={(d) => d.color}
          lineWidth={2}
          pointSize={0}
          enableGridX={true}
          gridXValues={'every 24 hours'}
          gridYValues={7}
          curve="monotoneX"
          useMesh={true}
          enableArea={false}
          legends={[
            {
              anchor: 'bottom',
              direction: 'row',
              justify: false,
              translateX: 0,
              translateY: 70,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 180,
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
