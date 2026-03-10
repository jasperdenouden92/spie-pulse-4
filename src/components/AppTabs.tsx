'use client';

import React from 'react';
import MuiTabs from '@mui/material/Tabs';
import MuiTab from '@mui/material/Tab';
import type { SxProps, Theme } from '@mui/material/styles';

interface TabItem {
  value?: string;
  label: string;
  icon?: React.ReactElement;
}

interface AppTabsProps {
  value: string | number;
  onChange: (value: any) => void;
  tabs: TabItem[];
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
  indicatorColor?: string;
}

export default function AppTabs({ value, onChange, tabs, size = 'medium', sx, indicatorColor }: AppTabsProps) {
  const minHeight = size === 'small' ? 36 : 40;
  const fontSize = size === 'small' ? '0.8125rem' : '0.875rem';
  const activeColor = indicatorColor ?? '#1976d2';

  return (
    <MuiTabs
      value={value}
      onChange={(_, v) => onChange(v)}
      TabIndicatorProps={{ style: { display: 'none' } }}
      sx={{
        minHeight,
        '& .MuiTab-root': {
          minHeight,
          py: 0,
          px: 1.5,
          textTransform: 'none',
          fontWeight: 500,
          fontSize,
          // The tab content span handles the underline via its own ::after,
          // positioned at the bottom of the tab by using height: 100% + absolute bottom.
          '& .tab-inner': {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            height: '100%',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 2,
              backgroundColor: 'transparent',
            },
          },
          '&.Mui-selected .tab-inner::after': {
            backgroundColor: activeColor,
          },
        },
        ...sx,
      }}
    >
      {tabs.map((tab, i) => {
        const tabValue = tab.value ?? i;

        return (
          <MuiTab
            key={tabValue}
            value={tabValue}
            label={
              <span className="tab-inner">
                {tab.icon}
                {tab.label}
              </span>
            }
          />
        );
      })}
    </MuiTabs>
  );
}
