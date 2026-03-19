import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import { motion, AnimatePresence } from 'framer-motion';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { AssetNode } from '@/data/assetTree';
import { colors } from '@/colors';
import { BuildingFilterModeToggle, type BuildingFilterMode } from '@/components/BuildingSelector';

type MetricType = 'overall' | 'sustainability' | 'comfort' | 'asset_monitoring' | 'tickets' | 'quotations' | 'maintenance' | 'energy' | 'workspace' | 'compliance' | 'water_management' | 'security_systems' | 'access_control';

interface PageHeaderProps {
  currentPage?: 'home' | 'portfolio' | 'portfolio_overview' | 'insights' | 'bms' | 'operations' | 'operations_docs' | 'operations_tickets' | 'operations_quotations' | 'themes' | 'workspaces' | 'exports' | 'dashboards';
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
  onPageChange?: (page: 'home' | 'portfolio' | 'portfolio_overview' | 'insights' | 'bms' | 'operations' | 'operations_docs' | 'operations_tickets' | 'operations_quotations' | 'themes' | 'workspaces' | 'exports' | 'dashboards') => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onExport?: () => void;
  activeDashboardId?: string;
  activeDashboardLabel?: string;
  // Compact filter in header (shown when page title scrolls out of view)
  isFilterTitleScrolled?: boolean;
  filterSelectionLabel?: string;
  filterPeriodLabel?: string;
  filterBuildingLabel?: string;
  onFilterDateClick?: (e: React.MouseEvent<HTMLElement>) => void;
  onFilterBuildingClick?: (e: React.MouseEvent<HTMLElement>) => void;
  buildingFilterMode?: BuildingFilterMode;
  onBuildingFilterModeChange?: (mode: BuildingFilterMode) => void;
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
  onPageChange,
  isCollapsed = false,
  onToggleCollapse,
  onExport,
  activeDashboardId,
  activeDashboardLabel,
  isFilterTitleScrolled = false,
  filterSelectionLabel,
  filterPeriodLabel,
  filterBuildingLabel,
  onFilterDateClick,
  onFilterBuildingClick,
  buildingFilterMode = 'buildings',
  onBuildingFilterModeChange,
}: PageHeaderProps) {
  // Breadcrumb popover anchors
  const [buildingCaretAnchor, setBuildingCaretAnchor] = useState<null | HTMLElement>(null);
  const [groupCaretAnchor, setGroupCaretAnchor] = useState<null | HTMLElement>(null);
  const [childCaretAnchor, setChildCaretAnchor] = useState<null | HTMLElement>(null);

  // Determine page name based on current page and selections
  const getPageName = () => {
    if (currentPage === 'insights') return 'Insights';
    if (currentPage === 'themes') return 'Themes';
    if (currentPage === 'workspaces') return 'Workspaces';
    if (currentPage === 'exports') return 'Exports';
    if (currentPage === 'dashboards') return activeDashboardLabel ? `Dashboards - ${activeDashboardLabel}` : 'Dashboards';
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
        top: 0,
        left: effectiveLeft,
        right: rightSidebarWidth,
        height: 56,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.bgSecondary,
        zIndex: 1200,
        transition: 'left 0.3s ease, right 0.3s ease'
      }}
    >
      {/* Left: Collapse button + Breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          size="small"
          onClick={onToggleCollapse}
          sx={{ flexShrink: 0 }}
        >
          <MenuOpenIcon sx={{ transform: isCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
        </IconButton>
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
        {currentPage === 'portfolio' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={() => {
                if (selectedBuilding || selectedAsset) {
                  onAssetBack?.();
                  onBack?.();
                }
                onSelectionChange?.('overall');
              }}
            >
              Control Room
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {currentPage === 'home' && (
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>Home</Typography>
            )}
            {currentPage === 'insights' && (
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>Insights</Typography>
            )}
            {currentPage === 'portfolio_overview' && (
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>Portfolio</Typography>
            )}
            {currentPage === 'bms' && (
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>BMS</Typography>
            )}
            {currentPage === 'themes' && (
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>Themes</Typography>
            )}
            {currentPage === 'workspaces' && (
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>Workspaces</Typography>
            )}
            {currentPage === 'exports' && (
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>Exports</Typography>
            )}
            {currentPage === 'dashboards' && (
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>Dashboards</Typography>
            )}
            {currentPage === 'operations' && (
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>Operations</Typography>
            )}
            {currentPage?.startsWith('operations_') && (
              <>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, fontSize: '1rem', cursor: 'pointer', color: 'text.secondary', '&:hover': { textDecoration: 'underline', color: 'text.primary' } }}
                  onClick={() => onPageChange?.('operations')}
                >
                  Operations
                </Typography>
                <KeyboardArrowRightIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  {currentPage === 'operations_docs' ? 'Docs' : currentPage === 'operations_tickets' ? 'Tickets' : 'Quotations'}
                </Typography>
              </>
            )}
          </Box>
        )}

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
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                    onClick={showChildSegment ? () => {
                      const groupKey = isThemeChild ? 'themes_group' : 'operations_group';
                      onSelectionChange?.(groupKey);
                    } : (e) => setGroupCaretAnchor(e.currentTarget)}
                  >
                    {groupLabel}
                  </Typography>
                  {!showChildSegment && (
                    <>
                      <UnfoldMoreIcon
                        onClick={(e) => setGroupCaretAnchor(e.currentTarget as unknown as HTMLElement)}
                        sx={{ fontSize: 18, color: 'text.secondary', cursor: 'pointer' }}
                      />
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
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, fontSize: '1rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    onClick={(e) => setChildCaretAnchor(e.currentTarget)}
                  >
                    {childLabel}
                  </Typography>
                  <UnfoldMoreIcon
                    onClick={(e) => setChildCaretAnchor(e.currentTarget as unknown as HTMLElement)}
                    sx={{ fontSize: 18, color: 'text.secondary', cursor: 'pointer' }}
                  />
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

      {/* Center: Compact filter title (fades in when page title scrolls out of view) */}
      <AnimatePresence>
        {isFilterTitleScrolled && filterPeriodLabel && (
          <motion.div
            key="compact-filter"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', zIndex: 1200 }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                whiteSpace: 'nowrap',
              }}
            >
              Showing{filterSelectionLabel ? ` ${filterSelectionLabel} of` : ''}
              <Box
                component="span"
                onClick={onFilterDateClick}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  gap: '1px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: 'primary.main',
                  transition: 'opacity 0.2s ease',
                  '&:hover': { opacity: 0.7 },
                }}
              >
                {filterPeriodLabel}
                <KeyboardArrowDownIcon sx={{ fontSize: 14, verticalAlign: 'text-bottom', position: 'relative', top: '1px' }} />
              </Box>
              {filterBuildingLabel && (
                <>
                  for
                  <Box
                    component="span"
                    onClick={onFilterBuildingClick}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'baseline',
                      gap: '1px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: 'primary.main',
                      transition: 'opacity 0.2s ease',
                      '&:hover': { opacity: 0.7 },
                    }}
                  >
                    {filterBuildingLabel}
                    <KeyboardArrowDownIcon sx={{ fontSize: 14, verticalAlign: 'text-bottom', position: 'relative', top: '1px' }} />
                  </Box>
                </>
              )}
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right: Filters + Export + Favorite */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {/* Building/Cluster mode toggle */}
        {(currentPage === 'portfolio' || currentPage === 'dashboards') && onBuildingFilterModeChange && (
          <BuildingFilterModeToggle mode={buildingFilterMode} onModeChange={onBuildingFilterModeChange} />
        )}

        {/* Export Button — on Control Room and Dashboards */}
        {(currentPage === 'portfolio' || currentPage === 'dashboards') && (
          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={onExport}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderRadius: '6px',
              px: 2,
              height: 32,
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' }
            }}
          >
            Export
          </Button>
        )}

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
      </Box>
    </Box>
  );
}
