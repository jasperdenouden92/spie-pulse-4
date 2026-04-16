'use client';

import React, { useEffect } from 'react';
import { useAppState } from '@/context/AppStateContext';
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
import NatureIcon from '@mui/icons-material/Nature';
import WeekendIcon from '@mui/icons-material/Weekend';
import ComputerIcon from '@mui/icons-material/Computer';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import PageHeader from '@/components/PageHeader';
import { useLanguage } from '@/i18n';
import type { Quotation } from '@/data/quotations';


// ── Category icon + color ──

const CATEGORY_COLORS: Record<string, string> = {
  'HVAC': '#3b82f6',
  'Electrical': '#f59e0b',
  'Plumbing': '#06b6d4',
  'Security': '#10b981',
  'Building Envelope': '#78716c',
  'Vertical Transportation': '#6366f1',
  'Grounds Maintenance': '#22c55e',
  'Furniture': '#a855f7',
  'IT Equipment': '#0ea5e9',
  'Cleaning Services': '#14b8a6',
  'Waste Management': '#64748b',
  'Fire Protection': '#ef4444',
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
    'Security': SecurityIcon,
    'Building Envelope': HomeRepairServiceIcon,
    'Vertical Transportation': ElevatorIcon,
    'Grounds Maintenance': NatureIcon,
    'Furniture': WeekendIcon,
    'IT Equipment': ComputerIcon,
    'Cleaning Services': CleaningServicesIcon,
    'Waste Management': DeleteOutlineIcon,
    'Fire Protection': LocalFireDepartmentIcon,
  };
  const Icon = IconMap[category] ?? HomeRepairServiceIcon;
  return <Icon {...iconProps} />;
}

// Infer category from quotation title by matching template key substrings
const TEMPLATE_KEYS = Object.keys(CATEGORY_COLORS);

export function inferCategory(title: string): string {
  const lower = title.toLowerCase();
  return TEMPLATE_KEYS.find(k => lower.includes(k.toLowerCase())) ?? 'Building Envelope';
}

// ── Template ──

interface QuotationTemplateProps {
  quotation: Quotation;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onBackToQuotations?: () => void;
  onPanelClose?: () => void;
  onPanelFullscreen?: () => void;
}

export default function QuotationTemplate({
  quotation,
  isCollapsed = false,
  onToggleCollapse,
  onBackToQuotations,
  onPanelClose,
  onPanelFullscreen,
}: QuotationTemplateProps) {
  const { t } = useLanguage();
  const category = inferCategory(quotation.title);
  const categoryColor = getCategoryColor(category);
  const { addRecentlyVisited } = useAppState();

  useEffect(() => {
    addRecentlyVisited({
      kind: 'quotation',
      id: quotation.id,
      label: quotation.title,
      subtitle: quotation.building,
    });
  }, [quotation.id, quotation.title, quotation.building, addRecentlyVisited]);

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
      entityIcon={getCategoryIcon(category)}
      entityIconBgColor={categoryColor}
      entityType={category}
      title={quotation.title}
      subtitle={quotation.building}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      panelActions={panelActions}
      breadcrumb={
        <>
          <Typography
            sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 500, fontFamily: '"Inter", sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { color: 'text.primary' } }}
            onClick={onBackToQuotations}
          >
            {t('nav.quotations')}
          </Typography>
          <KeyboardArrowRightIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
          <Typography noWrap sx={{ color: 'text.primary', fontSize: '0.8rem', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
            {quotation.id}
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
