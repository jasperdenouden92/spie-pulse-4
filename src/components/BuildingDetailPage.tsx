'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import type { Building } from '@/data/buildings';
import { BuildingSelectorPopover } from './BuildingSelector';
import PageHeader from '@/components/PageHeader';

export type BuildingDetailTab = 'overview' | 'performance' | 'zones' | 'assets' | 'tickets' | 'quotations';

const TABS: { value: BuildingDetailTab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'performance', label: 'Performance' },
  { value: 'zones', label: 'Zones' },
  { value: 'assets', label: 'Assets' },
  { value: 'tickets', label: 'Tickets' },
  { value: 'quotations', label: 'Quotations' },
];

interface BuildingDetailPageProps {
  building: Building;
  tab: BuildingDetailTab;
  onTabChange: (tab: BuildingDetailTab) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onBackToPortfolio?: () => void;
  onBackToCluster?: () => void;
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
  onBackToCluster,
  onBuildingChange,
}: BuildingDetailPageProps) {
  const isNarrow = useMediaQuery('(max-width:960px)');
  const [buildingAnchorEl, setBuildingAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <PageHeader
      variant="hero"
      image={building.image}
      title={building.name}
      subtitle={building.address}
      tabs={TABS}
      activeTab={tab}
      onTabChange={(v) => onTabChange(v as BuildingDetailTab)}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      breadcrumb={
        <>
          <Typography
            sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', fontWeight: 500, fontFamily: '"Inter", sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { color: '#fff' } }}
            onClick={onBackToPortfolio}
          >
            Portfolio
          </Typography>
          <KeyboardArrowRightIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
          <Typography
            noWrap
            sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', fontWeight: 500, fontFamily: '"Inter", sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { color: '#fff' } }}
            onClick={onBackToCluster}
          >
            {building.group}
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
