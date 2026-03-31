'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Chip from '@mui/material/Chip';
import { colors } from '@/colors';

// ── Constants ────────────────────────────────────────────────────────────────

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const MIN_YEAR = 2023;

export type ViewMode = 'standard' | 'granular';

// ── Date helpers ─────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function endOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), q * 3 + 3, 0);
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

function endOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 11, 31);
}

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

function clampToToday(d: Date): Date {
  return d > TODAY ? TODAY : d;
}

type WeekInfo = {
  label: string;
  startDay: number; // 1-based
  endDay: number;   // 1-based
  startDate: Date;
  endDate: Date;
};

function getMonthWeeks(year: number, month: number): WeekInfo[] {
  const lastDay = endOfMonth(new Date(year, month, 1)).getDate();
  const weeks: WeekInfo[] = [];
  let day = 1;
  let weekNum = 1;
  while (day <= lastDay) {
    const date = new Date(year, month, day);
    const dow = (date.getDay() + 6) % 7; // Mon=0
    const daysUntilSunday = 6 - dow;
    const end = Math.min(day + daysUntilSunday, lastDay);
    weeks.push({
      label: `W${weekNum}`,
      startDay: day,
      endDay: end,
      startDate: new Date(year, month, day),
      endDate: new Date(year, month, end),
    });
    weekNum++;
    day = end + 1;
  }
  return weeks;
}

// ── Public API ───────────────────────────────────────────────────────────────

export function parseDateRange(value: string): { from: Date; to: Date } {
  if (value.includes('|')) {
    const [a, b] = value.split('|');
    return { from: startOfDay(new Date(a)), to: startOfDay(new Date(b)) };
  }
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  switch (value) {
    case 'Today': return { from: now, to: now };
    case 'Yesterday': {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { from: startOfDay(y), to: startOfDay(y) };
    }
    case 'This Week': return { from: startOfWeek(now), to: clampToToday(endOfWeek(now)) };
    case 'Last Week': {
      const prevWeek = new Date(now);
      prevWeek.setDate(prevWeek.getDate() - 7);
      return { from: startOfWeek(prevWeek), to: endOfWeek(prevWeek) };
    }
    case 'This Month': return { from: startOfMonth(now), to: now };
    case 'This Quarter': {
      const q = Math.floor(now.getMonth() / 3);
      return { from: new Date(now.getFullYear(), q * 3, 1), to: now };
    }
    case 'This Year': return { from: startOfYear(now), to: now };
    case 'All Time': {
      const origin = new Date(now.getFullYear() - 2, 0, 1);
      return { from: origin, to: now };
    }
    default: {
      return { from: startOfMonth(now), to: now };
    }
  }
}

export function dateRangeToString(from: Date, to: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return `${fmt(from)}|${fmt(to)}`;
}

// ── Presets ──────────────────────────────────────────────────────────────────

export type Preset = { label: string; getRange: () => { from: Date; to: Date } };

export const PRESETS: Preset[] = [
  {
    label: 'This month',
    getRange: () => ({ from: startOfMonth(TODAY), to: new Date(TODAY) }),
  },
  {
    label: 'Last month',
    getRange: () => {
      const d = new Date(TODAY.getFullYear(), TODAY.getMonth() - 1, 1);
      return { from: d, to: endOfMonth(d) };
    },
  },
  {
    label: 'This quarter',
    getRange: () => {
      const q = Math.floor(TODAY.getMonth() / 3);
      return { from: new Date(TODAY.getFullYear(), q * 3, 1), to: new Date(TODAY) };
    },
  },
  {
    label: 'Last quarter',
    getRange: () => {
      const q = Math.floor(TODAY.getMonth() / 3);
      const start = new Date(TODAY.getFullYear(), (q - 1) * 3, 1);
      return { from: start, to: endOfQuarter(start) };
    },
  },
  {
    label: 'This year',
    getRange: () => ({ from: startOfYear(TODAY), to: new Date(TODAY) }),
  },
  {
    label: 'Last year',
    getRange: () => {
      const d = new Date(TODAY.getFullYear() - 1, 0, 1);
      return { from: d, to: endOfYear(d) };
    },
  },
];

export const GRANULAR_PRESETS: Preset[] = [
  {
    label: 'Today',
    getRange: () => ({ from: new Date(TODAY), to: new Date(TODAY) }),
  },
  {
    label: 'Yesterday',
    getRange: () => {
      const y = new Date(TODAY);
      y.setDate(y.getDate() - 1);
      return { from: startOfDay(y), to: startOfDay(y) };
    },
  },
  {
    label: 'This week',
    getRange: () => ({ from: startOfWeek(TODAY), to: clampToToday(endOfWeek(TODAY)) }),
  },
  {
    label: 'Last week',
    getRange: () => {
      const prev = new Date(TODAY);
      prev.setDate(prev.getDate() - 7);
      return { from: startOfWeek(prev), to: endOfWeek(prev) };
    },
  },
  {
    label: 'This quarter',
    getRange: () => {
      const q = Math.floor(TODAY.getMonth() / 3);
      return { from: new Date(TODAY.getFullYear(), q * 3, 1), to: new Date(TODAY) };
    },
  },
  {
    label: 'Last quarter',
    getRange: () => {
      const q = Math.floor(TODAY.getMonth() / 3);
      const start = new Date(TODAY.getFullYear(), (q - 1) * 3, 1);
      return { from: start, to: endOfQuarter(start) };
    },
  },
];

const ALL_PRESETS = [...PRESETS, ...GRANULAR_PRESETS];

export function getDateRangeDisplayLabel(value: string): string {
  const { from, to } = parseDateRange(value);

  // Check if the range matches any preset
  for (const preset of ALL_PRESETS) {
    const { from: pf, to: pt } = preset.getRange();
    if (from.getTime() === pf.getTime() && to.getTime() === pt.getTime()) {
      return preset.label;
    }
  }

  const fy = from.getFullYear();
  const ty = to.getFullYear();
  const fm = from.getMonth(); // 0-based
  const tm = to.getMonth();

  const isQuarterStart = (m: number) => m % 3 === 0;
  const isQuarterEnd = (m: number) => m % 3 === 2;
  const shortYear = (y: number) => String(y).slice(-2);

  // Year-aligned: from=Jan, to=Dec
  if (fm === 0 && tm === 11) {
    if (fy === ty) return `${fy}`;
    return `${fy}–${ty}`;
  }

  // Quarter-aligned: from starts a quarter, to ends a quarter
  if (isQuarterStart(fm) && isQuarterEnd(tm)) {
    const fq = Math.floor(fm / 3) + 1;
    const tq = Math.floor(tm / 3) + 1;
    if (fy === ty && fq === tq) return `Q${fq} ${fy}`;
    if (fy === ty) return `Q${fq}–Q${tq} ${fy}`;
    return `Q${fq} ${shortYear(fy)} – Q${tq} ${shortYear(ty)}`;
  }

  // Single day
  if (from.getTime() === to.getTime()) {
    return `${from.getDate()} ${MONTHS_SHORT[fm]} ${fy}`;
  }

  // Day-level range within same month
  if (fy === ty && fm === tm) {
    if (from.getDate() === 1 && to.getDate() === endOfMonth(from).getDate()) {
      return `${MONTHS_FULL[fm]} ${fy}`;
    }
    return `${from.getDate()}–${to.getDate()} ${MONTHS_SHORT[fm]} ${fy}`;
  }

  // Day-level range across months
  if (fy === ty) return `${from.getDate()} ${MONTHS_SHORT[fm]} – ${to.getDate()} ${MONTHS_SHORT[tm]} ${fy}`;
  return `${from.getDate()} ${MONTHS_SHORT[fm]} ${fy} – ${to.getDate()} ${MONTHS_SHORT[tm]} ${ty}`;
}

// ── Drag state type ──────────────────────────────────────────────────────────

type DragState = {
  mode: 'select' | 'resize-left' | 'resize-right';
  anchor: number;  // linear month index (fixed end)
  current: number; // linear month index (moving end)
};

type DayDragState = {
  anchor: Date;
  current: Date;
};

// ── Component ────────────────────────────────────────────────────────────────

interface DateRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  anchorEl?: HTMLElement | null;
  onClose?: () => void;
  hidePresets?: boolean;
  inline?: boolean;
}

const toLinear = (year: number, month: number) => year * 12 + month;
const fromLinear = (lm: number) => ({ year: Math.floor(lm / 12), month: lm % 12 });

export default function DateRangeSelector({ value, onChange, anchorEl, onClose, hidePresets = false, inline = false }: DateRangeSelectorProps) {
  const open = inline || Boolean(anchorEl);
  const currentYear = TODAY.getFullYear();

  const { from: initialFrom, to: initialTo } = useMemo(() => parseDateRange(value), [value]);
  const [rangeFrom, setRangeFrom] = useState(initialFrom);
  const [rangeTo, setRangeTo] = useState(initialTo);

  useEffect(() => {
    const { from, to } = parseDateRange(value);
    setRangeFrom(from);
    setRangeTo(to);
  }, [value]);

  // ── View mode ────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>('standard');

  // ── Standard mode state ──────────────────────────────────────────────────
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
      const newLeft = Math.max(MIN_YEAR, Math.min(y, currentYear - 1));
      const newRight = Math.max(newLeft + 1, Math.min(y + 1, currentYear));
      setLeftYear(newLeft);
      setRightYear(newRight);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Granular mode state ──────────────────────────────────────────────────
  const [displayMonth, setDisplayMonth] = useState(() => {
    return new Date(initialFrom.getFullYear(), initialFrom.getMonth(), 1);
  });
  const [dayDrag, setDayDrag] = useState<DayDragState | null>(null);

  // Keep displayMonth in sync when value changes
  useEffect(() => {
    const { from } = parseDateRange(value);
    setDisplayMonth(new Date(from.getFullYear(), from.getMonth(), 1));
  }, [value]);

  // ── Refs for year blocks (used for pointer → month hit testing) ─────────

  const leftBlockRef = useRef<HTMLDivElement>(null);
  const rightBlockRef = useRef<HTMLDivElement>(null);

  // ── Drag state ──────────────────────────────────────────────────────────

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

  // Effective range for standard mode (preview during drag, committed otherwise)
  const effectiveRange = useMemo(() => {
    if (dragState) {
      const minLM = Math.min(dragState.anchor, dragState.current);
      const maxLM = Math.max(dragState.anchor, dragState.current);
      const { year: fy, month: fm } = fromLinear(minLM);
      const { year: ty, month: tm } = fromLinear(maxLM);
      return {
        from: new Date(fy, fm, 1),
        to: clampToToday(endOfMonth(new Date(ty, tm, 1))),
      };
    }
    return { from: rangeFrom, to: rangeTo };
  }, [dragState, rangeFrom, rangeTo]);

  // Effective range for granular mode
  const effectiveRangeGranular = useMemo(() => {
    if (dayDrag) {
      const from = dayDrag.anchor <= dayDrag.current ? dayDrag.anchor : dayDrag.current;
      const to = dayDrag.anchor <= dayDrag.current ? dayDrag.current : dayDrag.anchor;
      return { from: startOfDay(from), to: clampToToday(startOfDay(to)) };
    }
    return { from: rangeFrom, to: rangeTo };
  }, [dayDrag, rangeFrom, rangeTo]);

  const commitRange = useCallback((from: Date, to: Date) => {
    setRangeFrom(from);
    setRangeTo(to);
    onChange(dateRangeToString(from, to));
  }, [onChange]);

  // ── Standard mode handlers ─────────────────────────────────────────────

  // Month cell drag (select mode)
  const handleMonthDown = useCallback((year: number, month: number) => {
    if (new Date(year, month, 1) > TODAY) return;
    const lm = toLinear(year, month);
    setDragState({ mode: 'select', anchor: lm, current: lm });
  }, []);

  const handleMonthEnter = useCallback((year: number, month: number) => {
    if (!dragState || dragState.mode !== 'select') return;
    if (new Date(year, month, 1) > TODAY) return;
    setDragState(prev => prev ? { ...prev, current: toLinear(year, month) } : null);
  }, [dragState]);

  // Quarter cell drag (select mode, snaps to quarter boundaries)
  const quarterOrigin = useRef<{ start: number; end: number } | null>(null);

  const handleQuarterDown = useCallback((year: number, quarter: number) => {
    const startMonth = quarter * 3;
    const endMonth = startMonth + 2;
    if (new Date(year, startMonth, 1) > TODAY) return;
    const clampedEnd = new Date(year, endMonth, 1) > TODAY ? TODAY.getMonth() : endMonth;
    quarterOrigin.current = { start: toLinear(year, startMonth), end: toLinear(year, clampedEnd) };
    setDragState({ mode: 'select', anchor: toLinear(year, startMonth), current: toLinear(year, clampedEnd) });
  }, []);

  const handleQuarterEnter = useCallback((year: number, quarter: number) => {
    if (!dragState || dragState.mode !== 'select' || !quarterOrigin.current) return;
    const startMonth = quarter * 3;
    const endMonth = startMonth + 2;
    if (new Date(year, startMonth, 1) > TODAY) return;
    const clampedEnd = new Date(year, endMonth, 1) > TODAY ? TODAY.getMonth() : endMonth;
    const qStart = toLinear(year, startMonth);
    const qEnd = toLinear(year, clampedEnd);
    const orig = quarterOrigin.current;
    if (qStart >= orig.start) {
      setDragState({ mode: 'select', anchor: orig.start, current: qEnd });
    } else {
      setDragState({ mode: 'select', anchor: orig.end, current: qStart });
    }
  }, [dragState]);

  // Handle resize start
  const handleResizeStart = useCallback((side: 'left' | 'right', e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const fromLM = toLinear(rangeFrom.getFullYear(), rangeFrom.getMonth());
    const toLM = toLinear(rangeTo.getFullYear(), rangeTo.getMonth());
    if (side === 'left') {
      setDragState({ mode: 'resize-left', anchor: toLM, current: fromLM });
    } else {
      setDragState({ mode: 'resize-right', anchor: fromLM, current: toLM });
    }
  }, [rangeFrom, rangeTo]);

  // Container pointer move (for resize modes — select uses cell enter)
  const handleContainerPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState || dragState.mode === 'select') return;
    const lm = getMonthFromClientX(e.clientX);
    if (lm === null) return;
    const { year: y, month: m } = fromLinear(lm);
    if (new Date(y, m, 1) > TODAY) return;
    setDragState(prev => prev ? { ...prev, current: lm } : null);
  }, [dragState, getMonthFromClientX]);

  // Pointer up — commit
  const handlePointerUp = useCallback(() => {
    if (!dragState) return;
    const from = effectiveRange.from;
    const to = effectiveRange.to;
    setDragState(null);
    quarterOrigin.current = null;
    commitRange(from, to);
  }, [dragState, effectiveRange, commitRange]);

  const handlePresetClick = useCallback((preset: Preset) => {
    const { from, to } = preset.getRange();
    setDragState(null);
    setDayDrag(null);
    commitRange(from, to);
    // Update panels to show the selected range
    if (viewMode === 'standard') {
      const newLeft = Math.max(MIN_YEAR, Math.min(from.getFullYear(), currentYear - 1));
      const newRight = Math.max(newLeft + 1, Math.min(from.getFullYear() + 1, currentYear));
      setLeftYear(newLeft);
      setRightYear(newRight);
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

  // ── Granular mode handlers ─────────────────────────────────────────────

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

  // Week cell drag (snaps to week boundaries, like quarter drag in standard mode)
  const weekOriginRef = useRef<{ start: Date; end: Date } | null>(null);

  const handleWeekDown = useCallback((week: WeekInfo) => {
    if (week.startDate > TODAY) return;
    const clampedEnd = clampToToday(week.endDate);
    weekOriginRef.current = { start: week.startDate, end: clampedEnd };
    setDayDrag({ anchor: week.startDate, current: clampedEnd });
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
    const from = effectiveRangeGranular.from;
    const to = effectiveRangeGranular.to;
    setDayDrag(null);
    commitRange(from, to);
  }, [dayDrag, effectiveRangeGranular, commitRange]);

  const granularCanGoBack = displayMonth > new Date(MIN_YEAR, 0, 1);
  const granularCanGoForward = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 2, 1) <= TODAY;

  const handleGranularNav = useCallback((dir: -1 | 1) => {
    setDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + dir, 1));
  }, []);

  // ── Highlight calculation ───────────────────────────────────────────────

  const getHighlight = useCallback((year: number) => {
    const { from, to } = effectiveRange;
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    if (to < yearStart || from > yearEnd) return null;

    const startCol = from.getFullYear() < year ? 0
      : from.getFullYear() === year ? from.getMonth() : 12;
    const endCol = to.getFullYear() > year ? 11
      : to.getFullYear() === year ? to.getMonth() : -1;
    if (startCol > 11 || endCol < 0) return null;

    const roundLeft = from.getFullYear() === year;
    const roundRight = to.getFullYear() === year;
    return { startCol, endCol, roundLeft, roundRight };
  }, [effectiveRange]);

  // ── Render year block (standard mode) ─────────────────────────────────

  const renderYearBlock = (year: number, side: 'left' | 'right') => {
    const highlight = getHighlight(year);
    const blockRef = side === 'left' ? leftBlockRef : rightBlockRef;
    const { from, to } = effectiveRange;

    const leftPct = highlight ? `${(highlight.startCol / 12) * 100}%` : '0%';
    const widthPct = highlight ? `${((highlight.endCol - highlight.startCol + 1) / 12) * 100}%` : '0%';
    const rightEdgePct = highlight ? `${((highlight.endCol + 1) / 12) * 100}%` : '0%';

    return (
      <Box key={year} sx={{ flex: 1, minWidth: 0 }}>
        {/* Months + quarters wrapper */}
        <Box ref={blockRef} sx={{ position: 'relative' }}>
          {/* Highlight background */}
          {highlight && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: leftPct,
              width: widthPct,
              height: '100%',
              bgcolor: colors.bgActive,
              borderRadius: `${highlight.roundLeft ? 6 : 0}px ${highlight.roundRight ? 6 : 0}px ${highlight.roundRight ? 6 : 0}px ${highlight.roundLeft ? 6 : 0}px`,
              zIndex: 0,
              pointerEvents: 'none',
            }} />
          )}

          {/* Left drag handle */}
          {highlight?.roundLeft && showHandles && (
            <Box
              onPointerDown={(e) => handleResizeStart('left', e)}
              sx={{
                position: 'absolute',
                left: leftPct,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 6,
                height: 28,
                borderRadius: '3px',
                bgcolor: colors.brand,
                opacity: dragState?.mode === 'resize-left' ? 0.9 : 0.5,
                cursor: 'ew-resize',
                zIndex: 3,
                transition: 'opacity 0.15s',
                '&:hover': { opacity: 0.9 },
              }}
            />
          )}

          {/* Right drag handle */}
          {highlight?.roundRight && showHandles && (
            <Box
              onPointerDown={(e) => handleResizeStart('right', e)}
              sx={{
                position: 'absolute',
                left: rightEdgePct,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 6,
                height: 28,
                borderRadius: '3px',
                bgcolor: colors.brand,
                opacity: dragState?.mode === 'resize-right' ? 0.9 : 0.5,
                cursor: 'ew-resize',
                zIndex: 3,
                transition: 'opacity 0.15s',
                '&:hover': { opacity: 0.9 },
              }}
            />
          )}

          {/* Month row */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, minmax(36px, 1fr))',
            position: 'relative',
            zIndex: 1,
          }}>
            {MONTHS_SHORT.map((name, i) => {
              const isFuture = new Date(year, i, 1) > TODAY;
              const cellStart = new Date(year, i, 1);
              const cellEnd = endOfMonth(cellStart);
              const inRange = !isFuture && cellStart <= effectiveRange.to && cellEnd >= effectiveRange.from;
              return (
                <Box
                  key={i}
                  onPointerDown={() => handleMonthDown(year, i)}
                  onPointerEnter={() => handleMonthEnter(year, i)}
                  sx={{
                    textAlign: 'center',
                    py: 1.25,
                    cursor: isFuture ? 'default' : 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.1s',
                    borderRadius: '4px',
                    '&:hover': !isFuture ? { bgcolor: 'rgba(0,0,0,0.04)' } : {},
                  }}
                >
                  <Typography sx={{
                    fontSize: '0.8rem',
                    fontWeight: inRange ? 600 : 400,
                    color: isFuture ? colors.textDisabled : inRange ? colors.brand : colors.textSecondary,
                    transition: 'color 0.1s',
                  }}>
                    {name}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Quarter row */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            position: 'relative',
            zIndex: 1,
            mt: 0.5,
          }}>
            {[0, 1, 2, 3].map(q => {
              const qStart = new Date(year, q * 3, 1);
              const qEnd = endOfQuarter(qStart);
              const isFuture = qStart > TODAY;
              const clampedQEnd = clampToToday(qEnd);
              const fullyInRange = !isFuture && qStart >= effectiveRange.from && clampedQEnd <= effectiveRange.to;
              return (
                <Box
                  key={q}
                  onPointerDown={() => handleQuarterDown(year, q)}
                  onPointerEnter={() => handleQuarterEnter(year, q)}
                  sx={{
                    textAlign: 'center',
                    py: 1,
                    cursor: isFuture ? 'default' : 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.1s',
                    borderRadius: '4px',
                    '&:hover': !isFuture ? { bgcolor: 'rgba(0,0,0,0.04)' } : {},
                  }}
                >
                  <Typography sx={{
                    fontSize: '0.8rem',
                    fontWeight: fullyInRange ? 600 : 500,
                    color: isFuture ? colors.textDisabled : fullyInRange ? colors.brand : colors.textSecondary,
                    transition: 'color 0.1s',
                  }}>
                    Q{q + 1}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Year navigation row */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pt: 0.75,
        }}>
          {(() => {
            const canGoBack = side === 'left'
              ? year > MIN_YEAR
              : year - 1 > leftYear;
            const canGoForward = side === 'left'
              ? year + 1 < rightYear
              : year < currentYear;
            // Extend range into the new year, keeping the same month pattern
            const extendRangeToYear = (newYear: number, direction: 'back' | 'forward') => {
              const fromMonth = rangeFrom.getMonth();
              const toMonth = rangeTo.getMonth();
              let newFrom: Date, newTo: Date;
              if (direction === 'back') {
                newFrom = new Date(newYear, fromMonth, 1);
                if (newFrom > TODAY) return;
                newTo = rangeTo;
              } else {
                newFrom = rangeFrom;
                newTo = clampToToday(endOfMonth(new Date(newYear, toMonth, 1)));
                if (newTo < newFrom) return;
              }
              commitRange(newFrom, newTo);
            };
            const goBack = () => {
              const newYear = year - 1;
              if (side === 'left') {
                const clamped = Math.max(MIN_YEAR, newYear);
                setLeftYear(clamped);
                extendRangeToYear(clamped, 'back');
              } else {
                const clamped = Math.max(leftYear + 1, newYear);
                setRightYear(clamped);
                extendRangeToYear(clamped, 'forward');
              }
            };
            const goForward = () => {
              const newYear = year + 1;
              if (side === 'left') {
                const clamped = Math.min(rightYear - 1, newYear);
                setLeftYear(clamped);
                extendRangeToYear(clamped, 'back');
              } else {
                const clamped = Math.min(currentYear, newYear);
                setRightYear(clamped);
                extendRangeToYear(clamped, 'forward');
              }
            };
            return (
              <>
                <IconButton
                  size="small"
                  onClick={goBack}
                  disabled={!canGoBack}
                  sx={{ p: 0.25 }}
                >
                  <ChevronLeftIcon sx={{ fontSize: '1rem', color: !canGoBack ? colors.textDisabled : colors.brand }} />
                </IconButton>
                <Typography
                  onClick={() => handleYearClick(year)}
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: new Date(year, 0, 1) > TODAY ? 'default' : 'pointer',
                    color: (from <= new Date(year, 0, 1) && to >= new Date(year, 11, 31))
                      ? colors.brand : colors.textPrimary,
                    mx: 0.75,
                    userSelect: 'none',
                    '&:hover': new Date(year, 0, 1) <= TODAY ? { color: colors.brand } : {},
                    transition: 'color 0.1s',
                  }}
                >
                  {year}
                </Typography>
                <IconButton
                  size="small"
                  onClick={goForward}
                  disabled={!canGoForward}
                  sx={{ p: 0.25 }}
                >
                  <ChevronRightIcon sx={{ fontSize: '1rem', color: !canGoForward ? colors.textDisabled : colors.brand }} />
                </IconButton>
              </>
            );
          })()}
        </Box>
      </Box>
    );
  };

  // ── Render month block (granular mode) ──────────────────────────────
  // Mirrors renderYearBlock: days row → week row → month nav

  const renderMonthBlock = (monthDate: Date, side: 'left' | 'right') => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = endOfMonth(monthDate).getDate();
    const range = effectiveRangeGranular;
    const monthStart = new Date(year, month, 1);
    const monthEnd = endOfMonth(monthStart);
    const weeks = getMonthWeeks(year, month);

    // Highlight calculation (day-level, like getHighlight for months)
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
        {/* Days + weeks wrapper */}
        <Box sx={{ position: 'relative' }}>
          {/* Highlight background */}
          {highlight && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: leftPct,
              width: widthPct,
              height: '100%',
              bgcolor: colors.bgActive,
              borderRadius: `${highlight.roundLeft ? 6 : 0}px ${highlight.roundRight ? 6 : 0}px ${highlight.roundRight ? 6 : 0}px ${highlight.roundLeft ? 6 : 0}px`,
              zIndex: 0,
              pointerEvents: 'none',
            }} />
          )}

          {/* Day row */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${daysInMonth}, 1fr)`,
            position: 'relative',
            zIndex: 1,
          }}>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const isFuture = date > TODAY;
              const d = startOfDay(date);
              const inRange = !isFuture && d >= range.from && d <= range.to;
              return (
                <Box
                  key={day}
                  onPointerDown={() => !isFuture && handleDayDown(date)}
                  onPointerEnter={() => !isFuture && handleDayEnter(date)}
                  sx={{
                    textAlign: 'center',
                    py: 1,
                    cursor: isFuture ? 'default' : 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.1s',
                    borderRadius: '3px',
                    '&:hover': !isFuture ? { bgcolor: 'rgba(0,0,0,0.04)' } : {},
                  }}
                >
                  <Typography sx={{
                    fontSize: '0.65rem',
                    fontWeight: inRange ? 600 : 400,
                    color: isFuture ? colors.textDisabled : inRange ? colors.brand : colors.textSecondary,
                    transition: 'color 0.1s',
                  }}>
                    {day}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Week row */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${daysInMonth}, 1fr)`,
            position: 'relative',
            zIndex: 1,
            mt: 0.5,
          }}>
            {weeks.map((w) => {
              const isFuture = w.startDate > TODAY;
              const clampedEnd = clampToToday(w.endDate);
              const fullyInRange = !isFuture && w.startDate >= range.from && clampedEnd <= range.to;
              return (
                <Box
                  key={w.label}
                  onPointerDown={() => handleWeekDown(w)}
                  onPointerEnter={() => handleWeekEnter(w)}
                  sx={{
                    gridColumn: `${w.startDay} / ${w.endDay + 1}`,
                    textAlign: 'center',
                    py: 0.75,
                    cursor: isFuture ? 'default' : 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.1s',
                    borderRadius: '3px',
                    '&:hover': !isFuture ? { bgcolor: 'rgba(0,0,0,0.04)' } : {},
                  }}
                >
                  <Typography sx={{
                    fontSize: '0.7rem',
                    fontWeight: fullyInRange ? 600 : 500,
                    color: isFuture ? colors.textDisabled : fullyInRange ? colors.brand : colors.textSecondary,
                    transition: 'color 0.1s',
                  }}>
                    {w.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Month navigation row */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pt: 0.75,
        }}>
          {(() => {
            const canGoBack = side === 'left'
              ? granularCanGoBack
              : new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1) > new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);
            const canGoForward = side === 'left'
              ? new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1) < new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1)
              : granularCanGoForward;

            return (
              <>
                {side === 'left' && (
                  <IconButton
                    size="small"
                    onClick={() => handleGranularNav(-1)}
                    disabled={!granularCanGoBack}
                    sx={{ p: 0.25 }}
                  >
                    <ChevronLeftIcon sx={{ fontSize: '1rem', color: !granularCanGoBack ? colors.textDisabled : colors.brand }} />
                  </IconButton>
                )}
                <Typography
                  onClick={() => handleMonthClick(monthDate)}
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: monthStart > TODAY ? 'default' : 'pointer',
                    color: (range.from <= monthStart && range.to >= monthEnd)
                      ? colors.brand : colors.textPrimary,
                    mx: 0.75,
                    userSelect: 'none',
                    '&:hover': monthStart <= TODAY ? { color: colors.brand } : {},
                    transition: 'color 0.1s',
                  }}
                >
                  {MONTHS_SHORT[month]} {year}
                </Typography>
                {side === 'right' && (
                  <IconButton
                    size="small"
                    onClick={() => handleGranularNav(1)}
                    disabled={!granularCanGoForward}
                    sx={{ p: 0.25 }}
                  >
                    <ChevronRightIcon sx={{ fontSize: '1rem', color: !granularCanGoForward ? colors.textDisabled : colors.brand }} />
                  </IconButton>
                )}
              </>
            );
          })()}
        </Box>
      </Box>
    );
  };

  // ── Segmented control ─────────────────────────────────────────────────

  const segmentSx = (active: boolean) => ({
    px: 1.5, py: 0.5, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px',
    cursor: 'pointer', transition: 'all 0.15s',
    bgcolor: active ? 'white' : 'transparent',
    color: active ? colors.brand : 'text.secondary',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
    '&:hover': { color: active ? colors.brand : 'text.primary' },
  });

  const segmentedControl = (
    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: colors.bgSecondaryHover, borderRadius: '8px', p: '3px', gap: '2px', flexShrink: 0, border: `1px solid ${colors.borderTertiary}` }}>
      <Box sx={segmentSx(viewMode === 'standard')} onClick={() => setViewMode('standard')}>
        Monthly
      </Box>
      <Box sx={segmentSx(viewMode === 'granular')} onClick={() => setViewMode('granular')}>
        Daily
      </Box>
    </Box>
  );

  // ── Content ───────────────────────────────────────────────────────────

  const currentPresets = viewMode === 'standard' ? PRESETS : GRANULAR_PRESETS;

  const content = (
    <>
      {/* Preset pills + segmented control */}
      {!hidePresets && (
        <Box sx={{ display: 'flex', gap: 0.75, px: inline ? 0 : 3, pt: inline ? 0 : 2, pb: 0, alignItems: 'center' }}>
          {currentPresets.map(preset => {
            const { from: pf, to: pt } = preset.getRange();
            const isActive = rangeFrom.getTime() === pf.getTime() && rangeTo.getTime() === pt.getTime();
            return (
              <Chip
                key={preset.label}
                label={preset.label}
                size="small"
                onClick={() => handlePresetClick(preset)}
                sx={{
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  bgcolor: isActive ? colors.bgActive : 'transparent',
                  color: isActive ? colors.brand : colors.textSecondary,
                  border: '1px solid',
                  borderColor: isActive ? colors.brand : colors.borderSecondary,
                  '&:hover': { bgcolor: isActive ? colors.bgActive : colors.bgPrimaryHover },
                }}
              />
            );
          })}
          <Box sx={{ flex: 1 }} />
          {segmentedControl}
        </Box>
      )}

      {/* Calendar view */}
      {viewMode === 'standard' ? (
        <Box
          onPointerMove={handleContainerPointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => { if (dragState) handlePointerUp(); }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          sx={{
            display: 'flex',
            px: inline ? 0 : 3,
            py: inline ? 1.5 : 2.5,
            gap: 0,
            userSelect: 'none',
          }}
        >
          {renderYearBlock(leftYear, 'left')}
          <Box sx={{
            width: '1px',
            bgcolor: colors.borderTertiary,
            mx: '4px',
            my: 0.5,
            flexShrink: 0,
          }} />
          {renderYearBlock(rightYear, 'right')}
        </Box>
      ) : (
        <Box
          onPointerUp={handleDayPointerUp}
          onPointerLeave={() => { if (dayDrag) handleDayPointerUp(); }}
          sx={{
            display: 'flex',
            px: inline ? 0 : 3,
            py: inline ? 1.5 : 2.5,
            gap: 2,
            userSelect: 'none',
          }}
        >
          {renderMonthBlock(displayMonth, 'left')}
          <Box sx={{
            width: '1px',
            bgcolor: colors.borderTertiary,
            flexShrink: 0,
          }} />
          {renderMonthBlock(
            new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1),
            'right',
          )}
        </Box>
      )}
    </>
  );

  if (inline) {
    return <Box>{content}</Box>;
  }

  return (
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{
        sx: {
          mt: 0.5,
          width: 920,
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
          overflow: 'hidden',
        },
      }}
    >
      {content}
    </Popover>
  );
}
