'use client';

import Box from '@mui/material/Box';
import type { SxProps } from '@mui/material';

interface PerformanceGridProps {
  children: React.ReactNode;
  gap?: number;
  sx?: SxProps;
}

export default function PerformanceGrid({ children, gap = 3, sx }: PerformanceGridProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
