'use client';

import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useLanguage } from '@/i18n';

export default function OperationsMaintenanceRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  const { t } = useLanguage();
  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>{t('nav.maintenance')}</Typography>
        <Typography color="text.secondary">{t('operations.maintenancePlaceholder')}</Typography>
      </Box>
    </Container>
  );
}
