import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useThemeMode } from '@/theme-mode-context';
import { Quotation, QuotationStatus } from '@/data/quotations';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import InfiniteScrollContainer from './InfiniteScrollContainer';

interface QuotationsListProps {
  quotations: Quotation[];
  buildingName?: string;
  compact?: boolean;
}

const statusColors: Record<QuotationStatus, string> = {
  Pending: '#ff9800',
  Open: '#2196f3',
  Received: '#4caf50',
  Assigned: '#7c4dff',
  Rejected: '#f44336',
};

export default function QuotationsList({ quotations, buildingName, compact = false }: QuotationsListProps) {
  const { themeColors: c } = useThemeMode();
  const filteredQuotations = useMemo(() => {
    return buildingName
      ? quotations.filter(q => q.building === buildingName)
      : quotations;
  }, [quotations, buildingName]);

  const { visibleData, hasMore, loadMore, isLoading, initialLoading } = useInfiniteScroll({
    data: filteredQuotations,
    pageSize: 50
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Quotations {buildingName && `- ${buildingName}`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Showing {visibleData.length} of {filteredQuotations.length} items
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
          <Table data-annotation-id="quotationslist-tabel">
            <TableHead>
              <TableRow sx={{ bgcolor: compact ? 'transparent' : c.bgSecondary }}>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Building</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Contact person</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Valid Until</TableCell>
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
                      <TableCell sx={{ py: compact ? 1 : undefined }}><Skeleton animation="wave"variant="text" width={100} /></TableCell>
                      <TableCell sx={{ py: compact ? 1 : undefined }}><Skeleton animation="wave"variant="text" width={70} /></TableCell>
                      <TableCell sx={{ py: compact ? 1 : undefined }}><Skeleton animation="wave"variant="rounded" width={70} height={22} sx={{ borderRadius: '6px' }} /></TableCell>
                      <TableCell sx={{ py: compact ? 1 : undefined }}><Skeleton animation="wave"variant="text" width={80} /></TableCell>
                    </TableRow>
                  ))
                : visibleData.map((quotation) => (
                <TableRow
                  key={quotation.id}
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
                      {quotation.id}
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
                      {quotation.title}
                      {compact && ` - ${quotation.description}`}
                    </Typography>
                    {!compact && (
                      <Typography variant="caption" color="text.secondary">
                        {quotation.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: compact ? 1 : undefined }}>
                    <Typography variant="body2" sx={{ fontSize: compact ? '0.813rem' : undefined }}>
                      {quotation.building}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: compact ? 1 : undefined }}>
                    <Typography variant="body2" sx={{ fontSize: compact ? '0.813rem' : undefined }}>
                      {quotation.contactPerson}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: compact ? 1 : undefined }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        fontSize: compact ? '0.813rem' : undefined
                      }}
                    >
                      {formatCurrency(quotation.amount, quotation.currency)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: compact ? 1 : undefined }}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.375, bgcolor: c.bgPrimaryHover, borderRadius: '6px' }}>
                      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: statusColors[quotation.status], flexShrink: 0 }} />
                      <Typography sx={{ fontSize: compact ? '0.7rem' : '0.75rem', fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap' }}>
                        {quotation.status}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: compact ? 1 : undefined }}>
                    <Typography variant="body2" sx={{ fontSize: compact ? '0.813rem' : undefined }}>
                      {quotation.validUntil}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </InfiniteScrollContainer>
    </Box>
  );
}
