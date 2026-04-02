'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { PieChart } from '@mui/x-charts/PieChart';
import GridCard from './GridCard';

export type TicketStatus = 'Received' | 'In operation' | 'Function restored' | 'Completed' | 'Invoiced' | 'To approve';

export interface StatusCount {
  status: TicketStatus;
  count: number;
  color: string;
}

interface TicketStatusOverviewCardProps {
  statusCounts: StatusCount[];
  onStatusFilter?: (status: string) => void;
}

export default function TicketStatusOverviewCard({ statusCounts, onStatusFilter }: TicketStatusOverviewCardProps) {
  const total = statusCounts.reduce((sum, s) => sum + s.count, 0);

  return (
    <GridCard title="Status Overview">
      <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <PieChart
          data-annotation-id="ticketsperformancepage-grafiek"
          series={[{
            data: statusCounts.map((s, i) => ({ id: i, value: s.count, label: s.status, color: s.color })),
            innerRadius: 46,
            outerRadius: 70,
            paddingAngle: 2,
            cornerRadius: 3,
          }]}
          width={180}
          height={160}
          hideLegend
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
        />
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
          <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1 }}>{total}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>total</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
        {statusCounts.map(s => (
          <Box
            key={s.status}
            onClick={() => onStatusFilter?.(s.status)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              px: 1, py: 0.5, mx: -1, borderRadius: 0.5,
              cursor: 'pointer', transition: 'background-color 0.15s ease',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <FiberManualRecordIcon sx={{ fontSize: 8, color: s.color }} />
            <Typography variant="caption" sx={{ flex: 1, fontSize: '0.75rem' }}>{s.status}</Typography>
            <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>{s.count}</Typography>
          </Box>
        ))}
      </Box>
    </GridCard>
  );
}
