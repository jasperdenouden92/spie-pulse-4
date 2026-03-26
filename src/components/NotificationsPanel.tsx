import React, { useState, useImperativeHandle, forwardRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import CloseIcon from '@mui/icons-material/Close';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import Tooltip from '@mui/material/Tooltip';
import { colors, secondaryAlpha } from '@/colors';

export interface Notification {
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

export interface NotificationsPanelHandle {
  addNotification: (n: Notification) => void;
}

const initialNotifications: Notification[] = [];

function formatDate(iso: string): string {
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

const NotificationsPanel = forwardRef<NotificationsPanelHandle, NotificationsPanelProps>(
  function NotificationsPanel({ open, onClose, sidebarWidth }, ref) {
    const [notifications, setNotifications] = useState(initialNotifications);

    useImperativeHandle(ref, () => ({
      addNotification: (n: Notification) => {
        setNotifications(prev => [n, ...prev]);
      },
    }));

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
              <Box sx={{ bgcolor: colors.brand, color: '#fff', borderRadius: '10px', px: 0.8, py: 0.1, fontSize: '0.7rem', fontWeight: 700, lineHeight: 1.4, minWidth: 18, textAlign: 'center' }}>
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
          {notifications.length === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.disabled' }}>
              <NotificationsNoneIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">No notifications yet</Typography>
            </Box>
          )}
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
);

export default NotificationsPanel;

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
        borderBottom: `1px solid ${colors.bgPrimaryHover}`,
        bgcolor: n.read ? 'transparent' : secondaryAlpha(0.03),
        '&:hover': { bgcolor: n.read ? colors.bgSecondary : secondaryAlpha(0.06) },
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
              {formatDate(n.date)}
            </Typography>
            {!n.read && (
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: colors.brand, flexShrink: 0 }} />
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
