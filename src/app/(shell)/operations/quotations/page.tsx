'use client';

import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import QuotationsPage from '@/components/QuotationsPage';
import { useURLState } from '@/hooks/useURLState';

export default function OperationsQuotationsRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  const { statusFilter } = useURLState();

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <QuotationsPage initialStatuses={statusFilter ? statusFilter.split(',') : undefined} />
    </Container>
  );
}
