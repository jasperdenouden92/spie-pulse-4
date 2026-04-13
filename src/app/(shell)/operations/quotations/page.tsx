'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFilterParams } from '@/hooks/useFilterParams';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Button from '@/components/Button';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useThemeMode } from '@/theme-mode-context';
import FilterChip from '@/components/FilterChip';
import FilterDropdown from '@/components/FilterDropdown';
import FilterRangeDropdown from '@/components/FilterRangeDropdown';
import type { RangeValue } from '@/components/FilterRangeDropdown';
import DateRangeSelector, { parseDateRange, getDateRangeDisplayLabel } from '@/components/DateRangeSelector';
import PageHeader from '@/components/PageHeader';
import { quotations } from '@/data/quotations';
import type { Quotation, QuotationStatus } from '@/data/quotations';

// ── Constants ──

const STATUS_OPTIONS: QuotationStatus[] = ['Pending', 'Open', 'Received', 'Assigned', 'Rejected'];

const STATUS_COLORS: Record<QuotationStatus, string> = {
  Pending: '#ff9800',
  Open: '#2196f3',
  Received: '#4caf50',
  Assigned: '#7c4dff',
  Rejected: '#f44336',
};

// Sort options
type SortKey = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'building' | 'status' | 'contactPerson';
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'date_desc', label: 'Date (newest first)' },
  { value: 'date_asc', label: 'Date (oldest first)' },
  { value: 'amount_desc', label: 'Amount (high \u2192 low)' },
  { value: 'amount_asc', label: 'Amount (low \u2192 high)' },
  { value: 'building', label: 'Building (A \u2192 Z)' },
  { value: 'status', label: 'Status' },
  { value: 'contactPerson', label: 'Contact person (A \u2192 Z)' },
];

const STATUS_ORDER: Record<QuotationStatus, number> = {
  Pending: 0,
  Open: 1,
  Received: 2,
  Assigned: 3,
  Rejected: 4,
};

function sortQuotations(list: Quotation[], key: SortKey): Quotation[] {
  const sorted = [...list];
  switch (key) {
    case 'date_desc': return sorted.sort((a, b) => b.createdDate.localeCompare(a.createdDate));
    case 'date_asc': return sorted.sort((a, b) => a.createdDate.localeCompare(b.createdDate));
    case 'amount_desc': return sorted.sort((a, b) => b.amount - a.amount);
    case 'amount_asc': return sorted.sort((a, b) => a.amount - b.amount);
    case 'building': return sorted.sort((a, b) => a.building.localeCompare(b.building));
    case 'status': return sorted.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
    case 'contactPerson': return sorted.sort((a, b) => a.contactPerson.localeCompare(b.contactPerson));
  }
}

function formatAmount(amount: number) {
  return `\u20AC\u202f${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function amountRangeLabel(range: RangeValue): string | null {
  const { min, max } = range;
  if (!min && !max) return null;
  if (min && max) return `\u20AC${min} \u2013 \u20AC${max}`;
  if (min) return `from \u20AC${min}`;
  return `up to \u20AC${max}`;
}

// Default date range value for the selector
const DEFAULT_DATE_RANGE = `2023-07-01|${new Date().toISOString().split('T')[0]}`;

type GroupByKey = 'none' | 'building' | 'status';

const PLACEHOLDER_IMAGE = '/images/buildings/placeholder.png';

// ── Quotation thumbnail ──

function QuotationThumbnail({ quotation, size = 40 }: { quotation: Quotation; size?: number }) {
  const { themeColors: c } = useThemeMode();
  const src = quotation.imageUrl || PLACEHOLDER_IMAGE;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '6px',
        bgcolor: c.bgSecondary,
        border: `1px solid ${c.borderSecondary}`,
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <Box
        component="img"
        src={src}
        alt=""
        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </Box>
  );
}

// ── Main component ──

export default function OperationsQuotationsRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  const { themeColors: c } = useThemeMode();

  // Read initialStatuses from URL
  const searchParams = useSearchParams();
  const initialStatuses = searchParams.get('statusFilter')?.split(',');

  const { get, set, getList, setList, getNumber, setNumber } = useFilterParams();

  // View mode, search, sort, pagination, grouping
  const viewMode = get('viewMode', 'list') as 'list' | 'grid';
  const search = get('search', '');
  const searchRef = useRef<HTMLInputElement>(null);
  const sortBy = get('sortBy', 'date_desc') as SortKey;
  const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);
  const page = getNumber('page', 0);
  const rowsPerPage = getNumber('rowsPerPage', 50);
  const [rowsPerPageAnchor, setRowsPerPageAnchor] = useState<HTMLElement | null>(null);
  const groupBy = get('groupBy', 'none') as GroupByKey;
  const [groupByMenuAnchor, setGroupByMenuAnchor] = useState<HTMLElement | null>(null);

  // Filters
  const rawStatuses = getList('statuses');
  const selectedStatuses = rawStatuses.length > 0 ? rawStatuses : (initialStatuses ?? []);
  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null);

  const selectedBuildings = getList('buildings');
  const [buildingAnchor, setBuildingAnchor] = useState<HTMLElement | null>(null);

  const amountRange: RangeValue = { min: get('amountMin', ''), max: get('amountMax', '') };
  const [amountAnchor, setAmountAnchor] = useState<HTMLElement | null>(null);

  // Creation date range
  const dateRange = get('dateRange', '');
  const [dateDialogOpen, setDateDialogOpen] = useState(false);

  // Expiration date range
  const expirationRange = get('expirationRange', '');
  const [expirationDialogOpen, setExpirationDialogOpen] = useState(false);

  // Derived option lists
  const allBuildings = useMemo(() => Array.from(new Set(quotations.map(q => q.building))).sort(), []);

  // Filtered + searched + sorted data
  const filtered = useMemo<Quotation[]>(() => {
    let list = quotations;
    if (selectedStatuses.length > 0) list = list.filter(q => selectedStatuses.includes(q.status));
    if (selectedBuildings.length > 0) list = list.filter(q => selectedBuildings.includes(q.building));
    if (amountRange.min !== '') list = list.filter(q => q.amount >= Number(amountRange.min));
    if (amountRange.max !== '') list = list.filter(q => q.amount <= Number(amountRange.max));
    if (dateRange) {
      const { from, to } = parseDateRange(dateRange);
      const fromStr = from.toISOString().split('T')[0];
      const toStr = to.toISOString().split('T')[0];
      list = list.filter(q => q.createdDate >= fromStr && q.createdDate <= toStr);
    }
    if (expirationRange) {
      const { from, to } = parseDateRange(expirationRange);
      const fromStr = from.toISOString().split('T')[0];
      const toStr = to.toISOString().split('T')[0];
      list = list.filter(q => q.validUntil >= fromStr && q.validUntil <= toStr);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(item =>
        item.id.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.building.toLowerCase().includes(q) ||
        item.contactPerson.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
      );
    }
    return sortQuotations(list, sortBy);
  }, [selectedStatuses, selectedBuildings, amountRange, dateRange, expirationRange, search, sortBy]);

  // Reset page when filters/search change
  useEffect(() => setNumber('page', 0, 0), [selectedStatuses, selectedBuildings, amountRange, dateRange, expirationRange, search, sortBy]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginatedQuotations = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const ROWS_PER_PAGE_OPTIONS = [15, 30, 50, 100];

  // Grouped output (applied to paginated quotations)
  const grouped = useMemo(() => {
    if (groupBy === 'none') return [{ key: '__all__', label: '', items: paginatedQuotations }];
    const map = new Map<string, Quotation[]>();
    for (const q of paginatedQuotations) {
      let key: string;
      switch (groupBy) {
        case 'building': key = q.building; break;
        case 'status': key = q.status; break;
      }
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(q);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, items]) => ({ key, label: key, items }));
  }, [paginatedQuotations, groupBy]);

  // Chip value labels
  const statusChipValue = selectedStatuses.length === 0 ? null
    : selectedStatuses.length === 1 ? selectedStatuses[0]
    : `${selectedStatuses.length} statuses`;
  const buildingChipValue = selectedBuildings.length === 0 ? null
    : selectedBuildings.length === 1 ? selectedBuildings[0]
    : `${selectedBuildings.length} buildings`;

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <Box>
        <PageHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '2rem', lineHeight: 1.3 }}>
                Quotations <Typography component="span" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: '1.25rem' }}>{filtered.length}</Typography>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {/* Group by */}
                <Button
                  variant="secondary"
                  size="sm"
                  endIcon={<ExpandMoreIcon />}
                  onClick={(e) => setGroupByMenuAnchor(e.currentTarget)}
                >
                  Group by
                </Button>
                <Menu
                  anchorEl={groupByMenuAnchor}
                  open={Boolean(groupByMenuAnchor)}
                  onClose={() => setGroupByMenuAnchor(null)}
                  slotProps={{ paper: { sx: { borderRadius: '8px', mt: 0.5, minWidth: 160 } } }}
                >
                  <MenuItem selected={groupBy === 'none'} onClick={() => { set('groupBy', 'none'); setGroupByMenuAnchor(null); }}>
                    <ListItemText>No grouping</ListItemText>
                  </MenuItem>
                  <Divider />
                  <MenuItem selected={groupBy === 'building'} onClick={() => { set('groupBy', 'building'); setGroupByMenuAnchor(null); }}>
                    <ListItemText>Building</ListItemText>
                  </MenuItem>
                  <MenuItem selected={groupBy === 'status'} onClick={() => { set('groupBy', 'status'); setGroupByMenuAnchor(null); }}>
                    <ListItemText>Status</ListItemText>
                  </MenuItem>
                </Menu>
                {/* Search */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 30,
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: c.borderSecondary,
                    bgcolor: c.bgPrimary,
                    px: 1,
                    gap: 0.5,
                    '&:focus-within': { borderColor: c.brandSecondary },
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <SearchIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
                  <InputBase
                    inputRef={searchRef}
                    value={search}
                    onChange={(e) => set('search', e.target.value)}
                    placeholder="Search quotations..."
                    sx={{ fontSize: '0.8rem', minWidth: 160, '& input': { p: 0, lineHeight: 1 } }}
                    endAdornment={
                      search ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => set('search', '')} sx={{ p: 0.25 }}>
                            <CloseIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </InputAdornment>
                      ) : null
                    }
                  />
                </Box>
                {/* Sort */}
                <Box
                  onClick={(e) => setSortAnchor(e.currentTarget)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 30,
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: c.borderSecondary,
                    bgcolor: c.bgPrimary,
                    px: 1,
                    gap: 0.5,
                    cursor: 'pointer',
                    '&:hover': { borderColor: c.borderSecondary },
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <SwapVertIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                    {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                  </Typography>
                </Box>
                <FilterDropdown
                  anchorEl={sortAnchor}
                  onClose={() => setSortAnchor(null)}
                  options={SORT_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                  value={sortBy}
                  onChange={(val) => { if (val) set('sortBy', val); }}
                  hideSearch
                />
                {/* View toggle */}
                <Box sx={{ display: 'flex', border: 1, borderColor: 'divider', borderRadius: '6px', overflow: 'hidden', height: 30 }}>
                  <Tooltip title="List">
                    <IconButton
                      size="small"
                      onClick={() => set('viewMode', 'list')}
                      sx={{
                        borderRadius: 0, width: 30, height: 30,
                        bgcolor: viewMode === 'list' ? c.bgActive : 'transparent',
                        color: viewMode === 'list' ? c.brandSecondary : 'text.secondary',
                        '&:hover': { bgcolor: viewMode === 'list' ? c.bgActive : c.bgPrimaryHover },
                      }}
                    >
                      <FormatListBulletedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Box sx={{ width: '1px', bgcolor: 'divider' }} />
                  <Tooltip title="Cards">
                    <IconButton
                      size="small"
                      onClick={() => set('viewMode', 'grid')}
                      sx={{
                        borderRadius: 0, width: 30, height: 30,
                        bgcolor: viewMode === 'grid' ? c.bgActive : 'transparent',
                        color: viewMode === 'grid' ? c.brandSecondary : 'text.secondary',
                        '&:hover': { bgcolor: viewMode === 'grid' ? c.bgActive : c.bgPrimaryHover },
                      }}
                    >
                      <GridViewOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          }
        >
          <FilterChip
            label="Status"
            value={statusChipValue}
            onClick={(e) => setStatusAnchor(e.currentTarget)}
          />
          <FilterDropdown
            anchorEl={statusAnchor}
            onClose={() => setStatusAnchor(null)}
            options={STATUS_OPTIONS.map(s => ({ value: s }))}
            multiple
            value={selectedStatuses}
            onChange={(v) => setList('statuses', v as string[])}
            placeholder="Search statuses..."
          />
          <FilterChip
            label="Building"
            value={buildingChipValue}
            onClick={(e) => setBuildingAnchor(e.currentTarget)}
          />
          <FilterDropdown
            anchorEl={buildingAnchor}
            onClose={() => setBuildingAnchor(null)}
            options={allBuildings.map(b => ({ value: b }))}
            multiple
            value={selectedBuildings}
            onChange={(v) => setList('buildings', v as string[])}
            placeholder="Search buildings..."
          />
          <FilterChip
            label="Amount"
            value={amountRangeLabel(amountRange)}
            onClick={(e) => setAmountAnchor(e.currentTarget)}
          />
          <FilterRangeDropdown
            anchorEl={amountAnchor}
            onClose={() => setAmountAnchor(null)}
            type="number"
            prefix="\u20AC"
            placeholderMin="Min"
            placeholderMax="Max"
            value={amountRange}
            onChange={(v: RangeValue) => { set('amountMin', v.min); set('amountMax', v.max); }}
          />
          <FilterChip
            label="Creation date"
            value={dateRange ? getDateRangeDisplayLabel(dateRange) : null}
            onClick={() => setDateDialogOpen(true)}
          />
          <DateRangeSelector
            inline
            hideSlider
            dialogOpen={dateDialogOpen}
            onDialogOpenChange={setDateDialogOpen}
            value={dateRange || DEFAULT_DATE_RANGE}
            onChange={(v) => set('dateRange', v)}
          />
          <FilterChip
            label="Expiration date"
            value={expirationRange ? getDateRangeDisplayLabel(expirationRange) : null}
            onClick={() => setExpirationDialogOpen(true)}
          />
          <DateRangeSelector
            inline
            hideSlider
            dialogOpen={expirationDialogOpen}
            onDialogOpenChange={setExpirationDialogOpen}
            value={expirationRange || DEFAULT_DATE_RANGE}
            onChange={(v) => set('expirationRange', v)}
          />
        </PageHeader>

        {/* ── Content ── */}
        <Box sx={{ pt: 3 }}>
          {filtered.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No quotations match the current filters</Typography>
            </Box>
          ) : viewMode === 'list' ? (
            /* ── Table view ── */
            grouped.map((group) => (
              <Box key={group.key} sx={{ mb: groupBy !== 'none' ? 4 : 0 }}>
                {groupBy !== 'none' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, mt: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary' }}>
                      {group.label}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
                      {group.items.length}
                    </Typography>
                    <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                  </Box>
                )}
                {/* Header row outside the card */}
                <Table sx={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: 56 }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '22%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '9%' }} />
                    <col style={{ width: '9%' }} />
                    <col style={{ width: '10%' }} />
                  </colgroup>
                  <TableHead>
                    <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1, width: 56, p: '8px 8px 8px 16px' }} />
                      {['Nr', 'Title', 'Building', 'Contact person', 'Status', 'Creation date', 'Expiration date'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1 }}>{h}</TableCell>
                      ))}
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1, textAlign: 'right' }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                </Table>
                {/* Table body inside the card */}
                <Box sx={{ border: `1px solid ${c.cardBorder}`, borderRadius: '12px', bgcolor: c.bgPrimary, boxShadow: c.cardShadow, overflow: 'hidden' }}>
                <TableContainer>
                  <Table sx={{ tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: 56 }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '22%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '9%' }} />
                      <col style={{ width: '9%' }} />
                      <col style={{ width: '10%' }} />
                    </colgroup>
                    <TableBody>
                      {group.items.map((q) => (
                        <TableRow
                          key={q.id}
                          sx={{ '&:hover': { bgcolor: c.bgPrimaryHover }, cursor: 'pointer' }}
                        >
                          <TableCell sx={{ width: 56, p: '8px 8px 8px 16px' }}>
                            <QuotationThumbnail quotation={q} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                              {q.id}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 280 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }} noWrap>
                              {q.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box
                              component="span"
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); }}
                              sx={{
                                display: 'inline-flex', alignItems: 'center', gap: 0.25,
                                fontSize: '0.8125rem', color: 'text.secondary', cursor: 'pointer',
                                '&:hover': { color: 'text.primary', '& .building-arrow': { opacity: 1 } },
                              }}
                            >
                              {q.building}
                              <OpenInNewIcon className="building-arrow" sx={{ fontSize: 13, ml: 0.25, opacity: 0, transition: 'opacity 0.15s' }} />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                              {q.contactPerson}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.375, bgcolor: c.bgPrimaryHover, borderRadius: '6px' }}>
                              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: STATUS_COLORS[q.status], flexShrink: 0 }} />
                              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap' }}>
                                {q.status}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', color: 'text.secondary' }}>
                              {formatDate(q.createdDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: '0.8125rem',
                                whiteSpace: 'nowrap',
                                color: q.validUntil < new Date().toISOString().split('T')[0] && q.status !== 'Received'
                                  ? 'error.main'
                                  : 'text.secondary',
                              }}
                            >
                              {formatDate(q.validUntil)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                              {formatAmount(q.amount)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                </Box>
              </Box>
            ))
          ) : (
            /* ── Card view ── */
            grouped.map((group) => (
              <Box key={group.key} sx={{ mb: groupBy !== 'none' ? 4 : 0 }}>
                {groupBy !== 'none' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, mt: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary' }}>
                      {group.label}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
                      {group.items.length}
                    </Typography>
                    <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                  </Box>
                )}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                  {group.items.map((q) => (
                    <Card
                      key={q.id}
                      sx={{
                        borderRadius: '8px',
                        border: `1px solid ${c.cardBorder}`,
                        boxShadow: `0 2px 12px 0 ${c.shadow}`,
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 20px 0 ${c.shadowMedium}`,
                        },
                      }}
                    >
                      {/* Image header with status badge */}
                      <Box sx={{ position: 'relative', width: '100%', height: 120, overflow: 'hidden' }}>
                        <Box
                          component="img"
                          src={q.imageUrl || PLACEHOLDER_IMAGE}
                          alt=""
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <Box sx={{
                          position: 'absolute', top: 8, right: 8,
                          display: 'inline-flex', alignItems: 'center', gap: 0.5,
                          bgcolor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
                          borderRadius: '6px', px: 1, py: 0.375,
                        }}>
                          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: STATUS_COLORS[q.status], flexShrink: 0 }} />
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {q.status}
                          </Typography>
                        </Box>
                      </Box>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        {/* Nr + amount */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                            {q.id}
                          </Typography>
                          <Box sx={{ flex: 1 }} />
                          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            {formatAmount(q.amount)}
                          </Typography>
                        </Box>

                        {/* Title */}
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3, mb: 0.25 }} noWrap>
                          {q.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4, mb: 1.25 }} noWrap>
                          {q.contactPerson}
                        </Typography>

                        {/* Meta: dates */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.25 }}>
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                            <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                              {formatDate(q.createdDate)}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{
                            color: q.validUntil < new Date().toISOString().split('T')[0] && q.status !== 'Received'
                              ? 'error.main'
                              : 'text.secondary',
                            whiteSpace: 'nowrap'
                          }}>
                            exp. {formatDate(q.validUntil)}
                          </Typography>
                        </Box>

                        {/* Building */}
                        <Box
                          component="span"
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); }}
                          sx={{
                            display: 'inline-flex', alignItems: 'center', gap: 0.25,
                            fontSize: '0.8rem', color: 'text.secondary', cursor: 'pointer',
                            '&:hover': { color: 'text.primary', '& .building-arrow': { opacity: 1 } },
                          }}
                        >
                          {q.building}
                          <OpenInNewIcon className="building-arrow" sx={{ fontSize: 12, ml: 0.25, opacity: 0, transition: 'opacity 0.15s' }} />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            ))
          )}

          {/* ── Pagination ── */}
          {filtered.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pt: 2,
                pb: 1,
              }}
            >
              {/* Left: navigation + range label */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton size="small" disabled={page === 0} onClick={() => setNumber('page', 0, 0)} sx={{ color: 'text.secondary' }}>
                  <FirstPageIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton size="small" disabled={page === 0} onClick={() => setNumber('page', page - 1, 0)} sx={{ color: 'text.secondary' }}>
                  <ChevronLeftIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', mx: 1 }}>
                  {page * rowsPerPage + 1} \u2013 {Math.min((page + 1) * rowsPerPage, filtered.length)} of {filtered.length}
                </Typography>
                <IconButton size="small" disabled={page >= totalPages - 1} onClick={() => setNumber('page', page + 1, 0)} sx={{ color: 'text.secondary' }}>
                  <ChevronRightIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton size="small" disabled={page >= totalPages - 1} onClick={() => setNumber('page', totalPages - 1, 0)} sx={{ color: 'text.secondary' }}>
                  <LastPageIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>

              {/* Right: results per page */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                  Results per page:
                </Typography>
                <Box
                  onClick={(e) => setRowsPerPageAnchor(e.currentTarget)}
                  sx={{
                    display: 'flex', alignItems: 'center', height: 28,
                    borderRadius: '6px', border: '1px solid', borderColor: c.borderSecondary,
                    bgcolor: c.bgPrimary, px: 1, gap: 0.5, cursor: 'pointer',
                    '&:hover': { borderColor: c.borderSecondary },
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                    {rowsPerPage}
                  </Typography>
                </Box>
                <FilterDropdown
                  anchorEl={rowsPerPageAnchor}
                  onClose={() => setRowsPerPageAnchor(null)}
                  options={ROWS_PER_PAGE_OPTIONS.map(n => ({ value: String(n), label: String(n) }))}
                  value={String(rowsPerPage)}
                  onChange={(val) => { if (val) { setNumber('rowsPerPage', Number(val), 50); setNumber('page', 0, 0); } }}
                  hideSearch
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}
