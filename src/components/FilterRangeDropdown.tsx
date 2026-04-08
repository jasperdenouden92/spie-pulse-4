'use client';

import React from 'react';
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import { useThemeMode } from '@/theme-mode-context';

export interface RangeValue {
  min: string;
  max: string;
}

interface FilterRangeDropdownProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  onRemove?: () => void;
  type: 'number' | 'date';
  prefix?: string;
  placeholderMin?: string;
  placeholderMax?: string;
}

export default function FilterRangeDropdown({
  anchorEl,
  onClose,
  value,
  onChange,
  onRemove,
  type,
  prefix,
  placeholderMin = 'Min',
  placeholderMax = 'Max',
}: FilterRangeDropdownProps) {
  const { themeColors: c } = useThemeMode();
  const hasValue = value.min !== '' || value.max !== '';

  const inputSx = {
    flex: 1,
    px: 1.25,
    py: 0.75,
    border: `1px solid ${c.borderPrimary}`,
    borderRadius: '7px',
    bgcolor: c.bgPrimary,
    fontSize: '0.85rem',
    minWidth: 0,
    '& input': { p: 0, minWidth: 0 },
    '&:focus-within': { borderColor: c.brandSecondary },
    transition: 'border-color 0.15s ease',
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
          width: 264,
          borderRadius: '10px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
          overflow: 'hidden',
          p: 2,
          bgcolor: c.bgPrimary,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <InputBase
          type={type === 'date' ? 'date' : 'number'}
          value={value.min}
          onChange={(e) => onChange({ ...value, min: e.target.value })}
          placeholder={placeholderMin}
          startAdornment={
            prefix ? (
              <Typography sx={{ color: 'text.secondary', mr: 0.5, fontSize: '0.85rem', flexShrink: 0 }}>
                {prefix}
              </Typography>
            ) : undefined
          }
          sx={inputSx}
        />
        <Typography sx={{ color: 'text.secondary', flexShrink: 0, fontSize: '0.85rem' }}>—</Typography>
        <InputBase
          type={type === 'date' ? 'date' : 'number'}
          value={value.max}
          onChange={(e) => onChange({ ...value, max: e.target.value })}
          placeholder={placeholderMax}
          startAdornment={
            prefix ? (
              <Typography sx={{ color: 'text.secondary', mr: 0.5, fontSize: '0.85rem', flexShrink: 0 }}>
                {prefix}
              </Typography>
            ) : undefined
          }
          sx={inputSx}
        />
      </Box>

      <Box
        sx={{
          mt: 1.5,
          pt: 1.5,
          borderTop: `1px solid ${c.borderTertiary}`,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Box
          component="button"
          onClick={() => {
            onChange({ min: '', max: '' });
            onRemove?.();
            onClose();
          }}
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: hasValue || onRemove ? c.brandSecondary : 'text.disabled',
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
