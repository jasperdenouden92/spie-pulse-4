'use client';

import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/navigation';
import OperationsPage from '@/components/OperationsPage';

export default function OperationsRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  const router = useRouter();

  const handleNavigate = (page: string) => {
    const map: Record<string, string> = {
      operations_tickets: '/operations/tickets',
      operations_quotations: '/operations/quotations',
      operations_docs: '/operations/documents',
      operations_maintenance: '/operations/maintenance',
    };
    router.push(map[page] ?? '/operations');
  };

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <OperationsPage onNavigate={handleNavigate} />
    </Container>
  );
}
