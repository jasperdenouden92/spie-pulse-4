'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useThemeMode } from '@/theme-mode-context';
import { GridCard } from '@/components/performance';

export interface DashboardLink {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
}

interface DashboardLinksCardProps {
  icon?: React.ReactNode;
  title: string;
  dashboards: DashboardLink[];
  onNavigate?: (dashboardId: string) => void;
}

export default function DashboardLinksCard({ icon, title, dashboards, onNavigate }: DashboardLinksCardProps) {
  const { themeColors: c } = useThemeMode();

  return (
    <GridCard size="xl">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        {icon && (
          <Box sx={{ display: 'flex', color: 'text.secondary', '& .MuiSvgIcon-root': { fontSize: 18 } }}>
            {icon}
          </Box>
        )}
        <Typography variant="body2" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {dashboards.map(dash => (
          <Paper
            key={dash.id}
            elevation={0}
            onClick={() => onNavigate?.(dash.id)}
            sx={{
              py: 1.5,
              px: 2,
              border: `1px solid ${c.cardBorder}`,
              borderRadius: '12px',
              bgcolor: c.bgPrimary,
              boxShadow: c.cardShadow,
              cursor: 'pointer',
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s ease',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1.5,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <Box sx={{ color: 'text.secondary', display: 'flex', flexShrink: 0 }}>
              {dash.icon}
            </Box>
            <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
              <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.3, fontSize: '0.8rem', mb: 0 }}>{dash.label}</Typography>
              <Typography variant="caption" sx={{ lineHeight: 1.3, fontSize: '0.7rem', color: 'text.secondary', mt: 0 }}>{dash.subtitle}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </GridCard>
  );
}
