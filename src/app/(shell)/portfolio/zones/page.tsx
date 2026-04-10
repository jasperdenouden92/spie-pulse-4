'use client';

import React, { useState, useMemo } from 'react';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputBase from '@mui/material/InputBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { useRouter } from 'next/navigation';
import { useFilterParams } from '@/hooks/useFilterParams';
import { useURLState } from '@/hooks/useURLState';
import { useAppState } from '@/context/AppStateContext';
import { useThemeMode } from '@/theme-mode-context';
import { handleSidePeekClick } from '@/components/SidePeekPanel';
import FilterDropdown from '@/components/FilterDropdown';
import PageHeader from '@/components/PageHeader';
import FilterChip from '@/components/FilterChip';
import Button from '@/components/Button';
import ZonesList from '@/components/ZonesList';
import { zones as allZones, getZoneColor } from '@/data/zones';
import { buildings as allBuildings } from '@/data/buildings';
import { buildingToSlug } from '@/utils/slugs';

import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';

export default function PortfolioZonesRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  const router = useRouter();
  const { themeColors: c } = useThemeMode();
  const { selectedTenant } = useURLState();
  const { setSidePeekBuilding, setSidePeekBuildingTab, setSidePeekZone, setSidePeekZoneTab } = useAppState();

  const tenantZones = useMemo(
    () => allZones.filter(z => z.buildingTenant === selectedTenant),
    [selectedTenant]
  );

  const { get, set, getList, setList } = useFilterParams();

  const groupBy = get('groupBy', 'none');
  const [groupByMenuAnchor, setGroupByMenuAnchor] = useState<null | HTMLElement>(null);

  // Search
  const search = get('search', '');

  // Filters
  const selectedBuildings = getList('buildings');
  const [buildingAnchor, setBuildingAnchor] = useState<null | HTMLElement>(null);
  const selectedCities = getList('cities');
  const [cityAnchor, setCityAnchor] = useState<null | HTMLElement>(null);

  // Zone type filter
  const selectedZoneTypes = getList('zoneTypes');
  const [zoneTypeAnchor, setZoneTypeAnchor] = useState<null | HTMLElement>(null);

  // Derived option lists
  const buildings = useMemo(() => Array.from(new Set(tenantZones.map(z => z.buildingName))).sort(), [tenantZones]);
  const cities = useMemo(() => Array.from(new Set(tenantZones.map(z => z.buildingCity).filter(Boolean))).sort(), [tenantZones]);
  const zoneTypes = useMemo(() => Array.from(new Set(tenantZones.map(z => z.name))).sort(), [tenantZones]);

  // Filtered zones
  const filtered = useMemo(() => {
    let list = tenantZones;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(z =>
        z.name.toLowerCase().includes(q) ||
        z.buildingName.toLowerCase().includes(q) ||
        z.buildingCity.toLowerCase().includes(q) ||
        z.floor.toLowerCase().includes(q)
      );
    }
    if (selectedBuildings.length > 0) list = list.filter(z => selectedBuildings.includes(z.buildingName));
    if (selectedCities.length > 0) list = list.filter(z => selectedCities.includes(z.buildingCity));
    if (selectedZoneTypes.length > 0) list = list.filter(z => selectedZoneTypes.includes(z.name));
    return list;
  }, [search, selectedBuildings, selectedCities, selectedZoneTypes, tenantZones]);

  const buildingChipValue = selectedBuildings.length === 0 ? null : selectedBuildings.length === 1 ? selectedBuildings[0] : `${selectedBuildings.length} buildings`;
  const cityChipValue = selectedCities.length === 0 ? null : selectedCities.length === 1 ? selectedCities[0] : `${selectedCities.length} cities`;
  const zoneTypeChipValue = selectedZoneTypes.length === 0 ? null : selectedZoneTypes.length === 1 ? selectedZoneTypes[0] : `${selectedZoneTypes.length} types`;

  const groupByMenu = (
    <Menu
      anchorEl={groupByMenuAnchor}
      open={Boolean(groupByMenuAnchor)}
      onClose={() => setGroupByMenuAnchor(null)}
      slotProps={{ paper: { sx: { borderRadius: '8px', mt: 0.5, minWidth: 160 } } }}
    >
      <MenuItem selected={groupBy === 'none'} onClick={() => { set('groupBy', 'none'); setGroupByMenuAnchor(null); }}>
        <ListItemText>No grouping</ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem selected={groupBy === 'building'} onClick={() => { set('groupBy', 'building'); setGroupByMenuAnchor(null); }}>
        <ListItemIcon><ApartmentOutlinedIcon fontSize="small" /></ListItemIcon>
        <ListItemText>Building</ListItemText>
      </MenuItem>
      <MenuItem selected={groupBy === 'city'} onClick={() => { set('groupBy', 'city'); setGroupByMenuAnchor(null); }}>
        <ListItemIcon><LocationOnOutlinedIcon fontSize="small" /></ListItemIcon>
        <ListItemText>City</ListItemText>
      </MenuItem>
      <MenuItem selected={groupBy === 'zone_type'} onClick={() => { set('groupBy', 'zone_type'); setGroupByMenuAnchor(null); }}>
        <ListItemIcon><LayersOutlinedIcon fontSize="small" /></ListItemIcon>
        <ListItemText>Zone type</ListItemText>
      </MenuItem>
    </Menu>
  );

  const searchBox = (
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
        value={search}
        onChange={(e) => set('search', e.target.value)}
        placeholder="Search zones\u2026"
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

  const zoneTypeFilterDropdown = (
    <FilterDropdown
      anchorEl={zoneTypeAnchor}
      onClose={() => setZoneTypeAnchor(null)}
      options={zoneTypes.map(t => ({
        value: t,
        icon: <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: getZoneColor(t), flexShrink: 0 }} />,
      }))}
      multiple
      value={selectedZoneTypes}
      onChange={(v) => setList('zoneTypes', v as string[])}
      placeholder="Search zone types\u2026"
    />
  );

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <PageHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '2rem', lineHeight: 1.3 }}>
              Zones <Typography component="span" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: '1.25rem' }}>{filtered.length}</Typography>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                variant="secondary"
                size="sm"
                endIcon={<ExpandMoreIcon />}
                onClick={(e) => setGroupByMenuAnchor(e.currentTarget)}
              >
                Group by
              </Button>
              {groupByMenu}
              {searchBox}
            </Box>
          </Box>
        }
      >
        <FilterChip
          label="Building"
          value={buildingChipValue}
          onClick={(e) => setBuildingAnchor(e.currentTarget)}
          onClear={selectedBuildings.length > 0 ? () => setList('buildings', []) : undefined}
        />
        <FilterDropdown
          anchorEl={buildingAnchor}
          onClose={() => setBuildingAnchor(null)}
          options={buildings.map(b => ({ value: b }))}
          multiple
          value={selectedBuildings}
          onChange={(v) => setList('buildings', v as string[])}
          placeholder="Search buildings\u2026"
        />
        <FilterChip
          label="City"
          value={cityChipValue}
          onClick={(e) => setCityAnchor(e.currentTarget)}
          onClear={selectedCities.length > 0 ? () => setList('cities', []) : undefined}
        />
        <FilterDropdown
          anchorEl={cityAnchor}
          onClose={() => setCityAnchor(null)}
          options={cities.map(city => ({ value: city }))}
          multiple
          value={selectedCities}
          onChange={(v) => setList('cities', v as string[])}
          placeholder="Search cities\u2026"
        />
        <FilterChip
          label="Zone type"
          value={zoneTypeChipValue}
          onClick={(e) => setZoneTypeAnchor(e.currentTarget)}
          onClear={selectedZoneTypes.length > 0 ? () => setList('zoneTypes', []) : undefined}
        />
        {zoneTypeFilterDropdown}
      </PageHeader>

      {/* Content */}
      <Box sx={{ pt: 3 }}>
        <ZonesList
          zones={filtered}
          search={search}
          groupBy={groupBy}
          onZoneClick={(id, e) => handleSidePeekClick(e,
            () => { const z = allZones.find(z => z.id === id); if (z) { setSidePeekBuilding(null); setSidePeekZone(z); setSidePeekZoneTab('overview'); } },
            () => router.push(`/zones/${id}`),
          )}
          onBuildingLabelClick={(name, e) => handleSidePeekClick(e,
            () => { const b = allBuildings.find(b => b.name === name); if (b) { setSidePeekZone(null); setSidePeekBuilding(b); setSidePeekBuildingTab('overview'); } },
            () => router.push(`/buildings/${buildingToSlug(name)}`),
          )}
        />
      </Box>
    </Container>
  );
}
