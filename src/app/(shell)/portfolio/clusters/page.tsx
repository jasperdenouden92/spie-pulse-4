'use client';

import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import PortfolioClustersPage from '@/components/PortfolioClustersPage';
import { useURLState } from '@/hooks/useURLState';

export default function PortfolioClustersRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  const { selectedTenant } = useURLState();
  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <PortfolioClustersPage tenant={selectedTenant} />
    </Container>
  );
}
