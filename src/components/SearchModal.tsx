import React, { useState, useCallback, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import BusinessIcon from '@mui/icons-material/Business';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import DescriptionIcon from '@mui/icons-material/Description';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (page: string, dashboardId?: string) => void;
}

interface SearchResult {
  id: string;
  type: 'building' | 'asset' | 'document' | 'ticket' | 'quotation' | 'dashboard';
  title: string;
  subtitle?: string;
  date?: string;
  owner?: string;
  image?: string;
}

interface RecentItem extends SearchResult {
  searchedAt: Date;
}

const typeIcons: Record<string, React.ReactNode> = {
  building: <BusinessIcon sx={{ fontSize: 18 }} />,
  asset: <PrecisionManufacturingIcon sx={{ fontSize: 18 }} />,
  document: <DescriptionIcon sx={{ fontSize: 18 }} />,
  ticket: <ConfirmationNumberIcon sx={{ fontSize: 18 }} />,
  quotation: <RequestQuoteIcon sx={{ fontSize: 18 }} />,
  dashboard: <DashboardOutlinedIcon sx={{ fontSize: 18 }} />,
};

const mockResults: SearchResult[] = [
  { id: '1', type: 'building', title: '12 Smith St', subtitle: 'Amsterdam, NL', date: '2024-12-01', owner: 'Jan de Vries', image: '/images/Media-1.png' },
  { id: '2', type: 'asset', title: 'AHU-01 Air Handling Unit', subtitle: '12 Smith St - Floor 3', date: '2025-01-15', owner: 'Pieter Bakker' },
  { id: '3', type: 'document', title: 'Mechanical O&M Manual', subtitle: '12 Smith St - ABC123-CARE-001', date: '2025-02-10', owner: 'Sarah Jansen' },
  { id: '4', type: 'ticket', title: 'HVAC noise complaint - Room 302', subtitle: '12 Smith St - Priority: High', date: '2025-03-01', owner: 'Jan de Vries' },
  { id: '5', type: 'quotation', title: 'Q-2025-0042 Chiller Replacement', subtitle: '12 Smith St - EUR 24,500', date: '2025-02-28', owner: 'Pieter Bakker' },
  { id: '6', type: 'building', title: '45 Keizersgracht', subtitle: 'Amsterdam, NL', date: '2024-11-20', owner: 'Sarah Jansen', image: '/images/Media-3.png' },
  // Sustainability dashboards
  { id: 'd1', type: 'dashboard', title: 'Gebouwtrend', subtitle: 'Sustainability', date: '2025-03-08', owner: 'Jan de Vries' },
  { id: 'd2', type: 'dashboard', title: 'Energieverbruik per gebouw', subtitle: 'Sustainability', date: '2025-03-05', owner: 'Jan de Vries' },
  { id: 'd3', type: 'dashboard', title: 'Totaalverbruik en -opwekking', subtitle: 'Sustainability', date: '2025-02-28', owner: 'Pieter Bakker' },
  { id: 'd4', type: 'dashboard', title: 'Kosten en CO₂', subtitle: 'Sustainability', date: '2025-02-25', owner: 'Sarah Jansen' },
  { id: 'd5', type: 'dashboard', title: 'Week- en dagprofielen', subtitle: 'Sustainability', date: '2025-02-20', owner: 'Jan de Vries' },
  { id: 'd6', type: 'dashboard', title: 'Prognose en doelstelling', subtitle: 'Sustainability', date: '2025-02-15', owner: 'Pieter Bakker' },
  { id: 'd7', type: 'dashboard', title: 'Metertrend', subtitle: 'Sustainability', date: '2025-02-12', owner: 'Sarah Jansen' },
  { id: 'd8', type: 'dashboard', title: 'Energie vs buitentemperatuur', subtitle: 'Sustainability', date: '2025-02-10', owner: 'Jan de Vries' },
  // Comfort dashboards
  { id: 'd9', type: 'dashboard', title: 'Comfort gebouwoverzicht', subtitle: 'Comfort', date: '2025-03-06', owner: 'Sarah Jansen' },
  { id: 'd10', type: 'dashboard', title: 'Comforttrend', subtitle: 'Comfort', date: '2025-03-03', owner: 'Jan de Vries' },
  { id: 'd11', type: 'dashboard', title: 'Adaptieve temperatuurgrenzen', subtitle: 'Comfort', date: '2025-02-22', owner: 'Pieter Bakker' },
  { id: 'd12', type: 'dashboard', title: 'Frisse Scholen', subtitle: 'Comfort', date: '2025-02-18', owner: 'Jan de Vries' },
  { id: 'd13', type: 'dashboard', title: 'Instellingniveau overzicht', subtitle: 'Comfort', date: '2025-02-14', owner: 'Sarah Jansen' },
  { id: 'd14', type: 'dashboard', title: 'KPI Comfortniveaus', subtitle: 'Comfort', date: '2025-02-08', owner: 'Pieter Bakker' },
  { id: 'd15', type: 'dashboard', title: 'Luchtkwaliteit', subtitle: 'Comfort', date: '2025-02-05', owner: 'Jan de Vries' },
  { id: 'd16', type: 'dashboard', title: 'KPI Comfortniveaus Ruimtetemperaturen', subtitle: 'Comfort', date: '2025-01-30', owner: 'Sarah Jansen' },
  // Asset Monitoring dashboards
  { id: 'd17', type: 'dashboard', title: 'Locatieniveau overzicht', subtitle: 'Asset Monitoring', date: '2025-03-04', owner: 'Pieter Bakker' },
  { id: 'd18', type: 'dashboard', title: 'Workspace Pilot', subtitle: 'Asset Monitoring', date: '2025-02-26', owner: 'Jan de Vries' },
  { id: 'd19', type: 'dashboard', title: 'Asset trend', subtitle: 'Asset Monitoring', date: '2025-02-20', owner: 'Sarah Jansen' },
  { id: 'd20', type: 'dashboard', title: 'Warmte- koudeopslag (WKO)', subtitle: 'Asset Monitoring', date: '2025-02-16', owner: 'Pieter Bakker' },
  // Workspace dashboards
  { id: 'd21', type: 'dashboard', title: 'Overzicht benutting', subtitle: 'Workspace', date: '2025-03-02', owner: 'Sarah Jansen' },
  // Other dashboards
  { id: 'd22', type: 'dashboard', title: 'Bijwerkdatum Meetdata', subtitle: 'Other', date: '2025-03-01', owner: 'Jan de Vries' },
  { id: 'd23', type: 'dashboard', title: 'CO₂-reductie', subtitle: 'Other', date: '2025-02-24', owner: 'Pieter Bakker' },
  { id: 'd24', type: 'dashboard', title: 'KPI CO₂-uitstoot', subtitle: 'Other', date: '2025-02-19', owner: 'Sarah Jansen' },
  { id: 'd25', type: 'dashboard', title: 'KPI Gasverbruik per jaar', subtitle: 'Other', date: '2025-02-13', owner: 'Jan de Vries' },
  { id: 'd26', type: 'dashboard', title: 'KPI Gasverbruik per maand', subtitle: 'Other', date: '2025-02-07', owner: 'Pieter Bakker' },
  { id: 'd27', type: 'dashboard', title: 'Max Vermogen Check', subtitle: 'Other', date: '2025-02-02', owner: 'Sarah Jansen' },
  { id: 'd28', type: 'dashboard', title: 'Stroomtangen', subtitle: 'Other', date: '2025-01-28', owner: 'Jan de Vries' },
];

function createInitialRecentItems(): RecentItem[] {
  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
  return [
    { id: 'r1', type: 'building', title: '12 Smith St', subtitle: 'Amsterdam, NL', image: '/images/Media-1.png', searchedAt: hoursAgo(1) },
    { id: 'r2', type: 'ticket', title: 'HVAC noise complaint - Room 302', subtitle: '12 Smith St - Priority: High', searchedAt: hoursAgo(3) },
    { id: 'r3', type: 'asset', title: 'AHU-01 Air Handling Unit', subtitle: '12 Smith St - Floor 3', searchedAt: daysAgo(1) },
    { id: 'r4', type: 'document', title: 'Electrical Safety Procedures', subtitle: '45 Keizersgracht - REF-2025-011', searchedAt: daysAgo(1) },
    { id: 'r5', type: 'quotation', title: 'Q-2025-0042 Chiller Replacement', subtitle: '12 Smith St - EUR 24,500', searchedAt: daysAgo(3) },
    { id: 'r8', type: 'dashboard', title: 'Energieverbruik per gebouw', subtitle: 'Sustainability', searchedAt: daysAgo(2) },
    { id: 'r6', type: 'building', title: '45 Keizersgracht', subtitle: 'Amsterdam, NL', image: '/images/Media-3.png', searchedAt: daysAgo(5) },
    { id: 'r7', type: 'document', title: 'Mechanical O&M Manual', subtitle: '12 Smith St - ABC123-CARE-001', searchedAt: daysAgo(8) },
  ];
}

function getRelativeGroup(date: Date, now?: Date): string {
  const ref = now || new Date();
  const diffMs = ref.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return 'Past week';
  return 'Older';
}

function groupByDate(items: RecentItem[]): { label: string; items: RecentItem[] }[] {
  const groups: Map<string, RecentItem[]> = new Map();
  for (const item of items) {
    const label = getRelativeGroup(item.searchedAt);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(item);
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

const rowSx = (active?: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  mx: 1,
  px: 1.5,
  py: 1.25,
  borderRadius: 1,
  cursor: 'pointer',
  bgcolor: active ? '#f5f5f5' : 'transparent',
  '&:hover': { bgcolor: '#f5f5f5' },
});

const PREVIEW_WIDTH = 400;

const kbdSx = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 20,
  height: 20,
  px: 0.5,
  fontSize: '0.625rem',
  fontFamily: 'inherit',
  fontWeight: 600,
  color: 'text.secondary',
  bgcolor: '#fff',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '4px',
  lineHeight: 1,
};

const typeLabels: Record<string, string> = {
  building: 'Building',
  asset: 'Asset',
  document: 'Document',
  ticket: 'Ticket',
  quotation: 'Quotation',
  dashboard: 'Dashboard',
};

function ResultRow({ result, onClick, active, rowRef, onMouseEnter }: { result: SearchResult; onClick: () => void; active?: boolean; rowRef?: React.Ref<HTMLDivElement>; onMouseEnter?: () => void }) {
  return (
    <Box ref={rowRef} onClick={onClick} onMouseEnter={onMouseEnter} sx={rowSx(active)}>
      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.disabled' }}>
        {typeIcons[result.type]}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 550, lineHeight: 1.2, flexShrink: 0 }} noWrap>
          {result.title}
        </Typography>
        {result.subtitle && (
          <Typography variant="caption" sx={{ color: 'text.disabled', lineHeight: 1.2, minWidth: 0 }} noWrap>
            {result.subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function PerformanceBar({ green, yellow, red }: { green: number; yellow: number; red: number }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Overall Performance
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {green}%
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', height: 6, borderRadius: '2px', overflow: 'hidden', bgcolor: '#f5f5f5' }}>
        <Box sx={{ width: `${green}%`, bgcolor: '#4caf50' }} />
        <Box sx={{ width: `${yellow}%`, bgcolor: '#ffc107' }} />
        <Box sx={{ width: `${red}%`, bgcolor: '#f44336' }} />
      </Box>
    </Box>
  );
}

// Mock performance data for buildings
const buildingPerformance: Record<string, { green: number; yellow: number; red: number }> = {
  '12 Smith St': { green: 65, yellow: 20, red: 15 },
  '45 Keizersgracht': { green: 55, yellow: 30, red: 15 },
};

function BuildingPreviewCard({ result }: { result: SearchResult }) {
  const performance = buildingPerformance[result.title] ?? { green: 60, yellow: 25, red: 15 };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          height: 80,
          backgroundImage: result.image ? `url(${result.image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          bgcolor: result.image ? undefined : '#e0e0e0',
        }}
      />
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ color: 'text.disabled' }}>{typeIcons.building}</Box>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Building
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
          {result.title}
        </Typography>
        {result.subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {result.subtitle}
          </Typography>
        )}
        <PerformanceBar {...performance} />
      </Box>
    </Box>
  );
}

// Map dashboard titles to DashboardsPage IDs
const dashboardIdMap: Record<string, string> = {
  'Gebouwtrend': 'gebouwtrend',
  'Energieverbruik per gebouw': 'energieverbruik_per_gebouw',
  'Totaalverbruik en -opwekking': 'totaalverbruik_opwekking',
  'Kosten en CO\u2082': 'kosten_co2',
  'Week- en dagprofielen': 'week_dagprofielen',
  'Prognose en doelstelling': 'prognose_doelstelling',
  'Metertrend': 'metertrend',
  'Energie vs buitentemperatuur': 'energie_buitentemperatuur',
  'Comfort gebouwoverzicht': 'comfort_gebouwoverzicht',
  'Comforttrend': 'comforttrend',
  'Adaptieve temperatuurgrenzen': 'adaptieve_temperatuurgrenzen',
  'Frisse Scholen': 'frisse_scholen',
  'Instellingniveau overzicht': 'instellingniveau_overzicht',
  'KPI Comfortniveaus': 'kpi_comfortniveaus_luchtkwaliteit',
  'Luchtkwaliteit': 'kpi_comfortniveaus_luchtkwaliteit',
  'KPI Comfortniveaus Ruimtetemperaturen': 'kpi_comfortniveaus_ruimtetemperaturen',
  'Locatieniveau overzicht': 'locatieniveau_overzicht',
  'Workspace Pilot': 'workspace_pilot',
  'Asset trend': 'asset_trend',
  'Warmte- koudeopslag (WKO)': 'warmte_koudeopslag',
  'Overzicht benutting': 'overzicht_benutting',
  'Bijwerkdatum Meetdata': 'bijwerkdatum_meetdata',
  'CO\u2082-reductie': 'co2_reductie',
  'KPI CO\u2082-uitstoot': 'kpi_co2_uitstoot',
  'KPI Gasverbruik per jaar': 'kpi_gasverbruik_jaar',
  'KPI Gasverbruik per maand': 'kpi_gasverbruik_maand',
  'Max Vermogen Check': 'max_vermogen_check',
  'Stroomtangen': 'stroomtangen',
};

// Mini sparkline data per dashboard (single sparkline each)
const dashboardSparklines: Record<string, { data: number[]; color: string }> = {
  // Sustainability
  'Gebouwtrend': { data: [72, 74, 71, 76, 78, 75, 80, 77, 82, 79, 81, 83], color: '#4caf50' },
  'Energieverbruik per gebouw': { data: [42, 38, 45, 52, 48, 55, 50, 47, 53, 49, 44, 41], color: '#1976d2' },
  'Totaalverbruik en -opwekking': { data: [120, 115, 130, 125, 140, 135, 128, 142, 138, 145, 132, 127], color: '#f44336' },
  'Kosten en CO₂': { data: [8500, 8200, 9100, 8800, 9500, 9200, 8700, 9300, 8900, 9600, 9000, 8600], color: '#ff9800' },
  'Week- en dagprofielen': { data: [35, 55, 80, 95, 90, 85, 75, 70, 82, 88, 60, 40], color: '#1976d2' },
  'Prognose en doelstelling': { data: [92, 88, 95, 90, 87, 93, 96, 91, 89, 94, 97, 95], color: '#4caf50' },
  'Metertrend': { data: [310, 295, 320, 305, 335, 315, 300, 325, 310, 340, 320, 308], color: '#1976d2' },
  'Energie vs buitentemperatuur': { data: [180, 160, 140, 110, 80, 55, 45, 50, 75, 120, 155, 175], color: '#1976d2' },
  // Comfort
  'Comfort gebouwoverzicht': { data: [21, 21.5, 22, 22.5, 23, 22.8, 22, 21.5, 22, 22.2, 21.8, 22.1], color: '#4caf50' },
  'Comforttrend': { data: [78, 80, 76, 82, 85, 83, 79, 81, 84, 82, 80, 83], color: '#4caf50' },
  'Adaptieve temperatuurgrenzen': { data: [20, 20.5, 21, 22, 23, 24, 24.5, 24, 23, 21.5, 20.5, 20], color: '#ff9800' },
  'Frisse Scholen': { data: [680, 720, 850, 920, 780, 650, 600, 710, 830, 900, 760, 690], color: '#2196f3' },
  'Instellingniveau overzicht': { data: [88, 90, 87, 92, 91, 89, 93, 90, 94, 92, 91, 93], color: '#4caf50' },
  'KPI Comfortniveaus': { data: [75, 78, 74, 80, 82, 79, 77, 81, 83, 80, 78, 82], color: '#1976d2' },
  'Luchtkwaliteit': { data: [520, 480, 550, 610, 490, 460, 500, 540, 580, 510, 470, 495], color: '#2196f3' },
  'KPI Comfortniveaus Ruimtetemperaturen': { data: [21.2, 21.5, 22, 22.3, 22.8, 22.5, 22, 21.8, 22.1, 22.4, 21.9, 22.2], color: '#ff9800' },
  // Asset Monitoring
  'Locatieniveau overzicht': { data: [88, 90, 87, 92, 94, 91, 93, 95, 92, 96, 94, 95], color: '#4caf50' },
  'Workspace Pilot': { data: [45, 52, 48, 55, 60, 58, 62, 57, 65, 63, 60, 64], color: '#1976d2' },
  'Asset trend': { data: [85, 82, 88, 86, 90, 87, 84, 89, 91, 88, 86, 90], color: '#4caf50' },
  'Warmte- koudeopslag (WKO)': { data: [12, 11, 14, 13, 10, 12, 15, 11, 13, 14, 12, 10], color: '#1976d2' },
  // Workspace
  'Overzicht benutting': { data: [62, 58, 70, 75, 68, 72, 65, 78, 74, 80, 71, 76], color: '#9c27b0' },
  // Other
  'Bijwerkdatum Meetdata': { data: [95, 92, 97, 94, 98, 96, 93, 97, 95, 99, 96, 98], color: '#4caf50' },
  'CO₂-reductie': { data: [42, 40, 38, 36, 35, 33, 31, 30, 28, 27, 25, 24], color: '#4caf50' },
  'KPI CO₂-uitstoot': { data: [48, 45, 50, 47, 44, 42, 46, 43, 41, 39, 42, 40], color: '#f44336' },
  'KPI Gasverbruik per jaar': { data: [180, 175, 168, 160, 155, 150, 148, 145, 140, 138, 135, 132], color: '#ff9800' },
  'KPI Gasverbruik per maand': { data: [28, 25, 20, 15, 10, 8, 7, 8, 12, 18, 24, 27], color: '#ff9800' },
  'Max Vermogen Check': { data: [85, 92, 88, 95, 90, 87, 93, 89, 96, 91, 88, 94], color: '#f44336' },
  'Stroomtangen': { data: [220, 215, 230, 225, 240, 235, 228, 242, 238, 245, 232, 227], color: '#1976d2' },
};

function MiniSparkline({ data, color, width = 140, height = 32 }: { data: number[]; color: string; width?: number; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashboardPreviewCard({ result }: { result: SearchResult }) {
  const sparkline = dashboardSparklines[result.title] ?? { data: [50, 55, 52, 58, 60, 57, 62, 59, 64, 61, 63, 65], color: '#1976d2' };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flex: 1, px: 2.5, pt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MiniSparkline data={sparkline.data} color={sparkline.color} width={340} height={120} />
      </Box>
      <Box sx={{ px: 2.5, pb: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
          {result.title}
        </Typography>
        {result.subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {result.subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function AISearchPreviewCard({ query }: { query: string }) {
  return (
    <Box sx={{ bgcolor: '#f8f8f8', height: '100%', display: 'flex', flexDirection: 'column', p: 2.5, gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <AutoAwesomeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          AI Search
        </Typography>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* User message */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box sx={{ bgcolor: '#1976d2', color: '#fff', px: 2, py: 1, borderRadius: '12px 12px 4px 12px', maxWidth: '85%' }}>
            <Typography variant="body2" sx={{ fontSize: '0.813rem' }}>
              {query}
            </Typography>
          </Box>
        </Box>
        {/* AI thinking */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Box sx={{ bgcolor: '#fff', px: 2, py: 1, borderRadius: '12px 12px 12px 4px', maxWidth: '85%' }}>
            <Typography variant="body2" sx={{ fontSize: '0.813rem', color: 'text.secondary' }}>
              ...
            </Typography>
          </Box>
        </Box>
      </Box>
      <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center' }}>
        Press Enter to search with AI
      </Typography>
    </Box>
  );
}

function PreviewCard({ result }: { result: SearchResult }) {
  if (result.type === 'building') return <BuildingPreviewCard result={result} />;
  if (result.type === 'dashboard') return <DashboardPreviewCard result={result} />;
  return (
    <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ color: 'text.disabled' }}>{typeIcons[result.type]}</Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
          {typeLabels[result.type]}
        </Typography>
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
        {result.title}
      </Typography>
      {result.subtitle && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {result.subtitle}
        </Typography>
      )}
      <Divider />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {result.owner && (
          <Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>Owner</Typography>
            <Typography variant="body2">{result.owner}</Typography>
          </Box>
        )}
        {result.date && (
          <Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>Date</Typography>
            <Typography variant="body2">{result.date}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function PreviewSkeleton() {
  return (
    <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Skeleton variant="circular" width={18} height={18} />
        <Skeleton width={60} height={16} />
      </Box>
      <Skeleton width="80%" height={24} />
      <Skeleton width="60%" height={16} />
      <Divider />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box>
          <Skeleton width={40} height={14} />
          <Skeleton width={100} height={18} />
        </Box>
        <Box>
          <Skeleton width={30} height={14} />
          <Skeleton width={80} height={18} />
        </Box>
      </Box>
    </Box>
  );
}

export default function SearchModal({ open, onClose, onNavigate }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('any');
  const [filterOwner, setFilterOwner] = useState<string>('all');
  const [recentItems, setRecentItems] = useState<RecentItem[]>(createInitialRecentItems);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hoveredResultIndex, setHoveredResultIndex] = useState<number | null>(null);
  const activeRowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // Small delay to ensure the modal has rendered before focusing
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const isSearching = searchQuery.trim().length > 0;

  const filteredResults = mockResults.filter((result) => {
    const matchesQuery = !searchQuery || result.title.toLowerCase().includes(searchQuery.toLowerCase()) || result.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || result.type === filterType;
    const matchesOwner = filterOwner === 'all' || result.owner === filterOwner;
    return matchesQuery && matchesType && matchesOwner;
  });

  // Determine which result to show in the preview panel
  const isAICardActive = isSearching && activeIndex === 0 && hoveredResultIndex === null;
  const previewResult: SearchResult | null = (() => {
    if (hoveredResultIndex !== null) {
      return (isSearching ? filteredResults : recentItems)[hoveredResultIndex] ?? null;
    }
    if (isSearching) {
      return activeIndex > 0 ? filteredResults[activeIndex - 1] ?? null : null;
    }
    return activeIndex >= 0 ? recentItems[activeIndex] ?? null : null;
  })();

  // Flat list of visible items for keyboard navigation
  const visibleItems: SearchResult[] = isSearching
    ? filteredResults
    : recentItems;

  // The AI card counts as index 0 when searching; result rows start at 1
  // When not searching, recent items start at index 0
  const totalNavigableItems = isSearching
    ? 1 + filteredResults.length // AI card + results
    : recentItems.length;

  // Always focus the first logical item:
  // - Searching with results: first search result (index 1, after AI card)
  // - Searching empty: AI card (index 0)
  // - Not searching: first recent item (index 0)
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setActiveIndex(filteredResults.length > 0 ? 1 : 0);
    } else {
      setActiveIndex(recentItems.length > 0 ? 0 : -1);
    }
    setHoveredResultIndex(null);
  }, [searchQuery, filterType, filterDate, filterOwner, filteredResults.length, recentItems.length]);

  // Scroll active row into view
  useEffect(() => {
    if (activeIndex >= 0 && activeRowRef.current) {
      activeRowRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const count = totalNavigableItems;
    if (count === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < count - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : count - 1));
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : count - 1));
      } else {
        setActiveIndex((prev) => (prev < count - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      if (isSearching && activeIndex === 0) {
        // AI search card selected — handle AI action
      } else if (isSearching) {
        handleResultClick(filteredResults[activeIndex - 1]);
      } else {
        handleResultClick(visibleItems[activeIndex]);
      }
    }
  }, [totalNavigableItems, activeIndex, isSearching, filteredResults, visibleItems]);

  const uniqueOwners = Array.from(new Set(mockResults.map((r) => r.owner).filter(Boolean))) as string[];

  const hasActiveFilters = filterType !== 'all' || filterDate !== 'any' || filterOwner !== 'all';

  const clearFilters = () => {
    setFilterType('all');
    setFilterDate('any');
    setFilterOwner('all');
  };

  const handleResultClick = (result: SearchResult) => {
    setRecentItems((prev) => {
      const filtered = prev.filter((r) => r.id !== result.id);
      return [{ ...result, searchedAt: new Date() }, ...filtered];
    });
    if (result.type === 'dashboard') {
      onNavigate?.('dashboards', dashboardIdMap[result.title]);
    }
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setShowFilters(false);
    setFilterType('all');
    setFilterDate('any');
    setFilterOwner('all');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pt: 10,
        zIndex: 1500,
      }}
      slotProps={{
        backdrop: {
          sx: { bgcolor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' },
        },
      }}
    >
      <Paper
        sx={{
          width: '90%',
          maxWidth: 440 + PREVIEW_WIDTH + 96,
          minHeight: 560,
          maxHeight: '75vh',
          outline: 'none',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 16px 70px rgba(0,0,0,0.15)',
        }}
      >
        {/* Search input row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1,
            gap: 1,
          }}
        >
          <SearchIcon sx={{ color: 'text.disabled', fontSize: 22, ml: 0.5 }} />
          <InputBase
            fullWidth
            placeholder="Search or ask a question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
            autoFocus
            sx={{
              fontSize: '1.05rem',
              py: 0.75,
              '& input::placeholder': {
                color: '#999',
                opacity: 1,
              },
            }}
          />
          {isSearching && (
            <IconButton
              size="small"
              onClick={() => setSearchQuery('')}
              sx={{ color: 'text.disabled', '&:hover': { color: 'text.secondary' } }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={() => setShowFilters((v) => !v)}
            sx={{
              color: showFilters || hasActiveFilters ? 'primary.main' : 'text.secondary',
              bgcolor: showFilters || hasActiveFilters ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              '&:hover': { bgcolor: showFilters || hasActiveFilters ? 'rgba(25, 118, 210, 0.12)' : 'action.hover' },
            }}
          >
            <FilterListIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Filter row */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ overflow: 'hidden' }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2.5,
                  py: 1,
                }}
              >
                <FormControl size="small">
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    displayEmpty
                    variant="standard"
                    disableUnderline
                    sx={{
                      fontSize: '0.813rem',
                      borderRadius: 1,
                      ...(filterType !== 'all'
                        ? {
                            color: 'primary.main',
                            bgcolor: 'rgba(25, 118, 210, 0.08)',
                            '& .MuiSvgIcon-root': { color: 'primary.main' },
                          }
                        : {
                            color: 'text.secondary',
                          }),
                      '& .MuiSelect-select': { py: 0.5, px: 1.5 },
                    }}
                  >
                    <MenuItem value="all">All types</MenuItem>
                    <MenuItem value="building">Building</MenuItem>
                    <MenuItem value="asset">Asset</MenuItem>
                    <MenuItem value="document">Document</MenuItem>
                    <MenuItem value="ticket">Ticket</MenuItem>
                    <MenuItem value="quotation">Quotation</MenuItem>
                    <MenuItem value="dashboard">Dashboard</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <Select
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    displayEmpty
                    variant="standard"
                    disableUnderline
                    sx={{
                      fontSize: '0.813rem',
                      borderRadius: 1,
                      ...(filterDate !== 'any'
                        ? {
                            color: 'primary.main',
                            bgcolor: 'rgba(25, 118, 210, 0.08)',
                            '& .MuiSvgIcon-root': { color: 'primary.main' },
                          }
                        : {
                            color: 'text.secondary',
                          }),
                      '& .MuiSelect-select': { py: 0.5, px: 1.5 },
                    }}
                  >
                    <MenuItem value="any">Any date</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="week">Past week</MenuItem>
                    <MenuItem value="month">Past month</MenuItem>
                    <MenuItem value="year">Past year</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <Select
                    value={filterOwner}
                    onChange={(e) => setFilterOwner(e.target.value)}
                    displayEmpty
                    variant="standard"
                    disableUnderline
                    sx={{
                      fontSize: '0.813rem',
                      borderRadius: 1,
                      ...(filterOwner !== 'all'
                        ? {
                            color: 'primary.main',
                            bgcolor: 'rgba(25, 118, 210, 0.08)',
                            '& .MuiSvgIcon-root': { color: 'primary.main' },
                          }
                        : {
                            color: 'text.secondary',
                          }),
                      '& .MuiSelect-select': { py: 0.5, px: 1.5 },
                    }}
                  >
                    <MenuItem value="all">All owners</MenuItem>
                    {uniqueOwners.map((owner) => (
                      <MenuItem key={owner} value={owner}>
                        {owner}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {hasActiveFilters && (
                  <Chip
                    label="Clear"
                    size="small"
                    onDelete={clearFilters}
                    onClick={clearFilters}
                    sx={{ fontSize: '0.75rem', height: 26 }}
                  />
                )}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results / Recent + Preview */}
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Box sx={{ flex: 1, overflowY: 'auto', pt: 0.5, pb: 2, pl: 2, minWidth: 0 }} onMouseLeave={() => setHoveredResultIndex(null)}>
          {isSearching ? (
            <>
              <Box
                ref={activeIndex === 0 ? activeRowRef : undefined}
                sx={{
                  ...rowSx(activeIndex === 0),
                  mt: 0.5,
                  py: 1.25,
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 550, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  Search everything with AI
                </Typography>
                <Typography variant="body2" noWrap sx={{ color: 'text.disabled', flex: 1, minWidth: 0 }}>
                  &ldquo;{searchQuery}&rdquo;
                </Typography>
              </Box>
              {filteredResults.length > 0 ? (
                <>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.disabled', px: 2.5, pt: 0.5, pb: 0.5, display: 'block', fontWeight: 600 }}
                  >
                    Search results
                  </Typography>
                  {filteredResults.map((result, i) => {
                    const idx = i + 1;
                    return (
                      <ResultRow
                        key={result.id}
                        result={result}
                        active={idx === activeIndex}
                        rowRef={idx === activeIndex ? activeRowRef : undefined}
                        onClick={() => handleResultClick(result)}
                        onMouseEnter={() => setHoveredResultIndex(i)}
                      />
                    );
                  })}
                </>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No results found
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            recentItems.length > 0 ? (
              (() => {
                let flatIndex = 0;
                return groupByDate(recentItems).map((group) => (
                  <Box key={group.label}>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.disabled', px: 2.5, pt: 1.5, pb: 0.5, display: 'block', fontWeight: 600 }}
                    >
                      {group.label}
                    </Typography>
                    {group.items.map((item) => {
                      const idx = flatIndex++;
                      const recentIdx = recentItems.indexOf(item);
                      return (
                        <ResultRow
                          key={item.id}
                          result={item}
                          active={idx === activeIndex}
                          rowRef={idx === activeIndex ? activeRowRef : undefined}
                          onClick={() => handleResultClick(item)}
                          onMouseEnter={() => setHoveredResultIndex(recentIdx)}
                        />
                      );
                    })}
                  </Box>
                ));
              })()
            ) : (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No recent searches
                </Typography>
              </Box>
            )
          )}
        </Box>

        {/* Preview panel */}
        <Box sx={{ width: PREVIEW_WIDTH, flexShrink: 0, p: 6, pl: 6 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'divider',
              height: 280,
              overflow: 'hidden',
            }}
          >
            {isAICardActive ? <AISearchPreviewCard query={searchQuery} /> : previewResult ? <PreviewCard result={previewResult} /> : <PreviewSkeleton />}
          </Paper>
        </Box>
        </Box>

        {/* Keyboard shortcuts bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            px: 2.5,
            py: 1.5,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: '#fafafa',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ display: 'flex', gap: 0.25 }}>
              <Box component="kbd" sx={kbdSx}>↑</Box>
              <Box component="kbd" sx={kbdSx}>↓</Box>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6875rem' }}>
              Navigate
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box component="kbd" sx={kbdSx}>↵</Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6875rem' }}>
              Open
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box component="kbd" sx={kbdSx}>Esc</Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6875rem' }}>
              Close
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
}
