'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import { useThemeMode } from '@/theme-mode-context';
import AppTabs from '@/components/AppTabs';
import TicketsList from '@/components/TicketsList';
import QuotationsList from '@/components/QuotationsList';
import MaintenanceScheduleList from '@/components/MaintenanceScheduleList';
import { tickets } from '@/data/tickets';
import { quotations } from '@/data/quotations';
import { maintenanceSchedules } from '@/data/maintenance';

type Tab = 'documents' | 'tickets' | 'quotations' | 'maintenance';

const MOCK_DOCUMENTS = [
  { id: 'DOC-001', name: 'Service Level Agreement 2026', type: 'Contract', building: 'Skyline Plaza', updatedAt: '2026-03-15', status: 'Active' },
  { id: 'DOC-002', name: 'Preventive Maintenance Plan Q1', type: 'Plan', building: 'Heritage Building', updatedAt: '2026-03-10', status: 'Active' },
  { id: 'DOC-003', name: 'Fire Safety Inspection Report', type: 'Report', building: 'Velocity Center', updatedAt: '2026-03-08', status: 'Review' },
  { id: 'DOC-004', name: 'HVAC Maintenance Manual', type: 'Manual', building: 'All Buildings', updatedAt: '2026-02-28', status: 'Active' },
  { id: 'DOC-005', name: 'Emergency Evacuation Procedures', type: 'Procedure', building: 'All Buildings', updatedAt: '2026-02-20', status: 'Active' },
  { id: 'DOC-006', name: 'Elevator Inspection Certificate', type: 'Certificate', building: 'North Star', updatedAt: '2026-02-15', status: 'Expired' },
  { id: 'DOC-007', name: 'Waste Management Protocol', type: 'Procedure', building: 'Green Park Office', updatedAt: '2026-02-12', status: 'Active' },
  { id: 'DOC-008', name: 'Electrical Systems Audit', type: 'Report', building: 'Prism Complex', updatedAt: '2026-02-05', status: 'Review' },
];

const documentStatusColors: Record<string, string> = {
  Active: '#4caf50',
  Review: '#ff9800',
  Expired: '#f44336',
};

const documentTypeColors: Record<string, string> = {
  Contract: '#2196f3',
  Plan: '#9c27b0',
  Report: '#ff9800',
  Manual: '#607d8b',
  Procedure: '#4caf50',
  Certificate: '#00bcd4',
};

function DocumentsTab() {
  const { themeColors: c } = useThemeMode();
  return (
    <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: c.bgPrimary }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: c.bgSecondary }}>
            <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Document Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Building</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Last Updated</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {MOCK_DOCUMENTS.map((doc) => (
            <TableRow key={doc.id} sx={{ '&:hover': { bgcolor: c.bgPrimaryHover }, cursor: 'pointer' }}>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>{doc.id}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{doc.name}</Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={doc.type}
                  size="small"
                  sx={{ bgcolor: documentTypeColors[doc.type] ?? '#9e9e9e', color: '#fff', fontWeight: 500 }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">{doc.building}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{doc.updatedAt}</Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={doc.status}
                  size="small"
                  sx={{ bgcolor: documentStatusColors[doc.status] ?? '#9e9e9e', color: '#fff', fontWeight: 600 }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('documents');

  const tabs = [
    { value: 'documents', label: 'Documents', icon: <DescriptionOutlinedIcon sx={{ fontSize: 16 }} /> },
    { value: 'tickets', label: 'Tickets', icon: <ConfirmationNumberOutlinedIcon sx={{ fontSize: 16 }} /> },
    { value: 'quotations', label: 'Quotations', icon: <RequestQuoteOutlinedIcon sx={{ fontSize: 16 }} /> },
    { value: 'maintenance', label: 'Maintenance', icon: <EngineeringOutlinedIcon sx={{ fontSize: 16 }} /> },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '2rem', lineHeight: 1.3 }}>
          Operations
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <AppTabs
          value={activeTab}
          onChange={(v) => setActiveTab(v as Tab)}
          tabs={tabs}
          variant="underline"
        />
      </Box>

      {activeTab === 'documents' && <DocumentsTab />}
      {activeTab === 'tickets' && <TicketsList tickets={tickets} />}
      {activeTab === 'quotations' && <QuotationsList quotations={quotations} />}
      {activeTab === 'maintenance' && <MaintenanceScheduleList schedules={maintenanceSchedules} />}
    </Box>
  );
}
