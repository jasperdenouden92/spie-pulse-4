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
import { colors } from '@/colors';

export type BuildingFilterMode = 'buildings' | 'clusters';
export type ContractFilter = 'all' | 'contract' | 'no_contract';

const kbdSx = {
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
  bgcolor: '#fff',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '4px',
  lineHeight: 1,
};

const segmentedControlSx = (active: boolean) => ({
  px: 1.5, py: 0.5, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px',
  cursor: 'pointer', transition: 'all 0.15s',
  bgcolor: active ? 'white' : 'transparent',
  color: active ? colors.brand : 'text.secondary',
  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
  '&:hover': { color: active ? colors.brand : 'text.primary' },
});

/** Segmented control to switch between buildings and clusters mode */
export function BuildingFilterModeToggle({ mode, onModeChange }: { mode: BuildingFilterMode; onModeChange: (mode: BuildingFilterMode) => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: colors.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', flexShrink: 0, border: `1px solid ${colors.borderTertiary}` }}>
      <Box sx={segmentedControlSx(mode === 'buildings')} onClick={() => onModeChange('buildings')}>
        Buildings
      </Box>
      <Box sx={segmentedControlSx(mode === 'clusters')} onClick={() => onModeChange('clusters')}>
        Clusters
      </Box>
    </Box>
  );
}

/** Segmented control to filter by contract status */
export function ContractFilterToggle({ value, onChange }: { value: ContractFilter; onChange: (value: ContractFilter) => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: colors.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', flexShrink: 0, border: `1px solid ${colors.borderTertiary}` }}>
      <Box sx={segmentedControlSx(value === 'all')} onClick={() => onChange('all')}>
        All
      </Box>
      <Box sx={segmentedControlSx(value === 'contract')} onClick={() => onChange('contract')}>
        Contract
      </Box>
      <Box sx={segmentedControlSx(value === 'no_contract')} onClick={() => onChange('no_contract')}>
        No contract
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
}

const allGroups = [...new Set(allBuildingsData.map(b => b.group))].sort();
const allCities = [...new Set(allBuildingsData.map(b => b.city))].sort();

/**
 * Selection model:
 * - [] = no filter active (default)
 * - In buildings mode: ['building1', 'building2'] = filter to these buildings
 * - In clusters mode: ['cluster1', 'cluster2'] = filter to these clusters
 */
export function BuildingSelectorPopover({ anchorEl, onClose, selectedNames, onSelectionChange, mode }: BuildingSelectorPopoverProps) {
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
      ? { color: 'primary.main', bgcolor: 'rgba(25, 118, 210, 0.08)', '& .MuiSvgIcon-root': { color: 'primary.main' } }
      : { color: 'text.secondary' }),
    '& .MuiSelect-select': { py: 0.5, px: 1.5 },
  });

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
      {/* Header: search */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, borderBottom: `1px solid ${colors.borderTertiary}`, flexShrink: 0 }}>
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
              {allCities.map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
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
              {allCities.map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
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
          {[...selectedNames].sort().map(c => (
            <Chip
              key={c}
              label={c}
              size="small"
              onDelete={() => removeChip(c)}
              deleteIcon={<CloseIcon sx={{ fontSize: '14px !important' }} />}
              sx={{
                height: 24, fontSize: '0.75rem',
                bgcolor: colors.bgActive, color: colors.brand,
                '& .MuiChip-deleteIcon': { color: colors.brand, fontSize: 14 },
              }}
            />
          ))}
        </Box>
      )}

      {/* List */}
      <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {mode === 'buildings' ? (
          filteredBuildings.length > 0 ? (
            filteredBuildings.map((b, i) => {
              const selected = selectedNames.includes(b.name);
              const isHighlighted = i === highlightIndex;
              return (
                <Box
                  key={b.name}
                  ref={isHighlighted ? (el: HTMLElement | null) => el?.scrollIntoView({ block: 'nearest' }) : undefined}
                  sx={{
                    display: 'flex', alignItems: 'center', px: 2, py: 0.75,
                    cursor: 'pointer',
                    bgcolor: isHighlighted ? colors.bgPrimaryHover : undefined,
                    '&:hover': { bgcolor: colors.bgPrimaryHover },
                  }}
                  onClick={() => toggleItem(b.name)}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" noWrap fontSize="0.85rem">{b.name}</Typography>
                    <Typography variant="caption" color="text.secondary" fontSize="0.7rem">{b.city} · {b.group}</Typography>
                  </Box>
                  {selected && <CheckIcon sx={{ fontSize: 18, color: colors.brand, ml: 1, flexShrink: 0 }} />}
                </Box>
              );
            })
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No buildings found</Typography>
            </Box>
          )
        ) : (
          filteredClusters.length > 0 ? (
            filteredClusters.map(([group], i) => {
              const selected = selectedNames.includes(group);
              const count = allBuildingsData.filter(b => b.group === group).length;
              const isHighlighted = i === highlightIndex;
              return (
                <Box
                  key={group}
                  ref={isHighlighted ? (el: HTMLElement | null) => el?.scrollIntoView({ block: 'nearest' }) : undefined}
                  sx={{
                    display: 'flex', alignItems: 'center', px: 2, py: 1,
                    cursor: 'pointer',
                    bgcolor: isHighlighted ? colors.bgPrimaryHover : undefined,
                    '&:hover': { bgcolor: colors.bgPrimaryHover },
                  }}
                  onClick={() => toggleItem(group)}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} fontSize="0.85rem">{group}</Typography>
                    <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                      {count} buildings
                    </Typography>
                  </Box>
                  {selected && <CheckIcon sx={{ fontSize: 18, color: colors.brand, ml: 1, flexShrink: 0 }} />}
                </Box>
              );
            })
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
        px: 2, py: 1.25, borderTop: `1px solid ${colors.borderTertiary}`, bgcolor: colors.bgSecondary, flexShrink: 0,
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
  if (selectedNames.length === 0) return mode === 'clusters' ? 'all clusters' : 'all buildings';
  if (selectedNames.length === 1) return selectedNames[0];
  return `${selectedNames.length} ${mode === 'clusters' ? 'clusters' : 'buildings'}`;
}

interface BuildingSelectorProps {
  selectedNames: string[];
  onSelectionChange: (names: string[]) => void;
  mode: BuildingFilterMode;
}

/** Self-contained chip + popover variant */
export default function BuildingSelector({ selectedNames, onSelectionChange, mode }: BuildingSelectorProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const hasFilter = selectedNames.length > 0;

  const label = hasFilter
    ? (selectedNames.length === 1 ? selectedNames[0] : `${selectedNames.length} ${mode === 'clusters' ? 'clusters' : 'buildings'}`)
    : mode === 'clusters' ? 'All Clusters' : 'All Buildings';

  const chipSx = {
    height: 32, borderRadius: '6px',
    backgroundColor: hasFilter ? colors.bgActive : 'white',
    border: '1px solid',
    borderColor: hasFilter ? colors.brand : colors.borderPrimary,
    boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
    '&:hover': { backgroundColor: hasFilter ? '#bbdefb' : colors.bgPrimaryHover },
    '& .MuiChip-label': { px: 1.5, fontSize: '0.875rem', fontWeight: 500, color: hasFilter ? colors.brand : 'inherit' },
    '& .MuiChip-deleteIcon': { color: hasFilter ? colors.brand : undefined },
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
      />
    </>
  );
}
