'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface BmsPageProps {
  tab: 'access' | 'logging';
}

function BmsPage({ tab }: BmsPageProps) {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="body1" color="text.secondary">
        {tab === 'access' ? 'Access' : 'Logging'}
      </Typography>
    </Box>
  );
}


export default React.memo(BmsPage);
