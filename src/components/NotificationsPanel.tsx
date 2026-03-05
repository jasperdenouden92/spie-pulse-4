import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import CloseIcon from '@mui/icons-material/Close';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import Tooltip from '@mui/material/Tooltip';

interface Notification {
  id: string;
  actor: string;
  actorInitials: string;
  actorColor: string;
  action: string;
  target: string;
  detail?: string;
  date: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    actor: 'Jasper den Ouden',
    actorInitials: 'JO',
    actorColor: '#7c3aed',
    action: 'commented on',
    target: 'Skyline Plaza — HVAC alert',
    detail: 'Ik heb de temperatuur override al aangepast, even monitoren komende 24u.',
    date: '2026-03-05T10:15:00',
    read: false,
  },
  {
    id: '2',
    actor: 'Bart Dunweg',
    actorInitials: 'BD',
    actorColor: '#2563eb',
    action: 'assigned you to',
    target: 'Ticket #1247 — Verlichting parkeergarage',
    date: '2026-03-05T09:02:00',
    read: false,
  },
  {
    id: '3',
    actor: 'System',
    actorInitials: 'S',
    actorColor: '#dc2626',
    action: 'alert:',
    target: 'Heritage Building — Comfort score dropped below 70%',
    detail: 'Current score: 64%. Threshold: 70%.',
    date: '2026-03-04T16:45:00',
    read: false,
  },
  {
    id: '4',
    actor: 'Jasper den Ouden',
    actorInitials: 'JO',
    actorColor: '#7c3aed',
    action: 'mentioned you in',
    target: 'Quarterly review notes Q1 2026',
    detail: '@Admin check de sustainability KPIs voor Riverside Tower.',
    date: '2026-03-04T14:20:00',
    read: false,
  },
  {
    id: '5',
    actor: 'System',
    actorInitials: 'S',
    actorColor: '#059669',
    action: 'export ready:',
    target: 'Control Room Overview Q1 2026 (PDF, 2.4 MB)',
    date: '2026-03-04T11:00:00',
    read: true,
  },
  {
    id: '6',
    actor: 'Elwin de Witte',
    actorInitials: 'EW',
    actorColor: '#d97706',
    action: 'resolved',
    target: 'Ticket #1198 — Lekkage dak B2',
    date: '2026-03-03T17:30:00',
    read: true,
  },
  {
    id: '7',
    actor: 'Bart Dunweg',
    actorInitials: 'BD',
    actorColor: '#2563eb',
    action: 'invited you to',
    target: 'Maintenance planning workspace',
    date: '2026-03-02T09:15:00',
    read: true,
  },
  {
    id: '8',
    actor: 'System',
    actorInitials: 'S',
    actorColor: '#dc2626',
    action: 'alert:',
    target: 'Skyline Plaza — Energy consumption 15% above target',
    date: '2026-02-28T08:00:00',
    read: true,
  },
  {
    id: '9',
    actor: 'Jasper den Ouden',
    actorInitials: 'JO',
    actorColor: '#7c3aed',
    action: 'commented on',
    target: 'Quotation #Q-892 — HVAC upgrade',
    detail: 'Offerte is goedgekeurd, kunnen we inplannen voor volgende maand.',
    date: '2026-02-27T15:45:00',
    read: true,
  },
];

function formatNotificationDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (d.getFullYear() === now.getFullYear()) {
    return `${months[d.getMonth()]} ${d.getDate()}`;
  }
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  sidebarWidth: number;
}

export default function NotificationsPanel({ open, onClose, sidebarWidth }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const recentNotifications = notifications.filter(n => {
    const diffMs = Date.now() - new Date(n.date).getTime();
    return diffMs < 7 * 24 * 60 * 60 * 1000;
  });
  const olderNotifications = notifications.filter(n => {
    const diffMs = Date.now() - new Date(n.date).getTime();
    return diffMs >= 7 * 24 * 60 * 60 * 1000;
  });

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: sidebarWidth,
        width: 380,
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>Inbox</Typography>
          {unreadCount > 0 && (
            <Box sx={{ bgcolor: '#1976d2', color: '#fff', borderRadius: '10px', px: 0.8, py: 0.1, fontSize: '0.7rem', fontWeight: 700, lineHeight: 1.4, minWidth: 18, textAlign: 'center' }}>
              {unreadCount}
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton size="small" onClick={markAllRead} sx={{ color: 'text.secondary' }}>
                <DoneAllIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Notification list */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {recentNotifications.length > 0 && (
          <>
            <Typography variant="caption" sx={{ display: 'block', px: 2.5, pt: 2, pb: 1, color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              This week
            </Typography>
            {recentNotifications.map(n => (
              <NotificationRow key={n.id} notification={n} onRead={markRead} />
            ))}
          </>
        )}
        {olderNotifications.length > 0 && (
          <>
            <Typography variant="caption" sx={{ display: 'block', px: 2.5, pt: 2, pb: 1, color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Older
            </Typography>
            {olderNotifications.map(n => (
              <NotificationRow key={n.id} notification={n} onRead={markRead} />
            ))}
          </>
        )}
      </Box>
    </Box>
  );
}

function NotificationRow({ notification, onRead }: { notification: Notification; onRead: (id: string) => void }) {
  const n = notification;
  return (
    <Box
      onClick={() => !n.read && onRead(n.id)}
      sx={{
        display: 'flex',
        gap: 1.5,
        px: 2.5,
        py: 1.5,
        cursor: n.read ? 'default' : 'pointer',
        borderBottom: '1px solid #f5f5f5',
        bgcolor: n.read ? 'transparent' : 'rgba(25, 118, 210, 0.03)',
        '&:hover': { bgcolor: n.read ? '#fafafa' : 'rgba(25, 118, 210, 0.06)' },
        transition: 'background-color 0.15s ease',
      }}
    >
      <Avatar sx={{ width: 32, height: 32, bgcolor: n.actorColor, fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, mt: 0.25 }}>
        {n.actorInitials}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Typography variant="body2" sx={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
            <Box component="span" sx={{ fontWeight: 600 }}>{n.actor}</Box>
            {' '}{n.action}{' '}
            <Box component="span" sx={{ fontWeight: 500 }}>{n.target}</Box>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0, mt: 0.25 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', fontSize: '0.7rem' }}>
              {formatNotificationDate(n.date)}
            </Typography>
            {!n.read && (
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#1976d2', flexShrink: 0 }} />
            )}
          </Box>
        </Box>
        {n.detail && (
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5, lineHeight: 1.4, fontSize: '0.75rem' }}>
            {n.detail}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
