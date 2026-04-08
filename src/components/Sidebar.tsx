import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import BuildingIcon from '@mui/icons-material/Domain';
import MonitorHeartOutlined from '@mui/icons-material/MonitorHeartOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import NatureOutlinedIcon from '@mui/icons-material/NatureOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import SettingsInputComponentOutlinedIcon from '@mui/icons-material/SettingsInputComponentOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SearchModal from '@/components/SearchModal';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import Badge from '@mui/material/Badge';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Popover from '@mui/material/Popover';
import Avatar from '@mui/material/Avatar';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import { buildings, Building, tenants, tenantLogos } from '@/data/buildings';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import SettingsBrightnessOutlined from '@mui/icons-material/SettingsBrightnessOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import { useThemeMode } from '@/theme-mode-context';

interface Favorite {
  id: string;
  name: string;
  type: string;
}

interface SidebarProps {
  selectedBuilding?: Building | null;
  selectedMetric?: string;
  onBuildingSelect?: (building: Building | null) => void;
  onMetricSelect?: (metric: string) => void;
  favorites?: Favorite[];
  onFavoritesChange?: (favorites: Favorite[]) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  currentPage?: 'home' | 'portfolio' | 'portfolio_overview' | 'building_detail' | 'insights' | 'bms' | 'operations' | 'operations_docs' | 'operations_tickets' | 'operations_quotations' | 'operations_maintenance' | 'themes' | 'workspaces' | 'exports' | 'dashboards';
  onPageChange?: (page: 'home' | 'portfolio' | 'portfolio_overview' | 'building_detail' | 'insights' | 'bms' | 'operations' | 'operations_docs' | 'operations_tickets' | 'operations_quotations' | 'operations_maintenance' | 'themes' | 'workspaces' | 'exports' | 'dashboards') => void;
  onAssetExplorerToggle?: () => void;
  isAssetExplorerOpen?: boolean;
  selection?: string;
  onSelectionChange?: (selection: string) => void;
  notificationsPanelOpen?: boolean;
  onNotificationsPanelToggle?: () => void;
  hasUnreadNotifications?: boolean;
  dataExplorerOpen?: boolean;
  onDataExplorerToggle?: () => void;
  onDashboardNavigate?: (dashboardId: string) => void;
  selectedTenant?: string;
  onTenantChange?: (tenant: string) => void;
}

interface NavItemProps {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
  shortcut?: string;
  expanded?: boolean;
  onToggleExpand?: () => void;
  size?: number;
  iconBoxBgColor?: string;
  alwaysAccent?: boolean;
  buttonRef?: React.Ref<HTMLDivElement>;
}

function NavItem({ label, icon, active, onClick, shortcut, expanded, onToggleExpand, size = 28, iconBoxBgColor, alwaysAccent, buttonRef }: NavItemProps) {
  const { themeColors: c } = useThemeMode();
  const hasChevron = onToggleExpand !== undefined;
  const isDot = !icon && !alwaysAccent;
  const accentColor = c.brand;
  const isAccent = active || alwaysAccent;

  return (
    <ListItem disablePadding>
      <ListItemButton
        ref={buttonRef}
        onClick={onClick}
        sx={{
          height: 40,
          paddingLeft: '4px',
          gap: 1,
          borderRadius: '6px',
          backgroundColor: active ? c.bgActive : 'transparent',
          transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: active ? c.bgActiveHover : c.bgPrimaryHover,
          },
          ...(hasChevron && {
            '&:hover .nav-icon': { opacity: 0 },
            '&:hover .nav-chevron': { opacity: 1 },
          }),
        }}
      >
        {isDot ? (
          <Box sx={{ width: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: active ? accentColor : '#bdbdbd' }} />
          </Box>
        ) : hasChevron ? (
          <Box
            onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
            sx={{
              width: size, height: size,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, position: 'relative', cursor: 'pointer',
            }}
          >
            <Box className="nav-icon" sx={{ display: 'flex', transition: 'opacity 0.2s', color: isAccent ? accentColor : undefined }}>
              {icon}
            </Box>
            <ExpandMoreIcon
              className="nav-chevron"
              sx={{
                fontSize: size === 28 ? 18 : 16,
                position: 'absolute', opacity: 0,
                transition: 'opacity 0.2s, transform 0.3s',
                transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                color: isAccent ? accentColor : undefined,
              }}
            />
          </Box>
        ) : (
          <Box sx={{
            width: size, height: size,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, color: isAccent ? accentColor : undefined,
          }}>
            {icon}
          </Box>
        )}
        <ListItemText
          primary={label}
          primaryTypographyProps={{
            variant: 'body2',
            fontWeight: (icon || active || alwaysAccent) ? 600 : 400,
            color: isAccent ? accentColor : undefined,
          }}
        />
        {shortcut && (
          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.disabled', bgcolor: c.bgSecondaryHover, px: 0.75, py: 0.25, borderRadius: '4px', fontWeight: 500, letterSpacing: 0, flexShrink: 0 }}>
            {shortcut}
          </Typography>
        )}
      </ListItemButton>
    </ListItem>
  );
}

interface SortableFavoriteItemProps {
  favorite: Favorite;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onRemove: () => void;
}

function SortableFavoriteItem({ favorite, isHovered, onMouseEnter, onMouseLeave, onRemove }: SortableFavoriteItemProps) {
  const { themeColors: c } = useThemeMode();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: favorite.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      disablePadding
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      sx={{ position: 'relative' }}
    >
      {/* Fade to white on right edge when hovered */}
      {isHovered && (
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 40,
            background: `linear-gradient(to right, transparent, ${c.bgPrimary})`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      <ListItemButton sx={{ height: 40, pl: '4px', gap: 1, borderRadius: '6px', position: 'relative', overflow: 'hidden' }}>
        {/* Drag Handle - appears on left on hover */}
        <Box
          {...attributes}
          {...listeners}
          sx={{
            position: 'absolute',
            left: isHovered ? 4 : -24,
            width: 16,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'grab',
            opacity: isHovered ? 1 : 0,
            transition: 'all 0.2s ease',
            zIndex: 2,
            '&:active': {
              cursor: 'grabbing'
            }
          }}
        >
          <DragIndicatorIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
        </Box>

        {/* Content container - shifts right on hover */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flex: 1,
            minWidth: 0,
            transform: isHovered ? 'translateX(20px)' : 'translateX(0)',
            transition: 'transform 0.2s ease',
          }}
        >
          <ListItemIcon sx={{ minWidth: 24 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                bgcolor: isHovered ? '#ffebee' : 'transparent',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background-color 0.2s ease',
                cursor: isHovered ? 'pointer' : 'default',
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (isHovered) {
                  onRemove();
                }
              }}
            >
              {isHovered ? (
                <CloseIcon sx={{ fontSize: 14, color: '#d32f2f' }} />
              ) : (
                favorite.type === 'building' ? <BuildingIcon sx={{ fontSize: 16, color: 'text.secondary' }} /> :
                favorite.type === 'asset' ? <AccountTreeOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} /> :
                favorite.type === 'dashboard' ? <DashboardOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} /> :
                <AssignmentOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              )}
            </Box>
          </ListItemIcon>
          <ListItemText
            primary={favorite.name}
            primaryTypographyProps={{ variant: 'body2' }}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          />
        </Box>
      </ListItemButton>
    </ListItem>
  );
}

function Sidebar({ selectedBuilding, selectedMetric, onBuildingSelect, onMetricSelect, favorites: externalFavorites, onFavoritesChange, isCollapsed = false, onToggleCollapse, currentPage = 'portfolio', onPageChange, onAssetExplorerToggle, isAssetExplorerOpen = false, selection, onSelectionChange, notificationsPanelOpen = false, onNotificationsPanelToggle, hasUnreadNotifications = false, dataExplorerOpen = false, onDataExplorerToggle, onDashboardNavigate, selectedTenant, onTenantChange }: SidebarProps) {
  const selectedCustomer = selectedTenant ?? tenants[0];
  const setSelectedCustomer = (t: string) => onTenantChange?.(t);
  const [searchQuery, setSearchQuery] = useState('');
  const [modifierHeld, setModifierHeld] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredBuildings, setFilteredBuildings] = useState(buildings);
  const [customerAnchorEl, setCustomerAnchorEl] = useState<null | HTMLElement>(null);
  const [newMenuAnchorEl, setNewMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);
  const { preference: themePreference, setThemePreference, themeColors: c } = useThemeMode();
  const newButtonRef = useRef<HTMLDivElement>(null);
  const [operationsExpanded, setOperationsExpanded] = useState(() => Boolean(currentPage?.startsWith('operations')));

  const NEW_MENU_ITEMS = [
    { label: 'Report issue', key: '1' },
    { label: 'Request quote', key: '2' },
    { label: 'Service request', key: '3' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setSearchModalOpen(true);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setNewMenuAnchorEl(newButtonRef.current);
        return;
      }

      if (newMenuAnchorEl && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault();
        setNewMenuAnchorEl(null);
        // Action: console.log for now, wire up real handlers later
        console.log('New menu shortcut:', NEW_MENU_ITEMS[Number(e.key) - 1]?.label);
      }
    };
    const handleModifier = (e: KeyboardEvent) => {
      setModifierHeld(e.metaKey || e.ctrlKey);
    };
    const handleBlur = () => setModifierHeld(false);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleModifier);
    document.addEventListener('keyup', handleModifier);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleModifier);
      document.removeEventListener('keyup', handleModifier);
      window.removeEventListener('blur', handleBlur);
    };
  }, [newMenuAnchorEl]);

  const safeTriangleCleanupRef = useRef<(() => void) | null>(null);

  const isPointInTriangle = (px: number, py: number, ax: number, ay: number, bx: number, by: number, cx: number, cy: number) => {
    const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
    const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
    const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
    return !(hasNeg && hasPos);
  };

  const handleSubmenuTriggerLeave = (
    e: React.MouseEvent,
    popoverAttr: string,
    setAnchor: (el: HTMLElement | null) => void
  ) => {
    // Clean up any existing listener
    safeTriangleCleanupRef.current?.();

    const exitPoint = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (ev: MouseEvent) => {
      const popoverEl = document.querySelector(`[data-popover="${popoverAttr}"]`) as HTMLElement | null;
      if (!popoverEl) {
        setAnchor(null);
        cleanup();
        return;
      }

      const rect = popoverEl.getBoundingClientRect();
      const mx = ev.clientX;
      const my = ev.clientY;

      // If mouse entered the popover, stop tracking
      if (mx >= rect.left && mx <= rect.right && my >= rect.top && my <= rect.bottom) {
        cleanup();
        return;
      }

      // Safe triangle: from exit point to top-left and bottom-left of popover (with padding)
      const inTriangle = isPointInTriangle(
        mx, my,
        exitPoint.x, exitPoint.y,
        rect.left, rect.top - 20,
        rect.left, rect.bottom + 20
      );

      if (!inTriangle) {
        setAnchor(null);
        cleanup();
      }
    };

    const cleanup = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      safeTriangleCleanupRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    safeTriangleCleanupRef.current = cleanup;
  };
  const [hoveredFavorite, setHoveredFavorite] = useState<string | null>(null);
  const [favoritesHeight, setFavoritesHeight] = useState(120);
  const [internalFavorites, setInternalFavorites] = useState<Favorite[]>([
    { id: '1', name: 'Skyline Plaza', type: 'building' },
    { id: '2', name: 'Aanpassen verlichting', type: 'task' },
    { id: '3', name: 'Reparatie toilet 1e ver', type: 'task' },
  ]);

  const buildingsListRef = useRef<HTMLUListElement>(null);

  // Use external favorites if provided, otherwise use internal state
  const favorites = externalFavorites || internalFavorites;

  // Sync expanded building with selected building
  const expandedBuilding = selectedBuilding?.name || null;

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const customers = tenants.map(name => ({ name }));

  const tenantBuildings = buildings.filter(b => b.tenant === selectedCustomer);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBuildings(tenantBuildings);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      const filtered = tenantBuildings.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBuildings(filtered);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCustomer]);

  const buildingMenuItems = [
    { label: 'Overview', icon: AssignmentOutlinedIcon, metric: 'overall' },
    { label: 'Sustainability', icon: NatureOutlinedIcon, metric: 'sustainability' },
    { label: 'Comfort', icon: SpaOutlinedIcon, metric: 'comfort' },
    { label: 'Asset Monitoring', icon: SecurityOutlinedIcon, metric: 'asset_monitoring' },
    { label: 'Tickets', icon: ShowChartOutlinedIcon, metric: 'tickets' },
    { label: 'Quotations', icon: RequestQuoteOutlinedIcon, metric: 'quotations' },
    { label: 'Maintenance', icon: BuildOutlinedIcon, metric: 'maintenance' },
  ];

  const handleBuildingClick = (building: Building) => {
    if (selectedBuilding?.name === building.name) {
      // If clicking the same building, close it
      onBuildingSelect?.(null);
    } else {
      // Open the building detail
      onBuildingSelect?.(building);
      // Scroll to top of buildings list
      setTimeout(() => {
        buildingsListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleMenuItemClick = (metric: string) => {
    onMetricSelect?.(metric as any);
  };

  const handleRemoveFavorite = (favoriteId: string) => {
    const newFavorites = favorites.filter(fav => fav.id !== favoriteId);
    if (onFavoritesChange) {
      onFavoritesChange(newFavorites);
    } else {
      setInternalFavorites(newFavorites);
    }
  };

  const handleSectionResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = favoritesHeight;
    const onMouseMove = (ev: MouseEvent) => {
      const delta = startY - ev.clientY;
      setFavoritesHeight(Math.max(44, Math.min(320, startHeight + delta)));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = favorites.findIndex((fav) => fav.id === active.id);
      const newIndex = favorites.findIndex((fav) => fav.id === over.id);
      const newFavorites = arrayMove(favorites, oldIndex, newIndex);

      if (onFavoritesChange) {
        onFavoritesChange(newFavorites);
      } else {
        setInternalFavorites(newFavorites);
      }
    }
  };

  // Scroll to top when building is selected from elsewhere
  useEffect(() => {
    if (selectedBuilding && buildingsListRef.current) {
      buildingsListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedBuilding]);

  return (
    <Box sx={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      bgcolor: c.bgPrimary,
      borderRight: 1,
      borderColor: 'divider',
      transition: 'width 0.3s ease',
      // Collapsed state — hide labels, favorites, shortcuts; center icons
      ...(isCollapsed && {
        '& .MuiListItemText-root': { display: 'none' },
        '& .sidebar-hide-collapsed': { display: 'none !important' },
        '& .MuiListItemButton-root': { justifyContent: 'center', pl: 1.5, pr: 1.5 },
        '& .sidebar-logo-full': { display: 'none' },
        '& .sidebar-logo-icon': { display: 'block !important' },
      }),
    }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {/* Tenant selector */}
          <Box sx={{ height: 56, display: 'flex', alignItems: 'center', px: isCollapsed ? 1.5 : 2, justifyContent: isCollapsed ? 'center' : 'flex-start', flexShrink: 0 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', gap: 1, flex: isCollapsed ? undefined : 1, cursor: 'pointer', px: 0.5, py: 1, borderRadius: '6px', transition: 'background-color 0.2s', '&:hover': { backgroundColor: c.bgPrimaryHover } }}
              onClick={(e) => setCustomerAnchorEl(e.currentTarget)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: isCollapsed ? undefined : 1 }}>
                <Box sx={{ width: 24, height: 24, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', bgcolor: c.bgSecondaryHover }}>
                  <img src={tenantLogos[selectedCustomer]} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                </Box>
                <Typography className="sidebar-hide-collapsed" variant="subtitle1" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedCustomer}
                </Typography>
              </Box>
              <IconButton
                className="sidebar-hide-collapsed"
                size="small"
                sx={{ flexShrink: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCustomerAnchorEl(e.currentTarget);
                }}
              >
                <UnfoldMoreIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          {/* Scrollable nav section */}
          <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflowY: 'auto', px: isCollapsed ? 1.5 : 2, pt: 0, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-track': { background: 'transparent' }, '&::-webkit-scrollbar-thumb': { background: 'transparent', borderRadius: '4px', transition: 'background 0.2s ease' }, '&:hover::-webkit-scrollbar-thumb': { background: '#ccc' } }}>
            <List data-annotation-id="sidebar-lijst-3" sx={{ py: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <NavItem
              label="New"
              icon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={(e) => setNewMenuAnchorEl(e?.currentTarget as HTMLElement)}
              shortcut={modifierHeld ? 'N' : undefined}
              iconBoxBgColor="#eef2ff"
              alwaysAccent
              buttonRef={newButtonRef as React.Ref<HTMLDivElement>}
            />
            <NavItem
              label="Search"
              icon={<SearchIcon sx={{ fontSize: 16 }} />}
              onClick={() => setSearchModalOpen(true)}
              shortcut={modifierHeld ? 'F' : undefined}
            />
            <Divider sx={{ my: 1.5 }} />
            <NavItem
              label="Home"
              icon={<HomeOutlinedIcon sx={{ fontSize: 16 }} />}
              active={currentPage === 'home'}
              onClick={() => onPageChange?.('home')}
            />
            <NavItem
              label="Control Room"
              icon={<MonitorHeartOutlined sx={{ fontSize: 16 }} />}
              active={currentPage === 'portfolio'}
              onClick={() => onPageChange?.('portfolio')}
            />
            <NavItem
              label="Insights"
              icon={<TipsAndUpdatesOutlinedIcon sx={{ fontSize: 16 }} />}
              active={currentPage === 'insights'}
              onClick={() => onPageChange?.('insights')}
            />
            <NavItem
              label="Portfolio"
              icon={<ApartmentOutlinedIcon sx={{ fontSize: 16 }} />}
              active={currentPage === 'portfolio_overview' || currentPage === 'building_detail'}
              onClick={() => onPageChange?.('portfolio_overview')}
            />
            <NavItem
              label="Operations"
              icon={<EngineeringOutlinedIcon sx={{ fontSize: 16 }} />}
              active={currentPage?.startsWith('operations')}
              onClick={() => { onPageChange?.('operations_tickets'); setOperationsExpanded(true); }}
              expanded={operationsExpanded}
              onToggleExpand={() => setOperationsExpanded((v) => !v)}
            />
            {!isCollapsed && operationsExpanded && (
              <>
                <NavItem label="Tickets" active={currentPage === 'operations_tickets'} onClick={() => onPageChange?.('operations_tickets')} />
                <NavItem label="Quotations" active={currentPage === 'operations_quotations'} onClick={() => onPageChange?.('operations_quotations')} />
                <NavItem label="Documents" active={currentPage === 'operations_docs'} onClick={() => onPageChange?.('operations_docs')} />
                <NavItem label="Maintenance" active={currentPage === 'operations_maintenance'} onClick={() => onPageChange?.('operations_maintenance')} />
              </>
            )}
            <NavItem
              label="Dashboards"
              icon={<DashboardOutlinedIcon sx={{ fontSize: 16 }} />}
              active={currentPage === 'dashboards'}
              onClick={() => onPageChange?.('dashboards')}
            />
            <NavItem
              label="BMS"
              icon={<SettingsInputComponentOutlinedIcon sx={{ fontSize: 16 }} />}
              active={currentPage === 'bms'}
              onClick={() => onPageChange?.('bms')}
            />
          </List>
            </Box>
          </Box>
          {/* Drag handle + Favorites — hidden when collapsed */}
            <Box className="sidebar-hide-collapsed"
              onMouseDown={handleSectionResize}
              sx={{ height: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'ns-resize', userSelect: 'none', '&:hover': { bgcolor: c.bgPrimaryHover }, '&:hover .resize-icon': { opacity: 0.6 } }}
            >
              <Box className="resize-icon" sx={{ opacity: 0.2, lineHeight: 0, transition: 'opacity 0.15s' }}>
                <DragIndicatorIcon sx={{ fontSize: 14, color: 'text.secondary', transform: 'rotate(90deg)' }} />
              </Box>
            </Box>
            <Box className="sidebar-hide-collapsed" sx={{ height: favoritesHeight, flexShrink: 0, overflowY: 'auto', overflowX: 'hidden', px: 2, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-track': { background: 'transparent' }, '&::-webkit-scrollbar-thumb': { background: 'transparent', borderRadius: '4px' }, '&:hover::-webkit-scrollbar-thumb': { background: '#ccc' } }}>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>Favorites</Typography>
              <DndContext id="sidebar-favorites" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={favorites.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  <List data-annotation-id="sidebar-lijst-2" dense sx={{ py: 0 }}>
                    {favorites.map((fav) => (
                      <SortableFavoriteItem
                        key={fav.id}
                        favorite={fav}
                        isHovered={hoveredFavorite === fav.id}
                        onMouseEnter={() => setHoveredFavorite(fav.id)}
                        onMouseLeave={() => setHoveredFavorite(null)}
                        onRemove={() => handleRemoveFavorite(fav.id)}
                      />
                    ))}
                  </List>
                </SortableContext>
              </DndContext>
            </Box>
            {/* Bottom sticky: Notifications, Help, Account */}
            <Box sx={{ flexShrink: 0, px: isCollapsed ? 1.5 : 2, pt: 1, pb: 0.5 }}>
              <Divider sx={{ mb: 1 }} />
              <List data-annotation-id="sidebar-lijst" dense sx={{ py: 0 }}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => onNotificationsPanelToggle?.()}
                    sx={{ height: 40, paddingLeft: '4px', gap: 1, borderRadius: '6px', bgcolor: notificationsPanelOpen ? c.bgSecondaryHover : 'transparent', '&:hover': { backgroundColor: c.bgPrimaryHover } }}
                  >
                    <Box sx={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Badge color="error" variant="dot" invisible={!hasUnreadNotifications} sx={{ '& .MuiBadge-badge': { width: 8, height: 8, minWidth: 8, top: 2, right: 2 } }}>
                        <NotificationsOutlinedIcon sx={{ fontSize: 16 }} />
                      </Badge>
                    </Box>
                    <ListItemText primary="Notifications" primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton sx={{ height: 40, paddingLeft: '4px', gap: 1, borderRadius: '6px', '&:hover': { backgroundColor: c.bgPrimaryHover } }}>
                    <Box sx={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <HelpOutlineIcon sx={{ fontSize: 16 }} />
                    </Box>
                    <ListItemText primary="Help" primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    id="appearance-toggle"
                    onMouseEnter={(e) => {
                      safeTriangleCleanupRef.current?.();
                      setUserAnchorEl(e.currentTarget);
                    }}
                    onMouseLeave={(e) => handleSubmenuTriggerLeave(e, 'account-menu', setUserAnchorEl)}
                    sx={{ height: 40, paddingLeft: '4px', gap: 1, borderRadius: '6px', '&:hover': { backgroundColor: c.bgPrimaryHover } }}
                  >
                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#c084fc', fontSize: '0.75rem', fontWeight: 600 }}>A</Avatar>
                    <ListItemText primary="Account" primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>
            {/* Logo */}
            <Box sx={{ px: isCollapsed ? 0 : 2.5, pt: 0.5, pb: 1.5, flexShrink: 0, display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
              <img className="sidebar-logo-full" src="/images/pulse-core-logo.svg" alt="Pulse Core" style={{ height: 24, opacity: 0.5 }} />
              <img className="sidebar-logo-icon" src="/images/pulse-core-icon.svg" alt="Pulse Core" style={{ height: 24, opacity: 0.5, display: 'none' }} />
            </Box>
        </Box>

      {/* "+ New" dropdown */}
      <Menu
        anchorEl={newMenuAnchorEl}
        open={Boolean(newMenuAnchorEl)}
        onClose={() => setNewMenuAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { mt: 0.5, minWidth: 260, borderRadius: '10px', py: 0.5 } } }}
        sx={{ zIndex: 1600 }}
      >
        <Typography variant="caption" sx={{ display: 'block', px: 2, pt: 1, pb: 0.5, color: 'text.secondary', fontWeight: 500, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Create new
        </Typography>
        {NEW_MENU_ITEMS.map((item, i) => (
          <MenuItem
            key={item.key}
            onClick={() => setNewMenuAnchorEl(null)}
            sx={{ py: 1, px: 2, gap: 1, borderRadius: '6px', mx: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 0 }}>
              {i === 0 ? <ReportProblemOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} /> :
               i === 1 ? <RequestQuoteOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} /> :
               <EngineeringOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ variant: 'body2', fontSize: '0.875rem' }}
              sx={{ flex: 1 }}
            />
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.disabled', bgcolor: c.bgSecondaryHover, px: 0.75, py: 0.25, borderRadius: '4px', fontWeight: 500, flexShrink: 0 }}>
              Press {item.key}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
      <Menu
        anchorEl={customerAnchorEl}
        open={Boolean(customerAnchorEl)}
        onClose={() => setCustomerAnchorEl(null)}
        PaperProps={{ sx: { minWidth: 280, p: 1, zIndex: 1500 } }}
        slotProps={{ root: { style: { zIndex: 1500 } } }}
      >
        {customers.map((customer) => (
          <MenuItem
            key={customer.name}
            onClick={() => { setSelectedCustomer(customer.name); setCustomerAnchorEl(null); }}
            selected={selectedCustomer === customer.name}
            sx={{
              display: 'flex', gap: 1, py: 0.75, px: 1.5, mx: 0.5, borderRadius: '6px',
              '&:hover': { backgroundColor: c.bgPrimaryHover },
              '&.Mui-selected': { backgroundColor: c.bgActive, '&:hover': { backgroundColor: c.bgActiveHover } }
            }}
          >
            <Box sx={{ width: 24, height: 24, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', bgcolor: c.bgSecondaryHover }}>
              <img src={tenantLogos[customer.name]} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{customer.name}</Typography>
          </MenuItem>
        ))}
      </Menu>
      {/* Account popover — shared between expanded and collapsed */}
      <Popover
        open={Boolean(userAnchorEl)}
        anchorEl={userAnchorEl}
        onClose={() => setUserAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        disableRestoreFocus
        slotProps={{
          paper: {
            'data-popover': 'account-menu',
            onMouseLeave: () => { safeTriangleCleanupRef.current?.(); setUserAnchorEl(null); },
            sx: { ml: 1, p: 1, minWidth: 200, borderRadius: '8px' }
          } as any
        }}
        sx={{ zIndex: 1600, pointerEvents: 'none', '& .MuiPopover-paper': { pointerEvents: 'auto' } }}
      >
        <Box sx={{ px: 1.5, py: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Admin User</Typography>
          <Typography variant="caption" color="text.secondary">admin@spie.com</Typography>
        </Box>
        <Divider sx={{ my: 0.5 }} />
        <Box sx={{ px: 1.5, py: 0.75 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Appearance</Typography>
          <ToggleButtonGroup
            value={themePreference}
            exclusive
            onChange={(_, val) => { if (val) setThemePreference(val); }}
            size="small"
            fullWidth
            sx={{ mt: 0.75, '& .MuiToggleButton-root': { textTransform: 'none', fontSize: '0.75rem', py: 0.5, gap: 0.5 } }}
          >
            <ToggleButton value="system"><SettingsBrightnessOutlined sx={{ fontSize: 16 }} />System</ToggleButton>
            <ToggleButton value="light"><LightModeOutlined sx={{ fontSize: 16 }} />Light</ToggleButton>
            <ToggleButton value="dark"><DarkModeOutlined sx={{ fontSize: 16 }} />Dark</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => { setUserAnchorEl(null); }} sx={{ borderRadius: '6px', fontSize: '0.875rem', minHeight: 32 }}>Settings</MenuItem>
        <MenuItem onClick={() => { setUserAnchorEl(null); onPageChange?.('exports'); }} sx={{ borderRadius: '6px', fontSize: '0.875rem', minHeight: 32 }}>Exports</MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => setUserAnchorEl(null)} sx={{ borderRadius: '6px', fontSize: '0.875rem', minHeight: 32 }}>Logout</MenuItem>
      </Popover>
      <SearchModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} onNavigate={(page, dashboardId) => { onPageChange?.(page as any); if (dashboardId) onDashboardNavigate?.(dashboardId); }} />
    </Box>
  );
}

export default React.memo(Sidebar);
