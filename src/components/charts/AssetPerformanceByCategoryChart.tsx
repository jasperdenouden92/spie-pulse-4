import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ResponsiveBar } from '@nivo/bar';

interface AssetPerformanceByCategoryChartProps {
  buildingName?: string;
  assetFilter?: string;
}

// Mock data for asset performance by category
const generateMockData = () => {
  return [
    {
      category: 'HVAC',
      performance: 87,
      target: 90,
      performanceColor: '#42a5f5',
      targetColor: '#e0e0e0'
    },
    {
      category: 'Electrical',
      performance: 92,
      target: 90,
      performanceColor: '#66bb6a',
      targetColor: '#e0e0e0'
    },
    {
      category: 'Plumbing',
      performance: 78,
      target: 90,
      performanceColor: '#ffa726',
      targetColor: '#e0e0e0'
    },
    {
      category: 'Fire Safety',
      performance: 95,
      target: 90,
      performanceColor: '#66bb6a',
      targetColor: '#e0e0e0'
    },
    {
      category: 'Elevators',
      performance: 84,
      target: 90,
      performanceColor: '#42a5f5',
      targetColor: '#e0e0e0'
    },
    {
      category: 'Access Control',
      performance: 89,
      target: 90,
      performanceColor: '#42a5f5',
      targetColor: '#e0e0e0'
    }
  ];
};

export default function AssetPerformanceByCategoryChart({
  buildingName,
  assetFilter
}: AssetPerformanceByCategoryChartProps) {
  const data = generateMockData();

  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: '#fff', height: 380 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Performance by Category
        </Typography>
        <IconButton size="small">
          <MoreHorizIcon fontSize="small" />
        </IconButton>
      </Box>

      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
        Asset uptime and reliability scores
      </Typography>

      {/* Chart */}
      <Box sx={{ height: 280 }}>
        <ResponsiveBar
          data={data}
          keys={['performance']}
          indexBy="category"
          margin={{ top: 10, right: 30, bottom: 50, left: 60 }}
          padding={0.4}
          layout="horizontal"
          valueScale={{ type: 'linear', min: 0, max: 100 }}
          colors={(d) => {
            const value = d.value as number;
            if (value >= 90) return '#66bb6a';
            if (value >= 80) return '#42a5f5';
            return '#ffa726';
          }}
          borderRadius={4}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
            format: (value: number) => `${value}%`,
            tickValues: [0, 25, 50, 75, 100]
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
          }}
          enableGridY={false}
          enableGridX={true}
          gridXValues={[0, 25, 50, 75, 90, 100]}
          enableLabel={true}
          label={(d) => `${d.value}%`}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor="#fff"
          markers={[
            {
              axis: 'x',
              value: 90,
              lineStyle: { stroke: '#ef5350', strokeWidth: 2, strokeDasharray: '4 4' },
              legend: 'Target',
              legendOrientation: 'vertical',
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
            labels: {
              text: {
                fontSize: 11,
                fontWeight: 600,
              }
            }
          }}
        />
      </Box>
    </Box>
  );
}
