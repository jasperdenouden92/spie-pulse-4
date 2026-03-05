import React from 'react';
import Box from '@mui/material/Box';

export type ToggleState = 'on' | 'off' | 'inherited';

interface KPIToggleProps {
  state: ToggleState;
  size?: 'small' | 'medium';
  onClick?: (e: React.MouseEvent) => void;
}

export default function KPIToggle({ state, size = 'medium', onClick }: KPIToggleProps) {
  const isOn = state === 'on' || state === 'inherited';
  const dims = size === 'small' ? { width: 28, height: 16, knob: 12, offset: 2 } : { width: 34, height: 18, knob: 14, offset: 2 };

  const bgColor = state === 'on'
    ? '#1976d2'
    : state === 'inherited'
      ? '#b0bec5'
      : '#e0e0e0';

  const knobColor = state === 'on'
    ? '#fff'
    : state === 'inherited'
      ? '#fff'
      : '#bdbdbd';

  return (
    <Box
      component="span"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dims.width,
        height: dims.height,
        borderRadius: dims.height / 2,
        bgcolor: bgColor,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        position: 'relative',
        flexShrink: 0,
        '&:hover': onClick ? {
          bgcolor: state === 'on' ? '#1565c0' : state === 'inherited' ? '#90a4ae' : '#bdbdbd',
        } : {},
      }}
    >
      <Box
        component="span"
        sx={{
          width: dims.knob,
          height: dims.knob,
          borderRadius: '50%',
          bgcolor: knobColor,
          position: 'absolute',
          left: isOn ? dims.width - dims.knob - dims.offset : dims.offset,
          transition: 'left 0.2s ease, background-color 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </Box>
  );
}
