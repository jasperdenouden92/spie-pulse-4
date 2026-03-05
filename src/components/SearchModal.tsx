import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import BusinessIcon from '@mui/icons-material/Business';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import DescriptionIcon from '@mui/icons-material/Description';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  type: 'building' | 'asset' | 'document' | 'ticket' | 'quotation';
  title: string;
  subtitle?: string;
  date?: string;
  owner?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  building: <BusinessIcon sx={{ fontSize: 18, color: '#1976d2' }} />,
  asset: <PrecisionManufacturingIcon sx={{ fontSize: 18, color: '#f57c00' }} />,
  document: <DescriptionIcon sx={{ fontSize: 18, color: '#7b1fa2' }} />,
  ticket: <ConfirmationNumberIcon sx={{ fontSize: 18, color: '#d32f2f' }} />,
  quotation: <RequestQuoteIcon sx={{ fontSize: 18, color: '#2e7d32' }} />,
};

const mockResults: SearchResult[] = [
  { id: '1', type: 'building', title: '12 Smith St', subtitle: 'Amsterdam, NL', date: '2024-12-01', owner: 'Jan de Vries' },
  { id: '2', type: 'asset', title: 'AHU-01 Air Handling Unit', subtitle: '12 Smith St - Floor 3', date: '2025-01-15', owner: 'Pieter Bakker' },
  { id: '3', type: 'document', title: 'Mechanical O&M Manual', subtitle: '12 Smith St - ABC123-CARE-001', date: '2025-02-10', owner: 'Sarah Jansen' },
  { id: '4', type: 'ticket', title: 'HVAC noise complaint - Room 302', subtitle: '12 Smith St - Priority: High', date: '2025-03-01', owner: 'Jan de Vries' },
  { id: '5', type: 'quotation', title: 'Q-2025-0042 Chiller Replacement', subtitle: '12 Smith St - EUR 24,500', date: '2025-02-28', owner: 'Pieter Bakker' },
  { id: '6', type: 'building', title: '45 Keizersgracht', subtitle: 'Amsterdam, NL', date: '2024-11-20', owner: 'Sarah Jansen' },
];

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('any');
  const [filterOwner, setFilterOwner] = useState<string>('all');

  const filteredResults = mockResults.filter((result) => {
    const matchesQuery = !searchQuery || result.title.toLowerCase().includes(searchQuery.toLowerCase()) || result.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || result.type === filterType;
    const matchesOwner = filterOwner === 'all' || result.owner === filterOwner;
    return matchesQuery && matchesType && matchesOwner;
  });

  const uniqueOwners = Array.from(new Set(mockResults.map((r) => r.owner).filter(Boolean))) as string[];

  const hasActiveFilters = filterType !== 'all' || filterDate !== 'any' || filterOwner !== 'all';

  const clearFilters = () => {
    setFilterType('all');
    setFilterDate('any');
    setFilterOwner('all');
  };

  const handleClose = () => {
    setSearchQuery('');
    setShowFilters(false);
    setFilterType('all');
    setFilterDate('any');
    setFilterOwner('all');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pt: 10,
        zIndex: 1500,
      }}
      slotProps={{
        backdrop: {
          sx: { bgcolor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' },
        },
      }}
    >
      <Paper
        sx={{
          width: '90%',
          maxWidth: 720,
          maxHeight: '75vh',
          outline: 'none',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 16px 70px rgba(0,0,0,0.15)',
        }}
      >
        {/* Search input row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1,
            gap: 1,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <SearchIcon sx={{ color: 'text.disabled', fontSize: 22, ml: 0.5 }} />
          <InputBase
            fullWidth
            placeholder="Search or ask a question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            sx={{
              fontSize: '1.05rem',
              py: 0.75,
              '& input::placeholder': {
                color: '#999',
                opacity: 1,
              },
            }}
          />
          <IconButton
            size="small"
            onClick={() => setShowPreview((v) => !v)}
            sx={{
              color: showPreview ? 'primary.main' : 'text.secondary',
              bgcolor: showPreview ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              '&:hover': { bgcolor: showPreview ? 'rgba(25, 118, 210, 0.12)' : 'action.hover' },
            }}
          >
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setShowFilters((v) => !v)}
            sx={{
              color: showFilters || hasActiveFilters ? 'primary.main' : 'text.secondary',
              bgcolor: showFilters || hasActiveFilters ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              '&:hover': { bgcolor: showFilters || hasActiveFilters ? 'rgba(25, 118, 210, 0.12)' : 'action.hover' },
            }}
          >
            <FilterListIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Filter row */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ overflow: 'hidden' }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2.5,
                  py: 1,
                }}
              >
                <FormControl size="small">
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    displayEmpty
                    variant="standard"
                    disableUnderline
                    sx={{
                      fontSize: '0.813rem',
                      borderRadius: 1,
                      ...(filterType !== 'all'
                        ? {
                            color: 'primary.main',
                            bgcolor: 'rgba(25, 118, 210, 0.08)',
                            '& .MuiSvgIcon-root': { color: 'primary.main' },
                          }
                        : {
                            color: 'text.secondary',
                          }),
                      '& .MuiSelect-select': { py: 0.5, px: 1.5 },
                    }}
                  >
                    <MenuItem value="all">All types</MenuItem>
                    <MenuItem value="building">Building</MenuItem>
                    <MenuItem value="asset">Asset</MenuItem>
                    <MenuItem value="document">Document</MenuItem>
                    <MenuItem value="ticket">Ticket</MenuItem>
                    <MenuItem value="quotation">Quotation</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <Select
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    displayEmpty
                    variant="standard"
                    disableUnderline
                    sx={{
                      fontSize: '0.813rem',
                      borderRadius: 1,
                      ...(filterDate !== 'any'
                        ? {
                            color: 'primary.main',
                            bgcolor: 'rgba(25, 118, 210, 0.08)',
                            '& .MuiSvgIcon-root': { color: 'primary.main' },
                          }
                        : {
                            color: 'text.secondary',
                          }),
                      '& .MuiSelect-select': { py: 0.5, px: 1.5 },
                    }}
                  >
                    <MenuItem value="any">Any date</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="week">Past week</MenuItem>
                    <MenuItem value="month">Past month</MenuItem>
                    <MenuItem value="year">Past year</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <Select
                    value={filterOwner}
                    onChange={(e) => setFilterOwner(e.target.value)}
                    displayEmpty
                    variant="standard"
                    disableUnderline
                    sx={{
                      fontSize: '0.813rem',
                      borderRadius: 1,
                      ...(filterOwner !== 'all'
                        ? {
                            color: 'primary.main',
                            bgcolor: 'rgba(25, 118, 210, 0.08)',
                            '& .MuiSvgIcon-root': { color: 'primary.main' },
                          }
                        : {
                            color: 'text.secondary',
                          }),
                      '& .MuiSelect-select': { py: 0.5, px: 1.5 },
                    }}
                  >
                    <MenuItem value="all">All owners</MenuItem>
                    {uniqueOwners.map((owner) => (
                      <MenuItem key={owner} value={owner}>
                        {owner}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {hasActiveFilters && (
                  <Chip
                    label="Clear"
                    size="small"
                    onDelete={clearFilters}
                    onClick={clearFilters}
                    sx={{ fontSize: '0.75rem', height: 26 }}
                  />
                )}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {filteredResults.length > 0 ? (
            filteredResults.map((result) => (
              <Box
                key={result.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2.5,
                  py: 1.25,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#f5f5f5' },
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {typeIcons[result.type]}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3 }} noWrap>
                    {result.title}
                  </Typography>
                  {result.subtitle && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.3 }} noWrap>
                      {result.subtitle}
                    </Typography>
                  )}
                </Box>
                {showPreview && result.date && (
                  <Typography variant="caption" sx={{ color: 'text.disabled', flexShrink: 0 }}>
                    {result.date}
                  </Typography>
                )}
                {showPreview && result.owner && (
                  <Typography variant="caption" sx={{ color: 'text.disabled', flexShrink: 0, minWidth: 80, textAlign: 'right' }}>
                    {result.owner}
                  </Typography>
                )}
                <Chip
                  label={result.type}
                  size="small"
                  sx={{
                    fontSize: '0.688rem',
                    height: 22,
                    textTransform: 'capitalize',
                    bgcolor: '#f0f0f0',
                    color: 'text.secondary',
                    flexShrink: 0,
                  }}
                />
                <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
              </Box>
            ))
          ) : (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No results found
              </Typography>
            </Box>
          )}
        </Box>

        {/* Footer hint */}
        <Box sx={{ px: 2.5, py: 1, borderTop: 1, borderColor: 'divider', bgcolor: '#fafafa' }}>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
            {hasActiveFilters && ' (filtered)'}
          </Typography>
        </Box>
      </Paper>
    </Modal>
  );
}
