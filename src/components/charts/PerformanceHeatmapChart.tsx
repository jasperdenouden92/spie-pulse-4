import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useThemeMode } from '@/theme-mode-context';

interface PerformanceHeatmapChartProps {
  buildingName?: string;
}

interface PerformanceData {
  period: string;
  values: number[];
}

// Generate mock performance data with percentages
const generateMockData = (): PerformanceData[] => {
  return [
    { period: 'Nov 29 to Dec 5', values: [90, 93, 80, 90, 85, 93, 80] },
    { period: 'Dec 6 to Dec 12', values: [93, 80, 80, 82, 80, 86, 80] },
    { period: 'Dec 6 to Dec 12', values: [86, 91, 93, 88, 86, 93, 80] },
    { period: 'Dec 13 to Dec 19', values: [80, 93, 80, 82, 80, 80, 88] },
    { period: 'Dec 20 to Dec 26', values: [86, 86, 93, 94, 82, 93, 80] },
    { period: 'Dec 27 to Jan 2', values: [94, 86, 80, 88, 82, 86, 80] }
  ];
};

// Get color based on performance value
const getColor = (value: number): string => {
  if (value >= 90) return '#c8e6c9'; // Light green
  if (value >= 85) return '#fff9c4'; // Light yellow
  if (value >= 80) return '#ffccbc'; // Light orange/peach
  return '#ffcdd2'; // Light red
};

export default function PerformanceHeatmapChart({ buildingName }: PerformanceHeatmapChartProps) {
  const { themeColors: c } = useThemeMode();
  const data = generateMockData();

  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: c.bgPrimary }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Performance
        </Typography>
        <IconButton size="small">
          <ArrowForwardIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Heatmap Grid */}
      <Box>
        {data.map((row, rowIndex) => (
          <Box
            key={rowIndex}
            sx={{
              display: 'grid',
              gridTemplateColumns: '200px repeat(7, 1fr)',
              gap: 0.5,
              mb: 0.5,
              alignItems: 'center'
            }}
          >
            {/* Period label */}
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.813rem',
                color: 'text.secondary',
                pr: 2
              }}
            >
              {row.period}
            </Typography>

            {/* Performance cells */}
            {row.values.map((value, colIndex) => (
              <Box
                key={colIndex}
                sx={{
                  bgcolor: getColor(value),
                  p: 1.5,
                  textAlign: 'center',
                  borderRadius: 0.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 1,
                    cursor: 'pointer'
                  }
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'text.primary'
                  }}
                >
                  {value}%
                </Typography>
              </Box>
            ))}
          </Box>
        ))}
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 3, mt: 3, justifyContent: 'flex-end' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 24, height: 16, bgcolor: '#c8e6c9', borderRadius: 0.5 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Excellent (≥90%)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 24, height: 16, bgcolor: '#fff9c4', borderRadius: 0.5 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Good (85-89%)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 24, height: 16, bgcolor: '#ffccbc', borderRadius: 0.5 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Fair (80-84%)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 24, height: 16, bgcolor: '#ffcdd2', borderRadius: 0.5 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Poor (&lt;80%)
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
