'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useThemeMode } from '@/theme-mode-context';
import FilterChip from '@/components/FilterChip';
import FilterDropdown from '@/components/FilterDropdown';
import FilterRangeDropdown from '@/components/FilterRangeDropdown';
import type { RangeValue } from '@/components/FilterRangeDropdown';
import DateRangeSelector, { parseDateRange, getDateRangeDisplayLabel } from '@/components/DateRangeSelector';
import PageHeader from '@/components/PageHeader';
import { tickets } from '@/data/tickets';
import type { Ticket, TicketStatus, TicketType } from '@/data/tickets';
import { locations } from '@/data/locations';

// ── Constants ──

const TYPE_OPTIONS: TicketType[] = ['Malfunction', 'Maintenance'];
const STATUS_OPTIONS: TicketStatus[] = ['Received', 'In progress', 'Function restored', 'Completed', 'Priced out', 'To approve'];

const STATUS_COLORS: Record<TicketStatus, string> = {
  'Received': '#2196f3',
  'In progress': '#ff9800',
  'Function restored': '#66bb6a',
  'Completed': '#4caf50',
  'Priced out': '#ab47bc',
  'To approve': '#ef6c00',
};

// Statuses that don't have an amount yet
const NO_AMOUNT_STATUSES: TicketStatus[] = ['Received', 'In progress', 'Function restored', 'To approve'];

// Sort options
type SortKey = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'building' | 'status' | 'type';
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'date_desc', label: 'Date (newest first)' },
  { value: 'date_asc', label: 'Date (oldest first)' },
  { value: 'amount_desc', label: 'Amount (high → low)' },
  { value: 'amount_asc', label: 'Amount (low → high)' },
  { value: 'building', label: 'Building (A → Z)' },
  { value: 'status', label: 'Status' },
  { value: 'type', label: 'Type' },
];

const STATUS_ORDER: Record<TicketStatus, number> = {
  'Received': 0,
  'In progress': 1,
  'Function restored': 2,
  'To approve': 3,
  'Priced out': 4,
  'Completed': 5,
};

function sortTickets(list: Ticket[], key: SortKey): Ticket[] {
  const sorted = [...list];
  switch (key) {
    case 'date_desc': return sorted.sort((a, b) => b.createdDate.localeCompare(a.createdDate));
    case 'date_asc': return sorted.sort((a, b) => a.createdDate.localeCompare(b.createdDate));
    case 'amount_desc': return sorted.sort((a, b) => (b.amount ?? -1) - (a.amount ?? -1));
    case 'amount_asc': return sorted.sort((a, b) => (a.amount ?? Infinity) - (b.amount ?? Infinity));
    case 'building': return sorted.sort((a, b) => a.building.localeCompare(b.building));
    case 'status': return sorted.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
    case 'type': return sorted.sort((a, b) => a.type.localeCompare(b.type));
  }
}

function formatAmount(amount: number) {
  return `€\u202f${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Range chip value helpers ──

function amountRangeLabel(range: RangeValue): string | null {
  const { min, max } = range;
  if (!min && !max) return null;
  if (min && max) return `€${min} – €${max}`;
  if (min) return `from €${min}`;
  return `up to €${max}`;
}

// Default date range value for the selector (this year)
const DEFAULT_DATE_RANGE = `2023-07-01|${new Date().toISOString().split('T')[0]}`;

type GroupByKey = 'none' | 'building' | 'city' | 'discipline' | 'status';

const BUILDING_CITY_MAP = new Map(locations.map(l => [l.name, l.city || 'Unknown']));
function getCityForBuilding(building: string): string {
  return BUILDING_CITY_MAP.get(building) || 'Unknown';
}

const PLACEHOLDER_IMAGE = '/images/buildings/placeholder.png';

// ── Ticket thumbnail ──

function TicketThumbnail({ ticket, size = 40 }: { ticket: Ticket; size?: number }) {
  const { themeColors: c } = useThemeMode();
  const src = ticket.imageUrl || PLACEHOLDER_IMAGE;

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

export default function TicketsPage({ initialStatuses }: { initialStatuses?: string[] }) {
  const { themeColors: c } = useThemeMode();

  // View mode, search, sort, pagination, grouping
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const [sortBy, setSortBy] = useState<SortKey>('date_desc');
  const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [rowsPerPageAnchor, setRowsPerPageAnchor] = useState<HTMLElement | null>(null);
  const [groupBy, setGroupBy] = useState<GroupByKey>('none');
  const [groupByMenuAnchor, setGroupByMenuAnchor] = useState<HTMLElement | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [typeAnchor, setTypeAnchor] = useState<HTMLElement | null>(null);

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialStatuses ?? []);
  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null);

  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [clientAnchor, setClientAnchor] = useState<HTMLElement | null>(null);

  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [buildingAnchor, setBuildingAnchor] = useState<HTMLElement | null>(null);

  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [disciplineAnchor, setDisciplineAnchor] = useState<HTMLElement | null>(null);

  const [amountRange, setAmountRange] = useState<RangeValue>({ min: '', max: '' });
  const [amountAnchor, setAmountAnchor] = useState<HTMLElement | null>(null);

  // Date range: stored as "YYYY-MM-DD|YYYY-MM-DD" string, empty = no filter
  const [dateRange, setDateRange] = useState('');
  const [dateDialogOpen, setDateDialogOpen] = useState(false);

  // Derived option lists
  const allClients = useMemo(() => Array.from(new Set(tickets.map(t => t.client))).sort(), []);
  const allBuildings = useMemo(() => Array.from(new Set(tickets.map(t => t.building))).sort(), []);
  const allDisciplines = useMemo(() => Array.from(new Set(tickets.map(t => t.category))).sort(), []);

  // Filtered + searched + sorted data
  const filtered = useMemo<Ticket[]>(() => {
    let list = tickets;
    if (selectedType) list = list.filter(t => t.type === selectedType);
    if (selectedStatuses.length > 0) list = list.filter(t => selectedStatuses.includes(t.status));
    if (selectedClients.length > 0) list = list.filter(t => selectedClients.includes(t.client));
    if (selectedBuildings.length > 0) list = list.filter(t => selectedBuildings.includes(t.building));
    if (selectedDisciplines.length > 0) list = list.filter(t => selectedDisciplines.includes(t.category));
    if (amountRange.min !== '') list = list.filter(t => t.amount != null && t.amount >= Number(amountRange.min));
    if (amountRange.max !== '') list = list.filter(t => t.amount != null && t.amount <= Number(amountRange.max));
    if (dateRange) {
      const { from, to } = parseDateRange(dateRange);
      const fromStr = from.toISOString().split('T')[0];
      const toStr = to.toISOString().split('T')[0];
      list = list.filter(t => t.createdDate >= fromStr && t.createdDate <= toStr);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(t =>
        t.id.toLowerCase().includes(q) ||
        t.referenceNumber.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.building.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.client.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
      );
    }
    return sortTickets(list, sortBy);
  }, [selectedType, selectedStatuses, selectedClients, selectedBuildings, selectedDisciplines, amountRange, dateRange, search, sortBy]);

  // Reset page when filters/search change
  useEffect(() => setPage(0), [selectedType, selectedStatuses, selectedClients, selectedBuildings, selectedDisciplines, amountRange, dateRange, search, sortBy]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginatedTickets = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const ROWS_PER_PAGE_OPTIONS = [15, 30, 50, 100];

  // Grouped output (applied to paginated tickets)
  const grouped = useMemo(() => {
    if (groupBy === 'none') return [{ key: '__all__', label: '', items: paginatedTickets }];
    const map = new Map<string, Ticket[]>();
    for (const t of paginatedTickets) {
      let key: string;
      switch (groupBy) {
        case 'building': key = t.building; break;
        case 'city': key = getCityForBuilding(t.building); break;
        case 'discipline': key = t.category; break;
        case 'status': key = t.status; break;
      }
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, items]) => ({ key, label: key, items }));
  }, [paginatedTickets, groupBy]);

  // Chip value labels
  const statusChipValue = selectedStatuses.length === 0 ? null
    : selectedStatuses.length === 1 ? selectedStatuses[0]
    : `${selectedStatuses.length} statuses`;
  const clientChipValue = selectedClients.length === 0 ? null
    : selectedClients.length === 1 ? selectedClients[0]
    : `${selectedClients.length} clients`;
  const buildingChipValue = selectedBuildings.length === 0 ? null
    : selectedBuildings.length === 1 ? selectedBuildings[0]
    : `${selectedBuildings.length} buildings`;
  const disciplineChipValue = selectedDisciplines.length === 0 ? null
    : selectedDisciplines.length === 1 ? selectedDisciplines[0]
    : `${selectedDisciplines.length} disciplines`;

  const handleBuildingClick = (e: React.MouseEvent, _building: string) => {
    e.stopPropagation();
    // TODO: Open building side panel / navigate to building
  };

  return (
    <Box>
      <PageHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '2rem', lineHeight: 1.3 }}>
              Tickets <Typography component="span" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: '1.25rem' }}>{filtered.length}</Typography>
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
                <MenuItem selected={groupBy === 'none'} onClick={() => { setGroupBy('none'); setGroupByMenuAnchor(null); }}>
                  <ListItemText>No grouping</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem selected={groupBy === 'building'} onClick={() => { setGroupBy('building'); setGroupByMenuAnchor(null); }}>
                  <ListItemText>Building</ListItemText>
                </MenuItem>
                <MenuItem selected={groupBy === 'city'} onClick={() => { setGroupBy('city'); setGroupByMenuAnchor(null); }}>
                  <ListItemText>City</ListItemText>
                </MenuItem>
                <MenuItem selected={groupBy === 'discipline'} onClick={() => { setGroupBy('discipline'); setGroupByMenuAnchor(null); }}>
                  <ListItemText>Discipline</ListItemText>
                </MenuItem>
                <MenuItem selected={groupBy === 'status'} onClick={() => { setGroupBy('status'); setGroupByMenuAnchor(null); }}>
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
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tickets…"
                  sx={{ fontSize: '0.8rem', minWidth: 160, '& input': { p: 0, lineHeight: 1 } }}
                  endAdornment={
                    search ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.25 }}>
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
                onChange={(val) => { if (val) setSortBy(val as SortKey); }}
                hideSearch
              />
              {/* View toggle */}
              <Box sx={{ display: 'flex', border: 1, borderColor: 'divider', borderRadius: '6px', overflow: 'hidden', height: 30 }}>
                <Tooltip title="List">
                  <IconButton
                    size="small"
                    onClick={() => setViewMode('list')}
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
                    onClick={() => setViewMode('grid')}
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
          label="Client"
          value={clientChipValue}
          onClick={(e) => setClientAnchor(e.currentTarget)}
        />
        <FilterDropdown
          anchorEl={clientAnchor}
          onClose={() => setClientAnchor(null)}
          options={allClients.map(cl => ({ value: cl }))}
          multiple
          value={selectedClients}
          onChange={setSelectedClients}
          placeholder="Search client…"
        />
        <FilterChip
          label="Type"
          value={selectedType}
          onClick={(e) => setTypeAnchor(e.currentTarget)}
        />
        <FilterDropdown
          anchorEl={typeAnchor}
          onClose={() => setTypeAnchor(null)}
          options={TYPE_OPTIONS.map(t => ({ value: t }))}
          value={selectedType}
          onChange={setSelectedType}
          placeholder="Search type…"
        />
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
          onChange={setSelectedStatuses}
          placeholder="Search status…"
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
          onChange={setSelectedBuildings}
          placeholder="Search building…"
        />
        <FilterChip
          label="Discipline"
          value={disciplineChipValue}
          onClick={(e) => setDisciplineAnchor(e.currentTarget)}
        />
        <FilterDropdown
          anchorEl={disciplineAnchor}
          onClose={() => setDisciplineAnchor(null)}
          options={allDisciplines.map(d => ({ value: d }))}
          multiple
          value={selectedDisciplines}
          onChange={setSelectedDisciplines}
          placeholder="Search discipline…"
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
          prefix="€"
          placeholderMin="Min"
          placeholderMax="Max"
          value={amountRange}
          onChange={setAmountRange}
        />
        <FilterChip
          label="Date"
          value={dateRange ? getDateRangeDisplayLabel(dateRange) : null}
          onClick={() => setDateDialogOpen(true)}
        />
        <DateRangeSelector
          inline
          hideSlider
          dialogOpen={dateDialogOpen}
          onDialogOpenChange={setDateDialogOpen}
          value={dateRange || DEFAULT_DATE_RANGE}
          onChange={setDateRange}
        />
      </PageHeader>

      {/* ── Content ── */}
      <Box sx={{ pt: 3 }}>
        {filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">No tickets found for the current filters</Typography>
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
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '9%' }} />
                </colgroup>
                <TableHead>
                  <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1, px: 1.5 }}></TableCell>
                    {['Ticket no.', 'Reference', 'Description', 'Building', 'Date', 'Discipline', 'Type', 'Status'].map(h => (
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
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '9%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '9%' }} />
                  </colgroup>
                  <TableBody>
                    {group.items.map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        sx={{ '&:hover': { bgcolor: c.bgPrimaryHover }, cursor: 'pointer' }}
                      >
                        <TableCell sx={{ py: 1, px: 1.5, width: 56 }}>
                          <TicketThumbnail ticket={ticket} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                            {ticket.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', whiteSpace: 'nowrap', color: 'text.secondary' }}>
                            {ticket.referenceNumber}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 280 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }} noWrap>
                            {ticket.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
                            {ticket.description}
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
                            {ticket.building}
                            <OpenInNewIcon className="building-arrow" sx={{ fontSize: 13, ml: 0.25, opacity: 0, transition: 'opacity 0.15s' }} />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', color: 'text.secondary' }}>
                            {formatDate(ticket.createdDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                            {ticket.category}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                            {ticket.type}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.375, bgcolor: c.bgPrimaryHover, borderRadius: '6px' }}>
                            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: STATUS_COLORS[ticket.status], flexShrink: 0 }} />
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap' }}>
                              {ticket.status}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>
                          {NO_AMOUNT_STATUSES.includes(ticket.status) ? (
                            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.disabled' }}>—</Typography>
                          ) : ticket.amount != null ? (
                            <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                              {formatAmount(ticket.amount)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.disabled' }}>—</Typography>
                          )}
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
                {group.items.map((ticket) => (
                  <Card
                    key={ticket.id}
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
                    {/* Image + status badge */}
                    <Box sx={{ position: 'relative', height: 140, bgcolor: c.bgSecondary, overflow: 'hidden' }}>
                      <Box
                        component="img"
                        src={ticket.imageUrl || PLACEHOLDER_IMAGE}
                        alt=""
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {/* Status badge */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: 'rgba(255,255,255,0.92)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: '6px',
                          px: 1,
                          py: 0.375,
                        }}
                      >
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: STATUS_COLORS[ticket.status], flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(0,0,0,0.75)', whiteSpace: 'nowrap' }}>
                          {ticket.status}
                        </Typography>
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      {/* Werkbon + referentie + bedrag */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                          {ticket.id}
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                          {ticket.referenceNumber}
                        </Typography>
                        {!NO_AMOUNT_STATUSES.includes(ticket.status) && ticket.amount != null && (
                          <>
                            <Box sx={{ flex: 1 }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                              {formatAmount(ticket.amount)}
                            </Typography>
                          </>
                        )}
                      </Box>

                      {/* Title */}
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3, mb: 0.25 }} noWrap>
                        {ticket.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4, mb: 1.25 }} noWrap>
                        {ticket.description}
                      </Typography>

                      {/* Meta: datum | soort + discipline */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.25 }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                          <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                          <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                            {formatDate(ticket.createdDate)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                            <HandymanOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                              {ticket.type}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                            <BuildOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled', flexShrink: 0 }} />
                            <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
                              {ticket.category}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Gebouw */}
                      <Box
                        component="span"
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); }}
                        sx={{
                          display: 'inline-flex', alignItems: 'center', gap: 0.25,
                          fontSize: '0.8rem', color: 'text.secondary', cursor: 'pointer',
                          '&:hover': { color: 'text.primary', '& .building-arrow': { opacity: 1 } },
                        }}
                      >
                        {ticket.building}
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
              <IconButton size="small" disabled={page === 0} onClick={() => setPage(0)} sx={{ color: 'text.secondary' }}>
                <FirstPageIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton size="small" disabled={page === 0} onClick={() => setPage(p => p - 1)} sx={{ color: 'text.secondary' }}>
                <ChevronLeftIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', mx: 1 }}>
                {page * rowsPerPage + 1} – {Math.min((page + 1) * rowsPerPage, filtered.length)} of {filtered.length}
              </Typography>
              <IconButton size="small" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} sx={{ color: 'text.secondary' }}>
                <ChevronRightIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton size="small" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)} sx={{ color: 'text.secondary' }}>
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
                onChange={(val) => { if (val) { setRowsPerPage(Number(val)); setPage(0); } }}
                hideSearch
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
