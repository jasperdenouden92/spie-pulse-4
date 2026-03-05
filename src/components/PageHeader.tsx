import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import { buildings as allBuildingsData } from '@/data/buildings';
import MonitorHeartOutlined from '@mui/icons-material/MonitorHeartOutlined';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import { motion, AnimatePresence } from 'framer-motion';
import { AssetNode } from '@/data/assetTree';

type MetricType = 'overall' | 'sustainability' | 'comfort' | 'asset_monitoring' | 'tickets' | 'quotations' | 'maintenance' | 'energy' | 'workspace' | 'compliance' | 'water_management' | 'security_systems' | 'access_control';

interface PageHeaderProps {
  currentPage?: 'home' | 'portfolio' | 'insights' | 'bms' | 'operations' | 'operations_docs' | 'operations_tickets' | 'operations_quotations' | 'themes' | 'workspaces';
  selectedBuilding?: { name: string } | null;
  selectedAsset?: AssetNode | null;
  onBack?: () => void;
  onAssetBack?: () => void;
  onDateRangeChange?: (range: string) => void;
  onFavoriteToggle?: (pageName: string, isFavorited: boolean) => void;
  isFavorited?: boolean;
  hasRightSidebar?: boolean;
  leftSidebarWidth?: number;
  rightSidebarWidth?: number;
  selection?: string;
  buildings?: Array<{ name: string }>;
  onBuildingSelect?: (building: any) => void;
  onSelectionChange?: (selection: string) => void;
  isAssetExplorerOpen?: boolean;
  viewingAssetDetail?: boolean;
  // Controlled filter state (URL-synced from parent)
  selectedGroup?: string;
  onGroupChange?: (group: string) => void;
  selectedCity?: string;
  onCityChange?: (city: string) => void;
  selectedDateRange?: string;
}

// Mapping from selection values to display names for breadcrumb segments
const THEME_CHILDREN: Record<string, string> = {
  sustainability: 'Sustainability',
  comfort: 'Comfort',
  asset_monitoring: 'Asset Monitoring',
  energy: 'Energy',
  workspace: 'Workspace',
  compliance: 'Compliance',
  water_management: 'Water Management',
  security_systems: 'Security Systems',
  access_control: 'Access Control',
};

const OPERATIONS_CHILDREN: Record<string, string> = {
  tickets: 'Tickets',
  quotations: 'Quotations',
  maintenance: 'Maintenance',
};

const ALL_THEME_KEYS = Object.keys(THEME_CHILDREN);
const ALL_OPERATIONS_KEYS = Object.keys(OPERATIONS_CHILDREN);

export default function PageHeader({
  currentPage = 'portfolio',
  selectedBuilding,
  selectedAsset,
  onBack,
  onAssetBack,
  onDateRangeChange,
  onFavoriteToggle,
  isFavorited = false,
  hasRightSidebar = false,
  leftSidebarWidth = 280,
  rightSidebarWidth = 64,
  selection = 'overall',
  buildings = [],
  onBuildingSelect,
  onSelectionChange,
  isAssetExplorerOpen = false,
  viewingAssetDetail = false,
  selectedGroup: selectedGroupProp,
  onGroupChange,
  selectedCity: selectedCityProp,
  onCityChange,
  selectedDateRange: selectedDateRangeProp,
}: PageHeaderProps) {
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

  // Breadcrumb popover anchors
  const [buildingCaretAnchor, setBuildingCaretAnchor] = useState<null | HTMLElement>(null);
  const [groupCaretAnchor, setGroupCaretAnchor] = useState<null | HTMLElement>(null);
  const [childCaretAnchor, setChildCaretAnchor] = useState<null | HTMLElement>(null);

  // Determine page name based on current page and selections
  const getPageName = () => {
    if (currentPage === 'insights') return 'Insights';
    if (currentPage === 'themes') return 'Themes';
    if (currentPage === 'workspaces') return 'Workspaces';
    return selectedAsset?.type === 'asset' ? selectedAsset.name : selectedBuilding ? selectedBuilding.name : 'Control Room';
  };

  const pageName = getPageName();

  const handleFavoriteToggle = () => {
    const newFavoritedState = !isFavorited;
    onFavoriteToggle?.(pageName, newFavoritedState);
  };

  // Determine breadcrumb segments for portfolio page
  const isThemeChild = ALL_THEME_KEYS.includes(selection);
  const isOperationsChild = ALL_OPERATIONS_KEYS.includes(selection);
  const isThemesGroup = selection === 'themes_group';
  const isOperationsGroup = selection === 'operations_group';
  const showGroupSegment = isThemesGroup || isOperationsGroup || isThemeChild || isOperationsChild;
  const groupLabel = (isThemesGroup || isThemeChild) ? 'Themes' : (isOperationsGroup || isOperationsChild) ? 'Operations' : null;
  const showChildSegment = isThemeChild || isOperationsChild;
  const childLabel = isThemeChild ? THEME_CHILDREN[selection] : isOperationsChild ? OPERATIONS_CHILDREN[selection] : null;

  // Sibling list for child caret popover
  const siblingEntries = isThemeChild
    ? Object.entries(THEME_CHILDREN)
    : isOperationsChild
      ? Object.entries(OPERATIONS_CHILDREN)
      : [];

  // Calculate left position accounting for Asset Explorer
  const effectiveLeft = (isAssetExplorerOpen && viewingAssetDetail)
    ? leftSidebarWidth + 280
    : leftSidebarWidth;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 56,
        left: effectiveLeft,
        right: rightSidebarWidth,
        height: 56,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fafafa',
        zIndex: 1100,
        transition: 'left 0.3s ease, right 0.3s ease'
      }}
    >
      {/* Left: Breadcrumb with navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AnimatePresence>
          {(selectedBuilding || selectedAsset) && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <IconButton size="small" onClick={selectedAsset?.type === 'asset' ? onAssetBack : onBack} sx={{ color: 'text.primary', mr: 0.5 }}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Root breadcrumb segment */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {currentPage === 'insights' ? (
            <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 20, color: 'text.primary' }} />
          ) : currentPage === 'themes' ? (
            <StyleOutlinedIcon sx={{ fontSize: 20, color: 'text.primary' }} />
          ) : currentPage === 'workspaces' ? (
            <WorkspacesOutlinedIcon sx={{ fontSize: 20, color: 'text.primary' }} />
          ) : (
            <MonitorHeartOutlined sx={{ fontSize: 20, color: 'text.primary' }} />
          )}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1rem',
              cursor: currentPage === 'portfolio' ? 'pointer' : 'default',
              '&:hover': currentPage === 'portfolio' ? {
                textDecoration: 'underline'
              } : {}
            }}
            onClick={currentPage === 'portfolio' ? () => {
              // Reset to overall dashboard
              if (selectedBuilding || selectedAsset) {
                onAssetBack?.();
                onBack?.();
              }
              onSelectionChange?.('overall');
            } : undefined}
          >
            {currentPage === 'insights' ? 'Insights' : currentPage === 'themes' ? 'Themes' : currentPage === 'workspaces' ? 'Workspaces' : 'Control Room'}
          </Typography>
        </Box>

        {/* Smart contextual breadcrumbs for Portfolio page */}
        {currentPage === 'portfolio' && (
          <>
            {/* Building segment (when a building is selected) */}
            <AnimatePresence>
              {selectedBuilding && (
                <motion.div
                  key="building-breadcrumb"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <KeyboardArrowRightIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <ApartmentOutlinedIcon sx={{ fontSize: 20, color: 'text.primary', mr: 0.5 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: selectedAsset?.type === 'asset' ? 'pointer' : 'default',
                      '&:hover': selectedAsset?.type === 'asset' ? { textDecoration: 'underline' } : {}
                    }}
                    onClick={selectedAsset?.type === 'asset' ? onAssetBack : undefined}
                  >
                    {selectedBuilding.name}
                  </Typography>
                  {buildings.length > 1 && (
                    <>
                      <IconButton
                        size="small"
                        onClick={(e) => setBuildingCaretAnchor(e.currentTarget)}
                        sx={{ color: 'text.secondary', p: 0.25 }}
                      >
                        <UnfoldMoreIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <Menu
                        anchorEl={buildingCaretAnchor}
                        open={Boolean(buildingCaretAnchor)}
                        onClose={() => setBuildingCaretAnchor(null)}
                      >
                        {buildings.map((b) => (
                          <MenuItem
                            key={b.name}
                            selected={selectedBuilding?.name === b.name}
                            onClick={() => {
                              onBuildingSelect?.(b);
                              setBuildingCaretAnchor(null);
                            }}
                          >
                            {b.name}
                          </MenuItem>
                        ))}
                      </Menu>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Asset breadcrumb */}
            <AnimatePresence>
              {selectedAsset?.type === 'asset' && (
                <motion.div
                  key="asset-breadcrumb"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <KeyboardArrowRightIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    {selectedAsset.name}
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Group segment (Themes or Operations) */}
            <AnimatePresence>
              {showGroupSegment && (
                <motion.div
                  key="group-breadcrumb"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <KeyboardArrowRightIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: showChildSegment ? 'pointer' : 'default',
                      '&:hover': showChildSegment ? { textDecoration: 'underline' } : {}
                    }}
                    onClick={showChildSegment ? () => {
                      const groupKey = isThemeChild ? 'themes_group' : 'operations_group';
                      onSelectionChange?.(groupKey);
                    } : undefined}
                  >
                    {groupLabel}
                  </Typography>
                  {!showChildSegment && (
                    <>
                      <IconButton
                        size="small"
                        onClick={(e) => setGroupCaretAnchor(e.currentTarget)}
                        sx={{ color: 'text.secondary', p: 0.25 }}
                      >
                        <UnfoldMoreIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <Menu
                        anchorEl={groupCaretAnchor}
                        open={Boolean(groupCaretAnchor)}
                        onClose={() => setGroupCaretAnchor(null)}
                      >
                        <MenuItem
                          selected={isThemesGroup}
                          onClick={() => { onSelectionChange?.('themes_group'); setGroupCaretAnchor(null); }}
                        >
                          Themes
                        </MenuItem>
                        <MenuItem
                          selected={isOperationsGroup}
                          onClick={() => { onSelectionChange?.('operations_group'); setGroupCaretAnchor(null); }}
                        >
                          Operations
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Child KPI segment (specific metric like Sustainability, Tickets etc.) */}
            <AnimatePresence>
              {showChildSegment && childLabel && (
                <motion.div
                  key="child-breadcrumb"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <KeyboardArrowRightIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    {childLabel}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => setChildCaretAnchor(e.currentTarget)}
                    sx={{ color: 'text.secondary', p: 0.25 }}
                  >
                    <UnfoldMoreIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <Menu
                    anchorEl={childCaretAnchor}
                    open={Boolean(childCaretAnchor)}
                    onClose={() => setChildCaretAnchor(null)}
                  >
                    {siblingEntries.map(([key, label]) => (
                      <MenuItem
                        key={key}
                        selected={selection === key}
                        onClick={() => {
                          onSelectionChange?.(key);
                          setChildCaretAnchor(null);
                        }}
                      >
                        {label}
                      </MenuItem>
                    ))}
                  </Menu>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </Box>

      {/* Right: Filter controls and favorite */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        {/* Favorite Icon */}
        <IconButton
          size="small"
          onClick={handleFavoriteToggle}
          sx={{
            color: isFavorited ? 'primary.main' : 'text.secondary',
            '&:hover': {
              bgcolor: isFavorited ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          {isFavorited ? <StarIcon fontSize="small" /> : <StarOutlineIcon fontSize="small" />}
        </IconButton>

        {currentPage === 'portfolio' && !selectedBuilding && (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {/* Buildings Filter (replaces Group + City) */}
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
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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
        )}
      </Box>
    </Box>
  );
}
