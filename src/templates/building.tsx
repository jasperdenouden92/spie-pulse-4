'use client';

import React, { useState, useEffect } from 'react';
import { useAppState } from '@/context/AppStateContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import Tooltip from '@mui/material/Tooltip';
import type { Building } from '@/data/buildings';
import { BuildingSelectorPopover } from '@/components/BuildingSelector';
import PageHeader from '@/components/PageHeader';
import { useLanguage } from '@/i18n';

export type BuildingDetailTab = 'overview' | 'performance' | 'zones' | 'assets' | 'tickets' | 'quotations' | 'documents';

function useTabs() {
  const { t } = useLanguage();
  return [
    { value: 'overview' as BuildingDetailTab, label: t('common.overview') },
    { value: 'performance' as BuildingDetailTab, label: t('building.performance') },
    { value: 'zones' as BuildingDetailTab, label: t('building.zones') },
    { value: 'assets' as BuildingDetailTab, label: t('building.assets') },
    { value: 'tickets' as BuildingDetailTab, label: t('building.tickets') },
    { value: 'quotations' as BuildingDetailTab, label: t('building.quotations') },
    { value: 'documents' as BuildingDetailTab, label: t('building.documents') },
  ];
}

interface BuildingDetailPageProps {
  building: Building;
  tab: BuildingDetailTab;
  onTabChange: (tab: BuildingDetailTab) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onBackToPortfolio?: () => void;
  onBuildingChange?: (buildingName: string) => void;
  onPanelClose?: () => void;
  onPanelFullscreen?: () => void;
}

export default function BuildingDetailPage({
  building,
  tab,
  onTabChange,
  isCollapsed = false,
  onToggleCollapse,
  onBackToPortfolio,
  onBuildingChange,
  onPanelClose,
  onPanelFullscreen,
}: BuildingDetailPageProps) {
  const { t } = useLanguage();
  const tabs = useTabs();
  const isNarrow = useMediaQuery('(max-width:960px)');
  const [buildingAnchorEl, setBuildingAnchorEl] = useState<HTMLElement | null>(null);
  const { addRecentlyVisited } = useAppState();

  useEffect(() => {
    addRecentlyVisited({
      kind: 'building',
      id: building.id,
      label: building.name,
      subtitle: building.city,
    });
  }, [building.id, building.name, building.city, addRecentlyVisited]);

  const panelActions = (onPanelClose || onPanelFullscreen) ? (
    <>
      {onPanelClose && (
        <Tooltip title={t('building.closePanel')}>
          <IconButton size="small" onClick={onPanelClose} sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' } }}>
            <KeyboardDoubleArrowRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
      {onPanelFullscreen && (
        <Tooltip title={t('building.openFullscreen')}>
          <IconButton size="small" onClick={onPanelFullscreen} sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' } }}>
            <OpenInFullIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
    </>
  ) : undefined;

  return (
    <PageHeader
      variant="hero"
      image={building.image}
      title={building.name}
      subtitle={building.address}
      tabs={tabs}
      activeTab={tab}
      onTabChange={(v) => onTabChange(v as BuildingDetailTab)}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      panelActions={panelActions}
      breadcrumb={
        <>
          <Typography
            sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', fontWeight: 500, fontFamily: '"Inter", sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { color: '#fff' } }}
            onClick={onBackToPortfolio}
          >
            {t('nav.portfolio')}
          </Typography>
          <KeyboardArrowRightIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
          <Box
            onClick={(e) => setBuildingAnchorEl(e.currentTarget)}
            sx={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', px: 0.75, py: 0.25, mx: -0.75, borderRadius: 1, transition: 'background-color 0.15s ease', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }, minWidth: 0 }}
          >
            <Typography noWrap sx={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
              {building.name}
            </Typography>
            <UnfoldMoreIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', flexShrink: 0 }} />
          </Box>
          <BuildingSelectorPopover
            anchorEl={buildingAnchorEl}
            onClose={() => setBuildingAnchorEl(null)}
            selectedNames={[]}
            onSelectionChange={(names) => {
              const selected = names[0];
              if (selected && selected !== building.name && onBuildingChange) {
                onBuildingChange(selected);
              }
              setBuildingAnchorEl(null);
            }}
            mode="buildings"
          />
        </>
      }
      heroActions={
        <IconButton
          size="small"
          sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' } }}
        >
          <StarOutlineIcon sx={{ fontSize: 18 }} />
        </IconButton>
      }
    />
  );
}
