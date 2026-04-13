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
import Button from '@/components/Button';
import FilterChip from '@/components/FilterChip';
import FilterDropdown from '@/components/FilterDropdown';
import { useThemeMode } from '@/theme-mode-context';
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

const COLUMNS: { key: SortKey; label: string; width?: string }[] = [
  { key: 'name',         label: 'Asset',        width: '18%' },
  { key: 'building',     label: 'Building',     width: '16%' },
  { key: 'category',     label: 'Category',     width: '13%' },
  { key: 'manufacturer', label: 'Manufacturer', width: '12%' },
  { key: 'model',        label: 'Model',        width: '12%' },
  { key: 'zone',         label: 'Zone',         width: '13%' },
  { key: 'installDate',  label: 'Installation date', width: '11%' },
  { key: 'status',       label: 'Status',       width: '8%'  },
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
type GroupBy = 'none' | 'building' | 'category' | 'status';

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
                  {col.label}
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
      <FilterChip label="Category" value={catChip} onClick={(e) => setCategoryAnchor(e.currentTarget)} onClear={selectedCategories.length > 0 ? () => setSelectedCategories([]) : undefined} />
      <FilterDropdown anchorEl={categoryAnchor} onClose={() => setCategoryAnchor(null)} options={allCategories.map(c => ({ value: c }))} multiple value={selectedCategories} onChange={(v) => setSelectedCategories(v as string[])} placeholder="Search categories…" />

      <FilterChip label="Status" value={statusChip} onClick={(e) => setStatusAnchor(e.currentTarget)} onClear={selectedStatuses.length > 0 ? () => setSelectedStatuses([]) : undefined} />
      <FilterDropdown anchorEl={statusAnchor} onClose={() => setStatusAnchor(null)} options={allStatuses.map(s => ({ value: s }))} multiple value={selectedStatuses} onChange={(v) => setSelectedStatuses(v as string[])} placeholder="Search statuses…" />

      <FilterChip label="Manufacturer" value={mfgChip} onClick={(e) => setManufacturerAnchor(e.currentTarget)} onClear={selectedManufacturers.length > 0 ? () => setSelectedManufacturers([]) : undefined} />
      <FilterDropdown anchorEl={manufacturerAnchor} onClose={() => setManufacturerAnchor(null)} options={allManufacturers.map(m => ({ value: m }))} multiple value={selectedManufacturers} onChange={(v) => setSelectedManufacturers(v as string[])} placeholder="Search manufacturers…" />

      <FilterChip label="Model" value={modelChip} onClick={(e) => setModelAnchor(e.currentTarget)} onClear={selectedModels.length > 0 ? () => setSelectedModels([]) : undefined} />
      <FilterDropdown anchorEl={modelAnchor} onClose={() => setModelAnchor(null)} options={allModels.map(m => ({ value: m }))} multiple value={selectedModels} onChange={(v) => setSelectedModels(v as string[])} placeholder="Search models…" />

      <FilterChip label="Zone" value={zoneChip} onClick={(e) => setZoneAnchor(e.currentTarget)} onClear={selectedZones.length > 0 ? () => setSelectedZones([]) : undefined} />
      <FilterDropdown anchorEl={zoneAnchor} onClose={() => setZoneAnchor(null)} options={allZoneNames.map(z => ({ value: z }))} multiple value={selectedZones} onChange={(v) => setSelectedZones(v as string[])} placeholder="Search zones…" />

      {/* Right: Group by + Search */}
      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button variant="secondary" size="sm" endIcon={<ExpandMoreIcon />} onClick={(e) => setGroupByMenuAnchor(e.currentTarget)}>
          Group by
        </Button>
        <Menu anchorEl={groupByMenuAnchor} open={Boolean(groupByMenuAnchor)} onClose={() => setGroupByMenuAnchor(null)} slotProps={{ paper: { sx: { borderRadius: '8px', mt: 0.5, minWidth: 140 } } }}>
          <MenuItem selected={internalGroupBy === 'none'} onClick={() => { setInternalGroupBy('none'); setGroupByMenuAnchor(null); }}><ListItemText>No grouping</ListItemText></MenuItem>
          <Divider />
          <MenuItem selected={internalGroupBy === 'category'} onClick={() => { setInternalGroupBy('category'); setGroupByMenuAnchor(null); }}><ListItemText>Category</ListItemText></MenuItem>
          <MenuItem selected={internalGroupBy === 'status'} onClick={() => { setInternalGroupBy('status'); setGroupByMenuAnchor(null); }}><ListItemText>Status</ListItemText></MenuItem>
        </Menu>
        <Box sx={{ display: 'flex', alignItems: 'center', height: 30, borderRadius: '6px', border: '1px solid', borderColor: c.borderPrimary, bgcolor: c.bgPrimary, px: 1, gap: 0.5, '&:focus-within': { borderColor: c.brandSecondary }, transition: 'border-color 0.15s ease' }}>
          <SearchIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
          <InputBase
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            placeholder="Search assets…"
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

  // Grouped output
  const grouped = useMemo(() => {
    if (castGroupBy === 'none') return null;
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
                {['Asset', 'Building', 'Category', 'Manufacturer', 'Model', 'Zone', 'Installation date', 'Status'].map((h) => (
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
          <Typography variant="body1" color="text.secondary">No assets match your filters.</Typography>
        </Box>
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
