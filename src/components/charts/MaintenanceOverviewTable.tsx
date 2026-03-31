import { colors } from '@/colors';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface MaintenanceOverviewTableProps {
  buildingName?: string;
  assetFilter?: string;
  title?: string;
}

interface MaintenanceRecord {
  location: string;
  equipment: string;
  failureMode: string;
  value: string;
  upperLimit: string;
  daysSince: string;
  upperLimitDays: string;
  remainingWeeks: string;
  advisedDate: string;
  plannedDate: string;
  lastMaintenance: string;
}

// Generate mock maintenance data
const generateMockData = (assetFilter?: string): MaintenanceRecord[] => {
  const equipment = [
    'LBK A bouwdeel',
    'LBK B bouwdeel',
    'LBK C bouwdeel',
    'LBK D bouwdeel',
    'LBK E bouwdeel',
    'LBK F bouwdeel',
    'LBK G bouwdeel',
    'LBK H bouwdeel',
  ];

  const failureModes = [
    'Buitenlucht filter',
    'Retourlucht filter',
  ];

  return equipment.slice(0, assetFilter ? 3 : 8).map((eq, index) => ({
    location: 'Demo project',
    equipment: eq,
    failureMode: failureModes[index % 2],
    value: `${Math.floor(((index * 37 + 13) % 100) + 10)} Pa`,
    upperLimit: `${Math.floor(((index * 41 + 7) % 50) + 50)} Pa`,
    daysSince: `${Math.floor(((index * 53 + 17) % 50) + 80)} day`,
    upperLimitDays: `${Math.floor(((index * 59 + 23) % 400) + 300)} day`,
    remainingWeeks: index % 3 === 0 ? '0.00 wk' : `${Math.floor(((index * 43 + 11) % 20) + 5)}.0wk`,
    advisedDate: index % 3 === 0 ? `${26 + index}.01.2026` : `> 29.07.2026`,
    plannedDate: 'geen OH gepland',
    lastMaintenance: `00100128${index + 30}34`
  }));
};

export default function MaintenanceOverviewTable({
  buildingName,
  assetFilter,
  title = 'Maintenance overview air filters'
}: MaintenanceOverviewTableProps) {
  const data = generateMockData(assetFilter);

  return (
    <Box sx={{
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      bgcolor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 600
    }}>
      {/* Header */}
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <IconButton size="small">
            <InfoOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          </IconButton>
        </Box>
        <IconButton size="small" sx={{ borderRadius: '50%', aspectRatio: 1 }}>
          <MoreHorizIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Table */}
      <TableContainer sx={{
        flex: 1,
        minHeight: 0,
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
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
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#fff' }}>
                Locatie
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#fff' }}>
                Equipment
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#fff' }}>
                Faalvorm
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#fff' }}>
                Waarde
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#fff' }}>
                BovenGrens
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#fff' }}>
                Dagen sinds...
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#fff' }}>
                BovenGrens
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#fff' }}>
                Resterende...
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#fff' }}>
                Advies OM d...
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#fff' }}>
                Gepland OM i...
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#fff' }}>
                laatste OM t...
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index}
                sx={{ '&:hover': { bgcolor: colors.bgPrimaryHover } }}
              >
                <TableCell sx={{ fontSize: '0.813rem' }}>{row.location}</TableCell>
                <TableCell sx={{ fontSize: '0.813rem' }}>{row.equipment}</TableCell>
                <TableCell sx={{ fontSize: '0.813rem' }}>{row.failureMode}</TableCell>
                <TableCell sx={{ fontSize: '0.813rem' }}>{row.value}</TableCell>
                <TableCell sx={{ fontSize: '0.813rem' }}>{row.upperLimit}</TableCell>
                <TableCell sx={{ fontSize: '0.813rem' }}>{row.daysSince}</TableCell>
                <TableCell sx={{ fontSize: '0.813rem' }}>{row.upperLimitDays}</TableCell>
                <TableCell
                  sx={{
                    fontSize: '0.813rem',
                    color: row.remainingWeeks === '0.00 wk' ? 'error.main' : 'inherit',
                    fontWeight: row.remainingWeeks === '0.00 wk' ? 600 : 400
                  }}
                >
                  {row.remainingWeeks}
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: '0.813rem',
                    color: !row.advisedDate.startsWith('>') ? 'error.main' : 'inherit'
                  }}
                >
                  {row.advisedDate}
                </TableCell>
                <TableCell sx={{ fontSize: '0.813rem' }}>{row.plannedDate}</TableCell>
                <TableCell sx={{ fontSize: '0.813rem' }}>{row.lastMaintenance}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Data points info */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 2 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: colors.brand }} />
            Distributie Aanvoertemperatuur, CV na buffer - S2TT12
          </Box>
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ef5350' }} />
            Distributie Aanvoertemperatuur, CV na ketel - S2TT03
          </Box>
        </Typography>
      </Box>

      {/* Guidelines info */}
      <Box sx={{ p: 2, bgcolor: colors.bgPrimaryHover, display: 'flex', gap: 2 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <InfoOutlinedIcon sx={{ fontSize: 12 }} />
            Optimaal temperatuur KNMI tussenruimte ('s-Gravenhage - 10)
          </Box>
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <InfoOutlinedIcon sx={{ fontSize: 12 }} />
            Distributie Buitentemperatuur X5B8 (weerstationsID - 10)
          </Box>
        </Typography>
      </Box>

      {/* Schedule info */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box component="span" sx={{ fontSize: '0.875rem' }}>🕒</Box>
          Effect opening hours
        </Typography>
      </Box>
    </Box>
  );
}
