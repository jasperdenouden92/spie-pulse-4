'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export type QuotationDetailTab = 'overview' | 'items' | 'history';

interface QuotationTemplateProps {
  quotationId: string;
  tab?: QuotationDetailTab;
  onTabChange?: (tab: QuotationDetailTab) => void;
}

export default function QuotationTemplate({ quotationId, tab = 'overview' }: QuotationTemplateProps) {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Quotation: {quotationId}</Typography>
      <Typography color="text.secondary">Quotation detail template — ready for implementation</Typography>
    </Box>
  );
}
