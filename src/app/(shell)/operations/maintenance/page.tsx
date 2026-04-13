'use client';

import React from 'react';
import { useFilterParams } from '@/hooks/useFilterParams';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PageHeader from '@/components/PageHeader';
import AppTabs from '@/components/AppTabs';
import { useThemeMode } from '@/theme-mode-context';

type MaintenanceTab = 'preventive' | 'process-orders' | 'mjop';

const TABS: { value: MaintenanceTab; label: string }[] = [
  { value: 'preventive', label: 'Preventive Maintenance' },
  { value: 'process-orders', label: 'Process Orders' },
  { value: 'mjop', label: 'Multi-year Maintenance Budget' },
];

export default function OperationsMaintenanceRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  const { themeColors: c } = useThemeMode();
  const { get, set } = useFilterParams();

  const tab = get('tab', 'preventive') as MaintenanceTab;

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <PageHeader title="Maintenance" />

      <Box
        sx={{
          position: 'sticky',
          top: 56,
          zIndex: 100,
          bgcolor: c.bgSecondary,
          py: 1.25,
          mx: -3,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <AppTabs
          value={tab}
          onChange={(v: MaintenanceTab) => set('tab', v)}
          tabs={TABS}
          variant="pill"
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        {tab === 'preventive' && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Preventive Maintenance — coming soon</Typography>
          </Box>
        )}
        {tab === 'process-orders' && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Process Orders — coming soon</Typography>
          </Box>
        )}
        {tab === 'mjop' && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Multi-year Maintenance Budget — coming soon</Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}
