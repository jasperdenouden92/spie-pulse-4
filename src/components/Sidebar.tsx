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
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import BuildingIcon from '@mui/icons-material/Domain';
import MonitorHeartOutlined from '@mui/icons-material/MonitorHeartOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import NatureOutlinedIcon from '@mui/icons-material/NatureOutlined';
import AirOutlinedIcon from '@mui/icons-material/AirOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import SettingsInputComponentOutlinedIcon from '@mui/icons-material/SettingsInputComponentOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SearchModal from '@/components/SearchModal';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Avatar from '@mui/material/Avatar';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';
import { buildings, Building } from '@/data/buildings';
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
  currentPage?: 'home' | 'portfolio' | 'portfolio_overview' | 'insights' | 'bms' | 'operations' | 'operations_docs' | 'operations_tickets' | 'operations_quotations' | 'themes' | 'workspaces';
  onPageChange?: (page: 'home' | 'portfolio' | 'portfolio_overview' | 'insights' | 'bms' | 'operations' | 'operations_docs' | 'operations_tickets' | 'operations_quotations' | 'themes' | 'workspaces') => void;
  onAssetExplorerToggle?: () => void;
  isAssetExplorerOpen?: boolean;
  selection?: string;
  onSelectionChange?: (selection: string) => void;
}

interface SortableFavoriteItemProps {
  favorite: Favorite;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onRemove: () => void;
}

function SortableFavoriteItem({ favorite, isHovered, onMouseEnter, onMouseLeave, onRemove }: SortableFavoriteItemProps) {
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
            background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,1))',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      <ListItemButton sx={{ height: 40, pl: '4px', gap: 2, borderRadius: '5px', position: 'relative', overflow: 'hidden' }}>
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
            gap: 2,
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
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (isHovered) {
                  onRemove();
                }
              }}
            >
              {isHovered ? (
                <StarOutlineIcon sx={{ fontSize: 16, color: '#d32f2f' }} />
              ) : (
                <StarIcon sx={{ fontSize: 16 }} />
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

export default function Sidebar({ selectedBuilding, selectedMetric, onBuildingSelect, onMetricSelect, favorites: externalFavorites, onFavoritesChange, isCollapsed = false, onToggleCollapse, currentPage = 'portfolio', onPageChange, onAssetExplorerToggle, isAssetExplorerOpen = false, selection, onSelectionChange }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredBuildings, setFilteredBuildings] = useState(buildings);
  const [selectedCustomer, setSelectedCustomer] = useState('ACME Corporation');
  const [customerAnchorEl, setCustomerAnchorEl] = useState<null | HTMLElement>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [controlRoomExpanded, setControlRoomExpanded] = useState(currentPage === 'portfolio');
  const [crThemesExpanded, setCrThemesExpanded] = useState(false);
  const [crOperationsExpanded, setCrOperationsExpanded] = useState(false);
  const [operationsExpanded, setOperationsExpanded] = useState(currentPage?.startsWith('operations') ?? false);
  const [hoveredFavorite, setHoveredFavorite] = useState<string | null>(null);
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

  const customers = [
    { name: 'ACME Corporation', initials: 'acme' },
    { name: 'TechVision Inc', initials: 'tv' },
    { name: 'Global Solutions', initials: 'gs' },
    { name: 'Nexus Group', initials: 'ng' },
    { name: 'Pulse Dynamics', initials: 'pd' },
    { name: 'Summit Enterprises', initials: 'se' },
  ];

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBuildings(buildings);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      const filtered = buildings.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBuildings(filtered);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const buildingMenuItems = [
    { label: 'Overview', icon: AssignmentOutlinedIcon, metric: 'overall' },
    { label: 'Sustainability', icon: NatureOutlinedIcon, metric: 'sustainability' },
    { label: 'Comfort', icon: AirOutlinedIcon, metric: 'comfort' },
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
      width: isCollapsed ? 64 : 280,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      bgcolor: '#fff',
      borderRight: 1,
      borderColor: 'divider',
      transition: 'width 0.3s ease'
    }}>

      {!isCollapsed && (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {/* ACME Corp section - aligns with PageHeader breadcrumb */}
          <Box sx={{ height: 56, display: 'flex', alignItems: 'center', px: 2, flexShrink: 0 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flex: 1, cursor: 'pointer', px: 0.5, py: 1, borderRadius: '5px', transition: 'background-color 0.2s', '&:hover': { backgroundColor: '#f5f5f5' } }}
              onClick={(e) => setCustomerAnchorEl(e.currentTarget)}
            >
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}
              >
                <Box sx={{ width: 24, height: 24, bgcolor: '#1e5a96', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.6rem' }}>
                    {customers.find(c => c.name === selectedCustomer)?.initials}
                  </Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedCustomer}
                </Typography>
              </Box>
              <IconButton
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
          <Menu
              anchorEl={customerAnchorEl}
              open={Boolean(customerAnchorEl)}
              onClose={() => setCustomerAnchorEl(null)}
              PaperProps={{
                sx: {
                  minWidth: 280,
                  p: 1,
                  zIndex: 1500,
                }
              }}
              slotProps={{ root: { style: { zIndex: 1500 } } }}
            >
              <Box sx={{ px: 2, py: 1.5, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Switch Tenant
                </Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              {customers.map((customer) => (
                <MenuItem
                  key={customer.name}
                  onClick={() => {
                    setSelectedCustomer(customer.name);
                    setCustomerAnchorEl(null);
                  }}
                  selected={selectedCustomer === customer.name}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    py: 1.5,
                    px: 1.5,
                    mx: 0.5,
                    mb: 0.5,
                    borderRadius: '5px',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#e3f2fd',
                      '&:hover': {
                        backgroundColor: '#e3f2fd',
                      }
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: '#1e5a96', 
                      borderRadius: '2px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      flexShrink: 0 
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                      {customer.initials}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {customer.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>

          <Box sx={{ px: 2, pt: 2, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <List sx={{ py: 0, flexShrink: 0 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => setSearchModalOpen(true)}
                sx={{
                  height: 40,
                  paddingLeft: '4px',
                  gap: 2,
                  borderRadius: '5px',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                <Box sx={{ width: 28, height: 28, bgcolor: '#f0f0f0', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <SearchIcon sx={{ fontSize: 16 }} />
                </Box>
                <ListItemText
                  primary="Search"
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => onPageChange?.('home')}
                sx={{
                  height: 40,
                  paddingLeft: '4px',
                  gap: 2,
                  borderRadius: '5px',
                  backgroundColor: currentPage === 'home' ? '#f0f0f0' : 'transparent',
                  transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: currentPage === 'home' ? '#e8e8e8' : '#f5f5f5'
                  }
                }}
              >
                <Box sx={{ width: 28, height: 28, bgcolor: '#f0f0f0', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <HomeOutlinedIcon sx={{ fontSize: 16 }} />
                </Box>
                <ListItemText
                  primary="Home"
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => onPageChange?.('portfolio')}
                sx={{
                  height: 40,
                  paddingLeft: '4px',
                  pr: 0,
                  gap: 2,
                  borderRadius: '5px',
                  backgroundColor: currentPage === 'portfolio' ? '#f0f0f0' : 'transparent',
                  transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: currentPage === 'portfolio' ? '#e8e8e8' : '#f5f5f5'
                  }
                }}
              >
                <Box sx={{ width: 28, height: 28, bgcolor: '#f0f0f0', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MonitorHeartOutlined sx={{ fontSize: 16 }} />
                </Box>
                <ListItemText
                  primary="Control Room"
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setControlRoomExpanded(!controlRoomExpanded); }}
                  sx={{ width: 28, height: 28, flexShrink: 0 }}
                >
                  <ExpandMoreIcon sx={{ fontSize: 18, transform: controlRoomExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
                </IconButton>
              </ListItemButton>
            </ListItem>
            {controlRoomExpanded && (
              <List dense sx={{ pl: 2, py: 0 }}>
                {/* Themes dropdown */}
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => { onPageChange?.('portfolio'); onSelectionChange?.('themes_group'); }}
                    sx={{
                      height: 36,
                      paddingLeft: '4px',
                      pr: 0,
                      gap: 1.5,
                      borderRadius: '5px',
                      bgcolor: currentPage === 'portfolio' && selection === 'themes_group' ? '#e3f2fd' : 'transparent',
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  >
                    <NatureOutlinedIcon sx={{ fontSize: 16 }} />
                    <ListItemText primary="Themes" primaryTypographyProps={{ variant: 'body2', fontWeight: currentPage === 'portfolio' && selection === 'themes_group' ? 600 : 400 }} />
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); setCrThemesExpanded(!crThemesExpanded); }}
                      sx={{ width: 24, height: 24, flexShrink: 0 }}
                    >
                      <ExpandMoreIcon sx={{ fontSize: 16, transform: crThemesExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
                    </IconButton>
                  </ListItemButton>
                </ListItem>
                {crThemesExpanded && [
                  { key: 'sustainability', label: 'Sustainability' },
                  { key: 'comfort', label: 'Comfort' },
                  { key: 'asset_monitoring', label: 'Asset Monitoring' },
                  { key: 'energy', label: 'Energy' },
                  { key: 'workspace', label: 'Workspace' },
                  { key: 'compliance', label: 'Compliance' },
                  { key: 'water_management', label: 'Water Management' },
                  { key: 'security_systems', label: 'Security Systems' },
                  { key: 'access_control', label: 'Access Control' },
                ].map((item) => (
                  <ListItem key={item.key} disablePadding>
                    <ListItemButton
                      onClick={() => { onPageChange?.('portfolio'); onSelectionChange?.(item.key); }}
                      sx={{
                        height: 32,
                        pl: 4,
                        gap: 1.5,
                        borderRadius: '5px',
                        bgcolor: currentPage === 'portfolio' && selection === item.key ? '#e3f2fd' : 'transparent',
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}
                    >
                      <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2', fontSize: '0.8rem', fontWeight: currentPage === 'portfolio' && selection === item.key ? 600 : 400 }} />
                    </ListItemButton>
                  </ListItem>
                ))}

                {/* Operations dropdown */}
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => { onPageChange?.('portfolio'); onSelectionChange?.('operations_group'); }}
                    sx={{
                      height: 36,
                      paddingLeft: '4px',
                      pr: 0,
                      gap: 1.5,
                      borderRadius: '5px',
                      bgcolor: currentPage === 'portfolio' && selection === 'operations_group' ? '#e3f2fd' : 'transparent',
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  >
                    <HandymanOutlinedIcon sx={{ fontSize: 16 }} />
                    <ListItemText primary="Operations" primaryTypographyProps={{ variant: 'body2', fontWeight: currentPage === 'portfolio' && selection === 'operations_group' ? 600 : 400 }} />
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); setCrOperationsExpanded(!crOperationsExpanded); }}
                      sx={{ width: 24, height: 24, flexShrink: 0 }}
                    >
                      <ExpandMoreIcon sx={{ fontSize: 16, transform: crOperationsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
                    </IconButton>
                  </ListItemButton>
                </ListItem>
                {crOperationsExpanded && [
                  { key: 'tickets', label: 'Tickets' },
                  { key: 'quotations', label: 'Quotations' },
                  { key: 'maintenance', label: 'Maintenance' },
                ].map((item) => (
                  <ListItem key={item.key} disablePadding>
                    <ListItemButton
                      onClick={() => { onPageChange?.('portfolio'); onSelectionChange?.(item.key); }}
                      sx={{
                        height: 32,
                        pl: 4,
                        gap: 1.5,
                        borderRadius: '5px',
                        bgcolor: currentPage === 'portfolio' && selection === item.key ? '#e3f2fd' : 'transparent',
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}
                    >
                      <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2', fontSize: '0.8rem', fontWeight: currentPage === 'portfolio' && selection === item.key ? 600 : 400 }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => onPageChange?.('insights')}
                sx={{
                  height: 40,
                  paddingLeft: '4px',
                  gap: 2,
                  borderRadius: '5px',
                  backgroundColor: currentPage === 'insights' ? '#f0f0f0' : 'transparent',
                  transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: currentPage === 'insights' ? '#e8e8e8' : '#f5f5f5'
                  }
                }}
              >
                <Box sx={{ width: 28, height: 28, bgcolor: '#f0f0f0', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 16 }} />
                </Box>
                <ListItemText
                  primary="Insights"
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => onPageChange?.('portfolio_overview')}
                sx={{
                  height: 40,
                  paddingLeft: '4px',
                  gap: 2,
                  borderRadius: '5px',
                  backgroundColor: currentPage === 'portfolio_overview' ? '#f0f0f0' : 'transparent',
                  transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: currentPage === 'portfolio_overview' ? '#e8e8e8' : '#f5f5f5'
                  }
                }}
              >
                <Box sx={{ width: 28, height: 28, bgcolor: '#f0f0f0', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ApartmentOutlinedIcon sx={{ fontSize: 16 }} />
                </Box>
                <ListItemText
                  primary="Portfolio"
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => onPageChange?.('operations')}
                sx={{
                  height: 40,
                  paddingLeft: '4px',
                  pr: 0,
                  gap: 2,
                  borderRadius: '5px',
                  backgroundColor: currentPage?.startsWith('operations') ? '#f0f0f0' : 'transparent',
                  transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: currentPage?.startsWith('operations') ? '#e8e8e8' : '#f5f5f5'
                  }
                }}
              >
                <Box sx={{ width: 28, height: 28, bgcolor: '#f0f0f0', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <HandymanOutlinedIcon sx={{ fontSize: 16 }} />
                </Box>
                <ListItemText
                  primary="Operations"
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setOperationsExpanded(!operationsExpanded); }}
                  sx={{ width: 28, height: 28, flexShrink: 0 }}
                >
                  <ExpandMoreIcon sx={{ fontSize: 18, transform: operationsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
                </IconButton>
              </ListItemButton>
            </ListItem>
            {operationsExpanded && (
              <List dense sx={{ pl: 4, py: 0 }}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => onPageChange?.('operations_docs')}
                    sx={{
                      height: 36,
                      gap: 1.5,
                      borderRadius: '5px',
                      bgcolor: currentPage === 'operations_docs' ? '#e3f2fd' : 'transparent',
                      '&:hover': { bgcolor: currentPage === 'operations_docs' ? '#e3f2fd' : '#f5f5f5' }
                    }}
                  >
                    <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
                    <ListItemText primary="Docs" primaryTypographyProps={{ variant: 'body2', fontWeight: currentPage === 'operations_docs' ? 600 : 400 }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => onPageChange?.('operations_tickets')}
                    sx={{
                      height: 36,
                      gap: 1.5,
                      borderRadius: '5px',
                      bgcolor: currentPage === 'operations_tickets' ? '#e3f2fd' : 'transparent',
                      '&:hover': { bgcolor: currentPage === 'operations_tickets' ? '#e3f2fd' : '#f5f5f5' }
                    }}
                  >
                    <ConfirmationNumberOutlinedIcon sx={{ fontSize: 16 }} />
                    <ListItemText primary="Tickets" primaryTypographyProps={{ variant: 'body2', fontWeight: currentPage === 'operations_tickets' ? 600 : 400 }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => onPageChange?.('operations_quotations')}
                    sx={{
                      height: 36,
                      gap: 1.5,
                      borderRadius: '5px',
                      bgcolor: currentPage === 'operations_quotations' ? '#e3f2fd' : 'transparent',
                      '&:hover': { bgcolor: currentPage === 'operations_quotations' ? '#e3f2fd' : '#f5f5f5' }
                    }}
                  >
                    <RequestQuoteOutlinedIcon sx={{ fontSize: 16 }} />
                    <ListItemText primary="Quotations" primaryTypographyProps={{ variant: 'body2', fontWeight: currentPage === 'operations_quotations' ? 600 : 400 }} />
                  </ListItemButton>
                </ListItem>
              </List>
            )}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => onPageChange?.('bms')}
                sx={{
                  height: 40,
                  paddingLeft: '4px',
                  gap: 2,
                  borderRadius: '5px',
                  backgroundColor: currentPage === 'bms' ? '#f0f0f0' : 'transparent',
                  transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: currentPage === 'bms' ? '#e8e8e8' : '#f5f5f5'
                  }
                }}
              >
                <Box sx={{ width: 28, height: 28, bgcolor: '#f0f0f0', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <SettingsInputComponentOutlinedIcon sx={{ fontSize: 16 }} />
                </Box>
                <ListItemText
                  primary="BMS"
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>
          </List>

            <Divider sx={{ mt: '4px', mb: '8px', flexShrink: 0 }} />

            {/* Asset Explorer Menu Item */}
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={onAssetExplorerToggle}
                sx={{
                  height: 40,
                  paddingLeft: '4px',
                  gap: 2,
                  borderRadius: '5px',
                  backgroundColor: isAssetExplorerOpen ? '#1976d2' : 'transparent',
                  transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: isAssetExplorerOpen ? '#1565c0' : '#f5f5f5'
                  }
                }}
              >
                <Box sx={{ width: 28, height: 28, bgcolor: isAssetExplorerOpen ? 'rgba(255,255,255,0.2)' : '#f0f0f0', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AccountTreeOutlinedIcon sx={{ fontSize: 16, color: isAssetExplorerOpen ? '#fff' : 'inherit' }} />
                </Box>
                <ListItemText
                  primary="Asset Explorer"
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 600, color: isAssetExplorerOpen ? '#fff' : 'inherit' }}
                />
              </ListItemButton>
            </ListItem>

            <Divider sx={{ mt: 0, mb: '16px', flexShrink: 0 }} />

            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', flexShrink: 0 }}>
              Favorites
            </Typography>
            <Box sx={{
              maxHeight: 120,
              overflowY: 'auto',
              overflowX: 'hidden',
              flexShrink: 0,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'transparent',
                borderRadius: '4px',
                transition: 'background 0.2s ease',
              },
              '&:hover::-webkit-scrollbar-thumb': {
                background: '#999',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#666',
              },
            }}>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={favorites.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  <List dense sx={{ py: 0 }}>
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

            {/* Bottom section: Notifications, Help, Account */}
            <Box sx={{ mt: 'auto', flexShrink: 0, pt: 1, pb: 2 }}>
              <Divider sx={{ mb: 1 }} />
              <List dense sx={{ py: 0 }}>
                <ListItem disablePadding>
                  <ListItemButton sx={{ height: 36, paddingLeft: '4px', gap: 2, borderRadius: '5px', '&:hover': { backgroundColor: '#f5f5f5' } }}>
                    <Box sx={{ width: 28, height: 28, bgcolor: '#f0f0f0', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <NotificationsOutlinedIcon sx={{ fontSize: 16 }} />
                    </Box>
                    <ListItemText primary="Notifications" primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton sx={{ height: 36, paddingLeft: '4px', gap: 2, borderRadius: '5px', '&:hover': { backgroundColor: '#f5f5f5' } }}>
                    <Box sx={{ width: 28, height: 28, bgcolor: '#f0f0f0', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <HelpOutlineIcon sx={{ fontSize: 16 }} />
                    </Box>
                    <ListItemText primary="Help" primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={(e) => setUserAnchorEl(e.currentTarget)}
                    sx={{ height: 36, paddingLeft: '4px', gap: 2, borderRadius: '5px', '&:hover': { backgroundColor: '#f5f5f5' } }}
                  >
                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#c084fc', fontSize: '0.75rem', fontWeight: 600 }}>A</Avatar>
                    <ListItemText primary="Account" primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItemButton>
                </ListItem>
              </List>
              <Menu
                anchorEl={userAnchorEl}
                open={Boolean(userAnchorEl)}
                onClose={() => setUserAnchorEl(null)}
              >
                <MenuItem onClick={() => setUserAnchorEl(null)}>Profile</MenuItem>
                <MenuItem onClick={() => setUserAnchorEl(null)}>Settings</MenuItem>
                <MenuItem onClick={() => setUserAnchorEl(null)}>Logout</MenuItem>
              </Menu>
            </Box>
          </Box>
        </Box>
      )}

      {/* Collapsed View - Icon Only */}
      {isCollapsed && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
          {/* Buildings & Assets Icon */}
          <IconButton
            sx={{
              width: 48,
              height: 48,
              borderRadius: '8px',
              bgcolor: !selectedBuilding ? '#f0f0f0' : 'transparent',
              '&:hover': { bgcolor: '#e8e8e8' }
            }}
            onClick={() => onBuildingSelect?.(null)}
          >
            <BuildingIcon />
          </IconButton>

          <Divider sx={{ width: 40 }} />

          {/* Metric Icons */}
          {buildingMenuItems.slice(1).map((item) => {
            const isActive = selectedMetric === item.metric;
            return (
              <IconButton
                key={item.metric}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '8px',
                  bgcolor: isActive ? '#1976d2' : 'transparent',
                  color: isActive ? '#fff' : 'inherit',
                  '&:hover': {
                    bgcolor: isActive ? '#1565c0' : '#f5f5f5'
                  }
                }}
                onClick={() => handleMenuItemClick(item.metric)}
              >
                <item.icon sx={{ fontSize: 20 }} />
              </IconButton>
            );
          })}
        </Box>
      )}
      <SearchModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </Box>
  );
}
