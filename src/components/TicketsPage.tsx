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
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AddIcon from '@mui/icons-material/Add';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import EuroOutlinedIcon from '@mui/icons-material/EuroOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { useThemeMode } from '@/theme-mode-context';
import FilterChip from '@/components/FilterChip';
import FilterDropdown from '@/components/FilterDropdown';
import FilterRangeDropdown from '@/components/FilterRangeDropdown';
import type { RangeValue } from '@/components/FilterRangeDropdown';
import Button from '@/components/Button';
import { tickets } from '@/data/tickets';
import type { Ticket } from '@/data/tickets';

// ── Constants ──

const TYPE_OPTIONS = ['Corrective', 'Preventive', 'Request', 'Improvement'];
const STATUS_OPTIONS = ['Open', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];

const STATUS_COLORS: Record<string, string> = {
  'Open': '#2196f3',
  'In Progress': '#ff9800',
  'On Hold': '#9e9e9e',
  'Completed': '#4caf50',
  'Cancelled': '#f44336',
};

const TYPE_COLORS: Record<string, string> = {
  'Corrective': '#ef5350',
  'Preventive': '#42a5f5',
  'Request': '#ab47bc',
  'Improvement': '#26a69a',
};

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
  return `to €${max}`;
}

function dateRangeLabel(range: RangeValue): string | null {
  const { min, max } = range;
  if (!min && !max) return null;
  const fmt = (s: string) => new Date(s).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' });
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `from ${fmt(min)}`;
  return `to ${fmt(max)}`;
}

// ── Main component ──

export default function TicketsPage() {
  const { themeColors: c } = useThemeMode();

  // Default filters
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [typeAnchor, setTypeAnchor] = useState<HTMLElement | null>(null);

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null);

  // Add-filter menu
  const [addFilterAnchor, setAddFilterAnchor] = useState<HTMLElement | null>(null);

  // Optional: Building
  const [showBuilding, setShowBuilding] = useState(false);
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [buildingAnchor, setBuildingAnchor] = useState<HTMLElement | null>(null);
  const buildingChipRef = useRef<HTMLDivElement>(null);
  const [pendingBuildingOpen, setPendingBuildingOpen] = useState(false);

  useEffect(() => {
    if (pendingBuildingOpen && buildingChipRef.current) {
      setBuildingAnchor(buildingChipRef.current);
      setPendingBuildingOpen(false);
    }
  }, [pendingBuildingOpen, showBuilding]);

  // Optional: Discipline
  const [showDiscipline, setShowDiscipline] = useState(false);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [disciplineAnchor, setDisciplineAnchor] = useState<HTMLElement | null>(null);
  const disciplineChipRef = useRef<HTMLDivElement>(null);
  const [pendingDisciplineOpen, setPendingDisciplineOpen] = useState(false);

  useEffect(() => {
    if (pendingDisciplineOpen && disciplineChipRef.current) {
      setDisciplineAnchor(disciplineChipRef.current);
      setPendingDisciplineOpen(false);
    }
  }, [pendingDisciplineOpen, showDiscipline]);

  // Optional: Amount
  const [showAmount, setShowAmount] = useState(false);
  const [amountRange, setAmountRange] = useState<RangeValue>({ min: '', max: '' });
  const [amountAnchor, setAmountAnchor] = useState<HTMLElement | null>(null);
  const amountChipRef = useRef<HTMLDivElement>(null);
  const [pendingAmountOpen, setPendingAmountOpen] = useState(false);

  useEffect(() => {
    if (pendingAmountOpen && amountChipRef.current) {
      setAmountAnchor(amountChipRef.current);
      setPendingAmountOpen(false);
    }
  }, [pendingAmountOpen, showAmount]);

  // Optional: Date
  const [showDate, setShowDate] = useState(false);
  const [dateRange, setDateRange] = useState<RangeValue>({ min: '', max: '' });
  const [dateAnchor, setDateAnchor] = useState<HTMLElement | null>(null);
  const dateChipRef = useRef<HTMLDivElement>(null);
  const [pendingDateOpen, setPendingDateOpen] = useState(false);

  useEffect(() => {
    if (pendingDateOpen && dateChipRef.current) {
      setDateAnchor(dateChipRef.current);
      setPendingDateOpen(false);
    }
  }, [pendingDateOpen, showDate]);

  // Derived option lists
  const allBuildings = useMemo(() => Array.from(new Set(tickets.map(t => t.building))).sort(), []);
  const allDisciplines = useMemo(() => Array.from(new Set(tickets.map(t => t.category))).sort(), []);

  // Filtered data
  const filtered = useMemo<Ticket[]>(() => {
    let list = tickets;
    if (selectedType) list = list.filter(t => t.type === selectedType);
    if (selectedStatuses.length > 0) list = list.filter(t => selectedStatuses.includes(t.status));
    if (selectedBuildings.length > 0) list = list.filter(t => selectedBuildings.includes(t.building));
    if (selectedDisciplines.length > 0) list = list.filter(t => selectedDisciplines.includes(t.category));
    if (amountRange.min !== '') list = list.filter(t => t.amount != null && t.amount >= Number(amountRange.min));
    if (amountRange.max !== '') list = list.filter(t => t.amount != null && t.amount <= Number(amountRange.max));
    if (dateRange.min) list = list.filter(t => t.createdDate >= dateRange.min);
    if (dateRange.max) list = list.filter(t => t.createdDate <= dateRange.max);
    return list;
  }, [selectedType, selectedStatuses, selectedBuildings, selectedDisciplines, amountRange, dateRange]);

  // Chip value labels
  const statusChipValue = selectedStatuses.length === 0 ? null
    : selectedStatuses.length === 1 ? selectedStatuses[0]
    : `${selectedStatuses.length} statuses`;
  const buildingChipValue = selectedBuildings.length === 0 ? null
    : selectedBuildings.length === 1 ? selectedBuildings[0]
    : `${selectedBuildings.length} buildings`;
  const disciplineChipValue = selectedDisciplines.length === 0 ? null
    : selectedDisciplines.length === 1 ? selectedDisciplines[0]
    : `${selectedDisciplines.length} disciplines`;

  const optionalFilters = [
    { key: 'building', label: 'Building', icon: <ApartmentOutlinedIcon fontSize="small" />, visible: showBuilding },
    { key: 'discipline', label: 'Discipline', icon: <BuildOutlinedIcon fontSize="small" />, visible: showDiscipline },
    { key: 'amount', label: 'Amount', icon: <EuroOutlinedIcon fontSize="small" />, visible: showAmount },
    { key: 'date', label: 'Date', icon: <CalendarTodayOutlinedIcon fontSize="small" />, visible: showDate },
  ];
  const availableToAdd = optionalFilters.filter(f => !f.visible);

  const handleAddFilter = (key: string) => {
    if (key === 'building') { setShowBuilding(true); setPendingBuildingOpen(true); }
    if (key === 'discipline') { setShowDiscipline(true); setPendingDisciplineOpen(true); }
    if (key === 'amount') { setShowAmount(true); setPendingAmountOpen(true); }
    if (key === 'date') { setShowDate(true); setPendingDateOpen(true); }
    setAddFilterAnchor(null);
  };

  return (
    <Box>
      {/* ── Title ── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '2rem', lineHeight: 1.3 }}>
          Tickets
        </Typography>
      </Box>

      {/* ── Filter toolbar ── */}
      <Box
        sx={{
          position: 'sticky',
          top: 56,
          zIndex: 100,
          bgcolor: c.bgSecondary,
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 1.25,
          mx: -3,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        {/* Type — default, single select */}
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
          placeholder="Search types…"
        />

        {/* Status — default, multi select */}
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
          placeholder="Search statuses…"
        />

        {/* Building — optional */}
        {showBuilding && (
          <Box ref={buildingChipRef} sx={{ display: 'inline-flex' }}>
            <FilterChip
              label="Building"
              value={buildingChipValue}
              onClick={(e) => setBuildingAnchor(e.currentTarget)}
              onClear={() => { setSelectedBuildings([]); setShowBuilding(false); }}
            />
          </Box>
        )}
        <FilterDropdown
          anchorEl={buildingAnchor}
          onClose={() => setBuildingAnchor(null)}
          options={allBuildings.map(b => ({ value: b }))}
          multiple
          value={selectedBuildings}
          onChange={setSelectedBuildings}
          onRemove={() => setShowBuilding(false)}
          placeholder="Search buildings…"
        />

        {/* Discipline — optional */}
        {showDiscipline && (
          <Box ref={disciplineChipRef} sx={{ display: 'inline-flex' }}>
            <FilterChip
              label="Discipline"
              value={disciplineChipValue}
              onClick={(e) => setDisciplineAnchor(e.currentTarget)}
              onClear={() => { setSelectedDisciplines([]); setShowDiscipline(false); }}
            />
          </Box>
        )}
        <FilterDropdown
          anchorEl={disciplineAnchor}
          onClose={() => setDisciplineAnchor(null)}
          options={allDisciplines.map(d => ({ value: d }))}
          multiple
          value={selectedDisciplines}
          onChange={setSelectedDisciplines}
          onRemove={() => setShowDiscipline(false)}
          placeholder="Search disciplines…"
        />

        {/* Amount — optional */}
        {showAmount && (
          <Box ref={amountChipRef} sx={{ display: 'inline-flex' }}>
            <FilterChip
              label="Amount"
              value={amountRangeLabel(amountRange)}
              onClick={(e) => setAmountAnchor(e.currentTarget)}
              onClear={() => { setAmountRange({ min: '', max: '' }); setShowAmount(false); }}
            />
          </Box>
        )}
        <FilterRangeDropdown
          anchorEl={amountAnchor}
          onClose={() => setAmountAnchor(null)}
          type="number"
          prefix="€"
          placeholderMin="Min"
          placeholderMax="Max"
          value={amountRange}
          onChange={setAmountRange}
          onRemove={() => setShowAmount(false)}
        />

        {/* Date — optional */}
        {showDate && (
          <Box ref={dateChipRef} sx={{ display: 'inline-flex' }}>
            <FilterChip
              label="Date"
              value={dateRangeLabel(dateRange)}
              onClick={(e) => setDateAnchor(e.currentTarget)}
              onClear={() => { setDateRange({ min: '', max: '' }); setShowDate(false); }}
            />
          </Box>
        )}
        <FilterRangeDropdown
          anchorEl={dateAnchor}
          onClose={() => setDateAnchor(null)}
          type="date"
          placeholderMin="From"
          placeholderMax="To"
          value={dateRange}
          onChange={setDateRange}
          onRemove={() => setShowDate(false)}
        />

        {/* Add filter */}
        {availableToAdd.length > 0 && (
          <>
            <Button
              variant="tertiary"
              size="sm"
              startIcon={<AddIcon />}
              onClick={(e) => setAddFilterAnchor(e.currentTarget)}
            >
              Filter
            </Button>
            <Menu
              anchorEl={addFilterAnchor}
              open={Boolean(addFilterAnchor)}
              onClose={() => setAddFilterAnchor(null)}
              slotProps={{ paper: { sx: { borderRadius: '8px', mt: 0.5, minWidth: 160 } } }}
            >
              {availableToAdd.map(opt => (
                <MenuItem key={opt.key} onClick={() => handleAddFilter(opt.key)}>
                  <ListItemIcon>{opt.icon}</ListItemIcon>
                  <ListItemText>{opt.label}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
          </>
        )}

        {/* Result count */}
        <Box sx={{ ml: 'auto', flexShrink: 0 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
            {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Box>

      {/* ── Table ── */}
      <Box sx={{ pt: 3 }}>
        <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: c.bgPrimary }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: c.bgSecondary }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Nr</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Building</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Discipline</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', textAlign: 'right' }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  sx={{ '&:hover': { bgcolor: c.bgPrimaryHover }, cursor: 'pointer' }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                      {ticket.id}
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
                    <Chip
                      label={ticket.type}
                      size="small"
                      sx={{
                        bgcolor: `${TYPE_COLORS[ticket.type]}18`,
                        color: TYPE_COLORS[ticket.type],
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        border: `1px solid ${TYPE_COLORS[ticket.type]}40`,
                        height: 22,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                      {ticket.building}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                      {ticket.category}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.status}
                      size="small"
                      sx={{
                        bgcolor: STATUS_COLORS[ticket.status],
                        color: '#fff',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        height: 22,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', color: 'text.secondary' }}>
                      {formatDate(ticket.createdDate)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    {ticket.amount != null ? (
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {formatAmount(ticket.amount)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.disabled' }}>—</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No tickets match the current filters</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
