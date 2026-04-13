import { colors } from '@/colors';
import { useThemeMode } from '@/theme-mode-context';
import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MaintenanceSchedule } from '@/data/maintenance';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import InfiniteScrollContainer from './InfiniteScrollContainer';

interface MaintenanceScheduleListProps {
  schedules: MaintenanceSchedule[];
  buildingName?: string;
  compact?: boolean;
}

const statusColors = {
  'Scheduled': '#2196f3',
  'Overdue': '#f44336',
  'In Progress': '#ff9800',
  'Completed': '#4caf50'
};

const priorityColors = {
  Low: '#4caf50',
  Medium: '#ff9800',
  High: '#ff5722'
};

const frequencyColors = {
  'Daily': colors.bgActive,
  'Weekly': '#f3e5f5',
  'Monthly': '#e8f5e9',
  'Quarterly': '#fff3e0',
  'Semi-Annual': '#fce4ec',
  'Annual': '#e0f2f1'
};

export default function MaintenanceScheduleList({ schedules, buildingName, compact = false }: MaintenanceScheduleListProps) {
  const { themeColors: c } = useThemeMode();
  const filteredSchedules = useMemo(() => {
    return buildingName
      ? schedules.filter(s => s.building === buildingName)
      : schedules;
  }, [schedules, buildingName]);

  const { visibleData, hasMore, loadMore, isLoading, initialLoading } = useInfiniteScroll({
    data: filteredSchedules,
    pageSize: 50
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Preventative Maintenance Schedule {buildingName && `- ${buildingName}`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Showing {visibleData.length} of {filteredSchedules.length} items
        </Typography>
      </Box>
      <InfiniteScrollContainer
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoading={isLoading}
      >
        <TableContainer
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: c.bgPrimary
          }}
        >
          <Table data-annotation-id="maintenanceschedulelist-tabel">
            <TableHead>
              <TableRow sx={{ bgcolor: compact ? 'transparent' : c.bgSecondary }}>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Building</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Frequency</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Next Due</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Assigned To</TableCell>
                {!compact && <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {initialLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ py: compact ? 1 : undefined }}><Skeleton animation="wave"variant="text" width={70} /></TableCell>
                      <TableCell sx={{ py: compact ? 1 : undefined }}>
                        <Skeleton animation="wave"variant="text" width={`${50 + (i * 11) % 30}%`} />
                        {!compact && <Skeleton animation="wave"variant="text" width="38%" sx={{ mt: 0.5 }} />}
                      </TableCell>
                      <TableCell sx={{ py: compact ? 1 : undefined }}><Skeleton animation="wave"variant="text" width={110} /></TableCell>
                      <TableCell sx={{ py: compact ? 1 : undefined }}><Skeleton animation="wave"variant="rounded" width={65} height={20} sx={{ borderRadius: '16px' }} /></TableCell>
                      <TableCell sx={{ py: compact ? 1 : undefined }}><Skeleton animation="wave"variant="rounded" width={55} height={20} sx={{ borderRadius: '16px' }} /></TableCell>
                      <TableCell sx={{ py: compact ? 1 : undefined }}><Skeleton animation="wave"variant="rounded" width={75} height={20} sx={{ borderRadius: '16px' }} /></TableCell>
                      <TableCell sx={{ py: compact ? 1 : undefined }}><Skeleton animation="wave"variant="text" width={80} /></TableCell>
                      <TableCell sx={{ py: compact ? 1 : undefined }}><Skeleton animation="wave"variant="text" width={100} /></TableCell>
                      {!compact && <TableCell><Skeleton animation="wave"variant="text" width={40} /></TableCell>}
                    </TableRow>
                  ))
                : visibleData.map((schedule) => (
                    <TableRow
                      key={schedule.id}
                      sx={{
                        '&:hover': { bgcolor: c.bgPrimaryHover },
                        cursor: 'pointer'
                      }}
                    >
                  <TableCell sx={{ py: compact ? 1 : undefined }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        fontFamily: 'monospace',
                        fontSize: compact ? '0.813rem' : undefined
                      }}
                    >
                      {schedule.id}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: compact ? 1 : undefined }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        fontSize: compact ? '0.813rem' : undefined
                      }}
                    >
                      {schedule.title}
                      {compact && ` - ${schedule.description}`}
                    </Typography>
                    {!compact && (
                      <Typography variant="caption" color="text.secondary">
                        {schedule.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: compact ? 1 : undefined }}>
                    <Typography variant="body2" sx={{ fontSize: compact ? '0.813rem' : undefined }}>
                      {schedule.building}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: compact ? 1 : undefined }}>
                    <Chip
                      label={schedule.frequency}
                      size="small"
                      sx={{
                        bgcolor: frequencyColors[schedule.frequency],
                        color: 'text.primary',
                        fontWeight: 500,
                        fontSize: compact ? '0.7rem' : '0.75rem',
                        border: 1,
                        borderColor: 'divider'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: compact ? 1 : undefined }}>
                    <Chip
                      label={schedule.priority}
                      size="small"
                      sx={{
                        bgcolor: priorityColors[schedule.priority],
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: compact ? '0.7rem' : '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: compact ? 1 : undefined }}>
                    <Chip
                      label={schedule.status}
                      size="small"
                      sx={{
                        bgcolor: statusColors[schedule.status],
                        color: '#fff',
                        fontWeight: 500,
                        fontSize: compact ? '0.7rem' : '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: compact ? 1 : undefined }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        fontSize: compact ? '0.813rem' : undefined
                      }}
                    >
                      {schedule.nextDue}
                    </Typography>
                    {!compact && schedule.lastCompleted && (
                      <Typography variant="caption" color="text.secondary">
                        Last: {schedule.lastCompleted}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: compact ? 1 : undefined }}>
                    <Typography variant="body2" sx={{ fontSize: compact ? '0.813rem' : undefined }}>
                      {schedule.assignedTo}
                    </Typography>
                    {!compact && (
                      <Typography variant="caption" color="text.secondary">
                        {schedule.category}
                      </Typography>
                    )}
                  </TableCell>
                  {!compact && (
                    <TableCell>
                      <Typography variant="body2">{schedule.estimatedDuration}h</Typography>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </InfiniteScrollContainer>
    </Box>
  );
}
