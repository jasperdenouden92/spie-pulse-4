'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

type ChangeType = 'feature' | 'improvement' | 'fix' | 'design';

interface ChangeEntry {
  date: string;
  author: string;
  authorInitials: string;
  authorColor: string;
  type: ChangeType;
  title: string;
  description: string;
}

const CHANGELOG: ChangeEntry[] = [
  {
    date: '5 Mar 2026',
    author: 'Jasper',
    authorInitials: 'JD',
    authorColor: '#1e5a96',
    type: 'feature',
    title: 'Keyboard shortcuts',
    description: 'Press N to open the New menu with 1/2/3 item shortcuts. Press F or ⌘K to open search. Shortcut badges visible in sidebar.',
  },
  {
    date: '5 Mar 2026',
    author: 'Jasper',
    authorInitials: 'JD',
    authorColor: '#1e5a96',
    type: 'improvement',
    title: 'Operational KPIs now shows Maintenance dashboards',
    description: 'Toggling Operational KPIs in the left nav now shows the Dashboards tab and filters to Maintenance dashboards.',
  },
  {
    date: '5 Mar 2026',
    author: 'Jasper',
    authorInitials: 'JD',
    authorColor: '#1e5a96',
    type: 'design',
    title: 'Inspect mode hidden',
    description: 'The floating inspect toolbar has been hidden for stakeholder demos. Code is preserved for future use.',
  },
  {
    date: '4 Mar 2026',
    author: 'Jasper',
    authorInitials: 'JD',
    authorColor: '#1e5a96',
    type: 'feature',
    title: 'Dashboards tab in Control Room',
    description: 'New Dashboards tab next to KPI Analysis. Shows themed dashboard list on the left with 2-column chart grid. Filters to the active theme.',
  },
  {
    date: '4 Mar 2026',
    author: 'Jasper',
    authorInitials: 'JD',
    authorColor: '#1e5a96',
    type: 'feature',
    title: 'Date range picker',
    description: 'Replaced the simple dropdown with a two-panel calendar picker. Includes quick presets: Today, This Week, This Month, This Quarter, This Year, All Time.',
  },
  {
    date: '4 Mar 2026',
    author: 'Jasper',
    authorInitials: 'JD',
    authorColor: '#1e5a96',
    type: 'feature',
    title: '+ New button with dropdown',
    description: 'Added a New action button to the sidebar nav. Opens a dropdown with: Report issue, Request quote, Service request.',
  },
  {
    date: '3 Mar 2026',
    author: 'Jasper',
    authorInitials: 'JD',
    authorColor: '#1e5a96',
    type: 'improvement',
    title: 'Compact building cards',
    description: 'Building cards are now smaller and more compact. Fits 4 per row on large screens. Image height reduced, content tightened.',
  },
  {
    date: '3 Mar 2026',
    author: 'Jasper',
    authorInitials: 'JD',
    authorColor: '#1e5a96',
    type: 'fix',
    title: 'Sidebar scroll fixed',
    description: 'Sidebar nav was causing the whole page to scroll. Fixed with a reliable absolute-positioned scroll container.',
  },
  {
    date: '3 Mar 2026',
    author: 'Jasper',
    authorInitials: 'JD',
    authorColor: '#1e5a96',
    type: 'fix',
    title: 'Removed period dropdowns from charts',
    description: 'Individual chart period selectors removed. The global date range picker at the top now controls all charts.',
  },
];

const TYPE_CONFIG: Record<ChangeType, { label: string; color: string; bg: string }> = {
  feature:     { label: 'Feature',     color: '#1e5a96', bg: '#eef2ff' },
  improvement: { label: 'Improvement', color: '#7c3aed', bg: '#f3e8ff' },
  fix:         { label: 'Fix',         color: '#b45309', bg: '#fef3c7' },
  design:      { label: 'Design',      color: '#0f766e', bg: '#f0fdfa' },
};

export default function ChangelogButton() {
  const [open, setOpen] = useState(false);

  // Group by date
  const grouped = CHANGELOG.reduce<Record<string, ChangeEntry[]>>((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {});

  return (
    <>
      {/* Floating button */}
      <Box
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.5,
          py: 0.75,
          bgcolor: '#1e1e2e',
          color: '#fff',
          borderRadius: '20px',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: '#2d2d44',
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          },
          userSelect: 'none',
        }}
      >
        <AutoAwesomeIcon sx={{ fontSize: 14, color: '#a78bfa' }} />
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem', letterSpacing: 0.2 }}>
          Changelog
        </Typography>
        <Box sx={{
          width: 18,
          height: 18,
          bgcolor: '#a78bfa',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ml: 0.25,
        }}>
          <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#1e1e2e', lineHeight: 1 }}>
            {CHANGELOG.length}
          </Typography>
        </Box>
      </Box>

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{ paper: { sx: { width: 400, p: 0 } } }}
      >
        {/* Header */}
        <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon sx={{ fontSize: 18, color: '#7c3aed' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
              Prototype changelog
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Entries */}
        <Box sx={{ overflowY: 'auto', flex: 1, px: 3, py: 2 }}>
          {Object.entries(grouped).map(([date, entries], gi) => (
            <Box key={date} sx={{ mb: 3 }}>
              {/* Date label */}
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {date}
              </Typography>

              <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {entries.map((entry, i) => {
                  const tc = TYPE_CONFIG[entry.type];
                  return (
                    <Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
                      {/* Author avatar */}
                      <Box sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: entry.authorColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.25,
                      }}>
                        <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.6rem' }}>
                          {entry.authorInitials}
                        </Typography>
                      </Box>

                      {/* Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {entry.title}
                          </Typography>
                          <Chip
                            label={tc.label}
                            size="small"
                            sx={{ height: 18, fontSize: '0.625rem', fontWeight: 600, color: tc.color, bgcolor: tc.bg, borderRadius: '4px', '& .MuiChip-label': { px: 0.75 } }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                          {entry.description}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                          {entry.author}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {gi < Object.keys(grouped).length - 1 && <Divider sx={{ mt: 2.5 }} />}
            </Box>
          ))}
        </Box>
      </Drawer>
    </>
  );
}
