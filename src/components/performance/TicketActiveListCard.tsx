'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import TagOutlinedIcon from '@mui/icons-material/TagOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useThemeMode } from '@/theme-mode-context';
import GridCard from './GridCard';
import type { GridCardSize } from './GridCard';
import type { TicketStatus, StatusCount } from './TicketStatusOverviewCard';

export interface TicketItem {
  id: string;
  title: string;
  building: string;
  status: TicketStatus;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  createdDate: string;
  assignee: string;
  werkbon: string;
  referentie: string;
  amount?: number;
}

const ACTIVE_STATUSES: TicketStatus[] = ['Received', 'In operation', 'To approve', 'Function restored'];
const ACTION_REQUIRED_STATUSES: TicketStatus[] = ['To approve'];

interface TicketActiveListCardProps {
  size?: GridCardSize;
  tickets: TicketItem[];
  statusCounts: StatusCount[];
  onViewAll?: () => void;
}

export default function TicketActiveListCard({ size = 'lg', tickets, statusCounts, onViewAll }: TicketActiveListCardProps) {
  const { themeColors: c } = useThemeMode();
  const [actionFilter, setActionFilter] = useState(false);

  function getStatusColor(status: TicketStatus): string {
    return statusCounts.find(s => s.status === status)?.color ?? '#888';
  }

  const filtered = tickets.filter(t =>
    actionFilter ? ACTION_REQUIRED_STATUSES.includes(t.status) : ACTIVE_STATUSES.includes(t.status)
  );

  return (
    <GridCard
      size={size}
      title="Active Tickets"
      headerRight={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<FilterListIcon sx={{ fontSize: 13 }} />}
            label="Action required"
            size="small"
            onClick={() => setActionFilter(f => !f)}
            sx={{
              height: 22, fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer',
              bgcolor: actionFilter ? `${c.brand}14` : 'transparent',
              color: actionFilter ? c.brand : 'text.secondary',
              border: '1px solid', borderColor: actionFilter ? c.brand : 'divider',
              '& .MuiChip-icon': { ml: 0.5, mr: -0.25, color: actionFilter ? c.brand : 'text.secondary' },
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
          <Button
            size="small"
            endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
            onClick={onViewAll}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.7rem', minWidth: 0 }}
          >
            View all
          </Button>
        </Box>
      }
    >
      <Box sx={{ flex: 1, overflow: 'auto', maxHeight: 320, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {filtered.map(t => (
          <Box
            key={t.id}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: 1.5,
              borderBottom: '1px solid', borderColor: 'divider',
              borderRadius: 0.5,
              cursor: 'pointer', transition: 'background-color 0.15s ease',
              '&:hover': { bgcolor: 'action.hover' },
              '&:last-child': { borderBottom: 'none' },
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.8rem' }}>{t.id}</Typography>
                <Typography variant="body2" fontWeight={500} noWrap sx={{ fontSize: '0.8rem', color: 'text.primary' }}>{t.title}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnOutlinedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>{t.building}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>{t.createdDate}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ReceiptLongOutlinedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>{t.werkbon}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TagOutlinedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>{t.referentie}</Typography>
                </Box>
              </Box>
            </Box>
            <Chip
              icon={t.category === 'Storing'
                ? <ErrorOutlineIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                : <SupportAgentOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />}
              label={t.category}
              size="small"
              sx={{
                height: 20, fontSize: '0.65rem', fontWeight: 500,
                bgcolor: 'action.hover', color: 'text.secondary',
                '& .MuiChip-label': { px: 0.5 },
                '& .MuiChip-icon': { ml: 0.5, mr: 0 },
                flexShrink: 0,
              }}
            />
            {t.amount != null && (
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem', flexShrink: 0, minWidth: 70, textAlign: 'right', color: 'text.secondary' }}>
                €{t.amount.toLocaleString('nl-NL')}
              </Typography>
            )}
            <Chip
              label={t.status}
              size="small"
              sx={{
                height: 20, fontSize: '0.65rem', fontWeight: 600,
                bgcolor: `${getStatusColor(t.status)}14`,
                color: getStatusColor(t.status),
                '& .MuiChip-label': { px: 0.75 },
                flexShrink: 0, minWidth: 80, justifyContent: 'center',
              }}
            />
            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, width: 56, justifyContent: 'center' }}>
              {t.status === 'To approve' && (
                <>
                  <IconButton size="small" onClick={(e) => e.stopPropagation()} sx={{ width: 24, height: 24, bgcolor: '#4caf5014', color: '#4caf50', '&:hover': { bgcolor: '#4caf5028' } }}>
                    <CheckIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <IconButton size="small" onClick={(e) => e.stopPropagation()} sx={{ width: 24, height: 24, bgcolor: '#ef535014', color: '#ef5350', '&:hover': { bgcolor: '#ef535028' } }}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </GridCard>
  );
}
