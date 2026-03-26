'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { colors } from '@/colors';

interface DataExplorerPanelProps {
  open: boolean;
  onClose: () => void;
  sidebarWidth: number;
}

const folders = [
  { id: 'alerts', label: 'Alert Overview', icon: <NotificationsActiveOutlinedIcon sx={{ fontSize: 18 }} />, count: 12 },
  { id: 'analyses', label: 'Analyses Overview', icon: <BarChartOutlinedIcon sx={{ fontSize: 18 }} />, count: 8 },
  { id: 'documents', label: 'Documents', icon: <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />, count: 156 },
  { id: 'tickets', label: 'Tickets', icon: <ConfirmationNumberOutlinedIcon sx={{ fontSize: 18 }} />, count: 34 },
  { id: 'performance', label: 'Performance Overview', icon: <SpeedOutlinedIcon sx={{ fontSize: 18 }} />, count: 5 },
  { id: 'quotations', label: 'Quotations', icon: <RequestQuoteOutlinedIcon sx={{ fontSize: 18 }} />, count: 17 },
];

export default function DataExplorerPanel({ open, onClose, sidebarWidth }: DataExplorerPanelProps) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: sidebarWidth,
        width: 340,
        height: '100vh',
        bgcolor: '#fff',
        borderRight: '1px solid',
        borderColor: 'divider',
        zIndex: 1250,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: open ? '4px 0 24px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      {/* Header */}
      <Box sx={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>Data Explorer</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Folder list */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        <List disablePadding>
          {folders.map((folder) => (
            <ListItemButton
              key={folder.id}
              selected={selectedFolder === folder.id}
              onClick={() => setSelectedFolder(folder.id === selectedFolder ? null : folder.id)}
              sx={{
                mx: 1,
                borderRadius: '8px',
                mb: 0.5,
                py: 1.2,
                '&.Mui-selected': { bgcolor: colors.bgActive, '&:hover': { bgcolor: colors.bgActiveHover } },
                '&:hover': { bgcolor: colors.bgPrimaryHover },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: selectedFolder === folder.id ? colors.brand : 'text.secondary' }}>
                {folder.icon}
              </ListItemIcon>
              <ListItemText
                primary={folder.label}
                primaryTypographyProps={{ variant: 'body2', fontWeight: selectedFolder === folder.id ? 600 : 400 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                  {folder.count}
                </Typography>
                <ChevronRightIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              </Box>
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Box>
  );
}
