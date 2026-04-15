'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useLanguage } from '@/i18n';

export type MaintenanceDetailTab = 'overview' | 'schedule' | 'history';

interface MaintenanceTemplateProps {
  maintenanceId: string;
  tab?: MaintenanceDetailTab;
  onTabChange?: (tab: MaintenanceDetailTab) => void;
}

export default function MaintenanceTemplate({ maintenanceId, tab = 'overview' }: MaintenanceTemplateProps) {
  const { t } = useLanguage();
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>{t('maintenance.overview')}: {maintenanceId}</Typography>
      <Typography color="text.secondary">{t('maintenance.schedule')} · {t('maintenance.history')}</Typography>
    </Box>
  );
}
