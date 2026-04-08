import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { buildings as allBuildingsData } from '@/data/buildings';
import { secondaryAlpha, type ColorTokens } from '@/colors';
import { useThemeMode } from '@/theme-mode-context';

export type BuildingFilterMode = 'buildings' | 'clusters';
export type ContractFilter = boolean;

export const getKbdSx = (c: ColorTokens) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 20,
  height: 20,
  px: 0.5,
  fontSize: '0.625rem',
  fontFamily: 'inherit',
  fontWeight: 600,
  color: 'text.secondary',
  bgcolor: c.bgPrimary,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '4px',
  lineHeight: 1,
});

const segmentedControlSx = (active: boolean, c: ColorTokens) => ({
  px: 1.5, py: 0.5, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px',
  cursor: 'pointer', transition: 'all 0.15s',
  bgcolor: active ? c.bgPrimary : 'transparent',
  color: active ? c.brand : 'text.secondary',
  boxShadow: active ? `0 1px 3px ${c.shadow}` : 'none',
  '&:hover': { color: active ? c.brand : 'text.primary' },
});

/** Segmented control to switch between buildings and clusters mode */
export function BuildingFilterModeToggle({ mode, onModeChange }: { mode: BuildingFilterMode; onModeChange: (mode: BuildingFilterMode) => void }) {
  const { themeColors: c } = useThemeMode();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: c.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', flexShrink: 0, border: `1px solid ${c.borderTertiary}` }}>
      <Box sx={segmentedControlSx(mode === 'buildings', c)} onClick={() => onModeChange('buildings')}>
        Buildings
      </Box>
      <Box sx={segmentedControlSx(mode === 'clusters', c)} onClick={() => onModeChange('clusters')}>
        Clusters
      </Box>
    </Box>
  );
}

/** Toggle to filter by contract status */
export function ContractFilterToggle({ value, onChange }: { value: ContractFilter; onChange: (value: ContractFilter) => void }) {
  const { themeColors: c } = useThemeMode();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: c.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', flexShrink: 0, border: `1px solid ${c.borderTertiary}` }}>
      <Box sx={segmentedControlSx(!value, c)} onClick={() => onChange(false)}>
        Overall
      </Box>
      <Box sx={segmentedControlSx(value, c)} onClick={() => onChange(true)}>
        Contract
      </Box>
    </Box>
  );
}

interface BuildingSelectorPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  selectedNames: string[];
  onSelectionChange: (names: string[]) => void;
  mode: BuildingFilterMode;
  onModeChange?: (mode: BuildingFilterMode) => void;
}

function SelectorListItem({ label, subtitle, selected, highlighted, onClick, innerRef }: {
  label: string; subtitle: string; selected: boolean; highlighted: boolean;
  onClick: () => void; innerRef?: (el: HTMLElement | null) => void;
}) {
  const { themeColors: c } = useThemeMode();
  return (
    <Box
      ref={innerRef}
      sx={{
        display: 'flex', alignItems: 'center', mx: 1, px: 1.5, py: 1,
        cursor: 'pointer', borderRadius: '6px',
        bgcolor: selected ? c.bgActive : highlighted ? c.bgPrimaryHover : undefined,
        '&:hover': { bgcolor: selected ? c.bgActive : c.bgPrimaryHover },
      }}
      onClick={onClick}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" noWrap sx={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2, m: 0, mb: '4px' }}>{label}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', lineHeight: 1, display: 'block', m: 0 }}>{subtitle}</Typography>
      </Box>
      {selected && <CheckIcon sx={{ fontSize: 18, color: c.brand, ml: 1, flexShrink: 0 }} />}
    </Box>
  );
}

const allGroups = [...new Set(allBuildingsData.map(b => b.group))].sort();
const allCities = [...new Set(allBuildingsData.map(b => b.city))].sort();

/**
 * Selection model:
 * - [] = no filter active (default)
 * - In buildings mode: ['building1', 'building2'] = filter to these buildings
 * - In clusters mode: ['cluster1', 'cluster2'] = filter to these clusters
 */
export function BuildingSelectorPopover({ anchorEl, onClose, selectedNames, onSelectionChange, mode, onModeChange }: BuildingSelectorPopoverProps) {
  const { themeColors: c } = useThemeMode();
  const [search, setSearch] = useState('');
  const [filterGroups, setFilterGroups] = useState<string[]>([]);
  const [filterCity, setFilterCity] = useState<string>('all');

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (anchorEl) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [anchorEl]);

  const noFilter = selectedNames.length === 0;
  const filterActive = selectedNames.length > 0;

  // List filtering
  const filteredBuildings = useMemo(() => {
    return allBuildingsData.filter(b => {
      const matchesSearch = !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.city.toLowerCase().includes(search.toLowerCase());
      const matchesGroup = filterGroups.length === 0 || filterGroups.includes(b.group);
      const matchesCity = filterCity === 'all' || b.city === filterCity;
      return matchesSearch && matchesGroup && matchesCity;
    });
  }, [search, filterGroups, filterCity]);

  const filteredClusters = useMemo(() => {
    const matching = allBuildingsData.filter(b => {
      const matchesSearch = !search || b.group.toLowerCase().includes(search.toLowerCase());
      const matchesCity = filterCity === 'all' || b.city === filterCity;
      return matchesSearch && matchesCity;
    });
    const map = new Map<string, typeof allBuildingsData>();
    for (const b of matching) {
      if (!map.has(b.group)) map.set(b.group, []);
      map.get(b.group)!.push(b);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [search, filterCity]);

  const toggleItem = useCallback((name: string) => {
    if (selectedNames.includes(name)) {
      onSelectionChange(selectedNames.filter(n => n !== name));
    } else {
      onSelectionChange([...selectedNames, name]);
    }
  }, [selectedNames, onSelectionChange]);

  const removeChip = (value: string) => {
    onSelectionChange(selectedNames.filter(n => n !== value));
  };

  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    setHighlightIndex(0);
  }, [search, mode]);

  const listLength = mode === 'buildings' ? filteredBuildings.length : filteredClusters.length;

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(i => Math.min(i + 1, listLength - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (mode === 'buildings' && filteredBuildings.length > 0) {
        toggleItem(filteredBuildings[highlightIndex]?.name ?? filteredBuildings[0].name);
        setSearch('');
      } else if (mode === 'clusters' && filteredClusters.length > 0) {
        toggleItem(filteredClusters[highlightIndex]?.[0] ?? filteredClusters[0][0]);
        setSearch('');
      }
    }
  };

  const handleClose = () => {
    setSearch('');
    setFilterGroups([]);
    setFilterCity('all');
    onClose();
  };

  const filterSelectSx = (active: boolean) => ({
    fontSize: '0.813rem', borderRadius: 1,
    ...(active
      ? { color: 'primary.main', bgcolor: secondaryAlpha(0.08), '& .MuiSvgIcon-root': { color: 'primary.main' } }
      : { color: 'text.secondary' }),
    '& .MuiSelect-select': { py: 0.5, px: 1.5 },
  });

  const kbdSx = getKbdSx(c);

  return (
    <Popover
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{
        sx: {
          mt: 0.5, width: 440, borderRadius: '10px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: 520,
        },
      }}
    >
      {/* Mode toggle */}
      {onModeChange && (
        <Box sx={{ px: 1.5, pt: 1.5, pb: 0, flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: c.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', border: `1px solid ${c.borderTertiary}` }}>
            <Box sx={{ ...segmentedControlSx(mode === 'buildings', c), flex: 1, textAlign: 'center' }} onClick={() => onModeChange('buildings')}>
              Buildings
            </Box>
            <Box sx={{ ...segmentedControlSx(mode === 'clusters', c), flex: 1, textAlign: 'center' }} onClick={() => onModeChange('clusters')}>
              Clusters
            </Box>
          </Box>
        </Box>
      )}

      {/* Header: search */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, flexShrink: 0 }}>
        <TextField
          inputRef={searchRef}
          size="small"
          placeholder={mode === 'clusters' ? 'Search clusters...' : 'Search buildings...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '0.85rem',
              '& fieldset': { border: 'none' },
            },
            '& .MuiOutlinedInput-input': { py: '6px', px: 0 },
          }}
        />
      </Box>

      {/* Filter dropdowns */}
      {mode === 'buildings' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, pb: 1, flexShrink: 0 }}>
          <FormControl size="small">
            <Select
              multiple
              value={filterGroups}
              onChange={(e) => {
                const val = e.target.value;
                setFilterGroups(typeof val === 'string' ? val.split(',') : val);
              }}
              displayEmpty
              variant="standard"
              disableUnderline
              renderValue={(selected) => selected.length === 0 ? 'All clusters' : `${selected.length} cluster${selected.length > 1 ? 's' : ''}`}
              sx={filterSelectSx(filterGroups.length > 0)}
            >
              {allGroups.map(g => (
                <MenuItem key={g} value={g}>
                  <Checkbox size="small" checked={filterGroups.includes(g)} sx={{ p: 0, mr: 1 }} />
                  {g}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small">
            <Select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              displayEmpty
              variant="standard"
              disableUnderline
              sx={filterSelectSx(filterCity !== 'all')}
            >
              <MenuItem value="all">All cities</MenuItem>
              {allCities.map(city => (
                <MenuItem key={city} value={city}>{city}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {(filterGroups.length > 0 || filterCity !== 'all') && (
            <Typography
              variant="caption"
              sx={{ color: 'primary.main', cursor: 'pointer', ml: 'auto', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => { setFilterGroups([]); setFilterCity('all'); }}
            >
              Clear
            </Typography>
          )}
        </Box>
      )}
      {mode === 'clusters' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, pb: 1, flexShrink: 0 }}>
          <FormControl size="small">
            <Select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              displayEmpty
              variant="standard"
              disableUnderline
              sx={filterSelectSx(filterCity !== 'all')}
            >
              <MenuItem value="all">All cities</MenuItem>
              {allCities.map(city => (
                <MenuItem key={city} value={city}>{city}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {filterCity !== 'all' && (
            <Typography
              variant="caption"
              sx={{ color: 'primary.main', cursor: 'pointer', ml: 'auto', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => setFilterCity('all')}
            >
              Clear
            </Typography>
          )}
        </Box>
      )}

      {/* Selected chips */}
      {filterActive && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, px: 2, pb: 1, flexShrink: 0, maxHeight: 64, overflowY: 'auto' }}>
          {[...selectedNames].sort().map(name => (
            <Chip
              key={name}
              label={name}
              size="small"
              onDelete={() => removeChip(name)}
              deleteIcon={<CloseIcon sx={{ fontSize: '14px !important' }} />}
              sx={{
                height: 24, fontSize: '0.75rem',
                bgcolor: c.bgActive, color: c.brand,
                '& .MuiChip-deleteIcon': { color: c.brand, fontSize: 14 },
              }}
            />
          ))}
        </Box>
      )}

      {/* List header */}
      <Typography variant="caption" sx={{ px: 2, pt: 1, pb: 0.5, fontWeight: 600, color: 'text.secondary', fontSize: '0.7rem', display: 'block', flexShrink: 0 }}>
        {search
          ? `${mode === 'buildings' ? filteredBuildings.length : filteredClusters.length} results`
          : mode === 'clusters' ? 'Recent clusters' : 'Recent buildings'}
      </Typography>

      {/* List */}
      <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: '2px', pb: 1 }}>
        {mode === 'buildings' ? (
          filteredBuildings.length > 0 ? (
            filteredBuildings.map((b, i) => (
              <SelectorListItem
                key={b.name}
                label={b.name}
                subtitle={`${b.city} · ${b.group}`}
                selected={selectedNames.includes(b.name)}
                highlighted={i === highlightIndex}
                onClick={() => toggleItem(b.name)}
                innerRef={i === highlightIndex ? (el) => el?.scrollIntoView({ block: 'nearest' }) : undefined}
              />
            ))
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No buildings found</Typography>
            </Box>
          )
        ) : (
          filteredClusters.length > 0 ? (
            filteredClusters.map(([group], i) => (
              <SelectorListItem
                key={group}
                label={group}
                subtitle={`${allBuildingsData.filter(b => b.group === group).length} buildings`}
                selected={selectedNames.includes(group)}
                highlighted={i === highlightIndex}
                onClick={() => toggleItem(group)}
                innerRef={i === highlightIndex ? (el) => el?.scrollIntoView({ block: 'nearest' }) : undefined}
              />
            ))
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No clusters found</Typography>
            </Box>
          )
        )}
      </Box>

      {/* Footer: shortcuts */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 2.5,
        px: 2, py: 1.25, borderTop: `1px solid ${c.borderTertiary}`, bgcolor: c.bgSecondary, flexShrink: 0,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ display: 'flex', gap: 0.25 }}>
            <Box component="kbd" sx={kbdSx}>↑</Box>
            <Box component="kbd" sx={kbdSx}>↓</Box>
          </Box>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6875rem' }}>Navigate</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box component="kbd" sx={kbdSx}>↵</Box>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6875rem' }}>Select</Typography>
        </Box>
        {filterActive && (
          <Button size="small" variant="text" onClick={() => onSelectionChange([])} sx={{ fontSize: '0.75rem', textTransform: 'none', color: 'text.secondary', minWidth: 0, ml: 'auto', px: 1 }}>
            Clear
          </Button>
        )}
      </Box>
    </Popover>
  );
}

/** Helper to get the chip/inline label for the current selection */
export function getBuildingSelectorLabel(selectedNames: string[], mode: BuildingFilterMode = 'buildings'): string {
  if (selectedNames.length === 0) return mode === 'clusters' ? 'All Clusters' : 'All Buildings';
  if (selectedNames.length === 1) return selectedNames[0];
  return `${selectedNames.length} ${mode === 'clusters' ? 'clusters' : 'buildings'}`;
}

interface BuildingSelectorProps {
  selectedNames: string[];
  onSelectionChange: (names: string[]) => void;
  mode: BuildingFilterMode;
  onModeChange?: (mode: BuildingFilterMode) => void;
}

/** Self-contained chip + popover variant */
export default function BuildingSelector({ selectedNames, onSelectionChange, mode, onModeChange }: BuildingSelectorProps) {
  const { themeColors: c } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const hasFilter = selectedNames.length > 0;

  const label = hasFilter
    ? (selectedNames.length === 1 ? selectedNames[0] : `${selectedNames.length} ${mode === 'clusters' ? 'clusters' : 'buildings'}`)
    : mode === 'clusters' ? 'All Clusters' : 'All Buildings';

  const chipSx = {
    height: 32, borderRadius: '6px',
    backgroundColor: hasFilter ? c.bgActive : c.bgPrimary,
    border: '1px solid',
    borderColor: hasFilter ? c.brand : c.borderPrimary,
    boxShadow: `0 1px 4px ${c.shadow}`,
    '&:hover': { backgroundColor: hasFilter ? c.bgActiveHover : c.bgPrimaryHover },
    '& .MuiChip-label': { px: 1.5, fontSize: '0.875rem', fontWeight: 500, color: hasFilter ? c.brand : 'inherit' },
    '& .MuiChip-deleteIcon': { color: hasFilter ? c.brand : undefined },
  };

  return (
    <>
      <Chip
        label={label}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        deleteIcon={<ExpandMoreIcon />}
        onDelete={(e) => setAnchorEl(e.currentTarget as any)}
        sx={chipSx}
      />
      <BuildingSelectorPopover
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        selectedNames={selectedNames}
        onSelectionChange={onSelectionChange}
        mode={mode}
        onModeChange={onModeChange}
      />
    </>
  );
}
