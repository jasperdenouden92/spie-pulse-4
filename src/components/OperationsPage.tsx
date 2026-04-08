'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useThemeMode } from '@/theme-mode-context';

type PageKey = 'home' | 'portfolio' | 'portfolio_overview' | 'insights' | 'bms' | 'operations' | 'operations_docs' | 'operations_tickets' | 'operations_quotations' | 'operations_maintenance' | 'themes' | 'workspaces' | 'exports' | 'dashboards';

interface OperationsPageProps {
  onNavigate?: (page: PageKey) => void;
}

const MENU_ITEMS = [
  {
    page: 'operations_docs' as PageKey,
    label: 'Documents',
    description: 'Contracts, reports, manuals and certificates',
    icon: <DescriptionOutlinedIcon sx={{ fontSize: 24 }} />,
    color: '#2196f3',
  },
  {
    page: 'operations_tickets' as PageKey,
    label: 'Tickets',
    description: 'Work orders, corrective and preventive tasks',
    icon: <ConfirmationNumberOutlinedIcon sx={{ fontSize: 24 }} />,
    color: '#ff9800',
  },
  {
    page: 'operations_quotations' as PageKey,
    label: 'Quotations',
    description: 'Pending quotes, approvals and cost overviews',
    icon: <RequestQuoteOutlinedIcon sx={{ fontSize: 24 }} />,
    color: '#9c27b0',
  },
  {
    page: 'operations_maintenance' as PageKey,
    label: 'Maintenance',
    description: 'Scheduled maintenance plans and completion tracking',
    icon: <EngineeringOutlinedIcon sx={{ fontSize: 24 }} />,
    color: '#4caf50',
  },
];

export default function OperationsPage({ onNavigate }: OperationsPageProps) {
  const { themeColors: c } = useThemeMode();

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '2rem', lineHeight: 1.3 }}>
          Operations
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 2 }}>
        {MENU_ITEMS.map((item) => (
          <Box
            key={item.page}
            component="button"
            onClick={() => onNavigate?.(item.page)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2.5,
              border: `1px solid ${c.cardBorder}`,
              borderRadius: '12px',
              bgcolor: c.bgPrimary,
              cursor: 'pointer',
              textAlign: 'left',
              boxShadow: `0 2px 8px 0 ${c.shadow}`,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 16px 0 ${c.shadow}`,
                borderColor: `${item.color}60`,
              },
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '10px',
                bgcolor: `${item.color}14`,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {item.icon}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', mb: 0.25 }}>
                {item.label}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem', lineHeight: 1.4 }}>
                {item.description}
              </Typography>
            </Box>
            <ChevronRightIcon sx={{ fontSize: 18, color: 'text.disabled', flexShrink: 0 }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
