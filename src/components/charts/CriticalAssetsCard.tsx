import { useThemeMode } from '@/theme-mode-context';
import { seededRandomFromKey } from '@/data/generators';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface CriticalAssetsCardProps {
  buildingName?: string;
  assetFilter?: string;
  isInspectMode?: boolean;
  onInspectAsset?: (assetId: string, assetName: string, assetCategory: string) => void;
  onHoverAsset?: (asset: { id: string; name: string; category: string } | null, event?: React.MouseEvent) => void;
  hoveredAssetId?: string | null;
}

interface CriticalAsset {
  id: string;
  name: string;
  category: string;
  issue: string;
  severity: 'critical' | 'warning';
  daysOverdue?: number;
  nextAction: string;
}

// Generate mock critical assets data
const generateMockData = (assetFilter?: string, buildingName?: string): CriticalAsset[] => {
  const rand = buildingName ? seededRandomFromKey(buildingName + 'critical') : null;
  const shuffle = <T,>(arr: T[]): T[] => {
    if (!rand) return arr;
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const assets: CriticalAsset[] = [
    {
      id: 'AHU-F6-01',
      name: 'Air Handler Unit - Floor 6',
      category: 'HVAC',
      issue: 'Filter pressure exceeds threshold',
      severity: 'critical',
      daysOverdue: 3,
      nextAction: 'Replace filters immediately'
    },
    {
      id: 'PUMP-B2-03',
      name: 'Circulation Pump B2',
      category: 'Plumbing',
      issue: 'Vibration levels elevated',
      severity: 'warning',
      nextAction: 'Schedule inspection within 7 days'
    },
    {
      id: 'ELEV-01',
      name: 'Main Elevator 1',
      category: 'Elevators',
      issue: 'Door sensor misalignment',
      severity: 'warning',
      nextAction: 'Adjust sensors at next service'
    },
    {
      id: 'CHILLER-01',
      name: 'Central Chiller Unit',
      category: 'HVAC',
      issue: 'Refrigerant pressure below optimal',
      severity: 'critical',
      daysOverdue: 1,
      nextAction: 'Check for leaks and recharge'
    },
    {
      id: 'PUMP-F3-02',
      name: 'Water Pump - Floor 3',
      category: 'Plumbing',
      issue: 'Flow rate decreased by 15%',
      severity: 'warning',
      nextAction: 'Inspect for blockages'
    }
  ];

  const shuffled = shuffle(assets);
  return assetFilter ? shuffled.slice(0, 2) : shuffled;
};

export default function CriticalAssetsCard({
  buildingName,
  assetFilter,
  isInspectMode = false,
  onInspectAsset,
  onHoverAsset,
  hoveredAssetId
}: CriticalAssetsCardProps) {
  const { themeColors: c } = useThemeMode();
  const data = generateMockData(assetFilter, buildingName);
  const criticalCount = data.filter(a => a.severity === 'critical').length;
  const warningCount = data.filter(a => a.severity === 'warning').length;

  return (
    <Box sx={{
      p: 3,
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      bgcolor: c.bgPrimary,
      height: 500,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Critical Assets
        </Typography>
        <IconButton size="small" sx={{ borderRadius: "50%", aspectRatio: 1 }}>
          <MoreHorizIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box
          sx={{
            flex: 1,
            p: 2,
            bgcolor: '#ffebee',
            borderRadius: 1,
            border: '1px solid',
            borderColor: '#ef5350'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <ErrorOutlineIcon sx={{ fontSize: 18, color: '#ef5350' }} />
            <Typography variant="caption" sx={{ color: '#ef5350', fontWeight: 600 }}>
              CRITICAL
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#ef5350' }}>
            {criticalCount}
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            p: 2,
            bgcolor: '#fff3e0',
            borderRadius: 1,
            border: '1px solid',
            borderColor: '#ffa726'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <WarningAmberIcon sx={{ fontSize: 18, color: '#ffa726' }} />
            <Typography variant="caption" sx={{ color: '#ffa726', fontWeight: 600 }}>
              WARNING
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#ffa726' }}>
            {warningCount}
          </Typography>
        </Box>
      </Box>

      {/* Asset list */}
      <Box sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        pr: 1,
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          bgcolor: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: '#d0d0d0',
          borderRadius: '4px',
          '&:hover': {
            bgcolor: '#b0b0b0',
          },
        },
      }}>
        {data.map((asset) => (
          <Box
            key={asset.id}
            onClick={(e) => {
              if (isInspectMode && onInspectAsset) {
                e.stopPropagation();
                onInspectAsset(asset.id, asset.name, asset.category);
              }
            }}
            onMouseEnter={(e) => {
              if (isInspectMode && onHoverAsset) {
                onHoverAsset({ id: asset.id, name: asset.name, category: asset.category }, e);
              }
            }}
            onMouseLeave={() => {
              if (isInspectMode && onHoverAsset) {
                onHoverAsset(null);
              }
            }}
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: c.bgSecondary,
              outline: isInspectMode && hoveredAssetId === asset.id ? `3px dashed ${c.brandSecondary}` : 'none',
              outlineOffset: '4px',
              transition: 'outline 0.2s ease, background-color 0.2s ease',
              position: 'relative',
              zIndex: isInspectMode && hoveredAssetId === asset.id ? 1100 : 'auto',
              cursor: isInspectMode ? 'pointer' : 'default',
              '&:hover': {
                bgcolor: isInspectMode ? c.bgPrimaryHover : c.bgPrimaryHover,
                cursor: isInspectMode ? 'pointer' : 'pointer'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {asset.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {asset.id} · {asset.category}
                </Typography>
              </Box>
              <Chip
                label={asset.severity.toUpperCase()}
                size="small"
                sx={{
                  bgcolor: asset.severity === 'critical' ? c.statusPoor : c.statusModerate,
                  color: c.bgPrimary,
                  fontWeight: 600,
                  fontSize: '0.688rem',
                  height: 20
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              {asset.issue}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 500 }}>
                {asset.nextAction}
              </Typography>
              {asset.daysOverdue && (
                <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
                  {asset.daysOverdue} days overdue
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
