'use client';

import React, { useState, useMemo } from 'react';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { useRouter } from 'next/navigation';
import { useFilterParams } from '@/hooks/useFilterParams';
import { useThemeMode } from '@/theme-mode-context';
import { useAppState } from '@/context/AppStateContext';
import { handleSidePeekClick } from '@/components/SidePeekPanel';
import PageHeader from '@/components/PageHeader';
import FilterChip from '@/components/FilterChip';
import FilterDropdown, { type FilterOption } from '@/components/FilterDropdown';
import DateRangeSelector, { parseDateRange, getDateRangeDisplayLabel } from '@/components/DateRangeSelector';
import AssetsList, { type EnrichedAsset } from '@/components/AssetsList';
import { assetTree, type AssetNode, getAssetById } from '@/data/assetTree';
import { buildings as allBuildings } from '@/data/buildings';
import { buildingToSlug } from '@/utils/slugs';

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

export default function PortfolioAssetsRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  const router = useRouter();
  const { themeColors: c } = useThemeMode();
  const { setSidePeekBuilding, setSidePeekBuildingTab, setSidePeekZone, setSidePeekAsset, setSidePeekAssetTab } = useAppState();

  // Derived option lists (computed once from static data)
  const allCategories = useMemo(() => Array.from(new Set(ALL_ASSETS.map(a => a.metadata?.category).filter(Boolean) as string[])).sort(), []);
  const allStatuses   = useMemo(() => Array.from(new Set(ALL_ASSETS.map(a => a.metadata?.status).filter(Boolean) as string[])).sort(), []);
  const allBuildingNames = useMemo(() => Array.from(new Set(ALL_ASSETS.map(a => a.building).filter(Boolean))).sort(), []);
  const allManufacturers = useMemo(() => Array.from(new Set(ALL_ASSETS.map(a => a.metadata?.manufacturer).filter(Boolean) as string[])).sort(), []);
  const allModels     = useMemo(() => Array.from(new Set(ALL_ASSETS.map(a => a.metadata?.model).filter(Boolean) as string[])).sort(), []);
  const allZones      = useMemo(() => Array.from(new Set(ALL_ASSETS.map(a => a.metadata?.zone).filter(Boolean) as string[])).sort(), []);

  const { get, set, getList, setList } = useFilterParams();

  // Always-visible filters
  const search = get('search', '');
  const selectedCategories = getList('categories');
  const [categoryAnchor, setCategoryAnchor] = useState<null | HTMLElement>(null);
  const selectedStatuses = getList('statuses');
  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null);
  const groupBy = get('groupBy', 'none');
  const [groupByMenuAnchor, setGroupByMenuAnchor] = useState<null | HTMLElement>(null);
  const GROUP_BY_OPTIONS = [
    { value: 'none', label: 'No grouping' },
    { value: 'building', label: 'Building' },
    { value: 'category', label: 'Category' },
    { value: 'status', label: 'Status' },
  ];
  const SORT_OPTIONS = [
    { value: 'name', label: 'Name (A → Z)' },
    { value: 'building', label: 'Building (A → Z)' },
    { value: 'category', label: 'Category (A → Z)' },
    { value: 'status', label: 'Status' },
    { value: 'manufacturer', label: 'Manufacturer (A → Z)' },
  ];
  const sortBy = get('sortBy', 'name');
  const [sortAnchor, setSortAnchor] = useState<null | HTMLElement>(null);

  // Building filter
  const selectedBuildings = getList('buildings');
  const [buildingAnchor, setBuildingAnchor] = useState<null | HTMLElement>(null);

  // Manufacturer filter
  const selectedManufacturers = getList('manufacturers');
  const [manufacturerAnchor, setManufacturerAnchor] = useState<null | HTMLElement>(null);

  // Model filter
  const selectedModels = getList('models');
  const [modelAnchor, setModelAnchor] = useState<null | HTMLElement>(null);

  // Zone filter
  const selectedZones = getList('zones');
  const [zoneAnchor, setZoneAnchor] = useState<null | HTMLElement>(null);

  // Installation date filter
  const DEFAULT_DATE_RANGE = `2023-01-01|${new Date().toISOString().split('T')[0]}`;
  const dateRange = get('dateRange', '');
  const [dateDialogOpen, setDateDialogOpen] = useState(false);

  // Filtered data
  const filtered = useMemo(() => {
    let list: EnrichedAsset[] = ALL_ASSETS;
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
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'building': return a.building.localeCompare(b.building);
        case 'category': return (a.metadata?.category ?? '').localeCompare(b.metadata?.category ?? '');
        case 'status': return (a.metadata?.status ?? '').localeCompare(b.metadata?.status ?? '');
        case 'manufacturer': return (a.metadata?.manufacturer ?? '').localeCompare(b.metadata?.manufacturer ?? '');
      }
      return 0;
    });
    return sorted;
  }, [search, selectedCategories, selectedStatuses, selectedBuildings, selectedManufacturers, selectedModels, selectedZones, dateRange, sortBy]);

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
      <FilterChip label="Category" value={categoryChipValue} onClick={(e) => setCategoryAnchor(e.currentTarget)} onClear={selectedCategories.length > 0 ? () => setList('categories', []) : undefined} />
      <FilterDropdown
        anchorEl={categoryAnchor} onClose={() => setCategoryAnchor(null)}
        options={allCategories.map(cat => { const { Icon, color } = getCatConfig(cat); return { value: cat, icon: <Icon sx={{ fontSize: 16, color }} /> } satisfies FilterOption; })}
        multiple value={selectedCategories} onChange={(v) => setList('categories', v as string[])} placeholder="Search categories\u2026"
      />

      <FilterChip label="Status" value={statusChipValue} onClick={(e) => setStatusAnchor(e.currentTarget)} onClear={selectedStatuses.length > 0 ? () => setList('statuses', []) : undefined} />
      <FilterDropdown
        anchorEl={statusAnchor} onClose={() => setStatusAnchor(null)}
        options={allStatuses.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1), icon: <FiberManualRecordIcon sx={{ fontSize: 12, color: STATUS_COLOR[s] ?? '#9E9E9E' }} /> } satisfies FilterOption))}
        multiple value={selectedStatuses} onChange={(v) => setList('statuses', v as string[])} placeholder="Search statuses\u2026"
      />

      {/* Building */}
      <FilterChip label="Building" value={buildingChipValue} onClick={(e) => setBuildingAnchor(e.currentTarget)} onClear={selectedBuildings.length > 0 ? () => setList('buildings', []) : undefined} />
      <FilterDropdown
        anchorEl={buildingAnchor} onClose={() => setBuildingAnchor(null)}
        options={allBuildingNames.map(b => ({ value: b, icon: <ApartmentOutlinedIcon sx={{ fontSize: 16 }} /> } satisfies FilterOption))}
        multiple value={selectedBuildings} onChange={(v) => setList('buildings', v as string[])}
        placeholder="Search buildings\u2026"
      />

      {/* Manufacturer */}
      <FilterChip label="Manufacturer" value={manufacturerChipValue} onClick={(e) => setManufacturerAnchor(e.currentTarget)} onClear={selectedManufacturers.length > 0 ? () => setList('manufacturers', []) : undefined} />
      <FilterDropdown
        anchorEl={manufacturerAnchor} onClose={() => setManufacturerAnchor(null)}
        options={allManufacturers.map(m => ({ value: m } satisfies FilterOption))}
        multiple value={selectedManufacturers} onChange={(v) => setList('manufacturers', v as string[])}
        placeholder="Search manufacturers\u2026"
      />

      {/* Model */}
      <FilterChip label="Model" value={modelChipValue} onClick={(e) => setModelAnchor(e.currentTarget)} onClear={selectedModels.length > 0 ? () => setList('models', []) : undefined} />
      <FilterDropdown
        anchorEl={modelAnchor} onClose={() => setModelAnchor(null)}
        options={allModels.map(m => ({ value: m } satisfies FilterOption))}
        multiple value={selectedModels} onChange={(v) => setList('models', v as string[])}
        placeholder="Search models\u2026"
      />

      {/* Zone */}
      <FilterChip label="Zone" value={zoneChipValue} onClick={(e) => setZoneAnchor(e.currentTarget)} onClear={selectedZones.length > 0 ? () => setList('zones', []) : undefined} />
      <FilterDropdown
        anchorEl={zoneAnchor} onClose={() => setZoneAnchor(null)}
        options={allZones.map(l => ({ value: l, icon: <LocationOnOutlinedIcon sx={{ fontSize: 16 }} /> } satisfies FilterOption))}
        multiple value={selectedZones} onChange={(v) => setList('zones', v as string[])}
        placeholder="Search zones\u2026"
      />

      {/* Installation date */}
      <FilterChip
        label="Installation date"
        value={dateRange ? getDateRangeDisplayLabel(dateRange) : null}
        onClick={() => setDateDialogOpen(true)}
        onClear={dateRange ? () => set('dateRange', '') : undefined}
      />
      <DateRangeSelector
        inline
        hideSlider
        dialogOpen={dateDialogOpen}
        onDialogOpenChange={setDateDialogOpen}
        value={dateRange || DEFAULT_DATE_RANGE}
        onChange={(v) => set('dateRange', v)}
      />
    </>
  );

  const groupByMenu = (
    <FilterDropdown
      anchorEl={groupByMenuAnchor}
      onClose={() => setGroupByMenuAnchor(null)}
      options={GROUP_BY_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
      value={groupBy}
      onChange={(val) => { if (val) set('groupBy', val); }}
      hideSearch
    />
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
        onChange={(e) => set('search', e.target.value)}
        placeholder="Search assets\u2026"
        sx={{ fontSize: '0.8rem', minWidth: 160, '& input': { p: 0, lineHeight: 1 } }}
        endAdornment={
          search ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => set('search', '')} sx={{ p: 0.25 }}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </InputAdornment>
          ) : null
        }
      />
    </Box>
  );

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <PageHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '2rem', lineHeight: 1.3 }}>
              Assets <Typography component="span" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: '1.25rem' }}>{filtered.length}</Typography>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FilterChip
                label="Group by"
                value={GROUP_BY_OPTIONS.find(o => o.value === groupBy)?.label}
                onClick={(e) => setGroupByMenuAnchor(e.currentTarget)}
                neutral
              />
              {groupByMenu}
              <FilterChip
                label="Sort"
                value={SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                onClick={(e) => setSortAnchor(e.currentTarget)}
                neutral
              />
              <FilterDropdown
                anchorEl={sortAnchor}
                onClose={() => setSortAnchor(null)}
                options={SORT_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                value={sortBy}
                onChange={(val) => { if (val) set('sortBy', val); }}
                hideSearch
              />
              {searchBox}
            </Box>
          </Box>
        }
      >
        {filterChips}
      </PageHeader>

      <AssetsList
        assets={filtered}
        search={search}
        groupBy={groupBy}
        onAssetClick={(id, e) => handleSidePeekClick(e,
          () => { const a = getAssetById(id); if (a) { setSidePeekAsset(a); setSidePeekAssetTab('overview'); } },
          () => router.push(`/assets/${id}`),
        )}
        onBuildingLabelClick={(name, e) => handleSidePeekClick(e,
          () => { const b = allBuildings.find(b => b.name === name); if (b) { setSidePeekZone(null); setSidePeekBuilding(b); setSidePeekBuildingTab('overview'); } },
          () => router.push(`/buildings/${buildingToSlug(name)}`),
        )}
      />
    </Container>
  );
}
