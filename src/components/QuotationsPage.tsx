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
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import EuroOutlinedIcon from '@mui/icons-material/EuroOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { useThemeMode } from '@/theme-mode-context';
import FilterChip from '@/components/FilterChip';
import FilterDropdown from '@/components/FilterDropdown';
import FilterRangeDropdown from '@/components/FilterRangeDropdown';
import type { RangeValue } from '@/components/FilterRangeDropdown';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import { quotations } from '@/data/quotations';
import type { Quotation } from '@/data/quotations';

// ── Constants ──

const STATUS_OPTIONS = ['Draft', 'Pending', 'Approved', 'Rejected', 'Expired'];

const STATUS_COLORS: Record<string, string> = {
  Draft: '#9e9e9e',
  Pending: '#ff9800',
  Approved: '#4caf50',
  Rejected: '#f44336',
  Expired: '#795548',
};

function formatAmount(amount: number) {
  return `€\u202f${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

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

export default function QuotationsPage() {
  const { themeColors: c } = useThemeMode();

  // Default filters
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

  // Optional: Category
  const [showCategory, setShowCategory] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryAnchor, setCategoryAnchor] = useState<HTMLElement | null>(null);
  const categoryChipRef = useRef<HTMLDivElement>(null);
  const [pendingCategoryOpen, setPendingCategoryOpen] = useState(false);

  useEffect(() => {
    if (pendingCategoryOpen && categoryChipRef.current) {
      setCategoryAnchor(categoryChipRef.current);
      setPendingCategoryOpen(false);
    }
  }, [pendingCategoryOpen, showCategory]);

  // Optional: Vendor
  const [showVendor, setShowVendor] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [vendorAnchor, setVendorAnchor] = useState<HTMLElement | null>(null);
  const vendorChipRef = useRef<HTMLDivElement>(null);
  const [pendingVendorOpen, setPendingVendorOpen] = useState(false);

  useEffect(() => {
    if (pendingVendorOpen && vendorChipRef.current) {
      setVendorAnchor(vendorChipRef.current);
      setPendingVendorOpen(false);
    }
  }, [pendingVendorOpen, showVendor]);

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

  // Optional: Expiry date
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
  const allBuildings = useMemo(() => Array.from(new Set(quotations.map(q => q.building))).sort(), []);
  const allCategories = useMemo(() => Array.from(new Set(quotations.map(q => q.category))).sort(), []);
  const allVendors = useMemo(() => Array.from(new Set(quotations.map(q => q.vendor))).sort(), []);

  // Filtered data
  const filtered = useMemo<Quotation[]>(() => {
    let list = quotations;
    if (selectedStatuses.length > 0) list = list.filter(q => selectedStatuses.includes(q.status));
    if (selectedBuildings.length > 0) list = list.filter(q => selectedBuildings.includes(q.building));
    if (selectedCategories.length > 0) list = list.filter(q => selectedCategories.includes(q.category));
    if (selectedVendors.length > 0) list = list.filter(q => selectedVendors.includes(q.vendor));
    if (amountRange.min !== '') list = list.filter(q => q.amount >= Number(amountRange.min));
    if (amountRange.max !== '') list = list.filter(q => q.amount <= Number(amountRange.max));
    if (dateRange.min) list = list.filter(q => q.validUntil >= dateRange.min);
    if (dateRange.max) list = list.filter(q => q.validUntil <= dateRange.max);
    return list;
  }, [selectedStatuses, selectedBuildings, selectedCategories, selectedVendors, amountRange, dateRange]);

  // Chip value labels
  const statusChipValue = selectedStatuses.length === 0 ? null
    : selectedStatuses.length === 1 ? selectedStatuses[0]
    : `${selectedStatuses.length} statuses`;
  const buildingChipValue = selectedBuildings.length === 0 ? null
    : selectedBuildings.length === 1 ? selectedBuildings[0]
    : `${selectedBuildings.length} buildings`;
  const categoryChipValue = selectedCategories.length === 0 ? null
    : selectedCategories.length === 1 ? selectedCategories[0]
    : `${selectedCategories.length} categories`;
  const vendorChipValue = selectedVendors.length === 0 ? null
    : selectedVendors.length === 1 ? selectedVendors[0]
    : `${selectedVendors.length} vendors`;

  const optionalFilters = [
    { key: 'building', label: 'Building', icon: <ApartmentOutlinedIcon fontSize="small" />, visible: showBuilding },
    { key: 'category', label: 'Category', icon: <CategoryOutlinedIcon fontSize="small" />, visible: showCategory },
    { key: 'vendor', label: 'Vendor', icon: <StorefrontOutlinedIcon fontSize="small" />, visible: showVendor },
    { key: 'amount', label: 'Amount', icon: <EuroOutlinedIcon fontSize="small" />, visible: showAmount },
    { key: 'date', label: 'Expiry date', icon: <CalendarTodayOutlinedIcon fontSize="small" />, visible: showDate },
  ];
  const availableToAdd = optionalFilters.filter(f => !f.visible);

  const handleAddFilter = (key: string) => {
    if (key === 'building') { setShowBuilding(true); setPendingBuildingOpen(true); }
    if (key === 'category') { setShowCategory(true); setPendingCategoryOpen(true); }
    if (key === 'vendor') { setShowVendor(true); setPendingVendorOpen(true); }
    if (key === 'amount') { setShowAmount(true); setPendingAmountOpen(true); }
    if (key === 'date') { setShowDate(true); setPendingDateOpen(true); }
    setAddFilterAnchor(null);
  };

  return (
    <Box>
      <PageHeader
        title={<>Quotations <Typography component="span" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: '1.25rem' }}>{filtered.length}</Typography></>}
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
          onChange={setSelectedStatuses}
          placeholder="Search statuses…"
        />
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
        {showCategory && (
          <Box ref={categoryChipRef} sx={{ display: 'inline-flex' }}>
            <FilterChip
              label="Category"
              value={categoryChipValue}
              onClick={(e) => setCategoryAnchor(e.currentTarget)}
              onClear={() => { setSelectedCategories([]); setShowCategory(false); }}
            />
          </Box>
        )}
        <FilterDropdown
          anchorEl={categoryAnchor}
          onClose={() => setCategoryAnchor(null)}
          options={allCategories.map(c => ({ value: c }))}
          multiple
          value={selectedCategories}
          onChange={setSelectedCategories}
          onRemove={() => setShowCategory(false)}
          placeholder="Search categories…"
        />
        {showVendor && (
          <Box ref={vendorChipRef} sx={{ display: 'inline-flex' }}>
            <FilterChip
              label="Vendor"
              value={vendorChipValue}
              onClick={(e) => setVendorAnchor(e.currentTarget)}
              onClear={() => { setSelectedVendors([]); setShowVendor(false); }}
            />
          </Box>
        )}
        <FilterDropdown
          anchorEl={vendorAnchor}
          onClose={() => setVendorAnchor(null)}
          options={allVendors.map(v => ({ value: v }))}
          multiple
          value={selectedVendors}
          onChange={setSelectedVendors}
          onRemove={() => setShowVendor(false)}
          placeholder="Search vendors…"
        />
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
        {showDate && (
          <Box ref={dateChipRef} sx={{ display: 'inline-flex' }}>
            <FilterChip
              label="Expiry date"
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
      </PageHeader>

      {/* ── Table ── */}
      <Box sx={{ pt: 3 }}>
        <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: c.bgPrimary }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: c.bgSecondary }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Nr</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Building</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Vendor</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Valid until</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', textAlign: 'right' }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((q) => (
                <TableRow
                  key={q.id}
                  sx={{ '&:hover': { bgcolor: c.bgPrimaryHover }, cursor: 'pointer' }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                      {q.id}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 260 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }} noWrap>
                      {q.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
                      {q.requestedBy}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                      {q.category}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                      {q.building}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                      {q.vendor}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={q.status}
                      size="small"
                      sx={{
                        bgcolor: `${STATUS_COLORS[q.status]}18`,
                        color: STATUS_COLORS[q.status],
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        border: `1px solid ${STATUS_COLORS[q.status]}40`,
                        height: 22,
                      }}
                    />
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
                        color: q.status === 'Expired' || (q.validUntil < new Date().toISOString().split('T')[0] && q.status !== 'Approved')
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
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No quotations match the current filters</Typography>
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
