import { colors, secondaryAlpha } from '@/colors';
import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import LayersIcon from '@mui/icons-material/Layers';
import RoomIcon from '@mui/icons-material/Room';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import SecurityIcon from '@mui/icons-material/Security';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ElevatorIcon from '@mui/icons-material/Elevator';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { AssetNode, assetTree, filterTreeByBuilding } from '@/data/assetTree';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface AssetTreeExplorerProps {
  open: boolean;
  onClose: () => void;
  buildingName?: string;
  onAssetSelect?: (asset: AssetNode | null) => void;
}

// Icon mapping for different asset categories
const categoryIcons: Record<string, React.ReactElement> = {
  HVAC: <AcUnitIcon fontSize="small" />,
  Electrical: <ElectricalServicesIcon fontSize="small" />,
  Lighting: <LightbulbIcon fontSize="small" />,
  Plumbing: <PlumbingIcon fontSize="small" />,
  Security: <SecurityIcon fontSize="small" />,
  'Access Control': <SecurityIcon fontSize="small" />,
  'Fire Safety': <LocalFireDepartmentIcon fontSize="small" />,
  'Fire Protection': <LocalFireDepartmentIcon fontSize="small" />,
  'Vertical Transportation': <ElevatorIcon fontSize="small" />,
  'Building Automation': <SettingsInputAntennaIcon fontSize="small" />,
  'Power Systems': <ElectricalServicesIcon fontSize="small" />
};

export default function AssetTreeExplorer({
  open,
  onClose,
  buildingName,
  onAssetSelect
}: AssetTreeExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<AssetNode | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);

  // Filter tree data
  const treeData = useMemo(() => {
    if (buildingName) {
      return filterTreeByBuilding(buildingName);
    }
    return assetTree;
  }, [buildingName]);

  // Get icon for node type
  const getNodeIcon = (node: AssetNode) => {
    if (node.type === 'building') return <BusinessIcon fontSize="small" />;
    if (node.type === 'floor') return <LayersIcon fontSize="small" />;
    if (node.type === 'zone') return <RoomIcon fontSize="small" />;
    if (node.type === 'asset' && node.metadata?.category) {
      return categoryIcons[node.metadata.category] || <SettingsInputAntennaIcon fontSize="small" />;
    }
    return <SettingsInputAntennaIcon fontSize="small" />;
  };

  // Render tree recursively
  const renderTree = (nodes: AssetNode[]) => {
    return nodes
      .filter(node => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          node.name.toLowerCase().includes(query) ||
          node.metadata?.category?.toLowerCase().includes(query) ||
          node.metadata?.model?.toLowerCase().includes(query)
        );
      })
      .map(node => (
        <TreeItem
          key={node.id}
          itemId={node.id}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
              {getNodeIcon(node)}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: node.type === 'building' ? 600 : node.type === 'asset' ? 400 : 500,
                  fontSize: node.type === 'building' ? '1rem' : node.type === 'asset' ? '0.875rem' : '0.938rem'
                }}
              >
                {node.name}
              </Typography>
              {node.type === 'asset' && node.metadata?.category && (
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: colors.bgActive,
                    color: 'primary.main',
                    px: 1,
                    py: 0.25,
                    borderRadius: '4px',
                    fontSize: '0.688rem',
                    fontWeight: 500
                  }}
                >
                  {node.metadata.category}
                </Typography>
              )}
            </Box>
          }
          onClick={() => {
            if (node.type === 'asset') {
              setSelectedAsset(node);
              onAssetSelect?.(node);
            }
          }}
          sx={{
            '& .MuiTreeItem-content': {
              py: 0.5,
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)'
              },
              '&.Mui-selected': {
                bgcolor: node.type === 'asset' ? secondaryAlpha(0.08) : 'transparent',
                '&:hover': {
                  bgcolor: node.type === 'asset' ? secondaryAlpha(0.12) : 'rgba(0, 0, 0, 0.04)'
                }
              }
            }
          }}
        >
          {node.children && node.children.length > 0 && renderTree(node.children)}
        </TreeItem>
      ));
  };

  return (
    <Drawer data-annotation-id="assettreeexplorer-modal"
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          p: 2
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Asset Explorer
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Search */}
      <TextField
        size="small"
        fullWidth
        placeholder="Search assets..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Tree View */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
        <SimpleTreeView
          expandedItems={expanded}
          onExpandedItemsChange={(_event, nodeIds) => setExpanded(nodeIds)}
          slots={{
            collapseIcon: ExpandMoreIcon,
            expandIcon: ChevronRightIcon
          }}
          sx={{
            flexGrow: 1,
            overflowY: 'auto'
          }}
        >
          {renderTree(treeData)}
        </SimpleTreeView>
      </Box>

      {/* Asset Detail Panel */}
      {selectedAsset && selectedAsset.type === 'asset' && selectedAsset.metadata && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: 1,
            borderColor: 'divider',
            bgcolor: colors.bgPrimaryHover
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {getNodeIcon(selectedAsset)}
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {selectedAsset.name}
            </Typography>
          </Box>

          <TableContainer>
            <Table data-annotation-id="assettreeexplorer-tabel" size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: '40%', border: 0, py: 0.5 }}>Category</TableCell>
                  <TableCell sx={{ border: 0, py: 0.5 }}>{selectedAsset.metadata.category}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, border: 0, py: 0.5 }}>Model</TableCell>
                  <TableCell sx={{ border: 0, py: 0.5 }}>{selectedAsset.metadata.model}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, border: 0, py: 0.5 }}>Serial Number</TableCell>
                  <TableCell sx={{ border: 0, py: 0.5, fontFamily: 'monospace' }}>
                    {selectedAsset.metadata.serialNumber}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, border: 0, py: 0.5 }}>Install Date</TableCell>
                  <TableCell sx={{ border: 0, py: 0.5 }}>{selectedAsset.metadata.installDate}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, border: 0, py: 0.5 }}>Last Maintenance</TableCell>
                  <TableCell sx={{ border: 0, py: 0.5 }}>{selectedAsset.metadata.lastMaintenance}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Drawer>
  );
}
