'use client';

import React, { useState, useMemo } from 'react';
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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import FilterDropdown from '@/components/FilterDropdown';
import PageHeader from '@/components/PageHeader';
import { zones as allZones, getZoneColor, type Zone } from '@/data/zones';
import { useThemeMode } from '@/theme-mode-context';
import FilterChip from '@/components/FilterChip';
import Button from '@/components/Button';

import SearchIcon from '@mui/icons-material/Search';

import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';


// ── Types ──

type GroupBy = 'none' | 'building' | 'city' | 'zone_type' | 'floor';

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

// ── Section header for grouped view ──

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

// ── List view ──

function ZonesTable({ zones, query, hideBuilding, hideCity, hideFloor, onZoneClick }: { zones: Zone[]; query: string; hideBuilding?: boolean; hideCity?: boolean; hideFloor?: boolean; onZoneClick?: (zoneId: string, e?: React.MouseEvent) => void }) {
  const { themeColors: c } = useThemeMode();

  const colWidths =
    hideBuilding && hideCity && hideFloor ? ['60%', '40%'] :
    hideBuilding && hideCity ? ['45%', '30%', '25%'] :
    hideBuilding && hideFloor ? ['45%', '30%', '25%'] :
    hideCity && hideFloor ? ['45%', '30%', '25%'] :
    hideBuilding ? ['30%', '20%', '25%', '25%'] :
    hideCity ? ['30%', '25%', '20%', '25%'] :
    hideFloor ? ['30%', '25%', '20%', '25%'] :
    ['25%', '20%', '15%', '20%', '20%'];

  const headers = [
    'Zone',
    ...(!hideBuilding ? ['Building'] : []),
    ...(!hideFloor ? ['Floor'] : []),
    ...(!hideCity ? ['City'] : []),
    'Assets',
  ];

  const colgroup = (
    <colgroup>
      {colWidths.map((w, i) => (
        <col key={i} style={{ width: w }} />
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
            {headers.map((h, i) => (
              <TableCell
                key={h}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  py: 1,
                  ...(i === 0 ? { pl: 2 } : {}),
                  ...(i === headers.length - 1 ? { textAlign: 'right', pr: 2 } : {}),
                }}
              >
                {h}
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
              {zones.map((zone: Zone) => (
                <TableRow
                  key={zone.id}
                  onClick={(e) => onZoneClick?.(zone.id, e)}
                  sx={{
                    '&:hover': { bgcolor: c.bgPrimaryHover },
                    cursor: onZoneClick ? 'pointer' : 'default',
                  }}
                >
                  <TableCell sx={{ py: 1, pl: 2 }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                      {query ? <HighlightText text={zone.name} query={query} /> : zone.name}
                    </Typography>
                  </TableCell>
                  {!hideBuilding && (
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                        {query ? <HighlightText text={zone.buildingName} query={query} /> : zone.buildingName}
                      </Typography>
                    </TableCell>
                  )}
                  {!hideFloor && (
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                        {zone.floor}
                      </Typography>
                    </TableCell>
                  )}
                  {!hideCity && (
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                        {zone.buildingCity || '—'}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell sx={{ py: 1, pr: 2, textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: c.brandSecondary }}>
                      {zone.assetCount}
                    </Typography>
                  </TableCell>
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

export default function PortfolioZonesPage({ tenant, buildingName, onZoneClick, onBuildingLabelClick }: { tenant: string; buildingName?: string; onZoneClick?: (zoneId: string, e?: React.MouseEvent) => void; onBuildingLabelClick?: (buildingName: string, e?: React.MouseEvent) => void }) {
  const { themeColors: c } = useThemeMode();
  const tenantZones = useMemo(
    () => allZones.filter(z => z.buildingTenant === tenant && (!buildingName || z.buildingName === buildingName)),
    [tenant, buildingName]
  );

  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [groupByMenuAnchor, setGroupByMenuAnchor] = useState<null | HTMLElement>(null);

  // Search
  const [search, setSearch] = useState('');

  // Filters
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [buildingAnchor, setBuildingAnchor] = useState<null | HTMLElement>(null);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [cityAnchor, setCityAnchor] = useState<null | HTMLElement>(null);

  // Zone type filter
  const [selectedZoneTypes, setSelectedZoneTypes] = useState<string[]>([]);
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

  // Grouped output
  const grouped = useMemo(() => {
    if (groupBy === 'none') return [{ key: '__all__', label: '', items: filtered }];
    const map = new Map<string, typeof filtered>();
    for (const z of filtered) {
      const key =
        groupBy === 'building' ? z.buildingName :
        groupBy === 'city' ? (z.buildingCity || 'Unknown') :
        groupBy === 'floor' ? z.floor :
        z.name;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(z);
    }
    const entries = Array.from(map.entries()).map(([key, items]) => ({ key, label: key, items }));
    if (groupBy === 'floor') {
      return entries.sort((a, b) => a.items[0].floorNumber - b.items[0].floorNumber);
    }
    return entries.sort((a, b) => a.key.localeCompare(b.key));
  }, [filtered, groupBy]);

  const buildingChipValue = selectedBuildings.length === 0 ? null : selectedBuildings.length === 1 ? selectedBuildings[0] : `${selectedBuildings.length} buildings`;
  const cityChipValue = selectedCities.length === 0 ? null : selectedCities.length === 1 ? selectedCities[0] : `${selectedCities.length} cities`;
  const zoneTypeChipValue = selectedZoneTypes.length === 0 ? null : selectedZoneTypes.length === 1 ? selectedZoneTypes[0] : `${selectedZoneTypes.length} types`;


  const groupByMenu = (zoneTypeOnly: boolean) => (
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
      {!zoneTypeOnly && (
        <MenuItem selected={groupBy === 'building'} onClick={() => { setGroupBy('building'); setGroupByMenuAnchor(null); }}>
          <ListItemIcon><ApartmentOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Building</ListItemText>
        </MenuItem>
      )}
      {!zoneTypeOnly && (
        <MenuItem selected={groupBy === 'city'} onClick={() => { setGroupBy('city'); setGroupByMenuAnchor(null); }}>
          <ListItemIcon><LocationOnOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>City</ListItemText>
        </MenuItem>
      )}
      <MenuItem selected={groupBy === 'zone_type'} onClick={() => { setGroupBy('zone_type'); setGroupByMenuAnchor(null); }}>
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
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search zones…"
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
      onChange={setSelectedZoneTypes}
      placeholder="Search zone types…"
    />
  );

  return (
    <Box>
      {buildingName ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <FilterChip
            label="Zone type"
            value={zoneTypeChipValue}
            onClick={(e) => setZoneTypeAnchor(e.currentTarget)}
            onClear={selectedZoneTypes.length > 0 ? () => setSelectedZoneTypes([]) : undefined}
          />
          {zoneTypeFilterDropdown}
          <Box sx={{ flex: 1 }} />
          <Button
            variant="secondary"
            size="sm"
            endIcon={<ExpandMoreIcon />}
            onClick={(e) => setGroupByMenuAnchor(e.currentTarget)}
          >
            Group by
          </Button>
          {groupByMenu(true)}
          {searchBox}
        </Box>
      ) : (
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
                {groupByMenu(false)}
                {searchBox}
              </Box>
            </Box>
          }
        >
          <FilterChip
            label="Building"
            value={buildingChipValue}
            onClick={(e) => setBuildingAnchor(e.currentTarget)}
            onClear={selectedBuildings.length > 0 ? () => setSelectedBuildings([]) : undefined}
          />
          <FilterDropdown
            anchorEl={buildingAnchor}
            onClose={() => setBuildingAnchor(null)}
            options={buildings.map(b => ({ value: b }))}
            multiple
            value={selectedBuildings}
            onChange={setSelectedBuildings}
            placeholder="Search buildings…"
          />
          <FilterChip
            label="City"
            value={cityChipValue}
            onClick={(e) => setCityAnchor(e.currentTarget)}
            onClear={selectedCities.length > 0 ? () => setSelectedCities([]) : undefined}
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
          <FilterChip
            label="Zone type"
            value={zoneTypeChipValue}
            onClick={(e) => setZoneTypeAnchor(e.currentTarget)}
            onClear={selectedZoneTypes.length > 0 ? () => setSelectedZoneTypes([]) : undefined}
          />
          {zoneTypeFilterDropdown}
        </PageHeader>
      )}

      {/* ── Content ── */}
      <Box sx={{ pt: 3 }}>
        {filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">No zones match your filters.</Typography>
          </Box>
        ) : groupBy !== 'none' ? (
          grouped.map(({ key, label, items }) => (
            <Box key={key} sx={{ mb: 4 }}>
              <SectionHeader
                label={label}
                count={items.length}
                onClick={groupBy === 'building' && onBuildingLabelClick ? (e) => onBuildingLabelClick(key, e) : undefined}
              />
              <ZonesTable zones={items} query={search} hideBuilding={!!buildingName || groupBy === 'building'} hideCity={!!buildingName || groupBy === 'city'} hideFloor={groupBy === 'floor'} onZoneClick={onZoneClick} />
            </Box>
          ))
        ) : (
          <ZonesTable zones={filtered} query={search} hideBuilding={!!buildingName} hideCity={!!buildingName} onZoneClick={onZoneClick} />
        )}
      </Box>
    </Box>
  );
}
