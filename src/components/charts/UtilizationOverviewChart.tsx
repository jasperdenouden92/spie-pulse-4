import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

interface UtilizationOverviewChartProps {
  buildingName?: string;
}

type UtilizationLevel = 0 | 1 | 2 | 3 | 4 | 5;

interface AssetUtilization {
  name: string;
  type: string;
  data: UtilizationLevel[][];
}

// Generate mock utilization data
const generateMockData = (): AssetUtilization[] => {
  const hours = 24;
  const days = 5; // Monday to Friday

  const createPattern = (intensity: number): UtilizationLevel[][] => {
    return Array.from({ length: days }, (_, dayIndex) =>
      Array.from({ length: hours }, (_, hourIndex) => {
        // Business hours have higher utilization
        if (hourIndex >= 8 && hourIndex <= 17) {
          const rand = Math.random();
          if (rand < 0.3) return (intensity + 1) as UtilizationLevel;
          if (rand < 0.7) return intensity as UtilizationLevel;
          return Math.max(0, intensity - 1) as UtilizationLevel;
        }
        // Off hours have lower utilization
        return Math.floor(Math.random() * 2) as UtilizationLevel;
      })
    );
  };

  return [
    { name: 'SPE Eindhoven', type: 'site', data: createPattern(3) },
    { name: 'Regens grond', type: 'group', data: createPattern(4) },
    { name: 'Kantoor (2nd)', type: 'space', data: createPattern(3) },
    { name: 'Hal (1st)', type: 'space', data: createPattern(2) },
    { name: 'Zaal 2 (3rd)', type: 'space', data: createPattern(4) },
    { name: 'De eveefabriek (23a)', type: 'space', data: createPattern(3) },
    { name: 'Lab (4th)', type: 'space', data: createPattern(5) },
    { name: 'Conferentie (10fa)', type: 'space', data: createPattern(4) },
    { name: '3.23 (8a)', type: 'space', data: createPattern(3) },
    { name: '2-2 (9a)', type: 'space', data: createPattern(2) },
    { name: 'Meeting room (7fa)', type: 'space', data: createPattern(4) },
    { name: '1.25 (8a)', type: 'space', data: createPattern(3) },
    { name: '2.27 (13a)', type: 'space', data: createPattern(2) },
    { name: 'Ai-eveefabriek (46a)', type: 'space', data: createPattern(5) }
  ];
};

const getUtilizationColor = (level: UtilizationLevel): string => {
  const colors = [
    '#f5f5f5', // 0 - No utilization
    '#bbdefb', // 1 - Very low
    '#64b5f6', // 2 - Low
    '#2196f3', // 3 - Medium
    '#1976d2', // 4 - High
    '#0d47a1'  // 5 - Very high
  ];
  return colors[level];
};

const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function UtilizationOverviewChart({ buildingName }: UtilizationOverviewChartProps) {
  const [viewMode, setViewMode] = useState<'hourly' | 'daily'>('hourly');
  const data = generateMockData();

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: '#fff' }}>
      {/* Header */}
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Utilization overview
          </Typography>
          <IconButton size="small">
            <InfoOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="hourly" sx={{ px: 2, py: 0.5, textTransform: 'none' }}>
              Hourly utilization
            </ToggleButton>
            <ToggleButton value="daily" sx={{ px: 2, py: 0.5, textTransform: 'none' }}>
              Daily utilization
            </ToggleButton>
          </ToggleButtonGroup>
          <IconButton size="small">
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Heatmap */}
      <Box sx={{ overflowX: 'auto', px: 3, pb: 3 }}>
        {/* Day headers */}
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Box sx={{ width: 200, flexShrink: 0 }} />
          {dayLabels.map((day) => (
            <Box key={day} sx={{ flex: 1, minWidth: 200 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  display: 'block',
                  textAlign: 'center',
                  mb: 0.5
                }}
              >
                {day}
              </Typography>
              {/* Hour labels */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 0.5 }}>
                {[0, 3, 6, 9, 12, 15, 18, 21].map((hour) => (
                  <Typography
                    key={hour}
                    variant="caption"
                    sx={{ fontSize: '0.625rem', color: 'text.secondary' }}
                  >
                    {hour}
                  </Typography>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Utilization rows */}
        {data.map((asset, assetIndex) => (
          <Box key={assetIndex} sx={{ display: 'flex', mb: 0.5, alignItems: 'center' }}>
            {/* Asset name */}
            <Box sx={{ width: 200, flexShrink: 0, pr: 2 }}>
              <Typography variant="body2" sx={{ fontSize: '0.813rem' }}>
                {asset.name}
              </Typography>
            </Box>

            {/* Utilization cells by day */}
            {asset.data.map((dayData, dayIndex) => (
              <Box
                key={dayIndex}
                sx={{
                  flex: 1,
                  minWidth: 200,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(24, 1fr)',
                  gap: 0.25
                }}
              >
                {dayData.map((level, hourIndex) => (
                  <Box
                    key={hourIndex}
                    sx={{
                      bgcolor: getUtilizationColor(level),
                      height: 24,
                      borderRadius: 0.5,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.2)',
                        boxShadow: 1,
                        cursor: 'pointer',
                        zIndex: 10
                      }
                    }}
                    title={`${dayLabels[dayIndex]} ${hourIndex}:00 - ${asset.name}`}
                  />
                ))}
              </Box>
            ))}
          </Box>
        ))}
      </Box>

      {/* Legend */}
      <Box sx={{ px: 3, pb: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', mr: 2 }}>
            Utilization:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 40, height: 16, bgcolor: getUtilizationColor(0), borderRadius: 0.5, border: 1, borderColor: 'divider' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', mr: 2 }}>
              0%
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 40, height: 16, bgcolor: getUtilizationColor(2), borderRadius: 0.5 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', mr: 2 }}>
              40%
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 40, height: 16, bgcolor: getUtilizationColor(3), borderRadius: 0.5 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', mr: 2 }}>
              60%
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 40, height: 16, bgcolor: getUtilizationColor(5), borderRadius: 0.5 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              100%
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
