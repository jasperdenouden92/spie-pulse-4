import React, { useState, useMemo } from 'react';
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
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { buildings as allBuildingsData } from '@/data/buildings';
import { assetTree, AssetNode } from '@/data/assetTree';

// Dashboards that show the asset filter
const DASHBOARDS_WITH_ASSET_FILTER = new Set(['metertrend', 'energie_buitentemperatuur']);

// Get all building nodes from the asset tree
function getBuildingNodes(): AssetNode[] {
  const buildingsCategory = assetTree.find(n => n.name === 'Buildings');
  return buildingsCategory?.children ?? [];
}

// Count all leaf assets under a node
function countLeafAssets(node: AssetNode): number {
  if (node.type === 'asset') return 1;
  if (!node.children) return 0;
  return node.children.reduce((sum, child) => sum + countLeafAssets(child), 0);
}

// Collect all leaf asset IDs under a node
function collectLeafIds(node: AssetNode): string[] {
  if (node.type === 'asset') return [node.id];
  if (!node.children) return [];
  return node.children.flatMap(child => collectLeafIds(child));
}

interface ControlRoomFiltersProps {
  selectedDateRange?: string;
  onDateRangeChange?: (range: string) => void;
  activeDashboardId?: string;
}

// Recursive tree node renderer for the asset filter
function AssetTreeNode({
  node,
  depth,
  selectedIds,
  allSelected,
  expandedNodes,
  onToggleExpand,
  onToggleSelect,
  searchQuery,
}: {
  node: AssetNode;
  depth: number;
  selectedIds: string[];
  allSelected: boolean;
  expandedNodes: Set<string>;
  onToggleExpand: (id: string) => void;
  onToggleSelect: (id: string, leafIds: string[]) => void;
  searchQuery: string;
}) {
  const isAsset = node.type === 'asset';
  const hasChildren = !!(node.children && node.children.length > 0);
  const isExpanded = expandedNodes.has(node.id);

  // For search filtering: check if this node or any descendant matches
  if (searchQuery) {
    const matches = node.name.toLowerCase().includes(searchQuery);
    const hasMatchingDescendant = hasChildren && node.children!.some(child => {
      const childMatches = child.name.toLowerCase().includes(searchQuery);
      if (childMatches) return true;
      if (child.children) return child.children.some(gc => gc.name.toLowerCase().includes(searchQuery));
      return false;
    });
    if (!matches && !hasMatchingDescendant) return null;
  }

  if (isAsset) {
    const isSelected = allSelected || selectedIds.includes(node.id);
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          pl: 1.5 + depth * 1.5,
          pr: 1,
          py: 0.25,
          cursor: 'pointer',
          '&:hover': { bgcolor: '#f5f5f5' },
        }}
        onClick={() => onToggleSelect(node.id, [node.id])}
      >
        <Checkbox size="small" checked={isSelected} sx={{ p: '4px' }} />
        <Box sx={{ ml: 0.5, minWidth: 0 }}>
          <Typography variant="body2" fontSize="0.8rem" noWrap>{node.name}</Typography>
        </Box>
        {hasChildren && (
          <ExpandMoreIcon
            sx={{
              fontSize: 14,
              color: 'text.secondary',
              ml: 'auto',
              flexShrink: 0,
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
              cursor: 'pointer',
            }}
            onClick={(e) => { e.stopPropagation(); onToggleExpand(node.id); }}
          />
        )}
      </Box>
    );
  }

  // Non-asset node (floor, zone, category) — collapsible header, no checkbox
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          pl: 1 + depth * 1.5,
          pr: 1,
          py: 0.5,
          cursor: 'pointer',
          '&:hover': { bgcolor: '#f5f5f5' },
        }}
        onClick={() => onToggleExpand(node.id)}
      >
        <ExpandMoreIcon
          sx={{
            fontSize: 16,
            color: 'text.secondary',
            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.2s',
            mr: 0.5,
            flexShrink: 0,
          }}
        />
        <Typography variant="body2" fontSize="0.8rem" fontWeight={600} noWrap sx={{ flex: 1 }}>
          {node.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
          {countLeafAssets(node)}
        </Typography>
      </Box>
      {hasChildren && (
        <Collapse in={isExpanded} unmountOnExit>
          {node.children!.map(child => (
            <AssetTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedIds={selectedIds}
              allSelected={allSelected}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              onToggleSelect={onToggleSelect}
              searchQuery={searchQuery}
            />
          ))}
        </Collapse>
      )}
    </Box>
  );
}

export default function ControlRoomFilters({
  selectedDateRange: selectedDateRangeProp,
  onDateRangeChange,
  activeDashboardId,
}: ControlRoomFiltersProps) {
  const [buildingFilterAnchor, setBuildingFilterAnchor] = useState<null | HTMLElement>(null);
  const [selectedBuildingNames, setSelectedBuildingNames] = useState<string[]>([]);
  const [buildingSearch, setBuildingSearch] = useState('');
  const [dateRangeAnchorEl, setDateRangeAnchorEl] = useState<null | HTMLElement>(null);
  const [localDateRange, setLocalDateRange] = useState('This Quarter');
  const selectedDateRange = selectedDateRangeProp ?? localDateRange;
  const setSelectedDateRange = (v: string) => { setLocalDateRange(v); onDateRangeChange?.(v); };

  // Asset filter state
  const [assetFilterAnchor, setAssetFilterAnchor] = useState<null | HTMLElement>(null);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [assetSearch, setAssetSearch] = useState('');
  const [expandedAssetNodes, setExpandedAssetNodes] = useState<Set<string>>(new Set());

  const showAssetFilter = !!(activeDashboardId && DASHBOARDS_WITH_ASSET_FILTER.has(activeDashboardId));

  const buildingNodes = useMemo(() => getBuildingNodes(), []);

  // Count total leaf assets
  const totalAssetCount = useMemo(() =>
    buildingNodes.reduce((sum, b) => sum + countLeafAssets(b), 0),
  [buildingNodes]);

  const allAssetsSelected = selectedAssetIds.length === 0;
  const isAssetFiltered = !allAssetsSelected;

  const allGroups = [...new Set(allBuildingsData.map(b => b.group))].sort();
  const allCities = [...new Set(allBuildingsData.map(b => b.city))].sort();

  const allSelected = selectedBuildingNames.length === 0;
  const isFiltered = !allSelected;

  const getBuildingFilterLabel = () => {
    if (!isFiltered) return 'All Buildings';
    return `${selectedBuildingNames.length} gebouw${selectedBuildingNames.length !== 1 ? 'en' : ''}`;
  };

  const getAssetFilterLabel = () => {
    if (!isAssetFiltered) return 'Alle assets';
    return `${selectedAssetIds.length} asset${selectedAssetIds.length !== 1 ? 's' : ''}`;
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

  // Asset filter helpers
  const toggleAssetExpand = (nodeId: string) => {
    setExpandedAssetNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const toggleAssetSelect = (nodeId: string, leafIds: string[]) => {
    if (allAssetsSelected) {
      // Deselect: select everything except these
      const allIds = buildingNodes.flatMap(b => collectLeafIds(b));
      setSelectedAssetIds(allIds.filter(id => !leafIds.includes(id)));
    } else {
      const allCurrentlySelected = leafIds.every(id => selectedAssetIds.includes(id));
      if (allCurrentlySelected) {
        const next = selectedAssetIds.filter(id => !leafIds.includes(id));
        setSelectedAssetIds(next);
      } else {
        const next = [...new Set([...selectedAssetIds, ...leafIds])];
        setSelectedAssetIds(next.length === totalAssetCount ? [] : next);
      }
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

  const chipSx = (active: boolean) => ({
    height: 32,
    borderRadius: '6px',
    backgroundColor: active ? '#e3f2fd' : 'white',
    border: '1px solid',
    borderColor: active ? '#1976d2' : '#d0d0d0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
    '&:hover': { backgroundColor: active ? '#bbdefb' : '#f5f5f5' },
    '& .MuiChip-label': { px: 1.5, fontSize: '0.875rem', fontWeight: 500, color: active ? '#1976d2' : 'inherit' },
    '& .MuiChip-deleteIcon': { color: active ? '#1976d2' : undefined },
  });

  const searchLower = assetSearch.toLowerCase();

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {/* Buildings Filter */}
      <Chip
        label={getBuildingFilterLabel()}
        onClick={(e) => setBuildingFilterAnchor(e.currentTarget)}
        deleteIcon={<ExpandMoreIcon />}
        onDelete={(e) => setBuildingFilterAnchor(e.currentTarget as any)}
        sx={chipSx(isFiltered)}
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

      {/* Asset Filter — only for specific dashboards */}
      {showAssetFilter && (
        <>
          <Chip
            label={getAssetFilterLabel()}
            onClick={(e) => setAssetFilterAnchor(e.currentTarget)}
            deleteIcon={<ExpandMoreIcon />}
            onDelete={(e) => setAssetFilterAnchor(e.currentTarget as any)}
            sx={chipSx(isAssetFiltered)}
          />
          <Popover
            anchorEl={assetFilterAnchor}
            open={Boolean(assetFilterAnchor)}
            onClose={() => { setAssetFilterAnchor(null); setAssetSearch(''); }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{ sx: { mt: 0.5, width: 420, borderRadius: '10px', boxShadow: '0 4px 24px rgba(0,0,0,0.14)', overflow: 'hidden' } }}
          >
            {/* Header */}
            <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
              <Typography variant="subtitle2" fontWeight={600}>Filter assets</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {isAssetFiltered ? selectedAssetIds.length : totalAssetCount}/{totalAssetCount} geselecteerd
                </Typography>
                {isAssetFiltered && (
                  <Typography variant="caption" sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => setSelectedAssetIds([])}>
                    Wis alles
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Search */}
            <Box sx={{ p: 1, borderBottom: '1px solid #f0f0f0' }}>
              <TextField
                size="small"
                placeholder="Zoek asset..."
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: '0.8rem' },
                  '& .MuiOutlinedInput-input': { py: '5px', px: '10px' }
                }}
              />
            </Box>

            {/* Tree body — buildings as collapsible headers */}
            <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
              {buildingNodes.map(building => {
                const isExpanded = expandedAssetNodes.has(building.id);
                const assetCount = countLeafAssets(building);
                if (assetCount === 0) return null;

                // Filter by search
                if (searchLower && !building.name.toLowerCase().includes(searchLower)) {
                  // Check if any descendant matches
                  const hasMatch = collectLeafIds(building).length > 0; // simplified — always show if has assets
                  if (!hasMatch) return null;
                }

                return (
                  <Box key={building.id}>
                    {/* Building header — no checkbox, just chevron */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 1.5,
                        py: 0.75,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#f5f5f5' },
                        borderBottom: '1px solid #f0f0f0',
                      }}
                      onClick={() => toggleAssetExpand(building.id)}
                    >
                      <ExpandMoreIcon
                        sx={{
                          fontSize: 16,
                          color: 'text.secondary',
                          transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                          transition: 'transform 0.2s',
                          mr: 0.5,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" fontWeight={600} fontSize="0.8125rem" sx={{ flex: 1 }} noWrap>
                        {building.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                        {assetCount}
                      </Typography>
                    </Box>

                    {/* Building children tree */}
                    <Collapse in={isExpanded} unmountOnExit>
                      {building.children?.map(child => (
                        <AssetTreeNode
                          key={child.id}
                          node={child}
                          depth={1}
                          selectedIds={selectedAssetIds}
                          allSelected={allAssetsSelected}
                          expandedNodes={expandedAssetNodes}
                          onToggleExpand={toggleAssetExpand}
                          onToggleSelect={toggleAssetSelect}
                          searchQuery={searchLower}
                        />
                      ))}
                    </Collapse>
                  </Box>
                );
              })}
            </Box>
          </Popover>
        </>
      )}

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
