'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useLanguage } from '@/i18n';

export type DocumentDetailTab = 'overview' | 'versions';

interface DocumentTemplateProps {
  documentId: string;
  tab?: DocumentDetailTab;
  onTabChange?: (tab: DocumentDetailTab) => void;
}

export default function DocumentTemplate({ documentId, tab = 'overview' }: DocumentTemplateProps) {
  const { t } = useLanguage();
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>{t('document.overview')}: {documentId}</Typography>
      <Typography color="text.secondary">{t('document.versions')}</Typography>
    </Box>
  );
}
