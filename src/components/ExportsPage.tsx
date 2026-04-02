import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useThemeMode } from '@/theme-mode-context';

interface ExportItem {
  id: string;
  name: string;
  origin: string;
  createdAt: string;
  size: string;
  format: string;
}

const initialExports: ExportItem[] = [
  { id: '1', name: 'Control Room Overview Q1 2026', origin: 'Control Room', createdAt: '2026-03-05T14:32:00', size: '2.4 MB', format: 'PDF' },
  { id: '2', name: 'Skyline Plaza — Energy Report', origin: 'Control Room › Skyline Plaza › Energy', createdAt: '2026-03-04T09:15:00', size: '1.1 MB', format: 'PDF' },
  { id: '3', name: 'Portfolio Buildings Export', origin: 'Control Room', createdAt: '2026-03-03T16:48:00', size: '348 KB', format: 'CSV' },
  { id: '4', name: 'Heritage Building — Asset Monitoring', origin: 'Control Room › Heritage Building › Asset Monitoring', createdAt: '2026-03-01T11:20:00', size: '890 KB', format: 'PDF' },
  { id: '5', name: 'Tickets Overview February', origin: 'Control Room › Operations › Tickets', createdAt: '2026-02-28T17:05:00', size: '512 KB', format: 'XLSX' },
  { id: '6', name: 'Sustainability KPI Report', origin: 'Control Room › Themes › Sustainability', createdAt: '2026-02-25T10:30:00', size: '1.8 MB', format: 'PDF' },
  { id: '7', name: 'Comfort Analysis — All Buildings', origin: 'Control Room › Themes › Comfort', createdAt: '2026-02-20T13:45:00', size: '2.1 MB', format: 'PDF' },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${hours}:${mins}`;
}

const formatChipColor = (format: string): 'default' | 'primary' | 'success' | 'warning' => {
  switch (format) {
    case 'PDF': return 'primary';
    case 'CSV': return 'success';
    case 'XLSX': return 'warning';
    default: return 'default';
  }
};

function ExportsPage() {
  const { themeColors: c } = useThemeMode();
  const [exports, setExports] = useState<ExportItem[]>(initialExports);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleRemove = (id: string) => {
    setExports(exports.filter(e => e.id !== id));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Exports</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {exports.length} export{exports.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Box>

      {exports.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <DescriptionOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body1" color="text.secondary">No exports yet</Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            Use the Export button in the Control Room to create exports.
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ bgcolor: c.bgPrimary, borderRadius: 1, border: `1px solid ${c.borderSecondary}` }}>
          <Table data-annotation-id="exportspage-tabel">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', borderBottom: `1px solid ${c.borderSecondary}` }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', borderBottom: `1px solid ${c.borderSecondary}` }}>Origin</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', borderBottom: `1px solid ${c.borderSecondary}` }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', borderBottom: `1px solid ${c.borderSecondary}` }}>Format</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', borderBottom: `1px solid ${c.borderSecondary}` }}>Size</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', borderBottom: `1px solid ${c.borderSecondary}`, width: 80 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {exports.map((item) => (
                <TableRow
                  key={item.id}
                  onMouseEnter={() => setHoveredRow(item.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  sx={{
                    '&:last-child td': { borderBottom: 0 },
                    '&:hover': { bgcolor: c.bgSecondary },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500, py: 1.5 }}>
                    {item.name}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem', color: 'text.secondary', py: 1.5 }}>
                    {item.origin}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem', color: 'text.secondary', py: 1.5, whiteSpace: 'nowrap' }}>
                    {formatDate(item.createdAt)}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Chip
                      label={item.format}
                      size="small"
                      color={formatChipColor(item.format)}
                      variant="outlined"
                      sx={{ fontSize: '0.75rem', height: 22, fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem', color: 'text.secondary', py: 1.5 }}>
                    {item.size}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, opacity: hoveredRow === item.id ? 1 : 0, transition: 'opacity 0.15s ease' }}>
                      <Tooltip title="Download">
                        <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                          <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton size="small" onClick={() => handleRemove(item.id)} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}


export default React.memo(ExportsPage);
