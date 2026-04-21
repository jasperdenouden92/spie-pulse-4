'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage } from '@/i18n';

interface MonthRangeSliderProps {
  fromYear: number;
  fromMonth: number;
  toYear: number;
  toMonth: number;
  onChange: (fromYear: number, fromMonth: number, toYear: number, toMonth: number) => void;
  minYear: number;
  minMonth: number;
  maxYear: number;
  maxMonth: number;
}

interface MonthPoint {
  year: number;
  month: number; // 0-11
}

export default function MonthRangeSlider({
  fromYear, fromMonth, toYear, toMonth,
  onChange,
  minYear, minMonth, maxYear, maxMonth,
}: MonthRangeSliderProps) {
  const { themeColors: c } = useThemeMode();
  const { locale } = useLanguage();

  const months = useMemo<MonthPoint[]>(() => {
    const out: MonthPoint[] = [];
    let y = minYear;
    let m = minMonth;
    while (y < maxYear || (y === maxYear && m <= maxMonth)) {
      out.push({ year: y, month: m });
      m += 1;
      if (m > 11) { m = 0; y += 1; }
    }
    return out;
  }, [minYear, minMonth, maxYear, maxMonth]);

  const findIdx = useCallback((y: number, m: number): number => {
    return months.findIndex(p => p.year === y && p.month === m);
  }, [months]);

  const n = months.length;
  const fromIdx = Math.max(0, findIdx(fromYear, fromMonth));
  const toIdx = Math.max(fromIdx, findIdx(toYear, toMonth));

  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ side: 'left' | 'right'; startIdx: number; endIdx: number } | null>(null);
  const dragRef = useRef(drag);
  useEffect(() => { dragRef.current = drag; }, [drag]);

  const idxFromClientX = useCallback((clientX: number): number | null => {
    const el = trackRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(ratio * (n - 1));
  }, [n]);

  useEffect(() => {
    if (!drag) return;
    const handleMove = (e: PointerEvent) => {
      const current = dragRef.current;
      if (!current) return;
      const idx = idxFromClientX(e.clientX);
      if (idx === null) return;
      if (current.side === 'left') {
        setDrag({ ...current, startIdx: Math.min(idx, current.endIdx) });
      } else {
        setDrag({ ...current, endIdx: Math.max(idx, current.startIdx) });
      }
    };
    const handleUp = () => {
      const current = dragRef.current;
      if (!current) return;
      const a = months[current.startIdx];
      const b = months[current.endIdx];
      onChange(a.year, a.month, b.year, b.month);
      setDrag(null);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [drag, idxFromClientX, onChange, months]);

  const displayStart = drag ? drag.startIdx : fromIdx;
  const displayEnd = drag ? drag.endIdx : toIdx;

  const handleHandlePointerDown = (side: 'left' | 'right', e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag({ side, startIdx: displayStart, endIdx: displayEnd });
  };

  const shortMonthFmt = useMemo(
    () => new Intl.DateTimeFormat(locale === 'nl' ? 'nl-NL' : 'en-US', { month: 'short' }),
    [locale],
  );

  return (
    <Box ref={trackRef} sx={{ position: 'relative', height: 54, userSelect: 'none', width: '100%' }}>
      {/* Base line */}
      <Box sx={{
        position: 'absolute', left: 0, right: 0, top: 32,
        height: 2, bgcolor: c.borderSecondary, borderRadius: 1,
      }} />

      {/* Range bar */}
      {n > 1 && (
        <Box sx={{
          position: 'absolute',
          left: `${(displayStart / (n - 1)) * 100}%`,
          width: `${((displayEnd - displayStart) / (n - 1)) * 100}%`,
          top: 29, height: 8,
          bgcolor: c.brand, borderRadius: 4, opacity: 0.25,
          pointerEvents: 'none',
          transition: drag ? 'none' : 'left 0.2s, width 0.2s',
        }} />
      )}

      {/* Drag handles */}
      {n > 1 && (
        <>
          <Box
            onPointerDown={(e) => handleHandlePointerDown('left', e)}
            sx={{
              position: 'absolute',
              left: `${(displayStart / (n - 1)) * 100}%`,
              top: 33, transform: 'translate(-50%, -50%)',
              width: 14, height: 14, borderRadius: '50%', bgcolor: c.brand,
              border: `2px solid ${c.bgPrimary}`, boxShadow: `0 1px 4px rgba(0,0,0,0.2)`,
              cursor: 'ew-resize', zIndex: 5,
              transition: drag ? 'none' : 'left 0.2s',
              '&:hover': { transform: 'translate(-50%, -50%) scale(1.25)' },
              '&::before': {
                content: '""', position: 'absolute',
                top: -8, left: -8, right: -8, bottom: -8,
              },
            }}
          />
          <Box
            onPointerDown={(e) => handleHandlePointerDown('right', e)}
            sx={{
              position: 'absolute',
              left: `${(displayEnd / (n - 1)) * 100}%`,
              top: 33, transform: 'translate(-50%, -50%)',
              width: 14, height: 14, borderRadius: '50%', bgcolor: c.brand,
              border: `2px solid ${c.bgPrimary}`, boxShadow: `0 1px 4px rgba(0,0,0,0.2)`,
              cursor: 'ew-resize', zIndex: 5,
              transition: drag ? 'none' : 'left 0.2s',
              '&:hover': { transform: 'translate(-50%, -50%) scale(1.25)' },
              '&::before': {
                content: '""', position: 'absolute',
                top: -8, left: -8, right: -8, bottom: -8,
              },
            }}
          />
        </>
      )}

      {/* Ticks — dot for every month, label only for January (year marker) and quarter starts (Apr/Jul/Oct) when month span is short enough */}
      {months.map((p, i) => {
        const inRange = i >= displayStart && i <= displayEnd;
        const pct = n > 1 ? `${(i / (n - 1)) * 100}%` : '50%';
        const isYearStart = p.month === 0;
        const isQuarter = p.month % 3 === 0;
        // If there are more than 18 months visible, only label January; otherwise label every quarter.
        const showLabel = n > 18 ? isYearStart : isQuarter;
        const labelText = isYearStart
          ? String(p.year)
          : `${shortMonthFmt.format(new Date(p.year, p.month, 1))}`;
        return (
          <Box
            key={`${p.year}-${p.month}`}
            onClick={() => {
              if (drag) return;
              const a = months[i];
              onChange(a.year, a.month, a.year, a.month);
            }}
            sx={{
              position: 'absolute', left: pct,
              top: 0, bottom: 0,
              transform: 'translateX(-50%)',
              cursor: 'pointer',
              '&:hover .mr-tick-dot': { transform: 'translateX(-50%) scale(1.4)' },
            }}
          >
            {showLabel && (
              <Typography sx={{
                position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)',
                fontSize: '0.7rem', fontWeight: inRange ? 600 : 500,
                color: inRange ? c.brand : c.textTertiary,
                whiteSpace: 'nowrap', userSelect: 'none',
              }}>
                {labelText}
              </Typography>
            )}
            <Box className="mr-tick-dot" sx={{
              position: 'absolute', top: 30, left: '50%',
              transform: 'translateX(-50%)',
              width: isQuarter ? 6 : 4,
              height: isQuarter ? 6 : 4,
              borderRadius: '50%',
              bgcolor: inRange ? c.brand : c.borderPrimary,
              transition: 'transform 0.15s, background-color 0.15s',
              zIndex: 1,
            }} />
          </Box>
        );
      })}
    </Box>
  );
}
