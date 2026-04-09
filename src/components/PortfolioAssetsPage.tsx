'use client';

import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { useThemeMode } from '@/theme-mode-context';
import PageHeader from '@/components/PageHeader';
import FilterChip from '@/components/FilterChip';
import FilterDropdown, { type FilterOption } from '@/components/FilterDropdown';
import DateRangeSelector, { parseDateRange, getDateRangeDisplayLabel } from '@/components/DateRangeSelector';
import Button from '@/components/Button';
import { assetTree, type AssetNode } from '@/data/assetTree';

import AcUnitIcon from '@mui/icons-material/AcUnit';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import SecurityIcon from '@mui/icons-material/Security';
import ElevatorIcon from '@mui/icons-material/Elevator';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

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
interface EnrichedAsset extends AssetNode {
  building: string;
}

// ── Flatten Buildings tree with building context ──
function collectFromBuildings(nodes: AssetNode[], seen = new Set<string>(), building = ''): EnrichedAsset[] {
  const result: EnrichedAsset[] = [];
  for (const node of nodes) {
    const ctx = node.type === 'building' ? node.name : building;
    if (node.type === 'asset' && !seen.has(node.id)) {
      result.push({ ...node, building: ctx });
      seen.add(node.id);
    } else if (node.children) {
      result.push(...collectFromBuildings(node.children, seen, ctx));
    }
  }
  return result;
}

const buildingsNode = assetTree.find(n => n.id === 'dt-buildings');
const ALL_ASSETS: EnrichedAsset[] = buildingsNode
  ? collectFromBuildings(buildingsNode.children?.slice(0, 15) ?? [])
  : [];

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
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const visibleColumns = useMemo(() => hiddenCols.length ? COLUMNS.filter(col => !hiddenCols.includes(col.key)) : COLUMNS, [hiddenCols]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
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

// ── Main component ──
export default function PortfolioAssetsPage({ buildingName, onAssetClick, onBuildingLabelClick }: { buildingName?: string; onAssetClick?: (assetId: string, e: React.MouseEvent) => void; onBuildingLabelClick?: (buildingName: string, e?: React.MouseEvent) => void } = {}) {
  const { themeColors: c } = useThemeMode();

  const baseAssets = useMemo(
    () => buildingName ? ALL_ASSETS.filter(a => a.building === buildingName) : ALL_ASSETS,
    [buildingName]
  );

  // Derived option lists (computed once from static data)
  const allCategories = useMemo(() => Array.from(new Set(baseAssets.map(a => a.metadata?.category).filter(Boolean) as string[])).sort(), [baseAssets]);
  const allStatuses   = useMemo(() => Array.from(new Set(baseAssets.map(a => a.metadata?.status).filter(Boolean) as string[])).sort(), [baseAssets]);
  const allBuildings  = useMemo(() => Array.from(new Set(baseAssets.map(a => a.building).filter(Boolean))).sort(), [baseAssets]);
  const allManufacturers = useMemo(() => Array.from(new Set(baseAssets.map(a => a.metadata?.manufacturer).filter(Boolean) as string[])).sort(), [baseAssets]);
  const allModels     = useMemo(() => Array.from(new Set(baseAssets.map(a => a.metadata?.model).filter(Boolean) as string[])).sort(), [baseAssets]);
  const allZones      = useMemo(() => Array.from(new Set(baseAssets.map(a => a.metadata?.zone).filter(Boolean) as string[])).sort(), [baseAssets]);

  // Always-visible filters
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryAnchor, setCategoryAnchor] = useState<null | HTMLElement>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [groupByMenuAnchor, setGroupByMenuAnchor] = useState<null | HTMLElement>(null);

  // Building filter
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [buildingAnchor, setBuildingAnchor] = useState<null | HTMLElement>(null);

  // Manufacturer filter
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [manufacturerAnchor, setManufacturerAnchor] = useState<null | HTMLElement>(null);

  // Model filter
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [modelAnchor, setModelAnchor] = useState<null | HTMLElement>(null);

  // Zone filter
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [zoneAnchor, setZoneAnchor] = useState<null | HTMLElement>(null);

  // Installation date filter
  const DEFAULT_DATE_RANGE = `2023-01-01|${new Date().toISOString().split('T')[0]}`;
  const [dateRange, setDateRange] = useState('');
  const [dateDialogOpen, setDateDialogOpen] = useState(false);

  // Filtered data
  const filtered = useMemo(() => {
    let list = baseAssets;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.building.toLowerCase().includes(q) ||
        a.metadata?.category?.toLowerCase().includes(q) ||
        a.metadata?.manufacturer?.toLowerCase().includes(q) ||
        a.metadata?.model?.toLowerCase().includes(q) ||
        a.metadata?.serialNumber?.toLowerCase().includes(q)
      );
    }
    if (selectedCategories.length > 0)    list = list.filter(a => selectedCategories.includes(a.metadata?.category ?? ''));
    if (selectedStatuses.length > 0)      list = list.filter(a => selectedStatuses.includes(a.metadata?.status ?? ''));
    if (selectedBuildings.length > 0)     list = list.filter(a => selectedBuildings.includes(a.building));
    if (selectedManufacturers.length > 0) list = list.filter(a => selectedManufacturers.includes(a.metadata?.manufacturer ?? ''));
    if (selectedModels.length > 0)        list = list.filter(a => selectedModels.includes(a.metadata?.model ?? ''));
    if (selectedZones.length > 0)         list = list.filter(a => selectedZones.includes(a.metadata?.zone ?? ''));
    if (dateRange) {
      const { from, to } = parseDateRange(dateRange);
      const fromStr = from.toISOString().split('T')[0];
      const toStr = to.toISOString().split('T')[0];
      list = list.filter(a => (a.metadata?.installDate ?? '') >= fromStr && (a.metadata?.installDate ?? '') <= toStr);
    }
    return list;
  }, [baseAssets, search, selectedCategories, selectedStatuses, selectedBuildings, selectedManufacturers, selectedModels, selectedZones, dateRange]);

  // Grouped data (for separate-table-per-group rendering)
  const grouped = useMemo(() => {
    if (groupBy === 'none') return null;
    const map = new Map<string, EnrichedAsset[]>();
    for (const a of filtered) {
      const key = groupBy === 'building' ? a.building :
                  groupBy === 'category' ? (a.metadata?.category ?? 'Other') :
                  (a.metadata?.status ?? 'unknown');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, items]) => ({ key, label: key, items }));
  }, [filtered, groupBy]);

  // Chip display values
  const chipValue = (vals: string[], plural: string) =>
    vals.length === 0 ? null : vals.length === 1 ? vals[0] : `${vals.length} ${plural}`;

  const categoryChipValue     = chipValue(selectedCategories,    'categories');
  const statusChipValue       = selectedStatuses.length === 0 ? null : selectedStatuses.length === 1 ? (selectedStatuses[0].charAt(0).toUpperCase() + selectedStatuses[0].slice(1)) : `${selectedStatuses.length} statuses`;
  const buildingChipValue     = chipValue(selectedBuildings,     'buildings');
  const manufacturerChipValue = chipValue(selectedManufacturers, 'manufacturers');
  const modelChipValue        = chipValue(selectedModels,        'models');
  const zoneChipValue         = chipValue(selectedZones,         'zones');

  const filterChips = (
    <>
      {/* Always-visible filter chips */}
      <FilterChip label="Category" value={categoryChipValue} onClick={(e) => setCategoryAnchor(e.currentTarget)} onClear={selectedCategories.length > 0 ? () => setSelectedCategories([]) : undefined} />
      <FilterDropdown
        anchorEl={categoryAnchor} onClose={() => setCategoryAnchor(null)}
        options={allCategories.map(cat => { const { Icon, color } = getCatConfig(cat); return { value: cat, icon: <Icon sx={{ fontSize: 16, color }} /> } satisfies FilterOption; })}
        multiple value={selectedCategories} onChange={setSelectedCategories} placeholder="Search categories…"
      />

      <FilterChip label="Status" value={statusChipValue} onClick={(e) => setStatusAnchor(e.currentTarget)} onClear={selectedStatuses.length > 0 ? () => setSelectedStatuses([]) : undefined} />
      <FilterDropdown
        anchorEl={statusAnchor} onClose={() => setStatusAnchor(null)}
        options={allStatuses.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1), icon: <FiberManualRecordIcon sx={{ fontSize: 12, color: STATUS_COLOR[s] ?? '#9E9E9E' }} /> } satisfies FilterOption))}
        multiple value={selectedStatuses} onChange={setSelectedStatuses} placeholder="Search statuses…"
      />

      {/* Building (only in global view) */}
      {!buildingName && (
        <>
          <FilterChip label="Building" value={buildingChipValue} onClick={(e) => setBuildingAnchor(e.currentTarget)} onClear={selectedBuildings.length > 0 ? () => setSelectedBuildings([]) : undefined} />
          <FilterDropdown
            anchorEl={buildingAnchor} onClose={() => setBuildingAnchor(null)}
            options={allBuildings.map(b => ({ value: b, icon: <ApartmentOutlinedIcon sx={{ fontSize: 16 }} /> } satisfies FilterOption))}
            multiple value={selectedBuildings} onChange={setSelectedBuildings}
            placeholder="Search buildings…"
          />
        </>
      )}

      {/* Manufacturer */}
      <FilterChip label="Manufacturer" value={manufacturerChipValue} onClick={(e) => setManufacturerAnchor(e.currentTarget)} onClear={selectedManufacturers.length > 0 ? () => setSelectedManufacturers([]) : undefined} />
      <FilterDropdown
        anchorEl={manufacturerAnchor} onClose={() => setManufacturerAnchor(null)}
        options={allManufacturers.map(m => ({ value: m } satisfies FilterOption))}
        multiple value={selectedManufacturers} onChange={setSelectedManufacturers}
        placeholder="Search manufacturers…"
      />

      {/* Model */}
      <FilterChip label="Model" value={modelChipValue} onClick={(e) => setModelAnchor(e.currentTarget)} onClear={selectedModels.length > 0 ? () => setSelectedModels([]) : undefined} />
      <FilterDropdown
        anchorEl={modelAnchor} onClose={() => setModelAnchor(null)}
        options={allModels.map(m => ({ value: m } satisfies FilterOption))}
        multiple value={selectedModels} onChange={setSelectedModels}
        placeholder="Search models…"
      />

      {/* Zone */}
      <FilterChip label="Zone" value={zoneChipValue} onClick={(e) => setZoneAnchor(e.currentTarget)} onClear={selectedZones.length > 0 ? () => setSelectedZones([]) : undefined} />
      <FilterDropdown
        anchorEl={zoneAnchor} onClose={() => setZoneAnchor(null)}
        options={allZones.map(l => ({ value: l, icon: <LocationOnOutlinedIcon sx={{ fontSize: 16 }} /> } satisfies FilterOption))}
        multiple value={selectedZones} onChange={setSelectedZones}
        placeholder="Search zones…"
      />

      {/* Installation date */}
      <FilterChip
        label="Installation date"
        value={dateRange ? getDateRangeDisplayLabel(dateRange) : null}
        onClick={() => setDateDialogOpen(true)}
        onClear={dateRange ? () => setDateRange('') : undefined}
      />
      <DateRangeSelector
        inline
        hideSlider
        dialogOpen={dateDialogOpen}
        onDialogOpenChange={setDateDialogOpen}
        value={dateRange || DEFAULT_DATE_RANGE}
        onChange={setDateRange}
      />
    </>
  );

  const groupByMenu = (
    <Menu
      anchorEl={groupByMenuAnchor}
      open={Boolean(groupByMenuAnchor)}
      onClose={() => setGroupByMenuAnchor(null)}
      slotProps={{ paper: { sx: { borderRadius: '8px', mt: 0.5, minWidth: 160 } } }}
    >
      <MenuItem selected={groupBy === 'none'} onClick={() => { setGroupBy('none'); setGroupByMenuAnchor(null); }}>
        <ListItemText>No grouping</ListItemText>
      </MenuItem>
      <Divider />
      {!buildingName && (
        <MenuItem selected={groupBy === 'building'} onClick={() => { setGroupBy('building'); setGroupByMenuAnchor(null); }}>
          <ListItemText>Building</ListItemText>
        </MenuItem>
      )}
      <MenuItem selected={groupBy === 'category'} onClick={() => { setGroupBy('category'); setGroupByMenuAnchor(null); }}>
        <ListItemText>Category</ListItemText>
      </MenuItem>
      <MenuItem selected={groupBy === 'status'} onClick={() => { setGroupBy('status'); setGroupByMenuAnchor(null); }}>
        <ListItemText>Status</ListItemText>
      </MenuItem>
    </Menu>
  );

  const searchBox = (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', height: 30, borderRadius: '6px',
        border: '1px solid', borderColor: c.borderPrimary, bgcolor: c.bgPrimary,
        px: 1, gap: 0.5,
        '&:focus-within': { borderColor: c.brandSecondary },
        transition: 'border-color 0.15s ease',
      }}
    >
      <SearchIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
      <InputBase
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search assets…"
        sx={{ fontSize: '0.8rem', minWidth: 160, '& input': { p: 0, lineHeight: 1 } }}
        endAdornment={
          search ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.25 }}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </InputAdornment>
          ) : null
        }
      />
    </Box>
  );

  return (
    <Box>
      {buildingName ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {filterChips}
          <Box sx={{ flex: 1 }} />
          <Button variant="secondary" size="sm" endIcon={<ExpandMoreIcon />} onClick={(e) => setGroupByMenuAnchor(e.currentTarget)}>
            Group by
          </Button>
          {groupByMenu}
          {searchBox}
        </Box>
      ) : (
        <PageHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '2rem', lineHeight: 1.3 }}>
                Assets <Typography component="span" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: '1.25rem' }}>{filtered.length}</Typography>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Button variant="secondary" size="sm" endIcon={<ExpandMoreIcon />} onClick={(e) => setGroupByMenuAnchor(e.currentTarget)}>
                  Group by
                </Button>
                {groupByMenu}
                {searchBox}
              </Box>
            </Box>
          }
        >
          {filterChips}
        </PageHeader>
      )}

      <Box sx={{ pt: 3 }}>
        {filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">No assets match your filters.</Typography>
          </Box>
        ) : grouped ? (
          grouped.map(({ key, label, items }) => (
            <Box key={key} sx={{ mb: 4 }}>
              <SectionHeader
                label={label}
                count={items.length}
                onClick={groupBy === 'building' && onBuildingLabelClick ? (e) => onBuildingLabelClick(key, e) : undefined}
              />
              <AssetTable assets={items} query={search} hiddenCols={[
                ...(buildingName || groupBy === 'building' ? ['building' as SortKey] : []),
                ...(groupBy === 'category' ? ['category' as SortKey] : []),
                ...(groupBy === 'status' ? ['status' as SortKey] : []),
              ]} onAssetClick={onAssetClick} />
            </Box>
          ))
        ) : (
          <AssetTable assets={filtered} query={search} hiddenCols={buildingName ? ['building'] : []} onAssetClick={onAssetClick} />
        )}
      </Box>
    </Box>
  );
}
