'use client';

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

type ChangeType = 'feature' | 'improvement' | 'fix' | 'design';

interface CommitEntry {
  sha: string;
  date: string;
  author: string;
  authorAvatar: string | null;
  title: string;
  description: string;
  url: string;
  type: ChangeType;
}

const TYPE_CONFIG: Record<ChangeType, { label: string; color: string; bg: string }> = {
  feature:     { label: 'Feature',     color: '#1e5a96', bg: '#eef2ff' },
  improvement: { label: 'Improvement', color: '#7c3aed', bg: '#f3e8ff' },
  fix:         { label: 'Fix',         color: '#b45309', bg: '#fef3c7' },
  design:      { label: 'Design',      color: '#0f766e', bg: '#f0fdfa' },
};

export default function ChangelogButton() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<CommitEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || entries.length > 0) return;
    setLoading(true);
    setError(null);
    fetch('/api/changelog')
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then((data) => setEntries(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open]);

  // Group by date
  const grouped = entries.reduce<Record<string, CommitEntry[]>>((acc, entry) => {
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
        {entries.length > 0 && (
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
              {entries.length}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{ paper: { sx: { width: 420, display: 'flex', flexDirection: 'column' } } }}
      >
        {/* Header */}
        <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
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

        {/* Body */}
        <Box sx={{ overflowY: 'auto', flex: 1, px: 3, py: 2 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
              <CircularProgress size={28} />
            </Box>
          )}

          {error && (
            <Box sx={{ pt: 4, textAlign: 'center' }}>
              <Typography color="error" variant="body2">Failed to load: {error}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Set GITHUB_TOKEN in .env.local if the repo is private.
              </Typography>
            </Box>
          )}

          {!loading && !error && Object.entries(grouped).map(([date, dateEntries], gi) => (
            <Box key={date} sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {date}
              </Typography>

              <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {dateEntries.map((entry) => {
                  const tc = TYPE_CONFIG[entry.type];
                  return (
                    <Box key={entry.sha} sx={{ display: 'flex', gap: 1.5 }}>
                      {/* Author avatar */}
                      <Avatar
                        src={entry.authorAvatar ?? undefined}
                        sx={{ width: 28, height: 28, fontSize: '0.6rem', fontWeight: 700, bgcolor: '#1e5a96', flexShrink: 0, mt: 0.25 }}
                      >
                        {entry.author.slice(0, 2).toUpperCase()}
                      </Avatar>

                      {/* Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.25, flexWrap: 'wrap' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem', flex: 1 }}>
                            {entry.title}
                          </Typography>
                          <IconButton
                            size="small"
                            component="a"
                            href={entry.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ p: 0.25, color: 'text.disabled', flexShrink: 0 }}
                          >
                            <OpenInNewIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                          <Chip
                            label={tc.label}
                            size="small"
                            sx={{ height: 18, fontSize: '0.625rem', fontWeight: 600, color: tc.color, bgcolor: tc.bg, borderRadius: '4px', '& .MuiChip-label': { px: 0.75 } }}
                          />
                          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                            {entry.author} · {entry.sha}
                          </Typography>
                        </Box>

                        {entry.description && (
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                            {entry.description}
                          </Typography>
                        )}
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
