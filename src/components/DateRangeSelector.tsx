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

type Preset = { label: string; getRange: () => { from: Date; to: Date } };

const PRESETS: Preset[] = [
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

export function getDateRangeDisplayLabel(value: string): string {
  const { from, to } = parseDateRange(value);

  // Check if the range matches a preset
  for (const preset of PRESETS) {
    const { from: pf, to: pt } = preset.getRange();
    if (from.getTime() === pf.getTime() && to.getTime() === pt.getTime()) {
      return preset.label.toLowerCase();
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

  // Month-aligned
  if (fy === ty && fm === tm) return `${MONTHS_FULL[fm]} ${fy}`;
  if (fy === ty) return `${MONTHS_SHORT[fm]} - ${MONTHS_SHORT[tm]} ${fy}`;
  return `${MONTHS_SHORT[fm]} ${fy} - ${MONTHS_SHORT[tm]} ${ty}`;
}

// ── Drag state type ──────────────────────────────────────────────────────────

type DragState = {
  mode: 'select' | 'resize-left' | 'resize-right';
  anchor: number;  // linear month index (fixed end)
  current: number; // linear month index (moving end)
};

// ── Component ────────────────────────────────────────────────────────────────

interface DateRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const toLinear = (year: number, month: number) => year * 12 + month;
const fromLinear = (lm: number) => ({ year: Math.floor(lm / 12), month: lm % 12 });

export default function DateRangeSelector({ value, onChange, anchorEl, onClose }: DateRangeSelectorProps) {
  const open = Boolean(anchorEl);
  const currentYear = TODAY.getFullYear();

  const { from: initialFrom, to: initialTo } = useMemo(() => parseDateRange(value), [value]);
  const [rangeFrom, setRangeFrom] = useState(initialFrom);
  const [rangeTo, setRangeTo] = useState(initialTo);

  useEffect(() => {
    const { from, to } = parseDateRange(value);
    setRangeFrom(from);
    setRangeTo(to);
  }, [value]);

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

  // Effective range (preview during drag, committed otherwise)
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

  const commitRange = useCallback((from: Date, to: Date) => {
    setRangeFrom(from);
    setRangeTo(to);
    onChange(dateRangeToString(from, to));
  }, [onChange]);

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
  // We store the original quarter's start+end so we can pick the right anchor edge on enter
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
    // Dragging forward: anchor at origin start, current at entered quarter's end
    // Dragging backward: anchor at origin end, current at entered quarter's start
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
    commitRange(from, to);
    // Update year panels to show the selected range
    const newLeft = Math.max(MIN_YEAR, Math.min(from.getFullYear(), currentYear - 1));
    const newRight = Math.max(newLeft + 1, Math.min(from.getFullYear() + 1, currentYear));
    setLeftYear(newLeft);
    setRightYear(newRight);
  }, [commitRange, currentYear]);

  const handleYearClick = useCallback((year: number) => {
    const from = new Date(year, 0, 1);
    if (from > TODAY) return;
    setDragState(null);
    commitRange(from, clampToToday(endOfYear(from)));
  }, [commitRange]);

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

  // ── Render year block ───────────────────────────────────────────────────

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
            gridTemplateColumns: 'repeat(12, 1fr)',
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
                // Extend start backwards: same from-month in new year, keep existing end
                newFrom = new Date(newYear, fromMonth, 1);
                if (newFrom > TODAY) return;
                newTo = rangeTo;
              } else {
                // Extend end forwards: keep existing start, same to-month in new year
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
      {/* Preset pills */}
      <Box sx={{ display: 'flex', gap: 0.75, px: 3, pt: 2, pb: 0 }}>
        {PRESETS.map(preset => (
          <Chip
            key={preset.label}
            label={preset.label}
            size="small"
            onClick={() => handlePresetClick(preset)}
            sx={{
              fontWeight: 500,
              fontSize: '0.8rem',
              bgcolor: 'transparent',
              color: colors.textSecondary,
              border: `1px solid ${colors.borderSecondary}`,
              cursor: 'pointer',
              '&:hover': { bgcolor: colors.bgPrimaryHover },
            }}
          />
        ))}
      </Box>

      <Box
        onPointerMove={handleContainerPointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => { if (dragState) handlePointerUp(); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          display: 'flex',
          px: 3,
          py: 2.5,
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
    </Popover>
  );
}
