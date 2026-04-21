'use client';

import React, { useEffect } from 'react';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import PageHeader from '@/components/PageHeader';
import { useLanguage } from '@/i18n';
import { useAppState } from '@/context/AppStateContext';
import type { ServiceOrder } from '@/data/processOrders';

interface ServiceOrderDetailPageProps {
  order: ServiceOrder;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onBackToOrders?: () => void;
  onPanelClose?: () => void;
  onPanelFullscreen?: () => void;
}

const STATUS_COLORS: Record<ServiceOrder['status'], string> = {
  planned: '#3b82f6',
  executed: '#10b981',
};

export default function ServiceOrderDetailPage({
  order,
  isCollapsed = false,
  onToggleCollapse,
  onBackToOrders,
  onPanelClose,
  onPanelFullscreen,
}: ServiceOrderDetailPageProps) {
  const { t } = useLanguage();
  const { addRecentlyVisited } = useAppState();
  const statusColor = STATUS_COLORS[order.status];

  useEffect(() => {
    // Recent items don't yet include service orders as a distinct kind; skip for now.
  }, [order.id, addRecentlyVisited]);

  const panelActions = (onPanelClose || onPanelFullscreen) ? (
    <>
      {onPanelClose && (
        <Tooltip title={t('building.closePanel')}>
          <IconButton size="small" onClick={onPanelClose} sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}>
            <KeyboardDoubleArrowRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
      {onPanelFullscreen && (
        <Tooltip title={t('building.openFullscreen')}>
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
      entityIcon={<AssignmentTurnedInOutlinedIcon sx={{ fontSize: 20, color: '#fff' }} />}
      entityIconBgColor={statusColor}
      entityType={t(`maintenance.processOrders.status.${order.status}` as const)}
      title={order.description}
      subtitle={order.buildingName}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      panelActions={panelActions}
      breadcrumb={
        <>
          <Typography
            sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 500, fontFamily: '"Inter", sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { color: 'text.primary' } }}
            onClick={onBackToOrders}
          >
            {t('operations.maintenance.processOrders')}
          </Typography>
          <KeyboardArrowRightIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
          <Typography noWrap sx={{ color: 'text.primary', fontSize: '0.8rem', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
            {order.number}
          </Typography>
        </>
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
