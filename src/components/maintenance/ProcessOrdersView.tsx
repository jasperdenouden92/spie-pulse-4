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
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Popover from '@mui/material/Popover';
import SearchIcon from '@mui/icons-material/Search';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage } from '@/i18n';
import { useURLState } from '@/hooks/useURLState';
import FilterChip from '@/components/FilterChip';
import FilterDropdown from '@/components/FilterDropdown';
import FilterRangeDropdown from '@/components/FilterRangeDropdown';
import MonthRangeSlider from './MonthRangeSlider';
import { useAppState } from '@/context/AppStateContext';
import { buildings } from '@/data/buildings';
import {
  processOrderLines,
  PROCESS_ORDERS_MIN_MONTH,
  PROCESS_ORDERS_MAX_MONTH,
  PROCESS_ORDER_STATUSES,
  iterateMonths,
  type ProcessOrderStatus,
  type ProcessOrderLocationLine,
  type ServiceOrder,
} from '@/data/processOrders';

interface TotalsByMonth {
  planned: number;
  executed: number;
}

function sumRange(
  line: ProcessOrderLocationLine,
  monthKeys: string[],
): TotalsByMonth {
  let planned = 0;
  let executed = 0;
  for (const k of monthKeys) {
    const cell = line.byMonth[k];
    if (!cell) continue;
    planned += cell.planned;
    executed += cell.executed;
  }
  return { planned, executed };
}

interface SplitStatusCellProps {
  planned: number;
  executed: number;
  plannedColor: string;
  plannedBg: string;
  executedColor: string;
  executedBg: string;
  disabledColor: string;
}

function SplitStatusCell({
  planned, executed,
  plannedColor, plannedBg,
  executedColor, executedBg,
  disabledColor,
}: SplitStatusCellProps) {
  if (planned === 0 && executed === 0) {
    return <Box component="span" sx={{ color: disabledColor }}>—</Box>;
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'stretch' }}>
      {planned > 0 && (
        <Box sx={{
          bgcolor: plannedBg, color: plannedColor,
          py: 0.25, borderRadius: '3px',
          fontSize: '0.72rem', fontWeight: 700, textAlign: 'center',
          lineHeight: 1.2,
        }}>
          {planned}
        </Box>
      )}
      {executed > 0 && (
        <Box sx={{
          bgcolor: executedBg, color: executedColor,
          py: 0.25, borderRadius: '3px',
          fontSize: '0.72rem', fontWeight: 700, textAlign: 'center',
          lineHeight: 1.2,
        }}>
          {executed}
        </Box>
      )}
    </Box>
  );
}

export default function ProcessOrdersView() {
  const { themeColors: c } = useThemeMode();
  const { t, locale } = useLanguage();
  const { setSidePeekBuilding, setSidePeekBuildingTab, setSidePeekServiceOrder } = useAppState();
  const { selectedTenant } = useURLState();

  // Scope to current tenant — this page is tenant-level so only show the tenant's buildings.
  const tenantBuildingIds = useMemo(
    () => new Set(buildings.filter(b => b.tenant === selectedTenant).map(b => b.id)),
    [selectedTenant],
  );
  const tenantLines = useMemo(
    () => processOrderLines.filter(l => tenantBuildingIds.has(l.buildingId)),
    [tenantBuildingIds],
  );

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [countRange, setCountRange] = useState<{ min: string; max: string }>({ min: '', max: '' });

  // Month range state
  const [fromYear, setFromYear] = useState(PROCESS_ORDERS_MIN_MONTH.year);
  const [fromMonth, setFromMonth] = useState(PROCESS_ORDERS_MIN_MONTH.month);
  const [toYear, setToYear] = useState(PROCESS_ORDERS_MAX_MONTH.year);
  const [toMonth, setToMonth] = useState(PROCESS_ORDERS_MAX_MONTH.month);

  // Anchors
  const [buildingsAnchor, setBuildingsAnchor] = useState<HTMLElement | null>(null);
  const [statusesAnchor, setStatusesAnchor] = useState<HTMLElement | null>(null);
  const [countAnchor, setCountAnchor] = useState<HTMLElement | null>(null);

  // Cell order-picker popover
  const [orderPopover, setOrderPopover] = useState<{
    anchor: HTMLElement;
    orders: ServiceOrder[];
    month: { year: number; month: number };
  } | null>(null);

  const visibleMonths = useMemo(
    () => iterateMonths(fromYear, fromMonth, toYear, toMonth),
    [fromYear, fromMonth, toYear, toMonth],
  );
  const monthKeys = useMemo(() => visibleMonths.map(m => m.key), [visibleMonths]);

  // Options
  const buildingOptions = useMemo(
    () => tenantLines.map(l => ({ value: l.buildingId, label: l.buildingName })),
    [tenantLines],
  );
  const statusOptions = useMemo(
    () => PROCESS_ORDER_STATUSES.map(s => ({
      value: s,
      label: t(`maintenance.processOrders.status.${s}` as const),
    })),
    [t],
  );

  // Filtering
  const filteredLines = useMemo(() => {
    const q = search.trim().toLowerCase();
    const minN = countRange.min === '' ? null : Number(countRange.min);
    const maxN = countRange.max === '' ? null : Number(countRange.max);
    const statusSet = new Set<ProcessOrderStatus>(selectedStatuses as ProcessOrderStatus[]);
    const hasStatusFilter = selectedStatuses.length > 0 && selectedStatuses.length < PROCESS_ORDER_STATUSES.length;

    return tenantLines.filter(line => {
      if (selectedBuildings.length > 0 && !selectedBuildings.includes(line.buildingId)) return false;
      if (q && !line.buildingName.toLowerCase().includes(q)) return false;

      const totals = sumRange(line, monthKeys);
      const totalForFilter = hasStatusFilter
        ? (statusSet.has('planned') ? totals.planned : 0) + (statusSet.has('executed') ? totals.executed : 0)
        : totals.planned + totals.executed;

      if (hasStatusFilter && totalForFilter === 0) return false;

      if (minN !== null && totalForFilter < minN) return false;
      if (maxN !== null && totalForFilter > maxN) return false;

      return true;
    });
  }, [tenantLines, search, selectedBuildings, selectedStatuses, countRange, monthKeys]);

  // Per-month totals across filtered rows (footer)
  const monthTotals = useMemo(() => {
    const byKey: Record<string, TotalsByMonth> = {};
    for (const k of monthKeys) byKey[k] = { planned: 0, executed: 0 };
    for (const line of filteredLines) {
      for (const k of monthKeys) {
        const cell = line.byMonth[k];
        if (!cell) continue;
        byKey[k].planned += cell.planned;
        byKey[k].executed += cell.executed;
      }
    }
    return byKey;
  }, [filteredLines, monthKeys]);

  const grandTotal = useMemo(() => {
    let planned = 0;
    let executed = 0;
    for (const k of monthKeys) {
      planned += monthTotals[k]?.planned ?? 0;
      executed += monthTotals[k]?.executed ?? 0;
    }
    return { planned, executed };
  }, [monthTotals, monthKeys]);

  const anyFilterActive =
    search !== '' ||
    selectedBuildings.length > 0 ||
    selectedStatuses.length > 0 ||
    countRange.min !== '' ||
    countRange.max !== '' ||
    fromYear !== PROCESS_ORDERS_MIN_MONTH.year ||
    fromMonth !== PROCESS_ORDERS_MIN_MONTH.month ||
    toYear !== PROCESS_ORDERS_MAX_MONTH.year ||
    toMonth !== PROCESS_ORDERS_MAX_MONTH.month;

  const resetFilters = () => {
    setSearch('');
    setSelectedBuildings([]);
    setSelectedStatuses([]);
    setCountRange({ min: '', max: '' });
    setFromYear(PROCESS_ORDERS_MIN_MONTH.year);
    setFromMonth(PROCESS_ORDERS_MIN_MONTH.month);
    setToYear(PROCESS_ORDERS_MAX_MONTH.year);
    setToMonth(PROCESS_ORDERS_MAX_MONTH.month);
  };

  // Chip labels
  const buildingsChipValue = selectedBuildings.length === 0
    ? null
    : selectedBuildings.length === 1
      ? buildingOptions.find(o => o.value === selectedBuildings[0])?.label ?? null
      : `${selectedBuildings.length} selected`;

  const statusesChipValue = selectedStatuses.length === 0
    ? null
    : selectedStatuses.length === 1
      ? t(`maintenance.processOrders.status.${selectedStatuses[0] as ProcessOrderStatus}` as const)
      : `${selectedStatuses.length} selected`;

  const countChipValue = (() => {
    if (countRange.min === '' && countRange.max === '') return null;
    if (countRange.min !== '' && countRange.max !== '') return `${countRange.min} – ${countRange.max}`;
    if (countRange.min !== '') return `≥ ${countRange.min}`;
    return `≤ ${countRange.max}`;
  })();

  // Month column header formatter
  const shortMonthFmt = useMemo(
    () => new Intl.DateTimeFormat(locale === 'nl' ? 'nl-NL' : 'en-US', { month: 'short' }),
    [locale],
  );
  const monthColumnLabel = (m: { year: number; month: number }) => {
    const label = shortMonthFmt.format(new Date(m.year, m.month, 1));
    return `${label} ${String(m.year).slice(-2)}`;
  };

  // Click row → open building side peek
  const handleRowClick = (buildingId: string) => {
    const b = buildings.find(x => x.id === buildingId);
    if (!b) return;
    setSidePeekBuilding(b);
    setSidePeekBuildingTab('overview');
  };

  // Status colors — planned uses brandSecondary (blue), executed uses statusGood (green)
  const plannedColor = c.brandSecondary;
  const plannedBg = c.brandSecondary + '22';
  const executedColor = c.statusGood;
  const executedBg = c.statusGood + '22';

  const cellColWidth = 54;
  const totalColWidth = 92;

  return (
    <Box>
      {/* Title + count + search */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: c.textPrimary, lineHeight: 1.2 }}>
          {t('operations.maintenance.processOrders')}
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', color: c.textSecondary, lineHeight: 1.2 }}>
          {t('maintenance.processOrders.locationsCount', { count: filteredLines.length })}
        </Typography>
        <TextField
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('maintenance.processOrders.search')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: c.textSecondary }} />
              </InputAdornment>
            ),
          }}
          sx={{
            ml: 'auto',
            width: 240,
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

      {/* Month range slider */}
      <Box sx={{ mb: 3, px: 0.5 }}>
        <MonthRangeSlider
          fromYear={fromYear}
          fromMonth={fromMonth}
          toYear={toYear}
          toMonth={toMonth}
          onChange={(fy, fm, ty, tm) => {
            setFromYear(fy); setFromMonth(fm);
            setToYear(ty); setToMonth(tm);
          }}
          minYear={PROCESS_ORDERS_MIN_MONTH.year}
          minMonth={PROCESS_ORDERS_MIN_MONTH.month}
          maxYear={PROCESS_ORDERS_MAX_MONTH.year}
          maxMonth={PROCESS_ORDERS_MAX_MONTH.month}
        />
      </Box>

      {/* Filters row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <FilterChip
          label={t('maintenance.processOrders.locations')}
          value={buildingsChipValue}
          onClick={(e) => setBuildingsAnchor(e.currentTarget)}
          onClear={() => setSelectedBuildings([])}
        />
        <FilterChip
          label={t('maintenance.processOrders.status')}
          value={statusesChipValue}
          onClick={(e) => setStatusesAnchor(e.currentTarget)}
          onClear={() => setSelectedStatuses([])}
        />
        <FilterChip
          label={t('maintenance.processOrders.countRange')}
          value={countChipValue}
          onClick={(e) => setCountAnchor(e.currentTarget)}
          onClear={() => setCountRange({ min: '', max: '' })}
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
            {t('maintenance.processOrders.resetFilters')}
          </Box>
        )}

        {/* Legend — right-aligned on the filters row */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: plannedColor }} />
            <Typography sx={{ fontSize: '0.72rem', color: c.textSecondary }}>
              {t('maintenance.processOrders.status.planned')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: executedColor }} />
            <Typography sx={{ fontSize: '0.72rem', color: c.textSecondary }}>
              {t('maintenance.processOrders.status.executed')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Popovers */}
      <FilterDropdown
        anchorEl={buildingsAnchor}
        onClose={() => setBuildingsAnchor(null)}
        options={buildingOptions}
        multiple
        value={selectedBuildings}
        onChange={setSelectedBuildings}
      />
      <FilterDropdown
        anchorEl={statusesAnchor}
        onClose={() => setStatusesAnchor(null)}
        options={statusOptions}
        multiple
        value={selectedStatuses}
        onChange={setSelectedStatuses}
        hideSearch
      />
      <FilterRangeDropdown
        anchorEl={countAnchor}
        onClose={() => setCountAnchor(null)}
        value={countRange}
        onChange={setCountRange}
        type="number"
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
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
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
                  minWidth: 240,
                  width: 240,
                  borderRight: `1px solid ${c.borderSecondary}`,
                }}>
                  {t('maintenance.processOrders.locationColumn')}
                </TableCell>
                {visibleMonths.map((m, idx) => {
                  const isYearStart = idx > 0 && m.month === 0;
                  return (
                    <TableCell
                      key={m.key}
                      align="center"
                      sx={{
                        bgcolor: c.bgSecondary,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        color: c.textSecondary,
                        width: cellColWidth,
                        px: 0.5,
                        whiteSpace: 'nowrap',
                        borderLeft: isYearStart ? `2px solid ${c.borderPrimary}` : undefined,
                      }}
                    >
                      {monthColumnLabel(m)}
                    </TableCell>
                  );
                })}
                <TableCell
                  align="center"
                  sx={{
                    position: 'sticky',
                    right: 0,
                    zIndex: 3,
                    bgcolor: c.bgSecondary,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    color: c.textSecondary,
                    width: totalColWidth,
                    borderLeft: `1px solid ${c.borderSecondary}`,
                  }}
                >
                  {t('maintenance.processOrders.total')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLines.length === 0 && (
                <TableRow>
                  <TableCell colSpan={visibleMonths.length + 2} sx={{ textAlign: 'center', py: 6 }}>
                    <Typography color="text.secondary">
                      {t('maintenance.processOrders.noResults')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {filteredLines.map(line => {
                const rowTotals = sumRange(line, monthKeys);
                return (
                  <TableRow
                    key={line.buildingId}
                    onClick={() => handleRowClick(line.buildingId)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: c.bgPrimaryHover },
                      '&:hover .po-row-sticky, &:hover .po-total-sticky': { bgcolor: c.bgPrimaryHover },
                    }}
                  >
                    <TableCell className="po-row-sticky" sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      bgcolor: c.bgPrimary,
                      borderRight: `1px solid ${c.borderSecondary}`,
                      py: 0.75,
                    }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: c.textPrimary }}>
                        {line.buildingName}
                      </Typography>
                    </TableCell>
                    {visibleMonths.map((m, idx) => {
                      const cell = line.byMonth[m.key] ?? { planned: 0, executed: 0, orders: [] };
                      const hasOrders = cell.orders.length > 0;
                      const isYearStart = idx > 0 && m.month === 0;
                      return (
                        <TableCell
                          key={m.key}
                          align="center"
                          onClick={(e) => {
                            if (!hasOrders) return;
                            e.stopPropagation();
                            setOrderPopover({
                              anchor: e.currentTarget,
                              orders: cell.orders,
                              month: { year: m.year, month: m.month },
                            });
                          }}
                          sx={{
                            py: 0.5, px: 0.5,
                            cursor: hasOrders ? 'pointer' : 'default',
                            borderLeft: isYearStart ? `2px solid ${c.borderPrimary}` : undefined,
                            '&:hover': hasOrders ? { bgcolor: c.brandLighter } : undefined,
                          }}
                        >
                          <SplitStatusCell
                            planned={cell.planned}
                            executed={cell.executed}
                            plannedColor={plannedColor}
                            plannedBg={plannedBg}
                            executedColor={executedColor}
                            executedBg={executedBg}
                            disabledColor={c.textDisabled}
                          />
                        </TableCell>
                      );
                    })}
                    <TableCell
                      className="po-total-sticky"
                      align="center"
                      sx={{
                        position: 'sticky',
                        right: 0,
                        zIndex: 1,
                        bgcolor: c.bgPrimary,
                        borderLeft: `1px solid ${c.borderSecondary}`,
                        py: 0.5, px: 0.5,
                      }}
                    >
                      <SplitStatusCell
                        planned={rowTotals.planned}
                        executed={rowTotals.executed}
                        plannedColor={plannedColor}
                        plannedBg={plannedBg}
                        executedColor={executedColor}
                        executedBg={executedBg}
                        disabledColor={c.textDisabled}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            {filteredLines.length > 0 && (
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
                    borderRight: `1px solid ${c.borderSecondary}`,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    color: c.brand,
                    textTransform: 'uppercase',
                    letterSpacing: 0.3,
                  }}>
                    {t('maintenance.processOrders.monthTotal')}
                  </TableCell>
                  {visibleMonths.map((m, idx) => {
                    const tot = monthTotals[m.key] ?? { planned: 0, executed: 0 };
                    const isYearStart = idx > 0 && m.month === 0;
                    return (
                      <TableCell key={m.key} align="center" sx={{
                        position: 'sticky',
                        bottom: 0,
                        zIndex: 3,
                        bgcolor: c.brandLighter,
                        borderTop: `2px solid ${c.brand}`,
                        borderBottom: 'none',
                        borderLeft: isYearStart ? `2px solid ${c.borderPrimary}` : undefined,
                        py: 0.5, px: 0.5,
                      }}>
                        <SplitStatusCell
                          planned={tot.planned}
                          executed={tot.executed}
                          plannedColor={plannedColor}
                          plannedBg={plannedBg}
                          executedColor={executedColor}
                          executedBg={executedBg}
                          disabledColor={c.textDisabled}
                        />
                      </TableCell>
                    );
                  })}
                  <TableCell align="center" sx={{
                    position: 'sticky',
                    bottom: 0,
                    right: 0,
                    zIndex: 4,
                    bgcolor: c.brandLighter,
                    borderTop: `2px solid ${c.brand}`,
                    borderBottom: 'none',
                    borderLeft: `1px solid ${c.borderSecondary}`,
                    py: 0.5, px: 0.5,
                  }}>
                    <SplitStatusCell
                      planned={grandTotal.planned}
                      executed={grandTotal.executed}
                      plannedColor={plannedColor}
                      plannedBg={plannedBg}
                      executedColor={executedColor}
                      executedBg={executedBg}
                      disabledColor={c.textDisabled}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Box>

      {/* Order picker popover — opens on cell click when one or more orders exist */}
      <Popover
        open={!!orderPopover}
        anchorEl={orderPopover?.anchor ?? null}
        onClose={() => setOrderPopover(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: 340,
              maxWidth: 440,
              maxHeight: 420,
              border: `1px solid ${c.borderSecondary}`,
              boxShadow: c.cardShadow,
              bgcolor: c.bgPrimary,
            },
          },
        }}
      >
        {orderPopover && (
          <Box>
            <Box sx={{
              px: 1.5, py: 1,
              borderBottom: `1px solid ${c.borderTertiary}`,
              fontSize: '0.72rem', fontWeight: 600,
              color: c.textSecondary,
              textTransform: 'uppercase', letterSpacing: 0.3,
            }}>
              {t('maintenance.processOrders.ordersInMonth', {
                month: `${shortMonthFmt.format(new Date(orderPopover.month.year, orderPopover.month.month, 1))} ${orderPopover.month.year}`,
              })}
            </Box>
            <Box sx={{ maxHeight: 360, overflow: 'auto', py: 0.5 }}>
              {orderPopover.orders.map(order => {
                const isPlanned = order.status === 'planned';
                const badgeColor = isPlanned ? plannedColor : executedColor;
                const badgeBg = isPlanned ? plannedBg : executedBg;
                return (
                  <Box
                    key={order.id}
                    onClick={() => {
                      setSidePeekServiceOrder(order);
                      setOrderPopover(null);
                    }}
                    sx={{
                      px: 1.5, py: 1,
                      display: 'flex', alignItems: 'center', gap: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: c.bgPrimaryHover },
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{
                        fontSize: '0.72rem', fontWeight: 600,
                        color: c.textSecondary, fontFamily: 'monospace',
                      }}>
                        {order.number}
                      </Typography>
                      <Typography noWrap sx={{
                        fontSize: '0.82rem', color: c.textPrimary,
                      }}>
                        {order.description}
                      </Typography>
                    </Box>
                    <Box sx={{
                      bgcolor: badgeBg, color: badgeColor,
                      px: 0.9, py: 0.25, borderRadius: '3px',
                      fontSize: '0.7rem', fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}>
                      {t(`maintenance.processOrders.status.${order.status}` as const)}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Popover>
    </Box>
  );
}
