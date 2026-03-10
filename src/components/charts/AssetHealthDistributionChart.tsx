import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ResponsivePie } from '@nivo/pie';

interface AssetHealthDistributionChartProps {
  buildingName?: string;
  assetFilter?: string;
}

// Mock data for asset health
const generateMockData = (assetFilter?: string) => {
  if (assetFilter) {
    return [
      { id: 'Healthy', label: 'Healthy', value: 85, color: '#66bb6a' },
      { id: 'Warning', label: 'Warning', value: 12, color: '#ffa726' },
      { id: 'Critical', label: 'Critical', value: 3, color: '#ef5350' }
    ];
  }

  return [
    { id: 'Healthy', label: 'Healthy', value: 342, color: '#66bb6a' },
    { id: 'Warning', label: 'Warning', value: 78, color: '#ffa726' },
    { id: 'Critical', label: 'Critical', value: 23, color: '#ef5350' },
    { id: 'Offline', label: 'Offline', value: 12, color: '#9e9e9e' }
  ];
};

export default function AssetHealthDistributionChart({
  buildingName,
  assetFilter
}: AssetHealthDistributionChartProps) {
  const data = generateMockData(assetFilter);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: '#fff', height: 380 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Asset Health Distribution
        </Typography>
        <IconButton size="small" sx={{ borderRadius: "50%", aspectRatio: 1 }}>
          <MoreHorizIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Chart */}
      <Box sx={{ height: 220, position: 'relative' }}>
        <ResponsivePie
          data={data}
          margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
          innerRadius={0.6}
          padAngle={2}
          cornerRadius={4}
          activeOuterRadiusOffset={8}
          colors={(d) => d.data.color}
          borderWidth={0}
          enableArcLinkLabels={false}
          arcLabelsSkipAngle={10}
          arcLabel={(d) => `${d.value}`}
          arcLabelsTextColor="#fff"
          theme={{
            labels: {
              text: {
                fontSize: 13,
                fontWeight: 600,
              },
            },
          }}
        />
        {/* Center text */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 600, lineHeight: 1 }}>
            {total}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Total Assets
          </Typography>
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
        {data.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '3px',
                bgcolor: item.color,
                flexShrink: 0
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {item.label}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {item.value} assets · {((item.value / total) * 100).toFixed(1)}%
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
