'use client';

import React, { useState } from 'react';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { colors } from '@/colors';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useLanguage } from '@/i18n';
import { insights } from '@/data/insights';

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'opportunity': return <TrendingUpIcon sx={{ fontSize: 20, color: '#2e7d32' }} />;
    case 'warning': return <WarningIcon sx={{ fontSize: 20, color: '#f57c00' }} />;
    case 'info': return <InfoIcon sx={{ fontSize: 20, color: colors.brand }} />;
    case 'recommendation': return <CheckCircleIcon sx={{ fontSize: 20, color: '#9c27b0' }} />;
    default: return null;
  }
};

const getInsightColor = (type: string) => {
  switch (type) {
    case 'opportunity': return { bg: '#e8f5e9', text: '#2e7d32' };
    case 'warning': return { bg: '#fff3e0', text: '#f57c00' };
    case 'info': return { bg: colors.bgActive, text: colors.brand };
    case 'recommendation': return { bg: '#f3e5f5', text: '#9c27b0' };
    default: return { bg: colors.bgPrimaryHover, text: '#757575' };
  }
};

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'default';
    default: return 'default';
  }
};

export default function InsightsAlertsRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  const { t } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button variant={selectedFilter === 'all' ? 'contained' : 'outlined'} size="small" onClick={() => setSelectedFilter('all')} sx={{ textTransform: 'none' }}>{t('insights.allInsights')}</Button>
            <Button variant={selectedFilter === 'opportunity' ? 'contained' : 'outlined'} size="small" onClick={() => setSelectedFilter('opportunity')} startIcon={<TrendingUpIcon />} sx={{ textTransform: 'none' }}>{t('insights.opportunities')}</Button>
            <Button variant={selectedFilter === 'warning' ? 'contained' : 'outlined'} size="small" onClick={() => setSelectedFilter('warning')} startIcon={<WarningIcon />} sx={{ textTransform: 'none' }}>{t('insights.warnings')}</Button>
            <Button variant={selectedFilter === 'recommendation' ? 'contained' : 'outlined'} size="small" onClick={() => setSelectedFilter('recommendation')} startIcon={<CheckCircleIcon />} sx={{ textTransform: 'none' }}>{t('insights.recommendations')}</Button>
            <Box sx={{ flex: 1 }} />
            <IconButton size="small"><FilterListIcon /></IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {insights
              .filter(insight => selectedFilter === 'all' || insight.insightType === selectedFilter)
              .map((insight) => {
                const insightColors = getInsightColor(insight.insightType);
                return (
                  <Paper key={insight.id} sx={{ p: 3, border: '1px solid', borderColor: 'divider', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { boxShadow: 2, borderColor: insightColors.text } }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75, borderRadius: 1.5, bgcolor: insightColors.bg, flexShrink: 0 }}>
                        {getInsightIcon(insight.insightType)}
                        <Typography variant="caption" sx={{ fontWeight: 600, color: insightColors.text, textTransform: 'capitalize' }}>{t(`insights.${insight.insightType}` as any)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">{insight.building}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">•</Typography>
                        <Typography variant="caption" color="text.secondary">{insight.assetType}</Typography>
                        <Typography variant="caption" color="text.secondary">•</Typography>
                        <Typography variant="caption" color="text.secondary">{insight.timestamp}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={insight.impact === 'high' ? t('insights.highImpact') : insight.impact === 'medium' ? t('insights.mediumImpact') : t('insights.lowImpact')} size="small" color={getImpactColor(insight.impact) as any} sx={{ textTransform: 'capitalize', height: 24 }} />
                        <IconButton size="small" sx={{ borderRadius: "50%", aspectRatio: 1 }}><MoreHorizIcon fontSize="small" /></IconButton>
                      </Box>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{insight.assetName}</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>{insight.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{insight.description}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" endIcon={<ArrowForwardIcon />} sx={{ textTransform: 'none' }}>{t('common.viewDetails')}</Button>
                      <Button size="small" variant="text" sx={{ textTransform: 'none' }}>{t('insights.dismiss')}</Button>
                    </Box>
                  </Paper>
                );
              })}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
