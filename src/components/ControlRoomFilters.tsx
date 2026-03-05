import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { buildings as allBuildingsData } from '@/data/buildings';

interface ControlRoomFiltersProps {
  selectedDateRange?: string;
  onDateRangeChange?: (range: string) => void;
}

export default function ControlRoomFilters({
  selectedDateRange: selectedDateRangeProp,
  onDateRangeChange,
}: ControlRoomFiltersProps) {
  const [buildingFilterAnchor, setBuildingFilterAnchor] = useState<null | HTMLElement>(null);
  const [selectedBuildingNames, setSelectedBuildingNames] = useState<string[]>([]);
  const [buildingSearch, setBuildingSearch] = useState('');
  const [dateRangeAnchorEl, setDateRangeAnchorEl] = useState<null | HTMLElement>(null);
  const [localDateRange, setLocalDateRange] = useState('This Quarter');
  const selectedDateRange = selectedDateRangeProp ?? localDateRange;
  const setSelectedDateRange = (v: string) => { setLocalDateRange(v); onDateRangeChange?.(v); };

  const allGroups = [...new Set(allBuildingsData.map(b => b.group))].sort();
  const allCities = [...new Set(allBuildingsData.map(b => b.city))].sort();

  const allSelected = selectedBuildingNames.length === 0;
  const isFiltered = !allSelected;

  const getBuildingFilterLabel = () => {
    if (!isFiltered) return 'All Buildings';
    return `${selectedBuildingNames.length} gebouw${selectedBuildingNames.length !== 1 ? 'en' : ''}`;
  };

  const getGroupState = (group: string): 'checked' | 'indeterminate' | 'unchecked' => {
    const names = allBuildingsData.filter(b => b.group === group).map(b => b.name);
    if (allSelected) return 'checked';
    const n = names.filter(n => selectedBuildingNames.includes(n)).length;
    if (n === names.length) return 'checked';
    if (n > 0) return 'indeterminate';
    return 'unchecked';
  };

  const getCityState = (city: string): 'checked' | 'indeterminate' | 'unchecked' => {
    const names = allBuildingsData.filter(b => b.city === city).map(b => b.name);
    if (allSelected) return 'checked';
    const n = names.filter(n => selectedBuildingNames.includes(n)).length;
    if (n === names.length) return 'checked';
    if (n > 0) return 'indeterminate';
    return 'unchecked';
  };

  const toggleGroup = (group: string) => {
    const groupNames = allBuildingsData.filter(b => b.group === group).map(b => b.name);
    const state = getGroupState(group);
    if (state === 'checked') {
      const base = allSelected ? allBuildingsData.map(b => b.name) : selectedBuildingNames;
      setSelectedBuildingNames(base.filter(n => !groupNames.includes(n)));
    } else if (!allSelected) {
      const next = [...new Set([...selectedBuildingNames, ...groupNames])];
      setSelectedBuildingNames(next.length === allBuildingsData.length ? [] : next);
    }
  };

  const toggleCity = (city: string) => {
    const cityNames = allBuildingsData.filter(b => b.city === city).map(b => b.name);
    const state = getCityState(city);
    if (state === 'checked') {
      const base = allSelected ? allBuildingsData.map(b => b.name) : selectedBuildingNames;
      setSelectedBuildingNames(base.filter(n => !cityNames.includes(n)));
    } else if (!allSelected) {
      const next = [...new Set([...selectedBuildingNames, ...cityNames])];
      setSelectedBuildingNames(next.length === allBuildingsData.length ? [] : next);
    }
  };

  const toggleBuilding = (name: string) => {
    if (allSelected) {
      setSelectedBuildingNames(allBuildingsData.map(b => b.name).filter(n => n !== name));
    } else if (selectedBuildingNames.includes(name)) {
      setSelectedBuildingNames(selectedBuildingNames.filter(n => n !== name));
    } else {
      const next = [...selectedBuildingNames, name];
      setSelectedBuildingNames(next.length === allBuildingsData.length ? [] : next);
    }
  };

  const filteredBuildingsList = buildingSearch
    ? allBuildingsData.filter(b => b.name.toLowerCase().includes(buildingSearch.toLowerCase()))
    : allBuildingsData;

  const getDateRangeDisplay = (range: string): string => {
    const now = new Date();
    const months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    const fmt = (d: Date) => `${d.getDate()} ${months[d.getMonth()]}`;
    const fmtFull = (d: Date) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    switch (range) {
      case 'Today': return fmtFull(now);
      case 'This Week': {
        const day = now.getDay() || 7;
        const mon = new Date(now); mon.setDate(now.getDate() - day + 1);
        const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
        return `${fmt(mon)} – ${fmtFull(sun)}`;
      }
      case 'This Month': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return `${fmt(start)} – ${fmtFull(end)}`;
      }
      case 'This Quarter': {
        const q = Math.floor(now.getMonth() / 3);
        const start = new Date(now.getFullYear(), q * 3, 1);
        const end = new Date(now.getFullYear(), q * 3 + 3, 0);
        return `${fmt(start)} – ${fmtFull(end)}`;
      }
      case 'This Year': {
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        return `${fmt(start)} – ${fmtFull(end)}`;
      }
      default: return range;
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}>
      {/* Buildings Filter */}
      <Chip
        label={getBuildingFilterLabel()}
        onClick={(e) => setBuildingFilterAnchor(e.currentTarget)}
        deleteIcon={<ExpandMoreIcon />}
        onDelete={(e) => setBuildingFilterAnchor(e.currentTarget as any)}
        sx={{
          height: 32,
          borderRadius: '6px',
          backgroundColor: isFiltered ? '#e3f2fd' : 'white',
          border: '1px solid',
          borderColor: isFiltered ? '#1976d2' : '#d0d0d0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
          '&:hover': { backgroundColor: isFiltered ? '#bbdefb' : '#f5f5f5' },
          '& .MuiChip-label': { px: 1.5, fontSize: '0.875rem', fontWeight: 500, color: isFiltered ? '#1976d2' : 'inherit' },
          '& .MuiChip-deleteIcon': { color: isFiltered ? '#1976d2' : undefined }
        }}
      />
      <Popover
        anchorEl={buildingFilterAnchor}
        open={Boolean(buildingFilterAnchor)}
        onClose={() => { setBuildingFilterAnchor(null); setBuildingSearch(''); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { mt: 0.5, width: 560, borderRadius: '10px', boxShadow: '0 4px 24px rgba(0,0,0,0.14)', overflow: 'hidden' } }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <Typography variant="subtitle2" fontWeight={600}>Filter gebouwen</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              {isFiltered ? selectedBuildingNames.length : allBuildingsData.length}/{allBuildingsData.length} geselecteerd
            </Typography>
            {isFiltered && (
              <Typography variant="caption" sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => setSelectedBuildingNames([])}>
                Wis alles
              </Typography>
            )}
          </Box>
        </Box>

        {/* Two-panel body */}
        <Box sx={{ display: 'flex', height: 340 }}>
          {/* Left: Quick selects */}
          <Box sx={{ width: 190, borderRight: '1px solid #f0f0f0', overflowY: 'auto', p: 1.5 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5, px: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>
              Groepen
            </Typography>
            {allGroups.map(group => {
              const state = getGroupState(group);
              const count = allBuildingsData.filter(b => b.group === group).length;
              return (
                <Box key={group} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '6px', px: 0.5, '&:hover': { bgcolor: '#f5f5f5' } }}>
                  <FormControlLabel
                    control={<Checkbox size="small" checked={state === 'checked'} indeterminate={state === 'indeterminate'} onChange={() => toggleGroup(group)} sx={{ p: '4px' }} />}
                    label={<Typography variant="body2">{group}</Typography>}
                    sx={{ m: 0, flex: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">{count}</Typography>
                </Box>
              );
            })}

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5, px: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>
              Steden
            </Typography>
            {allCities.map(city => {
              const state = getCityState(city);
              const count = allBuildingsData.filter(b => b.city === city).length;
              return (
                <Box key={city} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '6px', px: 0.5, '&:hover': { bgcolor: '#f5f5f5' } }}>
                  <FormControlLabel
                    control={<Checkbox size="small" checked={state === 'checked'} indeterminate={state === 'indeterminate'} onChange={() => toggleCity(city)} sx={{ p: '4px' }} />}
                    label={<Typography variant="body2">{city}</Typography>}
                    sx={{ m: 0, flex: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">{count}</Typography>
                </Box>
              );
            })}
          </Box>

          {/* Right: Individual buildings */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Box sx={{ p: 1, borderBottom: '1px solid #f0f0f0' }}>
              <TextField
                size="small"
                placeholder="Zoek gebouw..."
                value={buildingSearch}
                onChange={(e) => setBuildingSearch(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: '0.8rem' },
                  '& .MuiOutlinedInput-input': { py: '5px', px: '10px' }
                }}
              />
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {filteredBuildingsList.map(b => {
                const isSelected = allSelected || selectedBuildingNames.includes(b.name);
                return (
                  <Box
                    key={b.name}
                    sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.25, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}
                    onClick={() => toggleBuilding(b.name)}
                  >
                    <Checkbox size="small" checked={isSelected} onChange={() => toggleBuilding(b.name)} onClick={e => e.stopPropagation()} sx={{ p: '4px' }} />
                    <Box sx={{ ml: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap>{b.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{b.city} · {b.group}</Typography>
                    </Box>
                  </Box>
                );
              })}
              {filteredBuildingsList.length === 0 && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Geen gebouwen gevonden</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Popover>

      {/* Date Range Picker */}
      <Chip
        label={getDateRangeDisplay(selectedDateRange)}
        onClick={(e) => setDateRangeAnchorEl(e.currentTarget)}
        deleteIcon={<ExpandMoreIcon />}
        onDelete={(e) => setDateRangeAnchorEl(e.currentTarget as any)}
        sx={{
          height: 32,
          borderRadius: '6px',
          backgroundColor: 'white',
          border: '1px solid #d0d0d0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
          '&:hover': { backgroundColor: '#f5f5f5' },
          '& .MuiChip-label': { px: 1.5, fontSize: '0.875rem', fontWeight: 500 }
        }}
      />
      <Menu
        anchorEl={dateRangeAnchorEl}
        open={Boolean(dateRangeAnchorEl)}
        onClose={() => setDateRangeAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: '10px', boxShadow: '0 4px 24px rgba(0,0,0,0.13)', mt: 0.5 } }}
      >
        {['Today', 'This Week', 'This Month', 'This Quarter', 'This Year', 'All Time'].map(range => (
          <MenuItem
            key={range}
            selected={selectedDateRange === range}
            onClick={() => { setSelectedDateRange(range); setDateRangeAnchorEl(null); }}
            sx={{ fontSize: '0.875rem' }}
          >
            <Box>
              <Typography variant="body2" fontWeight={selectedDateRange === range ? 600 : 400}>{range}</Typography>
              {range !== 'All Time' && (
                <Typography variant="caption" color="text.secondary">{getDateRangeDisplay(range)}</Typography>
              )}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
