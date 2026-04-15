'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Chip from '@mui/material/Chip';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage } from '@/i18n';
import type { TranslationKey } from '@/i18n';

// ── Constants ────────────────────────────────────────────────────────────────

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;
const MONTHS_NL = ['JAN', 'FEB', 'MRT', 'APR', 'MEI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEC'] as const;
const MONTHS_NL_LOWER = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'] as const;
const DAY_HEADERS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'] as const;
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);
const CURRENT_YEAR = TODAY.getFullYear();
const MIN_YEAR = 2023;

export type ViewMode = 'standard' | 'granular';
export type PeriodMode = 'day' | 'week' | 'month' | 'quarter' | 'year';

const PERIOD_MODES: PeriodMode[] = ['day', 'week', 'month', 'quarter', 'year'];
const PERIOD_LABELS: Record<PeriodMode, string> = {
  day: 'Dag', week: 'Week', month: 'Maand', quarter: 'Kwartaal', year: 'Jaar',
};

// ── Date helpers ─────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  const r = new Date(d); r.setHours(0, 0, 0, 0); return r;
}
function startOfMonth(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date): Date { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function startOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), q * 3, 1);
}
function endOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), q * 3 + 3, 0);
}
function startOfYear(d: Date): Date { return new Date(d.getFullYear(), 0, 1); }
function endOfYear(d: Date): Date { return new Date(d.getFullYear(), 11, 31); }
function startOfWeek(d: Date): Date {
  const r = new Date(d);
  const day = r.getDay() || 7;
  r.setDate(r.getDate() - day + 1);
  return startOfDay(r);
}
function endOfWeek(d: Date): Date {
  const r = startOfWeek(d);
  r.setDate(r.getDate() + 6);
  return r;
}
function clampToToday(d: Date): Date { return d > TODAY ? TODAY : d; }

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function formatDateNL(d: Date): string {
  return `${d.getDate()} ${MONTHS_NL_LOWER[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateDDMMYYYY(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}

function detectPeriodMode(from: Date, to: Date): PeriodMode {
  if (from.getMonth() === 0 && from.getDate() === 1 && to.getMonth() === 11 && to.getDate() === 31) return 'year';
  if (from.getDate() === 1 && from.getMonth() % 3 === 0 && to.getDate() === endOfMonth(to).getDate() && (to.getMonth() + 1) % 3 === 0) return 'quarter';
  if (from.getDate() === 1 && to.getDate() === endOfMonth(to).getDate()) return 'month';
  const diffDays = Math.round((to.getTime() - from.getTime()) / 86400000);
  if (from.getDay() === 1 && (diffDays + 1) % 7 === 0) return 'week';
  if (diffDays <= 31) return 'day';
  return 'month';
}

function snapRange(from: Date, to: Date, mode: PeriodMode): { from: Date; to: Date } {
  switch (mode) {
    case 'day': return { from, to };
    case 'week': return { from: startOfWeek(from), to: clampToToday(endOfWeek(to)) };
    case 'month': return { from: startOfMonth(from), to: clampToToday(endOfMonth(to)) };
    case 'quarter': return { from: startOfQuarter(from), to: clampToToday(endOfQuarter(to)) };
    case 'year': return { from: startOfYear(from), to: clampToToday(endOfYear(to)) };
  }
}

function getCalendarRows(year: number, month: number): { weekNum: number; days: (number | null)[] }[] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = endOfMonth(firstDay).getDate();
  const firstDow = (firstDay.getDay() + 6) % 7; // Monday = 0
  const rows: { weekNum: number; days: (number | null)[] }[] = [];
  let day = 1;

  const firstRow: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) firstRow.push(null);
  while (firstRow.length < 7 && day <= daysInMonth) firstRow.push(day++);
  rows.push({ weekNum: getISOWeekNumber(firstDay), days: firstRow });

  while (day <= daysInMonth) {
    const row: (number | null)[] = [];
    const rowStart = new Date(year, month, day);
    while (row.length < 7 && day <= daysInMonth) row.push(day++);
    while (row.length < 7) row.push(null);
    rows.push({ weekNum: getISOWeekNumber(rowStart), days: row });
  }
  return rows;
}

type WeekInfo = { label: string; startDay: number; endDay: number; startDate: Date; endDate: Date };
function getMonthWeeks(year: number, month: number): WeekInfo[] {
  const lastDay = endOfMonth(new Date(year, month, 1)).getDate();
  const weeks: WeekInfo[] = [];
  let day = 1, weekNum = 1;
  while (day <= lastDay) {
    const date = new Date(year, month, day);
    const dow = (date.getDay() + 6) % 7;
    const end = Math.min(day + 6 - dow, lastDay);
    weeks.push({ label: `W${weekNum}`, startDay: day, endDay: end, startDate: new Date(year, month, day), endDate: new Date(year, month, end) });
    weekNum++; day = end + 1;
  }
  return weeks;
}

// ── Public API ───────────────────────────────────────────────────────────────

export function parseDateRange(value: string): { from: Date; to: Date } {
  if (value.includes('|')) {
    const [a, b] = value.split('|');
    return { from: startOfDay(new Date(a)), to: startOfDay(new Date(b)) };
  }
  const now = new Date(); now.setHours(0, 0, 0, 0);
  switch (value) {
    case 'Today': return { from: now, to: now };
    case 'Yesterday': { const y = new Date(now); y.setDate(y.getDate() - 1); return { from: startOfDay(y), to: startOfDay(y) }; }
    case 'This Week': return { from: startOfWeek(now), to: clampToToday(endOfWeek(now)) };
    case 'Last Week': { const p = new Date(now); p.setDate(p.getDate() - 7); return { from: startOfWeek(p), to: endOfWeek(p) }; }
    case 'This Month': return { from: startOfMonth(now), to: now };
    case 'This Quarter': { const q = Math.floor(now.getMonth() / 3); return { from: new Date(now.getFullYear(), q * 3, 1), to: now }; }
    case 'This Year': return { from: startOfYear(now), to: now };
    case 'All Time': return { from: new Date(now.getFullYear() - 2, 0, 1), to: now };
    default: return { from: startOfMonth(now), to: now };
  }
}

export function dateRangeToString(from: Date, to: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return `${fmt(from)}|${fmt(to)}`;
}

// ── Presets ──────────────────────────────────────────────────────────────────

export type Preset = { label: string; getRange: () => { from: Date; to: Date } };

type PresetWithKey = { label: string; labelKey: TranslationKey; getRange: () => { from: Date; to: Date } };

export const PRESETS: PresetWithKey[] = [
  { label: 'This month', labelKey: 'date.thisMonth', getRange: () => ({ from: startOfMonth(TODAY), to: new Date(TODAY) }) },
  { label: 'Last month', labelKey: 'date.lastMonth', getRange: () => { const d = new Date(TODAY.getFullYear(), TODAY.getMonth() - 1, 1); return { from: d, to: endOfMonth(d) }; } },
  { label: 'This quarter', labelKey: 'date.thisQuarter', getRange: () => { const q = Math.floor(TODAY.getMonth() / 3); return { from: new Date(TODAY.getFullYear(), q * 3, 1), to: new Date(TODAY) }; } },
  { label: 'Last quarter', labelKey: 'date.lastQuarter', getRange: () => { const q = Math.floor(TODAY.getMonth() / 3); const s = new Date(TODAY.getFullYear(), (q - 1) * 3, 1); return { from: s, to: endOfQuarter(s) }; } },
  { label: 'This year', labelKey: 'date.thisYear', getRange: () => ({ from: startOfYear(TODAY), to: new Date(TODAY) }) },
  { label: 'Last year', labelKey: 'date.lastYear', getRange: () => { const d = new Date(TODAY.getFullYear() - 1, 0, 1); return { from: d, to: endOfYear(d) }; } },
];

export const GRANULAR_PRESETS: PresetWithKey[] = [
  { label: 'Today', labelKey: 'date.today', getRange: () => ({ from: new Date(TODAY), to: new Date(TODAY) }) },
  { label: 'Yesterday', labelKey: 'date.yesterday', getRange: () => { const y = new Date(TODAY); y.setDate(y.getDate() - 1); return { from: startOfDay(y), to: startOfDay(y) }; } },
  { label: 'This week', labelKey: 'date.thisWeek', getRange: () => ({ from: startOfWeek(TODAY), to: clampToToday(endOfWeek(TODAY)) }) },
  { label: 'Last week', labelKey: 'date.lastWeek', getRange: () => { const p = new Date(TODAY); p.setDate(p.getDate() - 7); return { from: startOfWeek(p), to: endOfWeek(p) }; } },
  { label: 'This quarter', labelKey: 'date.thisQuarter', getRange: () => { const q = Math.floor(TODAY.getMonth() / 3); return { from: new Date(TODAY.getFullYear(), q * 3, 1), to: new Date(TODAY) }; } },
  { label: 'Last quarter', labelKey: 'date.lastQuarter', getRange: () => { const q = Math.floor(TODAY.getMonth() / 3); const s = new Date(TODAY.getFullYear(), (q - 1) * 3, 1); return { from: s, to: endOfQuarter(s) }; } },
];

const ALL_PRESETS = [...PRESETS, ...GRANULAR_PRESETS];

export function getDateRangeDisplayLabel(value: string, t?: (key: any) => string): string {
  const { from, to } = parseDateRange(value);
  for (const preset of ALL_PRESETS) {
    const { from: pf, to: pt } = preset.getRange();
    if (from.getTime() === pf.getTime() && to.getTime() === pt.getTime()) {
      return t ? t(preset.labelKey) : preset.label;
    }
  }
  const fy = from.getFullYear(), ty = to.getFullYear(), fm = from.getMonth(), tm = to.getMonth();
  const isQuarterStart = (m: number) => m % 3 === 0;
  const isQuarterEnd = (m: number) => m % 3 === 2;
  const shortYear = (y: number) => String(y).slice(-2);
  if (fm === 0 && tm === 11) { if (fy === ty) return `${fy}`; return `${fy}–${ty}`; }
  if (isQuarterStart(fm) && isQuarterEnd(tm)) {
    const fq = Math.floor(fm / 3) + 1, tq = Math.floor(tm / 3) + 1;
    if (fy === ty && fq === tq) return `Q${fq} ${fy}`;
    if (fy === ty) return `Q${fq}–Q${tq} ${fy}`;
    return `Q${fq} ${shortYear(fy)} – Q${tq} ${shortYear(ty)}`;
  }
  if (from.getTime() === to.getTime()) return `${from.getDate()} ${MONTHS_SHORT[fm]} ${fy}`;
  if (fy === ty && fm === tm) {
    if (from.getDate() === 1 && to.getDate() === endOfMonth(from).getDate()) return `${MONTHS_FULL[fm]} ${fy}`;
    return `${from.getDate()}–${to.getDate()} ${MONTHS_SHORT[fm]} ${fy}`;
  }
  if (fy === ty) return `${from.getDate()} ${MONTHS_SHORT[fm]} – ${to.getDate()} ${MONTHS_SHORT[tm]} ${fy}`;
  return `${from.getDate()} ${MONTHS_SHORT[fm]} ${fy} – ${to.getDate()} ${MONTHS_SHORT[tm]} ${ty}`;
}

// ── Period quick presets ─────────────────────────────────────────────────────

type PresetDef = { labelKey: TranslationKey; getRange: () => { from: Date; to: Date } };

const PERIOD_QUICK_PRESET_DEFS: Record<PeriodMode, PresetDef[]> = {
  day: [
    { labelKey: 'date.today', getRange: () => ({ from: new Date(TODAY), to: new Date(TODAY) }) },
    { labelKey: 'date.yesterday', getRange: () => { const y = new Date(TODAY); y.setDate(y.getDate() - 1); return { from: startOfDay(y), to: startOfDay(y) }; } },
  ],
  week: [
    { labelKey: 'date.thisWeek', getRange: () => ({ from: startOfWeek(TODAY), to: clampToToday(endOfWeek(TODAY)) }) },
    { labelKey: 'date.lastWeek', getRange: () => { const p = new Date(TODAY); p.setDate(p.getDate() - 7); return { from: startOfWeek(p), to: endOfWeek(p) }; } },
  ],
  month: [
    { labelKey: 'date.thisMonth', getRange: () => ({ from: startOfMonth(TODAY), to: new Date(TODAY) }) },
    { labelKey: 'date.lastMonth', getRange: () => { const d = new Date(TODAY.getFullYear(), TODAY.getMonth() - 1, 1); return { from: d, to: endOfMonth(d) }; } },
  ],
  quarter: [
    { labelKey: 'date.thisQuarter', getRange: () => { const q = Math.floor(TODAY.getMonth() / 3); return { from: new Date(TODAY.getFullYear(), q * 3, 1), to: new Date(TODAY) }; } },
    { labelKey: 'date.lastQuarter', getRange: () => { const q = Math.floor(TODAY.getMonth() / 3); const s = new Date(TODAY.getFullYear(), (q - 1) * 3, 1); return { from: s, to: endOfQuarter(s) }; } },
  ],
  year: [
    { labelKey: 'date.thisYear', getRange: () => ({ from: startOfYear(TODAY), to: new Date(TODAY) }) },
    { labelKey: 'date.lastYear', getRange: () => { const d = new Date(TODAY.getFullYear() - 1, 0, 1); return { from: d, to: endOfYear(d) }; } },
  ],
};

// ── Slider tick generation ───────────────────────────────────────────────────

type SliderTick = { label: string; startDate: Date; endDate: Date };

function getSliderTicks(mode: PeriodMode, year: number, month: number): SliderTick[] {
  switch (mode) {
    case 'year': {
      const ticks: SliderTick[] = [];
      for (let y = MIN_YEAR; y <= CURRENT_YEAR; y++) {
        ticks.push({ label: String(y), startDate: new Date(y, 0, 1), endDate: new Date(y, 11, 31) });
      }
      return ticks;
    }
    case 'quarter': {
      const ticks: SliderTick[] = [];
      for (let q = 0; q < 4; q++) {
        const s = new Date(year, q * 3, 1);
        ticks.push({ label: `Q${q + 1}`, startDate: s, endDate: endOfQuarter(s) });
      }
      return ticks;
    }
    case 'month': {
      return MONTHS_NL.map((name, i) => ({
        label: name.charAt(0) + name.slice(1).toLowerCase(),
        startDate: new Date(year, i, 1),
        endDate: endOfMonth(new Date(year, i, 1)),
      }));
    }
    case 'week': {
      const ticks: SliderTick[] = [];
      const start = startOfWeek(new Date(year, month, 1));
      const endBound = new Date(year, month + 3, 0);
      const d = new Date(start);
      while (d <= endBound) {
        const we = endOfWeek(d);
        const wn = getISOWeekNumber(d);
        ticks.push({ label: `W ${String(wn).padStart(2, '0')}`, startDate: new Date(d), endDate: we });
        d.setDate(d.getDate() + 7);
      }
      return ticks;
    }
    case 'day': {
      const dim = endOfMonth(new Date(year, month, 1)).getDate();
      return Array.from({ length: dim }, (_, i) => ({
        label: String(i + 1),
        startDate: new Date(year, month, i + 1),
        endDate: new Date(year, month, i + 1),
      }));
    }
  }
}

// ── Drag state types (for popover mode) ──────────────────────────────────────

type DragState = {
  mode: 'select' | 'resize-left' | 'resize-right';
  anchor: number;
  current: number;
};

type DayDragState = { anchor: Date; current: Date };

// ── Component ────────────────────────────────────────────────────────────────

interface DateRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  anchorEl?: HTMLElement | null;
  onClose?: () => void;
  hidePresets?: boolean;
  inline?: boolean;
  /** External control to open the dialog (for inline mode) */
  dialogOpen?: boolean;
  onDialogOpenChange?: (open: boolean) => void;
  /** Callback to expose shift-range functionality to parent */
  onShiftRangeRef?: (shiftRange: (dir: -1 | 1) => void) => void;
  /** Inline mode without the slider — just the dialog */
  hideSlider?: boolean;
}

export { formatDateNL };

const toLinear = (year: number, month: number) => year * 12 + month;
const fromLinear = (lm: number) => ({ year: Math.floor(lm / 12), month: lm % 12 });

export default function DateRangeSelector({ value, onChange, anchorEl, onClose, hidePresets = false, inline = false, dialogOpen: externalDialogOpen, onDialogOpenChange, onShiftRangeRef, hideSlider = false }: DateRangeSelectorProps) {
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();
  const open = inline || Boolean(anchorEl);

  // ── Shared state ──────────────────────────────────────────────────────────

  const { from: initialFrom, to: initialTo } = useMemo(() => parseDateRange(value), [value]);
  const [rangeFrom, setRangeFrom] = useState(initialFrom);
  const [rangeTo, setRangeTo] = useState(initialTo);

  useEffect(() => {
    const { from, to } = parseDateRange(value);
    setRangeFrom(from);
    setRangeTo(to);
  }, [value]);

  const commitRange = useCallback((from: Date, to: Date) => {
    setRangeFrom(from);
    setRangeTo(to);
    onChange(dateRangeToString(from, to));
  }, [onChange]);

  // ══════════════════════════════════════════════════════════════════════════
  // ── INLINE MODE (range slider + dialog) ───────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════

  const [periodMode, setPeriodMode] = useState<PeriodMode>(() => detectPeriodMode(initialFrom, initialTo));
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  const dialogOpen = externalDialogOpen !== undefined ? externalDialogOpen : internalDialogOpen;
  const setDialogOpen = useCallback((open: boolean) => {
    if (onDialogOpenChange) onDialogOpenChange(open);
    else setInternalDialogOpen(open);
  }, [onDialogOpenChange]);
  const [dialogFrom, setDialogFrom] = useState(initialFrom);
  const [dialogTo, setDialogTo] = useState(initialTo);
  const [dialogDragAnchor, setDialogDragAnchor] = useState<Date | null>(null);
  const [sliderYear, setSliderYear] = useState(initialFrom.getFullYear());
  const [sliderMonth, setSliderMonth] = useState(initialFrom.getMonth());

  // Dialog calendar navigation
  const [dlgLeftYear, setDlgLeftYear] = useState(CURRENT_YEAR - 1);
  const [dlgRightYear, setDlgRightYear] = useState(CURRENT_YEAR);
  const [dlgLeftMonth, setDlgLeftMonth] = useState(() => new Date(initialFrom.getFullYear(), initialFrom.getMonth(), 1));
  const [dlgRightMonth, setDlgRightMonth] = useState(() => new Date(initialFrom.getFullYear(), initialFrom.getMonth() + 1, 1));

  // Sync slider viewport when range changes
  useEffect(() => {
    setSliderYear(rangeFrom.getFullYear());
    setSliderMonth(rangeFrom.getMonth());
  }, [rangeFrom]);

  // ── Dialog handlers ──

  const handleDialogOpen = useCallback(() => {
    setDialogFrom(rangeFrom);
    setDialogTo(rangeTo);
    const y = rangeFrom.getFullYear();
    setDlgLeftYear(Math.max(MIN_YEAR, Math.min(y, CURRENT_YEAR - 1)));
    setDlgRightYear(Math.max(MIN_YEAR + 1, Math.min(y + 1, CURRENT_YEAR)));
    setDlgLeftMonth(new Date(rangeFrom.getFullYear(), rangeFrom.getMonth(), 1));
    const rm = new Date(rangeFrom.getFullYear(), rangeFrom.getMonth() + 1, 1);
    setDlgRightMonth(rm > TODAY ? new Date(TODAY.getFullYear(), TODAY.getMonth(), 1) : rm);
    setDialogOpen(true);
  }, [rangeFrom, rangeTo]);

  const handleDialogApply = useCallback(() => {
    commitRange(dialogFrom, dialogTo);
    setDialogOpen(false);
    setSliderYear(dialogFrom.getFullYear());
    setSliderMonth(dialogFrom.getMonth());
  }, [dialogFrom, dialogTo, commitRange]);

  const handleDialogCancel = useCallback(() => { setDialogOpen(false); }, []);

  const handlePeriodModeChange = useCallback((newMode: PeriodMode) => {
    setPeriodMode(newMode);
    const snapped = snapRange(dialogFrom, dialogTo, newMode);
    setDialogFrom(snapped.from);
    setDialogTo(snapped.to);
  }, [dialogFrom, dialogTo]);

  const handleDialogPresetClick = useCallback((preset: Preset) => {
    const { from, to } = preset.getRange();
    setDialogFrom(from);
    setDialogTo(to);
    setDialogDragAnchor(null);
    // Update calendar navigation
    const y = from.getFullYear();
    setDlgLeftYear(Math.max(MIN_YEAR, Math.min(y, CURRENT_YEAR - 1)));
    setDlgRightYear(Math.max(MIN_YEAR + 1, Math.min(y + 1, CURRENT_YEAR)));
    setDlgLeftMonth(new Date(from.getFullYear(), from.getMonth(), 1));
    const rm = new Date(from.getFullYear(), from.getMonth() + 1, 1);
    setDlgRightMonth(rm > TODAY ? new Date(TODAY.getFullYear(), TODAY.getMonth(), 1) : rm);
  }, []);

  // ── Dialog calendar selection handlers ──

  const handleDialogSelect = useCallback((unitStart: Date, unitEnd: Date) => {
    if (unitStart > TODAY) return;
    const to = clampToToday(unitEnd);
    if (!dialogDragAnchor) {
      setDialogDragAnchor(unitStart);
      setDialogFrom(unitStart);
      setDialogTo(to);
    }
  }, [dialogDragAnchor]);

  const handleDialogDragEnter = useCallback((unitStart: Date, unitEnd: Date) => {
    if (!dialogDragAnchor || unitStart > TODAY) return;
    if (unitStart < dialogDragAnchor) {
      setDialogFrom(unitStart);
      // Keep the end at the anchor's unit end
    } else {
      setDialogTo(clampToToday(unitEnd));
    }
    // Recalculate properly
    const aStart = dialogDragAnchor;
    if (unitStart < aStart) {
      setDialogFrom(unitStart);
    } else {
      setDialogFrom(aStart);
      setDialogTo(clampToToday(unitEnd));
    }
  }, [dialogDragAnchor]);

  const handleDialogDragUp = useCallback(() => { setDialogDragAnchor(null); }, []);

  // ── Slider handlers ──

  const sliderRef = useRef<HTMLDivElement>(null);
  const [sliderDrag, setSliderDrag] = useState<{ side: 'left' | 'right'; startIdx: number; endIdx: number } | null>(null);
  const sliderDragRef = useRef(sliderDrag);
  sliderDragRef.current = sliderDrag;

  // Keep current ticks in a ref so global pointer handlers can access them
  const sliderTicksRef = useRef<SliderTick[]>([]);

  const getTickIdxFromClientX = useCallback((clientX: number): number | null => {
    const el = sliderRef.current;
    const ticks = sliderTicksRef.current;
    if (!el || ticks.length < 2) return null;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(ratio * (ticks.length - 1));
  }, []);

  // Use global pointer events for drag (so it works even when cursor leaves the component)
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const drag = sliderDragRef.current;
      if (!drag) return;
      const ticks = sliderTicksRef.current;
      const idx = getTickIdxFromClientX(e.clientX);
      if (idx === null) return;
      if (ticks[idx]?.startDate > TODAY) return;
      if (drag.side === 'left') {
        const newStart = Math.min(idx, drag.endIdx);
        setSliderDrag({ ...drag, startIdx: newStart });
      } else {
        const newEnd = Math.max(idx, drag.startIdx);
        setSliderDrag({ ...drag, endIdx: newEnd });
      }
    };
    const handleUp = () => {
      const drag = sliderDragRef.current;
      if (!drag) return;
      const ticks = sliderTicksRef.current;
      const from = ticks[drag.startIdx]?.startDate;
      const to = ticks[drag.endIdx]?.endDate;
      if (from && to) commitRange(from, clampToToday(to));
      setSliderDrag(null);
    };
    if (sliderDrag) {
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
      return () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      };
    }
  }, [sliderDrag, getTickIdxFromClientX, commitRange]);

  const handleTickClick = useCallback((tick: SliderTick) => {
    if (tick.startDate > TODAY || sliderDragRef.current) return;
    commitRange(tick.startDate, clampToToday(tick.endDate));
  }, [commitRange]);

  const handleShiftRange = useCallback((dir: -1 | 1) => {
    const shift = (d: Date, amount: number): Date => {
      const r = new Date(d);
      switch (periodMode) {
        case 'day': r.setDate(r.getDate() + amount); break;
        case 'week': r.setDate(r.getDate() + amount * 7); break;
        case 'month': r.setMonth(r.getMonth() + amount); break;
        case 'quarter': r.setMonth(r.getMonth() + amount * 3); break;
        case 'year': r.setFullYear(r.getFullYear() + amount); break;
      }
      return r;
    };
    const newFrom = shift(rangeFrom, dir);
    const newTo = shift(rangeTo, dir);
    if (newFrom < new Date(MIN_YEAR, 0, 1)) return;
    if (newFrom > TODAY) return;
    commitRange(newFrom, clampToToday(newTo));
  }, [periodMode, rangeFrom, rangeTo, commitRange]);

  useEffect(() => {
    onShiftRangeRef?.(handleShiftRange);
  }, [onShiftRangeRef, handleShiftRange]);

  // ── Dialog calendar renders ──

  const renderDayWeekCalendar = () => {
    const months = [dlgLeftMonth, dlgRightMonth];
    const canGoBack = dlgLeftMonth > new Date(MIN_YEAR, 0, 1);
    const canGoForward = new Date(dlgRightMonth.getFullYear(), dlgRightMonth.getMonth() + 1, 1) <= TODAY;

    const goBack = () => {
      setDlgLeftMonth(new Date(dlgLeftMonth.getFullYear(), dlgLeftMonth.getMonth() - 1, 1));
      setDlgRightMonth(new Date(dlgRightMonth.getFullYear(), dlgRightMonth.getMonth() - 1, 1));
    };
    const goForward = () => {
      setDlgLeftMonth(new Date(dlgLeftMonth.getFullYear(), dlgLeftMonth.getMonth() + 1, 1));
      setDlgRightMonth(new Date(dlgRightMonth.getFullYear(), dlgRightMonth.getMonth() + 1, 1));
    };

    return (
      <Box onPointerUp={handleDialogDragUp}>
        {/* Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <IconButton size="small" onClick={goBack} disabled={!canGoBack}>
            <ChevronLeftIcon sx={{ color: !canGoBack ? c.textDisabled : c.brand }} />
          </IconButton>
          <Box sx={{ display: 'flex', gap: 8, flex: 1, justifyContent: 'center' }}>
            {months.map((m, idx) => (
              <Typography key={idx} sx={{ fontWeight: 700, fontSize: '0.95rem', color: c.textPrimary }}>
                {MONTHS_NL[m.getMonth()]} {m.getFullYear()}
              </Typography>
            ))}
          </Box>
          <IconButton size="small" onClick={goForward} disabled={!canGoForward}>
            <ChevronRightIcon sx={{ color: !canGoForward ? c.textDisabled : c.brand }} />
          </IconButton>
        </Box>

        {/* Calendars side by side */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          {months.map((monthDate, mIdx) => {
            const year = monthDate.getFullYear();
            const month = monthDate.getMonth();
            const rows = getCalendarRows(year, month);
            return (
              <Box key={mIdx} sx={{ flex: 1 }}>
                {/* Headers */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '32px repeat(7, 1fr)', gap: 0 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: c.textTertiary, textAlign: 'center', py: 0.5 }}>
                    Wk
                  </Typography>
                  {DAY_HEADERS.map(dh => (
                    <Typography key={dh} sx={{ fontSize: '0.75rem', fontWeight: 600, color: c.textTertiary, textAlign: 'center', py: 0.5 }}>
                      {dh}
                    </Typography>
                  ))}
                </Box>
                {/* Rows */}
                {rows.map((row, rIdx) => {
                  const weekStart = new Date(year, month, row.days.find(d => d !== null) || 1);
                  const weekEnd = endOfWeek(weekStart);
                  const weekInRange = weekStart >= dialogFrom && clampToToday(weekEnd) <= dialogTo;
                  const isWeekMode = periodMode === 'week';

                  return (
                    <Box
                      key={rIdx}
                      onPointerDown={isWeekMode ? () => {
                        const ws = startOfWeek(weekStart);
                        handleDialogSelect(ws, endOfWeek(ws));
                      } : undefined}
                      onPointerEnter={isWeekMode && dialogDragAnchor ? () => {
                        const ws = startOfWeek(weekStart);
                        handleDialogDragEnter(ws, endOfWeek(ws));
                      } : undefined}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '32px repeat(7, 1fr)',
                        gap: 0,
                        cursor: isWeekMode ? 'pointer' : 'default',
                        bgcolor: isWeekMode && weekInRange ? c.bgActive : 'transparent',
                        borderRadius: '4px',
                        '&:hover': isWeekMode ? { bgcolor: weekInRange ? c.bgActiveHover : c.bgPrimaryHover } : {},
                        transition: 'background-color 0.1s',
                      }}
                    >
                      {/* Week number */}
                      <Typography sx={{
                        fontSize: '0.75rem', fontWeight: 500, color: c.textTertiary,
                        textAlign: 'center', py: 0.75,
                      }}>
                        {String(row.weekNum).padStart(2, '0')}
                      </Typography>
                      {/* Day cells */}
                      {row.days.map((day, dIdx) => {
                        if (day === null) return <Box key={dIdx} />;
                        const date = new Date(year, month, day);
                        const isFuture = date > TODAY;
                        const isToday = date.getTime() === TODAY.getTime();
                        const d = startOfDay(date);
                        const inRange = !isFuture && d >= dialogFrom && d <= dialogTo;
                        const isStart = d.getTime() === dialogFrom.getTime();
                        const isEnd = d.getTime() === dialogTo.getTime();

                        return (
                          <Box
                            key={dIdx}
                            onPointerDown={!isWeekMode ? () => handleDialogSelect(d, d) : undefined}
                            onPointerEnter={!isWeekMode && dialogDragAnchor ? () => handleDialogDragEnter(d, d) : undefined}
                            sx={{
                              textAlign: 'center', py: 0.75,
                              cursor: isFuture ? 'default' : isWeekMode ? 'pointer' : 'pointer',
                              bgcolor: (isStart || isEnd) ? c.brand : inRange ? c.bgActive : 'transparent',
                              color: (isStart || isEnd) ? '#fff' : isFuture ? c.textDisabled : inRange ? c.brand : c.textPrimary,
                              borderRadius: isStart && isEnd ? '6px' : isStart ? '6px 0 0 6px' : isEnd ? '0 6px 6px 0' : 0,
                              border: isToday && !isStart && !isEnd ? `1px solid ${c.brand}` : 'none',
                              transition: 'background-color 0.1s',
                              '&:hover': !isFuture && !isWeekMode ? {
                                bgcolor: (isStart || isEnd) ? c.brand : c.bgPrimaryHover,
                              } : {},
                            }}
                          >
                            <Typography sx={{
                              fontSize: '0.8rem',
                              fontWeight: inRange || isToday ? 600 : 400,
                              color: 'inherit',
                            }}>
                              {day}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  const renderMonthCalendar = () => {
    const years = [dlgLeftYear, dlgRightYear];
    const canGoBack = dlgLeftYear > MIN_YEAR;
    const canGoForward = dlgRightYear < CURRENT_YEAR;

    return (
      <Box onPointerUp={handleDialogDragUp}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <IconButton size="small" onClick={() => { setDlgLeftYear(y => y - 1); setDlgRightYear(y => y - 1); }} disabled={!canGoBack}>
            <ChevronLeftIcon sx={{ color: !canGoBack ? c.textDisabled : c.brand }} />
          </IconButton>
          <Box sx={{ display: 'flex', gap: 12, flex: 1, justifyContent: 'center' }}>
            {years.map(y => (
              <Typography key={y} sx={{ fontWeight: 700, fontSize: '1.1rem', color: c.textPrimary }}>{y}</Typography>
            ))}
          </Box>
          <IconButton size="small" onClick={() => { setDlgLeftYear(y => y + 1); setDlgRightYear(y => y + 1); }} disabled={!canGoForward}>
            <ChevronRightIcon sx={{ color: !canGoForward ? c.textDisabled : c.brand }} />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', gap: 4 }}>
          {years.map(year => (
            <Box key={year} sx={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.5 }}>
              {MONTHS_NL.map((name, i) => {
                const mStart = new Date(year, i, 1);
                const mEnd = endOfMonth(mStart);
                const isFuture = mStart > TODAY;
                const inRange = !isFuture && mStart >= dialogFrom && clampToToday(mEnd) <= dialogTo;
                const isStart = dialogFrom.getFullYear() === year && dialogFrom.getMonth() === i;
                const isEnd = dialogTo.getFullYear() === year && dialogTo.getMonth() === i;
                const isToday = TODAY.getFullYear() === year && TODAY.getMonth() === i;

                return (
                  <Box
                    key={i}
                    onPointerDown={() => handleDialogSelect(mStart, mEnd)}
                    onPointerEnter={dialogDragAnchor ? () => handleDialogDragEnter(mStart, mEnd) : undefined}
                    sx={{
                      textAlign: 'center', py: 1.5,
                      cursor: isFuture ? 'default' : 'pointer',
                      bgcolor: (isStart || isEnd) ? c.brand : inRange ? c.bgActive : 'transparent',
                      color: (isStart || isEnd) ? '#fff' : isFuture ? c.textDisabled : inRange ? c.brand : c.textPrimary,
                      borderRadius: '6px',
                      border: isToday && !isStart && !isEnd ? `1px solid ${c.brand}` : 'none',
                      transition: 'all 0.1s',
                      '&:hover': !isFuture ? { bgcolor: (isStart || isEnd) ? c.brand : c.bgPrimaryHover } : {},
                    }}
                  >
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: inRange || isStart || isEnd ? 600 : 400, color: 'inherit' }}>
                      {name}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const renderQuarterCalendar = () => {
    const years = [dlgLeftYear, dlgRightYear];
    const canGoBack = dlgLeftYear > MIN_YEAR;
    const canGoForward = dlgRightYear < CURRENT_YEAR;

    return (
      <Box onPointerUp={handleDialogDragUp}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <IconButton size="small" onClick={() => { setDlgLeftYear(y => y - 1); setDlgRightYear(y => y - 1); }} disabled={!canGoBack}>
            <ChevronLeftIcon sx={{ color: !canGoBack ? c.textDisabled : c.brand }} />
          </IconButton>
          <Box sx={{ display: 'flex', gap: 12, flex: 1, justifyContent: 'center' }}>
            {years.map(y => (
              <Typography key={y} sx={{ fontWeight: 700, fontSize: '1.1rem', color: c.textPrimary }}>{y}</Typography>
            ))}
          </Box>
          <IconButton size="small" onClick={() => { setDlgLeftYear(y => y + 1); setDlgRightYear(y => y + 1); }} disabled={!canGoForward}>
            <ChevronRightIcon sx={{ color: !canGoForward ? c.textDisabled : c.brand }} />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', gap: 4 }}>
          {years.map(year => (
            <Box key={year} sx={{ flex: 1 }}>
              {[0, 1, 2, 3].map(q => {
                const qStart = new Date(year, q * 3, 1);
                const qEnd = endOfQuarter(qStart);
                const isFuture = qStart > TODAY;
                const clampedEnd = clampToToday(qEnd);
                const fullyInRange = !isFuture && qStart >= dialogFrom && clampedEnd <= dialogTo;

                return (
                  <Box
                    key={q}
                    onPointerDown={() => handleDialogSelect(qStart, qEnd)}
                    onPointerEnter={dialogDragAnchor ? () => handleDialogDragEnter(qStart, qEnd) : undefined}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '40px repeat(3, 1fr)',
                      gap: 0.5,
                      mb: 0.5,
                      cursor: isFuture ? 'default' : 'pointer',
                      '&:hover': !isFuture ? { '& .q-label': { color: c.brand } } : {},
                    }}
                  >
                    <Typography className="q-label" sx={{
                      fontSize: '0.8rem', fontWeight: 600, py: 1.5,
                      color: fullyInRange ? c.brand : isFuture ? c.textDisabled : c.textTertiary,
                      textAlign: 'center',
                      transition: 'color 0.1s',
                    }}>
                      Q{q + 1}
                    </Typography>
                    {[0, 1, 2].map(mi => {
                      const monthIdx = q * 3 + mi;
                      const mStart = new Date(year, monthIdx, 1);
                      const mEnd = endOfMonth(mStart);
                      const mFuture = mStart > TODAY;
                      const mInRange = !mFuture && mStart >= dialogFrom && clampToToday(mEnd) <= dialogTo;
                      const isToday = TODAY.getFullYear() === year && TODAY.getMonth() === monthIdx;

                      return (
                        <Box key={mi} sx={{
                          textAlign: 'center', py: 1.5,
                          bgcolor: mInRange ? c.brand : 'transparent',
                          color: mInRange ? '#fff' : mFuture ? c.textDisabled : c.textPrimary,
                          borderRadius: '6px',
                          border: isToday && !mInRange ? `1px solid ${c.brand}` : 'none',
                          transition: 'all 0.1s',
                        }}>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: mInRange ? 600 : 400, color: 'inherit' }}>
                            {MONTHS_NL[monthIdx]}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const renderYearCalendar = () => {
    const years: number[] = [];
    for (let y = MIN_YEAR; y <= CURRENT_YEAR; y++) years.push(y);

    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
        {years.map(y => {
          const yStart = new Date(y, 0, 1);
          const yEnd = new Date(y, 11, 31);
          const isFuture = yStart > TODAY;
          const inRange = !isFuture && yStart >= dialogFrom && clampToToday(yEnd) <= dialogTo;
          const isToday = TODAY.getFullYear() === y;

          return (
            <Box
              key={y}
              onClick={() => {
                if (isFuture) return;
                setDialogFrom(yStart);
                setDialogTo(clampToToday(yEnd));
              }}
              sx={{
                textAlign: 'center', py: 2.5,
                cursor: isFuture ? 'default' : 'pointer',
                bgcolor: inRange ? c.brand : 'transparent',
                color: inRange ? '#fff' : isFuture ? c.textDisabled : c.textPrimary,
                borderRadius: '8px',
                border: isToday && !inRange ? `1px solid ${c.brand}` : 'none',
                transition: 'all 0.15s',
                '&:hover': !isFuture ? { bgcolor: inRange ? c.brand : c.bgPrimaryHover } : {},
              }}
            >
              <Typography sx={{ fontSize: '1rem', fontWeight: inRange ? 700 : 500, color: 'inherit' }}>{y}</Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderDialogCalendar = () => {
    switch (periodMode) {
      case 'day': case 'week': return renderDayWeekCalendar();
      case 'month': return renderMonthCalendar();
      case 'quarter': return renderQuarterCalendar();
      case 'year': return renderYearCalendar();
    }
  };

  // ── Slider render ──

  const renderSlider = () => {
    const ticks = getSliderTicks(periodMode, sliderYear, sliderMonth);
    sliderTicksRef.current = ticks;
    const n = ticks.length;

    // Find range overlap (use drag preview if dragging)
    const effectiveFrom = sliderDrag ? ticks[sliderDrag.startIdx]?.startDate ?? rangeFrom : rangeFrom;
    const effectiveTo = sliderDrag ? ticks[sliderDrag.endIdx]?.endDate ?? rangeTo : rangeTo;
    let startIdx = -1, endIdx = -1;
    for (let i = 0; i < n; i++) {
      if (ticks[i].endDate >= effectiveFrom && ticks[i].startDate <= effectiveTo) {
        if (startIdx === -1) startIdx = i;
        endIdx = i;
      }
    }
    const hasRange = startIdx >= 0;

    // Viewport label (shown below the line)
    const viewportLabel = (() => {
      if (periodMode === 'year') return '';
      if (periodMode === 'day') return `${MONTHS_NL[sliderMonth].charAt(0) + MONTHS_NL[sliderMonth].slice(1).toLowerCase()} ${sliderYear}`;
      return String(sliderYear);
    })();

    // Range bar label
    const rangeLabel = (() => {
      if (!hasRange) return '';
      if (startIdx === endIdx) return ticks[startIdx].label;
      return `${ticks[startIdx].label} – ${ticks[endIdx].label}`;
    })();

    const handleHandlePointerDown = (side: 'left' | 'right', e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setSliderDrag({ side, startIdx, endIdx });
    };

    const isDragging = !!sliderDrag;

    return (
      <Box>
        {/* Slider row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, userSelect: 'none' }}>
          {/* Tick bar */}
          <Box ref={sliderRef} sx={{ flex: 1, position: 'relative', height: 48, minWidth: 100, mb: viewportLabel ? 2.5 : 0 }}>
            {/* Viewport label (bottom-left, below the line) */}
            {viewportLabel && (
              <Typography sx={{
                position: 'absolute', left: 0, top: 34,
                fontSize: '0.75rem', fontWeight: 600, color: c.textSecondary,
              }}>
                {viewportLabel}
              </Typography>
            )}
            {/* Base line */}
            <Box sx={{
              position: 'absolute', left: 0, right: 0, top: 22,
              height: 2, bgcolor: c.borderSecondary, borderRadius: 1,
            }} />

            {/* Range bar background (separate from handles so opacity doesn't affect them) */}
            {hasRange && n > 1 && (
              <Box sx={{
                position: 'absolute',
                left: `${(startIdx / (n - 1)) * 100}%`,
                width: `${(Math.max(0, endIdx - startIdx) / (n - 1)) * 100}%`,
                top: 19, height: 8,
                bgcolor: c.brand, borderRadius: 4, opacity: 0.25,
                pointerEvents: 'none',
                transition: isDragging ? 'none' : 'left 0.2s, width 0.2s',
              }} />
            )}

            {/* Drag handles (rendered independently at full opacity, above everything) */}
            {hasRange && n > 1 && (
              <>
                {/* Left drag handle */}
                <Box
                  onPointerDown={(e) => handleHandlePointerDown('left', e)}
                  sx={{
                    position: 'absolute',
                    left: `${(startIdx / (n - 1)) * 100}%`,
                    top: 23, transform: 'translate(-50%, -50%)',
                    width: 14, height: 14, borderRadius: '50%', bgcolor: c.brand,
                    border: `2px solid ${c.bgPrimary}`, boxShadow: `0 1px 4px rgba(0,0,0,0.2)`,
                    cursor: 'ew-resize', zIndex: 5,
                    transition: isDragging ? 'none' : 'left 0.2s',
                    '&:hover': { transform: 'translate(-50%, -50%) scale(1.25)' },
                    /* Larger invisible hit area */
                    '&::before': {
                      content: '""', position: 'absolute',
                      top: -8, left: -8, right: -8, bottom: -8,
                    },
                  }}
                />
                {/* Right drag handle */}
                <Box
                  onPointerDown={(e) => handleHandlePointerDown('right', e)}
                  sx={{
                    position: 'absolute',
                    left: `${(endIdx / (n - 1)) * 100}%`,
                    top: 23, transform: 'translate(-50%, -50%)',
                    width: 14, height: 14, borderRadius: '50%', bgcolor: c.brand,
                    border: `2px solid ${c.bgPrimary}`, boxShadow: `0 1px 4px rgba(0,0,0,0.2)`,
                    cursor: 'ew-resize', zIndex: 5,
                    transition: isDragging ? 'none' : 'left 0.2s',
                    '&:hover': { transform: 'translate(-50%, -50%) scale(1.25)' },
                    '&::before': {
                      content: '""', position: 'absolute',
                      top: -8, left: -8, right: -8, bottom: -8,
                    },
                  }}
                />
              </>
            )}

            {/* Ticks */}
            {ticks.map((tick, i) => {
              const isFuture = tick.startDate > TODAY;
              const inRange = hasRange && i >= startIdx && i <= endIdx;
              const pct = n > 1 ? `${(i / (n - 1)) * 100}%` : '50%';
              return (
                <Box
                  key={i}
                  onClick={() => handleTickClick(tick)}
                  sx={{
                    position: 'absolute', left: pct,
                    top: 0, bottom: 0,
                    transform: 'translateX(-50%)',
                    cursor: isFuture ? 'default' : 'pointer',
                    '&:hover .tick-dot': !isFuture ? { transform: 'translateX(-50%) scale(1.4)' } : {},
                  }}
                >
                  {/* Label above the line */}
                  <Typography sx={{
                    position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
                    fontSize: '0.6rem', fontWeight: inRange ? 600 : 400,
                    color: isFuture ? c.textDisabled : inRange ? c.brand : c.textTertiary,
                    whiteSpace: 'nowrap', userSelect: 'none',
                  }}>
                    {tick.label}
                  </Typography>
                  {/* Dot centered on the line */}
                  <Box className="tick-dot" sx={{
                    position: 'absolute', top: 20, left: '50%',
                    transform: 'translateX(-50%)',
                    width: 6, height: 6, borderRadius: '50%',
                    bgcolor: isFuture ? c.textDisabled : inRange ? c.brand : c.borderPrimary,
                    transition: 'transform 0.15s, background-color 0.15s',
                    zIndex: 1,
                  }} />
                </Box>
              );
            })}

            {/* Range label below the line */}
            {hasRange && n > 1 && rangeLabel && (
              <Typography sx={{
                position: 'absolute',
                left: `${((startIdx + endIdx) / 2 / (n - 1)) * 100}%`,
                transform: 'translateX(-50%)',
                top: 34, fontSize: '0.6rem', fontWeight: 600, color: c.brand,
                whiteSpace: 'nowrap', userSelect: 'none',
              }}>
                {rangeLabel}
              </Typography>
            )}
          </Box>

        </Box>
      </Box>
    );
  };

  // ── Dialog render ──

  const renderDialog = () => (
    <Dialog
      open={dialogOpen}
      onClose={handleDialogCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: `0 8px 32px ${c.shadowMedium}`,
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{ display: 'flex', minHeight: 420 }}>
        {/* Left sidebar */}
        <Box sx={{
          width: 130, borderRight: '1px solid', borderColor: c.borderSecondary,
          pt: 2.5, pb: 2, bgcolor: c.bgSecondary, flexShrink: 0,
        }}>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, px: 2, pb: 1.5, color: c.textPrimary }}>
            Periode
          </Typography>
          {PERIOD_MODES.map(mode => {
            const isActive = periodMode === mode;
            return (
              <Box
                key={mode}
                onClick={() => handlePeriodModeChange(mode)}
                sx={{
                  px: 2, py: 0.75, cursor: 'pointer',
                  borderLeft: isActive ? `3px solid ${c.brand}` : '3px solid transparent',
                  bgcolor: isActive ? c.bgActive : 'transparent',
                  '&:hover': { bgcolor: isActive ? c.bgActive : c.bgPrimaryHover },
                  transition: 'all 0.15s',
                }}
              >
                <Typography sx={{
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? c.brand : c.textSecondary,
                }}>
                  {PERIOD_LABELS[mode]}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Right content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
          {/* Quick presets + date display */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
            {PERIOD_QUICK_PRESET_DEFS[periodMode].map(presetDef => {
              const { from: pf, to: pt } = presetDef.getRange();
              const isActive = dialogFrom.getTime() === pf.getTime() && dialogTo.getTime() === pt.getTime();
              const presetLabel = t(presetDef.labelKey);
              return (
                <Chip
                  key={presetDef.labelKey}
                  label={presetLabel}
                  size="small"
                  onClick={() => handleDialogPresetClick({ label: presetLabel, getRange: presetDef.getRange })}
                  variant={isActive ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.8rem', cursor: 'pointer',
                    bgcolor: isActive ? c.bgActive : 'transparent',
                    color: isActive ? c.brand : c.textSecondary,
                    borderColor: isActive ? c.brand : c.borderSecondary,
                    '&:hover': { bgcolor: isActive ? c.bgActive : c.bgPrimaryHover },
                  }}
                />
              );
            })}
            <Box sx={{ flex: 1 }} />
            {/* Van / Naar */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.75,
                border: '1px solid', borderColor: c.borderSecondary, borderRadius: '6px',
                px: 1.5, py: 0.5,
              }}>
                <Typography sx={{ fontSize: '0.75rem', color: c.textTertiary }}>Van</Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: c.textPrimary }}>
                  {formatDateDDMMYYYY(dialogFrom)}
                </Typography>
              </Box>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.75,
                border: '1px solid', borderColor: c.borderSecondary, borderRadius: '6px',
                px: 1.5, py: 0.5,
              }}>
                <Typography sx={{ fontSize: '0.75rem', color: c.textTertiary }}>Naar</Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: c.textPrimary }}>
                  {formatDateDDMMYYYY(dialogTo)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Calendar */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {renderDialogCalendar()}
          </Box>

          {/* Bottom buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2.5, pt: 2, borderTop: '1px solid', borderColor: c.borderSecondary }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleDialogCancel}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                color: c.textSecondary,
                borderColor: c.borderSecondary,
                '&:hover': { bgcolor: c.bgPrimaryHover, borderColor: c.borderPrimary },
              }}
            >
              Annuleren
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleDialogApply}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: c.brand,
                '&:hover': { bgcolor: c.brand, opacity: 0.9 },
              }}
            >
              Pas filter toe
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );

  // ── Inline mode return ──
  if (inline) {
    return (
      <Box>
        {!hideSlider && renderSlider()}
        {renderDialog()}
      </Box>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ── POPOVER MODE (existing behavior for non-inline usage) ─────────────────
  // ══════════════════════════════════════════════════════════════════════════

  const currentYear = CURRENT_YEAR;
  const [viewMode, setViewMode] = useState<ViewMode>('standard');
  const [leftYear, setLeftYear] = useState(() => {
    const y = initialFrom.getFullYear();
    return Math.max(MIN_YEAR, Math.min(y, currentYear - 1));
  });
  const [rightYear, setRightYear] = useState(() => {
    const y = initialFrom.getFullYear();
    return Math.max(MIN_YEAR + 1, Math.min(y + 1, currentYear));
  });

  useEffect(() => {
    if (open) {
      const { from } = parseDateRange(value);
      const y = from.getFullYear();
      setLeftYear(Math.max(MIN_YEAR, Math.min(y, currentYear - 1)));
      setRightYear(Math.max(MIN_YEAR + 1, Math.min(y + 1, currentYear)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const [displayMonth, setDisplayMonth] = useState(() => new Date(initialFrom.getFullYear(), initialFrom.getMonth(), 1));
  const [dayDrag, setDayDrag] = useState<DayDragState | null>(null);

  useEffect(() => {
    const { from } = parseDateRange(value);
    setDisplayMonth(new Date(from.getFullYear(), from.getMonth(), 1));
  }, [value]);

  const leftBlockRef = useRef<HTMLDivElement>(null);
  const rightBlockRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hovered, setHovered] = useState(false);
  const showHandles = !!dragState || hovered;

  const getMonthFromClientX = useCallback((clientX: number): number | null => {
    const blocks = [
      { ref: leftBlockRef, year: leftYear },
      { ref: rightBlockRef, year: rightYear },
    ];
    for (const { ref, year } of blocks) {
      const el = ref.current;
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right) {
        const col = Math.max(0, Math.min(11, Math.floor(((clientX - rect.left) / rect.width) * 12)));
        return toLinear(year, col);
      }
    }
    const leftEl = leftBlockRef.current;
    const rightEl = rightBlockRef.current;
    if (leftEl && clientX < leftEl.getBoundingClientRect().left) return toLinear(leftYear, 0);
    if (rightEl && clientX > rightEl.getBoundingClientRect().right) return toLinear(rightYear, 11);
    return null;
  }, [leftYear, rightYear]);

  const effectiveRange = useMemo(() => {
    if (dragState) {
      const minLM = Math.min(dragState.anchor, dragState.current);
      const maxLM = Math.max(dragState.anchor, dragState.current);
      const { year: fy, month: fm } = fromLinear(minLM);
      const { year: ty, month: tm } = fromLinear(maxLM);
      return { from: new Date(fy, fm, 1), to: clampToToday(endOfMonth(new Date(ty, tm, 1))) };
    }
    return { from: rangeFrom, to: rangeTo };
  }, [dragState, rangeFrom, rangeTo]);

  const effectiveRangeGranular = useMemo(() => {
    if (dayDrag) {
      const from = dayDrag.anchor <= dayDrag.current ? dayDrag.anchor : dayDrag.current;
      const to = dayDrag.anchor <= dayDrag.current ? dayDrag.current : dayDrag.anchor;
      return { from: startOfDay(from), to: clampToToday(startOfDay(to)) };
    }
    return { from: rangeFrom, to: rangeTo };
  }, [dayDrag, rangeFrom, rangeTo]);

  const handleMonthDown = useCallback((year: number, month: number) => {
    if (new Date(year, month, 1) > TODAY) return;
    setDragState({ mode: 'select', anchor: toLinear(year, month), current: toLinear(year, month) });
  }, []);

  const handleMonthEnter = useCallback((year: number, month: number) => {
    if (!dragState || dragState.mode !== 'select') return;
    if (new Date(year, month, 1) > TODAY) return;
    setDragState(prev => prev ? { ...prev, current: toLinear(year, month) } : null);
  }, [dragState]);

  const quarterOrigin = useRef<{ start: number; end: number } | null>(null);

  const handleQuarterDown = useCallback((year: number, quarter: number) => {
    const startMonth = quarter * 3, endMonth = startMonth + 2;
    if (new Date(year, startMonth, 1) > TODAY) return;
    const clampedEnd = new Date(year, endMonth, 1) > TODAY ? TODAY.getMonth() : endMonth;
    quarterOrigin.current = { start: toLinear(year, startMonth), end: toLinear(year, clampedEnd) };
    setDragState({ mode: 'select', anchor: toLinear(year, startMonth), current: toLinear(year, clampedEnd) });
  }, []);

  const handleQuarterEnter = useCallback((year: number, quarter: number) => {
    if (!dragState || dragState.mode !== 'select' || !quarterOrigin.current) return;
    const startMonth = quarter * 3, endMonth = startMonth + 2;
    if (new Date(year, startMonth, 1) > TODAY) return;
    const clampedEnd = new Date(year, endMonth, 1) > TODAY ? TODAY.getMonth() : endMonth;
    const qStart = toLinear(year, startMonth), qEnd = toLinear(year, clampedEnd);
    const orig = quarterOrigin.current;
    if (qStart >= orig.start) {
      setDragState({ mode: 'select', anchor: orig.start, current: qEnd });
    } else {
      setDragState({ mode: 'select', anchor: orig.end, current: qStart });
    }
  }, [dragState]);

  const handleResizeStart = useCallback((side: 'left' | 'right', e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    const fromLM = toLinear(rangeFrom.getFullYear(), rangeFrom.getMonth());
    const toLM = toLinear(rangeTo.getFullYear(), rangeTo.getMonth());
    if (side === 'left') setDragState({ mode: 'resize-left', anchor: toLM, current: fromLM });
    else setDragState({ mode: 'resize-right', anchor: fromLM, current: toLM });
  }, [rangeFrom, rangeTo]);

  const handleContainerPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState || dragState.mode === 'select') return;
    const lm = getMonthFromClientX(e.clientX);
    if (lm === null) return;
    const { year: y, month: m } = fromLinear(lm);
    if (new Date(y, m, 1) > TODAY) return;
    setDragState(prev => prev ? { ...prev, current: lm } : null);
  }, [dragState, getMonthFromClientX]);

  const handlePointerUp = useCallback(() => {
    if (!dragState) return;
    setDragState(null);
    quarterOrigin.current = null;
    commitRange(effectiveRange.from, effectiveRange.to);
  }, [dragState, effectiveRange, commitRange]);

  const handlePresetClick = useCallback((preset: Preset) => {
    const { from, to } = preset.getRange();
    setDragState(null); setDayDrag(null);
    commitRange(from, to);
    if (viewMode === 'standard') {
      setLeftYear(Math.max(MIN_YEAR, Math.min(from.getFullYear(), currentYear - 1)));
      setRightYear(Math.max(MIN_YEAR + 1, Math.min(from.getFullYear() + 1, currentYear)));
    } else {
      setDisplayMonth(new Date(from.getFullYear(), from.getMonth(), 1));
    }
  }, [commitRange, currentYear, viewMode]);

  const handleYearClick = useCallback((year: number) => {
    const from = new Date(year, 0, 1);
    if (from > TODAY) return;
    setDragState(null);
    commitRange(from, clampToToday(endOfYear(from)));
  }, [commitRange]);

  const handleDayDown = useCallback((date: Date) => {
    const d = startOfDay(date);
    if (d > TODAY) return;
    setDayDrag({ anchor: d, current: d });
  }, []);

  const handleDayEnter = useCallback((date: Date) => {
    if (!dayDrag) return;
    const d = startOfDay(date);
    if (d > TODAY) return;
    setDayDrag(prev => prev ? { ...prev, current: d } : null);
  }, [dayDrag]);

  const weekOriginRef = useRef<{ start: Date; end: Date } | null>(null);

  const handleWeekDown = useCallback((week: WeekInfo) => {
    if (week.startDate > TODAY) return;
    weekOriginRef.current = { start: week.startDate, end: clampToToday(week.endDate) };
    setDayDrag({ anchor: week.startDate, current: clampToToday(week.endDate) });
  }, []);

  const handleWeekEnter = useCallback((week: WeekInfo) => {
    if (!dayDrag || !weekOriginRef.current) return;
    if (week.startDate > TODAY) return;
    const clampedEnd = clampToToday(week.endDate);
    const orig = weekOriginRef.current;
    if (week.startDate >= orig.start) {
      setDayDrag({ anchor: orig.start, current: clampedEnd });
    } else {
      setDayDrag({ anchor: orig.end, current: week.startDate });
    }
  }, [dayDrag]);

  const handleMonthClick = useCallback((monthDate: Date) => {
    const from = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    if (from > TODAY) return;
    setDayDrag(null);
    commitRange(from, clampToToday(endOfMonth(from)));
  }, [commitRange]);

  const handleDayPointerUp = useCallback(() => {
    if (!dayDrag) return;
    weekOriginRef.current = null;
    setDayDrag(null);
    commitRange(effectiveRangeGranular.from, effectiveRangeGranular.to);
  }, [dayDrag, effectiveRangeGranular, commitRange]);

  const granularCanGoBack = displayMonth > new Date(MIN_YEAR, 0, 1);
  const granularCanGoForward = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1) <= TODAY;
  const handleGranularNav = useCallback((dir: -1 | 1) => {
    setDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + dir, 1));
  }, []);

  const getHighlight = useCallback((year: number) => {
    const { from, to } = effectiveRange;
    const yearStart = new Date(year, 0, 1), yearEnd = new Date(year, 11, 31);
    if (to < yearStart || from > yearEnd) return null;
    const startCol = from.getFullYear() < year ? 0 : from.getFullYear() === year ? from.getMonth() : 12;
    const endCol = to.getFullYear() > year ? 11 : to.getFullYear() === year ? to.getMonth() : -1;
    if (startCol > 11 || endCol < 0) return null;
    return { startCol, endCol, roundLeft: from.getFullYear() === year, roundRight: to.getFullYear() === year };
  }, [effectiveRange]);

  // ── Popover: render year block ──
  const renderYearBlock = (year: number, side: 'left' | 'right') => {
    const highlight = getHighlight(year);
    const blockRef = side === 'left' ? leftBlockRef : rightBlockRef;
    const { from, to } = effectiveRange;
    const leftPct = highlight ? `${(highlight.startCol / 12) * 100}%` : '0%';
    const widthPct = highlight ? `${((highlight.endCol - highlight.startCol + 1) / 12) * 100}%` : '0%';
    const rightEdgePct = highlight ? `${((highlight.endCol + 1) / 12) * 100}%` : '0%';

    return (
      <Box key={year} sx={{ flex: 1, minWidth: 0 }}>
        <Box ref={blockRef} sx={{ position: 'relative' }}>
          {highlight && (
            <Box sx={{
              position: 'absolute', top: 0, left: leftPct, width: widthPct, height: '100%',
              bgcolor: c.bgActive,
              borderRadius: `${highlight.roundLeft ? 6 : 0}px ${highlight.roundRight ? 6 : 0}px ${highlight.roundRight ? 6 : 0}px ${highlight.roundLeft ? 6 : 0}px`,
              zIndex: 0, pointerEvents: 'none',
            }} />
          )}
          {highlight?.roundLeft && showHandles && (
            <Box onPointerDown={(e) => handleResizeStart('left', e)} sx={{
              position: 'absolute', left: leftPct, top: '50%', transform: 'translate(-50%, -50%)',
              width: 6, height: 28, borderRadius: '3px', bgcolor: c.brand,
              opacity: dragState?.mode === 'resize-left' ? 0.9 : 0.5,
              cursor: 'ew-resize', zIndex: 3, transition: 'opacity 0.15s', '&:hover': { opacity: 0.9 },
            }} />
          )}
          {highlight?.roundRight && showHandles && (
            <Box onPointerDown={(e) => handleResizeStart('right', e)} sx={{
              position: 'absolute', left: rightEdgePct, top: '50%', transform: 'translate(-50%, -50%)',
              width: 6, height: 28, borderRadius: '3px', bgcolor: c.brand,
              opacity: dragState?.mode === 'resize-right' ? 0.9 : 0.5,
              cursor: 'ew-resize', zIndex: 3, transition: 'opacity 0.15s', '&:hover': { opacity: 0.9 },
            }} />
          )}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(36px, 1fr))', position: 'relative', zIndex: 1 }}>
            {MONTHS_SHORT.map((name, i) => {
              const isFuture = new Date(year, i, 1) > TODAY;
              const cellStart = new Date(year, i, 1), cellEnd = endOfMonth(cellStart);
              const inRange = !isFuture && cellStart <= effectiveRange.to && cellEnd >= effectiveRange.from;
              return (
                <Box key={i} onPointerDown={() => handleMonthDown(year, i)} onPointerEnter={() => handleMonthEnter(year, i)}
                  sx={{ textAlign: 'center', py: 1, cursor: isFuture ? 'default' : 'pointer', userSelect: 'none', transition: 'background-color 0.1s', borderRadius: '4px', '&:hover': !isFuture ? { bgcolor: c.bgPrimaryHover } : {} }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: inRange ? 600 : 400, color: isFuture ? c.textDisabled : inRange ? c.brand : c.textSecondary, transition: 'color 0.1s' }}>
                    {name}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', position: 'relative', zIndex: 1, mt: 0.5 }}>
            {[0, 1, 2, 3].map(q => {
              const qStart = new Date(year, q * 3, 1), qEnd = endOfQuarter(qStart);
              const isFuture = qStart > TODAY;
              const clampedQEnd = clampToToday(qEnd);
              const fullyInRange = !isFuture && qStart >= effectiveRange.from && clampedQEnd <= effectiveRange.to;
              return (
                <Box key={q} onPointerDown={() => handleQuarterDown(year, q)} onPointerEnter={() => handleQuarterEnter(year, q)}
                  sx={{ textAlign: 'center', py: 1, cursor: isFuture ? 'default' : 'pointer', userSelect: 'none', transition: 'background-color 0.1s', borderRadius: '4px', '&:hover': !isFuture ? { bgcolor: c.bgPrimaryHover } : {} }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: fullyInRange ? 600 : 500, color: isFuture ? c.textDisabled : fullyInRange ? c.brand : c.textSecondary, transition: 'color 0.1s' }}>
                    Q{q + 1}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pt: 0.75 }}>
          {(() => {
            const canGoBack = side === 'left' ? year > MIN_YEAR : year - 1 > leftYear;
            const canGoForward = side === 'left' ? year + 1 < rightYear : year < currentYear;
            const extendRangeToYear = (newYear: number, direction: 'back' | 'forward') => {
              const fromMonth = rangeFrom.getMonth(), toMonth = rangeTo.getMonth();
              if (direction === 'back') {
                const newFrom = new Date(newYear, fromMonth, 1);
                if (newFrom > TODAY) return;
                commitRange(newFrom, rangeTo);
              } else {
                const newTo = clampToToday(endOfMonth(new Date(newYear, toMonth, 1)));
                if (newTo < rangeFrom) return;
                commitRange(rangeFrom, newTo);
              }
            };
            const goBack = () => {
              const newYear = year - 1;
              if (side === 'left') { const cl = Math.max(MIN_YEAR, newYear); setLeftYear(cl); extendRangeToYear(cl, 'back'); }
              else { const cl = Math.max(leftYear + 1, newYear); setRightYear(cl); extendRangeToYear(cl, 'forward'); }
            };
            const goForward = () => {
              const newYear = year + 1;
              if (side === 'left') { const cl = Math.min(rightYear - 1, newYear); setLeftYear(cl); extendRangeToYear(cl, 'back'); }
              else { const cl = Math.min(currentYear, newYear); setRightYear(cl); extendRangeToYear(cl, 'forward'); }
            };
            return (
              <>
                <IconButton size="small" onClick={goBack} disabled={!canGoBack} sx={{ p: 0.25 }}>
                  <ChevronLeftIcon sx={{ fontSize: '1rem', color: !canGoBack ? c.textDisabled : c.brand }} />
                </IconButton>
                <Typography onClick={() => handleYearClick(year)} sx={{
                  fontSize: '0.85rem', fontWeight: 600,
                  cursor: new Date(year, 0, 1) > TODAY ? 'default' : 'pointer',
                  color: (from <= new Date(year, 0, 1) && to >= new Date(year, 11, 31)) ? c.brand : c.textPrimary,
                  mx: 0.75, userSelect: 'none',
                  '&:hover': new Date(year, 0, 1) <= TODAY ? { color: c.brand } : {},
                  transition: 'color 0.1s',
                }}>
                  {year}
                </Typography>
                <IconButton size="small" onClick={goForward} disabled={!canGoForward} sx={{ p: 0.25 }}>
                  <ChevronRightIcon sx={{ fontSize: '1rem', color: !canGoForward ? c.textDisabled : c.brand }} />
                </IconButton>
              </>
            );
          })()}
        </Box>
      </Box>
    );
  };

  // ── Popover: render month block (granular mode) ──
  const renderPopoverMonthBlock = (monthDate: Date) => {
    const year = monthDate.getFullYear(), month = monthDate.getMonth();
    const daysInMonth = endOfMonth(monthDate).getDate();
    const range = effectiveRangeGranular;
    const monthStart = new Date(year, month, 1), monthEnd = endOfMonth(monthStart);
    const weeks = getMonthWeeks(year, month);

    let highlight: { startDay: number; endDay: number; roundLeft: boolean; roundRight: boolean } | null = null;
    if (range.to >= monthStart && range.from <= monthEnd) {
      const sd = range.from < monthStart ? 1 : range.from.getDate();
      const ed = range.to > monthEnd ? daysInMonth : range.to.getDate();
      highlight = { startDay: sd, endDay: ed, roundLeft: range.from >= monthStart, roundRight: range.to <= monthEnd };
    }
    const leftPct = highlight ? `${((highlight.startDay - 1) / daysInMonth) * 100}%` : '0%';
    const widthPct = highlight ? `${((highlight.endDay - highlight.startDay + 1) / daysInMonth) * 100}%` : '0%';

    return (
      <Box key={`${year}-${month}`} sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ position: 'relative' }}>
          {highlight && (
            <Box sx={{
              position: 'absolute', top: 0, left: leftPct, width: widthPct, height: '100%',
              bgcolor: c.bgActive,
              borderRadius: `${highlight.roundLeft ? 6 : 0}px ${highlight.roundRight ? 6 : 0}px ${highlight.roundRight ? 6 : 0}px ${highlight.roundLeft ? 6 : 0}px`,
              zIndex: 0, pointerEvents: 'none',
            }} />
          )}
          <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${daysInMonth}, 1fr)`, position: 'relative', zIndex: 1 }}>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const isFuture = date > TODAY;
              const d = startOfDay(date);
              const inRange = !isFuture && d >= range.from && d <= range.to;
              return (
                <Box key={day} onPointerDown={() => !isFuture && handleDayDown(date)} onPointerEnter={() => !isFuture && handleDayEnter(date)}
                  sx={{ textAlign: 'center', py: 1, cursor: isFuture ? 'default' : 'pointer', userSelect: 'none', transition: 'background-color 0.1s', borderRadius: '3px', '&:hover': !isFuture ? { bgcolor: c.bgPrimaryHover } : {} }}>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: inRange ? 600 : 400, color: isFuture ? c.textDisabled : inRange ? c.brand : c.textSecondary, transition: 'color 0.1s' }}>
                    {day}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${daysInMonth}, 1fr)`, position: 'relative', zIndex: 1, mt: 0.5 }}>
            {weeks.map((w) => {
              const isFuture = w.startDate > TODAY;
              const clampedEnd = clampToToday(w.endDate);
              const fullyInRange = !isFuture && w.startDate >= range.from && clampedEnd <= range.to;
              return (
                <Box key={w.label} onPointerDown={() => handleWeekDown(w)} onPointerEnter={() => handleWeekEnter(w)}
                  sx={{ gridColumn: `${w.startDay} / ${w.endDay + 1}`, textAlign: 'center', py: 0.75, cursor: isFuture ? 'default' : 'pointer', userSelect: 'none', transition: 'background-color 0.1s', borderRadius: '3px', '&:hover': !isFuture ? { bgcolor: c.bgPrimaryHover } : {} }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: fullyInRange ? 600 : 500, color: isFuture ? c.textDisabled : fullyInRange ? c.brand : c.textSecondary, transition: 'color 0.1s' }}>
                    {w.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pt: 0.75 }}>
          <IconButton size="small" onClick={() => handleGranularNav(-1)} disabled={!granularCanGoBack} sx={{ p: 0.25 }}>
            <ChevronLeftIcon sx={{ fontSize: '1rem', color: !granularCanGoBack ? c.textDisabled : c.brand }} />
          </IconButton>
          <Typography onClick={() => handleMonthClick(monthDate)} sx={{
            fontSize: '0.85rem', fontWeight: 600,
            cursor: monthStart > TODAY ? 'default' : 'pointer',
            color: (range.from <= monthStart && range.to >= monthEnd) ? c.brand : c.textPrimary,
            mx: 0.75, userSelect: 'none',
            '&:hover': monthStart <= TODAY ? { color: c.brand } : {},
            transition: 'color 0.1s',
          }}>
            {MONTHS_SHORT[month]} {year}
          </Typography>
          <IconButton size="small" onClick={() => handleGranularNav(1)} disabled={!granularCanGoForward} sx={{ p: 0.25 }}>
            <ChevronRightIcon sx={{ fontSize: '1rem', color: !granularCanGoForward ? c.textDisabled : c.brand }} />
          </IconButton>
        </Box>
      </Box>
    );
  };

  // ── Popover: segmented control ──
  const segmentSx = (active: boolean) => ({
    px: 1.5, py: 0.5, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px',
    cursor: 'pointer', transition: 'all 0.15s',
    bgcolor: active ? c.bgPrimary : 'transparent',
    color: active ? c.brand : 'text.secondary',
    boxShadow: active ? `0 1px 3px ${c.shadow}` : 'none',
    '&:hover': { color: active ? c.brand : 'text.primary' },
  });

  const segmentedControl = (
    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: c.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', flexShrink: 0, border: `1px solid ${c.borderTertiary}` }}>
      <Box sx={segmentSx(viewMode === 'standard')} onClick={() => setViewMode('standard')}>Monthly</Box>
      <Box sx={segmentSx(viewMode === 'granular')} onClick={() => setViewMode('granular')}>Daily</Box>
    </Box>
  );

  const currentPresets = viewMode === 'standard' ? PRESETS : GRANULAR_PRESETS;

  const popoverContent = (
    <>
      {!hidePresets && (
        <Box sx={{ display: 'flex', gap: 0.75, px: 3, pt: 2, pb: 0, alignItems: 'center' }}>
          {currentPresets.map(preset => {
            const { from: pf, to: pt } = preset.getRange();
            const isActive = rangeFrom.getTime() === pf.getTime() && rangeTo.getTime() === pt.getTime();
            return (
              <Chip key={preset.labelKey} label={t(preset.labelKey)} size="small" onClick={() => handlePresetClick(preset)}
                sx={{
                  fontWeight: isActive ? 600 : 500, fontSize: '0.8rem', cursor: 'pointer',
                  bgcolor: isActive ? c.bgActive : 'transparent', color: isActive ? c.brand : c.textSecondary,
                  border: '1px solid', borderColor: isActive ? c.brand : c.borderSecondary,
                  '&:hover': { bgcolor: isActive ? c.bgActive : c.bgPrimaryHover },
                }}
              />
            );
          })}
          <Box sx={{ flex: 1 }} />
          {segmentedControl}
        </Box>
      )}
      {viewMode === 'standard' ? (
        <Box onPointerMove={handleContainerPointerMove} onPointerUp={handlePointerUp}
          onPointerLeave={() => { if (dragState) handlePointerUp(); }}
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          sx={{ display: 'flex', px: 3, py: 2.5, gap: 0, userSelect: 'none' }}>
          {renderYearBlock(leftYear, 'left')}
          <Box sx={{ width: '1px', bgcolor: c.borderTertiary, mx: '4px', my: 0.5, flexShrink: 0 }} />
          {renderYearBlock(rightYear, 'right')}
        </Box>
      ) : (
        <Box onPointerUp={handleDayPointerUp}
          onPointerLeave={() => { if (dayDrag) handleDayPointerUp(); }}
          sx={{ display: 'flex', px: 3, py: 2.5, userSelect: 'none' }}>
          {renderPopoverMonthBlock(displayMonth)}
        </Box>
      )}
    </>
  );

  return (
    <Popover
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{
        sx: {
          mt: 0.5, width: 920, borderRadius: '12px',
          boxShadow: `0 4px 24px ${c.shadowMedium}`,
          overflow: 'hidden',
        },
      }}
    >
      {popoverContent}
    </Popover>
  );
}
