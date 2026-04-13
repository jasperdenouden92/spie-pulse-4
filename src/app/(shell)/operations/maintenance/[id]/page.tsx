'use client';

import { use } from 'react';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function MaintenanceDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNarrow = useMediaQuery('(max-width:960px)');
  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>Maintenance: {id}</Typography>
        <Typography color="text.secondary">Maintenance detail template — coming soon</Typography>
      </Box>
    </Container>
  );
}
