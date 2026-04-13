'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import SecurityIcon from '@mui/icons-material/Security';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ElevatorIcon from '@mui/icons-material/Elevator';
import ConstructionIcon from '@mui/icons-material/Construction';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import NatureIcon from '@mui/icons-material/Nature';
import BugReportIcon from '@mui/icons-material/BugReport';
import PageHeader from '@/components/PageHeader';
import type { Ticket } from '@/data/tickets';


// ── Category icon + color ──

const CATEGORY_COLORS: Record<string, string> = {
  'HVAC': '#3b82f6',
  'Electrical': '#f59e0b',
  'Plumbing': '#06b6d4',
  'Safety': '#10b981',
  'Vertical transport': '#6366f1',
  'Building automation': '#8b5cf6',
  'Fire protection': '#ef4444',
  'Structural': '#78716c',
  'Grounds maintenance': '#22c55e',
  'Pest control': '#a16207',
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#6b7280';
}

export function getCategoryIcon(category: string) {
  const iconProps = { sx: { fontSize: 20, color: '#fff' } };
  const IconMap: Record<string, React.ElementType> = {
    'HVAC': AcUnitIcon,
    'Electrical': ElectricalServicesIcon,
    'Plumbing': PlumbingIcon,
    'Safety': SecurityIcon,
    'Vertical transport': ElevatorIcon,
    'Building automation': SettingsInputAntennaIcon,
    'Fire protection': LocalFireDepartmentIcon,
    'Structural': ConstructionIcon,
    'Grounds maintenance': NatureIcon,
    'Pest control': BugReportIcon,
  };
  const Icon = IconMap[category] ?? SettingsInputAntennaIcon;
  return <Icon {...iconProps} />;
}

// ── Header template ──

interface TicketDetailPageProps {
  ticket: Ticket;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onBackToTickets?: () => void;
  onPanelClose?: () => void;
  onPanelFullscreen?: () => void;
}

export default function TicketDetailPage({
  ticket,
  isCollapsed = false,
  onToggleCollapse,
  onBackToTickets,
  onPanelClose,
  onPanelFullscreen,
}: TicketDetailPageProps) {
  const categoryColor = getCategoryColor(ticket.category);

  const panelActions = (onPanelClose || onPanelFullscreen) ? (
    <>
      {onPanelClose && (
        <Tooltip title="Close panel">
          <IconButton size="small" onClick={onPanelClose} sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}>
            <KeyboardDoubleArrowRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
      {onPanelFullscreen && (
        <Tooltip title="Open fullscreen">
          <IconButton size="small" onClick={onPanelFullscreen} sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}>
            <OpenInFullIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
    </>
  ) : undefined;

  return (
    <PageHeader
      variant="entity"
      entityIcon={getCategoryIcon(ticket.category)}
      entityIconBgColor={categoryColor}
      entityType={ticket.category}
      title={ticket.title}
      subtitle={ticket.building}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      panelActions={panelActions}
      breadcrumb={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
          <Typography
            sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 500, fontFamily: '"Inter", sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { color: 'text.primary' } }}
            onClick={onBackToTickets}
          >
            Tickets
          </Typography>
          <KeyboardArrowRightIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
          <Typography noWrap sx={{ color: 'text.primary', fontSize: '0.8rem', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
            {ticket.id}
          </Typography>
        </Box>
      }
      heroActions={
        <IconButton
          size="small"
          sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}
        >
          <StarOutlineIcon sx={{ fontSize: 18 }} />
        </IconButton>
      }
    />
  );
}
