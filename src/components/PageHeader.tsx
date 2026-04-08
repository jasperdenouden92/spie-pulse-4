'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TopBar, { type TopBarProps } from '@/components/TopBar';
import { useThemeMode } from '@/theme-mode-context';

interface PageHeaderProps {
  /** When provided, renders the TopBar with these props above the title/filter strip. */
  topBar?: TopBarProps;
  title?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

function PageHeader({ topBar, title, children, actions }: PageHeaderProps) {
  const { themeColors: c } = useThemeMode();

  return (
    <>
      {topBar && <TopBar {...topBar} />}
      {title && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '2rem', lineHeight: 1.3 }}>
            {title}
          </Typography>
        </Box>
      )}
      {(children || actions) && (
        <Box
          sx={{
            position: 'sticky',
            top: 56,
            zIndex: 100,
            bgcolor: c.bgSecondary,
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: 1.25,
            mx: -3,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {children && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
              {children}
            </Box>
          )}
          {actions && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              {actions}
            </Box>
          )}
        </Box>
      )}
    </>
  );
}

export default PageHeader;
