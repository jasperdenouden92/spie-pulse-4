'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import AppTabs from '@/components/AppTabs';
import { colors } from '@/colors';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HistoryIcon from '@mui/icons-material/History';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TuneIcon from '@mui/icons-material/Tune';
import BrushOutlinedIcon from '@mui/icons-material/BrushOutlined';
import { useAnnotationsSafe, type PanelCorner } from '@jasperdenouden92/annotations';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';

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

interface HighlightsData {
  commitCount: number;
  authors: string[];
  sections: { type: ChangeType; items: string[] }[];
}

const TYPE_CONFIG: Record<ChangeType, { label: string; color: string; bg: string; border: string }> = {
  feature:     { label: 'New',         color: colors.brand, bg: colors.bgActive, border: '#c7d7f5' },
  improvement: { label: 'Improved',    color: '#7c3aed', bg: '#f3e8ff', border: '#d8b4fe' },
  fix:         { label: 'Fixed',       color: '#b45309', bg: '#fef3c7', border: '#fcd34d' },
  design:      { label: 'Design',      color: '#0f766e', bg: '#f0fdfa', border: '#99f6e4' },
};

const TYPE_ICON: Record<ChangeType, React.ReactNode> = {
  feature:     <AddCircleOutlineIcon sx={{ fontSize: 15 }} />,
  improvement: <TuneIcon sx={{ fontSize: 15 }} />,
  fix:         <BugReportOutlinedIcon sx={{ fontSize: 15 }} />,
  design:      <BrushOutlinedIcon sx={{ fontSize: 15 }} />,
};

/** Mirror the library's snapToCorner logic. */
function snapToCorner(x: number, y: number, w: number, h: number): PanelCorner {
  const col = x < w / 3 ? 'left' : x > (w * 2) / 3 ? 'right' : 'center';
  const row = y < h / 3 ? 'top' : y > (h * 2) / 3 ? 'bottom' : 'center';
  if (row === 'top' && col === 'left') return 'top-left';
  if (row === 'top') return 'top-right';
  if (row === 'center' && col === 'right') return 'right-center';
  if (row === 'center' && col === 'left') return 'left-center';
  if (row === 'bottom' && col === 'right') return 'bottom-right';
  if (row === 'bottom' && col === 'left') return 'bottom-left';
  return 'bottom-center';
}

const DRAG_THRESHOLD = 5;

/** Position the changelog button in the toolbar next to AnnotationButton +
 *  Inspector. Inspector occupies the first offset slot (48px); we take the
 *  second slot (96px). On edges the buttons stack vertically; on corners they
 *  stay in the same column/row as the library buttons. */
function getChangelogPosition(panelCorner: string): React.CSSProperties {
  const inset = 24;
  const step = 48; // button size (40) + gap (8)
  const offset = step * 2; // third button in the stack
  const styles: React.CSSProperties = { position: 'fixed' };

  switch (panelCorner) {
    case 'top-left':
      styles.top = inset + offset;
      styles.left = inset;
      break;
    case 'top-right':
      styles.top = inset + offset;
      styles.right = inset;
      break;
    case 'right-center':
      styles.top = `calc(50% + ${4 - offset}px)`;
      styles.right = inset;
      break;
    case 'bottom-right':
      styles.bottom = inset + offset;
      styles.right = inset;
      break;
    case 'bottom-center':
      // Horizontal row: Annotation at 50%-24, Inspector at 50%+24, Changelog at 50%-72
      styles.bottom = inset;
      styles.left = `calc(50% - ${24 + step}px)`;
      break;
    case 'bottom-left':
      styles.bottom = inset + offset;
      styles.left = inset;
      break;
    case 'left-center':
      styles.top = `calc(50% + ${4 - offset}px)`;
      styles.left = inset;
      break;
    default:
      styles.bottom = inset + offset;
      styles.right = inset;
  }
  return styles;
}

export default function ChangelogButton() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'highlights' | 'commits'>('highlights');
  const { panelCorner, setPanelCorner } = useAnnotationsSafe();

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, didDrag: false });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, didDrag: false };
    const handleMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      if (!dragRef.current.didDrag && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        dragRef.current.didDrag = true;
        setIsDragging(true);
      }
      if (dragRef.current.didDrag) {
        setPanelCorner(snapToCorner(ev.clientX, ev.clientY, window.innerWidth, window.innerHeight));
      }
    };
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      requestAnimationFrame(() => setIsDragging(false));
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [setPanelCorner]);

  const [commits, setCommits] = useState<CommitEntry[]>([]);
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [commitsError, setCommitsError] = useState<string | null>(null);

  const [highlights, setHighlights] = useState<HighlightsData | null>(null);
  const [highlightsLoading, setHighlightsLoading] = useState(false);
  const [highlightsError, setHighlightsError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || commits.length > 0) return;
    setCommitsLoading(true);
    setCommitsError(null);
    fetch('/api/changelog')
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then(setCommits)
      .catch((e) => setCommitsError(e.message))
      .finally(() => setCommitsLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open || tab !== 'highlights' || highlights !== null || highlightsLoading) return;
    setHighlightsLoading(true);
    setHighlightsError(null);
    fetch('/api/changelog/highlights')
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then(setHighlights)
      .catch((e) => setHighlightsError(e.message))
      .finally(() => setHighlightsLoading(false));
  }, [open, tab]);

  const grouped = commits.reduce<Record<string, CommitEntry[]>>((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {});

  return (
    <>
      {/* Floating button — follows AnnotationButton position */}
      <Box
        component="button"
        onClick={() => { if (!dragRef.current.didDrag) setOpen(true); }}
        onMouseDown={handleMouseDown}
        sx={{
          ...getChangelogPosition(panelCorner),
          zIndex: 9998,
          width: 40,
          height: 40,
          borderRadius: '10px',
          bgcolor: '#FFFFFF',
          color: '#344054',
          border: '1px solid #D0D5DD',
          cursor: isDragging ? 'grabbing' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 2px rgba(16,24,40,0.05), 0 1px 3px rgba(16,24,40,0.1)',
          transition: isDragging ? 'none' : 'all 0.15s ease',
          p: 0,
          '&:hover': { bgcolor: '#F9FAFB' },
        }}
      >
        <HistoryIcon sx={{ fontSize: 20, color: '#667085' }} />
        {commits.length > 0 && (
          <Box
            component="span"
            sx={{
              position: 'absolute',
              top: -6,
              right: -6,
              minWidth: 18,
              height: 18,
              borderRadius: '9px',
              bgcolor: '#7c3aed',
              border: '2px solid #FFFFFF',
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 0.25,
            }}
          >
            {commits.length}
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
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>Prototype changelog</Typography>
          </Box>
          <IconButton size="small" onClick={() => setOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Tabs */}
        <AppTabs
          value={tab}
          onChange={setTab}
          size="small"
          indicatorColor="#7c3aed"
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
          tabs={[
            { value: 'highlights', label: 'Highlights', icon: <AutoAwesomeIcon sx={{ fontSize: 14 }} /> },
            { value: 'commits', label: 'Commits', icon: <FormatListBulletedIcon sx={{ fontSize: 14 }} /> },
          ]}
        />

        {/* Body */}
        <Box sx={{ overflowY: 'auto', flex: 1, px: 3, py: 2.5 }}>

          {/* ── Highlights tab ── */}
          {tab === 'highlights' && (
            <>
              {highlightsLoading && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 6, gap: 2 }}>
                  <CircularProgress size={28} sx={{ color: '#7c3aed' }} />
                  <Typography variant="body2" color="text.secondary">Loading…</Typography>
                </Box>
              )}
              {highlightsError && (
                <Typography color="error" variant="body2" sx={{ pt: 4 }}>Failed: {highlightsError}</Typography>
              )}
              {!highlightsLoading && !highlightsError && highlights && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                  {/* Meta row */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>
                      {highlights.commitCount} commits
                    </Typography>
                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {highlights.authors.map((author) => (
                        <Chip key={author} label={author} size="small"
                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 500, bgcolor: colors.bgPrimaryHover, '& .MuiChip-label': { px: 1 } }} />
                      ))}
                    </Box>
                  </Box>

                  {/* Sections */}
                  {highlights.sections.map((section) => {
                    const tc = TYPE_CONFIG[section.type];
                    return (
                      <Box key={section.type} sx={{ border: 1, borderColor: tc.border, borderRadius: '10px', overflow: 'hidden' }}>
                        {/* Section header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.25, bgcolor: tc.bg }}>
                          <Box sx={{ color: tc.color, display: 'flex', alignItems: 'center' }}>
                            {TYPE_ICON[section.type]}
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem', color: tc.color, flex: 1 }}>
                            {tc.label}
                          </Typography>
                          <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: tc.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="caption" sx={{ fontSize: '0.625rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                              {section.items.length}
                            </Typography>
                          </Box>
                        </Box>
                        {/* Items */}
                        <Box sx={{ bgcolor: '#fff' }}>
                          {section.items.map((item, i) => (
                            <Box key={i} sx={{
                              px: 2, py: 1,
                              borderTop: i > 0 ? `1px solid ${tc.border}` : 'none',
                              display: 'flex', alignItems: 'center', gap: 1,
                            }}>
                              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: tc.color, flexShrink: 0, opacity: 0.5 }} />
                              <Typography variant="body2" sx={{ fontSize: '0.8125rem', lineHeight: 1.4 }}>
                                {item}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </>
          )}

          {/* ── Commits tab ── */}
          {tab === 'commits' && (
            <>
              {commitsLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
                  <CircularProgress size={28} />
                </Box>
              )}
              {commitsError && (
                <Typography color="error" variant="body2">Failed to load: {commitsError}</Typography>
              )}
              {!commitsLoading && !commitsError && Object.entries(grouped).map(([date, dateEntries], gi) => (
                <Box key={date} sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {date}
                  </Typography>
                  <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {dateEntries.map((entry) => {
                      const tc = TYPE_CONFIG[entry.type];
                      return (
                        <Box key={entry.sha} sx={{ display: 'flex', gap: 1.5 }}>
                          <Avatar src={entry.authorAvatar ?? undefined}
                            sx={{ width: 28, height: 28, fontSize: '0.6rem', fontWeight: 700, bgcolor: colors.brand, flexShrink: 0, mt: 0.25 }}>
                            {entry.author.slice(0, 2).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.25 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem', flex: 1 }}>
                                {entry.title}
                              </Typography>
                              <IconButton size="small" component="a" href={entry.url} target="_blank" rel="noopener noreferrer"
                                sx={{ p: 0.25, color: 'text.disabled', flexShrink: 0 }}>
                                <OpenInNewIcon sx={{ fontSize: 13 }} />
                              </IconButton>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: entry.description ? 0.5 : 0 }}>
                              <Chip label={tc.label} size="small"
                                sx={{ height: 18, fontSize: '0.625rem', fontWeight: 600, color: tc.color, bgcolor: tc.bg, borderRadius: '4px', '& .MuiChip-label': { px: 0.75 } }} />
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
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}
