import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AnimatedNumber from './AnimatedNumber';
import KPIToggle, { ToggleState } from './KPIToggle';

interface KPICardProps {
  title: string;
  icon: React.ReactNode;
  score: number;
  trend: number;
  sparklineData: number[];
  onClick?: () => void;
  onToggle?: () => void;
  toggleState?: ToggleState;
  isSelected?: boolean;
  isDimmed?: boolean;
  isCompact?: boolean;
}

export default function KPICard({ title, icon, score, trend, sparklineData, onClick, onToggle, toggleState = 'on', isSelected = false, isDimmed = false, isCompact = false }: KPICardProps) {
  const generateSparkline = (data: number[]) => {
    const width = isCompact ? 70 : 100;
    const height = isCompact ? 30 : 40;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return { x, y };
    });

    return `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
  };

  const isOff = toggleState === 'off';

  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        p: isCompact ? 1.5 : 2.5,
        borderRadius: 1,
        bgcolor: isSelected ? '#e3f2fd' : '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: isCompact ? 1 : 1.5,
        border: '1.5px solid',
        borderColor: isSelected ? '#90caf9' : 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        opacity: isOff ? 0.35 : isDimmed ? 0.5 : 1,
        boxShadow: 'none',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          bgcolor: isSelected ? '#e3f2fd' : '#f8f9fa',
          borderColor: isSelected ? '#42a5f5' : '#bdbdbd',
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
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: isCompact ? 3 : 6, transition: 'gap 0.3s ease' }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: isCompact ? 1 : 1.5, transition: 'gap 0.3s ease' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, fontSize: isCompact ? '1.25rem' : '1.5rem', transition: 'font-size 0.3s ease' }}>
            <AnimatedNumber value={score} />%
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: trend >= 0 ? 'success.main' : 'error.main' }}>
            {trend >= 0 ? <TrendingUpIcon sx={{ fontSize: isCompact ? 12 : 16, transition: 'font-size 0.3s ease' }} /> : <TrendingDownIcon sx={{ fontSize: isCompact ? 12 : 16, transition: 'font-size 0.3s ease' }} />}
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: isCompact ? '0.75rem' : '0.875rem', transition: 'font-size 0.3s ease' }}>
              {Math.abs(trend)}%
            </Typography>
          </Box>
        </Box>

        {/* Sparkline */}
        <svg width={isCompact ? 70 : 100} height={isCompact ? 30 : 40} style={{ overflow: 'visible', transition: 'all 0.3s ease' }}>
          <path
            d={generateSparkline(sparklineData)}
            fill="none"
            stroke="#1976d2"
            strokeWidth={isCompact ? 1.5 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Box>
    </Box>
  );
}
