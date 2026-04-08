'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputBase from '@mui/material/InputBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import FilterDropdown from '@/components/FilterDropdown';
import type { FilterOption } from '@/components/FilterDropdown';
import { motion, AnimatePresence } from 'framer-motion';
import { buildings } from '@/data/buildings';
import { buildingOperationalStats } from '@/data/buildingOperationalStats';
import { useThemeMode } from '@/theme-mode-context';
import { EnergyLabel } from '@/components/PropertyCard';
import FilterChip from '@/components/FilterChip';
import Button from '@/components/Button';
import PortfolioMap from '@/components/PortfolioMap';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

// ── Types ──

type ViewMode = 'grid' | 'map';
type GroupBy = 'none' | 'city' | 'group';
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

function BuildingTile({ building, query = '', onClick }: { building: typeof buildings[0]; query?: string; onClick?: () => void }) {
  const { themeColors: c } = useThemeMode();
  const stats = buildingOperationalStats[building.name];
  const energyRating = stats?.sustainability?.weiiRating;

  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: '12px',
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
      {/* Image */}
      <Box sx={{ position: 'relative', height: 130, overflow: 'hidden', borderRadius: '12px 12px 0 0', bgcolor: c.bgSecondary }}>
        {building.image ? (
          <Box
            component="img"
            src={building.image}
            alt={building.name}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ApartmentOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
          </Box>
        )}

        {/* Contract dot */}
        <Tooltip title={building.hasContract ? 'Active contract' : 'No contract'} placement="top">
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: building.hasContract ? c.statusGood : c.statusOffline,
              border: `2px solid ${c.bgPrimary}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        </Tooltip>

        {/* Energy label */}
        {energyRating && (
          <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
            <EnergyLabel rating={energyRating} size="small" />
          </Box>
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.3, mb: 0.25 }}>
          <HighlightText text={building.name} query={query} />
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.4 }}>
          <HighlightText text={building.address} query={query} />
        </Typography>
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


// ── Main component ──

export default function PortfolioPage({ tenant, onBuildingClick }: { tenant: string; onBuildingClick?: (building: typeof buildings[0]) => void }) {
  const { themeColors: c } = useThemeMode();
  const tenantBuildings = useMemo(() => buildings.filter(b => b.tenant === tenant), [tenant]);

  // View & grouping
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [groupByMenuAnchor, setGroupByMenuAnchor] = useState<null | HTMLElement>(null);

  // Search
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Filters
  const [contractFilter, setContractFilter] = useState<ContractFilter>('all');
  const [contractAnchor, setContractAnchor] = useState<null | HTMLElement>(null);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [cityAnchor, setCityAnchor] = useState<null | HTMLElement>(null);

  // Additional (opt-in) filters
  const [addFilterMenuAnchor, setAddFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [showGroupFilter, setShowGroupFilter] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groupAnchor, setGroupAnchor] = useState<null | HTMLElement>(null);
  const groupChipRef = useRef<HTMLDivElement>(null);
  const [pendingGroupOpen, setPendingGroupOpen] = useState(false);

  useEffect(() => {
    if (pendingGroupOpen && groupChipRef.current) {
      setGroupAnchor(groupChipRef.current);
      setPendingGroupOpen(false);
    }
  }, [pendingGroupOpen, showGroupFilter]);

  const [showEnergyFilter, setShowEnergyFilter] = useState(false);
  const [selectedEnergies, setSelectedEnergies] = useState<string[]>([]);
  const [energyAnchor, setEnergyAnchor] = useState<null | HTMLElement>(null);
  const energyChipRef = useRef<HTMLDivElement>(null);
  const [pendingEnergyOpen, setPendingEnergyOpen] = useState(false);

  useEffect(() => {
    if (pendingEnergyOpen && energyChipRef.current) {
      setEnergyAnchor(energyChipRef.current);
      setPendingEnergyOpen(false);
    }
  }, [pendingEnergyOpen, showEnergyFilter]);

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
    if (selectedGroup) list = list.filter(b => b.group === selectedGroup);
    if (selectedEnergies.length > 0) list = list.filter(b => selectedEnergies.includes(buildingOperationalStats[b.name]?.sustainability?.weiiRating ?? ''));
    return list;
  }, [search, contractFilter, selectedCities, selectedGroup, selectedEnergies, tenantBuildings]);

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

  const additionalFilterOptions = [
    { key: 'group', label: 'Group', icon: <GroupWorkOutlinedIcon fontSize="small" />, visible: showGroupFilter },
    { key: 'energy', label: 'Energy label', icon: <BoltOutlinedIcon fontSize="small" />, visible: showEnergyFilter },
  ];

  const availableToAdd = additionalFilterOptions.filter(f => !f.visible);

  return (
    <Box>
      {/* ── Toolbar ── */}
      <Box
        sx={{
          position: 'sticky',
          top: 56,
          zIndex: 100,
          bgcolor: c.bgSecondary,
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 1.25,
          mx: -3,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        {/* Left: filter strip */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
          {/* Contract filter — default, not clearable */}
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
            onChange={(val) => setContractFilter((val ?? 'all') as ContractFilter)}
            placeholder="Search…"
          />

          {/* City filter — default, not clearable */}
          <FilterChip
            label="City"
            value={cityChipValue}
            onClick={(e) => setCityAnchor(e.currentTarget)}
          />
          <FilterDropdown
            anchorEl={cityAnchor}
            onClose={() => setCityAnchor(null)}
            options={cities.map(city => ({ value: city }))}
            multiple
            value={selectedCities}
            onChange={setSelectedCities}
            placeholder="Search cities…"
          />

          {/* Group filter (optional) */}
          {showGroupFilter && (
            <Box ref={groupChipRef} sx={{ display: 'inline-flex' }}>
              <FilterChip
                label="Group"
                value={selectedGroup}
                onClick={(e) => setGroupAnchor(e.currentTarget)}
                onClear={() => { setSelectedGroup(null); setShowGroupFilter(false); }}
              />
            </Box>
          )}
          <FilterDropdown
            anchorEl={groupAnchor}
            onClose={() => setGroupAnchor(null)}
            options={groups.map(g => ({ value: g, icon: <GroupWorkOutlinedIcon fontSize="small" /> }))}
            value={selectedGroup}
            onChange={setSelectedGroup}
            onRemove={() => setShowGroupFilter(false)}
            placeholder="Search groups…"
          />

          {/* Energy label filter (optional) */}
          {showEnergyFilter && (
            <Box ref={energyChipRef} sx={{ display: 'inline-flex' }}>
              <FilterChip
                label="Energy label"
                value={energyChipValue}
                onClick={(e) => setEnergyAnchor(e.currentTarget)}
                onClear={() => { setSelectedEnergies([]); setShowEnergyFilter(false); }}
              />
            </Box>
          )}
          <FilterDropdown
            anchorEl={energyAnchor}
            onClose={() => setEnergyAnchor(null)}
            options={energyLabels.map(label => ({ value: label, icon: <EnergyLabel rating={label} /> }))}
            multiple
            value={selectedEnergies}
            onChange={setSelectedEnergies}
            onRemove={() => setShowEnergyFilter(false)}
            placeholder="Search energy labels…"
          />

          {/* Add filter button */}
          {availableToAdd.length > 0 && (
            <>
              <Button
                variant="tertiary"
                size="sm"
                startIcon={<AddIcon />}
                onClick={(e) => setAddFilterMenuAnchor(e.currentTarget)}
              >
                Filter
              </Button>
              <Menu
                anchorEl={addFilterMenuAnchor}
                open={Boolean(addFilterMenuAnchor)}
                onClose={() => setAddFilterMenuAnchor(null)}
                slotProps={{ paper: { sx: { borderRadius: '8px', mt: 0.5, minWidth: 160 } } }}
              >
                {availableToAdd.map(opt => (
                  <MenuItem
                    key={opt.key}
                    onClick={() => {
                      if (opt.key === 'group') { setShowGroupFilter(true); setPendingGroupOpen(true); }
                      if (opt.key === 'energy') { setShowEnergyFilter(true); setPendingEnergyOpen(true); }
                      setAddFilterMenuAnchor(null);
                    }}
                  >
                    <ListItemIcon>{opt.icon}</ListItemIcon>
                    <ListItemText>{opt.label}</ListItemText>
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Box>

        {/* Right: Group by + Search + View toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          {/* Group by */}
          <Button
            variant="secondary"
            size="sm"
            endIcon={<ExpandMoreIcon />}
            onClick={(e) => setGroupByMenuAnchor(e.currentTarget)}
          >
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
            <MenuItem selected={groupBy === 'city'} onClick={() => { setGroupBy('city'); setGroupByMenuAnchor(null); }}>
              <ListItemIcon><LocationOnOutlinedIcon fontSize="small" /></ListItemIcon>
              <ListItemText>City</ListItemText>
            </MenuItem>
            <MenuItem selected={groupBy === 'group'} onClick={() => { setGroupBy('group'); setGroupByMenuAnchor(null); }}>
              <ListItemIcon><GroupWorkOutlinedIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Group</ListItemText>
            </MenuItem>
          </Menu>

          {/* Search */}
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search buildings…"
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

          {/* View mode segmented control */}
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

      {/* ── Content ── */}
      {viewMode === 'map' ? (
        <PortfolioMap buildings={filtered} />
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
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
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
                      <BuildingTile building={building} query={search} onClick={onBuildingClick ? () => onBuildingClick(building) : undefined} />
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
  );
}
