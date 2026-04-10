'use client';

import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import BmsPage from '@/components/BmsPage';

export default function BmsLoggingRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <BmsPage tab="logging" />
    </Container>
  );
}
