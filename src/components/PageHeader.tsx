import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import { motion, AnimatePresence } from 'framer-motion';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import Chip from '@mui/material/Chip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import TuneIcon from '@mui/icons-material/Tune';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { AssetNode } from '@/data/assetTree';
import { secondaryAlpha } from '@/colors';
import { useThemeMode } from '@/theme-mode-context';
import { ContractFilterToggle, type ContractFilter } from '@/components/BuildingSelector';

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
  // Filter chips in header
  filterPeriodLabel?: string;
  filterBuildingLabel?: string;
  onFilterDateClick?: (e: React.MouseEvent<HTMLElement>) => void;
  onFilterBuildingClick?: (e: React.MouseEvent<HTMLElement>) => void;
  contractFilter?: ContractFilter;
  onContractFilterChange?: (value: ContractFilter) => void;
  selectionScore?: number | null;
  metricItems?: Array<{ key: string; label: string; icon: React.ReactNode; score: number; group: 'themes' | 'operations' }>;
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

function PageHeader({
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
  filterPeriodLabel,
  filterBuildingLabel,
  onFilterDateClick,
  onFilterBuildingClick,
  contractFilter = false,
  onContractFilterChange,
  selectionScore,
  metricItems = [],
}: PageHeaderProps) {
  const { themeColors: c } = useThemeMode();
  const isNarrow = useMediaQuery('(max-width:960px)');
  // Breadcrumb popover anchors
  const [buildingCaretAnchor, setBuildingCaretAnchor] = useState<null | HTMLElement>(null);
  const [groupCaretAnchor, setGroupCaretAnchor] = useState<null | HTMLElement>(null);
  const [childCaretAnchor, setChildCaretAnchor] = useState<null | HTMLElement>(null);
  // Filter dropdown anchor
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);

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
        '@media (max-width: 926px)': { left: 0 },
        right: rightSidebarWidth,
        height: 56,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: c.bgSecondary,
        zIndex: 1200,
        transition: 'left 0.3s ease, right 0.3s ease',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Left: Collapse button + Breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          size="small"
          onClick={onToggleCollapse}
          sx={{ flexShrink: 0 }}
        >
          <MenuIcon sx={{ display: 'none', '@media (max-width: 926px)': { display: 'block' } }} />
          <MenuOpenIcon sx={{ display: 'block', '@media (max-width: 926px)': { display: 'none' }, transform: isCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
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

        {/* Root breadcrumb segment — hidden on narrow screens */}
        {isNarrow ? null : currentPage === 'portfolio' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                color: (selectedBuilding || selectedAsset || showGroupSegment) ? 'text.secondary' : 'text.primary',
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
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'text.primary', fontFamily: '"Inter", sans-serif' }}>Home</Typography>
            )}
            {currentPage === 'insights' && (
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'text.primary', fontFamily: '"Inter", sans-serif' }}>Insights</Typography>
            )}
            {currentPage === 'portfolio_overview' && (
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'text.primary', fontFamily: '"Inter", sans-serif' }}>Portfolio</Typography>
            )}
            {currentPage === 'bms' && (
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'text.primary', fontFamily: '"Inter", sans-serif' }}>BMS</Typography>
            )}
            {currentPage === 'themes' && (
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'text.primary', fontFamily: '"Inter", sans-serif' }}>Themes</Typography>
            )}
            {currentPage === 'workspaces' && (
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'text.primary', fontFamily: '"Inter", sans-serif' }}>Workspaces</Typography>
            )}
            {currentPage === 'exports' && (
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'text.primary', fontFamily: '"Inter", sans-serif' }}>Exports</Typography>
            )}
            {currentPage === 'dashboards' && (
              <>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: activeDashboardLabel ? 'text.secondary' : 'text.primary',
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  Dashboards
                </Typography>
                {activeDashboardLabel && (
                  <>
                    <KeyboardArrowRightIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'text.primary', fontFamily: '"Inter", sans-serif' }}>
                      {activeDashboardLabel}
                    </Typography>
                  </>
                )}
              </>
            )}
            {currentPage === 'operations' && (
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'text.primary', fontFamily: '"Inter", sans-serif' }}>Operations</Typography>
            )}
            {currentPage?.startsWith('operations_') && (
              <>
                <Typography
                  variant="h6"
                  sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', color: 'text.secondary', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => onPageChange?.('operations')}
                >
                  Operations
                </Typography>
                <KeyboardArrowRightIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'text.primary', fontFamily: '"Inter", sans-serif' }}>
                  {currentPage === 'operations_docs' ? 'Docs' : currentPage === 'operations_tickets' ? 'Tickets' : 'Quotations'}
                </Typography>
              </>
            )}
          </Box>
        )}

        {/* Smart contextual breadcrumbs for Portfolio page */}
        {!isNarrow && currentPage === 'portfolio' && (
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
                  <KeyboardArrowRightIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  <ApartmentOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Inter", sans-serif',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      color: (selectedAsset?.type === 'asset' || showGroupSegment) ? 'text.secondary' : 'text.primary',
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
                  <KeyboardArrowRightIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  <Typography variant="h6" sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: '0.8rem', color: showGroupSegment ? 'text.secondary' : 'text.primary' }}>
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
                  <KeyboardArrowRightIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Inter", sans-serif',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      color: showChildSegment ? 'text.secondary' : 'text.primary',
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
                  <KeyboardArrowRightIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  <Box
                    onClick={(e) => setChildCaretAnchor(e.currentTarget)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      cursor: 'pointer', px: 1, py: 0.5, mx: -1, borderRadius: 1,
                      transition: 'background-color 0.15s ease',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    {(() => {
                      const currentItem = metricItems.find(m => m.key === selection);
                      return currentItem ? <Box sx={{ display: 'flex', color: 'text.secondary', fontSize: 20 }}>{currentItem.icon}</Box> : null;
                    })()}
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'text.primary', fontFamily: '"Inter", sans-serif' }}>
                      {childLabel}
                    </Typography>
                    {selectionScore != null && (
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary' }}>
                        {selectionScore}%
                      </Typography>
                    )}
                    <UnfoldMoreIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </Box>
                  <Menu
                    anchorEl={childCaretAnchor}
                    open={Boolean(childCaretAnchor)}
                    onClose={() => setChildCaretAnchor(null)}
                    slotProps={{ paper: { sx: { minWidth: 240 } } }}
                  >
                    {metricItems.length > 0 ? (
                      <>
                        {metricItems.filter(m => m.group === 'themes').map((item) => (
                          <MenuItem
                            key={item.key}
                            selected={selection === item.key}
                            onClick={() => { onSelectionChange?.(item.key); setChildCaretAnchor(null); }}
                            sx={{ py: 1 }}
                          >
                            <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>{item.icon}</ListItemIcon>
                            <ListItemText>{item.label}</ListItemText>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: item.score >= 80 ? c.statusGood : item.score >= 60 ? c.statusModerate : c.statusPoor, ml: 2 }}>{item.score}%</Typography>
                          </MenuItem>
                        ))}
                        <Divider />
                        {metricItems.filter(m => m.group === 'operations').map((item) => (
                          <MenuItem
                            key={item.key}
                            selected={selection === item.key}
                            onClick={() => { onSelectionChange?.(item.key); setChildCaretAnchor(null); }}
                            sx={{ py: 1 }}
                          >
                            <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>{item.icon}</ListItemIcon>
                            <ListItemText>{item.label}</ListItemText>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: item.score >= 80 ? c.statusGood : item.score >= 60 ? c.statusModerate : c.statusPoor, ml: 2 }}>{item.score}%</Typography>
                          </MenuItem>
                        ))}
                      </>
                    ) : (
                      siblingEntries.map(([key, label]) => (
                        <MenuItem
                          key={key}
                          selected={selection === key}
                          onClick={() => { onSelectionChange?.(key); setChildCaretAnchor(null); }}
                        >
                          {label}
                        </MenuItem>
                      ))
                    )}
                  </Menu>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </Box>

      {/* Right: Filter chips + Export + Favorite */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {/* Narrow: combined filter dropdown */}
        {isNarrow && ((filterBuildingLabel && onFilterBuildingClick) || (filterPeriodLabel && onFilterDateClick)) && (
          <>
            <Chip
              icon={<TuneIcon sx={{ fontSize: 16 }} />}
              label="Filters"
              onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
              deleteIcon={<ExpandMoreIcon />}
              onDelete={(e) => setFilterMenuAnchor((e as any).currentTarget?.closest('.MuiChip-root') || filterMenuAnchor)}
              sx={{
                height: 32,
                borderRadius: '6px',
                backgroundColor: c.bgPrimary,
                border: '1px solid',
                borderColor: c.borderPrimary,
                boxShadow: `0 1px 3px ${c.shadow}`,
                '&:hover': { backgroundColor: c.bgPrimaryHover },
                '& .MuiChip-label': { px: 1.5, fontSize: '0.8125rem', fontWeight: 600 },
                '& .MuiChip-deleteIcon': { color: 'text.primary' },
                '& .MuiChip-icon': { color: 'text.primary', ml: 1 },
              }}
            />
            <Menu
              anchorEl={filterMenuAnchor}
              open={Boolean(filterMenuAnchor)}
              onClose={() => setFilterMenuAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{ paper: { sx: { mt: 0.5, minWidth: 200, borderRadius: '8px', boxShadow: `0 4px 20px ${c.shadow}` } } }}
            >
              {filterBuildingLabel && onFilterBuildingClick && (
                <MenuItem
                  onClick={(e) => {
                    setFilterMenuAnchor(null);
                    onFilterBuildingClick(e);
                  }}
                  sx={{ fontSize: '0.875rem', py: 1 }}
                >
                  <ListItemIcon><ApartmentOutlinedIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>{filterBuildingLabel}</ListItemText>
                </MenuItem>
              )}
              {filterPeriodLabel && onFilterDateClick && (
                <MenuItem
                  onClick={(e) => {
                    setFilterMenuAnchor(null);
                    onFilterDateClick(e);
                  }}
                  sx={{ fontSize: '0.875rem', py: 1 }}
                >
                  <ListItemIcon><CalendarTodayOutlinedIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>{filterPeriodLabel}</ListItemText>
                </MenuItem>
              )}
            </Menu>
          </>
        )}
        {/* Wide: individual filter chips */}
        {!isNarrow && filterBuildingLabel && onFilterBuildingClick && (
          <Chip
            label={filterBuildingLabel}
            onClick={onFilterBuildingClick}
            deleteIcon={<ExpandMoreIcon />}
            onDelete={onFilterBuildingClick as any}
            sx={{
              height: 32,
              borderRadius: '6px',
              backgroundColor: c.bgPrimary,
              border: '1px solid',
              borderColor: c.borderPrimary,
              boxShadow: `0 1px 3px ${c.shadow}`,
              '&:hover': { backgroundColor: c.bgPrimaryHover },
              '& .MuiChip-label': { px: 1.5, fontSize: '0.8125rem', fontWeight: 600 },
              '& .MuiChip-deleteIcon': { color: 'text.primary' },
            }}
          />
        )}
        {!isNarrow && filterPeriodLabel && onFilterDateClick && (
          <Chip
            label={filterPeriodLabel}
            onClick={onFilterDateClick}
            deleteIcon={<ExpandMoreIcon />}
            onDelete={onFilterDateClick as any}
            sx={{
              height: 32,
              borderRadius: '6px',
              backgroundColor: c.bgPrimary,
              border: '1px solid',
              borderColor: c.borderPrimary,
              boxShadow: `0 1px 3px ${c.shadow}`,
              '&:hover': { backgroundColor: c.bgPrimaryHover },
              '& .MuiChip-label': { px: 1.5, fontSize: '0.8125rem', fontWeight: 600 },
              '& .MuiChip-deleteIcon': { color: 'text.primary' },
            }}
          />
        )}
        {/* Export Button — on Control Room and Dashboards */}
        {(currentPage === 'portfolio' || currentPage === 'dashboards') && (
          isNarrow ? (
            <Tooltip title="Export">
              <IconButton
                size="small"
                onClick={onExport}
                sx={{
                  borderRadius: '6px',
                  width: 32,
                  height: 32,
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { backgroundColor: 'primary.dark' },
                }}
              >
                <FileDownloadOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
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
          )
        )}

        {/* Favorite Icon */}
        <IconButton
          size="small"
          onClick={handleFavoriteToggle}
          sx={{
            color: isFavorited ? 'primary.main' : 'text.secondary',
            '&:hover': {
              bgcolor: isFavorited ? secondaryAlpha(0.08) : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          {isFavorited ? <StarIcon fontSize="small" /> : <StarOutlineIcon fontSize="small" />}
        </IconButton>
      </Box>
    </Box>
  );
}

export default React.memo(PageHeader);
