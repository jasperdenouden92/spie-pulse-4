import { colors } from '@/colors';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ResponsiveLine } from '@nivo/line';

interface ComfortAirQualityTrendChartProps {
  buildingName?: string;
}

// Generate mock data - CO2 levels
const generateMockData = () => {
  const dates = [];
  const baseDate = new Date('2024-01-26');

  for (let i = 0; i < 8; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    dates.push(date);
  }

  return [
    {
      id: 'Floor 6, Room Sensor 1 (D-3883)',
      data: dates.map((date, i) => ({
        x: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        y: 420 + i * 10 + Math.random() * 30
      }))
    }
  ];
};

export default function ComfortAirQualityTrendChart({ buildingName }: ComfortAirQualityTrendChartProps) {
  const data = generateMockData();

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3 }}>
      {/* Air Quality Chart */}
      <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: '#fff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: '#e8f5e9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography sx={{ fontSize: '1rem' }}>🌬️</Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
            Air quality (CO₂)
          </Typography>
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
          <IconButton size="small" sx={{ borderRadius: "50%", aspectRatio: 1 }}>
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ height: 200 }}>
          <ResponsiveLine
            data={data}
            margin={{ top: 10, right: 10, bottom: 60, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 400, max: 520, stacked: false }}
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
              format: (value: number) => `${value}`,
              tickValues: 5,
            }}
            colors={['#4caf50']}
            lineWidth={2}
            pointSize={6}
            pointColor="#4caf50"
            pointBorderWidth={2}
            pointBorderColor="#fff"
            enableGridX={false}
            gridYValues={5}
            curve="monotoneX"
            useMesh={true}
            enableArea={false}
            theme={{
              axis: {
                domain: { line: { stroke: colors.borderSecondary, strokeWidth: 1 } },
                ticks: { text: { fontSize: 11, fill: '#666' } },
              },
              grid: { line: { stroke: colors.bgSecondaryHover, strokeWidth: 1 } },
            }}
          />
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2, fontSize: '0.75rem', color: 'text.secondary' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
            <Typography variant="caption">Rooms</Typography>
          </Box>
          <Typography variant="caption" sx={{ opacity: 0.5 }}>
            Floor 6, Room Sensor 1 (D-3883)
          </Typography>
        </Box>
      </Box>

      {/* Air Quality Assessment */}
      <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: '#fff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Air quality (CO₂) assessment
          </Typography>
          <IconButton size="small" sx={{ borderRadius: "50%", aspectRatio: 1 }}>
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
          During opening hours
        </Typography>

        {/* Progress bar */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ height: 40, bgcolor: colors.brand, borderRadius: 1, position: 'relative' }}>
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#fff',
                fontWeight: 500
              }}
            >
              A: 100%
            </Typography>
          </Box>

          {/* Scale */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            {['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'].map((label) => (
              <Typography key={label} variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>
                {label}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, textAlign: 'center' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
              MIN
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              421 ppm
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
              AVG
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              470 ppm
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
              MAX
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              495 ppm
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
