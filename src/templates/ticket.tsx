'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export type TicketDetailTab = 'overview' | 'history' | 'comments';

interface TicketTemplateProps {
  ticketId: string;
  tab?: TicketDetailTab;
  onTabChange?: (tab: TicketDetailTab) => void;
}

export default function TicketTemplate({ ticketId, tab = 'overview' }: TicketTemplateProps) {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Ticket: {ticketId}</Typography>
      <Typography color="text.secondary">Ticket detail template — ready for implementation</Typography>
    </Box>
  );
}
