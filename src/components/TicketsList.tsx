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
import { useThemeMode } from '@/theme-mode-context';
import { Ticket } from '@/data/tickets';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import InfiniteScrollContainer from './InfiniteScrollContainer';

interface TicketsListProps {
  tickets: Ticket[];
  buildingName?: string;
  compact?: boolean;
}

const priorityColors = {
  Low: '#4caf50',
  Medium: '#ff9800',
  High: '#ff5722',
  Critical: '#d32f2f'
};

const statusColors: Record<string, string> = {
  'Received': '#2196f3',
  'In progress': '#ff9800',
  'Function restored': '#66bb6a',
  'Completed': '#4caf50',
  'Priced out': '#ab47bc',
};

export default function TicketsList({ tickets, buildingName, compact = false }: TicketsListProps) {
  const { themeColors: c } = useThemeMode();
  const filteredTickets = useMemo(() => {
    return buildingName
      ? tickets.filter(t => t.building === buildingName)
      : tickets;
  }, [tickets, buildingName]);

  const { visibleData, hasMore, loadMore, isLoading, initialLoading } = useInfiniteScroll({
    data: filteredTickets,
    pageSize: 50
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Tickets {buildingName && `- ${buildingName}`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Showing {visibleData.length} of {filteredTickets.length} items
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
          <Table data-annotation-id="ticketslist-tabel">
            <TableHead>
              <TableRow sx={{ bgcolor: compact ? 'transparent' : c.bgSecondary }}>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Building</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Status</TableCell>
                {!compact && <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>}
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Assigned To</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Due Date</TableCell>
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
                      <TableCell sx={{ py: compact ? 1 : undefined }}><Skeleton animation="wave"variant="rounded" width={60} height={20} sx={{ borderRadius: '16px' }} /></TableCell>
                      <TableCell sx={{ py: compact ? 1 : undefined }}><Skeleton animation="wave"variant="rounded" width={80} height={20} sx={{ borderRadius: '16px' }} /></TableCell>
                      {!compact && <TableCell><Skeleton animation="wave"variant="text" width={90} /></TableCell>}
                      <TableCell sx={{ py: compact ? 1 : undefined }}><Skeleton animation="wave"variant="text" width={100} /></TableCell>
                      <TableCell sx={{ py: compact ? 1 : undefined }}><Skeleton animation="wave"variant="text" width={80} /></TableCell>
                    </TableRow>
                  ))
                : visibleData.map((order) => (
                    <TableRow
                      key={order.id}
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
                          {order.id}
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
                          {order.title}
                          {compact && ` - ${order.description}`}
                        </Typography>
                        {!compact && (
                          <Typography variant="caption" color="text.secondary">
                            {order.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: compact ? 1 : undefined }}>
                        <Typography variant="body2" sx={{ fontSize: compact ? '0.813rem' : undefined }}>
                          {order.building}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: compact ? 1 : undefined }}>
                        <Chip
                          label={order.priority}
                          size="small"
                          sx={{
                            bgcolor: priorityColors[order.priority],
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: compact ? '0.7rem' : '0.75rem'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: compact ? 1 : undefined }}>
                        <Chip
                          label={order.status}
                          size="small"
                          sx={{
                            bgcolor: statusColors[order.status],
                            color: '#fff',
                            fontWeight: 500,
                            fontSize: compact ? '0.7rem' : '0.75rem'
                          }}
                        />
                      </TableCell>
                      {!compact && (
                        <TableCell>
                          <Typography variant="body2">{order.category}</Typography>
                        </TableCell>
                      )}
                      <TableCell sx={{ py: compact ? 1 : undefined }}>
                        <Typography variant="body2" sx={{ fontSize: compact ? '0.813rem' : undefined }}>
                          {order.assignedTo}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: compact ? 1 : undefined }}>
                        <Typography variant="body2" sx={{ fontSize: compact ? '0.813rem' : undefined }}>
                          {order.dueDate}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      </InfiniteScrollContainer>
    </Box>
  );
}
