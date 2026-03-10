import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import AppTabs from '@/components/AppTabs';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import SecurityIcon from '@mui/icons-material/Security';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ElevatorIcon from '@mui/icons-material/Elevator';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { AssetNode } from '@/data/assetTree';

interface AssetDetailProps {
  asset: AssetNode;
  tab?: number;
  onTabChange?: (tab: number) => void;
}

export default function AssetDetail({ asset, tab: tabProp, onTabChange }: AssetDetailProps) {
  const [localTab, setLocalTab] = useState(0);
  const tab = tabProp ?? localTab;
  const setTab = (n: number) => { setLocalTab(n); onTabChange?.(n); };
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Get icon for asset category
  const getCategoryIcon = () => {
    const iconProps = { sx: { fontSize: 40, color: '#1976d2' } };
    if (!asset.metadata?.category) return <SettingsInputAntennaIcon {...iconProps} />;

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
    }[asset.metadata.category] || SettingsInputAntennaIcon;

    return <IconComponent {...iconProps} />;
  };

  // Get status color
  const getStatusColor = () => {
    const status = asset.metadata?.status || 'operational';
    switch (status) {
      case 'operational': return 'success';
      case 'maintenance': return 'warning';
      case 'offline': return 'default';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header Card */}
      <Paper sx={{ p: 3, bgcolor: '#fff' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
          {/* Icon */}
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: 2,
            bgcolor: '#e3f2fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {getCategoryIcon()}
          </Box>

          {/* Info */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {asset.name}
              </Typography>
              <Chip
                label={asset.metadata?.status || 'Operational'}
                color={getStatusColor()}
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {asset.metadata?.category || asset.type} • {asset.metadata?.serialNumber || 'No serial number'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<BuildOutlinedIcon />}
              >
                Schedule Maintenance
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditOutlinedIcon />}
              >
                Edit Properties
              </Button>
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{ borderRadius: '50%', aspectRatio: 1 }}
              >
                <MoreHorizIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ bgcolor: '#fff' }}>
        <AppTabs
          value={tab}
          onChange={setTab}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          tabs={[
            { label: 'Overview' },
            { label: 'Specifications' },
            { label: 'Maintenance History' },
            { label: 'Sensor Data' },
            { label: 'Documents' },
          ]}
        />

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {tab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Key Information */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Key Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                  {asset.metadata?.serialNumber && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Asset ID
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                        {asset.metadata.serialNumber}
                      </Typography>
                    </Box>
                  )}
                  {asset.metadata?.model && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Model
                      </Typography>
                      <Typography variant="body1">
                        {asset.metadata.model}
                      </Typography>
                    </Box>
                  )}
                  {asset.metadata?.manufacturer && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Manufacturer
                      </Typography>
                      <Typography variant="body1">
                        {asset.metadata.manufacturer}
                      </Typography>
                    </Box>
                  )}
                  {asset.metadata?.installDate && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Install Date
                      </Typography>
                      <Typography variant="body1">
                        {asset.metadata.installDate}
                      </Typography>
                    </Box>
                  )}
                  {asset.metadata?.capacity && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Capacity
                      </Typography>
                      <Typography variant="body1">
                        {asset.metadata.capacity}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Divider />

              {/* Recent Activity */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Recent Activity
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No recent activity to display.
                </Typography>
              </Box>
            </Box>
          )}

          {tab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Technical Specifications
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {asset.metadata?.manufacturer && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Manufacturer</Typography>
                    <Typography variant="body2">{asset.metadata.manufacturer}</Typography>
                  </Box>
                )}
                {asset.metadata?.model && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Model</Typography>
                    <Typography variant="body2">{asset.metadata.model}</Typography>
                  </Box>
                )}
                {asset.metadata?.capacity && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Capacity</Typography>
                    <Typography variant="body2">{asset.metadata.capacity}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {tab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Maintenance History
              </Typography>
              {asset.metadata?.lastMaintenance ? (
                <Typography variant="body2">
                  Last maintenance: {asset.metadata.lastMaintenance}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No maintenance history available.
                </Typography>
              )}
            </Box>
          )}

          {tab === 3 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Sensor Data
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No sensor data available for this asset.
              </Typography>
            </Box>
          )}

          {tab === 4 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Documents
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No documents attached to this asset.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <NotificationsOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
          Alert Settings
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <DescriptionOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
          Generate Report
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setMenuAnchor(null)} sx={{ color: 'error.main' }}>
          Delete Asset
        </MenuItem>
      </Menu>
    </Box>
  );
}
