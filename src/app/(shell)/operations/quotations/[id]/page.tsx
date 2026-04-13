'use client';

import { use } from 'react';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/navigation';
import QuotationTemplate from '@/templates/quotation';
import { useAppState } from '@/context/AppStateContext';
import { quotations } from '@/data/quotations';

export default function QuotationDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const quotation = quotations.find(q => q.id === id) ?? null;
  const isNarrow = useMediaQuery('(max-width:960px)');
  const router = useRouter();
  const { leftSidebarCollapsed, setLeftSidebarCollapsed } = useAppState();

  if (!quotation) {
    return (
      <Container maxWidth={false} sx={{ pb: 3, flex: 1, pt: 4, px: isNarrow ? 0.5 : 3, textAlign: 'center' }}>
        Quotation not found.
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, pt: 0, px: isNarrow ? 0.5 : 3 }}>
      <QuotationTemplate
        quotation={quotation}
        isCollapsed={leftSidebarCollapsed}
        onToggleCollapse={() => setLeftSidebarCollapsed(c => !c)}
        onBackToQuotations={() => router.push('/operations/quotations')}
      />
    </Container>
  );
}
