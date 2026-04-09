'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CheckIcon from '@mui/icons-material/Check';
import { useThemeMode } from '@/theme-mode-context';
import { getKbdSx } from '@/components/BuildingSelector';

export interface FilterOption {
  value: string;
  label?: string;
  icon?: React.ReactNode;
}

// Single-select
interface FilterDropdownSingleProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  options: FilterOption[];
  multiple?: false;
  value: string | null;
  onChange: (value: string | null) => void;
  onRemove?: () => void;
  placeholder?: string;
  emptyText?: string;
  hideSearch?: boolean;
}

// Multi-select
interface FilterDropdownMultiProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  options: FilterOption[];
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
  onRemove?: () => void;
  placeholder?: string;
  emptyText?: string;
  hideSearch?: boolean;
}

type FilterDropdownProps = FilterDropdownSingleProps | FilterDropdownMultiProps;

function OptionRow({
  option,
  selected,
  highlighted,
  onClick,
  innerRef,
}: {
  option: FilterOption;
  selected: boolean;
  highlighted: boolean;
  onClick: () => void;
  innerRef?: (el: HTMLElement | null) => void;
}) {
  const { themeColors: c } = useThemeMode();
  const label = option.label ?? option.value;

  return (
    <Box
      ref={innerRef}
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mx: 1,
        px: 1.5,
        py: 0.875,
        borderRadius: '6px',
        cursor: 'pointer',
        bgcolor: selected ? c.bgActive : highlighted ? c.bgPrimaryHover : 'transparent',
        '&:hover': { bgcolor: selected ? c.bgActive : c.bgPrimaryHover },
      }}
    >
      {option.icon && (
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {option.icon}
        </Box>
      )}
      <Typography
        variant="body2"
        noWrap
        sx={{ flex: 1, fontSize: '0.85rem', fontWeight: selected ? 600 : 400, color: selected ? c.brandSecondary : 'text.primary' }}
      >
        {label}
      </Typography>
      {selected && <CheckIcon sx={{ fontSize: 16, color: c.brandSecondary, flexShrink: 0 }} />}
    </Box>
  );
}

export default function FilterDropdown(props: FilterDropdownProps) {
  const { anchorEl, onClose, options, multiple, onRemove, placeholder = 'Search…', emptyText = 'No results', hideSearch = false } = props;
  const { themeColors: c } = useThemeMode();
  const [search, setSearch] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const kbdSx = getKbdSx(c);

  // Auto-focus search on open
  useEffect(() => {
    if (anchorEl) {
      setSearch('');
      setHighlightIndex(0);
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [anchorEl]);

  const filtered = search.trim()
    ? options.filter(o => (o.label ?? o.value).toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => setHighlightIndex(0), [search]);

  const isSelected = useCallback((val: string) => {
    if (multiple) return (props.value as string[]).includes(val);
    return props.value === val;
  }, [multiple, props.value]);

  const hasValue = multiple
    ? (props.value as string[]).length > 0
    : props.value !== null;

  const select = useCallback((val: string) => {
    if (multiple) {
      const current = props.value as string[];
      const next = current.includes(val)
        ? current.filter(v => v !== val)
        : [...current, val];
      (props as FilterDropdownMultiProps).onChange(next);
      // Stay open for multi-select
    } else {
      const current = props.value as string | null;
      (props as FilterDropdownSingleProps).onChange(val === current ? null : val);
      onClose();
    }
  }, [multiple, props, onClose]);

  const handleClear = useCallback(() => {
    if (multiple) {
      (props as FilterDropdownMultiProps).onChange([]);
    } else {
      (props as FilterDropdownSingleProps).onChange(null);
    }
    onRemove?.();
    onClose();
  }, [multiple, props, onRemove, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[highlightIndex];
      if (item) select(item.value);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Popover
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{
        sx: {
          mt: 0.5,
          width: 260,
          borderRadius: '10px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 400,
        },
      }}
    >
      {/* Search */}
      {!hideSearch && (
        <>
          <Box sx={{ px: 2, pt: 1.5, pb: 0.5, flexShrink: 0 }}>
            <TextField
              inputRef={searchRef}
              size="small"
              placeholder={placeholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.85rem',
                  '& fieldset': { border: 'none' },
                },
                '& .MuiOutlinedInput-input': { py: '6px', px: 0 },
              }}
            />
          </Box>

          {/* Divider */}
          <Box sx={{ height: '1px', bgcolor: 'divider', flexShrink: 0, mx: 0 }} />
        </>
      )}

      {/* List */}
      <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, py: 0.75 }}>
        {filtered.length > 0 ? (
          filtered.map((opt, i) => (
            <OptionRow
              key={opt.value}
              option={opt}
              selected={isSelected(opt.value)}
              highlighted={i === highlightIndex}
              onClick={() => select(opt.value)}
              innerRef={i === highlightIndex ? el => el?.scrollIntoView({ block: 'nearest' }) : undefined}
            />
          ))
        ) : (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">{emptyText}</Typography>
          </Box>
        )}
      </Box>

      {/* Sticky footer */}
      <Box sx={{
        flexShrink: 0,
        borderTop: `1px solid ${c.borderTertiary}`,
        bgcolor: c.bgSecondary,
        px: 2,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}>
        {/* Keyboard shortcuts */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ display: 'flex', gap: 0.25 }}>
              <Box component="kbd" sx={kbdSx}>↑</Box>
              <Box component="kbd" sx={kbdSx}>↓</Box>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6875rem' }}>Navigate</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box component="kbd" sx={kbdSx}>↵</Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6875rem' }}>Select</Typography>
          </Box>
        </Box>

        {/* Clear */}
        <Box
          component="button"
          onClick={handleClear}
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: hasValue ? c.brandSecondary : 'text.disabled',
            bgcolor: 'transparent',
            border: 'none',
            cursor: hasValue || onRemove ? 'pointer' : 'default',
            p: 0,
            lineHeight: 1,
            '&:hover': { textDecoration: hasValue || onRemove ? 'underline' : 'none' },
          }}
        >
          Clear
        </Box>
      </Box>
    </Popover>
  );
}
