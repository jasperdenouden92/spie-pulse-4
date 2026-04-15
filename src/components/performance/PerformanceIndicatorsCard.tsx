'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage } from '@/i18n';
import { GridCard } from '@/components/performance';

export interface TopicDef {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  chartColor: string;
  score: number;
  trend: number;
  sparkline: number[];
  goodAbove: number;
  moderateAbove: number;
}

export function getStatusColor(score: number, goodAbove: number, moderateAbove: number): string {
  if (score >= goodAbove) return '#4caf50';
  if (score >= moderateAbove) return '#ff9800';
  return '#f44336';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getStatusLabel(score: number, goodAbove: number, moderateAbove: number, t?: (k: any) => string): string {
  if (score >= goodAbove) return t ? t('performance.good') : 'Good';
  if (score >= moderateAbove) return t ? t('performance.moderate') : 'Moderate';
  return t ? t('performance.poor') : 'Poor';
}

function renderSparkline(data: number[], color: string, w = 80, h = 28) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * h,
  }));
  if (pts.length < 2) return null;
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const t = 0.3;
    d += ` C ${p1.x + (p2.x - p0.x) * t},${p1.y + (p2.y - p0.y) * t} ${p2.x - (p3.x - p1.x) * t},${p2.y - (p3.y - p1.y) * t} ${p2.x},${p2.y}`;
  }
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface PerformanceIndicatorsCardProps {
  icon: React.ReactNode;
  title: string;
  score: number;
  trend: number;
  topics: TopicDef[];
}

export default function PerformanceIndicatorsCard({ icon, title, score, trend, topics }: PerformanceIndicatorsCardProps) {
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();

  return (
    <GridCard size="xl">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        {icon && (
          <Box sx={{ display: 'flex', color: 'text.secondary', '& .MuiSvgIcon-root': { fontSize: 18 } }}>
            {icon}
          </Box>
        )}
        <Typography variant="body2" fontWeight={600}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>
            {score}%
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: trend >= 0 ? 'success.main' : 'error.main' }}>
            {trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
              {Math.abs(trend)}%
            </Typography>
          </Box>
        </Box>
        <Button
          size="small"
          endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
          sx={{ ml: 'auto', textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
        >
          {t('performance.viewPerformanceIndicators')}
        </Button>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${topics.length}, 1fr)`, gap: 2 }}>
        {topics.map(topic => (
          <Paper
            key={topic.key}
            elevation={0}
            sx={{
              p: 2.5,
              border: `1px solid ${c.cardBorder}`,
              borderRadius: '12px',
              bgcolor: c.bgPrimary,
              boxShadow: c.cardShadow,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ color: 'text.secondary', display: 'flex', '& .MuiSvgIcon-root': { fontSize: '18px !important' } }}>{topic.icon}</Box>
              <Typography variant="body2" fontWeight={600} sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{topic.label}</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.15rem', lineHeight: 1.2 }}>{topic.score}%</Typography>
                  <Chip label={getStatusLabel(topic.score, topic.goodAbove, topic.moderateAbove, t)} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: `${getStatusColor(topic.score, topic.goodAbove, topic.moderateAbove)}18`, color: getStatusColor(topic.score, topic.goodAbove, topic.moderateAbove), '& .MuiChip-label': { px: 0.75 } }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: topic.trend >= 0 ? 'success.main' : 'error.main' }}>
                  {topic.trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 12 }} /> : <TrendingDownIcon sx={{ fontSize: 12 }} />}
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>{Math.abs(topic.trend)}%</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {renderSparkline(topic.sparkline, getStatusColor(topic.score, topic.goodAbove, topic.moderateAbove))}
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </GridCard>
  );
}
