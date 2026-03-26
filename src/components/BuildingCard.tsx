import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
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
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { colors } from '@/colors';

type OperationalStats = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
};

export type TopicScore = {
  label: string;
  score: number;
  trend: number;
  icon: React.ReactNode;
  color: string;
};

type Props = {
  title: string;
  address?: string;
  image?: string;
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
  energyRating?: string;
  alertCount?: number;
};

function getScoreColor(score: number): string {
  if (score >= 75) return '#4caf50';
  if (score >= 50) return '#ffc107';
  return '#f44336';
}

function getScoreBgColor(score: number): string {
  if (score >= 75) return '#e8f5e9';
  if (score >= 50) return '#fff8e1';
  return '#fce4ec';
}

const energyLabelColors: Record<string, string> = {
  'A+': '#00602b',
  'A': '#00843d',
  'B+': '#4cb848',
  'B': '#8cc63f',
  'C': '#d4e34a',
  'D': '#ffd500',
  'E': '#f5a623',
  'F': '#e8601c',
  'G': '#d0021b',
};

function EnergyLabel({ rating }: { rating: string }) {
  const color = energyLabelColors[rating] || '#999';
  return (
    <Box sx={{
      display: 'inline-flex',
      alignItems: 'center',
      position: 'relative',
      height: 18,
      minWidth: 28,
    }}>
      <svg width="32" height="18" viewBox="0 0 32 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 2C0 0.9 0.9 0 2 0H22L32 9L22 18H2C0.9 18 0 17.1 0 16V2Z" fill={color} />
      </svg>
      <Typography
        sx={{
          position: 'absolute',
          left: 0,
          width: 24,
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '0.6875rem',
          lineHeight: 1,
          color: 'white',
        }}
      >
        {rating}
      </Typography>
    </Box>
  );
}

export default function BuildingCard({
  title,
  address,
  image,
  performance = { green: 50, yellow: 30, red: 20 },
  metricTitle = 'Overall Performance',
  metricIcon,
  overallPerformance,
  showOverall = false,
  operationalStats,
  trend,
  periodLabel,
  topics,
  energyRating,
  alertCount
}: Props) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const hasTopics = topics && topics.length > 0;

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
      <Box sx={{ position: 'relative', mb: hasTopics ? 0.5 : 0 }}>
        {image && (
          <CardMedia component="img" sx={{ height: 96 }} image={image} alt={title} />
        )}
        <IconButton
          className="more-options-btn"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setMenuAnchorEl(e.currentTarget);
          }}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            borderRadius: '50%',
            aspectRatio: 1,
            opacity: menuAnchorEl ? 1 : 0,
            transition: 'opacity 0.2s ease',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 1)'
            }
          }}
        >
          <MoreHorizIcon fontSize="small" />
        </IconButton>
        {hasTopics && alertCount !== undefined && alertCount > 0 && (
          <Box sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '10px',
            px: 1,
            py: 0.5,
            color: 'text.secondary',
          }}>
            <NotificationsActiveOutlinedIcon sx={{ fontSize: 15 }} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1 }}>
              {alertCount}
            </Typography>
          </Box>
        )}
        {hasTopics && (
          <Box sx={{
            position: 'absolute',
            bottom: -14,
            right: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: 'white',
            borderRadius: '10px',
            px: 1.5,
            py: 0.5,
            border: '2px solid white',
            color: getScoreColor(performance.green),
          }}>
            {metricIcon}
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.375rem', lineHeight: 1, color: getScoreColor(performance.green) }}>
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
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={() => setMenuAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => setMenuAnchorEl(null)}>View Details</MenuItem>
          <MenuItem onClick={() => setMenuAnchorEl(null)}>Edit</MenuItem>
          <MenuItem onClick={() => setMenuAnchorEl(null)}>Delete</MenuItem>
        </Menu>
      </Box>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Title row */}
        <Box sx={{ mb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0, fontSize: '0.9375rem' }}>
              {title}
            </Typography>
            {energyRating && <EnergyLabel rating={energyRating} />}
          </Box>
          {address && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0, fontSize: '0.75rem' }}>
              {address}
            </Typography>
          )}
        </Box>

        {hasTopics ? (
          <>
            {/* Topic scores - columns side by side, left-aligned */}
            <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${topics.length}, 1fr)`, gap: 1.5, mt: 1.5 }}>
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
            {/* Original bar-based layout for non-topic views */}
            <Box sx={{ position: 'relative', minHeight: showOverall ? 76 : 40, mt: 1 }}>
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
