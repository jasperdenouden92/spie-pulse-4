import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface Insight {
  id: string;
  assetName: string;
  assetType: 'Building' | 'HVAC' | 'Elevator' | 'Electrical' | 'Plumbing' | 'Fire Safety';
  building: string;
  insightType: 'opportunity' | 'warning' | 'info' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
}

export default function Insights() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const insights: Insight[] = [
    {
      id: '1',
      assetName: 'Skyline Plaza',
      assetType: 'Building',
      building: 'Skyline Plaza',
      insightType: 'opportunity',
      title: 'Energy consumption trending 15% below forecast',
      description: 'Recent optimizations to HVAC systems are showing measurable impact on overall building energy usage.',
      impact: 'high',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      assetName: 'Chiller Unit 02',
      assetType: 'HVAC',
      building: 'Innovation Hub',
      insightType: 'warning',
      title: 'Unusual vibration patterns detected',
      description: 'IoT sensors indicate vibration levels 20% above normal. Recommend inspection to prevent potential failure.',
      impact: 'high',
      timestamp: '5 hours ago'
    },
    {
      id: '3',
      assetName: 'Main Electrical Panel A',
      assetType: 'Electrical',
      building: 'Metro Heights',
      insightType: 'info',
      title: 'Load balancing opportunity identified',
      description: 'Circuit analysis shows uneven distribution across phases. Rebalancing could improve efficiency by 8%.',
      impact: 'medium',
      timestamp: 'Yesterday'
    },
    {
      id: '4',
      assetName: 'Elevator Bank 3',
      assetType: 'Elevator',
      building: 'Skyline Plaza',
      insightType: 'recommendation',
      title: 'Maintenance schedule optimization available',
      description: 'Usage patterns suggest shifting preventive maintenance to off-peak hours could reduce tenant impact.',
      impact: 'low',
      timestamp: '2 days ago'
    },
    {
      id: '5',
      assetName: 'Fire Suppression System',
      assetType: 'Fire Safety',
      building: 'Riverside Complex',
      insightType: 'warning',
      title: 'Inspection certification expiring soon',
      description: 'Annual fire safety inspection certificate expires in 14 days. Schedule inspection to maintain compliance.',
      impact: 'high',
      timestamp: '3 days ago'
    },
    {
      id: '6',
      assetName: 'Domestic Water Pumps',
      assetType: 'Plumbing',
      building: 'Gateway Center',
      insightType: 'opportunity',
      title: 'Water pressure optimization reducing wear',
      description: 'Recent pressure adjustments have decreased pump cycling by 30%, extending expected equipment life.',
      impact: 'medium',
      timestamp: '4 days ago'
    },
    {
      id: '7',
      assetName: 'Innovation Hub',
      assetType: 'Building',
      building: 'Innovation Hub',
      insightType: 'info',
      title: 'Tenant satisfaction scores increased',
      description: 'Recent facility improvements correlate with 12% increase in tenant comfort ratings.',
      impact: 'medium',
      timestamp: '5 days ago'
    },
    {
      id: '8',
      assetName: 'Rooftop HVAC Unit 5',
      assetType: 'HVAC',
      building: 'Metro Heights',
      insightType: 'recommendation',
      title: 'Filter replacement ahead of schedule',
      description: 'Air quality monitoring suggests filter replacement 2 weeks earlier than scheduled could improve efficiency.',
      impact: 'low',
      timestamp: '1 week ago'
    },
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUpIcon sx={{ fontSize: 20, color: '#2e7d32' }} />;
      case 'warning':
        return <WarningIcon sx={{ fontSize: 20, color: '#f57c00' }} />;
      case 'info':
        return <InfoIcon sx={{ fontSize: 20, color: '#1976d2' }} />;
      case 'recommendation':
        return <CheckCircleIcon sx={{ fontSize: 20, color: '#9c27b0' }} />;
      default:
        return null;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return { bg: '#e8f5e9', text: '#2e7d32' };
      case 'warning':
        return { bg: '#fff3e0', text: '#f57c00' };
      case 'info':
        return { bg: '#e3f2fd', text: '#1976d2' };
      case 'recommendation':
        return { bg: '#f3e5f5', text: '#9c27b0' };
      default:
        return { bg: '#f5f5f5', text: '#757575' };
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Filter Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Button
          variant={selectedFilter === 'all' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setSelectedFilter('all')}
          sx={{ textTransform: 'none' }}
        >
          All Insights
        </Button>
        <Button
          variant={selectedFilter === 'opportunity' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setSelectedFilter('opportunity')}
          startIcon={<TrendingUpIcon />}
          sx={{ textTransform: 'none' }}
        >
          Opportunities
        </Button>
        <Button
          variant={selectedFilter === 'warning' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setSelectedFilter('warning')}
          startIcon={<WarningIcon />}
          sx={{ textTransform: 'none' }}
        >
          Warnings
        </Button>
        <Button
          variant={selectedFilter === 'recommendation' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setSelectedFilter('recommendation')}
          startIcon={<CheckCircleIcon />}
          sx={{ textTransform: 'none' }}
        >
          Recommendations
        </Button>
        <Box sx={{ flex: 1 }} />
        <IconButton size="small">
          <FilterListIcon />
        </IconButton>
      </Box>

      {/* Insights Feed */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {insights
          .filter(insight => selectedFilter === 'all' || insight.insightType === selectedFilter)
          .map((insight) => {
            const colors = getInsightColor(insight.insightType);
            return (
              <Paper
                key={insight.id}
                sx={{
                  p: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 2,
                    borderColor: colors.text
                  }
                }}
              >
                {/* Header Row */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  {/* Type Badge */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 1.5,
                      bgcolor: colors.bg,
                      flexShrink: 0
                    }}
                  >
                    {getInsightIcon(insight.insightType)}
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: colors.text, textTransform: 'capitalize' }}
                    >
                      {insight.insightType}
                    </Typography>
                  </Box>

                  {/* Metadata */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {insight.building}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      •
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {insight.assetType}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      •
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {insight.timestamp}
                    </Typography>
                  </Box>

                  {/* Impact & Actions */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={insight.impact}
                      size="small"
                      color={getImpactColor(insight.impact) as any}
                      sx={{ textTransform: 'capitalize', height: 24 }}
                    />
                    <IconButton size="small">
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Content */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {insight.assetName}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                    {insight.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {insight.description}
                  </Typography>
                </Box>

                {/* Actions Footer */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ textTransform: 'none' }}
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    sx={{ textTransform: 'none' }}
                  >
                    Dismiss
                  </Button>
                </Box>
              </Paper>
            );
          })}
      </Box>
    </Box>
  );
}
