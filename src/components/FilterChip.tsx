'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useThemeMode } from '@/theme-mode-context';

interface FilterChipProps {
  /** The filter label, e.g. "City" or "Contract" */
  label: string;
  /** The currently selected value to display. Null/undefined = empty state. */
  value?: string | null;
  /** Opens the dropdown or picker */
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  /** Called when the × is clicked. Required for clearable chips. */
  onClear?: () => void;
  /** Whether to show the × button when a value is selected. Defaults to true if onClear is provided. */
  clearable?: boolean;
  /** When true, always render the non-active (grey) look even when a value is set. */
  neutral?: boolean;
}

export default function FilterChip({
  label,
  value,
  onClick,
  onClear,
  clearable = !!onClear,
  neutral = false,
}: FilterChipProps) {
  const { themeColors: c } = useThemeMode();
  const hasValue = value != null && value !== '';
  const isFilled = !neutral && hasValue;
  const showClear = clearable && !!onClear && hasValue;

  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 30,
        borderRadius: '7px',
        border: '1px solid',
        borderColor: isFilled ? c.brandSecondary : c.borderSecondary,
        bgcolor: isFilled ? c.bgActive : c.bgPrimary,
        cursor: 'pointer',
        outline: 'none',
        px: 0,
        gap: 0,
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
        '&:hover': {
          borderColor: isFilled ? c.brandSecondary : c.borderSecondary,
          bgcolor: isFilled ? c.bgActive : c.bgPrimaryHover,
        },
      }}
    >
      {/* Left: clear button + label */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: showClear ? 0.5 : 1.25, pr: 1.25 }}>
        {showClear && (
          <Box
            component="span"
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onClear!(); }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              height: 20,
              borderRadius: '4px',
              color: c.brandSecondary,
              flexShrink: 0,
              '&:hover': { bgcolor: `color-mix(in srgb, ${c.brandSecondary} 12%, transparent)` },
            }}
          >
            <CloseIcon sx={{ fontSize: 13 }} />
          </Box>
        )}
        <Typography
          sx={{
            fontSize: '0.8rem',
            fontWeight: 500,
            lineHeight: 1,
            color: isFilled ? c.brandSecondary : 'text.primary',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          {label}
        </Typography>
      </Box>

      {/* Divider */}
      <Box sx={{ width: '1px', height: 16, bgcolor: isFilled ? `color-mix(in srgb, ${c.brandSecondary} 30%, transparent)` : 'divider', flexShrink: 0 }} />

      {/* Right: value + chevron */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, pl: 1, pr: 0.75 }}>
        {hasValue && (
          <Typography
            sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              lineHeight: 1,
              color: isFilled ? c.brandSecondary : 'text.secondary',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            {value}
          </Typography>
        )}
        <ExpandMoreIcon sx={{ fontSize: 16, color: isFilled ? c.brandSecondary : 'text.secondary', flexShrink: 0 }} />
      </Box>
    </Box>
  );
}
