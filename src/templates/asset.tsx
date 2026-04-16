'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import Tooltip from '@mui/material/Tooltip';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import SecurityIcon from '@mui/icons-material/Security';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ElevatorIcon from '@mui/icons-material/Elevator';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import type { AssetNode } from '@/data/assetTree';
import { getPathToAsset } from '@/data/assetTree';
import { buildings as allBuildings } from '@/data/buildings';
import PageHeader from '@/components/PageHeader';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage } from '@/i18n';

export type AssetDetailTab = 'overview' | 'tickets' | 'quotations' | 'documents';

function useAssetTabs() {
  const { t } = useLanguage();
  return [
    { value: 'overview' as AssetDetailTab, label: t('common.overview') },
    { value: 'tickets' as AssetDetailTab, label: t('building.tickets') },
    { value: 'quotations' as AssetDetailTab, label: t('building.quotations') },
    { value: 'documents' as AssetDetailTab, label: t('nav.documents') },
  ];
}

const CATEGORY_COLORS: Record<string, string> = {
  'HVAC': '#3b82f6',
  'Lighting': '#f59e0b',
  'Fire Safety': '#ef4444',
  'Electrical': '#8b5cf6',
  'Plumbing': '#06b6d4',
  'Security': '#10b981',
  'Elevator': '#6366f1',
};

function getAssetColor(category?: string): string {
  return CATEGORY_COLORS[category ?? ''] ?? '#6b7280';
}

function getCategoryIcon(category?: string) {
  const iconProps = { sx: { fontSize: 20, color: '#fff' } };
  const IconMap: Record<string, React.ElementType> = {
    'HVAC': AcUnitIcon,
    'Electrical': ElectricalServicesIcon,
    'Lighting': LightbulbIcon,
    'Plumbing': PlumbingIcon,
    'Security': SecurityIcon,
    'Fire Safety': LocalFireDepartmentIcon,
    'Elevator': ElevatorIcon,
  };
  const Icon = IconMap[category ?? ''] ?? SettingsInputAntennaIcon;
  return <Icon {...iconProps} />;
}

// ── Asset selector popover (sibling assets at the same level) ──

interface AssetSelectorPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  currentAssetId: string;
  siblingAssets: AssetNode[];
  onAssetSelect: (assetId: string) => void;
}

function AssetSelectorPopover({ anchorEl, onClose, currentAssetId, siblingAssets, onAssetSelect }: AssetSelectorPopoverProps) {
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (anchorEl) {
      setSearch('');
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [anchorEl]);

  const filtered = useMemo(() => {
    if (!search.trim()) return siblingAssets;
    const q = search.toLowerCase();
    return siblingAssets.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.metadata?.category?.toLowerCase().includes(q) ||
      a.metadata?.manufacturer?.toLowerCase().includes(q)
    );
  }, [siblingAssets, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, AssetNode[]>();
    for (const a of filtered) {
      const cat = a.metadata?.category ?? 'Other';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(a);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{ paper: { sx: { borderRadius: '10px', mt: 0.5, width: 280, maxHeight: 400, display: 'flex', flexDirection: 'column', overflow: 'hidden' } } }}
    >
      <Box sx={{ px: 1.5, pt: 1.5, pb: 1, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1, py: 0.5, borderRadius: '6px', border: '1px solid', borderColor: 'divider', bgcolor: c.bgSecondary }}>
          <SearchIcon sx={{ fontSize: 15, color: 'text.disabled', flexShrink: 0 }} />
          <InputBase
            inputRef={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('asset.searchAssets')}
            sx={{ fontSize: '0.8rem', flex: 1, '& input': { p: 0, lineHeight: 1 } }}
          />
        </Box>
      </Box>
      <Box sx={{ overflowY: 'auto', pb: 1 }}>
        {grouped.length === 0 ? (
          <Typography sx={{ px: 2, py: 2, fontSize: '0.8rem', color: 'text.disabled' }}>{t('asset.noAssetsFound')}</Typography>
        ) : (
          grouped.map(([category, assets]) => (
            <Box key={category}>
              <Typography sx={{ px: 2, pt: 1.5, pb: 0.5, fontSize: '0.7rem', fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {category}
              </Typography>
              {assets.map(asset => {
                const color = getAssetColor(asset.metadata?.category);
                const isSelected = asset.id === currentAssetId;
                return (
                  <Box
                    key={asset.id}
                    onClick={() => { onAssetSelect(asset.id); onClose(); }}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      mx: 1, px: 1.5, py: 0.875,
                      borderRadius: '6px', cursor: 'pointer',
                      bgcolor: isSelected ? c.bgActive : 'transparent',
                      '&:hover': { bgcolor: isSelected ? c.bgActive : c.bgPrimaryHover },
                    }}
                  >
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: isSelected ? 600 : 400, flex: 1, lineHeight: 1.3 }}>
                      {asset.name}
                    </Typography>
                    {isSelected && <CheckIcon sx={{ fontSize: 16, color: c.brandSecondary, flexShrink: 0 }} />}
                  </Box>
                );
              })}
            </Box>
          ))
        )}
      </Box>
    </Popover>
  );
}

// ── Breadcrumb with collapsing "..." ──

interface BreadcrumbSegment {
  label: string;
  onClick?: () => void;
}

interface AssetBreadcrumbProps {
  ancestors: BreadcrumbSegment[];
  asset: AssetNode;
  siblingAssets: AssetNode[];
  onAssetChange?: (id: string) => void;
}

// When there are more than 4 ancestors, collapse middle ones under "..."
// keeping the first (Portfolio) and last 2 always visible.
const MAX_VISIBLE_ANCESTORS = 4;

function AssetBreadcrumb({ ancestors, asset, siblingAssets, onAssetChange }: AssetBreadcrumbProps) {
  const { themeColors: c } = useThemeMode();
  const [ellipsisAnchor, setEllipsisAnchor] = useState<HTMLElement | null>(null);
  const [assetSelectorAnchor, setAssetSelectorAnchor] = useState<HTMLElement | null>(null);

  const useEllipsis = ancestors.length > MAX_VISIBLE_ANCESTORS;

  // Items hidden under "...": ancestors[1 .. n-3] (keep first and last 2)
  const collapsedSegments = useEllipsis ? ancestors.slice(1, ancestors.length - 2) : [];
  const visibleSegments = useEllipsis
    ? [ancestors[0], ...ancestors.slice(ancestors.length - 2)]
    : ancestors;

  const sep = <KeyboardArrowRightIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />;

  const segmentLabel = (seg: BreadcrumbSegment, isCurrent = false) => (
    <Typography
      noWrap
      onClick={seg.onClick}
      sx={{
        color: isCurrent ? 'text.primary' : 'text.secondary',
        fontWeight: isCurrent ? 600 : 500,
        fontSize: '0.8rem',
        fontFamily: '"Inter", sans-serif',
        cursor: seg.onClick ? 'pointer' : 'default',
        whiteSpace: 'nowrap',
        maxWidth: 140,
        '&:hover': seg.onClick ? { color: 'text.primary' } : {},
      }}
    >
      {seg.label}
    </Typography>
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
      {visibleSegments.map((seg, i) => (
        <React.Fragment key={i}>
          {i > 0 && sep}
          {/* Insert ellipsis after the first visible segment when collapsing */}
          {useEllipsis && i === 1 && (
            <>
              <Box
                onClick={(e) => setEllipsisAnchor(e.currentTarget)}
                sx={{
                  display: 'flex', alignItems: 'center', px: 0.5, py: 0.25,
                  borderRadius: '4px', cursor: 'pointer', color: 'text.secondary',
                  '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                }}
              >
                <MoreHorizIcon sx={{ fontSize: 16 }} />
              </Box>
              {sep}
            </>
          )}
          {segmentLabel(seg)}
        </React.Fragment>
      ))}

      {/* Current asset with selector */}
      {sep}
      <Box
        onClick={(e) => siblingAssets.length > 1 && setAssetSelectorAnchor(e.currentTarget)}
        sx={{
          display: 'flex', alignItems: 'center', gap: '4px',
          cursor: siblingAssets.length > 1 ? 'pointer' : 'default',
          px: 0.75, py: 0.25, mx: -0.75,
          borderRadius: 1, transition: 'background-color 0.15s ease',
          '&:hover': { bgcolor: siblingAssets.length > 1 ? 'action.hover' : 'transparent' },
          minWidth: 0,
        }}
      >
        <Typography noWrap sx={{ color: 'text.primary', fontSize: '0.8rem', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
          {asset.name}
        </Typography>
        {siblingAssets.length > 1 && <UnfoldMoreIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />}
      </Box>

      {/* Ellipsis dropdown */}
      <Popover
        open={Boolean(ellipsisAnchor)}
        anchorEl={ellipsisAnchor}
        onClose={() => setEllipsisAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { borderRadius: '10px', mt: 0.5, minWidth: 200, maxWidth: 280, overflow: 'hidden' } } }}
      >
        <Paper elevation={0} sx={{ py: 0.5 }}>
          <MenuList dense disablePadding>
            {collapsedSegments.map((seg, i) => (
              <MenuItem
                key={i}
                onClick={() => { seg.onClick?.(); setEllipsisAnchor(null); }}
                sx={{ px: 1.5, py: 0.75, gap: 1, minHeight: 'unset' }}
              >
                {i > 0 && (
                  <SubdirectoryArrowRightIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0, ml: (i - 1) * 1.5 }} />
                )}
                <Typography sx={{ fontSize: '0.85rem', color: 'text.primary', fontFamily: '"Inter", sans-serif' }}>
                  {seg.label}
                </Typography>
              </MenuItem>
            ))}
          </MenuList>
        </Paper>
      </Popover>

      {/* Asset selector */}
      {siblingAssets.length > 1 && (
        <AssetSelectorPopover
          anchorEl={assetSelectorAnchor}
          onClose={() => setAssetSelectorAnchor(null)}
          currentAssetId={asset.id}
          siblingAssets={siblingAssets}
          onAssetSelect={(id) => onAssetChange?.(id)}
        />
      )}
    </Box>
  );
}

// ── Main component ──

interface AssetDetailPageProps {
  asset: AssetNode;
  tab: AssetDetailTab;
  onTabChange: (tab: AssetDetailTab) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onBackToPortfolio?: () => void;
  onBackToCluster?: () => void;
  onBackToBuilding?: () => void;
  onBackToZone?: () => void;
  onAssetChange?: (assetId: string) => void;
  onPanelClose?: () => void;
  onPanelFullscreen?: () => void;
}

export default function AssetDetailPage({
  asset,
  tab,
  onTabChange,
  isCollapsed = false,
  onToggleCollapse,
  onBackToPortfolio,
  onBackToCluster,
  onBackToBuilding,
  onBackToZone,
  onAssetChange,
  onPanelClose,
  onPanelFullscreen,
}: AssetDetailPageProps) {
  const { t } = useLanguage();
  const tabs = useAssetTabs();
  const assetColor = getAssetColor(asset.metadata?.category);

  // Resolve path: [building, floor, zone, ...parentAssets, currentAsset]
  const path = useMemo(() => getPathToAsset(asset.id) ?? [], [asset.id]);

  const buildingNode = useMemo(() => path.find(s => s.node.type === 'building')?.node ?? null, [path]);
  const floorNode = useMemo(() => path.find(s => s.node.type === 'floor')?.node ?? null, [path]);
  const zoneNode = useMemo(() => path.find(s => s.node.type === 'zone')?.node ?? null, [path]);

  // Parent assets: path items with type='asset', excluding the current asset (last in path)
  const parentAssetNodes = useMemo(
    () => path.slice(0, -1).filter(s => s.node.type === 'asset').map(s => s.node),
    [path]
  );

  // Siblings: other assets at the same level as the current asset
  const siblingAssets = useMemo(
    () => (path[path.length - 1]?.siblings ?? []).filter(n => n.type === 'asset'),
    [path]
  );

  // Cluster name from buildings data
  const clusterName = useMemo(
    () => buildingNode ? (allBuildings.find(b => b.name === buildingNode.name)?.group ?? null) : null,
    [buildingNode]
  );

  // Build ancestors array (everything before the current asset in the breadcrumb)
  const ancestors = useMemo<BreadcrumbSegment[]>(() => {
    const segs: BreadcrumbSegment[] = [];
    segs.push({ label: t('nav.portfolio'), onClick: onBackToPortfolio });
    if (clusterName) segs.push({ label: clusterName, onClick: onBackToCluster });
    if (buildingNode) segs.push({ label: buildingNode.name, onClick: onBackToBuilding });
    if (zoneNode) segs.push({ label: zoneNode.name, onClick: onBackToZone });
    for (const parentAsset of parentAssetNodes) {
      segs.push({ label: parentAsset.name, onClick: () => onAssetChange?.(parentAsset.id) });
    }
    return segs;
  }, [t, clusterName, buildingNode, zoneNode, parentAssetNodes, onBackToPortfolio, onBackToCluster, onBackToBuilding, onBackToZone, onAssetChange]);

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
      entityIcon={getCategoryIcon(asset.metadata?.category)}
      entityIconBgColor={assetColor}
      entityType={asset.metadata?.category}
      title={asset.name}
      subtitle={[floorNode?.name, zoneNode?.name].filter(Boolean).join(' · ')}
      tabs={tabs}
      activeTab={tab}
      onTabChange={(v) => onTabChange(v as AssetDetailTab)}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      panelActions={panelActions}
      breadcrumb={
        <AssetBreadcrumb
          ancestors={ancestors}
          asset={asset}
          siblingAssets={siblingAssets}
          onAssetChange={onAssetChange}
        />
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
