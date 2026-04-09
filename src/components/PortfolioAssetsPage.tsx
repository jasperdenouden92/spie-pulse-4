'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
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
import AddIcon from '@mui/icons-material/Add';
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
  const s = status ?? 'operational';
  const color = STATUS_COLOR[s] ?? STATUS_COLOR.operational;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <FiberManualRecordIcon sx={{ fontSize: 9, color, flexShrink: 0 }} />
      <Typography variant="body2" sx={{ fontSize: '0.8125rem', textTransform: 'capitalize' }}>{s}</Typography>
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
type SortKey = 'name' | 'building' | 'category' | 'manufacturer' | 'model' | 'location' | 'installDate' | 'status';

const COLUMNS: { key: SortKey; label: string; width?: string }[] = [
  { key: 'name',         label: 'Asset',        width: '18%' },
  { key: 'building',     label: 'Building',     width: '16%' },
  { key: 'category',     label: 'Category',     width: '15%' },
  { key: 'manufacturer', label: 'Manufacturer', width: '12%' },
  { key: 'model',        label: 'Model',        width: '12%' },
  { key: 'location',     label: 'Location',     width: '13%' },
  { key: 'installDate',  label: 'Installed',    width: '9%'  },
  { key: 'status',       label: 'Status',       width: '8%'  },
];

function getSortValue(asset: EnrichedAsset, key: SortKey): string {
  switch (key) {
    case 'name':         return asset.name;
    case 'building':     return asset.building;
    case 'category':     return asset.metadata?.category ?? '';
    case 'manufacturer': return asset.metadata?.manufacturer ?? '';
    case 'model':        return asset.metadata?.model ?? '';
    case 'location':     return [asset.metadata?.floor, asset.metadata?.zone].filter(Boolean).join(' ');
    case 'installDate':  return asset.metadata?.installDate ?? '';
    case 'status':       return asset.metadata?.status ?? '';
  }
}

// ── Types ──
type GroupBy = 'none' | 'building' | 'category' | 'status';

// ── Asset table ──
function AssetTable({ assets, query = '', groupBy }: { assets: EnrichedAsset[]; query?: string; groupBy: GroupBy }) {
  const { themeColors: c } = useThemeMode();
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  const grouped = useMemo(() => {
    if (groupBy === 'none') return [{ key: '__all__', label: '', items: assets }];
    const map = new Map<string, EnrichedAsset[]>();
    for (const a of assets) {
      const key = groupBy === 'building' ? a.building :
                  groupBy === 'category' ? (a.metadata?.category ?? 'Other') :
                  (a.metadata?.status ?? 'unknown');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, items]) => ({ key, label: key, items }));
  }, [assets, groupBy]);

  const sortedGroups = useMemo(() =>
    grouped.map(g => ({
      ...g,
      items: [...g.items].sort((a, b) => {
        const av = getSortValue(a, sortKey);
        const bv = getSortValue(b, sortKey);
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }),
    })),
    [grouped, sortKey, sortDir]
  );

  if (assets.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">No assets match your filters.</Typography>
      </Box>
    );
  }

  return (
    <TableContainer sx={{ border: `1px solid ${c.cardBorder}`, borderRadius: '8px', bgcolor: c.bgPrimary }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {COLUMNS.map(col => (
              <TableCell
                key={col.key}
                width={col.width}
                sortDirection={sortKey === col.key ? sortDir : false}
                sx={{ bgcolor: c.bgSecondary, fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1, borderBottom: `1px solid ${c.cardBorder}`, whiteSpace: 'nowrap' }}
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
        <TableBody>
          {sortedGroups.map(({ key, label, items }) => (
            <React.Fragment key={key}>
              {groupBy !== 'none' && (
                <TableRow>
                  <TableCell
                    colSpan={COLUMNS.length}
                    sx={{ py: 1, px: 2, bgcolor: c.bgSecondary, borderTop: key !== sortedGroups[0].key ? `1px solid ${c.cardBorder}` : undefined }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {Boolean(CATEGORY_CONFIG[label]) && (() => {
                        const { Icon, color } = getCatConfig(label);
                        return (
                          <Box sx={{ width: 18, height: 18, borderRadius: '3px', bgcolor: `${color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon sx={{ fontSize: 11, color }} />
                          </Box>
                        );
                      })()}
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary', textTransform: 'capitalize' }}>{label}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>{items.length}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              {items.map(asset => {
                const location = [asset.metadata?.floor, asset.metadata?.zone].filter(Boolean).join(' · ');
                return (
                  <TableRow key={asset.id} hover sx={{ cursor: 'pointer', '&:last-child td': { border: 0 }, '& td': { borderColor: c.cardBorder } }}>
                    <TableCell sx={{ py: 1.25 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <HighlightText text={asset.name} query={query} />
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.25 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <HighlightText text={asset.building} query={query} />
                      </Typography>
                    </TableCell>
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
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {location || <Box component="span" sx={{ color: 'text.disabled' }}>—</Box>}
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
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ── Main component ──
export default function PortfolioAssetsPage() {
  const { themeColors: c } = useThemeMode();

  // Derived option lists (computed once from static data)
  const allCategories = useMemo(() => Array.from(new Set(ALL_ASSETS.map(a => a.metadata?.category).filter(Boolean) as string[])).sort(), []);
  const allStatuses   = useMemo(() => Array.from(new Set(ALL_ASSETS.map(a => a.metadata?.status).filter(Boolean) as string[])).sort(), []);
  const allBuildings  = useMemo(() => Array.from(new Set(ALL_ASSETS.map(a => a.building).filter(Boolean))).sort(), []);
  const allManufacturers = useMemo(() => Array.from(new Set(ALL_ASSETS.map(a => a.metadata?.manufacturer).filter(Boolean) as string[])).sort(), []);
  const allModels     = useMemo(() => Array.from(new Set(ALL_ASSETS.map(a => a.metadata?.model).filter(Boolean) as string[])).sort(), []);
  const allLocations  = useMemo(() => Array.from(new Set(ALL_ASSETS.map(a => a.metadata?.zone).filter(Boolean) as string[])).sort(), []);
  const allYears      = useMemo(() => Array.from(new Set(ALL_ASSETS.map(a => a.metadata?.installDate?.slice(0, 4)).filter(Boolean) as string[])).sort().reverse(), []);

  // Always-visible filters
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryAnchor, setCategoryAnchor] = useState<null | HTMLElement>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [groupByMenuAnchor, setGroupByMenuAnchor] = useState<null | HTMLElement>(null);

  // Optional filters — add filter menu
  const [addFilterMenuAnchor, setAddFilterMenuAnchor] = useState<null | HTMLElement>(null);

  // Building filter
  const [showBuilding, setShowBuilding] = useState(false);
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [buildingAnchor, setBuildingAnchor] = useState<null | HTMLElement>(null);
  const buildingChipRef = useRef<HTMLDivElement>(null);
  const [pendingBuildingOpen, setPendingBuildingOpen] = useState(false);
  useEffect(() => {
    if (pendingBuildingOpen && buildingChipRef.current) { setBuildingAnchor(buildingChipRef.current); setPendingBuildingOpen(false); }
  }, [pendingBuildingOpen, showBuilding]);

  // Manufacturer filter
  const [showManufacturer, setShowManufacturer] = useState(false);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [manufacturerAnchor, setManufacturerAnchor] = useState<null | HTMLElement>(null);
  const manufacturerChipRef = useRef<HTMLDivElement>(null);
  const [pendingManufacturerOpen, setPendingManufacturerOpen] = useState(false);
  useEffect(() => {
    if (pendingManufacturerOpen && manufacturerChipRef.current) { setManufacturerAnchor(manufacturerChipRef.current); setPendingManufacturerOpen(false); }
  }, [pendingManufacturerOpen, showManufacturer]);

  // Model filter
  const [showModel, setShowModel] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [modelAnchor, setModelAnchor] = useState<null | HTMLElement>(null);
  const modelChipRef = useRef<HTMLDivElement>(null);
  const [pendingModelOpen, setPendingModelOpen] = useState(false);
  useEffect(() => {
    if (pendingModelOpen && modelChipRef.current) { setModelAnchor(modelChipRef.current); setPendingModelOpen(false); }
  }, [pendingModelOpen, showModel]);

  // Location filter
  const [showLocation, setShowLocation] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [locationAnchor, setLocationAnchor] = useState<null | HTMLElement>(null);
  const locationChipRef = useRef<HTMLDivElement>(null);
  const [pendingLocationOpen, setPendingLocationOpen] = useState(false);
  useEffect(() => {
    if (pendingLocationOpen && locationChipRef.current) { setLocationAnchor(locationChipRef.current); setPendingLocationOpen(false); }
  }, [pendingLocationOpen, showLocation]);

  // Installed (year) filter
  const [showInstalled, setShowInstalled] = useState(false);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [installedAnchor, setInstalledAnchor] = useState<null | HTMLElement>(null);
  const installedChipRef = useRef<HTMLDivElement>(null);
  const [pendingInstalledOpen, setPendingInstalledOpen] = useState(false);
  useEffect(() => {
    if (pendingInstalledOpen && installedChipRef.current) { setInstalledAnchor(installedChipRef.current); setPendingInstalledOpen(false); }
  }, [pendingInstalledOpen, showInstalled]);

  // Optional filter definitions
  const optionalFilters = [
    { key: 'building',     label: 'Building',     visible: showBuilding },
    { key: 'manufacturer', label: 'Manufacturer', visible: showManufacturer },
    { key: 'model',        label: 'Model',        visible: showModel },
    { key: 'location',     label: 'Location',     visible: showLocation },
    { key: 'installed',    label: 'Installed',    visible: showInstalled },
  ];
  const availableToAdd = optionalFilters.filter(f => !f.visible);

  function addFilter(key: string) {
    if (key === 'building')     { setShowBuilding(true);     setPendingBuildingOpen(true); }
    if (key === 'manufacturer') { setShowManufacturer(true); setPendingManufacturerOpen(true); }
    if (key === 'model')        { setShowModel(true);        setPendingModelOpen(true); }
    if (key === 'location')     { setShowLocation(true);     setPendingLocationOpen(true); }
    if (key === 'installed')    { setShowInstalled(true);    setPendingInstalledOpen(true); }
    setAddFilterMenuAnchor(null);
  }

  // Filtered data
  const filtered = useMemo(() => {
    let list = ALL_ASSETS;
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
    if (selectedLocations.length > 0)     list = list.filter(a => selectedLocations.includes(a.metadata?.zone ?? ''));
    if (selectedYears.length > 0)         list = list.filter(a => selectedYears.includes(a.metadata?.installDate?.slice(0, 4) ?? ''));
    return list;
  }, [search, selectedCategories, selectedStatuses, selectedBuildings, selectedManufacturers, selectedModels, selectedLocations, selectedYears]);

  // Chip display values
  const chipValue = (vals: string[], singular: string, plural: string) =>
    vals.length === 0 ? null : vals.length === 1 ? vals[0] : `${vals.length} ${plural}`;

  const categoryChipValue     = chipValue(selectedCategories,    '', 'categories');
  const statusChipValue       = selectedStatuses.length === 0 ? null : selectedStatuses.length === 1 ? (selectedStatuses[0].charAt(0).toUpperCase() + selectedStatuses[0].slice(1)) : `${selectedStatuses.length} statuses`;
  const buildingChipValue     = chipValue(selectedBuildings,     '', 'buildings');
  const manufacturerChipValue = chipValue(selectedManufacturers, '', 'manufacturers');
  const modelChipValue        = chipValue(selectedModels,        '', 'models');
  const locationChipValue     = chipValue(selectedLocations,     '', 'zones');
  const installedChipValue    = selectedYears.length === 0 ? null : selectedYears.length === 1 ? selectedYears[0] : `${selectedYears.length} years`;

  return (
    <Box>
      <PageHeader
        title="Assets"
        actions={
          <>
            <Button variant="secondary" size="sm" endIcon={<ExpandMoreIcon />} onClick={(e) => setGroupByMenuAnchor(e.currentTarget)}>
              Group by
            </Button>
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
              <MenuItem selected={groupBy === 'building'} onClick={() => { setGroupBy('building'); setGroupByMenuAnchor(null); }}>
                <ListItemText>Building</ListItemText>
              </MenuItem>
              <MenuItem selected={groupBy === 'category'} onClick={() => { setGroupBy('category'); setGroupByMenuAnchor(null); }}>
                <ListItemText>Category</ListItemText>
              </MenuItem>
              <MenuItem selected={groupBy === 'status'} onClick={() => { setGroupBy('status'); setGroupByMenuAnchor(null); }}>
                <ListItemText>Status</ListItemText>
              </MenuItem>
            </Menu>

            {/* Search */}
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
          </>
        }
      >
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

        {/* Optional: Building */}
        {showBuilding && (
          <Box ref={buildingChipRef} sx={{ display: 'inline-flex' }}>
            <FilterChip label="Building" value={buildingChipValue} onClick={(e) => setBuildingAnchor(e.currentTarget)} onClear={() => { setSelectedBuildings([]); setShowBuilding(false); }} />
          </Box>
        )}
        <FilterDropdown
          anchorEl={buildingAnchor} onClose={() => setBuildingAnchor(null)}
          options={allBuildings.map(b => ({ value: b, icon: <ApartmentOutlinedIcon sx={{ fontSize: 16 }} /> } satisfies FilterOption))}
          multiple value={selectedBuildings} onChange={setSelectedBuildings}
          onRemove={() => setShowBuilding(false)} placeholder="Search buildings…"
        />

        {/* Optional: Manufacturer */}
        {showManufacturer && (
          <Box ref={manufacturerChipRef} sx={{ display: 'inline-flex' }}>
            <FilterChip label="Manufacturer" value={manufacturerChipValue} onClick={(e) => setManufacturerAnchor(e.currentTarget)} onClear={() => { setSelectedManufacturers([]); setShowManufacturer(false); }} />
          </Box>
        )}
        <FilterDropdown
          anchorEl={manufacturerAnchor} onClose={() => setManufacturerAnchor(null)}
          options={allManufacturers.map(m => ({ value: m } satisfies FilterOption))}
          multiple value={selectedManufacturers} onChange={setSelectedManufacturers}
          onRemove={() => setShowManufacturer(false)} placeholder="Search manufacturers…"
        />

        {/* Optional: Model */}
        {showModel && (
          <Box ref={modelChipRef} sx={{ display: 'inline-flex' }}>
            <FilterChip label="Model" value={modelChipValue} onClick={(e) => setModelAnchor(e.currentTarget)} onClear={() => { setSelectedModels([]); setShowModel(false); }} />
          </Box>
        )}
        <FilterDropdown
          anchorEl={modelAnchor} onClose={() => setModelAnchor(null)}
          options={allModels.map(m => ({ value: m } satisfies FilterOption))}
          multiple value={selectedModels} onChange={setSelectedModels}
          onRemove={() => setShowModel(false)} placeholder="Search models…"
        />

        {/* Optional: Location */}
        {showLocation && (
          <Box ref={locationChipRef} sx={{ display: 'inline-flex' }}>
            <FilterChip label="Location" value={locationChipValue} onClick={(e) => setLocationAnchor(e.currentTarget)} onClear={() => { setSelectedLocations([]); setShowLocation(false); }} />
          </Box>
        )}
        <FilterDropdown
          anchorEl={locationAnchor} onClose={() => setLocationAnchor(null)}
          options={allLocations.map(l => ({ value: l, icon: <LocationOnOutlinedIcon sx={{ fontSize: 16 }} /> } satisfies FilterOption))}
          multiple value={selectedLocations} onChange={setSelectedLocations}
          onRemove={() => setShowLocation(false)} placeholder="Search locations…"
        />

        {/* Optional: Installed */}
        {showInstalled && (
          <Box ref={installedChipRef} sx={{ display: 'inline-flex' }}>
            <FilterChip label="Installed" value={installedChipValue} onClick={(e) => setInstalledAnchor(e.currentTarget)} onClear={() => { setSelectedYears([]); setShowInstalled(false); }} />
          </Box>
        )}
        <FilterDropdown
          anchorEl={installedAnchor} onClose={() => setInstalledAnchor(null)}
          options={allYears.map(y => ({ value: y } satisfies FilterOption))}
          multiple value={selectedYears} onChange={setSelectedYears}
          onRemove={() => setShowInstalled(false)} placeholder="Search years…"
        />

        {/* Add filter button */}
        {availableToAdd.length > 0 && (
          <>
            <Button variant="tertiary" size="sm" startIcon={<AddIcon />} onClick={(e) => setAddFilterMenuAnchor(e.currentTarget)}>
              Filter
            </Button>
            <Menu
              anchorEl={addFilterMenuAnchor}
              open={Boolean(addFilterMenuAnchor)}
              onClose={() => setAddFilterMenuAnchor(null)}
              slotProps={{ paper: { sx: { borderRadius: '8px', mt: 0.5, minWidth: 160 } } }}
            >
              {availableToAdd.map(opt => (
                <MenuItem key={opt.key} onClick={() => addFilter(opt.key)}>
                  <ListItemText>{opt.label}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </PageHeader>

      <Box sx={{ pt: 3 }}>
        <AssetTable assets={filtered} query={search} groupBy={groupBy} />
      </Box>
    </Box>
  );
}
