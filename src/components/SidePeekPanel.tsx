'use client';

import React from 'react';
import Box from '@mui/material/Box';
import { useThemeMode } from '@/theme-mode-context';

const PANEL_WIDTH = 720;

/** Call in any onClick handler to open the SidePeek normally, or navigate fullscreen when Shift is held. */
export function handleSidePeekClick(
  e: React.MouseEvent | undefined,
  onOpen: () => void,
  onFullscreen: () => void,
) {
  if (e?.shiftKey) {
    onFullscreen();
  } else {
    onOpen();
  }
}

export interface SidePeekPanelProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export default function SidePeekPanel({
  open,
  onClose,
  children,
}: SidePeekPanelProps) {
  const { themeColors: c } = useThemeMode();

  return (
    <>
      {/* Panel */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: PANEL_WIDTH,
          maxWidth: '100vw',
          height: '100vh',
          bgcolor: c.bgPrimary,
          zIndex: 1201,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: open ? '-8px 0 48px rgba(0, 0, 0, 0.15)' : 'none',
          overflow: 'hidden',
        }}
      >
        {/* Scrollable content */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
}
