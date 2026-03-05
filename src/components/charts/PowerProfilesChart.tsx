import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ResponsiveLine } from '@nivo/line';

interface PowerProfilesChartProps {
  buildingName?: string;
}

// Mock data
const generateMockData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return [
    {
      id: '{{week}}',
      color: '#2196f3',
      data: months.map((month) => ({
        x: month,
        y: 30 + Math.random() * 30
      }))
    },
    {
      id: '{{week}}',
      color: '#64b5f6',
      data: months.map((month) => ({
        x: month,
        y: 28 + Math.random() * 28
      }))
    }
  ];
};

export default function PowerProfilesChart({ buildingName }: PowerProfilesChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('Week');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const data = generateMockData();

  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: '#fff', height: 300 }}>
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: '6px',
            bgcolor: '#f5f5f5',
            cursor: 'pointer',
            minWidth: 80,
            justifyContent: 'space-between',
            '&:hover': {
              bgcolor: '#e8e8e8'
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
          <MenuItem onClick={() => { setSelectedPeriod('Day'); setAnchorEl(null); }}>Day</MenuItem>
          <MenuItem onClick={() => { setSelectedPeriod('Week'); setAnchorEl(null); }}>Week</MenuItem>
          <MenuItem onClick={() => { setSelectedPeriod('Month'); setAnchorEl(null); }}>Month</MenuItem>
          <MenuItem onClick={() => { setSelectedPeriod('Year'); setAnchorEl(null); }}>Year</MenuItem>
        </Menu>
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
