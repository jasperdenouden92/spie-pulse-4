'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import { colors } from '@/colors';

// ── helpers ──────────────────────────────────────────────────────────────────

type ViewSize = 'month' | 'quarter' | 'year';

const MONTHS_NL = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'] as const;
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

/** Timeline origin */
const TIMELINE_ORIGIN = new Date(2023, 0, 1);

/** Visible width of the scroll container (dialog 560 - no horizontal padding) */
const VISIBLE_WIDTH_PX = 560;

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
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

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

function endOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 11, 31);
}

function startOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), q * 3, 1);
}

function endOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), q * 3 + 3, 0);
}

function getISOWeekNumber(d: Date): number {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function clampDate(d: Date, min: Date, max: Date): Date {
  if (d < min) return min;
  if (d > max) return max;
  return d;
}

function formatDateWithYear(d: Date, forceYear: boolean): string {
  const base = `${MONTHS_FULL[d.getMonth()]} ${d.getDate()}`;
  return forceYear ? `${base}, ${d.getFullYear()}` : base;
}

function formatDateRange(from: Date, to: Date): string {
  const thisYear = TODAY.getFullYear();
  const toIsToday = diffDays(to, TODAY) === 0;

  if (from.getFullYear() === to.getFullYear() && from.getMonth() === to.getMonth() && from.getDate() === to.getDate()) {
    if (toIsToday) return 'Today';
    return formatDateWithYear(from, from.getFullYear() !== thisYear);
  }

  const showFromYear = from.getFullYear() !== thisYear || from.getFullYear() !== to.getFullYear();
  const showToYear = to.getFullYear() !== thisYear || from.getFullYear() !== to.getFullYear();
  const fromStr = formatDateWithYear(from, showFromYear);
  const toStr = toIsToday ? 'Today' : formatDateWithYear(to, showToYear);
  return `${fromStr} – ${toStr}`;
}

function durationLabel(from: Date, to: Date): string {
  const days = diffDays(from, to) + 1;
  if (days <= 1) return '1 Day';
  return `${days} Days`;
}

// ── named-range resolution ──────────────────────────────────────────────────

export function parseDateRange(value: string): { from: Date; to: Date } {
  if (value.includes('|')) {
    const [a, b] = value.split('|');
    return { from: startOfDay(new Date(a)), to: startOfDay(new Date(b)) };
  }
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  switch (value) {
    case 'Today': return { from: now, to: now };
    case 'This Week': return { from: startOfWeek(now), to: endOfWeek(now) };
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
      return { from: startOfMonth(now), to: endOfMonth(now) };
    }
  }
}

export function dateRangeToString(from: Date, to: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return `${fmt(from)}|${fmt(to)}`;
}

export function getDateRangeDisplayLabel(value: string): string {
  // Named presets → relative label
  const RELATIVE_LABELS: Record<string, string> = {
    'Today': 'today',
    'This Week': 'this week',
    'This Month': 'this month',
    'This Quarter': 'this quarter',
    'This Year': 'this year',
    'All Time': 'all time',
  };
  if (RELATIVE_LABELS[value]) return RELATIVE_LABELS[value];

  // Custom date ranges → "jan 1 - mar 31"
  const { from, to } = parseDateRange(value);
  const fmt = (d: Date) => `${MONTHS_NL[d.getMonth()]} ${d.getDate()}`;
  if (from.getFullYear() === to.getFullYear() && from.getMonth() === to.getMonth() && from.getDate() === to.getDate()) {
    return fmt(from);
  }
  return `${fmt(from)} - ${fmt(to)}`;
}

// ── timeline data ───────────────────────────────────────────────────────────

interface MonthMark {
  date: Date;      // 1st of the month
  label: string;   // e.g. "January"
  yearLabel: string;
  offsetPx: number;
  widthPx: number;
}

function buildTimelineMonths(timelineStart: Date, timelineEnd: Date, pxPerDay: number): MonthMark[] {
  const result: MonthMark[] = [];
  let cursor = new Date(timelineStart.getFullYear(), timelineStart.getMonth(), 1);
  while (cursor <= timelineEnd) {
    const monthStart = cursor < timelineStart ? timelineStart : cursor;
    const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    const monthEnd = nextMonth > timelineEnd ? timelineEnd : addDays(nextMonth, -1);
    const offsetPx = diffDays(timelineStart, monthStart) * pxPerDay;
    const widthPx = (diffDays(monthStart, monthEnd) + 1) * pxPerDay;
    result.push({
      date: new Date(cursor),
      label: MONTHS_FULL[cursor.getMonth()],
      yearLabel: String(cursor.getFullYear()),
      offsetPx,
      widthPx,
    });
    cursor = nextMonth;
  }
  return result;
}

// ── clickable period labels below the timeline ──────────────────────────────

interface PeriodLabel {
  label: string;
  from: Date;
  to: Date;
  offsetPx: number;
  widthPx: number;
}

function getPeriodLabels(view: ViewSize, timelineStart: Date, timelineEnd: Date, pxPerDay: number): PeriodLabel[] {
  const allLabels: PeriodLabel[] = [];
  switch (view) {
    case 'month': {
      let cursor = new Date(timelineStart.getFullYear(), timelineStart.getMonth(), 1);
      while (cursor <= timelineEnd) {
        const mStart = cursor < timelineStart ? timelineStart : new Date(cursor);
        const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
        const mEnd = nextMonth > timelineEnd ? timelineEnd : addDays(nextMonth, -1);
        allLabels.push({
          label: MONTHS_FULL[cursor.getMonth()],
          from: new Date(cursor.getFullYear(), cursor.getMonth(), 1),
          to: endOfMonth(cursor),
          offsetPx: diffDays(timelineStart, mStart) * pxPerDay,
          widthPx: (diffDays(mStart, mEnd) + 1) * pxPerDay,
        });
        cursor = nextMonth;
      }
      break;
    }
    case 'quarter': {
      let cursor = startOfQuarter(timelineStart);
      while (cursor <= timelineEnd) {
        const qStart = cursor < timelineStart ? timelineStart : new Date(cursor);
        const qEnd = endOfQuarter(cursor) > timelineEnd ? timelineEnd : endOfQuarter(cursor);
        const qNum = Math.floor(cursor.getMonth() / 3) + 1;
        allLabels.push({
          label: `Q${qNum}`,
          from: new Date(cursor),
          to: endOfQuarter(cursor),
          offsetPx: diffDays(timelineStart, qStart) * pxPerDay,
          widthPx: (diffDays(qStart, qEnd) + 1) * pxPerDay,
        });
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 3, 1);
      }
      break;
    }
    case 'year': {
      let year = timelineStart.getFullYear();
      while (year <= timelineEnd.getFullYear()) {
        const yStart = new Date(year, 0, 1) < timelineStart ? timelineStart : new Date(year, 0, 1);
        const yEnd = new Date(year, 11, 31) > timelineEnd ? timelineEnd : new Date(year, 11, 31);
        allLabels.push({
          label: String(year),
          from: new Date(year, 0, 1),
          to: new Date(year, 11, 31),
          offsetPx: diffDays(timelineStart, yStart) * pxPerDay,
          widthPx: (diffDays(yStart, yEnd) + 1) * pxPerDay,
        });
        year++;
      }
      break;
    }
  }
  return allLabels;
}

// ── segmented control ───────────────────────────────────────────────────────

function SegmentedControl({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <Box sx={{
      display: 'inline-flex',
      bgcolor: '#f0f0f0',
      borderRadius: '8px',
      p: '3px',
      gap: '2px',
    }}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <Box
            key={opt.value}
            onClick={() => onChange(opt.value)}
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              userSelect: 'none',
              bgcolor: active ? '#fff' : 'transparent',
              color: active ? colors.textPrimary : colors.textSecondary,
              boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
              '&:hover': { color: colors.textPrimary },
            }}
          >
            {opt.label}
          </Box>
        );
      })}
    </Box>
  );
}

// ── main component ──────────────────────────────────────────────────────────

interface DateRangeSelectorProps {
  value: string;                          // named preset or "YYYY-MM-DD|YYYY-MM-DD"
  onChange: (value: string) => void;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export default function DateRangeSelector({ value, onChange, anchorEl, onClose }: DateRangeSelectorProps) {
  const open = Boolean(anchorEl);
  const [viewSize, setViewSize] = useState<ViewSize>('month');

  // When switching views while "now" is selected, select the new view's "now"
  const handleViewChange = (v: ViewSize) => {
    const isNow = diffDays(rangeTo, TODAY) === 0;
    setViewSize(v);
    if (isNow) {
      let newFrom: Date;
      switch (v) {
        case 'month': newFrom = startOfMonth(TODAY); break;
        case 'quarter': newFrom = startOfQuarter(TODAY); break;
        case 'year': newFrom = startOfYear(TODAY); break;
      }
      setRangeFrom(newFrom);
      setRangeTo(TODAY);
      onChange(dateRangeToString(newFrom, TODAY));
    }
  };

  // Parse current value
  const { from: initialFrom, to: initialTo } = useMemo(() => parseDateRange(value), [value]);
  const [rangeFrom, setRangeFrom] = useState(initialFrom);
  const [rangeTo, setRangeTo] = useState(initialTo);

  // Sync when value changes externally
  useEffect(() => {
    const { from, to } = parseDateRange(value);
    setRangeFrom(from);
    setRangeTo(to);
  }, [value]);

  // Timeline bounds
  const timelineStart = TIMELINE_ORIGIN;
  const timelineEnd = TODAY;
  const totalDays = diffDays(timelineStart, timelineEnd) + 1;

  // Zoom: compute px per day so the visible area fits the target span
  const pxPerDay = useMemo(() => {
    let visibleDays: number;
    switch (viewSize) {
      case 'month': visibleDays = 3 * 30; break;
      case 'quarter': visibleDays = 4 * 91; break;
      case 'year': visibleDays = 4 * 365; break;
    }
    return VISIBLE_WIDTH_PX / visibleDays;
  }, [viewSize]);

  const totalWidthPx = totalDays * pxPerDay;

  // Month markers
  const monthMarks = useMemo(() => buildTimelineMonths(timelineStart, timelineEnd, pxPerDay), [timelineStart, timelineEnd, pxPerDay]);

  // Period labels below timeline
  const periodLabels = useMemo(() => getPeriodLabels(viewSize, timelineStart, timelineEnd, pxPerDay), [viewSize, timelineStart, timelineEnd, pxPerDay]);

  // Timeline scroll ref
  const scrollRef = useRef<HTMLDivElement>(null);

  // Selection position in px
  const selLeftPx = diffDays(timelineStart, rangeFrom) * pxPerDay;
  const selWidthPx = (diffDays(rangeFrom, rangeTo) + 1) * pxPerDay;

  // Scroll to show the selection centered (or left-aligned if near the end)
  useEffect(() => {
    if (!open || !scrollRef.current) return;
    const centerPx = selLeftPx + selWidthPx / 2;
    const maxScroll = totalWidthPx + 32 - VISIBLE_WIDTH_PX;
    const idealScroll = Math.min(centerPx - VISIBLE_WIDTH_PX / 2, maxScroll);
    const targetScroll = Math.max(0, idealScroll);
    setScrollPos(targetScroll);
    const timer = setTimeout(() => {
      if (!scrollRef.current) return;
      scrollRef.current.scrollLeft = targetScroll;
    }, 0);
    return () => clearTimeout(timer);
  }, [open, pxPerDay, totalWidthPx, selLeftPx, selWidthPx]);

  // Track scroll position for selection visibility arrow
  // Initialize to far right so first render is right-aligned
  const [scrollPos, setScrollPos] = useState(() => Math.max(0, totalWidthPx + 32 - VISIBLE_WIDTH_PX));
  const [containerWidth, setContainerWidth] = useState(VISIBLE_WIDTH_PX);
  const rafRef = useRef(0);

  const selectionDirection = useMemo(() => {
    const selRight = selLeftPx + selWidthPx;
    if (selRight < scrollPos) return 'left' as const;
    if (selLeftPx > scrollPos + containerWidth) return 'right' as const;
    return null;
  }, [selLeftPx, selWidthPx, scrollPos, containerWidth]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setScrollPos(el.scrollLeft);
        setContainerWidth(el.clientWidth);
      });
    };
    el.addEventListener('scroll', handler, { passive: true });
    const timer = setTimeout(handler, 100);
    return () => { el.removeEventListener('scroll', handler); clearTimeout(timer); cancelAnimationFrame(rafRef.current); };
  }, [open, pxPerDay]);

  const scrollToSelection = () => {
    if (!scrollRef.current) return;
    const centerPx = selLeftPx + selWidthPx / 2;
    const containerW = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({ left: centerPx - containerW / 2, behavior: 'smooth' });
  };

  // ── drag state ──────────────────────────────────────────────────────────

  const dragState = useRef<{
    type: 'move' | 'resize-left' | 'resize-right';
    startX: number;
    origFrom: Date;
    origTo: Date;
  } | null>(null);

  const commit = useCallback((from: Date, to: Date) => {
    const clampedFrom = clampDate(from, timelineStart, timelineEnd);
    const clampedTo = clampDate(to, timelineStart, timelineEnd);
    if (clampedFrom > clampedTo) return;
    setRangeFrom(clampedFrom);
    setRangeTo(clampedTo);
  }, [timelineStart, timelineEnd]);

  const handlePointerDown = useCallback((type: 'move' | 'resize-left' | 'resize-right', e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = {
      type,
      startX: e.clientX,
      origFrom: rangeFrom,
      origTo: rangeTo,
    };
  }, [rangeFrom, rangeTo]);

  // Snap size in days based on view
  const snapDays = useMemo(() => {
    switch (viewSize) {
      case 'month': return 1;
      case 'quarter':
      case 'year': return 30;
    }
  }, [viewSize]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const rawDelta = Math.round(dx / pxPerDay);
    const daysDelta = Math.round(rawDelta / snapDays) * snapDays;
    const { type, origFrom, origTo } = dragState.current;

    if (type === 'move') {
      const newFrom = addDays(origFrom, daysDelta);
      const newTo = addDays(origTo, daysDelta);
      if (newFrom < timelineStart) {
        const shift = diffDays(newFrom, timelineStart);
        commit(addDays(newFrom, shift), addDays(newTo, shift));
      } else if (newTo > timelineEnd) {
        const shift = diffDays(timelineEnd, newTo);
        commit(addDays(newFrom, shift), addDays(newTo, shift));
      } else {
        commit(newFrom, newTo);
      }
    } else if (type === 'resize-left') {
      const newFrom = addDays(origFrom, daysDelta);
      commit(newFrom < origTo ? newFrom : origTo, newFrom < origTo ? origTo : newFrom);
    } else if (type === 'resize-right') {
      const newTo = addDays(origTo, daysDelta);
      commit(newTo > origFrom ? origFrom : newTo, newTo > origFrom ? newTo : origFrom);
    }
  }, [commit, timelineStart, timelineEnd, snapDays, pxPerDay]);

  const handlePointerUp = useCallback(() => {
    if (!dragState.current) return;
    dragState.current = null;
    onChange(dateRangeToString(rangeFrom, rangeTo));
  }, [rangeFrom, rangeTo, onChange]);

  const handlePeriodClick = (pl: PeriodLabel) => {
    const from = clampDate(pl.from, timelineStart, timelineEnd);
    const to = clampDate(pl.to, timelineStart, timelineEnd);
    setRangeFrom(from);
    setRangeTo(to);
    onChange(dateRangeToString(from, to));
  };

  // Tick marks — minor (snap steps) and major (preset boundaries)
  const ticks = useMemo(() => {
    // Build a set of major tick day-offsets based on actual calendar boundaries
    const majorOffsets = new Set<number>();
    switch (viewSize) {
      case 'month': {
        // 1st of each month
        let cursor = new Date(timelineStart.getFullYear(), timelineStart.getMonth() + 1, 1);
        while (cursor <= timelineEnd) {
          majorOffsets.add(diffDays(timelineStart, cursor));
          cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
        }
        break;
      }
      case 'quarter': {
        // 1st of each quarter
        let cursor = startOfQuarter(timelineStart);
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 3, 1);
        while (cursor <= timelineEnd) {
          majorOffsets.add(diffDays(timelineStart, cursor));
          cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 3, 1);
        }
        break;
      }
      case 'year': {
        // Jan 1st of each year
        let year = timelineStart.getFullYear() + 1;
        while (year <= timelineEnd.getFullYear()) {
          majorOffsets.add(diffDays(timelineStart, new Date(year, 0, 1)));
          year++;
        }
        break;
      }
    }

    // For quarter/year views, use actual month boundaries for ticks
    // For other views, use fixed snap step
    const result: { offsetPx: number; major: boolean }[] = [];
    if (viewSize === 'quarter' || viewSize === 'year') {
      // Generate ticks at 1st of each month
      let cursor = new Date(timelineStart.getFullYear(), timelineStart.getMonth(), 1);
      while (cursor <= timelineEnd) {
        const offset = diffDays(timelineStart, cursor);
        result.push({ offsetPx: offset * pxPerDay, major: majorOffsets.has(offset) });
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      }
    } else {
      for (let d = 0; d <= totalDays; d += snapDays) {
        let isMajor = false;
        for (let s = 0; s < snapDays; s++) {
          if (majorOffsets.has(d + s)) { isMajor = true; break; }
        }
        result.push({ offsetPx: d * pxPerDay, major: isMajor });
      }
    }
    return result;
  }, [viewSize, snapDays, totalDays, pxPerDay, timelineStart, timelineEnd]);

  const HANDLE_WIDTH = 10;


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
          width: 560,
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
          overflow: 'hidden',
        },
      }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <Box sx={{
        px: 2.5,
        py: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: colors.textPrimary }}>
          {formatDateRange(rangeFrom, rangeTo)}
        </Typography>
        <SegmentedControl
          value={viewSize}
          onChange={(v) => handleViewChange(v as ViewSize)}
          options={[
            { label: 'Month', value: 'month' },
            { label: 'Quarter', value: 'quarter' },
            { label: 'Year', value: 'year' },
          ]}
        />
      </Box>

      {/* ── Timeline + period labels ─────────────────────────── */}
      <Box sx={{ pb: 2, position: 'relative' }}>
        {/* Arrow indicator: selection is to the left */}
        {selectionDirection === 'left' && (
          <Box
            onClick={scrollToSelection}
            sx={{
              position: 'absolute',
              left: 8,
              top: 8,
              zIndex: 10,
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: '#fff',
              boxShadow: '0 1px 6px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: '#f5f5f5' },
              transition: 'background-color 0.15s',
            }}
          >
            <Typography sx={{ fontSize: '0.85rem', color: colors.textSecondary, lineHeight: 1 }}>←</Typography>
          </Box>
        )}
        {/* Arrow indicator: selection is to the right */}
        {selectionDirection === 'right' && (
          <Box
            onClick={scrollToSelection}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 10,
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: '#fff',
              boxShadow: '0 1px 6px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: '#f5f5f5' },
              transition: 'background-color 0.15s',
            }}
          >
            <Typography sx={{ fontSize: '0.85rem', color: colors.textSecondary, lineHeight: 1 }}>→</Typography>
          </Box>
        )}
        <Box
          ref={scrollRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          sx={{
            overflowX: 'auto',
            overflowY: 'hidden',
            position: 'relative',
            '&::-webkit-scrollbar': { height: 0, display: 'none' },
          }}
        >
          <Box sx={{ width: totalWidthPx + 32, px: '16px' }}>
            {/* Timeline track */}
            <Box sx={{
              position: 'relative',
              height: 48,
              bgcolor: '#f5f5f5',
              borderRadius: '10px',
              overflow: 'hidden',
            }}>
              {/* Tick marks */}
              {ticks.map((t, i) => (
                <Box
                  key={i}
                  sx={{
                    position: 'absolute',
                    left: t.offsetPx,
                    top: 8,
                    bottom: 8,
                    width: '1px',
                    bgcolor: t.major ? '#ddd' : '#eee',
                  }}
                />
              ))}

              {/* Selection indicator */}
              <Box
                sx={{
                  position: 'absolute',
                  left: selLeftPx,
                  width: selWidthPx,
                  top: 2,
                  bottom: 2,
                  borderRadius: '8px',
                  bgcolor: '#fff',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  minWidth: 40,
                }}
              >
                {/* Left drag handle */}
                <Box
                  onPointerDown={(e) => handlePointerDown('resize-left', e)}
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: HANDLE_WIDTH,
                    cursor: 'ew-resize',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px 0 0 8px',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                    '&::after': {
                      content: '""',
                      display: 'block',
                      width: '2px',
                      height: '16px',
                      borderRadius: '1px',
                      bgcolor: colors.borderPrimary,
                    },
                  }}
                />

                {/* Center drag area */}
                <Box
                  onPointerDown={(e) => handlePointerDown('move', e)}
                  sx={{
                    position: 'absolute',
                    left: HANDLE_WIDTH,
                    right: HANDLE_WIDTH,
                    top: 0,
                    bottom: 0,
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:active': { cursor: 'grabbing' },
                  }}
                >
                  <Typography sx={{
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    color: colors.textSecondary,
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}>
                    {durationLabel(rangeFrom, rangeTo)}
                  </Typography>
                </Box>

                {/* Right drag handle */}
                <Box
                  onPointerDown={(e) => handlePointerDown('resize-right', e)}
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: HANDLE_WIDTH,
                    cursor: 'ew-resize',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '0 8px 8px 0',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                    '&::after': {
                      content: '""',
                      display: 'block',
                      width: '2px',
                      height: '16px',
                      borderRadius: '1px',
                      bgcolor: colors.borderPrimary,
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Period labels */}
            <Box sx={{ position: 'relative', height: 28, mt: 0.5 }}>
              {periodLabels.map((pl, i) => {
                const isComplete = pl.to <= TODAY;
                const isCurrent = !isComplete && pl.from <= TODAY;
                // For "Now" presets, select from period start to today
                const effectiveTo = isCurrent ? TODAY : pl.to;
                const isSelected = pl.from >= rangeFrom && effectiveTo <= rangeTo;
                // Hide future periods that haven't started yet
                const isFuture = pl.from > TODAY;
                return (
                  <Box
                    key={i}
                    onClick={!isFuture ? () => handlePeriodClick({ ...pl, to: effectiveTo }) : undefined}
                    sx={{
                      position: 'absolute',
                      left: pl.offsetPx,
                      width: pl.widthPx,
                      textAlign: 'center',
                      cursor: isFuture ? 'default' : 'pointer',
                      userSelect: 'none',
                      py: 0.5,
                      borderRadius: '6px',
                      bgcolor: 'transparent',
                      visibility: isFuture ? 'hidden' : 'visible',
                      '&:hover': { bgcolor: isSelected ? 'transparent' : '#f5f5f5' },
                      transition: 'all 0.15s',
                    }}
                  >
                    <Typography sx={{
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? colors.textPrimary : colors.textTertiary,
                      '&:hover': { color: colors.textPrimary },
                      transition: 'color 0.15s',
                    }}>
                      {isCurrent ? 'Now' : pl.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>

    </Popover>
  );
}
