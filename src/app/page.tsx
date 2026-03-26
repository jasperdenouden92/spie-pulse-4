"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import Checkbox from '@mui/material/Checkbox';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PageHeader from '@/components/PageHeader';
import BuildingCard, { TopicScore } from '@/components/BuildingCard';
import ClusterCard from '@/components/ClusterCard';
import ThermostatOutlinedIcon from '@mui/icons-material/ThermostatOutlined';
import AirOutlinedIcon from '@mui/icons-material/AirOutlined';
import KPICard, { PerformanceRating } from '@/components/KPICard';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AnimatedNumber from '@/components/AnimatedNumber';
import NatureOutlinedIcon from '@mui/icons-material/NatureOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import SortOutlinedIcon from '@mui/icons-material/SortOutlined';
import AppTabs from '@/components/AppTabs';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import { overallMetrics, themeMetrics, expandedThemeMetrics, operationsMetrics, getMetricsForPeriod, applyContractVariation, CONTRACT_HIDDEN_THEME_KEYS, CONTRACT_HIDDEN_OPERATIONS_KEYS } from '@/data/metrics';
import { sortBuildingsByMetric, sortBuildingsByTrend, Building, MetricKeys, buildings as allBuildings } from '@/data/buildings';
import { motion, AnimatePresence } from 'framer-motion';
import TicketsList from '@/components/TicketsList';
import QuotationsList from '@/components/QuotationsList';
import MaintenanceScheduleList from '@/components/MaintenanceScheduleList';
import FloatingToolbar from '@/components/FloatingToolbar';
import AssetDetail from '@/components/AssetDetail';
import ExportsPage from '@/components/ExportsPage';
import NotificationsPanel from '@/components/NotificationsPanel';
import type { NotificationsPanelHandle } from '@/components/NotificationsPanel';
import DataExplorerPanel from '@/components/DataExplorerPanel';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AssetBreadcrumb from '@/components/AssetBreadcrumb';
import HomePage from '@/components/Home';
import InsightsPage from '@/components/Insights';
import RecommendationsInbox from '@/components/RecommendationsInbox';
import ThemesPage from '@/components/Themes';
import DashboardsPage from '@/components/DashboardsPage';
import DateRangeSelector, { getDateRangeDisplayLabel } from '@/components/DateRangeSelector';
import ComfortPerformancePage from '@/components/ComfortPerformancePage';
import SustainabilityPerformancePage from '@/components/SustainabilityPerformancePage';
import MaintenancePerformancePage from '@/components/MaintenancePerformancePage';
import QuotationsPerformancePage from '@/components/QuotationsPerformancePage';
import TicketsPerformancePage from '@/components/TicketsPerformancePage';
import AssetMonitoringPerformancePage from '@/components/AssetMonitoringPerformancePage';
import CompliancePerformancePage from '@/components/CompliancePerformancePage';
import ThemesPerformancePage from '@/components/ThemesPerformancePage';
import SolarPowerOutlinedIcon from '@mui/icons-material/SolarPowerOutlined';
import FilterDramaOutlinedIcon from '@mui/icons-material/FilterDramaOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import ChangelogButton from '@/components/ChangelogButton';
import { tickets } from '@/data/tickets';
import { quotations } from '@/data/quotations';
import { maintenanceSchedules } from '@/data/maintenance';
import { AssetNode, getAssetById } from '@/data/assetTree';
import { buildingOperationalStats, formatCurrency } from '@/data/buildingOperationalStats';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import EuroOutlinedIcon from '@mui/icons-material/EuroOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import QuickreplyOutlinedIcon from '@mui/icons-material/QuickreplyOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import SettingsBackupRestoreOutlinedIcon from '@mui/icons-material/SettingsBackupRestoreOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined';
import ElevatorOutlinedIcon from '@mui/icons-material/ElevatorOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import DirectionsRunOutlinedIcon from '@mui/icons-material/DirectionsRunOutlined';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import {
  ElectricityConsumptionChart,
  GasConsumptionChart,
  EnergyDistributionChart,
  EnergyUseByBuildingChart,
  ForecastTargetChart,
  PowerProfilesChart,
  CostsCO2Chart,
  EnergyTemperatureChart,
  ComfortTemperatureTrendChart,
  ComfortHumidityTrendChart,
  ComfortAirQualityTrendChart,
  ComfortATGChart,
  AssetTrendChart,
  MaintenanceOverviewTable,
  AssetHealthDistributionChart,
  AssetPerformanceByCategoryChart,
  CriticalAssetsCard,
  PerformanceHeatmapChart,
  UtilizationOverviewChart,
  AssetListPanel
} from '@/components/charts';
import type { ToggleState } from '@/components/KPIToggle';
import { colors } from '@/colors';
import { BuildingSelectorPopover, getBuildingSelectorLabel, ContractFilterToggle, type BuildingFilterMode, type ContractFilter } from '@/components/BuildingSelector';

type MetricType = keyof Building['metrics'];
type ViewMode = 'dashboard' | 'list' | 'tree';
type BuildingsPanelTab = 'buildings' | 'kpi_analysis' | 'recommendations';
type Selection = MetricType | 'themes_group' | 'operations_group';

interface Favorite {
  id: string;
  name: string;
  type: string;
}

function getPerformanceRating(score: number): PerformanceRating {
  if (score >= 80) return { label: 'Good', color: '#4caf50' };
  if (score >= 60) return { label: 'Moderate', color: '#ff9800' };
  return { label: 'Poor', color: '#f44336' };
}

// All theme metric keys (primary + expanded)
const PRIMARY_THEME_KEYS: MetricType[] = ['sustainability', 'comfort', 'asset_monitoring', 'compliance'];
const ALL_THEME_KEYS: MetricType[] = [...PRIMARY_THEME_KEYS];
const OPERATIONS_KEYS: MetricType[] = ['tickets', 'quotations', 'maintenance'];

const SELECTION_LABELS: Record<string, string> = {
  overall: 'overall performance',
  themes_group: 'theme KPIs',
  operations_group: 'operational KPIs',
  sustainability: 'sustainability',
  comfort: 'comfort',
  asset_monitoring: 'asset monitoring',
  tickets: 'tickets',
  quotations: 'quotations',
  maintenance: 'maintenance',
  compliance: 'compliance',
};

function getComfortTopics(comfortGreen: number): TopicScore[] {
  return [
    { label: 'Temperature', score: Math.max(0, Math.min(100, comfortGreen + 7)), trend: 3, icon: <ThermostatOutlinedIcon sx={{ fontSize: 14 }} />, color: '#e91e63' },
    { label: 'Humidity', score: Math.max(0, Math.min(100, comfortGreen - 13)), trend: -4, icon: <WaterDropOutlinedIcon sx={{ fontSize: 14 }} />, color: '#9c27b0' },
    { label: 'Air Quality', score: Math.max(0, Math.min(100, comfortGreen + 6)), trend: 7, icon: <AirOutlinedIcon sx={{ fontSize: 14 }} />, color: '#00bcd4' },
  ];
}

function getSustainabilityTopics(sustainabilityGreen: number): TopicScore[] {
  return [
    { label: 'Consumption', score: Math.max(0, Math.min(100, sustainabilityGreen + 5)), trend: 4, icon: <BoltOutlinedIcon sx={{ fontSize: 14 }} />, color: '#f57c00' },
    { label: 'Generation', score: Math.max(0, Math.min(100, sustainabilityGreen - 8)), trend: 6, icon: <SolarPowerOutlinedIcon sx={{ fontSize: 14 }} />, color: '#66bb6a' },
    { label: 'Emissions', score: Math.max(0, Math.min(100, sustainabilityGreen - 3)), trend: -2, icon: <FilterDramaOutlinedIcon sx={{ fontSize: 14 }} />, color: '#9c27b0' },
    { label: 'Cost', score: Math.max(0, Math.min(100, sustainabilityGreen + 6)), trend: 3, icon: <PaidOutlinedIcon sx={{ fontSize: 14 }} />, color: '#0288d1' },
  ];
}

function getMaintenanceTopics(maintenanceGreen: number): TopicScore[] {
  return [
    { label: 'Progress', score: Math.max(0, Math.min(100, maintenanceGreen + 4)), trend: 5, icon: <TaskAltOutlinedIcon sx={{ fontSize: 14 }} />, color: '#2196f3' },
    { label: 'Timeliness', score: Math.max(0, Math.min(100, maintenanceGreen - 7)), trend: -2, icon: <ScheduleOutlinedIcon sx={{ fontSize: 14 }} />, color: '#ff9800' },
    { label: 'Reporting', score: Math.max(0, Math.min(100, maintenanceGreen + 3)), trend: 8, icon: <AssessmentOutlinedIcon sx={{ fontSize: 14 }} />, color: '#9c27b0' },
  ];
}

function getQuotationsTopics(quotationsGreen: number): TopicScore[] {
  return [
    { label: 'Run time', score: Math.max(0, Math.min(100, quotationsGreen + 5)), trend: 3, icon: <TimerOutlinedIcon sx={{ fontSize: 14 }} />, color: '#2196f3' },
    { label: 'Response time', score: Math.max(0, Math.min(100, quotationsGreen - 8)), trend: -3, icon: <QuickreplyOutlinedIcon sx={{ fontSize: 14 }} />, color: '#ff9800' },
    { label: 'Approval time', score: Math.max(0, Math.min(100, quotationsGreen + 3)), trend: 6, icon: <ThumbUpAltOutlinedIcon sx={{ fontSize: 14 }} />, color: '#9c27b0' },
  ];
}

function getTicketsTopics(ticketsGreen: number): TopicScore[] {
  return [
    { label: 'Respond time', score: Math.max(0, Math.min(100, ticketsGreen + 3)), trend: 4, icon: <QuickreplyOutlinedIcon sx={{ fontSize: 14 }} />, color: '#2196f3' },
    { label: 'Restore time', score: Math.max(0, Math.min(100, ticketsGreen - 5)), trend: -2, icon: <SettingsBackupRestoreOutlinedIcon sx={{ fontSize: 14 }} />, color: '#ff9800' },
  ];
}

function getAssetMonitoringTopics(assetMonitoringGreen: number): TopicScore[] {
  return [
    { label: 'Heating', score: Math.max(0, Math.min(100, assetMonitoringGreen + 4)), trend: 3, icon: <ThermostatOutlinedIcon sx={{ fontSize: 14 }} />, color: '#e91e63' },
    { label: 'Cooling', score: Math.max(0, Math.min(100, assetMonitoringGreen - 6)), trend: -2, icon: <AcUnitOutlinedIcon sx={{ fontSize: 14 }} />, color: '#00bcd4' },
    { label: 'Ventilation', score: Math.max(0, Math.min(100, assetMonitoringGreen + 2)), trend: 5, icon: <AirOutlinedIcon sx={{ fontSize: 14 }} />, color: '#9c27b0' },
    { label: 'Distribution', score: Math.max(0, Math.min(100, assetMonitoringGreen - 3)), trend: -1, icon: <AccountTreeOutlinedIcon sx={{ fontSize: 14 }} />, color: '#ff9800' },
    { label: 'Lighting', score: Math.max(0, Math.min(100, assetMonitoringGreen + 7)), trend: 4, icon: <LightbulbOutlinedIcon sx={{ fontSize: 14 }} />, color: '#ffc107' },
    { label: 'Transport', score: Math.max(0, Math.min(100, assetMonitoringGreen - 8)), trend: -3, icon: <ElevatorOutlinedIcon sx={{ fontSize: 14 }} />, color: '#0288d1' },
  ];
}

function getThemesTopics(metrics: Record<MetricKeys, { green: number }>, trends: Record<MetricKeys, number>): TopicScore[] {
  return [
    { label: 'Sustainability', score: metrics.sustainability.green, trend: trends.sustainability, icon: <NatureOutlinedIcon sx={{ fontSize: 14 }} />, color: '#4caf50' },
    { label: 'Comfort', score: metrics.comfort.green, trend: trends.comfort, icon: <SpaOutlinedIcon sx={{ fontSize: 14 }} />, color: '#2196f3' },
    { label: 'Asset Monitoring', score: metrics.asset_monitoring.green, trend: trends.asset_monitoring, icon: <SecurityOutlinedIcon sx={{ fontSize: 14 }} />, color: '#ff9800' },
    { label: 'Compliance', score: metrics.compliance.green, trend: trends.compliance, icon: <GavelOutlinedIcon sx={{ fontSize: 14 }} />, color: '#9c27b0' },
  ];
}

function getComplianceTopics(complianceGreen: number): TopicScore[] {
  return [
    { label: 'BACS', score: Math.max(0, Math.min(100, complianceGreen + 5)), trend: 3, icon: <SensorsOutlinedIcon sx={{ fontSize: 14 }} />, color: '#2196f3' },
    { label: 'Escape Routes', score: Math.max(0, Math.min(100, complianceGreen - 4)), trend: -2, icon: <DirectionsRunOutlinedIcon sx={{ fontSize: 14 }} />, color: '#ff9800' },
    { label: 'Fire Safety', score: Math.max(0, Math.min(100, complianceGreen + 3)), trend: 5, icon: <LocalFireDepartmentOutlinedIcon sx={{ fontSize: 14 }} />, color: '#f44336' },
    { label: 'Legionella Prevention', score: Math.max(0, Math.min(100, complianceGreen - 6)), trend: -1, icon: <VaccinesOutlinedIcon sx={{ fontSize: 14 }} />, color: '#9c27b0' },
    { label: 'Maintenance & Inspection', score: Math.max(0, Math.min(100, complianceGreen + 2)), trend: 4, icon: <HandymanOutlinedIcon sx={{ fontSize: 14 }} />, color: '#00bcd4' },
    { label: 'Permits', score: Math.max(0, Math.min(100, complianceGreen + 7)), trend: 2, icon: <DescriptionOutlinedIcon sx={{ fontSize: 14 }} />, color: '#4caf50' },
  ];
}

export default function Home() {
  // ── URL state ──────────────────────────────────────────────────────────────
  const router = useRouter();
  const searchParams = useSearchParams();

  // Keep a mutable ref so setURLParams always sees the latest params,
  // including inside setTimeout callbacks that capture a stale closure.
  const latestParamsRef = useRef(searchParams);
  latestParamsRef.current = searchParams;

  // Default values — params equal to their default are omitted from the URL.
  const URL_DEFAULTS: Record<string, string> = {
    page: 'portfolio',
    building: '',
    metric: 'overall',
    asset: '',
    view: 'dashboard',
    sort: 'Worst to Best',
    dateRange: 'This Month',
    group: 'All Groups',
    city: 'All Cities',
    inspect: '0',
    explorer: '0',
    themes: '0',
    assetTab: '0',
    panel: 'buildings',
  };

  const buildParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(latestParamsRef.current.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === (URL_DEFAULTS[key] ?? '')) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    latestParamsRef.current = params as unknown as typeof searchParams;
    return params.toString();
  };

  // replace — for filters/preferences that shouldn't create browser history entries
  const setURLParams = useCallback((updates: Record<string, string>) => {
    const qs = buildParams(updates);
    router.replace(qs ? `?${qs}` : '/', { scroll: false });
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  // push — for real navigation (page changes, building selection, metric/theme)
  const navigateTo = useCallback((updates: Record<string, string>) => {
    const qs = buildParams(updates);
    router.push(qs ? `?${qs}` : '/', { scroll: false });
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derived state — read directly from URL params
  const currentPage = (searchParams.get('page') ?? 'portfolio') as 'home' | 'portfolio' | 'portfolio_overview' | 'insights' | 'bms' | 'operations' | 'operations_docs' | 'operations_tickets' | 'operations_quotations' | 'themes' | 'workspaces' | 'exports' | 'dashboards';
  const buildingName = searchParams.get('building') ?? '';
  const selectedBuilding = buildingName ? (allBuildings.find(b => b.name === buildingName) ?? null) : null;
  const selection = (searchParams.get('metric') ?? 'overall') as Selection;
  const assetId = searchParams.get('asset') ?? '';
  const viewMode = (searchParams.get('view') ?? 'dashboard') as ViewMode;
  const sortOrder = searchParams.get('sort') ?? 'Worst to Best';
  const dateRange = searchParams.get('dateRange') ?? 'This Month';
  const selectedGroup = searchParams.get('group') ?? 'All Groups';
  const selectedCity = searchParams.get('city') ?? 'All Cities';
  const isInspectMode = searchParams.get('inspect') === '1';
  const isAssetExplorerOpen = searchParams.get('explorer') === '1';
  const assetTab = parseInt(searchParams.get('assetTab') ?? '0', 10);

  // URL-based asset (from asset explorer / tree)
  const urlAsset = assetId ? getAssetById(assetId) : null;

  // Local state for synthetic asset nodes created by inspect mode
  // (buildings/widgets that don't exist in the asset tree and can't be URL-serialised)
  const [localQuickviewAsset, setLocalQuickviewAsset] = useState<AssetNode | null>(null);

  const quickviewAsset = localQuickviewAsset ?? urlAsset;
  const isAssetQuickviewOpen = !!quickviewAsset;

  // Derived convenience aliases
  const selectedAsset = quickviewAsset;
  const viewingAssetDetail = isAssetQuickviewOpen;

  // ── Local-only state (ephemeral / pure UI) ─────────────────────────────────
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const notificationsRef = useRef<NotificationsPanelHandle>(null);
  const [dataExplorerOpen, setDataExplorerOpen] = useState(false);
  const [exportToast, setExportToast] = useState<{ open: boolean; message: string; severity: 'info' | 'success' }>({ open: false, message: '', severity: 'info' });
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([
    { id: '1', name: 'Skyline Plaza', type: 'building' },
    { id: '2', name: 'Aanpassen verlichting', type: 'task' },
    { id: '3', name: 'Reparatie toilet 1e ver', type: 'task' },
  ]);
  const rawPanelTab = searchParams.get('panel') ?? 'buildings';
  const buildingsPanelTab: BuildingsPanelTab = (rawPanelTab === 'buildings' || rawPanelTab === 'kpi_analysis' || rawPanelTab === 'recommendations') ? rawPanelTab : 'buildings';
  const setBuildingsPanelTab = (v: BuildingsPanelTab) => setURLParams({ panel: v });
  const [hoveredBuilding, setHoveredBuilding] = useState<Building | null>(null);
  const [hoveredAsset, setHoveredAsset] = useState<{ id?: string; type?: string; name: string; category?: string } | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [openedViaInspect, setOpenedViaInspect] = useState(false);
  const [activeDashboardId, setActiveDashboardId] = useState<string>('');
  const [activeDashboardLabel, setActiveDashboardLabel] = useState<string>('');
  const [pendingDashboardId, setPendingDashboardId] = useState<string | null>(null);

  // Page title scroll tracking — show compact filter in header when scrolled
  const [isFilterTitleScrolled, setIsFilterTitleScrolled] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pageTitleRef = React.useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (node) {
      const obs = new IntersectionObserver(
        ([entry]) => setIsFilterTitleScrolled(!entry.isIntersecting),
        { threshold: 0, rootMargin: '-56px 0px 0px 0px' }
      );
      obs.observe(node);
      observerRef.current = obs;
    } else {
      setIsFilterTitleScrolled(false);
    }
  }, []);

  // Page title inline filter state
  const [titleDateRangeAnchor, setTitleDateRangeAnchor] = useState<null | HTMLElement>(null);
  const [titleBuildingAnchor, setTitleBuildingAnchor] = useState<null | HTMLElement>(null);
  const [contractMenuAnchor, setContractMenuAnchor] = useState<null | HTMLElement>(null);
  const [titleBuildingNames, setTitleBuildingNames] = useState<string[]>([]);
  const [titleBuildingMode, setTitleBuildingMode] = useState<BuildingFilterMode>('buildings');

  const [contractFilter, setContractFilter] = useState<ContractFilter>(false);

  const handleBuildingFilterModeChange = (mode: BuildingFilterMode) => {
    setTitleBuildingMode(mode);
    setTitleBuildingNames([]);
  };

  const getTitleBuildingLabel = () => getBuildingSelectorLabel(titleBuildingNames, titleBuildingMode);

  const getPeriodDisplayLabel = (range: string): string => getDateRangeDisplayLabel(range);

  const inlineDropdownSx = {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: '2px',
    cursor: 'pointer',
    fontWeight: 600,
    color: 'primary.main',
    transition: 'opacity 0.2s ease',
    '&:hover': {
      opacity: 0.7,
    },
  };

  // ── URL setter helpers ─────────────────────────────────────────────────────
  const setCurrentPage = (page: string) => navigateTo({ page });
  const setSelectedBuilding = (b: Building | null) => navigateTo({ building: b?.name ?? '' });
  const setSelection = (s: string) => navigateTo({ metric: s });
  const setViewMode = (v: string) => setURLParams({ view: v });
  const setSortOrder = (s: string) => setURLParams({ sort: s });
  const setDateRange = (r: string) => setURLParams({ dateRange: r });
  const setSelectedGroup = (g: string) => setURLParams({ group: g });
  const setSelectedCity = (c: string) => setURLParams({ city: c });
  const setIsInspectMode = (v: boolean) => setURLParams({ inspect: v ? '1' : '0' });
  const setIsAssetExplorerOpen = (v: boolean) => setURLParams({ explorer: v ? '1' : '0' });
  const setAssetTab = (n: number) => setURLParams({ assetTab: String(n) });
  // Open a URL-serialisable asset (from the tree)
  const setQuickviewAsset = (a: AssetNode | null) => {
    setLocalQuickviewAsset(null);
    setURLParams({ asset: a?.id ?? '', assetTab: '0' });
  };

  // Scroll to top when selecting a building
  React.useEffect(() => {
    if (selectedBuilding) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedBuilding]);

  // Handle asset selection from tree - opens quickview drawer
  const handleAssetSelect = (asset: AssetNode | null) => {
    if (asset && asset.type === 'asset') {
      setLocalQuickviewAsset(null);
      setURLParams({ asset: asset.id, assetTab: '0' });
      setOpenedViaInspect(false);
    } else {
      setLocalQuickviewAsset(null);
      setURLParams({ asset: '' });
    }
  };

  // Open asset in inspector (concertina)
  const handleOpenInMainApp = (asset: AssetNode) => {
    setLocalQuickviewAsset(null);
    setURLParams({ asset: asset.id, explorer: '1', assetTab: '0' });
  };

  // Convert Building to AssetNode for inspection
  const buildingToAssetNode = (building: Building): AssetNode => ({
    id: building.name.toLowerCase().replace(/\s+/g, '-'),
    name: building.name,
    type: 'building',
    metadata: {
      location: building.address,
      status: 'Active'
    }
  });

  // Handle inspecting a building in inspect mode
  const handleInspectBuilding = (building: Building, event: React.MouseEvent) => {
    if (isInspectMode) {
      event.stopPropagation();
      const assetNode = buildingToAssetNode(building);
      setLocalQuickviewAsset(assetNode);
      setURLParams({ explorer: '1' });
      setOpenedViaInspect(true);
      setHoveredBuilding(null);
    }
  };

  // Handle hover in inspect mode
  const handleBuildingHover = (building: Building | null, event?: React.MouseEvent) => {
    if (isInspectMode) {
      setHoveredBuilding(building);
      setHoveredAsset(null);
      if (building && event) {
        const rect = event.currentTarget.getBoundingClientRect();
        setHoverPosition({
          x: rect.left + rect.width / 2,
          y: rect.top
        });
      } else {
        setHoverPosition(null);
      }
    }
  };

  // Handle inspecting a generic asset
  const handleInspectAsset = (assetType: string, assetName: string, category?: string) => {
    if (isInspectMode) {
      const assetNode: AssetNode = {
        id: `${assetType}-${assetName.toLowerCase().replace(/\s+/g, '-')}`,
        name: assetName,
        type: assetType as AssetNode['type'],
        metadata: {
          category: category || assetType,
          status: 'Active'
        }
      };
      setLocalQuickviewAsset(assetNode);
      setURLParams({ explorer: '1' });
      setOpenedViaInspect(true);
      setHoveredAsset(null);
      setHoveredBuilding(null);
    }
  };

  // Handle hover for generic assets
  const handleAssetHover = (asset: { type: string; name: string; category?: string } | null, event?: React.MouseEvent) => {
    if (isInspectMode) {
      setHoveredAsset(asset);
      setHoveredBuilding(null);
      if (asset && event) {
        const rect = event.currentTarget.getBoundingClientRect();
        setHoverPosition({
          x: rect.left + rect.width / 2,
          y: rect.top
        });
      } else {
        setHoverPosition(null);
      }
    }
  };

  // Sequential closing of both drawers (concertina effect)
  const handleCloseBothDrawers = () => {
    // Close Asset Details first
    setLocalQuickviewAsset(null);
    setURLParams({ asset: '', assetTab: '0' });
    // Wait for Asset Details animation to complete, then close Asset Explorer
    setTimeout(() => {
      setURLParams({ explorer: '0' });
      setOpenedViaInspect(false);
    }, 300);
  };

  // Derive effective selectedMetric for building grid filtering
  // When a group is selected, use 'overall' for the grid
  const selectedMetric: MetricType = (() => {
    if (selection === 'themes_group' || selection === 'operations_group' || selection === 'overall') return 'overall';
    return selection as MetricType;
  })();

  // Sort buildings based on selected metric and sort order
  const sortedBuildings = useMemo(() => {
    const metricForSort = selectedMetric === 'overall' ? 'overall' : selectedMetric;

    if (sortOrder === 'Most Improved') {
      return sortBuildingsByTrend(metricForSort, 'improved');
    } else if (sortOrder === 'Most Deteriorated') {
      return sortBuildingsByTrend(metricForSort, 'deteriorated');
    }

    const buildings = sortBuildingsByMetric(metricForSort);

    if (sortOrder === 'Best to Worst') {
      return [...buildings].reverse();
    } else if (sortOrder === 'A to Z') {
      return [...buildings].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'Z to A') {
      return [...buildings].sort((a, b) => b.name.localeCompare(a.name));
    }

    return buildings;
  }, [selectedMetric, sortOrder]);

  // Apply contract filter on top of sorted buildings
  const filteredBuildings = useMemo(() => {
    return sortedBuildings.filter(b => b.hasContract === contractFilter);
  }, [sortedBuildings, contractFilter]);

  // Aggregate buildings into clusters for cluster grid view
  const clusterData = useMemo(() => {
    const groups = new Map<string, Building[]>();
    for (const b of filteredBuildings) {
      const arr = groups.get(b.group) || [];
      arr.push(b);
      groups.set(b.group, arr);
    }
    return Array.from(groups.entries()).map(([name, buildings]) => {
      const avg = (fn: (b: Building) => number) =>
        Math.round(buildings.reduce((s, b) => s + fn(b), 0) / buildings.length);
      const avgMetric = (key: MetricType) => ({
        green: avg(b => b.metrics[key].green),
        yellow: avg(b => b.metrics[key].yellow),
        red: avg(b => b.metrics[key].red),
      });
      const avgTrend = (key: MetricType) =>
        Math.round(buildings.reduce((s, b) => s + b.trends[key], 0) / buildings.length * 10) / 10;
      return {
        name,
        buildings,
        images: buildings.map(b => b.image),
        metrics: Object.fromEntries(
          (['overall', 'sustainability', 'comfort', 'asset_monitoring', 'tickets', 'quotations', 'maintenance', 'energy', 'workspace', 'compliance', 'water_management', 'security_systems', 'access_control'] as MetricType[]).map(k => [k, avgMetric(k)])
        ) as Record<MetricType, { green: number; yellow: number; red: number }>,
        trends: Object.fromEntries(
          (['overall', 'sustainability', 'comfort', 'asset_monitoring', 'tickets', 'quotations', 'maintenance', 'energy', 'workspace', 'compliance', 'water_management', 'security_systems', 'access_control'] as MetricType[]).map(k => [k, avgTrend(k)])
        ) as Record<MetricType, number>,
      };
    });
  }, [filteredBuildings]);

  const handleMetricSelect = (metric: MetricType) => {
    if (selection === metric) {
      setURLParams({ metric: 'overall', themes: '0' });
    } else {
      setURLParams({ metric });
    }
  };

  // Handle clicking a parent group header
  const handleGroupToggle = (group: 'themes' | 'operations') => {
    const groupSelection = group === 'themes' ? 'themes_group' : 'operations_group';
    if (selection === groupSelection) {
      setURLParams({ metric: 'overall', themes: '0' });
    } else {
      setURLParams({ metric: groupSelection, ...(group === 'operations' ? { themes: '0' } : {}) });
    }
  };

  // Determine if a group is "active" (either the group itself or one of its children is selected)
  const isThemesActive = selection === 'overall' || selection === 'themes_group' || ALL_THEME_KEYS.includes(selection as MetricType);
  const isOperationsActive = selection === 'overall' || selection === 'operations_group' || OPERATIONS_KEYS.includes(selection as MetricType);

  // Visual-only: highlight only the exact level that is selected (not ancestors/descendants)
  const isThemesSelected = selection === 'themes_group';
  const isOperationsSelected = selection === 'operations_group';

  // Get toggle state for a parent group header
  const getGroupToggleState = (group: 'themes' | 'operations'): ToggleState => {
    if (selection === 'overall') return 'inherited'; // Both groups on in inherited mode
    if (group === 'themes') {
      if (selection === 'themes_group') return 'on';
      if (ALL_THEME_KEYS.includes(selection as MetricType)) return 'inherited'; // A child is selected
      return 'off'; // Operations is active
    } else {
      if (selection === 'operations_group') return 'on';
      if (OPERATIONS_KEYS.includes(selection as MetricType)) return 'inherited';
      return 'off'; // Themes is active
    }
  };

  // Get toggle state for a child KPI
  const getToggleState = (metric: MetricType, group: 'themes' | 'operations'): ToggleState => {
    if (selection === 'overall') return 'inherited'; // Everything inherited when on overall
    // If a group is selected, its children are inherited, others are off
    if (selection === 'themes_group') return group === 'themes' ? 'inherited' : 'off';
    if (selection === 'operations_group') return group === 'operations' ? 'inherited' : 'off';
    // A specific child is selected
    if (selection === metric) return 'on';
    // Sibling in same group → off, different group → off
    return 'off';
  };

  // Handle view mode changes
  const handleViewModeChange = (newViewMode: ViewMode) => {
    setURLParams({ view: newViewMode });
    if (newViewMode === 'tree') {
      setLeftSidebarCollapsed(true);
    }
  };

  // Handle left sidebar toggle
  const handleLeftSidebarToggle = () => {
    if (leftSidebarCollapsed) {
      setURLParams({ view: 'dashboard' });
    }
    setLeftSidebarCollapsed(!leftSidebarCollapsed);
  };

  // Calculate current page name and favorite status
  const getCurrentPageName = () => {
    if (currentPage === 'dashboards' && activeDashboardLabel) return `Dashboards - ${activeDashboardLabel}`;
    if (currentPage === 'dashboards') return 'Dashboards';
    if (currentPage === 'insights') return 'Insights';
    if (currentPage === 'themes') return 'Themes';
    if (currentPage === 'workspaces') return 'Workspaces';
    if (currentPage === 'exports') return 'Exports';
    if (currentPage === 'portfolio_overview') return 'Data Explorer';
    if (currentPage === 'bms') return 'BMS';
    if (currentPage === 'operations') return 'Operations';
    if (selectedBuilding) return selectedBuilding.name;
    return 'Control Room';
  };
  const currentPageName = getCurrentPageName();

  useEffect(() => {
    document.title = currentPageName === 'Control Room'
      ? 'Pulse Core 4.0'
      : `Pulse Core 4.0 - ${currentPageName}`;
  }, [currentPageName]);

  const isCurrentPageFavorited = favorites.some(fav => fav.name === currentPageName);

  const getFavoriteType = () => {
    if (currentPage === 'dashboards') return 'dashboard';
    if (selectedBuilding) return 'building';
    return 'page';
  };

  const handleFavoriteToggle = (pageName: string, isFavorited: boolean) => {
    if (isFavorited) {
      const newFavorite: Favorite = {
        id: Date.now().toString(),
        name: pageName,
        type: getFavoriteType()
      };
      setFavorites([...favorites, newFavorite]);
    } else {
      setFavorites(favorites.filter(fav => fav.name !== pageName));
    }
  };

  const handlePageChange = (page: 'home' | 'portfolio' | 'portfolio_overview' | 'insights' | 'bms' | 'operations' | 'operations_docs' | 'operations_tickets' | 'operations_quotations' | 'themes' | 'workspaces' | 'exports' | 'dashboards') => {
    setLocalQuickviewAsset(null);
    const updates: Record<string, string> = { page, explorer: '0', asset: '', assetTab: '0' };
    if (page !== 'portfolio') {
      Object.assign(updates, { building: '', view: 'dashboard' });
    }
    setURLParams(updates);
  };

  const handleExport = () => {
    const exportName = selectedBuilding
      ? `${selectedBuilding.name} — ${selection === 'overall' ? 'Overview' : selection.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`
      : 'Control Room Overview';
    setExportToast({ open: true, message: `Exporting "${exportName}"...`, severity: 'info' });
    setTimeout(() => {
      setExportToast({ open: true, message: `Export "${exportName}" is ready!`, severity: 'success' });
      notificationsRef.current?.addNotification({
        id: `export-${Date.now()}`,
        actor: 'System',
        actorInitials: 'S',
        actorColor: '#059669',
        action: 'export ready:',
        target: `${exportName} (PDF, ${(Math.random() * 3 + 0.5).toFixed(1)} MB)`,
        date: new Date().toISOString(),
        read: false,
      });
      setHasUnreadNotifications(true);
    }, 3000);
  };

  const isToolbarVisible = true;

  // Map metric types to their display info
  const metricInfo: Record<MetricType, { title: string; icon: React.ReactNode }> = {
    overall: { title: 'Overall Performance', icon: <SpeedOutlinedIcon sx={{ fontSize: 24, color: 'text.secondary' }} /> },
    sustainability: { title: 'Sustainability', icon: <NatureOutlinedIcon sx={{ fontSize: 24 }} /> },
    comfort: { title: 'Comfort', icon: <SpaOutlinedIcon sx={{ fontSize: 24 }} /> },
    asset_monitoring: { title: 'Asset Monitoring', icon: <SecurityOutlinedIcon sx={{ fontSize: 24, color: 'text.secondary' }} /> },
    tickets: { title: 'Tickets', icon: <AssignmentOutlinedIcon sx={{ fontSize: 24, color: 'text.secondary' }} /> },
    quotations: { title: 'Quotations', icon: <RequestQuoteOutlinedIcon sx={{ fontSize: 24, color: 'text.secondary' }} /> },
    maintenance: { title: 'Maintenance', icon: <BuildOutlinedIcon sx={{ fontSize: 24, color: 'text.secondary' }} /> },
    energy: { title: 'Energy', icon: <BoltOutlinedIcon sx={{ fontSize: 24, color: 'text.secondary' }} /> },
    workspace: { title: 'Workspace', icon: <WorkspacesOutlinedIcon sx={{ fontSize: 24, color: 'text.secondary' }} /> },
    compliance: { title: 'Compliance', icon: <GavelOutlinedIcon sx={{ fontSize: 24, color: 'text.secondary' }} /> },
    water_management: { title: 'Water Management', icon: <WaterDropOutlinedIcon sx={{ fontSize: 24, color: 'text.secondary' }} /> },
    security_systems: { title: 'Security Systems', icon: <ShieldOutlinedIcon sx={{ fontSize: 24, color: 'text.secondary' }} /> },
    access_control: { title: 'Access Control', icon: <BadgeOutlinedIcon sx={{ fontSize: 24, color: 'text.secondary' }} /> },
  };

  // Icons for theme metrics
  const themeIcons: Record<string, React.ReactNode> = {
    'Sustainability': <NatureOutlinedIcon />,
    'Comfort': <SpaOutlinedIcon />,
    'Asset Monitoring': <SecurityOutlinedIcon />,
    'Energy': <BoltOutlinedIcon />,
    'Workspace': <WorkspacesOutlinedIcon />,
    'Compliance': <GavelOutlinedIcon />,
    'Water Management': <WaterDropOutlinedIcon />,
    'Security Systems': <ShieldOutlinedIcon />,
    'Access Control': <BadgeOutlinedIcon />,
  };

  const operationsIcons: Record<string, React.ReactNode> = {
    'Tickets': <AssignmentOutlinedIcon />,
    'Quotations': <RequestQuoteOutlinedIcon />,
    'Maintenance': <BuildOutlinedIcon />,
  };

  // Period-aware metrics based on selected date range (with contract variation when active)
  const periodMetrics = useMemo(() => {
    const base = getMetricsForPeriod(dateRange);
    return contractFilter ? applyContractVariation(base) : base;
  }, [dateRange, contractFilter]);

  // Calculate rolled-up scores for KPI groups
  const themesScore = selectedBuilding
    ? Math.round(PRIMARY_THEME_KEYS.reduce((sum, k) => sum + selectedBuilding.metrics[k].green, 0) / PRIMARY_THEME_KEYS.length)
    : Math.round(periodMetrics.themes.reduce((sum, m) => sum + m.score, 0) / periodMetrics.themes.length);

  const operationsScore = selectedBuilding
    ? Math.round(OPERATIONS_KEYS.reduce((sum, k) => sum + selectedBuilding.metrics[k].green, 0) / OPERATIONS_KEYS.length)
    : Math.round(periodMetrics.operations.reduce((sum, m) => sum + m.score, 0) / periodMetrics.operations.length);

  // Score for the currently selected KPI (shown in breadcrumb)
  const selectionScore = (() => {
    const themeIdx = PRIMARY_THEME_KEYS.indexOf(selection as MetricType);
    if (themeIdx !== -1) {
      return selectedBuilding ? selectedBuilding.metrics[selection as MetricType].green : periodMetrics.themes[themeIdx]?.score ?? null;
    }
    const opsIdx = OPERATIONS_KEYS.indexOf(selection as MetricType);
    if (opsIdx !== -1) {
      return selectedBuilding ? selectedBuilding.metrics[selection as MetricType].green : periodMetrics.operations[opsIdx]?.score ?? null;
    }
    return null;
  })();

  // Metric items for breadcrumb dropdown (all KPIs with icons and scores)
  const metricItems = useMemo(() => [
    ...PRIMARY_THEME_KEYS.map((key, i) => ({
      key,
      label: periodMetrics.themes[i]?.title ?? key,
      icon: themeIcons[periodMetrics.themes[i]?.title ?? ''],
      score: selectedBuilding ? selectedBuilding.metrics[key].green : periodMetrics.themes[i]?.score ?? 0,
      group: 'themes' as const,
    })),
    ...OPERATIONS_KEYS.map((key, i) => ({
      key,
      label: periodMetrics.operations[i]?.title ?? key,
      icon: operationsIcons[periodMetrics.operations[i]?.title ?? ''],
      score: selectedBuilding ? selectedBuilding.metrics[key].green : periodMetrics.operations[i]?.score ?? 0,
      group: 'operations' as const,
    })),
  ], [periodMetrics, selectedBuilding, themeIcons, operationsIcons]);

  // Calculate sidebar widths
  const leftSidebarWidth = leftSidebarCollapsed ? 64 : 280;
  const rightSidebarWidth = viewMode === 'tree' ? 280 : 64;

  const isCompact = !!selectedBuilding;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: colors.bgSecondary, overflow: 'hidden', width: '100%', maxWidth: '100vw' }}>
      {/* Left Sidebar */}
      <Box component="aside" sx={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: leftSidebarWidth, borderRight: 1, borderColor: 'divider', zIndex: 1500, transition: 'width 0.3s ease' }}>
        <Sidebar
          selectedBuilding={selectedBuilding}
          selectedMetric={selectedMetric}
          onBuildingSelect={setSelectedBuilding}
          onMetricSelect={(metric) => setSelection(metric as MetricType)}
          favorites={favorites}
          onFavoritesChange={setFavorites}
          selection={selection}
          onSelectionChange={(s) => setSelection(s)}
          isCollapsed={leftSidebarCollapsed}
          onToggleCollapse={handleLeftSidebarToggle}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onDashboardNavigate={(id) => setPendingDashboardId(id)}
          onAssetExplorerToggle={() => {
            setIsAssetExplorerOpen(!isAssetExplorerOpen);
            if (!isAssetExplorerOpen && isInspectMode) {
              setIsInspectMode(false);
            }
          }}
          isAssetExplorerOpen={isAssetExplorerOpen}
          notificationsPanelOpen={notificationsPanelOpen}
          onNotificationsPanelToggle={() => {
            const opening = !notificationsPanelOpen;
            setNotificationsPanelOpen(opening);
            if (opening) {
              setHasUnreadNotifications(false);
              setDataExplorerOpen(false);
            }
          }}
          hasUnreadNotifications={hasUnreadNotifications}
          dataExplorerOpen={dataExplorerOpen}
          onDataExplorerToggle={() => {
            const opening = !dataExplorerOpen;
            setDataExplorerOpen(opening);
            if (opening) setNotificationsPanelOpen(false);
          }}
        />
      </Box>

      {/* Notifications Panel — outside sidebar stacking context */}
      <NotificationsPanel
        ref={notificationsRef}
        open={notificationsPanelOpen}
        onClose={() => setNotificationsPanelOpen(false)}
        sidebarWidth={leftSidebarWidth}
      />

      {/* Data Explorer Panel */}
      <DataExplorerPanel
        open={dataExplorerOpen}
        onClose={() => setDataExplorerOpen(false)}
        sidebarWidth={leftSidebarWidth}
        onAssetSelect={(node) => {
          if (node) {
            setLocalQuickviewAsset(null);
            setURLParams({ asset: node.id, assetTab: '0' });
          } else {
            setURLParams({ asset: '' });
          }
        }}
        onOpenInMainApp={(asset) => {
          if (asset) {
            setLocalQuickviewAsset(null);
            setURLParams({ asset: asset.id, assetTab: '0' });
          }
        }}
      />

      {/* Scrim/Backdrop when Asset Explorer is open */}
      {isAssetExplorerOpen && (
        <Box
          onClick={() => {
            // If asset details is open, close both drawers sequentially
            if (isAssetQuickviewOpen) {
              handleCloseBothDrawers();
            } else {
              setIsAssetExplorerOpen(false);
            }
          }}
          sx={{
            position: 'fixed',
            top: 56,
            left: leftSidebarWidth,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1401,
            cursor: 'pointer',
          }}
        />
      )}

      {/* Asset Explorer - Slides from left sidebar */}
      <Box
        sx={{
          position: 'fixed',
          top: '56px',
          left: isAssetExplorerOpen ? `${leftSidebarWidth}px` : `-280px`,
          height: 'calc(100vh - 56px)',
          width: 280,
          zIndex: 1450,
          transition: 'left 0.3s ease',
        }}
      >
        <FloatingToolbar
          selectedView="tree"
          onViewChange={setViewMode}
          visible={isAssetExplorerOpen}
          buildingName={selectedBuilding?.name}
          onAssetSelect={handleAssetSelect}
          onOpenInMainApp={handleOpenInMainApp}
          inLeftPanel={true}
          onClose={() => {
            // If asset details is open, close both drawers sequentially
            if (isAssetQuickviewOpen) {
              handleCloseBothDrawers();
            } else {
              setIsAssetExplorerOpen(false);
            }
          }}
        />
      </Box>

      {/* Asset Detail Inspector - Full-width concertina drawer */}
      <Box
        sx={{
          position: 'fixed',
          top: '56px',
          left: isAssetQuickviewOpen && quickviewAsset && currentPage !== 'portfolio_overview' ? `${leftSidebarWidth + 280}px` : `calc(-100% + ${leftSidebarWidth + 280}px)`,
          width: `calc(100% - ${leftSidebarWidth + 280}px)`,
          height: 'calc(100vh - 56px)',
          zIndex: 1425,
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          bgcolor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pointerEvents: isAssetQuickviewOpen && quickviewAsset && currentPage !== 'portfolio_overview' ? 'auto' : 'none',
        }}
      >
        {/* Header with breadcrumb, actions, and close button */}
        <Box sx={{
          px: 3,
          pt: 2,
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0
        }}>
          {/* Breadcrumb */}
          {quickviewAsset && (
            <AssetBreadcrumb
              asset={quickviewAsset}
              onAssetSelect={handleAssetSelect}
            />
          )}

          {/* Action buttons and close */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Edit">
              <IconButton size="small">
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton size="small">
                <ShareOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="More actions">
              <IconButton size="small" sx={{ borderRadius: "50%", aspectRatio: 1 }}>
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Box sx={{ width: 1, height: 20, bgcolor: 'divider', mx: 0.5 }} />
            <IconButton
              size="small"
              onClick={() => {
                // If opened via inspect or explorer is open, close both drawers sequentially
                if (openedViaInspect || isAssetExplorerOpen) {
                  handleCloseBothDrawers();
                } else {
                  setLocalQuickviewAsset(null);
                  setURLParams({ asset: '', assetTab: '0' });
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Asset Detail Content */}
        <Container maxWidth={false} sx={{ py: 3, overflowY: 'auto', flex: 1, px: 3 }}>
          {quickviewAsset && <AssetDetail asset={quickviewAsset} tab={assetTab} onTabChange={setAssetTab} />}
        </Container>
      </Box>

      {/* Floating Inspect Toolbar — HIDDEN: disabled for now, uncomment to restore */}
      {false && <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          top: '50%',
          right: 16,
          transform: 'translateY(-50%)',
          zIndex: 1400,
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#fff',
        }}
      >
        <Tooltip title={isInspectMode ? "Exit Inspect Mode" : "Inspect Assets"} placement="left">
          <IconButton
            onClick={() => {
              if (isAssetExplorerOpen) {
                setIsAssetExplorerOpen(false);
              }
              setIsInspectMode(!isInspectMode);
            }}
            sx={{
              width: 48,
              height: 48,
              borderRadius: 0,
              bgcolor: isInspectMode ? colors.brand : '#fff',
              color: isInspectMode ? '#fff' : 'text.primary',
              border: isInspectMode ? '2px dashed rgba(255, 255, 255, 0.5)' : 'none',
              '&:hover': {
                bgcolor: isInspectMode ? '#1565c0' : colors.bgPrimaryHover,
              }
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
              {isInspectMode ? (
                <VisibilityIcon sx={{ fontSize: 20 }} />
              ) : (
                <VisibilityOffIcon sx={{ fontSize: 20 }} />
              )}
              <Typography variant="caption" sx={{ fontSize: '0.5rem', lineHeight: 1 }}>
                Inspect
              </Typography>
            </Box>
          </IconButton>
        </Tooltip>
      </Paper>}

      {/* Inspect Mode Overlay - Dims the page with blue tinge */}
      {isInspectMode && (
        <Box
          sx={{
            position: 'fixed',
            top: 56,
            left: leftSidebarWidth,
            right: 0,
            bottom: 0,
            zIndex: 1050,
            pointerEvents: 'none',
            bgcolor: 'rgba(227, 242, 253, 0.3)', // Light blue tinge
            backdropFilter: 'brightness(0.95) saturate(1.1)',
          }}
        />
      )}

      {/* Hover Preview Popover */}
      {isInspectMode && (hoveredBuilding || hoveredAsset) && hoverPosition && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            left: hoverPosition.x,
            top: hoverPosition.y - 10,
            transform: 'translate(-50%, -100%)',
            zIndex: 1450,
            p: 2,
            minWidth: 280,
            maxWidth: 320,
            pointerEvents: 'none',
            bgcolor: '#fff',
            border: `2px dashed ${colors.brand}`,
          }}
        >
          {hoveredBuilding ? (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {hoveredBuilding.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {hoveredBuilding.address}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Overall: {hoveredBuilding.metrics.overall.green}%
                </Typography>
              </Box>
            </>
          ) : hoveredAsset && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {hoveredAsset.name}
              </Typography>
              {hoveredAsset.id && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  ID: {hoveredAsset.id}
                </Typography>
              )}
              {hoveredAsset.category && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Category: {hoveredAsset.category}
                </Typography>
              )}
              {hoveredAsset.type && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Type: {hoveredAsset.type}
                </Typography>
              )}
            </>
          )}
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: colors.brand, fontWeight: 500 }}>
            Click to inspect →
          </Typography>
        </Paper>
      )}

      {/* Main Content Area */}
      <Box component="main" sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        ml: (isAssetExplorerOpen && viewingAssetDetail) ? `${leftSidebarWidth + 280}px` : `${leftSidebarWidth}px`,
        transition: 'margin-left 0.3s ease, border-color 0.3s ease',
        position: 'relative',
        zIndex: 1,
        border: '3px dashed',
        borderColor: isInspectMode ? colors.brand : 'transparent',
        minWidth: 0,
        overflow: 'hidden'
      }}>
        <PageHeader
            currentPage={currentPage}
            selectedBuilding={selectedBuilding}
            selectedAsset={selectedAsset}
            onBack={() => setURLParams({ building: '', asset: '', assetTab: '0' })}
            onAssetBack={() => setURLParams({ asset: '', assetTab: '0' })}
            onDateRangeChange={setDateRange}
            onFavoriteToggle={handleFavoriteToggle}
            isFavorited={isCurrentPageFavorited}
            hasRightSidebar={false}
            leftSidebarWidth={leftSidebarWidth}
            rightSidebarWidth={0}
            selection={selection}
            buildings={filteredBuildings}
            onBuildingSelect={(b) => setSelectedBuilding(b)}
            onSelectionChange={(s) => setSelection(s as Selection)}
            isAssetExplorerOpen={isAssetExplorerOpen}
            viewingAssetDetail={viewingAssetDetail}
            selectedGroup={selectedGroup}
            onGroupChange={setSelectedGroup}
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
            selectedDateRange={dateRange}
            onPageChange={handlePageChange}
            isCollapsed={leftSidebarCollapsed}
            onToggleCollapse={handleLeftSidebarToggle}
            onExport={handleExport}
            activeDashboardId={activeDashboardId}
            activeDashboardLabel={activeDashboardLabel}
            isFilterTitleScrolled={
              currentPage === 'dashboards'
                ? false
                : isFilterTitleScrolled && currentPage === 'portfolio'
            }
            filterSelectionLabel={
              currentPage === 'dashboards'
                ? undefined
                : (SELECTION_LABELS[selection] ?? 'overall performance')
            }
            filterPeriodLabel={getPeriodDisplayLabel(dateRange)}
            filterBuildingLabel={
              (currentPage === 'portfolio' && selectedBuilding) ? undefined : getTitleBuildingLabel()
            }
            onFilterDateClick={(e) => setTitleDateRangeAnchor(e.currentTarget)}
            onFilterBuildingClick={
              (currentPage === 'portfolio' && selectedBuilding) ? undefined : (e) => setTitleBuildingAnchor(e.currentTarget)
            }
            contractFilter={contractFilter}
            onContractFilterChange={setContractFilter}
            selectionScore={selectionScore}
            metricItems={metricItems}
          />

        {/* ========== Shared filter menus (used by inline title & header compact filter) ========== */}
        <DateRangeSelector
          anchorEl={titleDateRangeAnchor}
          onClose={() => setTitleDateRangeAnchor(null)}
          value={dateRange}
          onChange={(v) => { setDateRange(v); }}
        />

        <BuildingSelectorPopover
          anchorEl={titleBuildingAnchor}
          onClose={() => setTitleBuildingAnchor(null)}
          selectedNames={titleBuildingNames}
          onSelectionChange={setTitleBuildingNames}
          mode={titleBuildingMode}
          onModeChange={handleBuildingFilterModeChange}
        />



        {/* Dashboards - full-bleed view with own sidebar */}
        {currentPage === 'dashboards' && (
          <DashboardsPage
            initialDashboardId={pendingDashboardId}
            onInitialDashboardConsumed={() => setPendingDashboardId(null)}
            onDashboardChange={(id, label) => { setActiveDashboardId(id); setActiveDashboardLabel(label); }}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        )}

        {/* Page Content */}
        {currentPage !== 'dashboards' && (
        <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: 3 }}>
          {currentPage === 'home' && <HomePage />}
          {currentPage === 'insights' && <InsightsPage />}
          {currentPage === 'themes' && <ThemesPage />}
          {currentPage === 'exports' && <ExportsPage />}

          {/* Portfolio Page */}
          {currentPage === 'portfolio' && (
            <>
              {viewingAssetDetail && selectedAsset?.type === 'asset' ? (
                <AssetDetail asset={selectedAsset} tab={assetTab} onTabChange={setAssetTab} />
              ) : (
                <>
                  {/* ========== BUILDING HERO BANNER ========== */}
                  {selectedBuilding && (
                    <Box sx={{
                      width: '100%',
                      height: 80,
                      borderRadius: 1,
                      overflow: 'hidden',
                      mb: 3,
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
                        pointerEvents: 'none'
                      }
                    }}>
                      <Box
                        component="img"
                        src={selectedBuilding.image}
                        alt={selectedBuilding.name}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <Box sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: 20,
                        right: 20,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        zIndex: 1
                      }}>
                        <Box>
                          <Typography variant="h5" sx={{
                            color: '#fff',
                            fontWeight: 700,
                            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            mb: 0.5
                          }}>
                            {selectedBuilding.name}
                          </Typography>
                          <Typography variant="body2" sx={{
                            color: 'rgba(255,255,255,0.95)',
                            textShadow: '0 1px 4px rgba(0,0,0,0.4)'
                          }}>
                            {selectedBuilding.address}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* ========== PAGE TITLE WITH INLINE FILTERS ========== */}
                  {selectedBuilding && (
                    <Box ref={pageTitleRef} sx={{ mb: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, fontSize: '1.25rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                        Showing {SELECTION_LABELS[selection] ?? 'overall performance'} of
                        <Box
                          component="span"
                          onClick={(e) => setTitleDateRangeAnchor(e.currentTarget)}
                          sx={inlineDropdownSx}
                        >
                          {getPeriodDisplayLabel(dateRange)}
                          <KeyboardArrowDownIcon sx={{ fontSize: 16, ml: '-1px', verticalAlign: 'text-bottom', position: 'relative', top: '1px' }} />
                        </Box>
                      </Typography>

                    </Box>
                  )}
                  {!selectedBuilding && (
                    <Box ref={pageTitleRef} sx={{ mb: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, fontSize: '1.25rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                        Showing {SELECTION_LABELS[selection] ?? 'overall performance'} of
                        <Box
                          component="span"
                          onClick={(e) => setTitleDateRangeAnchor(e.currentTarget)}
                          sx={inlineDropdownSx}
                        >
                          {getPeriodDisplayLabel(dateRange)}
                          <KeyboardArrowDownIcon sx={{ fontSize: 16, ml: '-1px', verticalAlign: 'text-bottom', position: 'relative', top: '1px' }} />
                        </Box>
                        for
                        <Box
                          component="span"
                          onClick={(e) => setTitleBuildingAnchor(e.currentTarget)}
                          sx={inlineDropdownSx}
                        >
                          {getTitleBuildingLabel()}
                          <KeyboardArrowDownIcon sx={{ fontSize: 16, ml: '-1px', verticalAlign: 'text-bottom', position: 'relative', top: '1px' }} />
                        </Box>
                      </Typography>

                    </Box>
                  )}

                  {/* ========== KPI METRICS SECTION ========== */}
                  {/* Parent wrapper: on hover, dim siblings so the hovered panel pops */}
                  <Box sx={{
                    display: 'flex', gap: 2, mb: 3, minWidth: 0,
                    '& > *': {
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                  }}>
                    {/* Overall Score Card */}
                    <Box
                      component="button"
                      onClick={() => { setSelection('overall'); }}
                      sx={{
                        p: isCompact ? 2 : 3,
                        border: selection === 'overall' ? '2px solid' : '1px solid',
                        borderColor: selection === 'overall' ? colors.brand : colors.borderTertiary,
                        borderRadius: 2,
                        bgcolor: colors.bgPrimary,
                        width: 320,
                        minHeight: isCompact ? 340 : 420,
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: selection === 'overall'
                          ? '0 2px 8px rgba(25,118,210,0.15), 0 1px 4px rgba(0,0,0,0.06)'
                          : '0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          borderColor: selection === 'overall' ? colors.brand : colors.borderPrimary,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
                          transform: 'translateY(-1px)',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: isCompact ? 1 : 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SpeedOutlinedIcon sx={{ fontSize: isCompact ? 16 : 20, color: 'text.secondary', transition: 'font-size 0.3s ease' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: isCompact ? '0.875rem' : '1rem', transition: 'font-size 0.3s ease' }}>
                            Performance
                          </Typography>
                        </Box>
                        {selection === 'overall'
                          ? <RadioButtonCheckedIcon sx={{ fontSize: 20, color: colors.brand }} />
                          : <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: '#bdbdbd' }} />}
                      </Box>
                      {(() => {
                        const overallScore = selectedBuilding
                          ? Math.round([...PRIMARY_THEME_KEYS, ...OPERATIONS_KEYS].reduce((sum, k) => sum + selectedBuilding.metrics[k].green, 0) / (PRIMARY_THEME_KEYS.length + OPERATIONS_KEYS.length))
                          : Math.round([...periodMetrics.themes, ...periodMetrics.operations].reduce((sum, m) => sum + m.score, 0) / (periodMetrics.themes.length + periodMetrics.operations.length));
                        const overallRating = getPerformanceRating(overallScore);
                        // Generate sparkline data based on score
                        const sparkData = Array.from({ length: 8 }, (_, i) => {
                          const variation = Math.sin(i * 1.2) * 5 + Math.cos(i * 0.8) * 3;
                          return Math.round(Math.max(10, Math.min(99, overallScore + variation - 4)));
                        });
                        sparkData[sparkData.length - 1] = overallScore;
                        const sparkW = isCompact ? 100 : 140;
                        const sparkH = isCompact ? 35 : 45;
                        const sMax = Math.max(...sparkData);
                        const sMin = Math.min(...sparkData);
                        const sRange = sMax - sMin || 1;
                        const pts = sparkData.map((v, i) => ({
                          x: (i / (sparkData.length - 1)) * sparkW,
                          y: sparkH - ((v - sMin) / sRange) * sparkH,
                        }));
                        let sparkPath = `M ${pts[0].x},${pts[0].y}`;
                        for (let i = 0; i < pts.length - 1; i++) {
                          const p0 = pts[Math.max(i - 1, 0)];
                          const p1 = pts[i];
                          const p2 = pts[i + 1];
                          const p3 = pts[Math.min(i + 2, pts.length - 1)];
                          const t = 0.3;
                          sparkPath += ` C ${p1.x + (p2.x - p0.x) * t},${p1.y + (p2.y - p0.y) * t} ${p2.x - (p3.x - p1.x) * t},${p2.y - (p3.y - p1.y) * t} ${p2.x},${p2.y}`;
                        }

                        return (
                          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                            <svg width={sparkW} height={sparkH} style={{ overflow: 'visible' }}>
                              <path d={sparkPath} fill="none" stroke={overallRating.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <Typography variant="h2" sx={{ fontSize: isCompact ? 48 : 72, fontWeight: 600, transition: 'font-size 0.3s ease' }}>
                              <AnimatedNumber value={overallScore} />%
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              {periodMetrics.periodLabel !== null && (
                                <Tooltip title={`Compared to ${periodMetrics.periodLabel}`} arrow placement="top">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: periodMetrics.overall.trend >= 0 ? 'success.main' : 'error.main' }}>
                                    {periodMetrics.overall.trend >= 0 ? <TrendingUpIcon sx={{ fontSize: isCompact ? 14 : 18 }} /> : <TrendingDownIcon sx={{ fontSize: isCompact ? 14 : 18 }} />}
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: isCompact ? '0.75rem' : '0.875rem' }}>
                                      {Math.abs(periodMetrics.overall.trend)}%
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              )}
                              <Chip
                                label={overallRating.label}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: isCompact ? '0.7rem' : '0.75rem',
                                  fontWeight: 600,
                                  bgcolor: `${overallRating.color}18`,
                                  color: overallRating.color,
                                  '& .MuiChip-label': { px: 1 },
                                }}
                              />
                            </Box>
                          </Box>
                        );
                      })()}
                      {/* Contract filter toggle */}
                      <Box
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        sx={{ mt: 'auto', pt: isCompact ? 1 : 2, display: 'flex', justifyContent: 'center' }}
                      >
                        <ContractFilterToggle value={contractFilter} onChange={setContractFilter} />
                      </Box>
                    </Box>

                    {/* KPI Groups Container — also gets sibling-dimming on hover */}
                    <Box sx={{
                      flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
                      gap: isCompact ? 1.5 : 2, transition: 'gap 0.3s ease',
                    }}>

                        <>
                          {/* ===== THEMES ROW ===== */}
                          <Box
                            className="kpi-group-panel"
                            sx={{
                              p: isCompact ? 1.5 : 2,
                              border: isThemesSelected ? '2px solid' : '1px solid',
                              borderColor: isThemesSelected ? colors.brand : colors.borderTertiary,
                              borderRadius: 2,
                              bgcolor: colors.bgPrimary,
                              boxShadow: isThemesSelected
                                ? '0 2px 8px rgba(25,118,210,0.15), 0 1px 4px rgba(0,0,0,0.06)'
                                : '0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                              cursor: 'pointer',
                              '&:hover': {
                                borderColor: isThemesSelected ? colors.brand : colors.borderPrimary,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
                                transform: 'translateY(-1px)',
                              }
                            }}
                          >
                            {/* Themes Header */}
                            <Box
                              component="button"
                              onClick={() => handleGroupToggle('themes')}
                              sx={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                mb: isCompact ? 1 : 1.5, transition: 'margin 0.3s ease',
                                width: '100%', border: 'none', bgcolor: 'transparent', cursor: 'pointer', p: 0, textAlign: 'left',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <StyleOutlinedIcon sx={{ fontSize: isCompact ? 16 : 18, color: 'text.secondary' }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: isCompact ? '0.75rem' : '0.875rem' }}>
                                  Theme KPIs
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: isCompact ? '1rem' : '1.25rem' }}>
                                  <AnimatedNumber value={themesScore} />%
                                </Typography>
                                {isThemesSelected
                                  ? <RadioButtonCheckedIcon sx={{ fontSize: 20, color: colors.brand }} />
                                  : <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: '#bdbdbd' }} />}
                              </Box>
                            </Box>

                            {/* Primary Theme KPIs — only clickable when themes are active */}
                            <Box sx={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                              gap: isCompact ? 1.5 : 2,
                              transition: 'gap 0.3s ease'
                            }}>
                              {periodMetrics.themes.map((metric, index) => {
                                const metricKey = PRIMARY_THEME_KEYS[index];
                                if (contractFilter && CONTRACT_HIDDEN_THEME_KEYS.includes(metricKey)) return null;
                                const score = selectedBuilding
                                  ? selectedBuilding.metrics[metricKey].green
                                  : metric.score;

                                return (
                                  <KPICard
                                    key={metric.title}
                                    title={metric.title}
                                    icon={themeIcons[metric.title]}
                                    score={score}
                                    trend={metric.trend}
                                    sparklineData={metric.sparklineData}
                                    periodLabel={periodMetrics.periodLabel}
                                    onClick={() => handleMetricSelect(metricKey)}
                                    onToggle={() => handleMetricSelect(metricKey)}
                                    toggleState={getToggleState(metricKey, 'themes')}
                                    isSelected={selection === metricKey}
                                    isDimmed={getToggleState(metricKey, 'themes') === 'off'}
                                    isCompact={isCompact}
                                    performanceRating={getPerformanceRating(score)}
                                    variant="nested"
                                  />
                                );
                              })}
                            </Box>

                          </Box>

                          {/* ===== OPERATIONS ROW ===== */}
                          <Box
                            className="kpi-group-panel"
                            sx={{
                              p: isCompact ? 1.5 : 2,
                              border: isOperationsSelected ? '2px solid' : '1px solid',
                              borderColor: isOperationsSelected ? colors.brand : colors.borderTertiary,
                              borderRadius: 2,
                              bgcolor: colors.bgPrimary,
                              boxShadow: isOperationsSelected
                                ? '0 2px 8px rgba(25,118,210,0.15), 0 1px 4px rgba(0,0,0,0.06)'
                                : '0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                              cursor: 'pointer',
                              '&:hover': {
                                borderColor: isOperationsSelected ? colors.brand : colors.borderPrimary,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
                                transform: 'translateY(-1px)',
                              }
                            }}
                          >
                            {/* Operations Header */}
                            <Box
                              component="button"
                              onClick={() => handleGroupToggle('operations')}
                              sx={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                mb: isCompact ? 1 : 1.5, transition: 'margin 0.3s ease',
                                width: '100%', border: 'none', bgcolor: 'transparent', cursor: 'pointer', p: 0, textAlign: 'left',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EngineeringOutlinedIcon sx={{ fontSize: isCompact ? 16 : 18, color: 'text.secondary' }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: isCompact ? '0.75rem' : '0.875rem' }}>
                                  Operational KPIs
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: isCompact ? '1rem' : '1.25rem' }}>
                                  <AnimatedNumber value={operationsScore} />%
                                </Typography>
                                {isOperationsSelected
                                  ? <RadioButtonCheckedIcon sx={{ fontSize: 20, color: colors.brand }} />
                                  : <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: '#bdbdbd' }} />}
                              </Box>
                            </Box>

                            {/* Operations KPIs */}
                            <Box sx={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                              gap: isCompact ? 1.5 : 2,
                              transition: 'gap 0.3s ease'
                            }}>
                              {periodMetrics.operations.map((metric, index) => {
                                const metricKey = OPERATIONS_KEYS[index];
                                if (contractFilter && CONTRACT_HIDDEN_OPERATIONS_KEYS.includes(metricKey)) return null;
                                const score = selectedBuilding
                                  ? selectedBuilding.metrics[metricKey].green
                                  : metric.score;

                                return (
                                  <KPICard
                                    key={metric.title}
                                    title={metric.title}
                                    icon={operationsIcons[metric.title]}
                                    score={score}
                                    trend={metric.trend}
                                    sparklineData={metric.sparklineData}
                                    periodLabel={periodMetrics.periodLabel}
                                    onClick={() => handleMetricSelect(metricKey)}
                                    onToggle={() => handleMetricSelect(metricKey)}
                                    toggleState={getToggleState(metricKey, 'operations')}
                                    isSelected={selection === metricKey}
                                    isDimmed={getToggleState(metricKey, 'operations') === 'off'}
                                    isCompact={isCompact}
                                    performanceRating={getPerformanceRating(score)}
                                    variant="nested"
                                  />
                                );
                              })}
                            </Box>
                          </Box>
                        </>
                    </Box>
                  </Box>

                  {/* ========== BUILDINGS / PERFORMANCE INDICATORS PANEL ========== */}
                  {!selectedBuilding ? (
                    <Box sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: '#fff',
                      overflow: 'hidden'
                    }}>
                      {/* Panel Header with Tabs */}
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        borderBottom: 1,
                        borderColor: 'divider',
                        bgcolor: colors.bgSecondary
                      }}>
                        <AppTabs
                          value={buildingsPanelTab}
                          onChange={setBuildingsPanelTab}
                          tabs={[
                            { value: 'buildings', label: 'Portfolio' },
                            { value: 'kpi_analysis', label: 'Performance' },
                            { value: 'recommendations', label: 'Insights' },
                          ]}
                        />

                        {/* Sort Dropdown + Building/Cluster toggle — only on Buildings tab */}
                        {buildingsPanelTab === 'buildings' && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Chip
                              icon={<SortOutlinedIcon sx={{ fontSize: 16 }} />}
                              label={sortOrder}
                              onClick={(e) => setSortAnchorEl(e.currentTarget)}
                              deleteIcon={<ExpandMoreIcon />}
                              onDelete={(e) => setSortAnchorEl(e.currentTarget as any)}
                              sx={{
                                height: 32,
                                borderRadius: '6px',
                                backgroundColor: colors.bgPrimaryHover,
                                '&:hover': { backgroundColor: '#e8e8e8' },
                                '& .MuiChip-label': { px: 1, fontSize: '0.813rem', fontWeight: 500 }
                              }}
                            />
                            <Menu
                              anchorEl={sortAnchorEl}
                              open={Boolean(sortAnchorEl)}
                              onClose={() => setSortAnchorEl(null)}
                            >
                              <MenuItem onClick={() => { setSortOrder('Worst to Best'); setSortAnchorEl(null); }}>Worst to Best</MenuItem>
                              <MenuItem onClick={() => { setSortOrder('Best to Worst'); setSortAnchorEl(null); }}>Best to Worst</MenuItem>
                              <MenuItem onClick={() => { setSortOrder('Most Improved'); setSortAnchorEl(null); }}>Most Improved</MenuItem>
                              <MenuItem onClick={() => { setSortOrder('Most Deteriorated'); setSortAnchorEl(null); }}>Most Deteriorated</MenuItem>
                              <MenuItem onClick={() => { setSortOrder('A to Z'); setSortAnchorEl(null); }}>A to Z</MenuItem>
                              <MenuItem onClick={() => { setSortOrder('Z to A'); setSortAnchorEl(null); }}>Z to A</MenuItem>
                            </Menu>
                          </Box>
                        )}
                      </Box>

                      {/* Panel Content */}
                      <Box sx={{ p: 2.5 }}>
                        {buildingsPanelTab === 'buildings' ? (
                          <>
                            {/* Group Selection Banner */}
                            {(selection === 'themes_group' || selection === 'operations_group') && (
                              <Box sx={{
                                mb: 3,
                                p: 3,
                                borderRadius: 1,
                                bgcolor: selection === 'themes_group' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(237, 108, 2, 0.08)',
                                border: '2px solid',
                                borderColor: selection === 'themes_group' ? 'rgba(25, 118, 210, 0.3)' : 'rgba(237, 108, 2, 0.3)',
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                  {selection === 'themes_group' ? (
                                    <StyleOutlinedIcon sx={{ fontSize: 32, color: colors.brand }} />
                                  ) : (
                                    <EngineeringOutlinedIcon sx={{ fontSize: 32, color: '#ed6c02' }} />
                                  )}
                                  <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                                      {selection === 'themes_group' ? 'Theme KPIs' : 'Operational KPIs'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {selection === 'themes_group'
                                        ? 'Environmental and facility performance metrics across your portfolio'
                                        : 'Day-to-day operational efficiency and maintenance metrics'}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                  <Box sx={{ flex: 1, p: 2, bgcolor: '#fff', borderRadius: 1 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                      Average Score
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                      {selection === 'themes_group' ? themesScore : operationsScore}%
                                    </Typography>
                                  </Box>
                                  <Box sx={{ flex: 1, p: 2, bgcolor: '#fff', borderRadius: 1 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                      Buildings Monitored
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                      {filteredBuildings.length}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ flex: 1, p: 2, bgcolor: '#fff', borderRadius: 1 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                      {selection === 'themes_group' ? 'KPIs' : 'Active Areas'}
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                      {selection === 'themes_group' ? PRIMARY_THEME_KEYS.length : OPERATIONS_KEYS.length}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            )}

                            {/* ===== BUILDINGS / CLUSTERS GRID ===== */}
                            <Box sx={{
                              display: 'grid',
                              gap: 2,
                              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))'
                            }}>
                              {titleBuildingMode === 'clusters' ? (
                                clusterData.map((cluster) => (
                                  <motion.div
                                    key={cluster.name}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                      layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                                      opacity: { duration: 0.3 },
                                      scale: { duration: 0.3 }
                                    }}
                                    style={{ cursor: 'pointer', borderRadius: '12px' }}
                                  >
                                    <ClusterCard
                                      title={cluster.name}
                                      buildingCount={cluster.buildings.length}
                                      images={cluster.images}
                                      performance={cluster.metrics[selectedMetric]}
                                      metricTitle={metricInfo[selectedMetric].title}
                                      metricIcon={metricInfo[selectedMetric].icon}
                                      overallPerformance={cluster.metrics.overall}
                                      showOverall={selectedMetric !== 'overall'}
                                      trend={cluster.trends[selectedMetric]}
                                      periodLabel={periodMetrics.periodLabel}
                                      topics={selection === 'themes_group' ? getThemesTopics(cluster.metrics as Record<MetricKeys, { green: number }>, cluster.trends as Record<MetricKeys, number>) : selectedMetric === 'comfort' ? getComfortTopics(cluster.metrics.comfort.green) : selectedMetric === 'sustainability' ? getSustainabilityTopics(cluster.metrics.sustainability.green) : selectedMetric === 'maintenance' ? getMaintenanceTopics(cluster.metrics.maintenance.green) : selectedMetric === 'quotations' ? getQuotationsTopics(cluster.metrics.quotations.green) : selectedMetric === 'tickets' ? getTicketsTopics(cluster.metrics.tickets.green) : undefined}
                                    />
                                  </motion.div>
                                ))
                              ) : (
                                filteredBuildings.map((b) => {
                              const stats = buildingOperationalStats[b.name];
                              let operationalStats;

                              if (selectedMetric === 'sustainability' && stats) {
                                operationalStats = undefined;
                              } else if (selectedMetric === 'comfort' && stats) {
                                operationalStats = undefined;
                              } else if (selectedMetric === 'asset_monitoring' && stats) {
                                operationalStats = [
                                  { label: 'Alerts', value: stats.assetMonitoring.alerts, icon: <NotificationsActiveOutlinedIcon sx={{ fontSize: 16 }} /> }
                                ];
                              } else if (selectedMetric === 'tickets' && stats) {
                                operationalStats = [
                                  { label: 'Tickets', value: stats.tickets.count, icon: <ConfirmationNumberOutlinedIcon sx={{ fontSize: 16 }} /> },
                                  { label: 'Outstanding', value: formatCurrency(stats.tickets.outstanding), icon: <EuroOutlinedIcon sx={{ fontSize: 16 }} /> }
                                ];
                              } else if (selectedMetric === 'quotations' && stats) {
                                operationalStats = undefined;
                              } else if (selectedMetric === 'maintenance' && stats) {
                                operationalStats = undefined;
                              }

                              return (
                                <motion.div
                                  key={b.name}
                                  layout
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{
                                    layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                                    opacity: { duration: 0.3 },
                                    scale: { duration: 0.3 }
                                  }}
                                  onClick={(e) => isInspectMode ? handleInspectBuilding(b, e) : setSelectedBuilding(b)}
                                  onMouseEnter={(e) => handleBuildingHover(b, e)}
                                  onMouseLeave={() => handleBuildingHover(null)}
                                  style={{
                                    cursor: 'pointer',
                                    outline: isInspectMode && hoveredBuilding === b ? `3px dashed ${colors.brand}` : 'none',
                                    outlineOffset: '4px',
                                    borderRadius: '12px',
                                    transition: 'outline 0.2s ease, z-index 0.2s ease',
                                    position: 'relative',
                                    zIndex: isInspectMode && hoveredBuilding === b ? 1100 : 'auto'
                                  }}
                                >
                                  <BuildingCard
                                    title={b.name}
                                    address={b.address}
                                    image={b.image}
                                    performance={b.metrics[selectedMetric]}
                                    metricTitle={metricInfo[selectedMetric].title}
                                    metricIcon={metricInfo[selectedMetric].icon}
                                    overallPerformance={b.metrics.overall}
                                    showOverall={selectedMetric !== 'overall'}
                                    operationalStats={operationalStats}
                                    trend={b.trends[selectedMetric]}
                                    periodLabel={periodMetrics.periodLabel}
                                    topics={selection === 'themes_group' ? getThemesTopics(b.metrics, b.trends) : selectedMetric === 'comfort' ? getComfortTopics(b.metrics.comfort.green) : selectedMetric === 'sustainability' ? getSustainabilityTopics(b.metrics.sustainability.green) : selectedMetric === 'asset_monitoring' ? getAssetMonitoringTopics(b.metrics.asset_monitoring.green) : selectedMetric === 'compliance' ? getComplianceTopics(b.metrics.compliance.green) : selectedMetric === 'maintenance' ? getMaintenanceTopics(b.metrics.maintenance.green) : selectedMetric === 'quotations' ? getQuotationsTopics(b.metrics.quotations.green) : selectedMetric === 'tickets' ? getTicketsTopics(b.metrics.tickets.green) : undefined}
                                    energyRating={selectedMetric === 'sustainability' && stats ? stats.sustainability.weiiRating : undefined}
                                    alertCount={selectedMetric === 'comfort' && stats ? stats.comfort.alerts : selectedMetric === 'sustainability' && stats ? stats.sustainability.alerts : selectedMetric === 'asset_monitoring' && stats ? stats.assetMonitoring.alerts : undefined}
                                  />
                                </motion.div>
                              );
                            })
                              )}
                            </Box>
                          </>
                        ) : buildingsPanelTab === 'kpi_analysis' ? (
                          /* ===== KPI ANALYSIS VIEW ===== */
                          <KPIAnalysisView
                            selection={selection}
                            selectedMetric={selectedMetric}
                            themesEnabled={isThemesActive}
                            operationsEnabled={isOperationsActive}
                            metricInfo={metricInfo}
                            onMetricSelect={handleMetricSelect}
                            periodMetrics={periodMetrics}
                            onBuildingSelect={setSelectedBuilding}
                            onViewAllBuildings={(sort) => {
                              setBuildingsPanelTab('buildings');
                              setURLParams({ sort });
                            }}
                            buildingMode={titleBuildingMode}
                            onNavigateToDashboard={(id) => {
                              setPendingDashboardId(id);
                              handlePageChange('dashboards');
                            }}
                          />
                        ) : (
                          /* ===== RECOMMENDATIONS VIEW ===== */
                          <RecommendationsInbox />
                        )}
                      </Box>
                    </Box>
                  ) : (
                    /* ===== Building Level Detail ===== */
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {/* Selected KPI Title */}
                      {selectedMetric !== 'overall' && (
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          pt: 2,
                          borderTop: 1,
                          borderColor: 'divider'
                        }}>
                          {metricInfo[selectedMetric].icon}
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {metricInfo[selectedMetric].title}
                          </Typography>
                        </Box>
                      )}

                      {selectedMetric === 'tickets' ? (
                        <TicketsList tickets={tickets} buildingName={selectedBuilding.name} compact={viewMode === 'list'} />
                      ) : selectedMetric === 'quotations' ? (
                        <QuotationsList quotations={quotations} buildingName={selectedBuilding.name} compact={viewMode === 'list'} />
                      ) : selectedMetric === 'maintenance' ? (
                        <MaintenanceScheduleList schedules={maintenanceSchedules} buildingName={selectedBuilding.name} compact={viewMode === 'list'} />
                      ) : selectedMetric === 'sustainability' ? (
                        <>
                          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <ElectricityConsumptionChart buildingName={selectedBuilding.name} />
                            <GasConsumptionChart buildingName={selectedBuilding.name} />
                          </Box>
                          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            <EnergyUseByBuildingChart buildingName={selectedBuilding.name} />
                            <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: '#fff', height: 300 }}>
                              <Typography variant="body2" color="text.secondary">Consumption and generation</Typography>
                            </Box>
                            <EnergyDistributionChart buildingName={selectedBuilding.name} />
                          </Box>
                          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <PowerProfilesChart buildingName={selectedBuilding.name} />
                            <CostsCO2Chart buildingName={selectedBuilding.name} />
                          </Box>
                          <ForecastTargetChart buildingName={selectedBuilding.name} />
                          <EnergyTemperatureChart buildingName={selectedBuilding.name} />
                        </>
                      ) : selectedMetric === 'comfort' ? (
                        <>
                          <ComfortTemperatureTrendChart buildingName={selectedBuilding.name} />
                          <ComfortHumidityTrendChart buildingName={selectedBuilding.name} />
                          <ComfortAirQualityTrendChart buildingName={selectedBuilding.name} />
                          <ComfortATGChart buildingName={selectedBuilding.name} />
                        </>
                      ) : selectedMetric === 'asset_monitoring' ? (
                        <>
                          <AssetTrendChart buildingName={selectedBuilding.name} assetFilter={selectedAsset?.name} />
                          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <AssetHealthDistributionChart buildingName={selectedBuilding.name} assetFilter={selectedAsset?.name} />
                            <AssetPerformanceByCategoryChart buildingName={selectedBuilding.name} assetFilter={selectedAsset?.name} />
                          </Box>
                          <CriticalAssetsCard
                            buildingName={selectedBuilding.name}
                            assetFilter={selectedAsset?.name}
                            isInspectMode={isInspectMode}
                            onInspectAsset={(assetId, assetName, assetCategory) => {
                              const assetNode: AssetNode = {
                                id: assetId,
                                name: assetName,
                                type: assetCategory as AssetNode['type'],
                                metadata: {
                                  category: assetCategory,
                                  status: 'Critical'
                                }
                              };
                              setLocalQuickviewAsset(assetNode);
                              setURLParams({ explorer: '1' });
                              setOpenedViaInspect(true);
                            }}
                            onHoverAsset={(asset, event) => {
                              if (asset && event) {
                                setHoveredAsset(asset);
                                const rect = event.currentTarget.getBoundingClientRect();
                                setHoverPosition({
                                  x: rect.left + rect.width / 2,
                                  y: rect.top
                                });
                              } else {
                                setHoveredAsset(null);
                                setHoverPosition(null);
                              }
                            }}
                            hoveredAssetId={hoveredAsset?.id || null}
                          />
                          <MaintenanceOverviewTable buildingName={selectedBuilding.name} assetFilter={selectedAsset?.name} title="Maintenance overview air filters" />
                          <MaintenanceOverviewTable buildingName={selectedBuilding.name} assetFilter={selectedAsset?.name} title="Maintenance overview HVAC systems" />
                        </>
                      ) : selectedMetric === 'overall' ? (
                        <>
                          <PerformanceHeatmapChart buildingName={selectedBuilding.name} />
                          <AssetListPanel buildingName={selectedBuilding.name} />
                          <UtilizationOverviewChart buildingName={selectedBuilding.name} />
                        </>
                      ) : selectedMetric === 'energy' ? (
                        <>
                          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <ElectricityConsumptionChart buildingName={selectedBuilding.name} />
                            <GasConsumptionChart buildingName={selectedBuilding.name} />
                          </Box>
                          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <PowerProfilesChart buildingName={selectedBuilding.name} />
                            <CostsCO2Chart buildingName={selectedBuilding.name} />
                          </Box>
                          <EnergyDistributionChart buildingName={selectedBuilding.name} />
                        </>
                      ) : selectedMetric === 'workspace' ? (
                        <>
                          <UtilizationOverviewChart buildingName={selectedBuilding.name} />
                          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <Box sx={{ p: 3, border: 1, borderColor: 'divider', bgcolor: '#fff' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Space Allocation</Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {['Open Workspace', 'Private Offices', 'Meeting Rooms', 'Common Areas', 'Storage'].map((space, i) => (
                                  <Box key={space}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                      <Typography variant="body2">{space}</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{[45, 25, 15, 10, 5][i]}%</Typography>
                                    </Box>
                                    <Box sx={{ height: 8, borderRadius: 4, bgcolor: colors.bgSecondaryHover, overflow: 'hidden' }}>
                                      <Box sx={{ width: `${[45, 25, 15, 10, 5][i]}%`, height: '100%', bgcolor: colors.brand, transition: 'width 0.5s ease' }} />
                                    </Box>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                            <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: '#fff' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Occupancy Trends</Typography>
                              <Typography variant="body2" color="text.secondary">Peak hours, utilization patterns, and capacity insights</Typography>
                            </Box>
                          </Box>
                        </>
                      ) : selectedMetric === 'compliance' ? (
                        <>
                          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: '#fff' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Compliance Score</Typography>
                              <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>94%</Typography>
                              <Typography variant="body2" color="success.main">+3% from last audit</Typography>
                            </Box>
                            <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: '#fff' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Active Certifications</Typography>
                              <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>8</Typography>
                              <Typography variant="body2" color="text.secondary">ISO, LEED, BREEAM</Typography>
                            </Box>
                            <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: '#fff' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Pending Actions</Typography>
                              <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>3</Typography>
                              <Typography variant="body2" color="warning.main">Due within 30 days</Typography>
                            </Box>
                          </Box>
                          <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: '#fff' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Compliance Areas</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {[
                                { area: 'Fire Safety', score: 98, status: 'Excellent' },
                                { area: 'Accessibility', score: 95, status: 'Very Good' },
                                { area: 'Environmental', score: 92, status: 'Good' },
                                { area: 'Health & Safety', score: 88, status: 'Good' }
                              ].map((item) => (
                                <Box key={item.area} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant="body2" sx={{ minWidth: 150 }}>{item.area}</Typography>
                                  <Box sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: colors.bgSecondaryHover, overflow: 'hidden' }}>
                                    <Box sx={{ width: `${item.score}%`, height: '100%', bgcolor: item.score > 90 ? '#4caf50' : '#ffc107' }} />
                                  </Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 60 }}>{item.score}%</Typography>
                                  <Chip label={item.status} size="small" color={item.score > 90 ? 'success' : 'warning'} sx={{ minWidth: 80 }} />
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </>
                      ) : (
                        /* Generic view for other theme metrics */
                        <GenericMetricView metricKey={selectedMetric} metricInfo={metricInfo} buildingName={selectedBuilding.name} />
                      )}
                    </Box>
                  )}
                </>
              )}
            </>
          )}
        </Container>
        )}
      </Box>

      <ChangelogButton />

      {/* Export toast */}
      <Snackbar
        open={exportToast.open}
        autoHideDuration={4000}
        onClose={() => setExportToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setExportToast(prev => ({ ...prev, open: false }))}
          severity={exportToast.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {exportToast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}


/* ========================================================================
   KPI ANALYSIS VIEW
   Shown when "KPI Analysis" tab is selected in the buildings panel
   ======================================================================== */
function KPIAnalysisView({
  selection,
  selectedMetric,
  themesEnabled,
  operationsEnabled,
  metricInfo,
  onMetricSelect,
  periodMetrics,
  onBuildingSelect,
  onViewAllBuildings,
  buildingMode = 'buildings',
  onNavigateToDashboard,
}: {
  selection: string;
  selectedMetric: MetricType;
  themesEnabled: boolean;
  operationsEnabled: boolean;
  metricInfo: Record<MetricType, { title: string; icon: React.ReactNode }>;
  onMetricSelect: (metric: MetricType) => void;
  periodMetrics: import('@/data/metrics').PeriodMetrics;
  onBuildingSelect?: (building: import('@/data/buildings').Building) => void;
  onViewAllBuildings?: (sort: 'Best to Worst' | 'Worst to Best') => void;
  buildingMode?: import('@/components/BuildingSelector').BuildingFilterMode;
  onNavigateToDashboard?: (dashboardId: string) => void;
}) {
  // Determine which KPIs to show based on toggle state and selection
  const visibleThemes = themesEnabled ? ALL_THEME_KEYS : [];
  const visibleOps = operationsEnabled ? OPERATIONS_KEYS : [];
  const allVisible = [...visibleThemes, ...visibleOps];

  // If a specific child metric is selected (not a group), show its detailed view
  const focusedMetric = (selection !== 'overall' && selection !== 'themes_group' && selection !== 'operations_group' && allVisible.includes(selection as MetricType))
    ? (selection as MetricType)
    : null;

  if (focusedMetric) {
    return <ThemeSpecificDashboard metricKey={focusedMetric} metricInfo={metricInfo} periodMetrics={periodMetrics} onBuildingSelect={onBuildingSelect} onViewAllBuildings={onViewAllBuildings} buildingMode={buildingMode} onNavigateToDashboard={onNavigateToDashboard} />;
  }

  // Themes group: show combined themes performance page
  if (selection === 'themes_group') {
    const sustMetric = periodMetrics.themes.find(t => t.title === 'Sustainability');
    const comfMetric = periodMetrics.themes.find(t => t.title === 'Comfort');
    const amMetric = periodMetrics.themes.find(t => t.title === 'Asset Monitoring');
    const compMetric = periodMetrics.themes.find(t => t.title === 'Compliance');
    const themeScores = {
      sustainability: sustMetric?.score ?? 72,
      comfort: comfMetric?.score ?? 92,
      asset_monitoring: amMetric?.score ?? 62,
      compliance: compMetric?.score ?? 88,
    };
    const themeTrends = {
      sustainability: sustMetric?.trend ?? 4,
      comfort: comfMetric?.trend ?? 5,
      asset_monitoring: amMetric?.trend ?? 2,
      compliance: compMetric?.trend ?? 6,
    };
    const avgScore = Math.round((themeScores.sustainability + themeScores.comfort + themeScores.asset_monitoring + themeScores.compliance) / 4);
    const avgTrend = Math.round(((themeTrends.sustainability + themeTrends.comfort + themeTrends.asset_monitoring + themeTrends.compliance) / 4) * 10) / 10;
    return <ThemesPerformancePage themeScores={themeScores} themeTrends={themeTrends} overallScore={avgScore} overallTrend={avgTrend} onBuildingSelect={onBuildingSelect} onViewAllBuildings={onViewAllBuildings} buildingMode={buildingMode} onNavigateToDashboard={onNavigateToDashboard} />;
  }

  // Overview: show summary cards for each visible KPI
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
        Performance Indicators Overview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Select a specific KPI above to see detailed performance breakdowns, or browse the overview below.
      </Typography>

      {/* Themes indicators - show all 9 theme KPIs */}
      {themesEnabled && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>Themes</Typography>
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {ALL_THEME_KEYS.map((key) => (
              <IndicatorSummaryCard key={key} metricKey={key} metricInfo={metricInfo} onClick={() => onMetricSelect(key)} />
            ))}
          </Box>
        </Box>
      )}

      {/* Operations indicators */}
      {operationsEnabled && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>Operations</Typography>
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {OPERATIONS_KEYS.map((key) => (
              <IndicatorSummaryCard key={key} metricKey={key} metricInfo={metricInfo} onClick={() => onMetricSelect(key)} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

/* Summary stat card for performance indicators */
function SummaryStatCard({ label, value, subtitle, trend }: { label: string; value: string; subtitle?: string; trend?: number }) {
  return (
    <Box sx={{
      p: 2.5,
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      bgcolor: colors.bgSecondary,
    }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'block', mb: 1 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: trend >= 0 ? 'success.main' : 'error.main' }}>
            {trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
            <Typography variant="caption" sx={{ fontWeight: 600 }}>{Math.abs(trend)}%</Typography>
          </Box>
        )}
      </Box>
      {subtitle && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{subtitle}</Typography>
      )}
    </Box>
  );
}

/* Placeholder chart for performance indicators */
function IndicatorChart({ title, type, color }: { title: string; type: string; color: string }) {
  return (
    <Box sx={{
      p: 3,
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      bgcolor: colors.bgSecondary,
      minHeight: 240,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>{title}</Typography>
      {/* Simulated chart area */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 0.5, px: 1 }}>
        {type === 'bar' && Array.from({ length: 12 }).map((_, i) => (
          <Box key={i} sx={{
            flex: 1,
            height: `${30 + Math.random() * 60}%`,
            bgcolor: color,
            borderRadius: '2px 2px 0 0',
            opacity: 0.3 + Math.random() * 0.7,
            transition: 'height 0.3s ease',
          }} />
        ))}
        {type === 'line' && (
          <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            <path
              d={`M 0,${70 - Math.random() * 30} ${Array.from({ length: 10 }).map((_, i) => `L ${(i + 1) * 20},${30 + Math.random() * 50}`).join(' ')}`}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
        {type === 'ranking' && (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {['Velocity Center', 'North Star', 'Green Park Office', 'Prism Complex', 'Pinnacle Tower'].map((name, i) => (
              <Box key={name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 16 }}>{i + 1}</Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.813rem', fontWeight: 500 }}>{name}</Typography>
                  <Box sx={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', bgcolor: colors.bgSecondaryHover, mt: 0.5 }}>
                    <Box sx={{ width: `${90 - i * 8}%`, bgcolor: color, borderRadius: 2, opacity: 1 - i * 0.12 }} />
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 32, textAlign: 'right' }}>{90 - i * 8}%</Typography>
              </Box>
            ))}
          </Box>
        )}
        {type === 'pie' && (
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="55" fill="none" stroke={colors.borderSecondary} strokeWidth="20" />
              <circle cx="70" cy="70" r="55" fill="none" stroke={color} strokeWidth="20"
                strokeDasharray={`${0.72 * 345.6} ${0.28 * 345.6}`}
                strokeDashoffset="86.4"
                strokeLinecap="round"
              />
              <text x="70" y="70" textAnchor="middle" dy="6" fontSize="18" fontWeight="600" fill="#333">72%</text>
            </svg>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* Theme-specific dashboards */
function ThemeSpecificDashboard({ metricKey, metricInfo, periodMetrics, onBuildingSelect, onViewAllBuildings, buildingMode = 'buildings', onNavigateToDashboard }: { metricKey: MetricType; metricInfo: Record<MetricType, { title: string; icon: React.ReactNode }>; periodMetrics: import('@/data/metrics').PeriodMetrics; onBuildingSelect?: (building: import('@/data/buildings').Building) => void; onViewAllBuildings?: (sort: 'Best to Worst' | 'Worst to Best') => void; buildingMode?: import('@/components/BuildingSelector').BuildingFilterMode; onNavigateToDashboard?: (dashboardId: string) => void }) {
  const info = metricInfo[metricKey];
  const cardData = themeCardData[metricKey];

  // Common header
  const header = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
      {info.icon}
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        {info.title} — Portfolio Analytics
      </Typography>
    </Box>
  );

  // Energy Dashboard
  if (metricKey === 'energy') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {header}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <SummaryStatCard label="Total Consumption" value="2.4M kWh" subtitle="This month" trend={-3} />
          <SummaryStatCard label="Energy Cost" value="€342K" subtitle="This month" trend={2} />
          <SummaryStatCard label="Efficiency Score" value="87%" trend={5} />
          <SummaryStatCard label="Carbon Footprint" value="1,240 tons" trend={-7} />
        </Box>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <IndicatorChart title="Energy Consumption Trend (12 months)" type="line" color="#ed6c02" />
          <IndicatorChart title="Cost Analysis by Building" type="bar" color="#ed6c02" />
        </Box>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <IndicatorChart title="Energy Distribution by Source" type="pie" color="#ed6c02" />
          <IndicatorChart title="Peak Demand Times" type="bar" color="#ed6c02" />
          <IndicatorChart title="Top Consumers" type="ranking" color="#f44336" />
        </Box>
        <IndicatorChart title="Energy vs Temperature Correlation" type="line" color="#ed6c02" />
      </Box>
    );
  }

  // Sustainability Dashboard — uses dedicated component
  if (metricKey === 'sustainability') {
    const sustainabilityMetric = periodMetrics.themes.find(t => t.title === 'Sustainability');
    return <SustainabilityPerformancePage themeScore={sustainabilityMetric?.score ?? 72} themeTrend={sustainabilityMetric?.trend ?? 4} onBuildingSelect={onBuildingSelect} onViewAllBuildings={onViewAllBuildings} buildingMode={buildingMode} onNavigateToDashboard={onNavigateToDashboard} />;
  }

  // Comfort Dashboard — uses dedicated component
  if (metricKey === 'comfort') {
    const comfortMetric = periodMetrics.themes.find(t => t.title === 'Comfort');
    return <ComfortPerformancePage themeScore={comfortMetric?.score ?? 92} themeTrend={comfortMetric?.trend ?? 5} onBuildingSelect={onBuildingSelect} onViewAllBuildings={onViewAllBuildings} buildingMode={buildingMode} onNavigateToDashboard={onNavigateToDashboard} />;
  }

  // Asset Monitoring Dashboard — uses dedicated component
  if (metricKey === 'asset_monitoring') {
    const assetMonitoringMetric = periodMetrics.themes.find(t => t.title === 'Asset Monitoring');
    return <AssetMonitoringPerformancePage themeScore={assetMonitoringMetric?.score ?? 62} themeTrend={assetMonitoringMetric?.trend ?? 2} onBuildingSelect={onBuildingSelect} onViewAllBuildings={onViewAllBuildings} buildingMode={buildingMode} onNavigateToDashboard={onNavigateToDashboard} />;
  }

  // Access Control Dashboard
  if (metricKey === 'access_control') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {header}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <SummaryStatCard label="Active Cards" value="12,453" trend={5} />
          <SummaryStatCard label="Access Points" value="847" subtitle="Across portfolio" />
          <SummaryStatCard label="Unauthorized Attempts" value="12" subtitle="This week" trend={-20} />
          <SummaryStatCard label="System Uptime" value="99.8%" trend={0} />
        </Box>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <IndicatorChart title="Access Activity (24 hours)" type="line" color={colors.brand} />
          <IndicatorChart title="Access by Building" type="bar" color={colors.brand} />
        </Box>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <IndicatorChart title="Peak Access Times" type="bar" color={colors.brand} />
          <IndicatorChart title="Card Status Distribution" type="pie" color={colors.brand} />
          <IndicatorChart title="Security Events" type="ranking" color="#f44336" />
        </Box>
      </Box>
    );
  }

  // Water Management Dashboard
  if (metricKey === 'water_management') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {header}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <SummaryStatCard label="Monthly Usage" value="142K m³" subtitle="vs 135K target" trend={5} />
          <SummaryStatCard label="Water Cost" value="€68K" trend={4} />
          <SummaryStatCard label="Active Leaks" value="2" subtitle="Detected" trend={-50} />
          <SummaryStatCard label="Conservation Rate" value="15%" trend={8} />
        </Box>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <IndicatorChart title="Water Consumption Trend" type="line" color={colors.brand} />
          <IndicatorChart title="Usage by Building" type="bar" color={colors.brand} />
        </Box>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <IndicatorChart title="Leak Detection History" type="line" color="#f44336" />
          <IndicatorChart title="Conservation Initiatives" type="bar" color="#4caf50" />
          <IndicatorChart title="Top Water Consumers" type="ranking" color={colors.brand} />
        </Box>
      </Box>
    );
  }

  // Security Systems Dashboard
  if (metricKey === 'security_systems') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {header}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <SummaryStatCard label="Cameras Active" value="1,234" subtitle="98% operational" />
          <SummaryStatCard label="Incidents" value="3" subtitle="This month" trend={-40} />
          <SummaryStatCard label="Response Time" value="2.3 min" subtitle="Average" trend={-12} />
          <SummaryStatCard label="System Health" value="97%" trend={2} />
        </Box>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <IndicatorChart title="Incident Trends" type="line" color="#4caf50" />
          <IndicatorChart title="Security Coverage by Zone" type="bar" color="#4caf50" />
        </Box>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <IndicatorChart title="Alert Types" type="pie" color="#4caf50" />
          <IndicatorChart title="Response Times by Building" type="bar" color="#4caf50" />
          <IndicatorChart title="Camera Health Status" type="ranking" color="#4caf50" />
        </Box>
      </Box>
    );
  }

  // Workspace Dashboard
  if (metricKey === 'workspace') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {header}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <SummaryStatCard label="Avg Occupancy" value="68%" trend={3} />
          <SummaryStatCard label="Space Utilization" value="72%" trend={5} />
          <SummaryStatCard label="Desk Bookings" value="1,247" subtitle="This week" trend={8} />
          <SummaryStatCard label="Meeting Room Usage" value="85%" trend={2} />
        </Box>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <IndicatorChart title="Occupancy Trends (7 days)" type="line" color={colors.brand} />
          <IndicatorChart title="Space Utilization by Floor" type="bar" color={colors.brand} />
        </Box>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <IndicatorChart title="Peak Hours" type="bar" color={colors.brand} />
          <IndicatorChart title="Space Types Distribution" type="pie" color={colors.brand} />
          <IndicatorChart title="Booking Patterns" type="line" color={colors.brand} />
        </Box>
      </Box>
    );
  }

  // Compliance Dashboard
  // Compliance Dashboard — uses dedicated component
  if (metricKey === 'compliance') {
    const complianceMetric = periodMetrics.themes.find(t => t.title === 'Compliance');
    return <CompliancePerformancePage themeScore={complianceMetric?.score ?? 88} themeTrend={complianceMetric?.trend ?? 6} onBuildingSelect={onBuildingSelect} onViewAllBuildings={onViewAllBuildings} buildingMode={buildingMode} onNavigateToDashboard={onNavigateToDashboard} />;
  }

  // Tickets Dashboard — uses dedicated component
  if (metricKey === 'tickets') {
    const ticketsMetric = periodMetrics.operations.find(t => t.title === 'Tickets');
    return <TicketsPerformancePage themeScore={ticketsMetric?.score ?? 71} themeTrend={ticketsMetric?.trend ?? 1} onBuildingSelect={onBuildingSelect} onViewAllBuildings={onViewAllBuildings} buildingMode={buildingMode} onNavigateToDashboard={onNavigateToDashboard} />;
  }

  // Quotations Dashboard — uses dedicated component
  if (metricKey === 'quotations') {
    const quotationsMetric = periodMetrics.operations.find(t => t.title === 'Quotations');
    return <QuotationsPerformancePage themeScore={quotationsMetric?.score ?? 74} themeTrend={quotationsMetric?.trend ?? 2} onBuildingSelect={onBuildingSelect} onViewAllBuildings={onViewAllBuildings} buildingMode={buildingMode} onNavigateToDashboard={onNavigateToDashboard} />;
  }

  // Maintenance Dashboard — uses dedicated component
  if (metricKey === 'maintenance') {
    const maintenanceMetric = periodMetrics.operations.find(t => t.title === 'Maintenance');
    return <MaintenancePerformancePage themeScore={maintenanceMetric?.score ?? 78} themeTrend={maintenanceMetric?.trend ?? 3} onBuildingSelect={onBuildingSelect} onViewAllBuildings={onViewAllBuildings} buildingMode={buildingMode} onNavigateToDashboard={onNavigateToDashboard} />;
  }

  // Default fallback
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {header}
      <Typography variant="body1" color="text.secondary">
        Dashboard for {info.title} is being developed...
      </Typography>
    </Box>
  );
}

/* Detailed theme card data */
const themeCardData: Record<string, {
  description: string;
  alerts: number;
  metrics: { label: string; value: string; target?: string; progress: number; color: string }[];
}> = {
  energy: {
    description: 'Energy consumption, efficiency, and sustainability metrics across your portfolio',
    alerts: 3,
    metrics: [
      { label: 'Total Consumption', value: '2.4M kWh', target: '2.2M kWh', progress: 109, color: '#ed6c02' },
      { label: 'Cost This Month', value: '€342K', target: '€320K', progress: 107, color: '#ed6c02' },
      { label: 'Efficiency Score', value: '87%', progress: 87, color: '#ed6c02' },
      { label: 'Carbon Footprint', value: '1,240 tons', target: '1,100 tons', progress: 113, color: '#ed6c02' },
    ]
  },
  sustainability: {
    description: 'Environmental and sustainability performance metrics across your portfolio',
    alerts: 2,
    metrics: [
      { label: 'WEii Rating', value: 'A', progress: 92, color: '#4caf50' },
      { label: 'Energy Efficiency', value: '87%', progress: 87, color: '#4caf50' },
      { label: 'Water Conservation', value: '15%', progress: 75, color: '#4caf50' },
      { label: 'Waste Reduction', value: '68%', progress: 68, color: '#ffc107' },
    ]
  },
  comfort: {
    description: 'Indoor environmental quality and occupant comfort metrics',
    alerts: 5,
    metrics: [
      { label: 'Avg Temperature', value: '21.5°C', target: '21°C', progress: 98, color: '#f44336' },
      { label: 'Air Quality Index', value: '92', progress: 92, color: '#f44336' },
      { label: 'System Efficiency', value: '84%', progress: 84, color: '#f44336' },
      { label: 'Maintenance Due', value: '8 units', progress: 60, color: '#f44336' },
    ]
  },
  asset_monitoring: {
    description: 'Real-time asset health, performance, and maintenance tracking',
    alerts: 4,
    metrics: [
      { label: 'Assets Monitored', value: '2,453', progress: 100, color: colors.brand },
      { label: 'Health Score', value: '78%', progress: 78, color: '#ffc107' },
      { label: 'Critical Alerts', value: '12', progress: 40, color: '#f44336' },
      { label: 'Uptime', value: '99.2%', progress: 99, color: '#4caf50' },
    ]
  },
  access_control: {
    description: 'Physical access, security systems, and entry management',
    alerts: 1,
    metrics: [
      { label: 'Active Cards', value: '12,453', progress: 100, color: colors.brand },
      { label: 'Access Points', value: '847', progress: 100, color: colors.brand },
      { label: 'Unauthorized Attempts', value: '12', progress: 95, color: colors.brand },
      { label: 'System Uptime', value: '99.8%', progress: 99, color: colors.brand },
    ]
  },
  water_management: {
    description: 'Water consumption, leak detection, and conservation initiatives',
    alerts: 2,
    metrics: [
      { label: 'Monthly Usage', value: '142K m³', target: '135K m³', progress: 105, color: colors.brand },
      { label: 'Cost This Month', value: '€68K', target: '€65K', progress: 105, color: colors.brand },
      { label: 'Active Leaks', value: '2', progress: 90, color: colors.brand },
      { label: 'Conservation Rate', value: '15%', progress: 75, color: colors.brand },
    ]
  },
  security_systems: {
    description: 'Security monitoring, incident detection, and system health',
    alerts: 1,
    metrics: [
      { label: 'Cameras Active', value: '1,234', progress: 100, color: '#4caf50' },
      { label: 'Incidents This Month', value: '3', progress: 95, color: '#4caf50' },
      { label: 'Response Time', value: '2.3 min', progress: 88, color: '#4caf50' },
      { label: 'System Health', value: '97%', progress: 97, color: '#4caf50' },
    ]
  },
  workspace: {
    description: 'Space utilization, occupancy patterns, and workspace efficiency',
    alerts: 0,
    metrics: [
      { label: 'Avg Occupancy', value: '68%', progress: 68, color: colors.brand },
      { label: 'Space Utilization', value: '72%', progress: 72, color: colors.brand },
      { label: 'Desk Bookings', value: '1,247', progress: 75, color: colors.brand },
      { label: 'Meeting Rooms', value: '85%', progress: 85, color: colors.brand },
    ]
  },
  compliance: {
    description: 'Regulatory compliance, certifications, and audit management',
    alerts: 3,
    metrics: [
      { label: 'Compliance Score', value: '94%', progress: 94, color: '#4caf50' },
      { label: 'Active Certifications', value: '8', progress: 100, color: '#4caf50' },
      { label: 'Pending Actions', value: '3', progress: 70, color: '#ffc107' },
      { label: 'Audit Score', value: '92%', progress: 92, color: '#4caf50' },
    ]
  },
  tickets: {
    description: 'Ticket tracking, resolution times, and operational efficiency',
    alerts: 8,
    metrics: [
      { label: 'Open Tickets', value: '156', progress: 60, color: '#ed6c02' },
      { label: 'Avg Resolution', value: '4.2 days', progress: 75, color: '#ed6c02' },
      { label: 'SLA Compliance', value: '88%', progress: 88, color: '#ed6c02' },
      { label: 'Cost Outstanding', value: '€45K', progress: 70, color: '#ed6c02' },
    ]
  },
  quotations: {
    description: 'Quote management, approval tracking, and cost forecasting',
    alerts: 5,
    metrics: [
      { label: 'Pending Quotes', value: '23', progress: 70, color: '#ed6c02' },
      { label: 'Total Value', value: '€125K', progress: 80, color: '#ed6c02' },
      { label: 'Avg Approval Time', value: '3.1 days', progress: 82, color: '#ed6c02' },
      { label: 'Overdue', value: '4', progress: 50, color: '#f44336' },
    ]
  },
  maintenance: {
    description: 'Preventive maintenance scheduling, completion rates, and asset care',
    alerts: 6,
    metrics: [
      { label: 'Scheduled Tasks', value: '89', progress: 100, color: '#ed6c02' },
      { label: 'Overdue', value: '7', progress: 40, color: '#f44336' },
      { label: 'Completed', value: '234', progress: 95, color: '#4caf50' },
      { label: 'Completion Rate', value: '92%', progress: 92, color: '#4caf50' },
    ]
  },
};

/* Detailed summary card for each KPI in the overview */
function IndicatorSummaryCard({ metricKey, metricInfo, onClick }: { metricKey: MetricType; metricInfo: Record<MetricType, { title: string; icon: React.ReactNode }>; onClick?: () => void }) {
  const info = metricInfo[metricKey];
  const cardData = themeCardData[metricKey] || themeCardData.energy;

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: '#fff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transform: 'translateY(-2px)',
        }
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box sx={{
          width: 64,
          height: 64,
          borderRadius: 2,
          bgcolor: `${cardData.metrics[0].color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: cardData.metrics[0].color,
          '& svg': {
            fontSize: 32
          }
        }}>
          {info.icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {info.title}
            </Typography>
            {cardData.alerts > 0 && (
              <Chip
                label={`${cardData.alerts} alert${cardData.alerts > 1 ? 's' : ''}`}
                size="small"
                sx={{
                  height: 20,
                  bgcolor: '#f44336',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            {cardData.description}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            156 buildings
          </Typography>
        </Box>
      </Box>

      {/* Metrics Grid */}
      <Box sx={{ px: 3, pb: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {cardData.metrics.map((metric) => (
          <Box key={metric.label}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {metric.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {metric.value}
              </Typography>
            </Box>
            {metric.target && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Target: {metric.target}
              </Typography>
            )}
            <LinearProgress
              variant="determinate"
              value={Math.min(metric.progress, 100)}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: colors.borderSecondary,
                '& .MuiLinearProgress-bar': {
                  bgcolor: metric.color,
                  borderRadius: 3
                }
              }}
            />
          </Box>
        ))}
      </Box>

      {/* View Details Button */}
      <Box sx={{ p: 3, pt: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClick}
          endIcon={<ExpandMoreIcon sx={{ transform: 'rotate(-90deg)' }} />}
          sx={{
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: cardData.metrics[0].color,
            color: cardData.metrics[0].color,
            '&:hover': {
              borderColor: cardData.metrics[0].color,
              bgcolor: `${cardData.metrics[0].color}10`
            }
          }}
        >
          VIEW DETAILS
        </Button>
      </Box>
    </Box>
  );
}

/* Generic metric view for new themes that don't have dedicated chart components */
function GenericMetricView({ metricKey, metricInfo, buildingName }: { metricKey: MetricType; metricInfo: Record<MetricType, { title: string; icon: React.ReactNode }>; buildingName: string }) {
  const info = metricInfo[metricKey];
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        {info.icon}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {info.title} — {buildingName}
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <SummaryStatCard label="Current Score" value="78%" trend={4} />
        <SummaryStatCard label="30-Day Average" value="75%" />
        <SummaryStatCard label="Active Alerts" value="3" subtitle="2 medium, 1 low" />
        <SummaryStatCard label="Last Updated" value="2h ago" subtitle="Auto-refreshing" />
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <IndicatorChart title={`${info.title} Trend — Last 12 Months`} type="line" color={colors.brand} />
        <IndicatorChart title="Score Distribution" type="bar" color="#4caf50" />
      </Box>

      <IndicatorChart title="Performance Breakdown" type="ranking" color={colors.brand} />
    </Box>
  );
}
