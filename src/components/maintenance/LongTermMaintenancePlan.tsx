'use client';

import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage } from '@/i18n';
import FilterChip from '@/components/FilterChip';
import FilterDropdown from '@/components/FilterDropdown';
import FilterRangeDropdown from '@/components/FilterRangeDropdown';
import YearRangeSlider from './YearRangeSlider';
import { useAppState } from '@/context/AppStateContext';
import type { AssetNode } from '@/data/assetTree';
import {
  maintenanceBudgetLines,
  BUDGET_MIN_YEAR,
  BUDGET_MAX_YEAR,
  BUDGET_CATEGORIES,
  BUDGET_STATUSES,
  type BudgetStatus,
  type MaintenanceBudgetLine,
} from '@/data/maintenanceBudget';

const euroFmt = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

function formatEuro(n: number): string {
  return euroFmt.format(n);
}

function sumYears(line: MaintenanceBudgetLine, fromYear: number, toYear: number): number {
  let total = 0;
  for (let y = fromYear; y <= toYear; y++) total += line.yearlyCosts[y] ?? 0;
  return total;
}

interface BuildingGroup {
  buildingId: string;
  buildingName: string;
  lines: MaintenanceBudgetLine[];
  buildingTotals: Record<number, number>; // per year
  rowTotal: number; // total across visible years
}

export default function LongTermMaintenancePlan() {
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();
  const { setSidePeekAsset, setSidePeekAssetTab } = useAppState();

  const handleAssetClick = (line: MaintenanceBudgetLine) => {
    const node: AssetNode = {
      id: line.id,
      name: line.assetName,
      type: 'asset',
      metadata: {
        category: line.assetCategory,
        location: line.buildingName,
        status: 'operational',
      },
    };
    setSidePeekAsset(node);
    setSidePeekAssetTab('overview');
  };

  // ── Filter state ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [amountRange, setAmountRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [fromYear, setFromYear] = useState(BUDGET_MIN_YEAR);
  const [toYear, setToYear] = useState(BUDGET_MAX_YEAR);

  // Filter anchors
  const [buildingsAnchor, setBuildingsAnchor] = useState<HTMLElement | null>(null);
  const [categoriesAnchor, setCategoriesAnchor] = useState<HTMLElement | null>(null);
  const [statusesAnchor, setStatusesAnchor] = useState<HTMLElement | null>(null);
  const [amountAnchor, setAmountAnchor] = useState<HTMLElement | null>(null);

  // Expanded/collapsed buildings — default all expanded
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleBuilding = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const years = useMemo(() => {
    const ys: number[] = [];
    for (let y = fromYear; y <= toYear; y++) ys.push(y);
    return ys;
  }, [fromYear, toYear]);

  // ── Filter options ────────────────────────────────────────────────────────
  const buildingOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const line of maintenanceBudgetLines) {
      if (!seen.has(line.buildingId)) seen.set(line.buildingId, line.buildingName);
    }
    return Array.from(seen.entries()).map(([value, label]) => ({ value, label }));
  }, []);

  const categoryOptions = BUDGET_CATEGORIES.map(c => ({ value: c, label: c }));
  const statusOptions = BUDGET_STATUSES.map(s => ({
    value: s,
    label: t(`maintenance.budget.status.${s}` as const),
  }));

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredLines = useMemo(() => {
    const minAmount = amountRange.min === '' ? null : Number(amountRange.min);
    const maxAmount = amountRange.max === '' ? null : Number(amountRange.max);
    const q = search.trim().toLowerCase();

    return maintenanceBudgetLines.filter(line => {
      if (selectedBuildings.length > 0 && !selectedBuildings.includes(line.buildingId)) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(line.assetCategory)) return false;
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(line.status)) return false;
      if (q && !line.assetName.toLowerCase().includes(q) && !line.buildingName.toLowerCase().includes(q)) return false;

      // Amount range applies to the per-year max within the visible year range
      if (minAmount !== null || maxAmount !== null) {
        let maxInRange = 0;
        for (let y = fromYear; y <= toYear; y++) {
          const v = line.yearlyCosts[y] ?? 0;
          if (v > maxInRange) maxInRange = v;
        }
        if (minAmount !== null && maxInRange < minAmount) return false;
        if (maxAmount !== null && maxInRange > maxAmount) return false;
      }
      return true;
    });
  }, [search, selectedBuildings, selectedCategories, selectedStatuses, amountRange, fromYear, toYear]);

  // ── Group by building ─────────────────────────────────────────────────────
  const groups = useMemo<BuildingGroup[]>(() => {
    const map = new Map<string, BuildingGroup>();
    for (const line of filteredLines) {
      let g = map.get(line.buildingId);
      if (!g) {
        g = {
          buildingId: line.buildingId,
          buildingName: line.buildingName,
          lines: [],
          buildingTotals: Object.fromEntries(years.map(y => [y, 0])),
          rowTotal: 0,
        };
        map.set(line.buildingId, g);
      }
      g.lines.push(line);
      for (const y of years) {
        const v = line.yearlyCosts[y] ?? 0;
        g.buildingTotals[y] += v;
        g.rowTotal += v;
      }
    }
    return Array.from(map.values()).sort((a, b) => a.buildingName.localeCompare(b.buildingName));
  }, [filteredLines, years]);

  const yearTotals = useMemo(() => {
    const totals: Record<number, number> = Object.fromEntries(years.map(y => [y, 0]));
    for (const g of groups) {
      for (const y of years) totals[y] += g.buildingTotals[y];
    }
    return totals;
  }, [groups, years]);

  const grandTotal = useMemo(() => {
    return Object.values(yearTotals).reduce((s, v) => s + v, 0);
  }, [yearTotals]);

  const anyFilterActive =
    search !== '' ||
    selectedBuildings.length > 0 ||
    selectedCategories.length > 0 ||
    selectedStatuses.length > 0 ||
    amountRange.min !== '' ||
    amountRange.max !== '' ||
    fromYear !== BUDGET_MIN_YEAR ||
    toYear !== BUDGET_MAX_YEAR;

  const resetFilters = () => {
    setSearch('');
    setSelectedBuildings([]);
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setAmountRange({ min: '', max: '' });
    setFromYear(BUDGET_MIN_YEAR);
    setToYear(BUDGET_MAX_YEAR);
  };

  // ── Filter chip labels ────────────────────────────────────────────────────
  const buildingsChipValue = selectedBuildings.length === 0
    ? null
    : selectedBuildings.length === 1
      ? buildingOptions.find(o => o.value === selectedBuildings[0])?.label ?? null
      : `${selectedBuildings.length} selected`;

  const categoriesChipValue = selectedCategories.length === 0
    ? null
    : selectedCategories.length === 1
      ? selectedCategories[0]
      : `${selectedCategories.length} selected`;

  const statusesChipValue = selectedStatuses.length === 0
    ? null
    : selectedStatuses.length === 1
      ? t(`maintenance.budget.status.${selectedStatuses[0] as BudgetStatus}` as const)
      : `${selectedStatuses.length} selected`;

  const amountChipValue = (() => {
    if (amountRange.min === '' && amountRange.max === '') return null;
    const formatN = (s: string) => {
      const n = Number(s);
      if (!Number.isFinite(n)) return s;
      return new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 0 }).format(n);
    };
    if (amountRange.min !== '' && amountRange.max !== '') return `€ ${formatN(amountRange.min)} – € ${formatN(amountRange.max)}`;
    if (amountRange.min !== '') return `≥ € ${formatN(amountRange.min)}`;
    return `≤ € ${formatN(amountRange.max)}`;
  })();

  // ── Rendering ─────────────────────────────────────────────────────────────
  const yearColWidth = 110;
  const totalColWidth = 130;

  return (
    <Box>
      {/* Title + search row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: c.textPrimary }}>
          {t('operations.maintenance.longTermPlan')}
        </Typography>
        <TextField
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('maintenance.budget.search')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: c.textSecondary }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 220,
            '& .MuiOutlinedInput-root': {
              height: 30,
              fontSize: '0.8rem',
              borderRadius: '7px',
              bgcolor: c.bgPrimary,
              '& fieldset': { borderColor: c.borderSecondary },
            },
          }}
        />
      </Box>

      {/* Year range slider */}
      <Box sx={{ mb: 2, px: 0.5 }}>
        <YearRangeSlider
          fromYear={fromYear}
          toYear={toYear}
          onChange={(f, t2) => { setFromYear(f); setToYear(t2); }}
          minYear={BUDGET_MIN_YEAR}
          maxYear={BUDGET_MAX_YEAR}
        />
      </Box>

      {/* Filters row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <FilterChip
          label={t('maintenance.budget.locations')}
          value={buildingsChipValue}
          onClick={(e) => setBuildingsAnchor(e.currentTarget)}
          onClear={() => setSelectedBuildings([])}
        />
        <FilterChip
          label={t('maintenance.budget.assetTypes')}
          value={categoriesChipValue}
          onClick={(e) => setCategoriesAnchor(e.currentTarget)}
          onClear={() => setSelectedCategories([])}
        />
        <FilterChip
          label={t('maintenance.budget.status')}
          value={statusesChipValue}
          onClick={(e) => setStatusesAnchor(e.currentTarget)}
          onClear={() => setSelectedStatuses([])}
        />
        <FilterChip
          label={t('maintenance.budget.amountRange')}
          value={amountChipValue}
          onClick={(e) => setAmountAnchor(e.currentTarget)}
          onClear={() => setAmountRange({ min: '', max: '' })}
        />

        {anyFilterActive && (
          <Box
            component="button"
            onClick={resetFilters}
            sx={{
              ml: 0.5,
              fontSize: '0.8rem',
              fontWeight: 600,
              color: c.brandSecondary,
              bgcolor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              px: 1,
              height: 30,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {t('maintenance.budget.resetFilters')}
          </Box>
        )}
      </Box>

      {/* Filter popovers */}
      <FilterDropdown
        anchorEl={buildingsAnchor}
        onClose={() => setBuildingsAnchor(null)}
        options={buildingOptions}
        multiple
        value={selectedBuildings}
        onChange={setSelectedBuildings}
      />
      <FilterDropdown
        anchorEl={categoriesAnchor}
        onClose={() => setCategoriesAnchor(null)}
        options={categoryOptions}
        multiple
        value={selectedCategories}
        onChange={setSelectedCategories}
      />
      <FilterDropdown
        anchorEl={statusesAnchor}
        onClose={() => setStatusesAnchor(null)}
        options={statusOptions}
        multiple
        value={selectedStatuses}
        onChange={setSelectedStatuses}
      />
      <FilterRangeDropdown
        anchorEl={amountAnchor}
        onClose={() => setAmountAnchor(null)}
        value={amountRange}
        onChange={setAmountRange}
        type="number"
        prefix="€"
        placeholderMin="Min"
        placeholderMax="Max"
      />

      {/* Table */}
      <Box sx={{
        border: `1px solid ${c.borderSecondary}`,
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: c.bgPrimary,
        boxShadow: c.cardShadow,
      }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 260px)' }}>
          <Table stickyHeader size="small" sx={{
            tableLayout: 'fixed',
            '& td, & th': { borderColor: c.borderTertiary },
          }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 3,
                  bgcolor: c.bgSecondary,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  color: c.textSecondary,
                  minWidth: 280,
                  width: 280,
                }}>
                  {t('maintenance.budget.assetColumn')}
                </TableCell>
                {years.map(y => (
                  <TableCell
                    key={y}
                    align="right"
                    sx={{
                      bgcolor: c.bgSecondary,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      color: c.textSecondary,
                      width: yearColWidth,
                    }}
                  >
                    {y}
                  </TableCell>
                ))}
                <TableCell
                  align="right"
                  sx={{
                    bgcolor: c.bgSecondary,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    color: c.textSecondary,
                    width: totalColWidth,
                  }}
                >
                  {t('maintenance.budget.total')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={years.length + 2} sx={{ textAlign: 'center', py: 6 }}>
                    <Typography color="text.secondary">{t('maintenance.budget.noResults')}</Typography>
                  </TableCell>
                </TableRow>
              )}
              {groups.map(group => {
                const isCollapsed = collapsed.has(group.buildingId);
                return (
                  <React.Fragment key={group.buildingId}>
                    {/* Building header row */}
                    <TableRow
                      onClick={() => toggleBuilding(group.buildingId)}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: c.bgSecondary,
                        '&:hover': { bgcolor: c.bgSecondaryHover },
                      }}
                    >
                      <TableCell sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        bgcolor: 'inherit',
                        fontWeight: 600,
                        py: 1,
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <IconButton size="small" sx={{ p: 0.25 }}>
                            {isCollapsed
                              ? <KeyboardArrowRightIcon sx={{ fontSize: 18, color: c.textSecondary }} />
                              : <KeyboardArrowDownIcon sx={{ fontSize: 18, color: c.textSecondary }} />}
                          </IconButton>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: c.textPrimary }}>
                            {group.buildingName}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: c.textTertiary, ml: 0.5 }}>
                            ({group.lines.length})
                          </Typography>
                        </Box>
                      </TableCell>
                      {years.map(y => {
                        const v = group.buildingTotals[y];
                        return (
                          <TableCell key={y} align="right" sx={{ fontSize: '0.8rem', fontWeight: 600, color: c.textPrimary, py: 1 }}>
                            {v > 0 ? formatEuro(v) : <Box component="span" sx={{ color: c.textDisabled }}>—</Box>}
                          </TableCell>
                        );
                      })}
                      <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: 700, color: c.brand, py: 1 }}>
                        {formatEuro(group.rowTotal)}
                      </TableCell>
                    </TableRow>

                    {/* Asset rows */}
                    {!isCollapsed && group.lines.map(line => {
                      const rowTotal = sumYears(line, fromYear, toYear);
                      return (
                        <TableRow
                          key={line.id}
                          onClick={() => handleAssetClick(line)}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { bgcolor: c.bgPrimaryHover },
                            '&:hover .mb-asset-sticky': { bgcolor: c.bgPrimaryHover },
                          }}
                        >
                          <TableCell className="mb-asset-sticky" sx={{
                            position: 'sticky',
                            left: 0,
                            zIndex: 1,
                            bgcolor: c.bgPrimary,
                            pl: 5,
                            py: 0.75,
                          }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: c.textPrimary }}>
                                {line.assetName}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ fontSize: '0.7rem', color: c.textTertiary }}>
                                  {line.assetCategory}
                                </Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: c.textTertiary }}>
                                  •
                                </Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: c.textTertiary }}>
                                  {t(`maintenance.budget.status.${line.status}` as const)}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          {years.map(y => {
                            const v = line.yearlyCosts[y] ?? 0;
                            return (
                              <TableCell key={y} align="right" sx={{ fontSize: '0.8rem', py: 0.75, color: c.textPrimary }}>
                                {v > 0 ? formatEuro(v) : <Box component="span" sx={{ color: c.textDisabled }}>—</Box>}
                              </TableCell>
                            );
                          })}
                          <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 600, color: c.textPrimary, py: 0.75 }}>
                            {rowTotal > 0 ? formatEuro(rowTotal) : <Box component="span" sx={{ color: c.textDisabled }}>—</Box>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </TableBody>
            {/* Totals footer — sticky bottom via per-cell sticky positioning */}
            {groups.length > 0 && (
              <TableBody>
                <TableRow>
                  <TableCell sx={{
                    position: 'sticky',
                    left: 0,
                    bottom: 0,
                    zIndex: 4,
                    bgcolor: c.brandLighter,
                    borderTop: `2px solid ${c.brand}`,
                    borderBottom: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: c.brand,
                    textTransform: 'uppercase',
                    letterSpacing: 0.3,
                  }}>
                    {t('maintenance.budget.yearTotal')}
                  </TableCell>
                  {years.map(y => (
                    <TableCell key={y} align="right" sx={{
                      position: 'sticky',
                      bottom: 0,
                      zIndex: 3,
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: c.brand,
                      bgcolor: c.brandLighter,
                      borderTop: `2px solid ${c.brand}`,
                      borderBottom: 'none',
                    }}>
                      {formatEuro(yearTotals[y] ?? 0)}
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 3,
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: c.brand,
                    bgcolor: c.brandLighter,
                    borderTop: `2px solid ${c.brand}`,
                    borderBottom: 'none',
                  }}>
                    {formatEuro(grandTotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
