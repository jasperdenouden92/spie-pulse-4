import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Quotation } from '@/data/quotations';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import InfiniteScrollContainer from './InfiniteScrollContainer';

interface QuotationsListProps {
  quotations: Quotation[];
  buildingName?: string;
  compact?: boolean;
}

const statusColors = {
  'Draft': '#9e9e9e',
  'Pending': '#ff9800',
  'Approved': '#4caf50',
  'Rejected': '#f44336',
  'Expired': '#757575'
};

export default function QuotationsList({ quotations, buildingName, compact = false }: QuotationsListProps) {
  const filteredQuotations = useMemo(() => {
    return buildingName
      ? quotations.filter(q => q.building === buildingName)
      : quotations;
  }, [quotations, buildingName]);

  const { visibleData, hasMore, loadMore, isLoading } = useInfiniteScroll({
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
            bgcolor: '#fff'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: compact ? 'transparent' : '#fafafa' }}>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Building</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Vendor</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Status</TableCell>
                {!compact && <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>}
                <TableCell sx={{ fontWeight: 600, py: compact ? 1 : undefined }}>Valid Until</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleData.map((quotation) => (
                <TableRow
                  key={quotation.id}
                  sx={{
                    '&:hover': { bgcolor: '#f5f5f5' },
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
                      {quotation.vendor}
                    </Typography>
                    {!compact && (
                      <Typography variant="caption" color="text.secondary">
                        by {quotation.requestedBy}
                      </Typography>
                    )}
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
                    <Chip
                      label={quotation.status}
                      size="small"
                      sx={{
                        bgcolor: statusColors[quotation.status],
                        color: '#fff',
                        fontWeight: 500,
                        fontSize: compact ? '0.7rem' : '0.75rem'
                      }}
                    />
                  </TableCell>
                  {!compact && (
                    <TableCell>
                      <Typography variant="body2">{quotation.category}</Typography>
                    </TableCell>
                  )}
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
