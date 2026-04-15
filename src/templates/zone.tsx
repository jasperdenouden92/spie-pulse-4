'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import Tooltip from '@mui/material/Tooltip';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import type { Zone } from '@/data/zones';
import { zones as allZones, getZoneColor } from '@/data/zones';
import PageHeader from '@/components/PageHeader';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage } from '@/i18n';

export type ZoneDetailTab = 'overview' | 'assets' | 'tickets' | 'quotations';

function useZoneTabs() {
  const { t } = useLanguage();
  return [
    { value: 'overview' as ZoneDetailTab, label: t('common.overview') },
    { value: 'assets' as ZoneDetailTab, label: t('building.assets') },
    { value: 'tickets' as ZoneDetailTab, label: t('building.tickets') },
    { value: 'quotations' as ZoneDetailTab, label: t('building.quotations') },
  ];
}

// ── Zone selector popover ──

interface ZoneSelectorPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  currentZoneId: string;
  buildingName: string;
  onZoneSelect: (zoneId: string) => void;
}

function ZoneSelectorPopover({ anchorEl, onClose, currentZoneId, buildingName, onZoneSelect }: ZoneSelectorPopoverProps) {
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

  const buildingZones = useMemo(
    () => allZones.filter(z => z.buildingName === buildingName),
    [buildingName]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return buildingZones;
    const q = search.toLowerCase();
    return buildingZones.filter(z =>
      z.name.toLowerCase().includes(q) || z.floor.toLowerCase().includes(q)
    );
  }, [buildingZones, search]);

  // Group by floor
  const grouped = useMemo(() => {
    const map = new Map<string, Zone[]>();
    for (const z of filtered) {
      if (!map.has(z.floor)) map.set(z.floor, []);
      map.get(z.floor)!.push(z);
    }
    return Array.from(map.entries()).sort(([, a], [, b]) => a[0].floorNumber - b[0].floorNumber);
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
      {/* Search */}
      <Box sx={{ px: 1.5, pt: 1.5, pb: 1, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1, py: 0.5, borderRadius: '6px', border: '1px solid', borderColor: 'divider', bgcolor: c.bgSecondary }}>
          <SearchIcon sx={{ fontSize: 15, color: 'text.disabled', flexShrink: 0 }} />
          <InputBase
            inputRef={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('zone.searchZones')}
            sx={{ fontSize: '0.8rem', flex: 1, '& input': { p: 0, lineHeight: 1 } }}
          />
        </Box>
      </Box>

      {/* Zone list */}
      <Box sx={{ overflowY: 'auto', pb: 1 }}>
        {grouped.length === 0 ? (
          <Typography sx={{ px: 2, py: 2, fontSize: '0.8rem', color: 'text.disabled' }}>{t('zone.noZonesFound')}</Typography>
        ) : (
          grouped.map(([floor, zones]) => (
            <Box key={floor}>
              <Typography sx={{ px: 2, pt: 1.5, pb: 0.5, fontSize: '0.7rem', fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {floor}
              </Typography>
              {zones.map(zone => {
                const color = getZoneColor(zone.name);
                const isSelected = zone.id === currentZoneId;
                return (
                  <Box
                    key={zone.id}
                    onClick={() => { onZoneSelect(zone.id); onClose(); }}
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
                      {zone.name}
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

// ── Main component ──

interface ZoneDetailPageProps {
  zone: Zone;
  tab: ZoneDetailTab;
  onTabChange: (tab: ZoneDetailTab) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onBackToPortfolio?: () => void;
  onBackToBuilding?: () => void;
  onZoneChange?: (zoneId: string) => void;
  onPanelClose?: () => void;
  onPanelFullscreen?: () => void;
}

export default function ZoneDetailPage({
  zone,
  tab,
  onTabChange,
  isCollapsed = false,
  onToggleCollapse,
  onBackToPortfolio,
  onBackToBuilding,
  onZoneChange,
  onPanelClose,
  onPanelFullscreen,
}: ZoneDetailPageProps) {
  const { t } = useLanguage();
  const tabs = useZoneTabs();
  const zoneColor = getZoneColor(zone.name);
  const [zoneAnchorEl, setZoneAnchorEl] = useState<HTMLElement | null>(null);

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
      entityIcon={<LayersOutlinedIcon sx={{ fontSize: 22, color: '#fff' }} />}
      entityIconBgColor={zoneColor}
      title={zone.name}
      subtitle={`${zone.floor} · ${zone.buildingName}`}
      tabs={tabs}
      activeTab={tab}
      onTabChange={(v) => onTabChange(v as ZoneDetailTab)}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      panelActions={panelActions}
      breadcrumb={
        <>
          <Typography
            sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 500, fontFamily: '"Inter", sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { color: 'text.primary' } }}
            onClick={onBackToPortfolio}
          >
            {t('nav.portfolio')}
          </Typography>
          <KeyboardArrowRightIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
          <Typography
            noWrap
            sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 500, fontFamily: '"Inter", sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', maxWidth: 140, '&:hover': { color: 'text.primary' } }}
            onClick={onBackToBuilding}
          >
            {zone.buildingName}
          </Typography>
          <KeyboardArrowRightIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
          <Box
            onClick={(e) => setZoneAnchorEl(e.currentTarget)}
            sx={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', px: 0.75, py: 0.25, mx: -0.75, borderRadius: 1, transition: 'background-color 0.15s ease', '&:hover': { bgcolor: 'action.hover' }, minWidth: 0 }}
          >
            <Typography noWrap sx={{ color: 'text.primary', fontSize: '0.8rem', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
              {zone.name}
            </Typography>
            <UnfoldMoreIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
          </Box>
          <ZoneSelectorPopover
            anchorEl={zoneAnchorEl}
            onClose={() => setZoneAnchorEl(null)}
            currentZoneId={zone.id}
            buildingName={zone.buildingName}
            onZoneSelect={(id) => onZoneChange?.(id)}
          />
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
