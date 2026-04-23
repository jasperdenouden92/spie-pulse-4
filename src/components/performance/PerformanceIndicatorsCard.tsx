'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useLanguage } from '@/i18n';
import { GridCard } from '@/components/performance';
import TopicCardsGrid from './TopicCardsGrid';

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

interface PerformanceIndicatorsCardProps {
  icon: React.ReactNode;
  title: string;
  score: number;
  trend: number;
  topics: TopicDef[];
  topicColumns?: number;
  size?: 'md' | 'xl';
  hideViewIndicatorsButton?: boolean;
}

export default function PerformanceIndicatorsCard({ icon, title, score, trend, topics, topicColumns, size = 'xl', hideViewIndicatorsButton = false }: PerformanceIndicatorsCardProps) {
  const { t } = useLanguage();

  return (
    <GridCard size={size}>
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
        {!hideViewIndicatorsButton && (
          <Button
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            sx={{ ml: 'auto', textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
          >
            {t('performance.viewPerformanceIndicators')}
          </Button>
        )}
      </Box>
      <TopicCardsGrid topics={topics} columns={topicColumns} />
    </GridCard>
  );
}
