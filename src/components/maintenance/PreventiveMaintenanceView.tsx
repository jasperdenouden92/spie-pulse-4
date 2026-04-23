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
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage } from '@/i18n';
import { useURLState } from '@/hooks/useURLState';
import FilterChip from '@/components/FilterChip';
import FilterDropdown from '@/components/FilterDropdown';
import MonthRangeSlider from './MonthRangeSlider';
import { useAppState } from '@/context/AppStateContext';
import { buildings } from '@/data/buildings';
import {
  preventiveMaintenanceLines,
  PM_MIN_MONTH,
  PM_MAX_MONTH,
  PM_STATUSES,
  NL_SFB_CATEGORIES,
  REGULATORY_CATEGORIES,
  PARTICULARITY_CATEGORIES,
  type PMStatus,
  type PMAsset,
  type PMBuildingLine,
  type NLSfBCategory,
  type RegulatoryCategory,
  type ParticularityCategory,
} from '@/data/preventiveMaintenance';
import { iterateMonths, type ServiceOrder } from '@/data/processOrders';

interface SplitCounts {
  planned: number;
  executed: number;
}

function SplitStatusCell({
  planned, executed,
  plannedColor, plannedBg,
  executedColor, executedBg,
  disabledColor,
}: SplitCounts & {
  plannedColor: string;
  plannedBg: string;
  executedColor: string;
  executedBg: string;
  disabledColor: string;
}) {
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
        }}>{planned}</Box>
      )}
      {executed > 0 && (
        <Box sx={{
          bgcolor: executedBg, color: executedColor,
          py: 0.25, borderRadius: '3px',
          fontSize: '0.72rem', fontWeight: 700, textAlign: 'center',
          lineHeight: 1.2,
        }}>{executed}</Box>
      )}
    </Box>
  );
}

function aggregateOrdersForMonth(assets: PMAsset[], key: string): SplitCounts & { orders: ServiceOrder[] } {
  let planned = 0;
  let executed = 0;
  const orders: ServiceOrder[] = [];
  for (const a of assets) {
    const cell = a.byMonth[key];
    if (!cell) continue;
    planned += cell.planned;
    executed += cell.executed;
    if (cell.orders.length) orders.push(...cell.orders);
  }
  return { planned, executed, orders };
}

function aggregateOrdersForRange(assets: PMAsset[], keys: string[]): SplitCounts {
  let planned = 0;
  let executed = 0;
  for (const a of assets) {
    for (const k of keys) {
      const cell = a.byMonth[k];
      if (!cell) continue;
      planned += cell.planned;
      executed += cell.executed;
    }
  }
  return { planned, executed };
}

interface FilteredLine {
  buildingId: string;
  buildingName: string;
  parts: Array<{
    id: string;
    name: string;
    assets: PMAsset[];
  }>;
}

export default function PreventiveMaintenanceView() {
  const { themeColors: c } = useThemeMode();
  const { t, locale } = useLanguage();
  const { setSidePeekBuilding, setSidePeekBuildingTab, setSidePeekServiceOrder } = useAppState();
  const { selectedTenant } = useURLState();

  // Tenant scope
  const tenantBuildingIds = useMemo(
    () => new Set(buildings.filter(b => b.tenant === selectedTenant).map(b => b.id)),
    [selectedTenant],
  );
  const tenantLines: PMBuildingLine[] = useMemo(
    () => preventiveMaintenanceLines.filter(l => tenantBuildingIds.has(l.buildingId)),
    [tenantBuildingIds],
  );

  // Filters
  const [search, setSearch] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]); // by asset id OR `b:<buildingId>`
  const [selectedNlSfb, setSelectedNlSfb] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRegulatory, setSelectedRegulatory] = useState<string[]>([]);
  const [selectedParticularity, setSelectedParticularity] = useState<string[]>([]);

  // Month range
  const [fromYear, setFromYear] = useState(PM_MIN_MONTH.year);
  const [fromMonth, setFromMonth] = useState(PM_MIN_MONTH.month);
  const [toYear, setToYear] = useState(PM_MAX_MONTH.year);
  const [toMonth, setToMonth] = useState(PM_MAX_MONTH.month);

  // Anchors
  const [assetsAnchor, setAssetsAnchor] = useState<HTMLElement | null>(null);
  const [nlSfbAnchor, setNlSfbAnchor] = useState<HTMLElement | null>(null);
  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null);
  const [regulatoryAnchor, setRegulatoryAnchor] = useState<HTMLElement | null>(null);
  const [particularityAnchor, setParticularityAnchor] = useState<HTMLElement | null>(null);

  // Expansion state — building IDs and part IDs
  const [expandedBuildings, setExpandedBuildings] = useState<Set<string>>(new Set());
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());

  // Order popover
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

  // Filter options
  const assetOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    for (const line of tenantLines) {
      opts.push({ value: `b:${line.buildingId}`, label: line.buildingName });
      for (const part of line.parts) {
        for (const a of part.assets) {
          opts.push({ value: a.id, label: `${a.name} — ${line.buildingName}` });
        }
      }
    }
    return opts;
  }, [tenantLines]);

  const nlSfbOptions = useMemo(
    () => NL_SFB_CATEGORIES.map(v => ({ value: v, label: v })),
    [],
  );
  const statusOptions = useMemo(
    () => PM_STATUSES.map(s => ({ value: s, label: t(`maintenance.processOrders.status.${s}` as const) })),
    [t],
  );
  const regulatoryOptions = useMemo(
    () => REGULATORY_CATEGORIES.map(v => ({ value: v, label: v })),
    [],
  );
  const particularityOptions = useMemo(
    () => PARTICULARITY_CATEGORIES.map(v => ({ value: v, label: v })),
    [],
  );

  // Apply filters
  const filteredLines: FilteredLine[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    const buildingScope = new Set<string>();
    const assetScope = new Set<string>();
    let scopeAll = true;
    if (selectedAssets.length > 0) {
      scopeAll = false;
      for (const v of selectedAssets) {
        if (v.startsWith('b:')) buildingScope.add(v.slice(2));
        else assetScope.add(v);
      }
    }
    const nlSet = new Set(selectedNlSfb as NLSfBCategory[]);
    const regSet = new Set(selectedRegulatory as RegulatoryCategory[]);
    const partSet = new Set(selectedParticularity as ParticularityCategory[]);
    const statusSet = new Set(selectedStatuses as PMStatus[]);
    const hasStatusFilter = selectedStatuses.length > 0 && selectedStatuses.length < PM_STATUSES.length;

    const result: FilteredLine[] = [];
    for (const line of tenantLines) {
      const matchesBuildingScope = scopeAll || buildingScope.has(line.buildingId);

      const filteredParts: Array<{ id: string; name: string; assets: PMAsset[] }> = [];
      for (const part of line.parts) {
        const filteredAssets: PMAsset[] = [];
        for (const a of part.assets) {
          // Asset scope: include if scopeAll, building chosen, or asset chosen
          if (!scopeAll && !matchesBuildingScope && !assetScope.has(a.id)) continue;

          if (nlSet.size > 0 && !nlSet.has(a.nlSfb)) continue;
          if (regSet.size > 0 && !regSet.has(a.regulatory)) continue;
          if (partSet.size > 0 && !partSet.has(a.particularity)) continue;

          if (q) {
            const hay = `${a.name} ${line.buildingName} ${part.name} ${a.nlSfb}`.toLowerCase();
            if (!hay.includes(q)) continue;
          }

          if (hasStatusFilter) {
            // Asset must have at least one matching status order across visible months
            let has = false;
            for (const k of monthKeys) {
              const cell = a.byMonth[k];
              if (!cell) continue;
              if (statusSet.has('planned') && cell.planned > 0) { has = true; break; }
              if (statusSet.has('executed') && cell.executed > 0) { has = true; break; }
            }
            if (!has) continue;
          }

          filteredAssets.push(a);
        }
        if (filteredAssets.length > 0) {
          filteredParts.push({ id: part.id, name: part.name, assets: filteredAssets });
        }
      }
      if (filteredParts.length > 0) {
        result.push({ buildingId: line.buildingId, buildingName: line.buildingName, parts: filteredParts });
      }
    }
    return result;
  }, [tenantLines, search, selectedAssets, selectedNlSfb, selectedStatuses, selectedRegulatory, selectedParticularity, monthKeys]);

  // Per-month totals
  const monthTotals = useMemo(() => {
    const out: Record<string, SplitCounts> = {};
    for (const k of monthKeys) out[k] = { planned: 0, executed: 0 };
    for (const line of filteredLines) {
      for (const part of line.parts) {
        for (const a of part.assets) {
          for (const k of monthKeys) {
            const cell = a.byMonth[k];
            if (!cell) continue;
            out[k].planned += cell.planned;
            out[k].executed += cell.executed;
          }
        }
      }
    }
    return out;
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
    selectedAssets.length > 0 ||
    selectedNlSfb.length > 0 ||
    selectedStatuses.length > 0 ||
    selectedRegulatory.length > 0 ||
    selectedParticularity.length > 0 ||
    fromYear !== PM_MIN_MONTH.year ||
    fromMonth !== PM_MIN_MONTH.month ||
    toYear !== PM_MAX_MONTH.year ||
    toMonth !== PM_MAX_MONTH.month;

  const resetFilters = () => {
    setSearch('');
    setSelectedAssets([]);
    setSelectedNlSfb([]);
    setSelectedStatuses([]);
    setSelectedRegulatory([]);
    setSelectedParticularity([]);
    setFromYear(PM_MIN_MONTH.year);
    setFromMonth(PM_MIN_MONTH.month);
    setToYear(PM_MAX_MONTH.year);
    setToMonth(PM_MAX_MONTH.month);
  };

  // Chip values
  const chipMulti = (selected: string[], totalLabel?: (n: number) => string, single?: (v: string) => string) => {
    if (selected.length === 0) return null;
    if (selected.length === 1) return single ? single(selected[0]) : selected[0];
    return totalLabel ? totalLabel(selected.length) : `${selected.length} selected`;
  };

  const totalLabel = (n: number) => t('maintenance.preventive.nSelected', { count: n });

  const assetsChipValue = chipMulti(selectedAssets, totalLabel, v => assetOptions.find(o => o.value === v)?.label ?? v);
  const nlSfbChipValue = chipMulti(selectedNlSfb, totalLabel);
  const statusChipValue = chipMulti(selectedStatuses, totalLabel, v => t(`maintenance.processOrders.status.${v as PMStatus}` as const));
  const regulatoryChipValue = chipMulti(selectedRegulatory, totalLabel);
  const particularityChipValue = chipMulti(selectedParticularity, totalLabel);

  // Month header label
  const shortMonthFmt = useMemo(
    () => new Intl.DateTimeFormat(locale === 'nl' ? 'nl-NL' : 'en-US', { month: 'short' }),
    [locale],
  );
  const monthColumnLabel = (m: { year: number; month: number }) => {
    const label = shortMonthFmt.format(new Date(m.year, m.month, 1));
    return `${label} ${String(m.year).slice(-2)}`;
  };

  // Toggle expand
  const toggleBuilding = (id: string) => {
    setExpandedBuildings(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const togglePart = (id: string) => {
    setExpandedParts(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  // Click row → side peek
  const openBuildingPeek = (buildingId: string) => {
    const b = buildings.find(x => x.id === buildingId);
    if (!b) return;
    setSidePeekBuilding(b);
    setSidePeekBuildingTab('overview');
  };

  // Cell click: 1 order → open side peek directly; multiple → show picker popover
  const handleCellClick = (
    e: React.MouseEvent<HTMLElement>,
    orders: ServiceOrder[],
    month: { year: number; month: number },
  ) => {
    if (orders.length === 0) return;
    e.stopPropagation();
    if (orders.length === 1) {
      setSidePeekServiceOrder(orders[0]);
      return;
    }
    setOrderPopover({ anchor: e.currentTarget, orders, month });
  };

  // Status colors
  const plannedColor = c.brandSecondary;
  const plannedBg = c.brandSecondary + '22';
  const executedColor = c.statusGood;
  const executedBg = c.statusGood + '22';

  const cellColWidth = 54;
  const totalColWidth = 92;
  const labelColWidth = 320;

  // Count visible assets
  const visibleAssetsCount = useMemo(
    () => filteredLines.reduce((acc, l) => acc + l.parts.reduce((a, p) => a + p.assets.length, 0), 0),
    [filteredLines],
  );

  return (
    <Box>
      {/* Title + count + search */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: c.textPrimary, lineHeight: 1.2 }}>
          {t('operations.maintenance.preventive')}
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', color: c.textSecondary, lineHeight: 1.2 }}>
          {t('maintenance.preventive.assetsCount', { count: visibleAssetsCount })}
        </Typography>
        <TextField
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('maintenance.preventive.search')}
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
          minYear={PM_MIN_MONTH.year}
          minMonth={PM_MIN_MONTH.month}
          maxYear={PM_MAX_MONTH.year}
          maxMonth={PM_MAX_MONTH.month}
        />
      </Box>

      {/* Filters row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <FilterChip
          label={t('maintenance.preventive.locationsAssets')}
          value={assetsChipValue}
          onClick={(e) => setAssetsAnchor(e.currentTarget)}
          onClear={() => setSelectedAssets([])}
        />
        <FilterChip
          label={t('maintenance.preventive.nlSfb')}
          value={nlSfbChipValue}
          onClick={(e) => setNlSfbAnchor(e.currentTarget)}
          onClear={() => setSelectedNlSfb([])}
        />
        <FilterChip
          label={t('maintenance.processOrders.status')}
          value={statusChipValue}
          onClick={(e) => setStatusAnchor(e.currentTarget)}
          onClear={() => setSelectedStatuses([])}
        />
        <FilterChip
          label={t('maintenance.preventive.regulatory')}
          value={regulatoryChipValue}
          onClick={(e) => setRegulatoryAnchor(e.currentTarget)}
          onClear={() => setSelectedRegulatory([])}
        />
        <FilterChip
          label={t('maintenance.preventive.particularity')}
          value={particularityChipValue}
          onClick={(e) => setParticularityAnchor(e.currentTarget)}
          onClear={() => setSelectedParticularity([])}
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
        anchorEl={assetsAnchor}
        onClose={() => setAssetsAnchor(null)}
        options={assetOptions}
        multiple
        value={selectedAssets}
        onChange={setSelectedAssets}
      />
      <FilterDropdown
        anchorEl={nlSfbAnchor}
        onClose={() => setNlSfbAnchor(null)}
        options={nlSfbOptions}
        multiple
        value={selectedNlSfb}
        onChange={setSelectedNlSfb}
      />
      <FilterDropdown
        anchorEl={statusAnchor}
        onClose={() => setStatusAnchor(null)}
        options={statusOptions}
        multiple
        value={selectedStatuses}
        onChange={setSelectedStatuses}
        hideSearch
      />
      <FilterDropdown
        anchorEl={regulatoryAnchor}
        onClose={() => setRegulatoryAnchor(null)}
        options={regulatoryOptions}
        multiple
        value={selectedRegulatory}
        onChange={setSelectedRegulatory}
        hideSearch
      />
      <FilterDropdown
        anchorEl={particularityAnchor}
        onClose={() => setParticularityAnchor(null)}
        options={particularityOptions}
        multiple
        value={selectedParticularity}
        onChange={setSelectedParticularity}
        hideSearch
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
                  minWidth: labelColWidth,
                  width: labelColWidth,
                  borderRight: `1px solid ${c.borderSecondary}`,
                }}>
                  {t('maintenance.preventive.locationAssetColumn')}
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
                const buildingExpanded = expandedBuildings.has(line.buildingId);
                const allAssets = line.parts.flatMap(p => p.assets);
                const buildingTotals = aggregateOrdersForRange(allAssets, monthKeys);

                return (
                  <React.Fragment key={line.buildingId}>
                    {/* BUILDING ROW */}
                    <TableRow
                      sx={{
                        cursor: 'pointer',
                        bgcolor: c.bgSecondary,
                        '&:hover': { bgcolor: c.bgPrimaryHover },
                        '&:hover .pm-row-sticky, &:hover .pm-total-sticky': { bgcolor: c.bgPrimaryHover },
                      }}
                      onClick={() => toggleBuilding(line.buildingId)}
                    >
                      <TableCell className="pm-row-sticky" sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 1,
                        bgcolor: c.bgSecondary,
                        borderRight: `1px solid ${c.borderSecondary}`,
                        py: 0.5, pl: 0.5,
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            sx={{ p: 0.25 }}
                            onClick={(e) => { e.stopPropagation(); toggleBuilding(line.buildingId); }}
                          >
                            {buildingExpanded
                              ? <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                              : <KeyboardArrowRightIcon sx={{ fontSize: 18 }} />}
                          </IconButton>
                          <Typography
                            onClick={(e) => { e.stopPropagation(); openBuildingPeek(line.buildingId); }}
                            sx={{
                              fontSize: '0.85rem', fontWeight: 600, color: c.textPrimary,
                              cursor: 'pointer',
                              '&:hover': { color: c.brandSecondary, textDecoration: 'underline' },
                            }}
                          >
                            {line.buildingName}
                          </Typography>
                        </Box>
                      </TableCell>
                      {visibleMonths.map((m, idx) => {
                        const cell = aggregateOrdersForMonth(allAssets, m.key);
                        const isYearStart = idx > 0 && m.month === 0;
                        const hasOrders = cell.orders.length > 0;
                        return (
                          <TableCell
                            key={m.key}
                            align="center"
                            onClick={(e) => handleCellClick(e, cell.orders, { year: m.year, month: m.month })}
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
                      <TableCell className="pm-total-sticky" align="center" sx={{
                        position: 'sticky',
                        right: 0,
                        zIndex: 1,
                        bgcolor: c.bgSecondary,
                        borderLeft: `1px solid ${c.borderSecondary}`,
                        py: 0.5, px: 0.5,
                      }}>
                        <SplitStatusCell
                          planned={buildingTotals.planned}
                          executed={buildingTotals.executed}
                          plannedColor={plannedColor}
                          plannedBg={plannedBg}
                          executedColor={executedColor}
                          executedBg={executedBg}
                          disabledColor={c.textDisabled}
                        />
                      </TableCell>
                    </TableRow>

                    {/* PART ROWS */}
                    {buildingExpanded && line.parts.map(part => {
                      const partExpanded = expandedParts.has(part.id);
                      const partTotals = aggregateOrdersForRange(part.assets, monthKeys);

                      return (
                        <React.Fragment key={part.id}>
                          <TableRow
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { bgcolor: c.bgPrimaryHover },
                              '&:hover .pm-row-sticky, &:hover .pm-total-sticky': { bgcolor: c.bgPrimaryHover },
                            }}
                            onClick={() => togglePart(part.id)}
                          >
                            <TableCell className="pm-row-sticky" sx={{
                              position: 'sticky',
                              left: 0,
                              zIndex: 1,
                              bgcolor: c.bgPrimary,
                              borderRight: `1px solid ${c.borderSecondary}`,
                              py: 0.5, pl: 3,
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  sx={{ p: 0.25 }}
                                  onClick={(e) => { e.stopPropagation(); togglePart(part.id); }}
                                >
                                  {partExpanded
                                    ? <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                                    : <KeyboardArrowRightIcon sx={{ fontSize: 18 }} />}
                                </IconButton>
                                <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: c.textPrimary }}>
                                  {part.name}
                                </Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: c.textSecondary }}>
                                  ({part.assets.length})
                                </Typography>
                              </Box>
                            </TableCell>
                            {visibleMonths.map((m, idx) => {
                              const cell = aggregateOrdersForMonth(part.assets, m.key);
                              const isYearStart = idx > 0 && m.month === 0;
                              const hasOrders = cell.orders.length > 0;
                              return (
                                <TableCell
                                  key={m.key}
                                  align="center"
                                  onClick={(e) => handleCellClick(e, cell.orders, { year: m.year, month: m.month })}
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
                            <TableCell className="pm-total-sticky" align="center" sx={{
                              position: 'sticky',
                              right: 0,
                              zIndex: 1,
                              bgcolor: c.bgPrimary,
                              borderLeft: `1px solid ${c.borderSecondary}`,
                              py: 0.5, px: 0.5,
                            }}>
                              <SplitStatusCell
                                planned={partTotals.planned}
                                executed={partTotals.executed}
                                plannedColor={plannedColor}
                                plannedBg={plannedBg}
                                executedColor={executedColor}
                                executedBg={executedBg}
                                disabledColor={c.textDisabled}
                              />
                            </TableCell>
                          </TableRow>

                          {/* ASSET ROWS */}
                          {partExpanded && part.assets.map(asset => {
                            const assetTotals = aggregateOrdersForRange([asset], monthKeys);
                            return (
                              <TableRow
                                key={asset.id}
                                sx={{
                                  cursor: 'pointer',
                                  '&:hover': { bgcolor: c.bgPrimaryHover },
                                  '&:hover .pm-row-sticky, &:hover .pm-total-sticky': { bgcolor: c.bgPrimaryHover },
                                }}
                                onClick={() => openBuildingPeek(line.buildingId)}
                              >
                                <TableCell className="pm-row-sticky" sx={{
                                  position: 'sticky',
                                  left: 0,
                                  zIndex: 1,
                                  bgcolor: c.bgPrimary,
                                  borderRight: `1px solid ${c.borderSecondary}`,
                                  py: 0.5, pl: 6,
                                }}>
                                  <Box>
                                    <Typography sx={{ fontSize: '0.8rem', color: c.textPrimary }}>
                                      {asset.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.7rem', color: c.textSecondary }}>
                                      {asset.nlSfb} · {asset.regulatory}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                {visibleMonths.map((m, idx) => {
                                  const cell = asset.byMonth[m.key] ?? { planned: 0, executed: 0, orders: [] };
                                  const isYearStart = idx > 0 && m.month === 0;
                                  const hasOrders = cell.orders.length > 0;
                                  return (
                                    <TableCell
                                      key={m.key}
                                      align="center"
                                      onClick={(e) => handleCellClick(e, cell.orders, { year: m.year, month: m.month })}
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
                                <TableCell className="pm-total-sticky" align="center" sx={{
                                  position: 'sticky',
                                  right: 0,
                                  zIndex: 1,
                                  bgcolor: c.bgPrimary,
                                  borderLeft: `1px solid ${c.borderSecondary}`,
                                  py: 0.5, px: 0.5,
                                }}>
                                  <SplitStatusCell
                                    planned={assetTotals.planned}
                                    executed={assetTotals.executed}
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
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
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

      {/* Order picker popover */}
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
                      <Typography noWrap sx={{ fontSize: '0.82rem', color: c.textPrimary }}>
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
