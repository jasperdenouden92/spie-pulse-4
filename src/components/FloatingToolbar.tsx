import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import LayersIcon from '@mui/icons-material/Layers';
import RoomIcon from '@mui/icons-material/Room';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import SecurityIcon from '@mui/icons-material/Security';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ElevatorIcon from '@mui/icons-material/Elevator';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import FolderIcon from '@mui/icons-material/Folder';
import CategoryIcon from '@mui/icons-material/Category';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { AssetNode, assetTree, filterTreeByBuilding } from '@/data/assetTree';
import { colors, secondaryAlpha } from '@/colors';

type ViewMode = 'dashboard' | 'list' | 'tree';

interface FloatingToolbarProps {
  selectedView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  visible: boolean;
  buildingName?: string;
  onAssetSelect?: (asset: AssetNode | null) => void;
  onOpenInMainApp?: (asset: AssetNode) => void;
  inLeftPanel?: boolean;
  onClose?: () => void;
  large?: boolean;
}

export default function FloatingToolbar({
  selectedView,
  onViewChange,
  visible,
  buildingName,
  onAssetSelect,
  onOpenInMainApp,
  inLeftPanel = false,
  onClose,
  large = false,
}: FloatingToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<AssetNode | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [assetExplorerOpen, setAssetExplorerOpen] = useState(true);
  const [contextMenuAnchor, setContextMenuAnchor] = useState<{ element: HTMLElement; node: AssetNode } | null>(null);
  const [detailTab, setDetailTab] = useState(0);

  // Top-level node IDs for accordion behavior
  const topLevelNodeIds = ['dt-buildings', 'dt-systems', 'dt-zones', 'dt-equipment'];

  // Handle expansion with accordion behavior for top-level nodes
  const handleExpandedItemsChange = (_event: React.SyntheticEvent | null, nodeIds: string[]) => {
    // Find which top-level nodes are in the new expansion
    const newTopLevelExpanded = nodeIds.filter(id => topLevelNodeIds.includes(id));
    const oldTopLevelExpanded = expanded.filter(id => topLevelNodeIds.includes(id));

    // If a new top-level node was added, remove all other top-level nodes
    if (newTopLevelExpanded.length > oldTopLevelExpanded.length) {
      const newlyExpandedTopLevel = newTopLevelExpanded.find(id => !oldTopLevelExpanded.includes(id));
      if (newlyExpandedTopLevel) {
        // Keep only the newly expanded top-level node and any non-top-level nodes
        const filteredExpanded = nodeIds.filter(id =>
          !topLevelNodeIds.includes(id) || id === newlyExpandedTopLevel
        );
        setExpanded(filteredExpanded);
        return;
      }
    }

    // Otherwise, just update normally
    setExpanded(nodeIds);
  };

  const currentView: ViewMode = selectedView;
  const isTreeExpanded = true; // Always expanded in left drawer

  // Filter tree data
  const treeData = useMemo(() => {
    if (buildingName) {
      return filterTreeByBuilding(buildingName);
    }
    return assetTree;
  }, [buildingName]);

  // Get icon for node type - Microsoft Explorer style (very small)
  const getNodeIcon = (node: AssetNode) => {
    const iconSize = large ? 16 : 12;
    const iconProps = { sx: { fontSize: iconSize } };

    if (node.type === 'building') return <BusinessIcon {...iconProps} />;
    if (node.type === 'floor') return <LayersIcon {...iconProps} />;
    if (node.type === 'zone') return <RoomIcon {...iconProps} />;
    if (node.type === 'room') return <MeetingRoomIcon {...iconProps} />;
    if (node.type === 'system') return <CategoryIcon {...iconProps} />;
    if (node.type === 'category') return <FolderIcon {...iconProps} />;
    if (node.type === 'asset' && node.metadata?.category) {
      const IconComponent = {
        'HVAC': AcUnitIcon,
        'Electrical': ElectricalServicesIcon,
        'Lighting': LightbulbIcon,
        'Plumbing': PlumbingIcon,
        'Security': SecurityIcon,
        'Access Control': SecurityIcon,
        'Fire Safety': LocalFireDepartmentIcon,
        'Fire Protection': LocalFireDepartmentIcon,
        'Vertical Transportation': ElevatorIcon,
        'Building Automation': SettingsInputAntennaIcon,
        'Power Systems': ElectricalServicesIcon
      }[node.metadata.category] || SettingsInputAntennaIcon;
      return <IconComponent {...iconProps} />;
    }
    return <SettingsInputAntennaIcon {...iconProps} />;
  };

  // Mock status for demonstration
  const getNodeStatus = (node: AssetNode): string => {
    if (node.metadata?.status) return node.metadata.status;
    if (node.type === 'asset') {
      const statuses = ['operational', 'operational', 'operational', 'maintenance', 'offline'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    }
    return 'operational';
  };

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return '#4caf50';
      case 'maintenance': return '#ff9800';
      case 'offline': return '#9e9e9e';
      case 'failed': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  // Render tree recursively - Microsoft Explorer style (extremely dense)
  const renderTree = (nodes: AssetNode[]) => {
    return nodes
      .filter(node => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          node.name.toLowerCase().includes(query) ||
          node.metadata?.category?.toLowerCase().includes(query) ||
          node.metadata?.model?.toLowerCase().includes(query) ||
          node.metadata?.serialNumber?.toLowerCase().includes(query)
        );
      })
      .map(node => {
        const status = getNodeStatus(node);
        const statusColor = getStatusColor(status);

        return (
          <TreeItem
            key={node.id}
            itemId={node.id}
            label={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  py: large ? 0.375 : 0.125,
                  width: '100%',
                  '&:hover .node-actions': {
                    opacity: 1
                  }
                }}
                onClick={() => {
                  setSelectedNode(node);
                  onAssetSelect?.(node);
                  // Expand node if it has children and isn't already expanded
                  if (node.children && node.children.length > 0 && !expanded.includes(node.id)) {
                    handleExpandedItemsChange(null, [...expanded, node.id]);
                  }
                }}
              >
                {/* Icon */}
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', minWidth: 12 }}>
                  {getNodeIcon(node)}
                </Box>

                {/* Status indicator - smaller for all nodes */}
                <Box
                  sx={{
                    width: large ? 7 : 5,
                    height: large ? 7 : 5,
                    borderRadius: '50%',
                    bgcolor: statusColor,
                    flexShrink: 0
                  }}
                />

                {/* Name */}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: node.type === 'building' ? 600 : node.type === 'asset' ? 400 : 500,
                    fontSize: large ? '0.813rem' : '0.688rem',
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {node.name}
                </Typography>

                {/* Asset ID chip for assets - smaller */}
                {node.type === 'asset' && node.metadata?.serialNumber && (
                  <Chip
                    label={node.metadata.serialNumber}
                    size="small"
                    sx={{
                      height: large ? 18 : 14,
                      fontSize: large ? '0.688rem' : '0.563rem',
                      fontFamily: 'monospace',
                      bgcolor: colors.bgPrimaryHover,
                      '& .MuiChip-label': { px: 0.5, py: 0 }
                    }}
                  />
                )}

                {/* Notion-style Inline Actions - for ALL nodes */}
                <Box
                  className="node-actions"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.25,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    ml: 'auto'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Open in main app arrow */}
                  <Tooltip title="Open in main app" placement="top">
                    <IconButton
                      size="small"
                      sx={{ width: 18, height: 18, p: 0 }}
                      onClick={() => onOpenInMainApp?.(node)}
                    >
                      <ArrowForwardIcon sx={{ fontSize: 11 }} />
                    </IconButton>
                  </Tooltip>
                  {/* Add button for categories/zones */}
                  {(node.type === 'category' || node.type === 'zone' || node.type === 'floor' || node.type === 'system') && (
                    <Tooltip title="Add" placement="top">
                      <IconButton size="small" sx={{ width: 18, height: 18, p: 0 }}>
                        <AddCircleOutlineIcon sx={{ fontSize: 11 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {/* Edit button for all */}
                  <Tooltip title="Edit" placement="top">
                    <IconButton size="small" sx={{ width: 18, height: 18, p: 0 }}>
                      <EditOutlinedIcon sx={{ fontSize: 11 }} />
                    </IconButton>
                  </Tooltip>
                  {/* More menu for all */}
                  <Tooltip title="More" placement="top">
                    <IconButton
                      size="small"
                      sx={{ width: 18, height: 18, p: 0 }}
                      onClick={(e) => setContextMenuAnchor({ element: e.currentTarget, node })}
                    >
                      <MoreVertIcon sx={{ fontSize: 11 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            }
            sx={{
              '& .MuiTreeItem-content': {
                py: '1px',
                px: '4px',
                borderRadius: '3px',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                },
                '&.Mui-selected': {
                  bgcolor: secondaryAlpha(0.08),
                  '&:hover': {
                    bgcolor: secondaryAlpha(0.12)
                  }
                }
              }
            }}
          >
            {node.children && node.children.length > 0 && renderTree(node.children)}
          </TreeItem>
        );
      });
  };

  return (
    <Box
      component="aside"
      sx={{
        position: 'static',
        height: '100%',
        width: '100%',
        bgcolor: '#fff',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {false ? (
        /* Collapsed View - Icon Only */
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
          {/* Asset Tree Icon */}
          <Tooltip title="Asset Explorer" placement="left">
            <IconButton
              sx={{
                width: 48,
                height: 48,
                borderRadius: '8px',
                bgcolor: selectedView === 'tree' ? colors.brand : 'transparent',
                color: selectedView === 'tree' ? '#fff' : 'inherit',
                '&:hover': { bgcolor: selectedView === 'tree' ? '#1565c0' : colors.bgPrimaryHover }
              }}
              onClick={() => {
                onViewChange('tree');
                setIsExpanded(true);
              }}
            >
              <AccountTreeOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Divider sx={{ width: 40 }} />

          {/* View Mode Buttons */}
          <Tooltip title="Dashboard View" placement="left">
            <IconButton
              sx={{
                width: 48,
                height: 48,
                borderRadius: '8px',
                bgcolor: selectedView === 'dashboard' ? colors.brand : 'transparent',
                color: selectedView === 'dashboard' ? '#fff' : 'inherit',
                '&:hover': { bgcolor: selectedView === 'dashboard' ? '#1565c0' : colors.bgPrimaryHover }
              }}
              onClick={() => onViewChange('dashboard')}
            >
              <DashboardOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="List View" placement="left">
            <IconButton
              sx={{
                width: 48,
                height: 48,
                borderRadius: '8px',
                bgcolor: selectedView === 'list' ? colors.brand : 'transparent',
                color: selectedView === 'list' ? '#fff' : 'inherit',
                '&:hover': { bgcolor: selectedView === 'list' ? '#1565c0' : colors.bgPrimaryHover }
              }}
              onClick={() => onViewChange('list')}
            >
              <ViewListOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Grid View" placement="left">
            <IconButton sx={{ width: 48, height: 48, borderRadius: '8px', '&:hover': { bgcolor: colors.bgPrimaryHover } }}>
              <GridViewOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Map View" placement="left">
            <IconButton sx={{ width: 48, height: 48, borderRadius: '8px', '&:hover': { bgcolor: colors.bgPrimaryHover } }}>
              <MapOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        /* Expanded View - Professional Asset Navigator */
        <>
          {/* Header - Breadcrumb style (hidden in inline/large mode) */}
          {!large && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            pt: 2,
            pb: 1.5,
            flexShrink: 0
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AccountTreeOutlinedIcon sx={{ fontSize: 20, color: 'text.primary' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                Asset Explorer
              </Typography>
            </Box>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          )}

          {/* Quicksearch */}
          <Box sx={{ px: 2, pb: 1.5, pt: large ? 2 : 0, flexShrink: 0 }}>
            <TextField
              size="small"
              placeholder="Quicksearch"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: colors.bgPrimaryHover,
                  border: 'none',
                  '& fieldset': { border: 'none' }
                },
                '& .MuiOutlinedInput-input': {
                  padding: '8px 12px',
                  fontSize: '0.875rem',
                }
              }}
            />
          </Box>

          {/* Tree View - Microsoft Explorer style */}
          <Box sx={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
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
            <SimpleTreeView
              expandedItems={expanded}
              onExpandedItemsChange={handleExpandedItemsChange}
              slots={{
                collapseIcon: ExpandMoreIcon,
                expandIcon: ChevronRightIcon
              }}
              sx={{
                '& .MuiTreeItem-content': {
                  py: large ? '3px' : '1px',
                  px: '4px',
                  borderRadius: '3px'
                },
                '& .MuiTreeItem-iconContainer svg': {
                  fontSize: large ? 16 : 14
                },
                '& .MuiTreeItem-group': {
                  marginLeft: 0,
                  paddingLeft: large ? '24px' : '20px',
                  borderLeft: `1px solid ${colors.borderSecondary}`
                }
              }}
            >
              {renderTree(treeData)}
            </SimpleTreeView>
          </Box>

          {/* Context Menu */}
          <Menu
            anchorEl={contextMenuAnchor?.element}
            open={Boolean(contextMenuAnchor)}
            onClose={() => setContextMenuAnchor(null)}
          >
            <MenuItem onClick={() => setContextMenuAnchor(null)} sx={{ fontSize: '0.813rem', gap: 1.5 }}>
              <VisibilityOutlinedIcon fontSize="small" />
              View Details
            </MenuItem>
            <MenuItem onClick={() => setContextMenuAnchor(null)} sx={{ fontSize: '0.813rem', gap: 1.5 }}>
              <EditOutlinedIcon fontSize="small" />
              Edit Properties
            </MenuItem>
            {contextMenuAnchor?.node.type === 'asset' && (
              <>
                <MenuItem onClick={() => setContextMenuAnchor(null)} sx={{ fontSize: '0.813rem', gap: 1.5 }}>
                  <BuildOutlinedIcon fontSize="small" />
                  Maintenance Schedule
                </MenuItem>
                <MenuItem onClick={() => setContextMenuAnchor(null)} sx={{ fontSize: '0.813rem', gap: 1.5 }}>
                  <NotificationsOutlinedIcon fontSize="small" />
                  Alert Settings
                </MenuItem>
              </>
            )}
            <MenuItem onClick={() => setContextMenuAnchor(null)} sx={{ fontSize: '0.813rem', gap: 1.5 }}>
              <DescriptionOutlinedIcon fontSize="small" />
              Generate Report
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={() => setContextMenuAnchor(null)} sx={{ fontSize: '0.813rem', gap: 1.5 }}>
              <ContentCopyOutlinedIcon fontSize="small" />
              Duplicate
            </MenuItem>
            <MenuItem onClick={() => setContextMenuAnchor(null)} sx={{ fontSize: '0.813rem', gap: 1.5 }}>
              <ArchiveOutlinedIcon fontSize="small" />
              Archive
            </MenuItem>
            <MenuItem onClick={() => setContextMenuAnchor(null)} sx={{ fontSize: '0.813rem', gap: 1.5, color: 'error.main' }}>
              <DeleteOutlineIcon fontSize="small" />
              Delete
            </MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
}

