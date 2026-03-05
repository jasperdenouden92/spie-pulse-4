import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import BusinessIcon from '@mui/icons-material/Business';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import DescriptionIcon from '@mui/icons-material/Description';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
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

interface RecentItem extends SearchResult {
  searchedAt: Date;
}

const typeIcons: Record<string, React.ReactNode> = {
  building: <BusinessIcon sx={{ fontSize: 18 }} />,
  asset: <PrecisionManufacturingIcon sx={{ fontSize: 18 }} />,
  document: <DescriptionIcon sx={{ fontSize: 18 }} />,
  ticket: <ConfirmationNumberIcon sx={{ fontSize: 18 }} />,
  quotation: <RequestQuoteIcon sx={{ fontSize: 18 }} />,
};

const mockResults: SearchResult[] = [
  { id: '1', type: 'building', title: '12 Smith St', subtitle: 'Amsterdam, NL', date: '2024-12-01', owner: 'Jan de Vries' },
  { id: '2', type: 'asset', title: 'AHU-01 Air Handling Unit', subtitle: '12 Smith St - Floor 3', date: '2025-01-15', owner: 'Pieter Bakker' },
  { id: '3', type: 'document', title: 'Mechanical O&M Manual', subtitle: '12 Smith St - ABC123-CARE-001', date: '2025-02-10', owner: 'Sarah Jansen' },
  { id: '4', type: 'ticket', title: 'HVAC noise complaint - Room 302', subtitle: '12 Smith St - Priority: High', date: '2025-03-01', owner: 'Jan de Vries' },
  { id: '5', type: 'quotation', title: 'Q-2025-0042 Chiller Replacement', subtitle: '12 Smith St - EUR 24,500', date: '2025-02-28', owner: 'Pieter Bakker' },
  { id: '6', type: 'building', title: '45 Keizersgracht', subtitle: 'Amsterdam, NL', date: '2024-11-20', owner: 'Sarah Jansen' },
];

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

const initialRecentItems: RecentItem[] = [
  { id: 'r1', type: 'building', title: '12 Smith St', subtitle: 'Amsterdam, NL', searchedAt: hoursAgo(1) },
  { id: 'r2', type: 'ticket', title: 'HVAC noise complaint - Room 302', subtitle: '12 Smith St - Priority: High', searchedAt: hoursAgo(3) },
  { id: 'r3', type: 'asset', title: 'AHU-01 Air Handling Unit', subtitle: '12 Smith St - Floor 3', searchedAt: daysAgo(1) },
  { id: 'r4', type: 'document', title: 'Electrical Safety Procedures', subtitle: '45 Keizersgracht - REF-2025-011', searchedAt: daysAgo(1) },
  { id: 'r5', type: 'quotation', title: 'Q-2025-0042 Chiller Replacement', subtitle: '12 Smith St - EUR 24,500', searchedAt: daysAgo(3) },
  { id: 'r6', type: 'building', title: '45 Keizersgracht', subtitle: 'Amsterdam, NL', searchedAt: daysAgo(5) },
  { id: 'r7', type: 'document', title: 'Mechanical O&M Manual', subtitle: '12 Smith St - ABC123-CARE-001', searchedAt: daysAgo(8) },
];

function getRelativeGroup(date: Date): string {
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return 'Past week';
  return 'Older';
}

function groupByDate(items: RecentItem[]): { label: string; items: RecentItem[] }[] {
  const groups: Map<string, RecentItem[]> = new Map();
  for (const item of items) {
    const label = getRelativeGroup(item.searchedAt);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(item);
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

function ResultRow({ result, showPreview, onClick, active, rowRef }: { result: SearchResult; showPreview: boolean; onClick: () => void; active?: boolean; rowRef?: React.Ref<HTMLDivElement> }) {
  return (
    <Box
      ref={rowRef}
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2.5,
        py: 0.75,
        cursor: 'pointer',
        bgcolor: active ? '#f5f5f5' : 'transparent',
        '&:hover': { bgcolor: '#f5f5f5' },
      }}
    >
      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.disabled' }}>
        {typeIcons[result.type]}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2, flexShrink: 0 }} noWrap>
          {result.title}
        </Typography>
        {result.subtitle && (
          <Typography variant="caption" sx={{ color: 'text.disabled', lineHeight: 1.2, minWidth: 0 }} noWrap>
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
    </Box>
  );
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('any');
  const [filterOwner, setFilterOwner] = useState<string>('all');
  const [recentItems, setRecentItems] = useState<RecentItem[]>(initialRecentItems);
  const [activeIndex, setActiveIndex] = useState(-1);
  const activeRowRef = useRef<HTMLDivElement>(null);

  const isSearching = searchQuery.trim().length > 0;

  const filteredResults = mockResults.filter((result) => {
    const matchesQuery = !searchQuery || result.title.toLowerCase().includes(searchQuery.toLowerCase()) || result.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || result.type === filterType;
    const matchesOwner = filterOwner === 'all' || result.owner === filterOwner;
    return matchesQuery && matchesType && matchesOwner;
  });

  // Flat list of visible items for keyboard navigation
  const visibleItems: SearchResult[] = isSearching
    ? filteredResults
    : recentItems;

  // Reset active index when query or filters change
  useEffect(() => {
    setActiveIndex(-1);
  }, [searchQuery, filterType, filterDate, filterOwner]);

  // Scroll active row into view
  useEffect(() => {
    if (activeIndex >= 0 && activeRowRef.current) {
      activeRowRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const count = visibleItems.length;
    if (count === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < count - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : count - 1));
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : count - 1));
      } else {
        setActiveIndex((prev) => (prev < count - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < count) {
      e.preventDefault();
      handleResultClick(visibleItems[activeIndex]);
    }
  }, [visibleItems, activeIndex]);

  const uniqueOwners = Array.from(new Set(mockResults.map((r) => r.owner).filter(Boolean))) as string[];

  const hasActiveFilters = filterType !== 'all' || filterDate !== 'any' || filterOwner !== 'all';

  const clearFilters = () => {
    setFilterType('all');
    setFilterDate('any');
    setFilterOwner('all');
  };

  const handleResultClick = (result: SearchResult) => {
    setRecentItems((prev) => {
      const filtered = prev.filter((r) => r.id !== result.id);
      return [{ ...result, searchedAt: new Date() }, ...filtered];
    });
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
            onKeyDown={handleKeyDown}
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

        {/* Results / Recent */}
        <Box sx={{ flex: 1, overflowY: 'auto', pt: 0.5, pb: 2 }}>
          {isSearching ? (
            filteredResults.length > 0 ? (
              <>
                <Box
                  sx={{
                    mx: 2.5,
                    mt: 1.5,
                    mb: 1,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 1,
                    bgcolor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#efefef' },
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.813rem' }}>
                    Search everything with AI
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.disabled', fontSize: '0.813rem' }}>
                    &ldquo;{searchQuery}&rdquo;
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.disabled', px: 2.5, pt: 0.5, pb: 0.5, display: 'block', fontWeight: 600 }}
                >
                  Search results
                </Typography>
                {filteredResults.map((result, i) => (
                  <ResultRow
                    key={result.id}
                    result={result}
                    showPreview={showPreview}
                    active={i === activeIndex}
                    rowRef={i === activeIndex ? activeRowRef : undefined}
                    onClick={() => handleResultClick(result)}
                  />
                ))}
              </>
            ) : (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No results found
                </Typography>
              </Box>
            )
          ) : (
            recentItems.length > 0 ? (
              (() => {
                let flatIndex = 0;
                return groupByDate(recentItems).map((group) => (
                  <Box key={group.label}>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.disabled', px: 2.5, pt: 1.5, pb: 0.5, display: 'block', fontWeight: 600 }}
                    >
                      {group.label}
                    </Typography>
                    {group.items.map((item) => {
                      const idx = flatIndex++;
                      return (
                        <ResultRow
                          key={item.id}
                          result={item}
                          showPreview={showPreview}
                          active={idx === activeIndex}
                          rowRef={idx === activeIndex ? activeRowRef : undefined}
                          onClick={() => handleResultClick(item)}
                        />
                      );
                    })}
                  </Box>
                ));
              })()
            ) : (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No recent searches
                </Typography>
              </Box>
            )
          )}
        </Box>
      </Paper>
    </Modal>
  );
}
