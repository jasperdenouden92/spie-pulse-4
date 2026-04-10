'use client';

import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import InsightsPage from '@/components/Insights';

export default function InsightsPerformanceRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <InsightsPage tab="performance" />
    </Container>
  );
}
