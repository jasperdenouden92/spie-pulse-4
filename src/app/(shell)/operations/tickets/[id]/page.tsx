'use client';

import { use } from 'react';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/navigation';
import TicketTemplate from '@/templates/ticket';
import { useAppState } from '@/context/AppStateContext';
import { tickets } from '@/data/tickets';

export default function TicketDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const ticket = tickets.find(t => t.id === id) ?? null;
  const isNarrow = useMediaQuery('(max-width:960px)');
  const router = useRouter();
  const { leftSidebarCollapsed, setLeftSidebarCollapsed } = useAppState();

  if (!ticket) {
    return (
      <Container maxWidth={false} sx={{ pb: 3, flex: 1, pt: 4, px: isNarrow ? 0.5 : 3, textAlign: 'center' }}>
        Ticket not found.
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, pt: 0, px: isNarrow ? 0.5 : 3 }}>
      <TicketTemplate
        ticket={ticket}
        isCollapsed={leftSidebarCollapsed}
        onToggleCollapse={() => setLeftSidebarCollapsed(c => !c)}
        onBackToTickets={() => router.push('/operations/tickets')}
      />
    </Container>
  );
}
