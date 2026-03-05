import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
      data: hours.map((date) => ({
        x: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        y: 45 + Math.random() * 15
      }))
    },
    {
      id: 'Supply Temperature - CV Boiler',
      color: '#42a5f5',
      data: hours.map((date) => ({
        x: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        y: 40 + Math.random() * 12
      }))
    },
    {
      id: 'Outside Temperature',
      color: '#66bb6a',
      data: hours.map((date) => ({
        x: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        y: 5 + Math.random() * 10
      }))
    },
    {
      id: 'Return Temperature',
      color: '#ffa726',
      data: hours.map((date) => ({
        x: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        y: 30 + Math.random() * 10
      }))
    }
  ];

  return assetFilter ? series.slice(0, 2) : series;
};

export default function AssetTrendChart({ buildingName, assetFilter }: AssetTrendChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('Week 05');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const data = generateMockData(assetFilter);

  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: '#fff' }}>
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
                bgcolor: 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            EDIT
          </Button>
          <IconButton size="small" sx={{ ml: 1 }}>
            <Box
              component="span"
              sx={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'text.secondary',
                lineHeight: 1
              }}
            >
              ⋮
            </Box>
          </IconButton>
        </Box>
      </Box>

      {/* Time selector */}
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            border: 1,
            borderColor: 'divider',
            borderRadius: '6px',
            bgcolor: '#fff',
            cursor: 'pointer',
            minWidth: 100,
            justifyContent: 'space-between',
            '&:hover': {
              bgcolor: '#f5f5f5'
            }
          }}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <Typography variant="body2" sx={{ fontSize: '0.813rem', fontWeight: 500 }}>
            {selectedPeriod}
          </Typography>
          <ExpandMoreIcon sx={{ fontSize: 16 }} />
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => { setSelectedPeriod('Week 04'); setAnchorEl(null); }}>Week 04</MenuItem>
          <MenuItem onClick={() => { setSelectedPeriod('Week 05'); setAnchorEl(null); }}>Week 05</MenuItem>
          <MenuItem onClick={() => { setSelectedPeriod('Week 06'); setAnchorEl(null); }}>Week 06</MenuItem>
          <MenuItem onClick={() => { setSelectedPeriod('Last Month'); setAnchorEl(null); }}>Last Month</MenuItem>
        </Menu>
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
