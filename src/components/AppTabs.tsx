'use client';
import { colors, secondaryAlpha } from '@/colors';

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
  const fontSize = size === 'small' ? '0.8125rem' : '0.875rem';
  const py = size === 'small' ? 0.625 : 1;
  const px = size === 'small' ? 1.25 : 1.5;

  return (
    <MuiTabs
      value={value}
      onChange={(_, v) => onChange(v)}
      TabIndicatorProps={{ style: { display: 'none' } }}
      sx={{
        minHeight: 'unset',
        '& .MuiTabs-flexContainer': {
          gap: 0.25,
        },
        '& .MuiTab-root': {
          minHeight: 'unset',
          minWidth: 'unset',
          py,
          px,
          textTransform: 'none',
          fontWeight: 500,
          fontSize,
          borderRadius: '999px',
          color: 'text.secondary',
          transition: 'background-color 0.15s ease, color 0.15s ease',
          '&:hover': {
            bgcolor: secondaryAlpha(0.08),
            color: 'text.primary',
          },
          '&.Mui-selected': {
            bgcolor: secondaryAlpha(0.08),
            color: colors.brand,
            fontWeight: 600,
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
              tab.icon ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {tab.icon}
                  {tab.label}
                </span>
              ) : tab.label
            }
          />
        );
      })}
    </MuiTabs>
  );
}
