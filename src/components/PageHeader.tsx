import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MonitorHeartOutlined from '@mui/icons-material/MonitorHeartOutlined';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import { motion, AnimatePresence } from 'framer-motion';
import { AssetNode } from '@/data/assetTree';

type MetricType = 'overall' | 'sustainability' | 'comfort' | 'asset_monitoring' | 'tickets' | 'quotations' | 'maintenance' | 'energy' | 'workspace' | 'compliance' | 'water_management' | 'security_systems' | 'access_control';

interface PageHeaderProps {
  currentPage?: 'portfolio' | 'insights' | 'themes' | 'workspaces';
  selectedBuilding?: { name: string } | null;
  selectedAsset?: AssetNode | null;
  onBack?: () => void;
  onAssetBack?: () => void;
  onDateRangeChange?: (range: string) => void;
  onPinToggle?: (pageName: string, isPinned: boolean) => void;
  isPinned?: boolean;
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
  onPinToggle,
  isPinned = false,
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
  const [groupAnchorEl, setGroupAnchorEl] = useState<null | HTMLElement>(null);
  const [cityAnchorEl, setCityAnchorEl] = useState<null | HTMLElement>(null);
  const [dateRangeAnchorEl, setDateRangeAnchorEl] = useState<null | HTMLElement>(null);
  // Use prop values when provided (URL-synced), otherwise fall back to local state
  const [localGroup, setLocalGroup] = useState('All Groups');
  const [localCity, setLocalCity] = useState('All Cities');
  const [localDateRange, setLocalDateRange] = useState('This Quarter');
  const selectedGroup = selectedGroupProp ?? localGroup;
  const selectedCity = selectedCityProp ?? localCity;
  const selectedDateRange = selectedDateRangeProp ?? localDateRange;
  const setSelectedGroup = (v: string) => { setLocalGroup(v); onGroupChange?.(v); };
  const setSelectedCity = (v: string) => { setLocalCity(v); onCityChange?.(v); };
  const setSelectedDateRange = (v: string) => { setLocalDateRange(v); onDateRangeChange?.(v); };

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

  const handlePinToggle = () => {
    const newPinnedState = !isPinned;
    onPinToggle?.(pageName, newPinnedState);
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

      {/* Right: Filter controls and pin */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        {/* Pin Icon */}
        <IconButton
          size="small"
          onClick={handlePinToggle}
          sx={{
            color: isPinned ? 'primary.main' : 'text.secondary',
            '&:hover': {
              bgcolor: isPinned ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          {isPinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
        </IconButton>

        {currentPage === 'portfolio' && !selectedBuilding && (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {/* Group Filter */}
            <Chip
              label={selectedGroup}
              onClick={(e) => setGroupAnchorEl(e.currentTarget)}
              deleteIcon={<ExpandMoreIcon />}
              onDelete={(e) => setGroupAnchorEl(e.currentTarget as any)}
              sx={{
                height: 32,
                borderRadius: '6px',
                backgroundColor: '#f5f5f5',
                '&:hover': { backgroundColor: '#e8e8e8' },
                '& .MuiChip-label': { px: 1.5, fontSize: '0.875rem', fontWeight: 500 }
              }}
            />
            <Menu
              anchorEl={groupAnchorEl}
              open={Boolean(groupAnchorEl)}
              onClose={() => setGroupAnchorEl(null)}
            >
              <MenuItem onClick={() => { setSelectedGroup('All Groups'); setGroupAnchorEl(null); }}>All Groups</MenuItem>
              <MenuItem onClick={() => { setSelectedGroup('MFA de Statie, SPIE Eindhoven'); setGroupAnchorEl(null); }}>MFA de Statie, SPIE Eindhoven</MenuItem>
              <MenuItem onClick={() => { setSelectedGroup('Tech Campus North'); setGroupAnchorEl(null); }}>Tech Campus North</MenuItem>
              <MenuItem onClick={() => { setSelectedGroup('Innovation District'); setGroupAnchorEl(null); }}>Innovation District</MenuItem>
            </Menu>

            {/* City Filter */}
            <Chip
              label={selectedCity}
              onClick={(e) => setCityAnchorEl(e.currentTarget)}
              deleteIcon={<ExpandMoreIcon />}
              onDelete={(e) => setCityAnchorEl(e.currentTarget as any)}
              sx={{
                height: 32,
                borderRadius: '6px',
                backgroundColor: '#f5f5f5',
                '&:hover': { backgroundColor: '#e8e8e8' },
                '& .MuiChip-label': { px: 1.5, fontSize: '0.875rem', fontWeight: 500 }
              }}
            />
            <Menu
              anchorEl={cityAnchorEl}
              open={Boolean(cityAnchorEl)}
              onClose={() => setCityAnchorEl(null)}
            >
              <MenuItem onClick={() => { setSelectedCity('All Cities'); setCityAnchorEl(null); }}>All Cities</MenuItem>
              <MenuItem onClick={() => { setSelectedCity('Cityville'); setCityAnchorEl(null); }}>Cityville</MenuItem>
              <MenuItem onClick={() => { setSelectedCity('Silicon Valley'); setCityAnchorEl(null); }}>Silicon Valley</MenuItem>
              <MenuItem onClick={() => { setSelectedCity('Pleasantville'); setCityAnchorEl(null); }}>Pleasantville</MenuItem>
              <MenuItem onClick={() => { setSelectedCity('Downtown'); setCityAnchorEl(null); }}>Downtown</MenuItem>
            </Menu>

            {/* Date Range Picker */}
            <Chip
              label={selectedDateRange}
              onClick={(e) => setDateRangeAnchorEl(e.currentTarget)}
              deleteIcon={<ExpandMoreIcon />}
              onDelete={(e) => setDateRangeAnchorEl(e.currentTarget as any)}
              sx={{
                height: 32,
                borderRadius: '6px',
                backgroundColor: '#f5f5f5',
                '&:hover': { backgroundColor: '#e8e8e8' },
                '& .MuiChip-label': { px: 1.5, fontSize: '0.875rem', fontWeight: 500 }
              }}
            />
            <Menu
              anchorEl={dateRangeAnchorEl}
              open={Boolean(dateRangeAnchorEl)}
              onClose={() => setDateRangeAnchorEl(null)}
            >
              <MenuItem onClick={() => { setSelectedDateRange('Today'); setDateRangeAnchorEl(null); }}>Today</MenuItem>
              <MenuItem onClick={() => { setSelectedDateRange('This Week'); setDateRangeAnchorEl(null); }}>This Week</MenuItem>
              <MenuItem onClick={() => { setSelectedDateRange('This Month'); setDateRangeAnchorEl(null); }}>This Month</MenuItem>
              <MenuItem onClick={() => { setSelectedDateRange('This Quarter'); setDateRangeAnchorEl(null); }}>This Quarter</MenuItem>
              <MenuItem onClick={() => { setSelectedDateRange('This Year'); setDateRangeAnchorEl(null); }}>This Year</MenuItem>
              <MenuItem onClick={() => { setSelectedDateRange('All Time'); setDateRangeAnchorEl(null); }}>All Time</MenuItem>
            </Menu>
          </Box>
        )}
      </Box>
    </Box>
  );
}
