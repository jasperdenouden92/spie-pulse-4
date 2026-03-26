'use client';

import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import RoomIcon from '@mui/icons-material/Room';
import FolderIcon from '@mui/icons-material/Folder';
import LayersIcon from '@mui/icons-material/Layers';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import SecurityIcon from '@mui/icons-material/Security';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ElevatorIcon from '@mui/icons-material/Elevator';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { AssetNode, assetTree } from '@/data/assetTree';
import { colors, secondaryAlpha } from '@/colors';

interface DataExplorerPanelProps {
  open: boolean;
  onClose: () => void;
  sidebarWidth: number;
  onAssetSelect?: (asset: AssetNode | null) => void;
  onOpenInMainApp?: (asset: AssetNode) => void;
}

const folders = [
  { id: 'alerts', label: 'Alert Overview', icon: <NotificationsActiveOutlinedIcon sx={{ fontSize: 18 }} />, count: 12 },
  { id: 'analyses', label: 'Analyses Overview', icon: <BarChartOutlinedIcon sx={{ fontSize: 18 }} />, count: 8 },
  { id: 'documents', label: 'Documents', icon: <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />, count: 156 },
  { id: 'tickets', label: 'Tickets', icon: <ConfirmationNumberOutlinedIcon sx={{ fontSize: 18 }} />, count: 34 },
  { id: 'performance', label: 'Performance Overview', icon: <SpeedOutlinedIcon sx={{ fontSize: 18 }} />, count: 5 },
  { id: 'quotations', label: 'Quotations', icon: <RequestQuoteOutlinedIcon sx={{ fontSize: 18 }} />, count: 17 },
];

const assetCategoryIcons: Record<string, React.ReactNode> = {
  'dt-buildings': <BusinessIcon sx={{ fontSize: 18 }} />,
  'dt-systems': <CategoryIcon sx={{ fontSize: 18 }} />,
  'dt-zones': <RoomIcon sx={{ fontSize: 18 }} />,
  'dt-equipment': <BuildOutlinedIcon sx={{ fontSize: 18 }} />,
};

function countNodes(node: AssetNode): number {
  if (!node.children || node.children.length === 0) return 1;
  return node.children.reduce((sum, child) => sum + countNodes(child), 0);
}

export default function DataExplorerPanel({ open, onClose, sidebarWidth, onAssetSelect, onOpenInMainApp }: DataExplorerPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [treeExpanded, setTreeExpanded] = useState<string[]>([]);
  const [contextMenuAnchor, setContextMenuAnchor] = useState<{ element: HTMLElement; node: AssetNode } | null>(null);

  const treeData = assetTree;

  const getNodeIcon = (node: AssetNode) => {
    const iconProps = { sx: { fontSize: 16 } };
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return '#4caf50';
      case 'maintenance': return '#ff9800';
      case 'offline': return '#9e9e9e';
      case 'failed': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const filterNodes = (nodes: AssetNode[], query: string): AssetNode[] => {
    if (!query) return nodes;
    const q = query.toLowerCase();
    return nodes.filter(node =>
      node.name.toLowerCase().includes(q) ||
      node.metadata?.category?.toLowerCase().includes(q) ||
      node.metadata?.serialNumber?.toLowerCase().includes(q)
    );
  };

  const renderTree = (nodes: AssetNode[]) => {
    return filterNodes(nodes, searchQuery).map(node => {
      const status = node.metadata?.status || 'operational';
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
                py: 0.375,
                width: '100%',
                '&:hover .node-actions': { opacity: 1 }
              }}
              onClick={() => onAssetSelect?.(node)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', minWidth: 12 }}>
                {getNodeIcon(node)}
              </Box>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: statusColor, flexShrink: 0 }} />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: node.type === 'building' ? 600 : node.type === 'asset' ? 400 : 500,
                  fontSize: '0.813rem',
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {node.name}
              </Typography>
              {node.type === 'asset' && node.metadata?.serialNumber && (
                <Chip
                  label={node.metadata.serialNumber}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.688rem',
                    fontFamily: 'monospace',
                    bgcolor: colors.bgPrimaryHover,
                    '& .MuiChip-label': { px: 0.5, py: 0 }
                  }}
                />
              )}
              <Box
                className="node-actions"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.25, opacity: 0, transition: 'opacity 0.2s', ml: 'auto' }}
                onClick={(e) => e.stopPropagation()}
              >
                <Tooltip title="Open in main app" placement="top">
                  <IconButton size="small" sx={{ width: 18, height: 18, p: 0 }} onClick={() => onOpenInMainApp?.(node)}>
                    <ArrowForwardIcon sx={{ fontSize: 11 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="More" placement="top">
                  <IconButton size="small" sx={{ width: 18, height: 18, p: 0 }} onClick={(e) => setContextMenuAnchor({ element: e.currentTarget, node })}>
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
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
              '&.Mui-selected': { bgcolor: secondaryAlpha(0.08), '&:hover': { bgcolor: secondaryAlpha(0.12) } }
            }
          }}
        >
          {node.children && node.children.length > 0 && renderTree(node.children)}
        </TreeItem>
      );
    });
  };

  const handleExpandedItemsChange = (_event: React.SyntheticEvent | null, nodeIds: string[]) => {
    setTreeExpanded(nodeIds);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: sidebarWidth,
        width: 340,
        height: '100vh',
        bgcolor: '#fff',
        borderRight: '1px solid',
        borderColor: 'divider',
        zIndex: 1250,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: open ? '4px 0 24px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      {/* Header */}
      <Box sx={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>Data Explorer</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Quicksearch */}
      <Box sx={{ px: 2, py: 1.5, flexShrink: 0 }}>
        <TextField
          size="small"
          placeholder="Quick search..."
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

      {/* All items in unified list */}
      <Box sx={{ flex: 1, overflowY: 'auto', '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-track': { background: 'transparent' }, '&::-webkit-scrollbar-thumb': { background: 'transparent', borderRadius: '4px' }, '&:hover::-webkit-scrollbar-thumb': { background: '#ccc' } }}>
        <List disablePadding>
          {/* Section: Buildings & Assets */}
          <Typography variant="caption" sx={{ px: 2.5, pt: 1, pb: 0.5, display: 'block', color: 'text.secondary', fontWeight: 600, fontSize: '0.675rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Buildings & Assets
          </Typography>

          {/* Asset categories */}
          {treeData.map((category) => {
            const isExpanded = expandedCategory === category.id;
            const nodeCount = countNodes(category);
            return (
              <React.Fragment key={category.id}>
                <ListItemButton
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                  sx={{
                    mx: 1,
                    borderRadius: '8px',
                    mb: 0.25,
                    py: 1,
                    ...(isExpanded && { bgcolor: colors.bgActive, '&:hover': { bgcolor: colors.bgActiveHover } }),
                    ...(!isExpanded && { '&:hover': { bgcolor: colors.bgPrimaryHover } }),
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: isExpanded ? colors.brand : 'text.secondary' }}>
                    {assetCategoryIcons[category.id] || <FolderIcon sx={{ fontSize: 18 }} />}
                  </ListItemIcon>
                  <ListItemText
                    primary={category.name}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: isExpanded ? 600 : 400 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                      {nodeCount}
                    </Typography>
                    {isExpanded ? (
                      <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    ) : (
                      <ChevronRightIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    )}
                  </Box>
                </ListItemButton>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box sx={{ pl: 1, pr: 0.5, pb: 1 }}>
                    <SimpleTreeView
                      expandedItems={treeExpanded}
                      onExpandedItemsChange={handleExpandedItemsChange}
                      slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
                      sx={{
                        '& .MuiTreeItem-content': { py: '3px', px: '4px', borderRadius: '3px' },
                        '& .MuiTreeItem-iconContainer svg': { fontSize: 16 },
                        '& .MuiTreeItem-group': { marginLeft: 0, paddingLeft: '24px', borderLeft: `1px solid ${colors.borderSecondary}` }
                      }}
                    >
                      {category.children && renderTree(category.children)}
                    </SimpleTreeView>
                  </Box>
                </Collapse>
              </React.Fragment>
            );
          })}

          {/* Section: Other pages */}
          <Typography variant="caption" sx={{ px: 2.5, pt: 2, pb: 0.5, display: 'block', color: 'text.secondary', fontWeight: 600, fontSize: '0.675rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Other pages
          </Typography>

          {folders.map((folder) => (
            <ListItemButton
              key={folder.id}
              sx={{
                mx: 1,
                borderRadius: '8px',
                mb: 0.25,
                py: 1,
                '&:hover': { bgcolor: colors.bgPrimaryHover },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                {folder.icon}
              </ListItemIcon>
              <ListItemText
                primary={folder.label}
                primaryTypographyProps={{ variant: 'body2' }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  {folder.count}
                </Typography>
                <ChevronRightIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              </Box>
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Context Menu */}
      <Menu anchorEl={contextMenuAnchor?.element} open={Boolean(contextMenuAnchor)} onClose={() => setContextMenuAnchor(null)}>
        <MenuItem onClick={() => setContextMenuAnchor(null)} sx={{ fontSize: '0.813rem', gap: 1.5 }}>
          <VisibilityOutlinedIcon fontSize="small" /> View Details
        </MenuItem>
        <MenuItem onClick={() => setContextMenuAnchor(null)} sx={{ fontSize: '0.813rem', gap: 1.5 }}>
          <EditOutlinedIcon fontSize="small" /> Edit Properties
        </MenuItem>
        {contextMenuAnchor?.node.type === 'asset' && (
          <MenuItem onClick={() => setContextMenuAnchor(null)} sx={{ fontSize: '0.813rem', gap: 1.5 }}>
            <NotificationsOutlinedIcon fontSize="small" /> Alert Settings
          </MenuItem>
        )}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => setContextMenuAnchor(null)} sx={{ fontSize: '0.813rem', gap: 1.5 }}>
          <ContentCopyOutlinedIcon fontSize="small" /> Copy ID
        </MenuItem>
      </Menu>
    </Box>
  );
}
