'use client';

import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import PortfolioEquipmentTypesPage from '@/components/PortfolioEquipmentTypesPage';

export default function PortfolioEquipmentTypesRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <PortfolioEquipmentTypesPage />
    </Container>
  );
}
