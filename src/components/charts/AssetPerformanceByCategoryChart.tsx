import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ResponsiveBar } from '@nivo/bar';
import { useThemeMode } from '@/theme-mode-context';
import { seededRandomFromKey } from '@/data/generators';

interface AssetPerformanceByCategoryChartProps {
  buildingName?: string;
  assetFilter?: string;
}

// Mock data for asset performance by category
const generateMockData = (buildingName?: string) => {
  const rand = buildingName ? seededRandomFromKey(buildingName) : null;
  const offset = (base: number) => {
    if (!rand) return base;
    return Math.min(100, Math.max(0, Math.round(base + (rand() * 10 - 5))));
  };

  return [
    {
      category: 'HVAC',
      performance: offset(87),
      target: 90,
      performanceColor: '#42a5f5',
    },
    {
      category: 'Electrical',
      performance: offset(92),
      target: 90,
      performanceColor: '#66bb6a',
    },
    {
      category: 'Plumbing',
      performance: offset(78),
      target: 90,
      performanceColor: '#ffa726',
    },
    {
      category: 'Fire Safety',
      performance: offset(95),
      target: 90,
      performanceColor: '#66bb6a',
    },
    {
      category: 'Elevators',
      performance: offset(84),
      target: 90,
      performanceColor: '#42a5f5',
    },
    {
      category: 'Access Control',
      performance: offset(89),
      target: 90,
      performanceColor: '#42a5f5',
    }
  ];
};

export default function AssetPerformanceByCategoryChart({
  buildingName,
  assetFilter
}: AssetPerformanceByCategoryChartProps) {
  const { themeColors: c } = useThemeMode();
  const data = generateMockData(buildingName);

  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: c.bgPrimary, height: 380 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Performance by Category
        </Typography>
        <IconButton size="small" sx={{ borderRadius: "50%", aspectRatio: 1 }}>
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
          labelTextColor={c.bgPrimary}
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
                stroke: c.bgSecondaryHover,
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
