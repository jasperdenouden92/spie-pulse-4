import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { assetTree, AssetNode } from '@/data/assetTree';
import { useThemeMode } from '@/theme-mode-context';
import BuildingSelector, { type BuildingFilterMode } from '@/components/BuildingSelector';
import DateRangeSelector, { getDateRangeDisplayLabel } from './DateRangeSelector';

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
  buildingFilterMode?: BuildingFilterMode;
  onBuildingFilterModeChange?: (mode: BuildingFilterMode) => void;
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
  const { themeColors: c } = useThemeMode();
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
          '&:hover': { bgcolor: c.bgPrimaryHover },
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
          '&:hover': { bgcolor: c.bgPrimaryHover },
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
        <Collapse data-annotation-id="controlroomfilters-accordion-2" in={isExpanded} unmountOnExit>
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
  buildingFilterMode = 'buildings',
  onBuildingFilterModeChange,
}: ControlRoomFiltersProps) {
  const { themeColors: c } = useThemeMode();
  const [selectedBuildingNames, setSelectedBuildingNames] = useState<string[]>([]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [localDateRange, setLocalDateRange] = useState('This Month');
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

  const getAssetFilterLabel = () => {
    if (!isAssetFiltered) return 'Alle assets';
    return `${selectedAssetIds.length} asset${selectedAssetIds.length !== 1 ? 's' : ''}`;
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

  const getDateRangeDisplay = (range: string): string => getDateRangeDisplayLabel(range);

  const chipSx = (active: boolean) => ({
    height: 32,
    borderRadius: '6px',
    backgroundColor: active ? c.bgActive : c.bgPrimary,
    border: '1px solid',
    borderColor: active ? c.brand : c.borderPrimary,
    boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
    '&:hover': { backgroundColor: active ? c.bgActiveHover : c.bgPrimaryHover },
    '& .MuiChip-label': { px: 1.5, fontSize: '0.875rem', fontWeight: 500, color: active ? c.brand : 'inherit' },
    '& .MuiChip-deleteIcon': { color: active ? c.brand : undefined },
  });

  const searchLower = assetSearch.toLowerCase();

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {/* Buildings/Clusters Filter */}
      <BuildingSelector
        selectedNames={selectedBuildingNames}
        onSelectionChange={setSelectedBuildingNames}
        mode={buildingFilterMode}
        onModeChange={onBuildingFilterModeChange}
      />

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
            <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${c.bgSecondaryHover}` }}>
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
            <Box sx={{ p: 1, borderBottom: `1px solid ${c.bgSecondaryHover}` }}>
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
                        '&:hover': { bgcolor: c.bgPrimaryHover },
                        borderBottom: `1px solid ${c.bgSecondaryHover}`,
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
                    <Collapse data-annotation-id="controlroomfilters-accordion" in={isExpanded} unmountOnExit>
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
        onClick={() => setDatePickerOpen(true)}
        deleteIcon={<ExpandMoreIcon />}
        onDelete={() => setDatePickerOpen(true)}
        sx={{
          height: 32,
          borderRadius: '6px',
          backgroundColor: c.bgPrimary,
          border: `1px solid ${c.borderPrimary}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
          '&:hover': { backgroundColor: c.bgPrimaryHover },
          '& .MuiChip-label': { px: 1.5, fontSize: '0.875rem', fontWeight: 500 }
        }}
      />
      <DateRangeSelector
        inline
        hideSlider
        value={selectedDateRange}
        onChange={(v) => { setSelectedDateRange(v); }}
        dialogOpen={datePickerOpen}
        onDialogOpenChange={setDatePickerOpen}
      />
    </Box>
  );
}
