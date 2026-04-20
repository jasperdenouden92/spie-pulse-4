'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFilterParams } from '@/hooks/useFilterParams';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import Button from '@/components/Button';
import FilterChip from '@/components/FilterChip';
import FilterDropdown from '@/components/FilterDropdown';
import ResetFiltersButton from '@/components/ResetFiltersButton';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage } from '@/i18n';
import { type AssetNode } from '@/data/assetTree';

import AcUnitIcon from '@mui/icons-material/AcUnit';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import SecurityIcon from '@mui/icons-material/Security';
import ElevatorIcon from '@mui/icons-material/Elevator';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';

// ── Category config ──
const CATEGORY_CONFIG: Record<string, { Icon: React.ElementType; color: string }> = {
  'HVAC':        { Icon: AcUnitIcon,              color: '#2196F3' },
  'Lighting':    { Icon: LightbulbIcon,           color: '#FF9800' },
  'Fire Safety': { Icon: LocalFireDepartmentIcon, color: '#F44336' },
  'Electrical':  { Icon: ElectricalServicesIcon,  color: '#9C27B0' },
  'Plumbing':    { Icon: PlumbingIcon,            color: '#00BCD4' },
  'Security':    { Icon: SecurityIcon,            color: '#4CAF50' },
  'Elevator':    { Icon: ElevatorIcon,            color: '#795548' },
};

const DEFAULT_CAT_CONFIG = { Icon: SettingsInputAntennaIcon, color: '#607D8B' };

function getCatConfig(category?: string) {
  if (!category) return DEFAULT_CAT_CONFIG;
  return CATEGORY_CONFIG[category] ?? DEFAULT_CAT_CONFIG;
}

// ── Status config ──
const STATUS_COLOR: Record<string, string> = {
  'operational': '#4CAF50',
  'maintenance': '#FF9800',
  'offline':     '#9E9E9E',
  'failed':      '#F44336',
};

// ── Enriched asset type ──
export interface EnrichedAsset extends AssetNode {
  building: string;
}

// ── Highlight matching text ──
function HighlightText({ text, query }: { text: string; query: string }) {
  const { themeColors: c } = useThemeMode();
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <Box key={i} component="mark" sx={{ bgcolor: `color-mix(in srgb, ${c.brandSecondary} 22%, transparent)`, color: 'inherit', borderRadius: '2px', px: '1px' }}>
            {part}
          </Box>
        ) : part
      )}
    </>
  );
}

// ── Status cell ──
function StatusCell({ status }: { status?: string }) {
  const { themeColors: c } = useThemeMode();
  const s = status ?? 'operational';
  const color = STATUS_COLOR[s] ?? STATUS_COLOR.operational;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.375, bgcolor: c.bgPrimaryHover, borderRadius: '6px' }}>
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{s}</Typography>
    </Box>
  );
}

// ── Category pill ──
function CategoryCell({ category }: { category?: string }) {
  const { Icon, color } = getCatConfig(category);
  if (!category) return <Box component="span" sx={{ color: 'text.disabled' }}>—</Box>;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, borderRadius: '999px', bgcolor: `${color}1A`, border: `1px solid ${color}33` }}>
      <Icon sx={{ fontSize: 12, color }} />
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color, lineHeight: 1 }}>{category}</Typography>
    </Box>
  );
}

// ── Sortable columns ──
type SortKey = 'name' | 'building' | 'category' | 'manufacturer' | 'model' | 'zone' | 'installDate' | 'status';

type ColumnLabelKey = 'assets.asset' | 'common.building' | 'common.category' | 'assets.manufacturer' | 'assets.model' | 'assets.zone' | 'assets.installationDate' | 'common.status';

const COLUMNS: { key: SortKey; labelKey: ColumnLabelKey; width?: string }[] = [
  { key: 'name',         labelKey: 'assets.asset',            width: '18%' },
  { key: 'building',     labelKey: 'common.building',         width: '16%' },
  { key: 'category',     labelKey: 'common.category',         width: '13%' },
  { key: 'manufacturer', labelKey: 'assets.manufacturer',     width: '12%' },
  { key: 'model',        labelKey: 'assets.model',            width: '12%' },
  { key: 'zone',         labelKey: 'assets.zone',             width: '13%' },
  { key: 'installDate',  labelKey: 'assets.installationDate', width: '11%' },
  { key: 'status',       labelKey: 'common.status',           width: '8%'  },
];

function getSortValue(asset: EnrichedAsset, key: SortKey): string {
  switch (key) {
    case 'name':         return asset.name;
    case 'building':     return asset.building;
    case 'category':     return asset.metadata?.category ?? '';
    case 'manufacturer': return asset.metadata?.manufacturer ?? '';
    case 'model':        return asset.metadata?.model ?? '';
    case 'zone':         return asset.metadata?.zone ?? '';
    case 'installDate':  return asset.metadata?.installDate ?? '';
    case 'status':       return asset.metadata?.status ?? '';
  }
}

// ── Types ──
type GroupBy = 'none' | 'building' | 'category' | 'status' | 'zone';

// ── Zone-tree structures ──
type GroupLevel = 'building' | 'floor' | 'zone';

interface AssetTreeGroup {
  key: string;
  label: string;
  level: GroupLevel;
  assets: EnrichedAsset[];       // direct assets at this node
  children: AssetTreeGroup[];
  totalAssets: number;           // recursive sum (own + descendants)
}

function buildAssetTree(assets: EnrichedAsset[]): AssetTreeGroup[] {
  type FloorBucket = { assets: EnrichedAsset[]; zones: Map<string, EnrichedAsset[]> };
  type BuildingBucket = { assets: EnrichedAsset[]; floors: Map<string, FloorBucket> };
  const byBuilding = new Map<string, BuildingBucket>();

  for (const a of assets) {
    const bName = a.building || '—';
    let bEntry = byBuilding.get(bName);
    if (!bEntry) { bEntry = { assets: [], floors: new Map() }; byBuilding.set(bName, bEntry); }

    const fName = a.metadata?.floor || null;
    if (!fName) { bEntry.assets.push(a); continue; }

    let fEntry = bEntry.floors.get(fName);
    if (!fEntry) { fEntry = { assets: [], zones: new Map() }; bEntry.floors.set(fName, fEntry); }

    const zName = a.metadata?.zone || null;
    if (!zName) { fEntry.assets.push(a); continue; }

    let zAssets = fEntry.zones.get(zName);
    if (!zAssets) { zAssets = []; fEntry.zones.set(zName, zAssets); }
    zAssets.push(a);
  }

  const floorNum = (label: string) => {
    const m = label.match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  };

  const result: AssetTreeGroup[] = [];
  for (const [bName, bEntry] of byBuilding) {
    const floorGroups: AssetTreeGroup[] = [];
    let bTotal = bEntry.assets.length;
    for (const [fName, fEntry] of bEntry.floors) {
      const zoneGroups: AssetTreeGroup[] = [];
      let fTotal = fEntry.assets.length;
      for (const [zName, zAssets] of fEntry.zones) {
        fTotal += zAssets.length;
        zoneGroups.push({
          key: `${bName}|${fName}|${zName}`,
          label: zName,
          level: 'zone',
          assets: zAssets,
          children: [],
          totalAssets: zAssets.length,
        });
      }
      zoneGroups.sort((a, b) => a.label.localeCompare(b.label));
      bTotal += fTotal;
      floorGroups.push({
        key: `${bName}|${fName}`,
        label: fName,
        level: 'floor',
        assets: fEntry.assets,
        children: zoneGroups,
        totalAssets: fTotal,
      });
    }
    floorGroups.sort((a, b) => floorNum(a.label) - floorNum(b.label));
    result.push({
      key: bName,
      label: bName,
      level: 'building',
      assets: bEntry.assets,
      children: floorGroups,
      totalAssets: bTotal,
    });
  }
  result.sort((a, b) => a.label.localeCompare(b.label));
  return result;
}

function collectGroupKeys(groups: AssetTreeGroup[]): string[] {
  const keys: string[] = [];
  const walk = (g: AssetTreeGroup) => {
    keys.push(g.key);
    g.children.forEach(walk);
  };
  groups.forEach(walk);
  return keys;
}

// ── Section header (matches Zones pattern) ──
function SectionHeader({ label, count, onClick }: { label: string; count: number; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, mt: 1 }}>
      <Typography
        variant="body2"
        onClick={onClick}
        sx={{
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: onClick ? 'text.primary' : 'text.secondary',
          textTransform: 'capitalize',
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick ? { textDecoration: 'underline' } : {},
        }}
      >
        {label}
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
        {count}
      </Typography>
      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
    </Box>
  );
}

// ── Asset table (flat — grouping handled by parent) ──
function AssetTable({ assets, query = '', hiddenCols = [], onAssetClick }: { assets: EnrichedAsset[]; query?: string; hiddenCols?: SortKey[]; onAssetClick?: (assetId: string, e: React.MouseEvent) => void }) {
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();
  const { get, set } = useFilterParams();
  const sortKey = get('sortKey', 'name') as SortKey;
  const sortDir = get('sortDir', 'asc') as 'asc' | 'desc';

  const visibleColumns = useMemo(() => hiddenCols.length ? COLUMNS.filter(col => !hiddenCols.includes(col.key)) : COLUMNS, [hiddenCols]);

  function handleSort(key: SortKey) {
    if (sortKey === key) set('sortDir', sortDir === 'asc' ? 'desc' : 'asc');
    else { set('sortKey', key); set('sortDir', 'asc'); }
  }

  const sorted = useMemo(() =>
    [...assets].sort((a, b) => {
      const av = getSortValue(a, sortKey);
      const bv = getSortValue(b, sortKey);
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    }),
    [assets, sortKey, sortDir]
  );

  const colgroup = (
    <colgroup>
      {visibleColumns.map(col => (
        <col key={col.key} style={{ width: col.width }} />
      ))}
    </colgroup>
  );

  return (
    <Box>
      {/* Header row outside the card */}
      <Table sx={{ tableLayout: 'fixed' }}>
        {colgroup}
        <TableHead>
          <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
            {visibleColumns.map(col => (
              <TableCell
                key={col.key}
                sortDirection={sortKey === col.key ? sortDir : false}
                sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1, whiteSpace: 'nowrap' }}
              >
                <TableSortLabel
                  active={sortKey === col.key}
                  direction={sortKey === col.key ? sortDir : 'asc'}
                  onClick={() => handleSort(col.key)}
                  sx={{ fontSize: 'inherit', color: 'inherit', '&.Mui-active': { color: c.brandSecondary }, '& .MuiTableSortLabel-icon': { fontSize: 14 } }}
                >
                  {t(col.labelKey)}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
      </Table>
      {/* Table body inside the card */}
      <Box sx={{ border: `1px solid ${c.cardBorder}`, borderRadius: '12px', bgcolor: c.bgPrimary, boxShadow: c.cardShadow, overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed' }}>
            {colgroup}
            <TableBody>
              {sorted.map(asset => (
                <TableRow key={asset.id} onClick={(e) => onAssetClick?.(asset.id, e)} sx={{ '&:hover': { bgcolor: c.bgPrimaryHover }, cursor: 'pointer' }}>
                  <TableCell sx={{ py: 1.25 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <HighlightText text={asset.name} query={query} />
                    </Typography>
                  </TableCell>
                  {!hiddenCols.includes('building') && (
                    <TableCell sx={{ py: 1.25 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <HighlightText text={asset.building} query={query} />
                      </Typography>
                    </TableCell>
                  )}
                  {!hiddenCols.includes('category') && (
                    <TableCell sx={{ py: 1.25 }}>
                      <CategoryCell category={asset.metadata?.category} />
                    </TableCell>
                  )}
                  <TableCell sx={{ py: 1.25 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {asset.metadata?.manufacturer
                        ? <HighlightText text={asset.metadata.manufacturer} query={query} />
                        : <Box component="span" sx={{ color: 'text.disabled' }}>—</Box>}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.25 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {asset.metadata?.model
                        ? <HighlightText text={asset.metadata.model} query={query} />
                        : <Box component="span" sx={{ color: 'text.disabled' }}>—</Box>}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.25 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {asset.metadata?.zone
                        ? <HighlightText text={asset.metadata.zone} query={query} />
                        : <Box component="span" sx={{ color: 'text.disabled' }}>—</Box>}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.25 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {asset.metadata?.installDate ?? <Box component="span" sx={{ color: 'text.disabled' }}>—</Box>}
                    </Typography>
                  </TableCell>
                  {!hiddenCols.includes('status') && (
                    <TableCell sx={{ py: 1.25 }}>
                      <StatusCell status={asset.metadata?.status} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

// ── Zone-tree view (nested building → floor → zone → assets) ──
type TreeRow =
  | { kind: 'group'; group: AssetTreeGroup; depth: number; expanded: boolean }
  | { kind: 'asset'; asset: EnrichedAsset; depth: number };

function flattenTree(groups: AssetTreeGroup[], expandedSet: Set<string>, sortKey: SortKey, sortDir: 'asc' | 'desc', depth = 0, out: TreeRow[] = []): TreeRow[] {
  for (const g of groups) {
    const expanded = expandedSet.has(g.key);
    out.push({ kind: 'group', group: g, depth, expanded });
    if (expanded) {
      flattenTree(g.children, expandedSet, sortKey, sortDir, depth + 1, out);
      const sortedAssets = [...g.assets].sort((a, b) => {
        const av = getSortValue(a, sortKey);
        const bv = getSortValue(b, sortKey);
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
      for (const a of sortedAssets) out.push({ kind: 'asset', asset: a, depth: depth + 1 });
    }
  }
  return out;
}

function GroupLevelIcon({ level }: { level: GroupLevel }) {
  const sx = { fontSize: 14, color: 'text.secondary', flexShrink: 0 };
  if (level === 'building') return <ApartmentOutlinedIcon sx={sx} />;
  if (level === 'floor') return <LayersOutlinedIcon sx={sx} />;
  return <LocationOnOutlinedIcon sx={sx} />;
}

function AssetTreeView({
  groups,
  expandedSet,
  onToggle,
  onExpandAll,
  onCollapseAll,
  query,
  hideBuildingColumn,
  onAssetClick,
  onBuildingLabelClick,
}: {
  groups: AssetTreeGroup[];
  expandedSet: Set<string>;
  onToggle: (key: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  query: string;
  hideBuildingColumn?: boolean;
  onAssetClick?: (assetId: string, e: React.MouseEvent) => void;
  onBuildingLabelClick?: (buildingName: string, e?: React.MouseEvent) => void;
}) {
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();
  const { get, set } = useFilterParams();
  const sortKey = get('sortKey', 'name') as SortKey;
  const sortDir = get('sortDir', 'asc') as 'asc' | 'desc';

  // Always hide `zone` column (redundant with tree path). Optionally hide `building`.
  const hiddenCols = useMemo<SortKey[]>(() => {
    const hc: SortKey[] = ['zone'];
    if (hideBuildingColumn) hc.push('building');
    return hc;
  }, [hideBuildingColumn]);

  const visibleColumns = useMemo(() => COLUMNS.filter(col => !hiddenCols.includes(col.key)), [hiddenCols]);
  const colSpan = visibleColumns.length;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) set('sortDir', sortDir === 'asc' ? 'desc' : 'asc');
    else { set('sortKey', key); set('sortDir', 'asc'); }
  };

  const rows = useMemo(
    () => flattenTree(groups, expandedSet, sortKey, sortDir),
    [groups, expandedSet, sortKey, sortDir],
  );

  const colgroup = (
    <colgroup>
      {visibleColumns.map(col => <col key={col.key} style={{ width: col.width }} />)}
    </colgroup>
  );

  const hasAnyExpanded = expandedSet.size > 0;

  return (
    <Box>
      {/* Controls row: expand/collapse all */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Button
          variant="secondary"
          size="sm"
          startIcon={hasAnyExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
          onClick={hasAnyExpanded ? onCollapseAll : onExpandAll}
        >
          {hasAnyExpanded ? t('assets.collapseAll') : t('assets.expandAll')}
        </Button>
      </Box>

      {/* Header row outside card */}
      <Table sx={{ tableLayout: 'fixed' }}>
        {colgroup}
        <TableHead>
          <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
            {visibleColumns.map(col => (
              <TableCell
                key={col.key}
                sortDirection={sortKey === col.key ? sortDir : false}
                sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1, whiteSpace: 'nowrap' }}
              >
                <TableSortLabel
                  active={sortKey === col.key}
                  direction={sortKey === col.key ? sortDir : 'asc'}
                  onClick={() => handleSort(col.key)}
                  sx={{ fontSize: 'inherit', color: 'inherit', '&.Mui-active': { color: c.brandSecondary }, '& .MuiTableSortLabel-icon': { fontSize: 14 } }}
                >
                  {t(col.labelKey)}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
      </Table>

      {/* Body inside a single card */}
      <Box sx={{ border: `1px solid ${c.cardBorder}`, borderRadius: '12px', bgcolor: c.bgPrimary, boxShadow: c.cardShadow, overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed' }}>
            {colgroup}
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={colSpan} sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                    {t('portfolio.noAssets')}
                  </TableCell>
                </TableRow>
              )}
              {rows.map(row => {
                if (row.kind === 'group') {
                  const g = row.group;
                  const isBuilding = g.level === 'building';
                  const isNavigable = isBuilding && onBuildingLabelClick;
                  return (
                    <TableRow
                      key={`g:${g.key}`}
                      onClick={() => onToggle(g.key)}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: row.depth === 0 ? c.bgPrimaryHover : 'transparent',
                        '&:hover': { bgcolor: c.bgPrimaryHover },
                        '& > td': { borderBottom: `1px solid ${c.cardBorder}` },
                      }}
                    >
                      <TableCell
                        colSpan={colSpan}
                        sx={{
                          py: 0.75,
                          pl: `${12 + row.depth * 20}px`,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', flexShrink: 0 }}>
                            {row.expanded
                              ? <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                              : <ChevronRightIcon sx={{ fontSize: 16 }} />}
                          </Box>
                          <GroupLevelIcon level={g.level} />
                          <Typography
                            component="span"
                            onClick={isNavigable ? (e) => { e.stopPropagation(); onBuildingLabelClick!(g.label, e); } : undefined}
                            sx={{
                              fontSize: '0.8125rem',
                              fontWeight: isBuilding ? 600 : g.level === 'floor' ? 600 : 500,
                              color: isBuilding ? 'text.primary' : 'text.primary',
                              cursor: isNavigable ? 'pointer' : 'inherit',
                              '&:hover': isNavigable ? { textDecoration: 'underline' } : {},
                            }}
                          >
                            <HighlightText text={g.label} query={query} />
                          </Typography>
                          <Typography component="span" sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
                            {g.totalAssets}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                }

                // Asset row
                const asset = row.asset;
                const indentPx = 12 + row.depth * 20;
                return (
                  <TableRow
                    key={`a:${asset.id}`}
                    onClick={(e) => onAssetClick?.(asset.id, e)}
                    sx={{ '&:hover': { bgcolor: c.bgPrimaryHover }, cursor: 'pointer' }}
                  >
                    <TableCell sx={{ py: 1.25, pl: `${indentPx}px` }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <HighlightText text={asset.name} query={query} />
                      </Typography>
                    </TableCell>
                    {!hiddenCols.includes('building') && (
                      <TableCell sx={{ py: 1.25 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <HighlightText text={asset.building} query={query} />
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell sx={{ py: 1.25 }}>
                      <CategoryCell category={asset.metadata?.category} />
                    </TableCell>
                    <TableCell sx={{ py: 1.25 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {asset.metadata?.manufacturer
                          ? <HighlightText text={asset.metadata.manufacturer} query={query} />
                          : <Box component="span" sx={{ color: 'text.disabled' }}>—</Box>}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.25 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {asset.metadata?.model
                          ? <HighlightText text={asset.metadata.model} query={query} />
                          : <Box component="span" sx={{ color: 'text.disabled' }}>—</Box>}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.25 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                        {asset.metadata?.installDate ?? <Box component="span" sx={{ color: 'text.disabled' }}>—</Box>}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.25 }}>
                      <StatusCell status={asset.metadata?.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

// ── Main exported component ──
export default function AssetsList({ assets, onAssetClick, onBuildingLabelClick, groupBy: groupByProp = 'none', search: searchProp = '', hideBuildingColumn, showFilters }: {
  assets: EnrichedAsset[];
  onAssetClick?: (assetId: string, e: React.MouseEvent) => void;
  onBuildingLabelClick?: (buildingName: string, e?: React.MouseEvent) => void;
  groupBy?: string;
  search?: string;
  hideBuildingColumn?: boolean;
  showFilters?: boolean;
}) {
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  // Internal filter state (used when showFilters is true)
  const [internalSearch, setInternalSearch] = useState('');
  const [internalGroupBy, setInternalGroupBy] = useState<GroupBy>('none');
  const [groupByMenuAnchor, setGroupByMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryAnchor, setCategoryAnchor] = useState<null | HTMLElement>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [manufacturerAnchor, setManufacturerAnchor] = useState<null | HTMLElement>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [modelAnchor, setModelAnchor] = useState<null | HTMLElement>(null);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [zoneAnchor, setZoneAnchor] = useState<null | HTMLElement>(null);

  // Zone-tree expand/collapse state
  const [expandedSet, setExpandedSet] = useState<Set<string>>(() => new Set());

  const search = showFilters ? internalSearch : searchProp;
  const groupBy = showFilters ? internalGroupBy : groupByProp;
  const castGroupBy = groupBy as GroupBy;

  // Derived option lists
  const allCategories = useMemo(() => showFilters ? Array.from(new Set(assets.map(a => a.metadata?.category).filter(Boolean) as string[])).sort() : [], [assets, showFilters]);
  const allStatuses = useMemo(() => showFilters ? Array.from(new Set(assets.map(a => a.metadata?.status).filter(Boolean) as string[])).sort() : [], [assets, showFilters]);
  const allManufacturers = useMemo(() => showFilters ? Array.from(new Set(assets.map(a => a.metadata?.manufacturer).filter(Boolean) as string[])).sort() : [], [assets, showFilters]);
  const allModels = useMemo(() => showFilters ? Array.from(new Set(assets.map(a => a.metadata?.model).filter(Boolean) as string[])).sort() : [], [assets, showFilters]);
  const allZoneNames = useMemo(() => showFilters ? Array.from(new Set(assets.map(a => a.metadata?.zone).filter(Boolean) as string[])).sort() : [], [assets, showFilters]);

  // Filter assets when showFilters is enabled
  const filteredAssets = useMemo(() => {
    if (!showFilters) return assets;
    let list = assets;
    if (internalSearch.trim()) {
      const q = internalSearch.trim().toLowerCase();
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.building.toLowerCase().includes(q) ||
        a.metadata?.category?.toLowerCase().includes(q) ||
        a.metadata?.manufacturer?.toLowerCase().includes(q)
      );
    }
    if (selectedCategories.length > 0) list = list.filter(a => selectedCategories.includes(a.metadata?.category ?? ''));
    if (selectedStatuses.length > 0) list = list.filter(a => selectedStatuses.includes(a.metadata?.status ?? ''));
    if (selectedManufacturers.length > 0) list = list.filter(a => selectedManufacturers.includes(a.metadata?.manufacturer ?? ''));
    if (selectedModels.length > 0) list = list.filter(a => selectedModels.includes(a.metadata?.model ?? ''));
    if (selectedZones.length > 0) list = list.filter(a => selectedZones.includes(a.metadata?.zone ?? ''));
    return list;
  }, [assets, showFilters, internalSearch, selectedCategories, selectedStatuses, selectedManufacturers, selectedModels, selectedZones]);

  const catChip = selectedCategories.length === 0 ? null : selectedCategories.length === 1 ? selectedCategories[0] : `${selectedCategories.length} categories`;
  const statusChip = selectedStatuses.length === 0 ? null : selectedStatuses.length === 1 ? selectedStatuses[0] : `${selectedStatuses.length} statuses`;
  const mfgChip = selectedManufacturers.length === 0 ? null : selectedManufacturers.length === 1 ? selectedManufacturers[0] : `${selectedManufacturers.length} manufacturers`;
  const modelChip = selectedModels.length === 0 ? null : selectedModels.length === 1 ? selectedModels[0] : `${selectedModels.length} models`;
  const zoneChip = selectedZones.length === 0 ? null : selectedZones.length === 1 ? selectedZones[0] : `${selectedZones.length} zones`;

  const filterBar = showFilters ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 1, flexWrap: 'wrap' }}>
      {/* Left: Category + optional filters */}
      <FilterChip label={t('common.category')} value={catChip} onClick={(e) => setCategoryAnchor(e.currentTarget)} onClear={selectedCategories.length > 0 ? () => setSelectedCategories([]) : undefined} />
      <FilterDropdown anchorEl={categoryAnchor} onClose={() => setCategoryAnchor(null)} options={allCategories.map(c => ({ value: c }))} multiple value={selectedCategories} onChange={(v) => setSelectedCategories(v as string[])} placeholder={t('assets.searchCategories')} />

      <FilterChip label={t('common.status')} value={statusChip} onClick={(e) => setStatusAnchor(e.currentTarget)} onClear={selectedStatuses.length > 0 ? () => setSelectedStatuses([]) : undefined} />
      <FilterDropdown anchorEl={statusAnchor} onClose={() => setStatusAnchor(null)} options={allStatuses.map(s => ({ value: s }))} multiple value={selectedStatuses} onChange={(v) => setSelectedStatuses(v as string[])} placeholder={t('assets.searchStatuses')} />

      <FilterChip label={t('assets.manufacturer')} value={mfgChip} onClick={(e) => setManufacturerAnchor(e.currentTarget)} onClear={selectedManufacturers.length > 0 ? () => setSelectedManufacturers([]) : undefined} />
      <FilterDropdown anchorEl={manufacturerAnchor} onClose={() => setManufacturerAnchor(null)} options={allManufacturers.map(m => ({ value: m }))} multiple value={selectedManufacturers} onChange={(v) => setSelectedManufacturers(v as string[])} placeholder={t('assets.searchManufacturers')} />

      <FilterChip label={t('assets.model')} value={modelChip} onClick={(e) => setModelAnchor(e.currentTarget)} onClear={selectedModels.length > 0 ? () => setSelectedModels([]) : undefined} />
      <FilterDropdown anchorEl={modelAnchor} onClose={() => setModelAnchor(null)} options={allModels.map(m => ({ value: m }))} multiple value={selectedModels} onChange={(v) => setSelectedModels(v as string[])} placeholder={t('assets.searchModels')} />

      <FilterChip label={t('assets.zone')} value={zoneChip} onClick={(e) => setZoneAnchor(e.currentTarget)} onClear={selectedZones.length > 0 ? () => setSelectedZones([]) : undefined} />
      <FilterDropdown anchorEl={zoneAnchor} onClose={() => setZoneAnchor(null)} options={allZoneNames.map(z => ({ value: z }))} multiple value={selectedZones} onChange={(v) => setSelectedZones(v as string[])} placeholder={t('assets.searchZones')} />

      {/* Right: Reset + Group by + Search */}
      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
        <ResetFiltersButton
          show={selectedCategories.length > 0 || selectedStatuses.length > 0 || selectedManufacturers.length > 0 || selectedModels.length > 0 || selectedZones.length > 0}
          onReset={() => {
            setSelectedCategories([]);
            setSelectedStatuses([]);
            setSelectedManufacturers([]);
            setSelectedModels([]);
            setSelectedZones([]);
          }}
        />
        <Button variant="secondary" size="sm" endIcon={<ExpandMoreIcon />} onClick={(e) => setGroupByMenuAnchor(e.currentTarget)}>
          {t('common.groupBy')}
        </Button>
        <Menu anchorEl={groupByMenuAnchor} open={Boolean(groupByMenuAnchor)} onClose={() => setGroupByMenuAnchor(null)} slotProps={{ paper: { sx: { borderRadius: '8px', mt: 0.5, minWidth: 140 } } }}>
          <MenuItem selected={internalGroupBy === 'none'} onClick={() => { setInternalGroupBy('none'); setGroupByMenuAnchor(null); }}><ListItemText>{t('common.noGrouping')}</ListItemText></MenuItem>
          <Divider />
          <MenuItem selected={internalGroupBy === 'zone'} onClick={() => { setInternalGroupBy('zone'); setGroupByMenuAnchor(null); }}><ListItemText>{t('assets.zone')}</ListItemText></MenuItem>
          <MenuItem selected={internalGroupBy === 'category'} onClick={() => { setInternalGroupBy('category'); setGroupByMenuAnchor(null); }}><ListItemText>{t('common.category')}</ListItemText></MenuItem>
          <MenuItem selected={internalGroupBy === 'status'} onClick={() => { setInternalGroupBy('status'); setGroupByMenuAnchor(null); }}><ListItemText>{t('common.status')}</ListItemText></MenuItem>
        </Menu>
        <Box sx={{ display: 'flex', alignItems: 'center', height: 30, borderRadius: '6px', border: '1px solid', borderColor: c.borderPrimary, bgcolor: c.bgPrimary, px: 1, gap: 0.5, '&:focus-within': { borderColor: c.brandSecondary }, transition: 'border-color 0.15s ease' }}>
          <SearchIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
          <InputBase
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            placeholder={t('portfolio.searchAssets')}
            sx={{ fontSize: '0.8rem', minWidth: 140, '& input': { p: 0, lineHeight: 1 } }}
            endAdornment={internalSearch ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setInternalSearch('')} sx={{ p: 0.25 }}>
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </InputAdornment>
            ) : null}
          />
        </Box>
      </Box>
    </Box>
  ) : null;

  // Grouped output (flat section groups)
  const grouped = useMemo(() => {
    if (castGroupBy === 'none' || castGroupBy === 'zone') return null;
    const map = new Map<string, EnrichedAsset[]>();
    for (const a of filteredAssets) {
      const key = castGroupBy === 'building' ? a.building :
                  castGroupBy === 'category' ? (a.metadata?.category ?? 'Other') :
                  (a.metadata?.status ?? 'unknown');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, items]) => ({ key, label: key, items }));
  }, [filteredAssets, castGroupBy]);

  // Zone-tree structure (only when group-by-zone is active)
  const zoneTree = useMemo(
    () => (castGroupBy === 'zone' ? buildAssetTree(filteredAssets) : []),
    [filteredAssets, castGroupBy],
  );

  const onToggleGroup = (key: string) => {
    setExpandedSet(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const onExpandAll = () => setExpandedSet(new Set(collectGroupKeys(zoneTree)));
  const onCollapseAll = () => setExpandedSet(new Set());

  if (initialLoading) {
    const skeletonCols = ['18%', '16%', '13%', '12%', '12%', '13%', '11%', '8%'];
    return (
      <Box sx={{ pt: 3 }}>
        {filterBar}
        <Box>
          <Table sx={{ tableLayout: 'fixed' }}>
            <colgroup>{skeletonCols.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
                {[t('assets.asset'), t('common.building'), t('common.category'), t('assets.manufacturer'), t('assets.model'), t('assets.zone'), t('assets.installationDate'), t('common.status')].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1, whiteSpace: 'nowrap' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          </Table>
          <Box sx={{ border: `1px solid ${c.cardBorder}`, borderRadius: '12px', bgcolor: c.bgPrimary, boxShadow: c.cardShadow, overflow: 'hidden' }}>
            <TableContainer>
              <Table sx={{ tableLayout: 'fixed' }}>
                <colgroup>{skeletonCols.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
                <TableBody>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ py: 1.25 }}><Skeleton animation="wave"variant="text" width={`${50 + (i * 11) % 30}%`} /></TableCell>
                      <TableCell sx={{ py: 1.25 }}><Skeleton animation="wave"variant="text" width={`${45 + (i * 9) % 30}%`} /></TableCell>
                      <TableCell sx={{ py: 1.25 }}><Skeleton animation="wave"variant="rounded" width={80} height={20} sx={{ borderRadius: '999px' }} /></TableCell>
                      <TableCell sx={{ py: 1.25 }}><Skeleton animation="wave"variant="text" width={`${50 + (i * 7) % 25}%`} /></TableCell>
                      <TableCell sx={{ py: 1.25 }}><Skeleton animation="wave"variant="text" width={`${40 + (i * 13) % 30}%`} /></TableCell>
                      <TableCell sx={{ py: 1.25 }}><Skeleton animation="wave"variant="text" width={`${55 + (i * 5) % 25}%`} /></TableCell>
                      <TableCell sx={{ py: 1.25 }}><Skeleton animation="wave"variant="text" width={80} /></TableCell>
                      <TableCell sx={{ py: 1.25 }}><Skeleton animation="wave"variant="rounded" width={75} height={22} sx={{ borderRadius: '6px' }} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 3 }}>
      {filterBar}
      {filteredAssets.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">{t('portfolio.noAssets')}</Typography>
        </Box>
      ) : castGroupBy === 'zone' ? (
        <AssetTreeView
          groups={zoneTree}
          expandedSet={expandedSet}
          onToggle={onToggleGroup}
          onExpandAll={onExpandAll}
          onCollapseAll={onCollapseAll}
          query={search}
          hideBuildingColumn={hideBuildingColumn}
          onAssetClick={onAssetClick}
          onBuildingLabelClick={onBuildingLabelClick}
        />
      ) : grouped ? (
        grouped.map(({ key, label, items }) => (
          <Box key={key} sx={{ mb: 4 }}>
            <SectionHeader
              label={label}
              count={items.length}
              onClick={castGroupBy === 'building' && onBuildingLabelClick ? (e) => onBuildingLabelClick(key, e) : undefined}
            />
            <AssetTable assets={items} query={search} hiddenCols={[
              ...(hideBuildingColumn || castGroupBy === 'building' ? ['building' as SortKey] : []),
              ...(castGroupBy === 'category' ? ['category' as SortKey] : []),
              ...(castGroupBy === 'status' ? ['status' as SortKey] : []),
            ]} onAssetClick={onAssetClick} />
          </Box>
        ))
      ) : (
        <AssetTable assets={filteredAssets} query={search} hiddenCols={hideBuildingColumn ? ['building'] : []} onAssetClick={onAssetClick} />
      )}
    </Box>
  );
}
