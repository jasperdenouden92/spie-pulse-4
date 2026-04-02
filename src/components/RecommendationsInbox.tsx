'use client';
import { useThemeMode } from '@/theme-mode-context';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

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

const insights: Insight[] = [
  {
    id: '1',
    assetName: 'Skyline Plaza',
    assetType: 'Building',
    building: 'Skyline Plaza',
    insightType: 'opportunity',
    title: 'Energy consumption trending 15% below forecast',
    description: 'Recent optimizations to HVAC systems are showing measurable impact on overall building energy usage. Consider applying similar changes to other buildings.',
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
    description: 'Usage patterns suggest shifting preventive maintenance to off-peak hours could reduce tenant impact by 40%.',
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
    description: 'Air quality monitoring suggests filter replacement 2 weeks earlier than scheduled could improve efficiency by 12%.',
    impact: 'low',
    timestamp: '1 week ago'
  },
];

type FilterType = 'all' | 'opportunity' | 'warning' | 'info' | 'recommendation';

export default function RecommendationsInbox() {
  const { themeColors: c } = useThemeMode();
  const [filter, setFilter] = useState<FilterType>('all');

  const typeConfig = {
    opportunity: { icon: <TrendingUpIcon sx={{ fontSize: 16 }} />, color: '#2e7d32', bg: '#e8f5e9', label: 'Opportunity' },
    warning: { icon: <WarningAmberOutlinedIcon sx={{ fontSize: 16 }} />, color: '#e65100', bg: '#fff3e0', label: 'Warning' },
    info: { icon: <InfoOutlinedIcon sx={{ fontSize: 16 }} />, color: '#1565c0', bg: c.bgActive, label: 'Info' },
    recommendation: { icon: <LightbulbOutlinedIcon sx={{ fontSize: 16 }} />, color: '#7b1fa2', bg: '#f3e5f5', label: 'Recommendation' },
  };

  const impactConfig = {
    high: { color: '#d32f2f', bg: '#ffebee', label: 'High impact' },
    medium: { color: '#ed6c02', bg: '#fff3e0', label: 'Medium impact' },
    low: { color: '#757575', bg: c.bgPrimaryHover, label: 'Low impact' },
  };
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const visibleInsights = insights
    .filter(i => !dismissedIds.has(i.id))
    .filter(i => filter === 'all' || i.insightType === filter);

  const unreadCount = insights.filter(i => !dismissedIds.has(i.id) && !readIds.has(i.id)).length;

  const handleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setReadIds(prev => new Set(prev).add(id));
  };

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id));
    if (expandedId === id) setExpandedId(null);
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'warning', label: 'Warnings' },
    { key: 'opportunity', label: 'Opportunities' },
    { key: 'recommendation', label: 'Tips' },
    { key: 'info', label: 'Info' },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              Insights
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                size="small"
                color="primary"
                sx={{ height: 20, fontSize: '0.75rem', fontWeight: 600, '& .MuiChip-label': { px: 0.75 } }}
              />
            )}
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <Chip
              key={f.key}
              label={f.label}
              size="small"
              onClick={() => setFilter(f.key)}
              sx={{
                height: 28,
                fontSize: '0.75rem',
                fontWeight: 500,
                bgcolor: filter === f.key ? c.brand : c.bgSecondaryHover,
                color: filter === f.key ? c.bgPrimary : 'text.secondary',
                '&:hover': { bgcolor: filter === f.key ? '#1565c0' : c.borderSecondary },
                '& .MuiChip-label': { px: 1 },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Insights list */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {visibleInsights.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 48, color: '#c8e6c9', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              All caught up! No recommendations to review.
            </Typography>
          </Box>
        ) : (
          visibleInsights.map(insight => {
            const config = typeConfig[insight.insightType];
            const impact = impactConfig[insight.impact];
            const isExpanded = expandedId === insight.id;
            const isRead = readIds.has(insight.id);

            return (
              <Box
                key={insight.id}
                onClick={() => handleExpand(insight.id)}
                sx={{
                  border: '1px solid',
                  borderColor: isExpanded ? config.color : 'divider',
                  borderRadius: 1.5,
                  bgcolor: isRead ? c.bgPrimary : c.bgSecondary,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  overflow: 'hidden',
                  '&:hover': {
                    borderColor: config.color,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  },
                }}
              >
                {/* Compact row */}
                <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  {/* Unread dot */}
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: isRead ? 'transparent' : c.brand,
                    mt: 0.75,
                    flexShrink: 0,
                  }} />

                  {/* Type icon */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: 1,
                    bgcolor: config.bg,
                    flexShrink: 0,
                    mt: 0.25,
                  }}>
                    {config.icon}
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isRead ? 400 : 600,
                        lineHeight: 1.4,
                        mb: 0.25,
                        display: '-webkit-box',
                        WebkitLineClamp: isExpanded ? 'none' : 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {insight.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <BusinessOutlinedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {insight.building}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                        {insight.timestamp}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Impact chip */}
                  <Chip
                    label={insight.impact}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      bgcolor: impact.bg,
                      color: impact.color,
                      '& .MuiChip-label': { px: 0.75 },
                      flexShrink: 0,
                    }}
                  />

                  {/* Expand indicator */}
                  {isExpanded
                    ? <KeyboardArrowUpIcon sx={{ fontSize: 18, color: 'text.disabled', mt: 0.25 }} />
                    : <KeyboardArrowDownIcon sx={{ fontSize: 18, color: 'text.disabled', mt: 0.25 }} />
                  }
                </Box>

                {/* Expanded detail */}
                <Collapse data-annotation-id="recommendationsinbox-accordion" in={isExpanded}>
                  <Box sx={{ px: 2, pb: 2, pt: 0, pl: 7.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.75, mb: 1.5 }}>
                      <Chip
                        icon={config.icon}
                        label={config.label}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          bgcolor: config.bg,
                          color: config.color,
                          '& .MuiChip-icon': { color: config.color, ml: 0.5 },
                          '& .MuiChip-label': { px: 0.75 },
                        }}
                      />
                      <Chip
                        label={insight.assetType}
                        size="small"
                        variant="outlined"
                        sx={{ height: 22, fontSize: '0.7rem', '& .MuiChip-label': { px: 0.75 } }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {insight.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        disableElevation
                        sx={{ textTransform: 'none', fontSize: '0.75rem', height: 30 }}
                      >
                        View details
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        onClick={(e) => { e.stopPropagation(); handleDismiss(insight.id); }}
                        sx={{ textTransform: 'none', fontSize: '0.75rem', height: 30, color: 'text.secondary' }}
                      >
                        Dismiss
                      </Button>
                    </Box>
                  </Box>
                </Collapse>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
