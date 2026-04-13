'use client';

import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
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
import { type Zone } from '@/data/zones';
import { useThemeMode } from '@/theme-mode-context';

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

// ── Table sub-component ──

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
                        {zone.buildingCity || '\u2014'}
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

// ── Main exported component ──

export default function ZonesList({ zones, onZoneClick, onBuildingLabelClick, groupBy: groupByProp = 'none', search: searchProp = '', hideBuildingColumn, showFilters }: {
  zones: Zone[];
  onZoneClick?: (id: string, e?: React.MouseEvent) => void;
  onBuildingLabelClick?: (name: string, e?: React.MouseEvent) => void;
  groupBy?: string;
  search?: string;
  hideBuildingColumn?: boolean;
  showFilters?: boolean;
}) {
  const { themeColors: c } = useThemeMode();

  // Internal filter state (used when showFilters is true)
  const [internalSearch, setInternalSearch] = useState('');
  const [internalGroupBy, setInternalGroupBy] = useState<GroupBy>('none');
  const [groupByMenuAnchor, setGroupByMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedZoneTypes, setSelectedZoneTypes] = useState<string[]>([]);
  const [zoneTypeAnchor, setZoneTypeAnchor] = useState<null | HTMLElement>(null);

  const search = showFilters ? internalSearch : searchProp;
  const groupBy = showFilters ? internalGroupBy : groupByProp;
  const castGroupBy = groupBy as GroupBy;

  // Derived option lists
  const zoneTypes = useMemo(() => showFilters ? Array.from(new Set(zones.map(z => z.name))).sort() : [], [zones, showFilters]);

  // Filter zones when showFilters is enabled
  const filteredZones = useMemo(() => {
    if (!showFilters) return zones;
    let list = zones;
    if (internalSearch.trim()) {
      const q = internalSearch.trim().toLowerCase();
      list = list.filter(z =>
        z.name.toLowerCase().includes(q) ||
        z.buildingName.toLowerCase().includes(q) ||
        z.floor.toLowerCase().includes(q)
      );
    }
    if (selectedZoneTypes.length > 0) list = list.filter(z => selectedZoneTypes.includes(z.name));
    return list;
  }, [zones, showFilters, internalSearch, selectedZoneTypes]);

  // Grouped output
  const grouped = useMemo(() => {
    if (castGroupBy === 'none') return [{ key: '__all__', label: '', items: filteredZones }];
    const map = new Map<string, Zone[]>();
    for (const z of filteredZones) {
      const key =
        castGroupBy === 'building' ? z.buildingName :
        castGroupBy === 'city' ? (z.buildingCity || 'Unknown') :
        castGroupBy === 'floor' ? z.floor :
        z.name;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(z);
    }
    const entries = Array.from(map.entries()).map(([key, items]) => ({ key, label: key, items }));
    if (castGroupBy === 'floor') {
      return entries.sort((a, b) => a.items[0].floorNumber - b.items[0].floorNumber);
    }
    return entries.sort((a, b) => a.key.localeCompare(b.key));
  }, [filteredZones, castGroupBy]);

  const zoneTypeChipValue = selectedZoneTypes.length === 0 ? null : selectedZoneTypes.length === 1 ? selectedZoneTypes[0] : `${selectedZoneTypes.length} types`;

  const filterBar = showFilters ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 1 }}>
      {/* Left: Zone type filter */}
      <FilterChip
        label="Zone type"
        value={zoneTypeChipValue}
        onClick={(e) => setZoneTypeAnchor(e.currentTarget)}
        onClear={selectedZoneTypes.length > 0 ? () => setSelectedZoneTypes([]) : undefined}
      />
      <FilterDropdown
        anchorEl={zoneTypeAnchor}
        onClose={() => setZoneTypeAnchor(null)}
        options={zoneTypes.map(t => ({ value: t }))}
        multiple
        value={selectedZoneTypes}
        onChange={(v) => setSelectedZoneTypes(v as string[])}
        placeholder="Search zone types…"
      />

      {/* Right: Group by + Search */}
      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button variant="secondary" size="sm" endIcon={<ExpandMoreIcon />} onClick={(e) => setGroupByMenuAnchor(e.currentTarget)}>
          Group by
        </Button>
        <Menu anchorEl={groupByMenuAnchor} open={Boolean(groupByMenuAnchor)} onClose={() => setGroupByMenuAnchor(null)} slotProps={{ paper: { sx: { borderRadius: '8px', mt: 0.5, minWidth: 140 } } }}>
          <MenuItem selected={internalGroupBy === 'none'} onClick={() => { setInternalGroupBy('none'); setGroupByMenuAnchor(null); }}><ListItemText>No grouping</ListItemText></MenuItem>
          <Divider />
          <MenuItem selected={internalGroupBy === 'floor'} onClick={() => { setInternalGroupBy('floor'); setGroupByMenuAnchor(null); }}><ListItemText>Floor</ListItemText></MenuItem>
          <MenuItem selected={internalGroupBy === 'zone_type'} onClick={() => { setInternalGroupBy('zone_type'); setGroupByMenuAnchor(null); }}><ListItemText>Zone type</ListItemText></MenuItem>
        </Menu>
        <Box sx={{ display: 'flex', alignItems: 'center', height: 30, borderRadius: '6px', border: '1px solid', borderColor: c.borderPrimary, bgcolor: c.bgPrimary, px: 1, gap: 0.5, '&:focus-within': { borderColor: c.brandSecondary }, transition: 'border-color 0.15s ease' }}>
          <SearchIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
          <InputBase
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            placeholder="Search zones…"
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

  if (filteredZones.length === 0) {
    return (
      <>
        {filterBar}
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">No zones match your filters.</Typography>
        </Box>
      </>
    );
  }

  if (castGroupBy !== 'none') {
    return (
      <>
        {filterBar}
        {grouped.map(({ key, label, items }) => (
          <Box key={key} sx={{ mb: 4 }}>
            <SectionHeader
              label={label}
              count={items.length}
              onClick={castGroupBy === 'building' && onBuildingLabelClick ? (e) => onBuildingLabelClick(key, e) : undefined}
            />
            <ZonesTable zones={items} query={search} hideBuilding={!!hideBuildingColumn || castGroupBy === 'building'} hideCity={!!hideBuildingColumn || castGroupBy === 'city'} hideFloor={castGroupBy === 'floor'} onZoneClick={onZoneClick} />
          </Box>
        ))}
      </>
    );
  }

  return (
    <>
      {filterBar}
      <ZonesTable zones={filteredZones} query={search} hideBuilding={!!hideBuildingColumn} hideCity={!!hideBuildingColumn} onZoneClick={onZoneClick} />
    </>
  );
}
