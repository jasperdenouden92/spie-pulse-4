import { useThemeMode } from '@/theme-mode-context';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SettingsIcon from '@mui/icons-material/Settings';

interface AssetListPanelProps {
  buildingName?: string;
}

interface AssetEquipment {
  description: string;
  equipmentId: string;
  manufacturer?: string;
  room: string;
  capacity: string;
  year: number;
  number: number;
  unit: string;
  plantId: string;
}

interface AssetCategory {
  name: string;
  count: number;
  expanded: boolean;
  items: AssetEquipment[];
}

// Generate mock asset data
const generateMockData = (): AssetCategory[] => {
  return [
    {
      name: 'Boilers',
      count: 17,
      expanded: true,
      items: [
        {
          description: 'Main Boiler Unit 1',
          equipmentId: '40128747',
          manufacturer: 'ACME',
          room: 'TB-304',
          capacity: '42 kW',
          year: 1999,
          number: 1,
          unit: 'ST',
          plantId: 'G2040'
        },
        {
          description: 'Emergency Boiler Unit',
          equipmentId: 'Incident',
          room: 'T-409',
          capacity: '30 kW',
          year: 2002,
          number: 4,
          unit: 'FL',
          plantId: '49024'
        },
        {
          description: 'Emergency Boiler Unit',
          equipmentId: 'Incident',
          room: 'T-409',
          capacity: '30 kW',
          year: 2002,
          number: 4,
          unit: 'FL',
          plantId: '49024'
        }
      ]
    },
    {
      name: 'AC Inc',
      count: 2,
      expanded: true,
      items: [
        {
          description: 'Main Boiler Unit 1',
          equipmentId: '40128747',
          manufacturer: 'ACME',
          room: 'TB-304',
          capacity: '42 kW',
          year: 1999,
          number: 1,
          unit: 'ST',
          plantId: 'G2040'
        },
        {
          description: 'Emergency Boiler Unit',
          equipmentId: 'Incident',
          room: 'T-409',
          capacity: '30 kW',
          year: 2002,
          number: 4,
          unit: 'FL',
          plantId: '49024'
        }
      ]
    },
    {
      name: 'Heaters',
      count: 10,
      expanded: false,
      items: []
    },
    {
      name: 'Electrical',
      count: 8,
      expanded: false,
      items: []
    }
  ];
};

export default function AssetListPanel({ buildingName }: AssetListPanelProps) {
  const { themeColors: c } = useThemeMode();
  const [categories, setCategories] = useState(generateMockData());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const toggleCategory = (index: number) => {
    setCategories(prev =>
      prev.map((cat, i) =>
        i === index ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 3, height: 600 }}>
      {/* Left Panel - Asset Tree */}
      <Box sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: c.bgPrimary,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Assets
          </Typography>

          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
            }}
            sx={{ mb: 1 }}
          />

          {/* Filter button */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FilterListIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: 'none',
              justifyContent: 'flex-start',
              color: 'text.primary',
              borderColor: 'divider'
            }}
          >
            Filter
          </Button>
        </Box>

        {/* Asset Tree */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {categories.map((category, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              {/* Category Header */}
              <Box
                onClick={() => toggleCategory(index)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  py: 1,
                  px: 1,
                  cursor: 'pointer',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: c.bgPrimaryHover
                  }
                }}
              >
                <IconButton size="small" sx={{ p: 0 }}>
                  {category.expanded ? (
                    <ExpandMoreIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <ChevronRightIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
                <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                  {category.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {category.count} assets
                </Typography>
              </Box>

              {/* Category Items */}
              {category.expanded && category.items.length > 0 && (
                <Box sx={{ pl: 4, mt: 0.5 }}>
                  {category.items.map((item, itemIndex) => (
                    <Box
                      key={itemIndex}
                      sx={{
                        py: 1,
                        px: 1,
                        cursor: 'pointer',
                        borderRadius: 1,
                        bgcolor: selectedRow === `${index}-${itemIndex}` ? c.bgActive : 'transparent',
                        '&:hover': {
                          bgcolor: selectedRow === `${index}-${itemIndex}` ? c.bgActive : c.bgPrimaryHover
                        }
                      }}
                      onClick={() => setSelectedRow(`${index}-${itemIndex}`)}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.813rem' }}>
                        {item.description}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right Panel - Equipment Details Table */}
      <Box sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: c.bgPrimary,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Asset description
          </Typography>
          <IconButton size="small">
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Table */}
        <TableContainer sx={{ flex: 1 }}>
          <Table data-annotation-id="assetlistpanel-tabel" stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: c.bgPrimary }}>
                  Equipment ID
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: c.bgPrimary }}>
                  Manufacturer
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: c.bgPrimary }}>
                  Room
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: c.bgPrimary }}>
                  Capacity
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: c.bgPrimary }}>
                  Year
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: c.bgPrimary }}>
                  Number
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: c.bgPrimary }}>
                  Unit
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: c.bgPrimary }}>
                  Klant ID
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories
                .filter(cat => cat.expanded)
                .flatMap(cat => cat.items)
                .map((item, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:hover': { bgcolor: c.bgPrimaryHover },
                      cursor: 'pointer'
                    }}
                  >
                    <TableCell sx={{ fontSize: '0.813rem' }}>{item.equipmentId}</TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>{item.manufacturer || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>{item.room}</TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>{item.capacity}</TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>{item.year}</TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>{item.number}</TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>{item.unit}</TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>{item.plantId}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
