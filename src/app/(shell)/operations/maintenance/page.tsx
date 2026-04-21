'use client';

import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AppTabs from '@/components/AppTabs';
import LongTermMaintenancePlan from '@/components/maintenance/LongTermMaintenancePlan';
import ProcessOrdersView from '@/components/maintenance/ProcessOrdersView';
import { useLanguage } from '@/i18n';
import { useURLState } from '@/hooks/useURLState';

const TAB_VALUES = ['preventive', 'process-orders', 'long-term-plan'] as const;
type MaintenanceTab = (typeof TAB_VALUES)[number];
const DEFAULT_TAB: MaintenanceTab = 'preventive';

export default function OperationsMaintenanceRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  const { t } = useLanguage();
  const { tab, setTab } = useURLState();

  const activeTab: MaintenanceTab = (TAB_VALUES as readonly string[]).includes(tab)
    ? (tab as MaintenanceTab)
    : DEFAULT_TAB;

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <Box sx={{ mb: 2 }}>
        <AppTabs
          value={activeTab}
          onChange={(v: string) => setTab(v === DEFAULT_TAB ? '' : v)}
          tabs={[
            { value: 'preventive', label: t('operations.maintenance.preventive') },
            { value: 'process-orders', label: t('operations.maintenance.processOrders') },
            { value: 'long-term-plan', label: t('operations.maintenance.longTermPlan') },
          ]}
        />
      </Box>

      {activeTab === 'long-term-plan' ? (
        <LongTermMaintenancePlan />
      ) : activeTab === 'process-orders' ? (
        <ProcessOrdersView />
      ) : (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            {t('operations.maintenance.preventive')}
          </Typography>
          <Typography color="text.secondary">{t('operations.maintenancePlaceholder')}</Typography>
        </Box>
      )}
    </Container>
  );
}
