import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AnimatedNumber from './AnimatedNumber';
import { ToggleState } from './KPIToggle';
import { useThemeMode } from '@/theme-mode-context';

export interface PerformanceRating {
  label: string;
  color: string;
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
  variant?: 'default' | 'nested';
}

export default function KPICard({ title, icon, score, trend, sparklineData, periodLabel, onClick, onToggle, toggleState = 'on', isSelected = false, isDimmed = false, isCompact = false, performanceRating, variant = 'default' }: KPICardProps) {
  const { themeColors: c } = useThemeMode();

  const generateSparkline = (data: number[]) => {
    const width = isCompact ? 60 : 80;
    const height = isCompact ? 32 : 40;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * width,
      y: height - ((value - min) / range) * height,
    }));

    if (points.length < 2) return '';

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

  return (
    <Box
      component="button"
      onClick={(e: React.MouseEvent) => { e.stopPropagation(); onClick?.(); }}
      sx={{
        p: isCompact ? 1.5 : 2,
        borderRadius: '12px',
        bgcolor: isSelected ? c.bgPrimaryHover : c.bgPrimary,
        display: 'flex',
        flexDirection: 'row',
        gap: 1,
        border: `1px solid ${c.cardBorder}`,
        boxShadow: isSelected
          ? `0 2px 12px 0 ${c.shadowMedium}`
          : `0 2px 12px 0 ${c.shadow}`,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 20px 0 ${c.shadowMedium}`,
        }
      }}
    >
      {/* Full width column */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
        {/* Row 1: Icon + Title | Radio */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ color: 'text.secondary', display: 'flex', flexShrink: 0, '& .MuiSvgIcon-root': { fontSize: '18px !important' } }}>
            {icon}
          </Box>
          <Typography variant="body2" noWrap sx={{ fontFamily: 'var(--font-jost), "Jost", sans-serif', fontWeight: 600, color: 'text.secondary', fontSize: isCompact ? '0.7rem' : '0.8rem', flex: 1 }}>
            {title}
          </Typography>
          {onToggle && (
            <Box
              component="span"
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggle(); }}
              sx={{ display: 'inline-flex', cursor: 'pointer', color: isSelected ? c.brand : c.borderPrimary, transition: 'color 0.2s ease', flexShrink: 0, '&:hover': { color: isSelected ? c.brandSecondary : c.textTertiary } }}
            >
              {isSelected
                ? <RadioButtonCheckedIcon sx={{ fontSize: isCompact ? 16 : 18 }} />
                : <RadioButtonUncheckedIcon sx={{ fontSize: isCompact ? 16 : 18 }} />}
            </Box>
          )}
        </Box>

        {/* Row 2+3: Left = Percentage + Trend/Label, Right = Sparkline */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Left: score + trend */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: isCompact ? '1rem' : '1.15rem', lineHeight: 1.2 }}>
              <AnimatedNumber value={score} />%
            </Typography>
            {periodLabel !== null && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: trend >= 0 ? 'success.main' : 'error.main', flexShrink: 0 }}>
                <Tooltip title={`Compared to ${periodLabel}`} arrow placement="top">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 12 }} /> : <TrendingDownIcon sx={{ fontSize: 12 }} />}
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                      {Math.abs(trend)}%
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            )}
          </Box>

          {/* Status label */}
          {performanceRating && (
            <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <Chip
                label={performanceRating.label}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  bgcolor: `${performanceRating.color}18`,
                  color: performanceRating.color,
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            </Box>
          )}

          {/* Right: sparkline spanning percentage + trend rows */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <svg width={isCompact ? 60 : 80} height={isCompact ? 32 : 40} style={{ overflow: 'visible' }}>
              <path
                d={generateSparkline(sparklineData)}
                fill="none"
                stroke={performanceRating ? performanceRating.color : c.brand}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
