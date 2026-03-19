import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AnimatedNumber from './AnimatedNumber';
import KPIToggle, { ToggleState } from './KPIToggle';
import { colors } from '@/colors';

export interface PerformanceRating {
  label: string;   // 'Good' | 'Moderate' | 'Poor'
  color: string;   // status color
}

interface KPICardProps {
  title: string;
  icon: React.ReactNode;
  score: number;
  trend: number;
  sparklineData: number[];
  periodLabel?: string | null;
  onClick?: () => void;
  onToggle?: () => void;
  toggleState?: ToggleState;
  isSelected?: boolean;
  isDimmed?: boolean;
  isCompact?: boolean;
  performanceRating?: PerformanceRating;
}

export default function KPICard({ title, icon, score, trend, sparklineData, periodLabel, onClick, onToggle, toggleState = 'on', isSelected = false, isDimmed = false, isCompact = false, performanceRating }: KPICardProps) {
  const generateSparkline = (data: number[]) => {
    const width = isCompact ? 70 : 100;
    const height = isCompact ? 30 : 40;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * width,
      y: height - ((value - min) / range) * height,
    }));

    if (points.length < 2) return '';

    // Catmull-Rom to cubic bezier for smooth curves
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];
      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const isOff = toggleState === 'off';

  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        p: isCompact ? 1.5 : 2.5,
        borderRadius: 1,
        bgcolor: colors.bgPrimary,
        display: 'flex',
        flexDirection: 'column',
        gap: isCompact ? 1 : 1.5,
        border: '1.5px solid',
        borderColor: isSelected ? '#90caf9' : 'transparent',
        boxShadow: isSelected ? '0 0 0 1px rgba(25,118,210,0.12)' : 'none',
        cursor: 'pointer',
        textAlign: 'left',
        opacity: isOff ? 0.35 : isDimmed ? 0.5 : 1,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          bgcolor: colors.bgSecondary,
          borderColor: isSelected ? '#42a5f5' : colors.borderPrimary,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          opacity: 1,
          transform: 'translateY(-1px)',
        }
      }}
    >
      {/* Title row with icon and toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: isCompact ? 1 : 1.5, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isCompact ? 1 : 1.5, minWidth: 0 }}>
          <Box sx={{ color: 'text.secondary', display: 'flex', fontSize: isCompact ? '1rem' : '1.25rem', transition: 'font-size 0.3s ease', flexShrink: 0 }}>
            {icon}
          </Box>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: 'text.primary', fontSize: isCompact ? '0.75rem' : '0.875rem', transition: 'font-size 0.3s ease' }}>
            {title}
          </Typography>
        </Box>
        <KPIToggle
          state={toggleState}
          size={isCompact ? 'small' : 'medium'}
          onClick={onToggle ? (e) => { e.stopPropagation(); onToggle(); } : undefined}
        />
      </Box>

      {/* Score and trend row with sparkline */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: isCompact ? 1.5 : 2, transition: 'gap 0.3s ease', minWidth: 0, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: isCompact ? 1 : 1.5, transition: 'gap 0.3s ease' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, fontSize: isCompact ? '1.25rem' : '1.5rem', transition: 'font-size 0.3s ease' }}>
            <AnimatedNumber value={score} />%
          </Typography>
          {periodLabel !== null && (
            <Tooltip title={`Compared to ${periodLabel}`} arrow placement="top">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: trend >= 0 ? 'success.main' : 'error.main' }}>
                {trend >= 0 ? <TrendingUpIcon sx={{ fontSize: isCompact ? 12 : 16, transition: 'font-size 0.3s ease' }} /> : <TrendingDownIcon sx={{ fontSize: isCompact ? 12 : 16, transition: 'font-size 0.3s ease' }} />}
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: isCompact ? '0.75rem' : '0.875rem', transition: 'font-size 0.3s ease' }}>
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            </Tooltip>
          )}
        </Box>

        {/* Sparkline */}
        <svg width={isCompact ? 70 : 100} height={isCompact ? 30 : 40} style={{ overflow: 'visible', transition: 'all 0.3s ease', marginLeft: 'auto' }}>
          <path
            d={generateSparkline(sparklineData)}
            fill="none"
            stroke={performanceRating ? performanceRating.color : colors.brand}
            strokeWidth={isCompact ? 1.5 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Box>

      {/* Performance rating */}
      {performanceRating && (
        <Chip
          label={performanceRating.label}
          size="small"
          sx={{
            alignSelf: 'flex-start',
            height: 20,
            fontSize: isCompact ? '0.65rem' : '0.7rem',
            fontWeight: 600,
            bgcolor: `${performanceRating.color}18`,
            color: performanceRating.color,
            '& .MuiChip-label': { px: 1 },
          }}
        />
      )}
    </Box>
  );
}
