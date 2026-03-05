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

type OperationalStats = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
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
};

export default function BuildingCard({
  title,
  address,
  image,
  performance = { green: 50, yellow: 30, red: 20 },
  metricTitle = 'Overall Performance',
  metricIcon,
  overallPerformance,
  showOverall = false,
  operationalStats
}: Props) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Card sx={{
      borderRadius: '12px',
      boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.08)',
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.12)'
      }
    }}>
      <Box sx={{ position: 'relative' }}>
        {image && (
          <CardMedia component="img" height="120" image={image} alt={title} />
        )}
        <IconButton
          size="small"
          onClick={(e) => setMenuAnchorEl(e.currentTarget)}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 1)'
            }
          }}
        >
          <MoreHorizIcon fontSize="small" />
        </IconButton>
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={() => setMenuAnchorEl(null)}
        >
          <MenuItem onClick={() => setMenuAnchorEl(null)}>View Details</MenuItem>
          <MenuItem onClick={() => setMenuAnchorEl(null)}>Edit</MenuItem>
          <MenuItem onClick={() => setMenuAnchorEl(null)}>Delete</MenuItem>
        </Menu>
      </Box>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0, fontSize: '0.9375rem' }}>
          {title}
        </Typography>
        {address && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.75rem' }}>
            {address}
          </Typography>
        )}
        <Box sx={{ position: 'relative', minHeight: showOverall ? 64 : 40 }}>
          {/* Overall Performance - base layer (always present when showOverall) */}
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
            <Box sx={{ display: 'flex', height: 6, borderRadius: '2px', overflow: 'hidden', bgcolor: '#f5f5f5' }}>
              <Box
                sx={{
                  width: `${overallPerformance?.green || 0}%`,
                  bgcolor: '#4caf50',
                  transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
              <Box
                sx={{
                  width: `${overallPerformance?.yellow || 0}%`,
                  bgcolor: '#ffc107',
                  transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
              <Box
                sx={{
                  width: `${overallPerformance?.red || 0}%`,
                  bgcolor: '#f44336',
                  transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </Box>
          </Box>

          {/* Selected Metric - toast layer (rises up when filtering) */}
          <Box sx={{
            position: showOverall ? 'absolute' : 'relative',
            bottom: showOverall ? 0 : 'auto',
            left: 0,
            right: 0,
            transform: showOverall ? 'translateY(-28px)' : 'translateY(0)',
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
              </Box>
            </Box>
            <Box sx={{ display: 'flex', height: 8, borderRadius: '2px', overflow: 'hidden', bgcolor: '#f5f5f5', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
              <Box
                sx={{
                  width: `${performance.green}%`,
                  bgcolor: '#4caf50',
                  borderTop: '2px solid rgba(76, 175, 80, 0.4)',
                  borderBottom: '2px solid rgba(76, 175, 80, 0.4)',
                  transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
              <Box
                sx={{
                  width: `${performance.yellow}%`,
                  bgcolor: '#ffc107',
                  borderTop: '2px solid rgba(255, 193, 7, 0.4)',
                  borderBottom: '2px solid rgba(255, 193, 7, 0.4)',
                  transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
              <Box
                sx={{
                  width: `${performance.red}%`,
                  bgcolor: '#f44336',
                  borderTop: '2px solid rgba(244, 67, 54, 0.4)',
                  borderBottom: '2px solid rgba(244, 67, 54, 0.4)',
                  transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Operational Stats */}
        {operationalStats && operationalStats.length > 0 && (
          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'space-between' }}>
              {operationalStats.map((stat, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
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
      </CardContent>
    </Card>
  );
}
