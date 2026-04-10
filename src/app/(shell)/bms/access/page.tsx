'use client';

import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function BmsAccessRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>BMS — Access</Typography>
        <Typography variant="body1" color="text.secondary">Access management page — coming soon</Typography>
      </Box>
    </Container>
  );
}
