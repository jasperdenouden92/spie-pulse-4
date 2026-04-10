'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export type DocumentDetailTab = 'overview' | 'versions';

interface DocumentTemplateProps {
  documentId: string;
  tab?: DocumentDetailTab;
  onTabChange?: (tab: DocumentDetailTab) => void;
}

export default function DocumentTemplate({ documentId, tab = 'overview' }: DocumentTemplateProps) {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Document: {documentId}</Typography>
      <Typography color="text.secondary">Document detail template — ready for implementation</Typography>
    </Box>
  );
}
