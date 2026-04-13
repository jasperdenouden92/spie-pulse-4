'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import FilterDropdown from '@/components/FilterDropdown';
import type { FilterOption } from '@/components/FilterDropdown';
import PageHeader from '@/components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { buildings } from '@/data/buildings';
import { buildingOperationalStats } from '@/data/buildingOperationalStats';
import { useThemeMode } from '@/theme-mode-context';
import { EnergyLabel } from '@/components/PropertyCard';
import FilterChip from '@/components/FilterChip';
import PortfolioMap from '@/components/PortfolioMap';
import { useURLState } from '@/hooks/useURLState';
import { useFilterParams } from '@/hooks/useFilterParams';
import { useAppState } from '@/context/AppStateContext';
import { handleSidePeekClick } from '@/components/SidePeekPanel';

import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

// ── Types ──

type ViewMode = 'grid' | 'map';
type GroupBy = 'none' | 'city' | 'group';
const GROUP_BY_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: 'none', label: 'No grouping' },
  { value: 'city', label: 'City' },
  { value: 'group', label: 'Cluster' },
];

type SortKey = 'name' | 'city' | 'group' | 'performance_desc' | 'performance_asc';
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Name (A → Z)' },
  { value: 'city', label: 'City (A → Z)' },
  { value: 'group', label: 'Cluster (A → Z)' },
  { value: 'performance_desc', label: 'Performance (high → low)' },
  { value: 'performance_asc', label: 'Performance (low → high)' },
];
type ContractFilter = 'all' | 'has_contract' | 'no_contract';

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
          <Box
            key={i}
            component="mark"
            sx={{
              bgcolor: `color-mix(in srgb, ${c.brandSecondary} 22%, transparent)`,
              color: 'inherit',
              borderRadius: '2px',
              px: '1px',
            }}
          >
            {part}
          </Box>
        ) : (
          part
        )
      )}
    </>
  );
}

// ── Building tile ──

function BuildingTile({ building, query = '', onClick }: { building: typeof buildings[0]; query?: string; onClick?: (e?: React.MouseEvent) => void }) {
  const { themeColors: c } = useThemeMode();
  const stats = buildingOperationalStats[building.name];
  const energyRating = stats?.sustainability?.weiiRating;

  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: '6px',
        border: `1px solid ${c.cardBorder}`,
        boxShadow: `0 2px 12px 0 ${c.shadow}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 20px 0 ${c.shadowMedium}`,
        } : {},
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            flexShrink: 0,
            width: 56,
            height: 56,
            borderRadius: '4px',
            overflow: 'hidden',
            bgcolor: c.bgSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {building.image ? (
            <Box
              component="img"
              src={building.image}
              alt={building.name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <ApartmentOutlinedIcon sx={{ fontSize: 28, color: 'text.disabled' }} />
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.5 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.3, mb: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <HighlightText text={building.name} query={query} />
            </Typography>
            {energyRating && <EnergyLabel rating={energyRating} size="small" />}
          </Box>
          <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.4 }}>
            {building.address ? <HighlightText text={building.address} query={query} /> : 'Unknown location'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── Section header for grouped view ──

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, mt: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
        {count}
      </Typography>
      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
    </Box>
  );
}


// ── Page ──

export default function PortfolioBuildingsRoute() {
  const { themeColors: c } = useThemeMode();
  const isNarrow = useMediaQuery('(max-width:960px)');
  const router = useRouter();
  const { selectedTenant } = useURLState();
  const { get, set, getList, setList } = useFilterParams();
  const { setSidePeekBuilding, setSidePeekBuildingTab, setSidePeekZone } = useAppState();

  const tenantBuildings = useMemo(() => buildings.filter(b => b.tenant === selectedTenant), [selectedTenant]);

  // View mode
  const viewMode = get('pview', 'grid') as ViewMode;
  const setViewMode = (v: ViewMode) => set('pview', v, 'grid');

  // View & grouping
  const groupBy = get('groupBy', 'none') as GroupBy;
  const [groupByMenuAnchor, setGroupByMenuAnchor] = useState<null | HTMLElement>(null);
  const sortBy = get('sortBy', 'name') as SortKey;
  const [sortAnchor, setSortAnchor] = useState<null | HTMLElement>(null);

  // Search
  const search = get('search', '');
  const searchRef = useRef<HTMLInputElement>(null);

  // Filters
  const contractFilter = get('contract', 'all') as ContractFilter;
  const [contractAnchor, setContractAnchor] = useState<null | HTMLElement>(null);
  const selectedCities = getList('cities');
  const [cityAnchor, setCityAnchor] = useState<null | HTMLElement>(null);
  const selectedGroups = getList('groups');
  const [groupAnchor, setGroupAnchor] = useState<null | HTMLElement>(null);
  const selectedEnergies = getList('energies');
  const [energyAnchor, setEnergyAnchor] = useState<null | HTMLElement>(null);

  // Derived option lists
  const cities = useMemo(() => Array.from(new Set(tenantBuildings.map(b => b.city))).sort(), [tenantBuildings]);
  const groups = useMemo(() => Array.from(new Set(tenantBuildings.map(b => b.group))).sort(), [tenantBuildings]);
  const ENERGY_ORDER = ['A+', 'A', 'B+', 'B', 'C', 'D', 'E', 'F', 'G'];
  const energyLabels = useMemo(() => {
    const set = new Set(tenantBuildings.map(b => buildingOperationalStats[b.name]?.sustainability?.weiiRating).filter(Boolean) as string[]);
    return ENERGY_ORDER.filter(l => set.has(l));
  }, [tenantBuildings]);

  // Filtered buildings
  const filtered = useMemo(() => {
    let list = tenantBuildings;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q)
      );
    }
    if (contractFilter === 'has_contract') list = list.filter(b => b.hasContract);
    if (contractFilter === 'no_contract') list = list.filter(b => !b.hasContract);
    if (selectedCities.length > 0) list = list.filter(b => selectedCities.includes(b.city));
    if (selectedGroups.length > 0) list = list.filter(b => selectedGroups.includes(b.group));
    if (selectedEnergies.length > 0) list = list.filter(b => selectedEnergies.includes(buildingOperationalStats[b.name]?.sustainability?.weiiRating ?? ''));
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'city': return a.city.localeCompare(b.city);
        case 'group': return a.group.localeCompare(b.group);
        case 'performance_desc': return (b.performance?.green ?? 0) - (a.performance?.green ?? 0);
        case 'performance_asc': return (a.performance?.green ?? 0) - (b.performance?.green ?? 0);
      }
      return 0;
    });
    return sorted;
  }, [search, contractFilter, selectedCities, selectedGroups, selectedEnergies, tenantBuildings, sortBy]);

  // Grouped output
  const grouped = useMemo(() => {
    if (groupBy === 'none') return [{ key: '__all__', label: '', items: filtered }];
    const map = new Map<string, typeof filtered>();
    for (const b of filtered) {
      const key = groupBy === 'city' ? b.city : b.group;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, items]) => ({ key, label: key, items }));
  }, [filtered, groupBy]);

  const contractLabel = contractFilter === 'all' ? 'Contract' : contractFilter === 'has_contract' ? 'Has contract' : 'No contract';
  const cityChipValue = selectedCities.length === 0 ? null : selectedCities.length === 1 ? selectedCities[0] : `${selectedCities.length} cities`;
  const energyChipValue = selectedEnergies.length === 0 ? null : selectedEnergies.length === 1 ? selectedEnergies[0] : `${selectedEnergies.length} labels`;
  const groupChipValue = selectedGroups.length === 0 ? null : selectedGroups.length === 1 ? selectedGroups[0] : `${selectedGroups.length} clusters`;

  // Building click handler
  const onBuildingClick = (b: typeof buildings[0], e?: React.MouseEvent) => handleSidePeekClick(e,
    () => { setSidePeekZone(null); setSidePeekBuilding(b); setSidePeekBuildingTab('overview'); },
    () => router.push(`/buildings/${b.id}`),
  );

  return (
    <Container maxWidth={false} sx={{
      pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3,
      ...(viewMode === 'map' ? { display: 'flex', flexDirection: 'column', pb: 0, overflow: 'hidden' } : {}),
    }}>
      <Box sx={viewMode === 'map' ? { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' } : {}}>
        <PageHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '2rem', lineHeight: 1.3 }}>
                Buildings <Typography component="span" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: '1.25rem' }}>{filtered.length}</Typography>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FilterChip
                  label="Group by"
                  value={GROUP_BY_OPTIONS.find(o => o.value === groupBy)?.label}
                  onClick={(e) => setGroupByMenuAnchor(e.currentTarget)}
                  neutral
                />
                <FilterDropdown
                  anchorEl={groupByMenuAnchor}
                  onClose={() => setGroupByMenuAnchor(null)}
                  options={GROUP_BY_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                  value={groupBy}
                  onChange={(val) => { if (val) set('groupBy', val); }}
                  hideSearch
                />
                {/* Sort */}
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
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 30,
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: c.borderPrimary,
                    bgcolor: c.bgPrimary,
                    px: 1,
                    gap: 0.5,
                    '&:focus-within': { borderColor: c.brandSecondary },
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <SearchIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
                  <InputBase
                    inputRef={searchRef}
                    value={search}
                    onChange={(e) => set('search', e.target.value)}
                    placeholder="Search buildings…"
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
                <Box
                  sx={{
                    display: 'flex',
                    border: '1px solid',
                    borderColor: c.borderPrimary,
                    borderRadius: '6px',
                    overflow: 'hidden',
                    height: 30,
                  }}
                >
                  <Tooltip title="Grid view">
                    <IconButton
                      size="small"
                      onClick={() => setViewMode('grid')}
                      sx={{
                        borderRadius: 0,
                        width: 30, height: 30,
                        bgcolor: viewMode === 'grid' ? c.bgActive : 'transparent',
                        color: viewMode === 'grid' ? c.brandSecondary : 'text.secondary',
                        '&:hover': { bgcolor: viewMode === 'grid' ? c.bgActive : c.bgPrimaryHover },
                      }}
                    >
                      <GridViewOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Box sx={{ width: '1px', bgcolor: 'divider' }} />
                  <Tooltip title="Map view">
                    <IconButton
                      size="small"
                      onClick={() => setViewMode('map')}
                      sx={{
                        borderRadius: 0,
                        width: 30, height: 30,
                        bgcolor: viewMode === 'map' ? c.bgActive : 'transparent',
                        color: viewMode === 'map' ? c.brandSecondary : 'text.secondary',
                        '&:hover': { bgcolor: viewMode === 'map' ? c.bgActive : c.bgPrimaryHover },
                      }}
                    >
                      <MapOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          }
        >
          <FilterChip
            label="Contract"
            value={contractFilter !== 'all' ? contractLabel : null}
            onClick={(e) => setContractAnchor(e.currentTarget)}
          />
          <FilterDropdown
            anchorEl={contractAnchor}
            onClose={() => setContractAnchor(null)}
            options={[
              { value: 'has_contract', label: 'Has contract', icon: <VerifiedOutlinedIcon fontSize="small" sx={{ color: c.statusGood }} /> },
              { value: 'no_contract', label: 'No contract', icon: <CancelOutlinedIcon fontSize="small" sx={{ color: 'text.disabled' }} /> },
            ] as FilterOption[]}
            value={contractFilter === 'all' ? null : contractFilter}
            onChange={(val) => set('contract', val ?? 'all')}
            placeholder="Search…"
          />
          <FilterChip label="City" value={cityChipValue} onClick={(e) => setCityAnchor(e.currentTarget)} />
          <FilterDropdown anchorEl={cityAnchor} onClose={() => setCityAnchor(null)} options={cities.map(city => ({ value: city }))} multiple value={selectedCities} onChange={(v) => setList('cities', v as string[])} placeholder="Search cities…" />
          <FilterChip label="Cluster" value={groupChipValue} onClick={(e) => setGroupAnchor(e.currentTarget)} onClear={selectedGroups.length > 0 ? () => setList('groups', []) : undefined} />
          <FilterDropdown anchorEl={groupAnchor} onClose={() => setGroupAnchor(null)} options={groups.map(g => ({ value: g }))} multiple value={selectedGroups} onChange={(v) => setList('groups', v as string[])} placeholder="Search clusters…" />
          <FilterChip label="Energy label" value={energyChipValue} onClick={(e) => setEnergyAnchor(e.currentTarget)} onClear={selectedEnergies.length > 0 ? () => setList('energies', []) : undefined} />
          <FilterDropdown anchorEl={energyAnchor} onClose={() => setEnergyAnchor(null)} options={energyLabels.map(label => ({ value: label, icon: <EnergyLabel rating={label} /> }))} multiple value={selectedEnergies} onChange={(v) => setList('energies', v as string[])} placeholder="Search energy labels…" />
        </PageHeader>

        {/* ── Content ── */}
        {viewMode === 'map' ? (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <PortfolioMap buildings={filtered} onBuildingClick={onBuildingClick} />
          </Box>
        ) : (
        <Box sx={{ pt: 3 }}>
          {filtered.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">No buildings match your filters.</Typography>
            </Box>
          ) : (
            <AnimatePresence mode="wait">
              {grouped.map(({ key, label, items }) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {groupBy !== 'none' && (
                    <SectionHeader label={label} count={items.length} />
                  )}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                      gap: 2,
                      mb: groupBy !== 'none' ? 4 : 0,
                    }}
                  >
                    {items.map((building) => (
                      <motion.div
                        key={building.name}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <BuildingTile building={building} query={search} onClick={(e) => onBuildingClick(building, e)} />
                      </motion.div>
                    ))}
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </Box>
        )}
      </Box>
    </Container>
  );
}
