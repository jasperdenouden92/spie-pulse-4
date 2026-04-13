'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export type MaintenanceDetailTab = 'overview' | 'schedule' | 'history';

interface MaintenanceTemplateProps {
  maintenanceId: string;
  tab?: MaintenanceDetailTab;
  onTabChange?: (tab: MaintenanceDetailTab) => void;
}

export default function MaintenanceTemplate({ maintenanceId, tab = 'overview' }: MaintenanceTemplateProps) {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Maintenance: {maintenanceId}</Typography>
      <Typography color="text.secondary">Maintenance detail template — ready for implementation</Typography>
    </Box>
  );
}
