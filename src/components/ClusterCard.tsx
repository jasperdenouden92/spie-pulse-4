import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Tooltip from '@mui/material/Tooltip';
import { colors } from '@/colors';
import type { TopicScore } from './BuildingCard';

type OperationalStats = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
};

type Props = {
  title: string;
  buildingCount: number;
  images: string[];
  performance?: {
    green: number;
    yellow: number;
    red: number;
  };
  metricTitle?: string;
  metricIcon?: React.ReactNode;
  overallPerformance?: {
    green: number;
    yellow: number;
    red: number;
  };
  showOverall?: boolean;
  operationalStats?: OperationalStats[];
  trend?: number;
  periodLabel?: string | null;
  topics?: TopicScore[];
};

function getScoreColor(score: number): string {
  if (score >= 75) return '#4caf50';
  if (score >= 50) return '#ffc107';
  return '#f44336';
}

export default function ClusterCard({
  title,
  buildingCount,
  images,
  performance = { green: 50, yellow: 30, red: 20 },
  metricTitle = 'Overall Performance',
  metricIcon,
  overallPerformance,
  showOverall = false,
  operationalStats,
  trend,
  periodLabel,
  topics,
}: Props) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const hasTopics = topics && topics.length > 0;
  // Show up to 3 stacked images, smallest in back, largest in front
  const stackImages = images.slice(0, 3);
  const BASE = 40;
  const SCALE_STEP = 0.8;
  const PEEK = 6; // how many px each background image peeks out

  return (
    <Card sx={{
      borderRadius: '12px',
      boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.08)',
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.12)',
        '& .more-options-btn': { opacity: 1 }
      }
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header: stacked images + title + menu */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: hasTopics ? 1.5 : 1 }}>
          {/* Stacked image thumbnails - smallest in back, largest in front */}
          <Box sx={{
            position: 'relative',
            width: BASE + PEEK * (stackImages.length - 1),
            height: BASE,
            flexShrink: 0,
          }}>
            {stackImages.map((img, i) => {
              const size = Math.round(BASE * Math.pow(SCALE_STEP, i));
              // Reverse: smallest is furthest left (back), largest is rightmost (front)
              const reverseI = stackImages.length - 1 - i;
              return (
                <Box
                  key={i}
                  component="img"
                  src={img}
                  alt=""
                  sx={{
                    position: 'absolute',
                    right: reverseI * PEEK,
                    bottom: 0,
                    width: size,
                    height: size,
                    borderRadius: '6px',
                    objectFit: 'cover',
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    zIndex: stackImages.length - i,
                  }}
                />
              );
            })}
          </Box>

          {/* Title + subtitle */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.3 }}>
              {title}
            </Typography>
            <Box sx={{ color: 'text.secondary' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {buildingCount} building{buildingCount !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>

          {/* Score badge (for topic views) */}
          {hasTopics && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: 'white',
              borderRadius: '10px',
              px: 1.5,
              py: 0.5,
              border: '1px solid',
              borderColor: 'divider',
              color: getScoreColor(performance.green),
              flexShrink: 0,
            }}>
              {metricIcon}
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem', lineHeight: 1, color: getScoreColor(performance.green) }}>
                {performance.green}%
              </Typography>
              {trend !== undefined && periodLabel !== null && (
                <Tooltip title={periodLabel ? `Compared to ${periodLabel}` : ''} arrow placement="top">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: trend >= 0 ? 'success.main' : 'error.main' }}>
                    {trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.6875rem', lineHeight: 1 }}>
                      {Math.abs(trend)}%
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              {overallPerformance && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, ml: 0.5, pl: 0.75, borderLeft: '1px solid', borderColor: 'divider' }}>
                  <SpeedOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.6875rem', lineHeight: 1, color: 'text.secondary' }}>
                    {overallPerformance.green}%
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* More options button */}
          <IconButton
            className="more-options-btn"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setMenuAnchorEl(e.currentTarget);
            }}
            sx={{
              opacity: menuAnchorEl ? 1 : 0,
              transition: 'opacity 0.2s ease',
              flexShrink: 0,
            }}
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={() => setMenuAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => setMenuAnchorEl(null)}>View Details</MenuItem>
            <MenuItem onClick={() => setMenuAnchorEl(null)}>Edit</MenuItem>
          </Menu>
        </Box>

        {hasTopics ? (
          <>
            {/* Topic scores grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${topics.length}, 1fr)`, gap: 1.5 }}>
              {topics.map((topic) => (
                <Box key={topic.label}>
                  <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary', mb: 0.25 }}>
                    {topic.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                    {topic.score}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        ) : (
          <>
            {/* Bar-based layout */}
            <Box sx={{ position: 'relative', minHeight: showOverall ? 76 : 40 }}>
              {/* Overall Performance - base layer */}
              <Box sx={{
                position: showOverall ? 'absolute' : 'relative',
                bottom: showOverall ? 0 : 'auto',
                left: 0,
                right: 0,
                opacity: showOverall ? 0.4 : 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: showOverall ? 'auto' : 'none'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                    Overall Performance
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SpeedOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {overallPerformance?.green}%
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', height: 6, borderRadius: '2px', overflow: 'hidden', bgcolor: colors.bgPrimaryHover }}>
                  <Box sx={{ width: `${overallPerformance?.green || 0}%`, bgcolor: '#4caf50', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                  <Box sx={{ width: `${overallPerformance?.yellow || 0}%`, bgcolor: '#ffc107', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                  <Box sx={{ width: `${overallPerformance?.red || 0}%`, bgcolor: '#f44336', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                </Box>
              </Box>

              {/* Selected Metric - toast layer */}
              <Box sx={{
                position: showOverall ? 'absolute' : 'relative',
                bottom: showOverall ? 0 : 'auto',
                left: 0,
                right: 0,
                transform: showOverall ? 'translateY(-40px)' : 'translateY(0)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
                opacity: 1,
                zIndex: 1
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', transition: 'all 0.3s ease' }}>
                    {metricTitle}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, transition: 'all 0.3s ease' }}>
                    {metricIcon || <SpeedOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.3s ease' }}>
                      {performance.green}%
                    </Typography>
                    {trend !== undefined && periodLabel !== null && (
                      <Tooltip title={periodLabel ? `Compared to ${periodLabel}` : ''} arrow placement="top">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: trend >= 0 ? 'success.main' : 'error.main' }}>
                          {trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
                          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.6875rem', lineHeight: 1 }}>
                            {Math.abs(trend)}%
                          </Typography>
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', height: 8, borderRadius: '2px', overflow: 'hidden', bgcolor: colors.bgPrimaryHover, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                  <Box sx={{ width: `${performance.green}%`, bgcolor: '#4caf50', borderTop: '2px solid rgba(76, 175, 80, 0.4)', borderBottom: '2px solid rgba(76, 175, 80, 0.4)', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                  <Box sx={{ width: `${performance.yellow}%`, bgcolor: '#ffc107', borderTop: '2px solid rgba(255, 193, 7, 0.4)', borderBottom: '2px solid rgba(255, 193, 7, 0.4)', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                  <Box sx={{ width: `${performance.red}%`, bgcolor: '#f44336', borderTop: '2px solid rgba(244, 67, 54, 0.4)', borderBottom: '2px solid rgba(244, 67, 54, 0.4)', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                </Box>
              </Box>
            </Box>

            {/* Operational Stats */}
            {operationalStats && operationalStats.length > 0 && (
              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'space-between' }}>
                  {operationalStats.map((stat, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {stat.icon && (
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: 16 }}>
                          {stat.icon}
                        </Box>
                      )}
                      <Box>
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.625rem', lineHeight: 1.3 }}>
                          {stat.label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.3 }}>
                          {stat.value}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
