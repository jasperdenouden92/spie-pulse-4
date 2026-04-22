'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import NatureOutlinedIcon from '@mui/icons-material/NatureOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import SortOutlinedIcon from '@mui/icons-material/SortOutlined';
import ThermostatOutlinedIcon from '@mui/icons-material/ThermostatOutlined';
import AirOutlinedIcon from '@mui/icons-material/AirOutlined';
import SolarPowerOutlinedIcon from '@mui/icons-material/SolarPowerOutlined';
import FilterDramaOutlinedIcon from '@mui/icons-material/FilterDramaOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined';
import ElevatorOutlinedIcon from '@mui/icons-material/ElevatorOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import DirectionsRunOutlinedIcon from '@mui/icons-material/DirectionsRunOutlined';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import EuroOutlinedIcon from '@mui/icons-material/EuroOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import QuickreplyOutlinedIcon from '@mui/icons-material/QuickreplyOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import SettingsBackupRestoreOutlinedIcon from '@mui/icons-material/SettingsBackupRestoreOutlined';

import AppTabs from '@/components/AppTabs';
import PropertyCard, { TopicScore, EnergyLabel } from '@/components/PropertyCard';
import KPICard, { PerformanceRating } from '@/components/KPICard';
import AnimatedNumber from '@/components/AnimatedNumber';
import TicketsList from '@/components/TicketsList';
import QuotationsList from '@/components/QuotationsList';
import MaintenanceScheduleList from '@/components/MaintenanceScheduleList';
import AssetDetail from '@/components/AssetDetail';
import RecommendationsInbox from '@/components/RecommendationsInbox';
import { handleSidePeekClick } from '@/components/SidePeekPanel';
import { ContractFilterToggle, type BuildingFilterMode, type ContractFilter } from '@/components/BuildingSelector';

import OverallPerformancePage from '@/components/OverallPerformancePage';
import ComfortPerformancePage from '@/components/ComfortPerformancePage';
import SustainabilityPerformancePage from '@/components/SustainabilityPerformancePage';
import MaintenancePerformancePage from '@/components/MaintenancePerformancePage';
import QuotationsPerformancePage from '@/components/QuotationsPerformancePage';
import TicketsPerformancePage from '@/components/TicketsPerformancePage';
import AssetMonitoringPerformancePage from '@/components/AssetMonitoringPerformancePage';
import CompliancePerformancePage from '@/components/CompliancePerformancePage';
import ThemesPerformancePage from '@/components/ThemesPerformancePage';
import OperationsPerformancePage from '@/components/OperationsPerformancePage';

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
  AssetListPanel,
} from '@/components/charts';

import { motion } from 'framer-motion';
import type { ToggleState } from '@/components/KPIToggle';
import { colors, brandAlpha } from '@/colors';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage } from '@/i18n';
import { useURLState } from '@/hooks/useURLState';
import { useAppState } from '@/context/AppStateContext';
import { buildingToSlug } from '@/utils/slugs';

import { overallMetrics, themeMetrics, expandedThemeMetrics, operationsMetrics, getMetricsForPeriod, applyContractVariation, CONTRACT_HIDDEN_THEME_KEYS, CONTRACT_HIDDEN_OPERATIONS_KEYS } from '@/data/metrics';
import type { PeriodMetrics } from '@/data/metrics';
import { sortBuildingsByMetric, sortBuildingsByTrend, Building, MetricKeys, buildings as allBuildings, tenants } from '@/data/buildings';
import { tickets } from '@/data/tickets';
import { quotations } from '@/data/quotations';
import { maintenanceSchedules } from '@/data/maintenance';
import { AssetNode } from '@/data/assetTree';
import { buildingOperationalStats, formatCurrency } from '@/data/buildingOperationalStats';

// ── Type Definitions ──────────────────────────────────────────────────────

type MetricType = keyof Building['metrics'];
type ViewMode = 'dashboard' | 'list' | 'tree';
type BuildingsPanelTab = 'portfolio' | 'performance' | 'insights';
type Selection = MetricType | 'themes_group' | 'operations_group';

// ── Constants ─────────────────────────────────────────────────────────────

const PRIMARY_THEME_KEYS: MetricType[] = ['sustainability', 'comfort', 'asset_monitoring', 'compliance'];
const ALL_THEME_KEYS: MetricType[] = [...PRIMARY_THEME_KEYS];
const OPERATIONS_KEYS: MetricType[] = ['tickets', 'quotations', 'maintenance'];

// Per-tenant theme restrictions -- tenants not listed here use all themes
const TENANT_THEME_KEYS: Record<string, MetricType[]> = {
  'de Bijenkorf': ['sustainability'],
  'Stichting Carmelcollege': ['comfort'],
};

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

// ── Helper Functions ──────────────────────────────────────────────────────

function getPerformanceRating(score: number, t?: (k: any) => string): PerformanceRating {
  if (score >= 80) return { label: t ? t('performance.good') : 'Good', color: '#4caf50' };
  if (score >= 60) return { label: t ? t('performance.moderate') : 'Moderate', color: '#ff9800' };
  return { label: t ? t('performance.poor') : 'Poor', color: '#f44336' };
}

function getComfortTopics(comfortGreen: number, t?: (k: any) => string): TopicScore[] {
  return [
    { label: t ? t('topic.temperature') : 'Temperature', score: Math.max(0, Math.min(100, comfortGreen + 7)), trend: 3, icon: <ThermostatOutlinedIcon sx={{ fontSize: 14 }} />, color: '#e91e63' },
    { label: t ? t('topic.humidity') : 'Humidity', score: Math.max(0, Math.min(100, comfortGreen - 13)), trend: -4, icon: <WaterDropOutlinedIcon sx={{ fontSize: 14 }} />, color: '#9c27b0' },
    { label: t ? t('topic.airQuality') : 'Air Quality', score: Math.max(0, Math.min(100, comfortGreen + 6)), trend: 7, icon: <AirOutlinedIcon sx={{ fontSize: 14 }} />, color: '#00bcd4' },
  ];
}

function getSustainabilityTopics(sustainabilityGreen: number, t?: (k: any) => string): TopicScore[] {
  return [
    { label: t ? t('topic.consumption') : 'Consumption', score: Math.max(0, Math.min(100, sustainabilityGreen + 5)), trend: 4, icon: <BoltOutlinedIcon sx={{ fontSize: 14 }} />, color: '#f57c00' },
    { label: t ? t('topic.generation') : 'Generation', score: Math.max(0, Math.min(100, sustainabilityGreen - 8)), trend: 6, icon: <SolarPowerOutlinedIcon sx={{ fontSize: 14 }} />, color: '#66bb6a' },
    { label: t ? t('topic.emissions') : 'Emissions', score: Math.max(0, Math.min(100, sustainabilityGreen - 3)), trend: -2, icon: <FilterDramaOutlinedIcon sx={{ fontSize: 14 }} />, color: '#9c27b0' },
    { label: t ? t('topic.cost') : 'Cost', score: Math.max(0, Math.min(100, sustainabilityGreen + 6)), trend: 3, icon: <PaidOutlinedIcon sx={{ fontSize: 14 }} />, color: '#0288d1' },
  ];
}

function getMaintenanceTopics(maintenanceGreen: number, t?: (k: any) => string): TopicScore[] {
  return [
    { label: t ? t('topic.progress') : 'Progress', score: Math.max(0, Math.min(100, maintenanceGreen + 4)), trend: 5, icon: <TaskAltOutlinedIcon sx={{ fontSize: 14 }} />, color: '#2196f3' },
    { label: t ? t('topic.timeliness') : 'Timeliness', score: Math.max(0, Math.min(100, maintenanceGreen - 7)), trend: -2, icon: <ScheduleOutlinedIcon sx={{ fontSize: 14 }} />, color: '#ff9800' },
    { label: t ? t('topic.reporting') : 'Reporting', score: Math.max(0, Math.min(100, maintenanceGreen + 3)), trend: 8, icon: <AssessmentOutlinedIcon sx={{ fontSize: 14 }} />, color: '#9c27b0' },
  ];
}

function getQuotationsTopics(quotationsGreen: number, t?: (k: any) => string): TopicScore[] {
  return [
    { label: t ? t('topic.runTime') : 'Run time', score: Math.max(0, Math.min(100, quotationsGreen + 5)), trend: 3, icon: <TimerOutlinedIcon sx={{ fontSize: 14 }} />, color: '#2196f3' },
    { label: t ? t('topic.responseTime') : 'Response time', score: Math.max(0, Math.min(100, quotationsGreen - 8)), trend: -3, icon: <QuickreplyOutlinedIcon sx={{ fontSize: 14 }} />, color: '#ff9800' },
    { label: t ? t('topic.approvalTime') : 'Approval time', score: Math.max(0, Math.min(100, quotationsGreen + 3)), trend: 6, icon: <ThumbUpAltOutlinedIcon sx={{ fontSize: 14 }} />, color: '#9c27b0' },
  ];
}

function getTicketsTopics(ticketsGreen: number, t?: (k: any) => string): TopicScore[] {
  return [
    { label: t ? t('topic.responseTime') : 'Response time', score: Math.max(0, Math.min(100, ticketsGreen + 3)), trend: 4, icon: <QuickreplyOutlinedIcon sx={{ fontSize: 14 }} />, color: '#2196f3' },
    { label: t ? t('topic.restoreTime') : 'Restore time', score: Math.max(0, Math.min(100, ticketsGreen - 5)), trend: -2, icon: <SettingsBackupRestoreOutlinedIcon sx={{ fontSize: 14 }} />, color: '#ff9800' },
  ];
}

function getAssetMonitoringTopics(assetMonitoringGreen: number, t?: (k: any) => string): TopicScore[] {
  return [
    { label: t ? t('topic.heating') : 'Heating', score: Math.max(0, Math.min(100, assetMonitoringGreen + 4)), trend: 3, icon: <ThermostatOutlinedIcon sx={{ fontSize: 14 }} />, color: '#e91e63' },
    { label: t ? t('topic.cooling') : 'Cooling', score: Math.max(0, Math.min(100, assetMonitoringGreen - 6)), trend: -2, icon: <AcUnitOutlinedIcon sx={{ fontSize: 14 }} />, color: '#00bcd4' },
    { label: t ? t('topic.ventilation') : 'Ventilation', score: Math.max(0, Math.min(100, assetMonitoringGreen + 2)), trend: 5, icon: <AirOutlinedIcon sx={{ fontSize: 14 }} />, color: '#9c27b0' },
    { label: t ? t('topic.distribution') : 'Distribution', score: Math.max(0, Math.min(100, assetMonitoringGreen - 3)), trend: -1, icon: <AccountTreeOutlinedIcon sx={{ fontSize: 14 }} />, color: '#ff9800' },
    { label: t ? t('topic.lighting') : 'Lighting', score: Math.max(0, Math.min(100, assetMonitoringGreen + 7)), trend: 4, icon: <LightbulbOutlinedIcon sx={{ fontSize: 14 }} />, color: '#ffc107' },
    { label: t ? t('topic.transport') : 'Transport', score: Math.max(0, Math.min(100, assetMonitoringGreen - 8)), trend: -3, icon: <ElevatorOutlinedIcon sx={{ fontSize: 14 }} />, color: '#0288d1' },
  ];
}

function getComplianceTopics(complianceGreen: number, t?: (k: any) => string): TopicScore[] {
  return [
    { label: t ? t('topic.bacs') : 'BACS', score: Math.max(0, Math.min(100, complianceGreen + 5)), trend: 3, icon: <SensorsOutlinedIcon sx={{ fontSize: 14 }} />, color: '#2196f3' },
    { label: t ? t('topic.escapeRoutes') : 'Escape Routes', score: Math.max(0, Math.min(100, complianceGreen - 4)), trend: -2, icon: <DirectionsRunOutlinedIcon sx={{ fontSize: 14 }} />, color: '#ff9800' },
    { label: t ? t('topic.fireSafety') : 'Fire Safety', score: Math.max(0, Math.min(100, complianceGreen + 3)), trend: 5, icon: <LocalFireDepartmentOutlinedIcon sx={{ fontSize: 14 }} />, color: '#f44336' },
    { label: t ? t('topic.legionellaPrevention') : 'Legionella Prevention', score: Math.max(0, Math.min(100, complianceGreen - 6)), trend: -1, icon: <VaccinesOutlinedIcon sx={{ fontSize: 14 }} />, color: '#9c27b0' },
    { label: t ? t('topic.maintenanceInspection') : 'Maintenance & Inspection', score: Math.max(0, Math.min(100, complianceGreen + 2)), trend: 4, icon: <HandymanOutlinedIcon sx={{ fontSize: 14 }} />, color: '#00bcd4' },
    { label: t ? t('topic.permits') : 'Permits', score: Math.max(0, Math.min(100, complianceGreen + 7)), trend: 2, icon: <DescriptionOutlinedIcon sx={{ fontSize: 14 }} />, color: '#4caf50' },
  ];
}

function getOverallTopics(metrics: Record<MetricKeys, { green: number }>, trends: Record<MetricKeys, number>, themeKeysOverride?: MetricType[], t?: (k: any) => string): TopicScore[] {
  const themeKeys: MetricKeys[] = themeKeysOverride ?? ['sustainability', 'comfort', 'asset_monitoring', 'compliance'];
  const opsKeys: MetricKeys[] = ['tickets', 'quotations', 'maintenance'];
  const themeScore = Math.round(themeKeys.reduce((sum, k) => sum + metrics[k].green, 0) / themeKeys.length);
  const themeTrend = Math.round(themeKeys.reduce((sum, k) => sum + trends[k], 0) / themeKeys.length * 10) / 10;
  const opsScore = Math.round(opsKeys.reduce((sum, k) => sum + metrics[k].green, 0) / opsKeys.length);
  const opsTrend = Math.round(opsKeys.reduce((sum, k) => sum + trends[k], 0) / opsKeys.length * 10) / 10;
  return [
    { label: t ? t('topic.themeKpis') : 'Theme KPIs', score: themeScore, trend: themeTrend, icon: <StyleOutlinedIcon sx={{ fontSize: 14 }} />, color: '#4caf50' },
    { label: t ? t('topic.operationalKpis') : 'Operational KPIs', score: opsScore, trend: opsTrend, icon: <EngineeringOutlinedIcon sx={{ fontSize: 14 }} />, color: '#2196f3' },
  ];
}

function getThemeTopicConfig(t?: (k: any) => string): Record<string, { label: string; icon: React.ReactNode; color: string }> {
  return {
    sustainability: { label: t ? t('metric.sustainability') : 'Sustainability', icon: <NatureOutlinedIcon sx={{ fontSize: 14 }} />, color: '#4caf50' },
    comfort: { label: t ? t('metric.comfort') : 'Comfort', icon: <SpaOutlinedIcon sx={{ fontSize: 14 }} />, color: '#2196f3' },
    asset_monitoring: { label: t ? t('metric.assetMonitoring') : 'Asset Monitoring', icon: <SecurityOutlinedIcon sx={{ fontSize: 14 }} />, color: '#ff9800' },
    compliance: { label: t ? t('metric.compliance') : 'Compliance', icon: <GavelOutlinedIcon sx={{ fontSize: 14 }} />, color: '#9c27b0' },
  };
}

function getThemesTopics(metrics: Record<MetricKeys, { green: number }>, trends: Record<MetricKeys, number>, keys: MetricType[] = PRIMARY_THEME_KEYS, t?: (k: any) => string): TopicScore[] {
  const config = getThemeTopicConfig(t);
  return keys.filter(k => config[k]).map(k => ({
    ...config[k],
    score: metrics[k].green,
    trend: trends[k],
  }));
}

function getOperationsTopics(metrics: Record<MetricKeys, { green: number }>, trends: Record<MetricKeys, number>, t?: (k: any) => string): TopicScore[] {
  return [
    { label: t ? t('metric.tickets') : 'Tickets', score: metrics.tickets.green, trend: trends.tickets, icon: <ConfirmationNumberOutlinedIcon sx={{ fontSize: 14 }} />, color: '#2196f3' },
    { label: t ? t('metric.quotations') : 'Quotations', score: metrics.quotations.green, trend: trends.quotations, icon: <RequestQuoteOutlinedIcon sx={{ fontSize: 14 }} />, color: '#ff9800' },
    { label: t ? t('metric.maintenance') : 'Maintenance', score: metrics.maintenance.green, trend: trends.maintenance, icon: <EngineeringOutlinedIcon sx={{ fontSize: 14 }} />, color: '#9c27b0' },
  ];
}

// ── Main Control Room Page ────────────────────────────────────────────────

export default function ControlRoomPage() {
  const { themeColors: tc } = useThemeMode();
  const { t } = useLanguage();
  const router = useRouter();
  const isNarrow = useMediaQuery('(max-width:960px)');
  const isSmall = useMediaQuery('(max-width:748px)');
  const isVeryNarrow = useMediaQuery('(max-width:480px)');
  const isWide = useMediaQuery('(min-width:1536px)');

  // ── URL state ──────────────────────────────────────────────────────────
  const {
    selectedBuilding, selection, dateRange, sortOrder, viewMode,
    selectedGroup, selectedCity, selectedTenant,
    isInspectMode, isAssetExplorerOpen, assetTab, urlAsset,
    setURLParams, setSelection, setDateRange, setSelectedGroup,
    setSelectedCity, setSelectedTenant, setSortOrder, setViewMode,
    setIsInspectMode, setIsAssetExplorerOpen, setAssetTab,
    tab, setTab, contract, setContract,
  } = useURLState();

  // ── App state ──────────────────────────────────────────────────────────
  const {
    leftSidebarCollapsed, setLeftSidebarCollapsed,
    localQuickviewAsset, setLocalQuickviewAsset,
    openedViaInspect, setOpenedViaInspect,
    sidePeekBuilding, setSidePeekBuilding,
    sidePeekBuildingTab, setSidePeekBuildingTab,
    sidePeekZone, setSidePeekZone,
    sidePeekZoneTab, setSidePeekZoneTab,
    sidePeekAsset, setSidePeekAsset,
    sidePeekAssetTab, setSidePeekAssetTab,
    pendingDashboardId, setPendingDashboardId,
  } = useAppState();

  // ── Local state ────────────────────────────────────────────────────────
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [titleBuildingNames, setTitleBuildingNames] = useState<string[]>([]);
  const [titleBuildingMode, setTitleBuildingMode] = useState<BuildingFilterMode>('buildings');
  const contractFilter = contract as ContractFilter;
  const [hoveredBuilding, setHoveredBuilding] = useState<Building | null>(null);
  const [hoveredAsset, setHoveredAsset] = useState<{ id?: string; type?: string; name: string; category?: string } | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const buildingsPanelTab: BuildingsPanelTab = (tab === 'performance' || tab === 'insights') ? tab : 'portfolio';
  const setBuildingsPanelTab = (v: BuildingsPanelTab) => setTab(v);

  // Ensure default tab is always visible in the URL
  useEffect(() => {
    if (!tab) setTab('portfolio');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);
  const buildingsViewMode = (new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('bview') ?? 'cards') as 'cards' | 'list';
  const setBuildingsViewMode = (v: 'cards' | 'list') => setURLParams({ bview: v });

  // ── Derived state ──────────────────────────────────────────────────────
  const activeThemeKeys = TENANT_THEME_KEYS[selectedTenant] ?? PRIMARY_THEME_KEYS;
  const quickviewAsset = localQuickviewAsset ?? urlAsset;
  const isAssetQuickviewOpen = !!quickviewAsset;
  const selectedAsset = quickviewAsset;
  const viewingAssetDetail = isAssetQuickviewOpen;

  // Derive effective selectedMetric for building grid filtering
  const selectedMetric: MetricType = (() => {
    if (selection === 'themes_group' || selection === 'operations_group' || selection === 'overall') return 'overall';
    return selection as MetricType;
  })();

  // ── Data computations ──────────────────────────────────────────────────

  // Filter buildings by selected tenant
  const tenantBuildings = useMemo(() => {
    return allBuildings.filter(b => b.tenant === selectedTenant);
  }, [selectedTenant]);

  // Sort buildings based on selected metric and sort order
  const sortedBuildings = useMemo(() => {
    const metricForSort = selectedMetric === 'overall' ? 'overall' : selectedMetric;

    const sortByMetric = (metric: MetricKeys) =>
      [...tenantBuildings].sort((a, b) => a.metrics[metric].green - b.metrics[metric].green);
    const sortByTrend = (metric: MetricKeys, direction: 'improved' | 'deteriorated') =>
      [...tenantBuildings].sort((a, b) => direction === 'improved' ? b.trends[metric] - a.trends[metric] : a.trends[metric] - b.trends[metric]);

    if (sortOrder === 'Most Improved') {
      return sortByTrend(metricForSort, 'improved');
    } else if (sortOrder === 'Most Deteriorated') {
      return sortByTrend(metricForSort, 'deteriorated');
    }

    const buildings = sortByMetric(metricForSort);

    if (sortOrder === 'Best to Worst') {
      return [...buildings].reverse();
    } else if (sortOrder === 'A to Z') {
      return [...buildings].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'Z to A') {
      return [...buildings].sort((a, b) => b.name.localeCompare(a.name));
    }

    return buildings;
  }, [selectedMetric, sortOrder, tenantBuildings]);

  // Apply contract filter on top of sorted buildings
  const filteredBuildings = useMemo(() => {
    if (!contractFilter) return sortedBuildings;
    return sortedBuildings.filter(b => b.hasContract);
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

  // Period-aware metrics based on selected date range (with contract variation when active)
  const periodMetrics = useMemo(() => {
    const base = getMetricsForPeriod(dateRange, titleBuildingNames);
    return contractFilter ? applyContractVariation(base) : base;
  }, [dateRange, contractFilter, titleBuildingNames]);

  // Calculate rolled-up scores for KPI groups
  const themesScore = selectedBuilding
    ? Math.round(activeThemeKeys.reduce((sum, k) => sum + selectedBuilding.metrics[k].green, 0) / activeThemeKeys.length)
    : Math.round(periodMetrics.themes.filter((_, i) => activeThemeKeys.includes(PRIMARY_THEME_KEYS[i])).reduce((sum, m) => sum + m.score, 0) / activeThemeKeys.length);

  const operationsScore = selectedBuilding
    ? Math.round(OPERATIONS_KEYS.reduce((sum, k) => sum + selectedBuilding.metrics[k].green, 0) / OPERATIONS_KEYS.length)
    : Math.round(periodMetrics.operations.reduce((sum, m) => sum + m.score, 0) / periodMetrics.operations.length);

  const activeThemeMetrics = periodMetrics.themes.filter((_, i) => activeThemeKeys.includes(PRIMARY_THEME_KEYS[i]));
  const themesTrend = Math.round(activeThemeMetrics.reduce((sum, m) => sum + m.trend, 0) / activeThemeMetrics.length * 10) / 10;
  const operationsTrend = Math.round(periodMetrics.operations.reduce((sum, m) => sum + m.trend, 0) / periodMetrics.operations.length * 10) / 10;

  const visibleThemeCount = activeThemeKeys.filter(k => !(contractFilter && (k === 'compliance' || k === 'comfort'))).length;
  const maxKpiColumns = Math.max(visibleThemeCount, OPERATIONS_KEYS.length);

  const isCompact = !!selectedBuilding;

  // ── Event handlers ─────────────────────────────────────────────────────

  const handleMetricSelect = (metric: MetricType) => {
    if (selection === metric) {
      setURLParams({ metric: 'overall', themes: '0' });
    } else {
      setURLParams({ metric });
    }
  };

  const handleGroupToggle = (group: 'themes' | 'operations') => {
    const groupSelection = group === 'themes' ? 'themes_group' : 'operations_group';
    if (selection === groupSelection) {
      setURLParams({ metric: 'overall', themes: '0' });
    } else {
      setURLParams({ metric: groupSelection, ...(group === 'operations' ? { themes: '0' } : {}) });
    }
  };

  // Determine if a group is "active" (either the group itself or one of its children is selected)
  const isThemesActive = selection === 'overall' || selection === 'themes_group' || activeThemeKeys.includes(selection as MetricType);
  const isOperationsActive = selection === 'overall' || selection === 'operations_group' || OPERATIONS_KEYS.includes(selection as MetricType);

  // Visual-only: highlight only the exact level that is selected (not ancestors/descendants)
  const isThemesSelected = selection === 'themes_group';
  const isOperationsSelected = selection === 'operations_group';

  // Get toggle state for a parent group header
  const getGroupToggleState = (group: 'themes' | 'operations'): ToggleState => {
    if (selection === 'overall') return 'inherited';
    if (group === 'themes') {
      if (selection === 'themes_group') return 'on';
      if (activeThemeKeys.includes(selection as MetricType)) return 'inherited';
      return 'off';
    } else {
      if (selection === 'operations_group') return 'on';
      if (OPERATIONS_KEYS.includes(selection as MetricType)) return 'inherited';
      return 'off';
    }
  };

  // Get toggle state for a child KPI
  const getToggleState = (metric: MetricType, group: 'themes' | 'operations'): ToggleState => {
    if (selection === 'overall') return 'inherited';
    if (selection === 'themes_group') return group === 'themes' ? 'inherited' : 'off';
    if (selection === 'operations_group') return group === 'operations' ? 'inherited' : 'off';
    if (selection === metric) return 'on';
    return 'off';
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

  // Navigation helper for building clicks
  const navigateToBuildingDetail = useCallback((building: Building) => {
    router.push(`/buildings/${building.id}`, { scroll: false });
  }, [router]);

  const handlePageChange = useCallback((page: string) => {
    const pageToPath: Record<string, string> = {
      portfolio_buildings: '/portfolio/buildings',
      operations_tickets: '/operations/tickets',
      operations_quotations: '/operations/quotations',
      dashboards: '/dashboards',
    };
    const path = pageToPath[page] ?? '/control-room';
    setLocalQuickviewAsset(null);
    setSidePeekBuilding(null);
    setSidePeekZone(null);
    router.push(path, { scroll: false });
  }, [router, setLocalQuickviewAsset, setSidePeekBuilding, setSidePeekZone]);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
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
                    color: tc.bgPrimary,
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

          {/* ========== KPI METRICS SECTION ========== */}
          <Box className="kpi-metrics-section" sx={{
            display: 'flex', flexDirection: isNarrow ? 'column' : 'row', gap: 0, mb: 3, minWidth: 0,
            '& > *': {
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            '&:has(.performance-card:hover) .bracket-arrow polygon': {
              fill: tc.bgSecondaryHover,
            },
          }}>
            {/* Overall Score Card */}
            <Box
              className="performance-card"
              component="button"
              onClick={() => { setSelection('overall'); }}
              sx={{
                p: isCompact ? 2 : 3,
                border: 1,
                borderColor: 'divider',
                borderRight: isNarrow ? `1px solid ${tc.borderSecondary}` : 'none',
                ...(isNarrow && { borderBottom: 'none' }),
                borderRadius: isNarrow ? '8px 8px 0 0' : '8px 0 0 8px',
                bgcolor: selection === 'overall' ? tc.bgPrimaryHover : tc.bgPrimary,
                width: isNarrow ? '100%' : 280,
                alignSelf: 'stretch',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: 'none',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: tc.bgSecondaryHover,
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: isCompact ? 1 : 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SpeedOutlinedIcon sx={{ fontSize: isCompact ? 16 : 20, color: 'text.secondary', transition: 'font-size 0.3s ease' }} />
                  <Typography variant="body2" sx={{ fontFamily: 'var(--font-jost), "Jost", sans-serif', fontWeight: 600, fontSize: isCompact ? '0.875rem' : '1rem', transition: 'font-size 0.3s ease' }}>
                    Performance
                  </Typography>
                </Box>
                {selection === 'overall'
                  ? <RadioButtonCheckedIcon sx={{ fontSize: 20, color: tc.brand }} />
                  : <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: tc.borderPrimary }} />}
              </Box>
              {(() => {
                const overallScore = selectedBuilding
                  ? Math.round([...activeThemeKeys, ...OPERATIONS_KEYS].reduce((sum, k) => sum + selectedBuilding.metrics[k].green, 0) / (activeThemeKeys.length + OPERATIONS_KEYS.length))
                  : Math.round([...periodMetrics.themes, ...periodMetrics.operations].reduce((sum, m) => sum + m.score, 0) / (periodMetrics.themes.length + periodMetrics.operations.length));
                const overallRating = getPerformanceRating(overallScore, t);
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
                    {initialLoading ? (
                      <Skeleton animation="wave"variant="rounded" width={sparkW} height={sparkH} sx={{ borderRadius: '4px' }} />
                    ) : (
                      <svg width={sparkW} height={sparkH} style={{ overflow: 'visible' }}>
                        <path d={sparkPath} fill="none" stroke={overallRating.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                      {initialLoading ? (
                        <Skeleton animation="wave"variant="text" width={isCompact ? 100 : 140} height={isCompact ? 56 : 84} />
                      ) : (
                        <Typography variant="h2" sx={{ fontSize: isCompact ? 48 : 72, fontWeight: 600, transition: 'font-size 0.3s ease' }}>
                          <AnimatedNumber value={overallScore} />%
                        </Typography>
                      )}
                      {initialLoading ? (
                        <Skeleton animation="wave"variant="rounded" width={50} height={22} sx={{ borderRadius: '16px' }} />
                      ) : (
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
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      {initialLoading ? (
                        <Skeleton animation="wave"variant="text" width={60} height={20} />
                      ) : periodMetrics.periodLabel !== null && (
                        <Tooltip title={`Compared to ${periodMetrics.periodLabel}`} arrow placement="top">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: periodMetrics.overall.trend >= 0 ? 'success.main' : 'error.main' }}>
                            {periodMetrics.overall.trend >= 0 ? <TrendingUpIcon sx={{ fontSize: isCompact ? 14 : 18 }} /> : <TrendingDownIcon sx={{ fontSize: isCompact ? 14 : 18 }} />}
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: isCompact ? '0.75rem' : '0.875rem' }}>
                              {Math.abs(periodMetrics.overall.trend)}%
                            </Typography>
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                );
              })()}
              {/* Contract filter toggle */}
              <Box
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                sx={{ mt: 'auto', pt: isCompact ? 1 : 2, display: 'flex', justifyContent: 'center' }}
              >
                <ContractFilterToggle value={contractFilter} onChange={(v) => setContract(!!v)} />
              </Box>
            </Box>


            {/* KPI Groups Container */}
            <Box sx={{
              flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
              gap: 0, transition: 'gap 0.3s ease',
            }}>

                <>
                  {/* ===== THEMES ROW ===== */}
                  <Box
                    className="kpi-group-panel"
                    onClick={() => handleGroupToggle('themes')}
                    sx={{
                      p: isCompact ? 1.5 : 2,
                      pb: isCompact ? 2.5 : 3,
                      pl: isNarrow ? (isCompact ? 1.5 : 2) : (isCompact ? 5 : 6),
                      borderTop: 1,
                      borderRight: 1,
                      borderBottom: 1,
                      borderLeft: isNarrow ? 1 : 'none',
                      borderColor: 'divider',
                      borderRadius: isNarrow ? '0' : '0 8px 0 0',
                      bgcolor: isThemesSelected ? brandAlpha(0.04) : tc.bgPrimary,
                      position: 'relative',
                      overflow: 'visible',
                      boxShadow: 'none',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: brandAlpha(0.06),
                      }
                    }}
                  >
                    {/* Left bracket arrow -- top half */}
                    <svg className="bracket-arrow" style={{ position: 'absolute', left: 0, top: 0, width: 20, height: '100%', zIndex: 1, display: isNarrow ? 'none' : 'block' }} preserveAspectRatio="none" viewBox="0 0 20 100">
                      <polygon points="0,0 20,50 0,100" fill={selection === 'overall' ? tc.bgPrimaryHover : tc.bgPrimary} />
                      <polyline points="0,0 20,50" fill="none" stroke={tc.borderSecondary} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                      <polyline points="20,50 0,100" fill="none" stroke={tc.borderSecondary} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    </svg>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <StyleOutlinedIcon sx={{ fontSize: isCompact ? 16 : 18, color: 'text.secondary' }} />
                        <Typography variant="subtitle2" sx={{ fontFamily: 'var(--font-jost), "Jost", sans-serif', fontWeight: 600, color: 'text.secondary', fontSize: isCompact ? '0.75rem' : '0.875rem' }}>
                          {t('performance.themeKpis')}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: isCompact ? '1rem' : '1.25rem' }}>
                          <AnimatedNumber value={themesScore} />%
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: themesTrend >= 0 ? 'success.main' : 'error.main' }}>
                          {themesTrend >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                            {Math.abs(themesTrend)}%
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isThemesSelected
                          ? <RadioButtonCheckedIcon sx={{ fontSize: 20, color: tc.brand }} />
                          : <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: tc.borderPrimary }} />}
                      </Box>
                    </Box>

                    {/* Primary Theme KPIs */}
                    <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: isVeryNarrow ? '1fr' : isSmall ? 'repeat(2, 1fr)' : isWide ? `repeat(${maxKpiColumns}, 1fr)` : 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: isCompact ? 1.5 : 2,
                      transition: 'gap 0.3s ease'
                    }}>
                      {initialLoading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton animation="wave"key={i} variant="rounded" height={isCompact ? 72 : 90} sx={{ borderRadius: '12px' }} />
                          ))
                        : periodMetrics.themes.map((metric, index) => {
                            const metricKey = PRIMARY_THEME_KEYS[index];
                            if (!activeThemeKeys.includes(metricKey)) return null;
                            if (contractFilter && (metricKey === 'compliance' || metricKey === 'comfort')) return null;
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
                                performanceRating={getPerformanceRating(score, t)}
                                variant="nested"
                              />
                            );
                          })
                      }
                    </Box>

                  </Box>

                  {/* ===== OPERATIONS ROW ===== */}
                  <Box
                    className="kpi-group-panel"
                    onClick={() => handleGroupToggle('operations')}
                    sx={{
                      p: isCompact ? 1.5 : 2,
                      pb: isCompact ? 2.5 : 3,
                      pl: isNarrow ? (isCompact ? 1.5 : 2) : (isCompact ? 5 : 6),
                      borderTop: 'none',
                      borderRight: 1,
                      borderBottom: 1,
                      borderLeft: isNarrow ? 1 : 'none',
                      borderColor: 'divider',
                      borderRadius: isNarrow ? '0 0 8px 8px' : '0 0 8px 0',
                      bgcolor: isOperationsSelected ? brandAlpha(0.04) : tc.bgPrimary,
                      position: 'relative',
                      overflow: 'visible',
                      boxShadow: 'none',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: brandAlpha(0.06),
                      }
                    }}
                  >
                    {/* Left bracket arrow -- bottom half */}
                    <svg className="bracket-arrow" style={{ position: 'absolute', left: 0, top: 0, width: 20, height: '100%', zIndex: 1, display: isNarrow ? 'none' : 'block' }} preserveAspectRatio="none" viewBox="0 0 20 100">
                      <polygon points="0,0 20,50 0,100" fill={selection === 'overall' ? tc.bgPrimaryHover : tc.bgPrimary} />
                      <polyline points="0,0 20,50" fill="none" stroke={tc.borderSecondary} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                      <polyline points="20,50 0,100" fill="none" stroke={tc.borderSecondary} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    </svg>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <EngineeringOutlinedIcon sx={{ fontSize: isCompact ? 16 : 18, color: 'text.secondary' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: isCompact ? '0.75rem' : '0.875rem' }}>
                          {t('performance.operationalKpis')}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: isCompact ? '1rem' : '1.25rem' }}>
                          <AnimatedNumber value={operationsScore} />%
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: operationsTrend >= 0 ? 'success.main' : 'error.main' }}>
                          {operationsTrend >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                            {Math.abs(operationsTrend)}%
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isOperationsSelected
                          ? <RadioButtonCheckedIcon sx={{ fontSize: 20, color: tc.brand }} />
                          : <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: tc.borderPrimary }} />}
                      </Box>
                    </Box>

                    {/* Operations KPIs */}
                    <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: isVeryNarrow ? '1fr' : isSmall ? 'repeat(2, 1fr)' : isWide ? `repeat(${maxKpiColumns}, 1fr)` : 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: isCompact ? 1.5 : 2,
                      transition: 'gap 0.3s ease'
                    }}>
                      {initialLoading
                        ? Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton animation="wave"key={i} variant="rounded" height={isCompact ? 72 : 90} sx={{ borderRadius: '12px' }} />
                          ))
                        : periodMetrics.operations.map((metric, index) => {
                            const metricKey = OPERATIONS_KEYS[index];
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
                                performanceRating={getPerformanceRating(score, t)}
                                variant="nested"
                              />
                            );
                          })
                      }
                    </Box>
                  </Box>
                </>
            </Box>
          </Box>

          {/* ========== BUILDINGS / PERFORMANCE INDICATORS PANEL ========== */}
          {!selectedBuilding ? (
            <Box sx={{
              overflow: 'hidden',
              mt: 4
            }}>
              {/* Panel Header with Tabs */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 0,
              }}>
                <AppTabs
                  value={buildingsPanelTab}
                  onChange={setBuildingsPanelTab}
                  tabs={[
                    { value: 'portfolio', label: t('controlRoom.tabPortfolio') },
                    { value: 'performance', label: t('controlRoom.tabPerformance') },
                    { value: 'insights', label: t('controlRoom.tabInsights') },
                  ]}
                />

                {/* Sort Dropdown + View Toggle -- only on Buildings tab */}
                {buildingsPanelTab === 'portfolio' && (() => {
                  const sortOrderLabels: Record<string, string> = {
                    'Worst to Best': t('controlRoom.sortWorstToBest'),
                    'Best to Worst': t('controlRoom.sortBestToWorst'),
                    'Most Improved': t('controlRoom.sortMostImproved'),
                    'Most Deteriorated': t('controlRoom.sortMostDeteriorated'),
                    'A to Z': t('controlRoom.sortAToZ'),
                    'Z to A': t('controlRoom.sortZToA'),
                  };
                  return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip
                      icon={<SortOutlinedIcon sx={{ fontSize: 16 }} />}
                      label={sortOrderLabels[sortOrder] ?? sortOrder}
                      onClick={(e) => setSortAnchorEl(e.currentTarget)}
                      deleteIcon={<ExpandMoreIcon />}
                      onDelete={(e) => setSortAnchorEl(e.currentTarget as any)}
                      sx={{
                        height: 32,
                        borderRadius: '6px',
                        backgroundColor: tc.bgPrimaryHover,
                        '&:hover': { backgroundColor: '#e8e8e8' },
                        '& .MuiChip-label': { px: 1, fontSize: '0.813rem', fontWeight: 500 }
                      }}
                    />
                    <Menu
                      anchorEl={sortAnchorEl}
                      open={Boolean(sortAnchorEl)}
                      onClose={() => setSortAnchorEl(null)}
                    >
                      <MenuItem onClick={() => { setSortOrder('Worst to Best'); setSortAnchorEl(null); }}>{t('controlRoom.sortWorstToBest')}</MenuItem>
                      <MenuItem onClick={() => { setSortOrder('Best to Worst'); setSortAnchorEl(null); }}>{t('controlRoom.sortBestToWorst')}</MenuItem>
                      <MenuItem onClick={() => { setSortOrder('Most Improved'); setSortAnchorEl(null); }}>{t('controlRoom.sortMostImproved')}</MenuItem>
                      <MenuItem onClick={() => { setSortOrder('Most Deteriorated'); setSortAnchorEl(null); }}>{t('controlRoom.sortMostDeteriorated')}</MenuItem>
                      <MenuItem onClick={() => { setSortOrder('A to Z'); setSortAnchorEl(null); }}>{t('controlRoom.sortAToZ')}</MenuItem>
                      <MenuItem onClick={() => { setSortOrder('Z to A'); setSortAnchorEl(null); }}>{t('controlRoom.sortZToA')}</MenuItem>
                    </Menu>
                    <IconButton
                      onClick={() => setBuildingsViewMode(buildingsViewMode === 'cards' ? 'list' : 'cards')}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '6px',
                        bgcolor: tc.bgPrimaryHover,
                        color: 'text.secondary',
                        '&:hover': { bgcolor: tc.bgSecondaryHover },
                      }}
                    >
                      {buildingsViewMode === 'cards'
                        ? <FormatListBulletedIcon sx={{ fontSize: 18 }} />
                        : <GridViewOutlinedIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </Box>
                  );
                })()}
              </Box>

              {/* Panel Content */}
              <Box sx={{ pt: 2 }}>
                {buildingsPanelTab === 'portfolio' ? (
                  <>
                    {buildingsViewMode === 'list' ? (
                      /* ===== LIST VIEW ===== */
                      (() => {
                        // Compute topic headers from first item
                        const firstItem = titleBuildingMode === 'clusters' ? clusterData[0] : filteredBuildings[0];
                        const firstMetrics = firstItem ? (titleBuildingMode === 'clusters' ? (firstItem as typeof clusterData[0]).metrics : (firstItem as typeof filteredBuildings[0]).metrics) : undefined;
                        const firstTrends = firstItem ? (titleBuildingMode === 'clusters' ? (firstItem as typeof clusterData[0]).trends : (firstItem as typeof filteredBuildings[0]).trends) : undefined;
                        const topicHeaders = firstMetrics && firstTrends ? (
                          selection === 'themes_group' ? getThemesTopics(firstMetrics as Record<MetricKeys, { green: number }>, firstTrends as Record<MetricKeys, number>, activeThemeKeys, t)
                          : selection === 'operations_group' ? getOperationsTopics(firstMetrics as Record<MetricKeys, { green: number }>, firstTrends as Record<MetricKeys, number>, t)
                          : selectedMetric === 'overall' ? getOverallTopics(firstMetrics as Record<MetricKeys, { green: number }>, firstTrends as Record<MetricKeys, number>, activeThemeKeys, t)
                          : selectedMetric === 'comfort' ? getComfortTopics(firstMetrics.comfort.green, t)
                          : selectedMetric === 'sustainability' ? getSustainabilityTopics(firstMetrics.sustainability.green, t)
                          : selectedMetric === 'asset_monitoring' ? getAssetMonitoringTopics(firstMetrics.asset_monitoring.green, t)
                          : selectedMetric === 'compliance' ? getComplianceTopics(firstMetrics.compliance.green, t)
                          : selectedMetric === 'maintenance' ? getMaintenanceTopics(firstMetrics.maintenance.green, t)
                          : selectedMetric === 'quotations' ? getQuotationsTopics(firstMetrics.quotations.green, t)
                          : selectedMetric === 'tickets' ? getTicketsTopics(firstMetrics.tickets.green, t)
                          : undefined
                        ) : undefined;
                        const colHeaderSx = { fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' as const, fontSize: '0.7rem', letterSpacing: '0.05em' };

                        return (
                      <Box>
                        {/* Table header */}
                        <Box sx={{
                          display: 'flex',
                          gap: 1.5,
                          px: 2.5,
                          pb: 1,
                          borderBottom: 1,
                          borderColor: 'divider',
                        }}>
                          <Typography variant="caption" sx={{ ...colHeaderSx, flex: 2 }}>Building</Typography>
                          <Typography variant="caption" sx={{ ...colHeaderSx, width: 90, flexShrink: 0 }}>Score</Typography>
                          {selectedMetric !== 'overall' && (
                            <Typography variant="caption" sx={{ ...colHeaderSx, width: 75, flexShrink: 0 }}>Overall</Typography>
                          )}
                          {topicHeaders?.map(t => (
                            <Typography key={t.label} variant="caption" sx={{ ...colHeaderSx, width: 105, flexShrink: 0, textAlign: 'center' }}>
                              {t.label}
                            </Typography>
                          ))}
                          <Typography variant="caption" sx={{ ...colHeaderSx, width: 75, flexShrink: 0, textAlign: 'center' }}>Alerts</Typography>
                          <Typography variant="caption" sx={{ ...colHeaderSx, width: 80, flexShrink: 0, textAlign: 'right' }}>Trend</Typography>
                        </Box>
                        {/* Rows */}
                        {(titleBuildingMode === 'clusters' ? clusterData : filteredBuildings).map((item) => {
                          const isCluster = titleBuildingMode === 'clusters';
                          const b = item as typeof filteredBuildings[0];
                          const c = item as typeof clusterData[0];
                          const name = isCluster ? c.name : b.name;
                          const subtitle = isCluster ? `${c.buildings.length} buildings` : b.address;
                          const image = isCluster ? c.images[0] : b.image;
                          const score = (isCluster ? c.metrics : b.metrics)[selectedMetric].green;
                          const overallScore = (isCluster ? c.metrics : b.metrics).overall.green;
                          const trend = (isCluster ? c.trends : b.trends)[selectedMetric];
                          const stats = !isCluster ? buildingOperationalStats[b.name] : undefined;
                          const rating = getPerformanceRating(score, t);
                          const overallRating = getPerformanceRating(overallScore, t);

                          const metrics = isCluster ? c.metrics : b.metrics;
                          const trends = isCluster ? c.trends : b.trends;
                          const topics = selection === 'themes_group' ? getThemesTopics(metrics as Record<MetricKeys, { green: number }>, trends as Record<MetricKeys, number>, activeThemeKeys, t)
                            : selection === 'operations_group' ? getOperationsTopics(metrics as Record<MetricKeys, { green: number }>, trends as Record<MetricKeys, number>, t)
                            : selectedMetric === 'overall' ? getOverallTopics(metrics as Record<MetricKeys, { green: number }>, trends as Record<MetricKeys, number>, activeThemeKeys, t)
                            : selectedMetric === 'comfort' ? getComfortTopics(metrics.comfort.green, t)
                            : selectedMetric === 'sustainability' ? getSustainabilityTopics(metrics.sustainability.green, t)
                            : selectedMetric === 'asset_monitoring' ? getAssetMonitoringTopics(metrics.asset_monitoring.green, t)
                            : selectedMetric === 'compliance' ? getComplianceTopics(metrics.compliance.green, t)
                            : selectedMetric === 'maintenance' ? getMaintenanceTopics(metrics.maintenance.green, t)
                            : selectedMetric === 'quotations' ? getQuotationsTopics(metrics.quotations.green, t)
                            : selectedMetric === 'tickets' ? getTicketsTopics(metrics.tickets.green, t)
                            : undefined;

                          const energyRating = selectedMetric === 'sustainability' && stats ? stats.sustainability.weiiRating : undefined;
                          const alertCount = selectedMetric === 'comfort' && stats ? stats.comfort.alerts
                            : selectedMetric === 'sustainability' && stats ? stats.sustainability.alerts
                            : selectedMetric === 'asset_monitoring' && stats ? stats.assetMonitoring.alerts
                            : undefined;

                          return (
                            <Box
                              key={name}
                              onClick={(e) => !isCluster && !isInspectMode && handleSidePeekClick(e,
                                () => { setSidePeekZone(null); setSidePeekBuilding(b); setSidePeekBuildingTab('overview'); },
                                () => navigateToBuildingDetail(b),
                              )}
                              sx={{
                                display: 'flex',
                                gap: 1.5,
                                px: 2.5,
                                py: 1.5,
                                alignItems: 'center',
                                cursor: 'pointer',
                                borderBottom: 1,
                                borderColor: 'divider',
                                transition: 'background-color 0.15s ease',
                                '&:hover': { bgcolor: tc.bgPrimaryHover },
                                '&:last-child': { borderBottom: 'none' },
                              }}
                            >
                              {/* Name + address + WEII */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 2 }}>
                                <Box
                                  component="img"
                                  src={image}
                                  alt={name}
                                  sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
                                />
                                <Box sx={{ minWidth: 0 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {name}
                                    </Typography>
                                    {energyRating && <EnergyLabel rating={energyRating} size="small" />}
                                  </Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                    {subtitle}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Score with color-matched icon */}
                              <Box sx={{ width: 90, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{ display: 'flex', color: rating.color, '& .MuiSvgIcon-root': { fontSize: 16, color: `${rating.color} !important` } }}>
                                  {metricInfo[selectedMetric].icon}
                                </Box>
                                <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: rating.color }}>
                                  {score}%
                                </Typography>
                              </Box>

                              {/* Overall score -- hidden when viewing overall */}
                              {selectedMetric !== 'overall' && (
                                <Box sx={{ width: 75, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <SpeedOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary' }}>
                                    {overallScore}%
                                  </Typography>
                                </Box>
                              )}

                              {/* Topic scores -- each in own column, gray */}
                              {topics?.map(t => (
                                <Box key={t.label} sx={{ width: 105, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                  <Box sx={{ display: 'flex', color: 'text.secondary', '& .MuiSvgIcon-root': { fontSize: 16 } }}>{t.icon}</Box>
                                  <Typography sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem' }}>
                                    {t.score}%
                                  </Typography>
                                </Box>
                              ))}

                              {/* Alerts */}
                              <Box sx={{ width: 75, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                {alertCount != null && alertCount > 0 ? (
                                  <>
                                    <NotificationsActiveOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem' }}>
                                      {alertCount}
                                    </Typography>
                                  </>
                                ) : (
                                  <Typography sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>&mdash;</Typography>
                                )}
                              </Box>

                              {/* Trend */}
                              <Box sx={{ width: 80, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                {trend >= 0
                                  ? <TrendingUpIcon sx={{ fontSize: 16, color: tc.statusGood }} />
                                  : <TrendingDownIcon sx={{ fontSize: 16, color: tc.statusPoor }} />}
                                <Typography sx={{
                                  fontWeight: 600,
                                  fontSize: '0.8rem',
                                  color: trend >= 0 ? tc.statusGood : tc.statusPoor,
                                }}>
                                  {trend >= 0 ? '+' : ''}{trend}%
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                        );
                      })()
                    ) : (
                    /* ===== CARDS VIEW ===== */
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
                            <PropertyCard
                              variant="cluster"
                              title={cluster.name}
                              buildingCount={cluster.buildings.length}
                              images={cluster.images}
                              performance={cluster.metrics[selectedMetric]}
                              metricTitle={metricInfo[selectedMetric].title}
                              metricIcon={metricInfo[selectedMetric].icon}
                              overallPerformance={selectedMetric !== 'overall' ? cluster.metrics.overall : undefined}
                              showOverall={selectedMetric !== 'overall'}
                              trend={cluster.trends[selectedMetric]}
                              periodLabel={periodMetrics.periodLabel}
                              topics={selection === 'themes_group' ? getThemesTopics(cluster.metrics as Record<MetricKeys, { green: number }>, cluster.trends as Record<MetricKeys, number>, activeThemeKeys, t) : selection === 'operations_group' ? getOperationsTopics(cluster.metrics as Record<MetricKeys, { green: number }>, cluster.trends as Record<MetricKeys, number>, t) : selectedMetric === 'overall' ? getOverallTopics(cluster.metrics as Record<MetricKeys, { green: number }>, cluster.trends as Record<MetricKeys, number>, activeThemeKeys, t) : selectedMetric === 'comfort' ? getComfortTopics(cluster.metrics.comfort.green, t) : selectedMetric === 'sustainability' ? getSustainabilityTopics(cluster.metrics.sustainability.green, t) : selectedMetric === 'asset_monitoring' ? getAssetMonitoringTopics(cluster.metrics.asset_monitoring.green, t) : selectedMetric === 'compliance' ? getComplianceTopics(cluster.metrics.compliance.green, t) : selectedMetric === 'maintenance' ? getMaintenanceTopics(cluster.metrics.maintenance.green, t) : selectedMetric === 'quotations' ? getQuotationsTopics(cluster.metrics.quotations.green, t) : selectedMetric === 'tickets' ? getTicketsTopics(cluster.metrics.tickets.green, t) : undefined}
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
                          onClick={(e) => isInspectMode ? handleInspectBuilding(b, e) : handleSidePeekClick(e,
                            () => { setSidePeekZone(null); setSidePeekBuilding(b); setSidePeekBuildingTab('overview'); },
                            () => navigateToBuildingDetail(b),
                          )}
                          onMouseEnter={(e) => handleBuildingHover(b, e)}
                          onMouseLeave={() => handleBuildingHover(null)}
                          style={{
                            cursor: 'pointer',
                            outline: isInspectMode && hoveredBuilding === b ? `3px dashed ${tc.brand}` : 'none',
                            outlineOffset: '4px',
                            borderRadius: '12px',
                            transition: 'outline 0.2s ease, z-index 0.2s ease',
                            position: 'relative',
                            zIndex: isInspectMode && hoveredBuilding === b ? 1100 : 'auto'
                          }}
                        >
                          <PropertyCard
                            variant="building"
                            title={b.name}
                            address={b.address}
                            image={b.image}
                            performance={b.metrics[selectedMetric]}
                            metricTitle={metricInfo[selectedMetric].title}
                            metricIcon={metricInfo[selectedMetric].icon}
                            overallPerformance={selectedMetric !== 'overall' ? b.metrics.overall : undefined}
                            showOverall={selectedMetric !== 'overall'}
                            operationalStats={operationalStats}
                            trend={b.trends[selectedMetric]}
                            periodLabel={periodMetrics.periodLabel}
                            topics={selection === 'themes_group' ? getThemesTopics(b.metrics, b.trends, activeThemeKeys, t) : selection === 'operations_group' ? getOperationsTopics(b.metrics, b.trends, t) : selectedMetric === 'overall' ? getOverallTopics(b.metrics, b.trends, activeThemeKeys, t) : selectedMetric === 'comfort' ? getComfortTopics(b.metrics.comfort.green, t) : selectedMetric === 'sustainability' ? getSustainabilityTopics(b.metrics.sustainability.green, t) : selectedMetric === 'asset_monitoring' ? getAssetMonitoringTopics(b.metrics.asset_monitoring.green, t) : selectedMetric === 'compliance' ? getComplianceTopics(b.metrics.compliance.green, t) : selectedMetric === 'maintenance' ? getMaintenanceTopics(b.metrics.maintenance.green, t) : selectedMetric === 'quotations' ? getQuotationsTopics(b.metrics.quotations.green, t) : selectedMetric === 'tickets' ? getTicketsTopics(b.metrics.tickets.green, t) : undefined}
                            energyRating={selectedMetric === 'sustainability' && stats ? stats.sustainability.weiiRating : undefined}
                            alertCount={selectedMetric === 'comfort' && stats ? stats.comfort.alerts : selectedMetric === 'sustainability' && stats ? stats.sustainability.alerts : selectedMetric === 'asset_monitoring' && stats ? stats.assetMonitoring.alerts : undefined}
                          />
                        </motion.div>
                      );
                    })
                      )}
                    </Box>
                    )}
                  </>
                ) : buildingsPanelTab === 'performance' ? (
                  /* ===== KPI ANALYSIS VIEW ===== */
                  <KPIAnalysisView
                    selection={selection}
                    selectedMetric={selectedMetric}
                    themesEnabled={isThemesActive}
                    operationsEnabled={isOperationsActive}
                    metricInfo={metricInfo}
                    onMetricSelect={handleMetricSelect}
                    periodMetrics={periodMetrics}
                    themeKeys={activeThemeKeys}
                    onBuildingSelect={(b) => { setSidePeekBuilding(b); setSidePeekBuildingTab('overview'); }}
                    onViewAllBuildings={(sort) => {
                      setBuildingsPanelTab('portfolio');
                      setURLParams({ sort });
                    }}
                    buildingMode={titleBuildingMode}
                    onNavigateToDashboard={(id) => {
                      setPendingDashboardId(id);
                      handlePageChange('dashboards');
                    }}
                    onViewAllTickets={(actionRequired) => {
                      setLocalQuickviewAsset(null);
                      setSidePeekBuilding(null);
                      setSidePeekZone(null);
                      router.push('/operations/tickets' + (actionRequired ? '?statusFilter=To+approve' : ''), { scroll: false });
                    }}
                    onViewAllQuotations={(actionRequired) => {
                      setLocalQuickviewAsset(null);
                      setSidePeekBuilding(null);
                      setSidePeekZone(null);
                      router.push('/operations/quotations' + (actionRequired ? '?statusFilter=Open,Assigned' : ''), { scroll: false });
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
                    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: tc.bgPrimary, height: 300 }}>
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
                    <Box sx={{ p: 3, border: 1, borderColor: 'divider', bgcolor: tc.bgPrimary }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Space Allocation</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {['Open Workspace', 'Private Offices', 'Meeting Rooms', 'Common Areas', 'Storage'].map((space, i) => (
                          <Box key={space}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">{space}</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{[45, 25, 15, 10, 5][i]}%</Typography>
                            </Box>
                            <Box sx={{ height: 8, borderRadius: 4, bgcolor: tc.bgSecondaryHover, overflow: 'hidden' }}>
                              <Box sx={{ width: `${[45, 25, 15, 10, 5][i]}%`, height: '100%', bgcolor: tc.brand, transition: 'width 0.5s ease' }} />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: tc.bgPrimary }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Occupancy Trends</Typography>
                      <Typography variant="body2" color="text.secondary">Peak hours, utilization patterns, and capacity insights</Typography>
                    </Box>
                  </Box>
                </>
              ) : selectedMetric === 'compliance' ? (
                <>
                  <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: tc.bgPrimary }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Compliance Score</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>94%</Typography>
                      <Typography variant="body2" color="success.main">+3% from last audit</Typography>
                    </Box>
                    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: tc.bgPrimary }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Active Certifications</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>8</Typography>
                      <Typography variant="body2" color="text.secondary">ISO, LEED, BREEAM</Typography>
                    </Box>
                    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: tc.bgPrimary }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Pending Actions</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>3</Typography>
                      <Typography variant="body2" color="warning.main">Due within 30 days</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: tc.bgPrimary }}>
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
                          <Box sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: tc.bgSecondaryHover, overflow: 'hidden' }}>
                            <Box sx={{ width: `${item.score}%`, height: '100%', bgcolor: item.score > 90 ? tc.statusGood : tc.statusModerate }} />
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
    </Container>
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
  onViewAllTickets,
  onViewAllQuotations,
  themeKeys = PRIMARY_THEME_KEYS,
}: {
  selection: string;
  selectedMetric: MetricType;
  themesEnabled: boolean;
  operationsEnabled: boolean;
  metricInfo: Record<MetricType, { title: string; icon: React.ReactNode }>;
  onMetricSelect: (metric: MetricType) => void;
  periodMetrics: PeriodMetrics;
  onBuildingSelect?: (building: Building) => void;
  onViewAllBuildings?: (sort: 'Best to Worst' | 'Worst to Best') => void;
  buildingMode?: BuildingFilterMode;
  onNavigateToDashboard?: (dashboardId: string) => void;
  onViewAllTickets?: (actionRequired: boolean) => void;
  onViewAllQuotations?: (actionRequired: boolean) => void;
  themeKeys?: MetricType[];
}) {
  // Determine which KPIs to show based on toggle state and selection
  const visibleThemes = themesEnabled ? themeKeys : [];
  const visibleOps = operationsEnabled ? OPERATIONS_KEYS : [];
  const allVisible = [...visibleThemes, ...visibleOps];

  // If a specific child metric is selected (not a group), show its detailed view
  const focusedMetric = (selection !== 'overall' && selection !== 'themes_group' && selection !== 'operations_group' && allVisible.includes(selection as MetricType))
    ? (selection as MetricType)
    : null;

  if (focusedMetric) {
    return <ThemeSpecificDashboard metricKey={focusedMetric} metricInfo={metricInfo} periodMetrics={periodMetrics} onBuildingSelect={onBuildingSelect} onViewAllBuildings={onViewAllBuildings} buildingMode={buildingMode} onNavigateToDashboard={onNavigateToDashboard} onViewAllTickets={onViewAllTickets} onViewAllQuotations={onViewAllQuotations} />;
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

  // Operations group: show combined operations performance page
  if (selection === 'operations_group') {
    const ticketsMetric = periodMetrics.operations.find(t => t.title === 'Tickets');
    const quotationsMetric = periodMetrics.operations.find(t => t.title === 'Quotations');
    const maintenanceMetric = periodMetrics.operations.find(t => t.title === 'Maintenance');
    const opsScores = {
      tickets: ticketsMetric?.score ?? 71,
      quotations: quotationsMetric?.score ?? 74,
      maintenance: maintenanceMetric?.score ?? 78,
    };
    const opsTrends = {
      tickets: ticketsMetric?.trend ?? 1,
      quotations: quotationsMetric?.trend ?? 2,
      maintenance: maintenanceMetric?.trend ?? 3,
    };
    const avgScore = Math.round((opsScores.tickets + opsScores.quotations + opsScores.maintenance) / 3);
    const avgTrend = Math.round(((opsTrends.tickets + opsTrends.quotations + opsTrends.maintenance) / 3) * 10) / 10;
    return <OperationsPerformancePage opsScores={opsScores} opsTrends={opsTrends} overallScore={avgScore} overallTrend={avgTrend} onBuildingSelect={onBuildingSelect} onViewAllBuildings={onViewAllBuildings} buildingMode={buildingMode} onNavigateToDashboard={onNavigateToDashboard} />;
  }

  // Overview: show overall performance page with Theme KPIs / Operational KPIs chart
  {
    const themeKeys: MetricType[] = ['sustainability', 'comfort', 'asset_monitoring', 'compliance'];
    const opsKeys: MetricType[] = ['tickets', 'quotations', 'maintenance'];
    const themesScore = Math.round(themeKeys.reduce((sum, k) => {
      const m = periodMetrics.themes.find(t => t.title === metricInfo[k]?.title);
      return sum + (m?.score ?? 0);
    }, 0) / themeKeys.length);
    const themesTrend = Math.round(themeKeys.reduce((sum, k) => {
      const m = periodMetrics.themes.find(t => t.title === metricInfo[k]?.title);
      return sum + (m?.trend ?? 0);
    }, 0) / themeKeys.length * 10) / 10;
    const operationsScore = Math.round(opsKeys.reduce((sum, k) => {
      const m = periodMetrics.operations.find(t => t.title === metricInfo[k]?.title);
      return sum + (m?.score ?? 0);
    }, 0) / opsKeys.length);
    const operationsTrend = Math.round(opsKeys.reduce((sum, k) => {
      const m = periodMetrics.operations.find(t => t.title === metricInfo[k]?.title);
      return sum + (m?.trend ?? 0);
    }, 0) / opsKeys.length * 10) / 10;
    const overallScore = Math.round((themesScore + operationsScore) / 2);
    const overallTrend = Math.round((themesTrend + operationsTrend) / 2 * 10) / 10;
    return (
      <OverallPerformancePage
        themesScore={themesScore}
        themesTrend={themesTrend}
        operationsScore={operationsScore}
        operationsTrend={operationsTrend}
        overallScore={overallScore}
        overallTrend={overallTrend}
        onBuildingSelect={onBuildingSelect}
        onViewAllBuildings={onViewAllBuildings}
        buildingMode={buildingMode}
      />
    );
  }
}

/* Summary stat card for performance indicators */
function SummaryStatCard({ label, value, subtitle, trend }: { label: string; value: string; subtitle?: string; trend?: number }) {
  const { themeColors: c } = useThemeMode();
  return (
    <Box sx={{
      p: 2.5,
      border: `1px solid ${c.cardBorder}`,
      borderRadius: '12px',
      bgcolor: c.bgPrimary,
      boxShadow: `0 2px 12px 0 ${c.shadow}`,
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 4px 20px 0 ${c.shadow}`,
      },
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
  const { themeColors: c } = useThemeMode();
  return (
    <Box sx={{
      p: 3,
      border: `1px solid ${c.cardBorder}`,
      borderRadius: '12px',
      bgcolor: c.bgPrimary,
      boxShadow: `0 2px 12px 0 ${c.shadow}`,
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 4px 20px 0 ${c.shadow}`,
      },
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
            height: `${30 + ((i * 37 + 13) % 60)}%`,
            bgcolor: color,
            borderRadius: '2px 2px 0 0',
            opacity: 0.3 + ((i * 23 + 7) % 70) / 100,
            transition: 'height 0.3s ease',
          }} />
        ))}
        {type === 'line' && (
          <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            <path
              d={`M 0,${70 - ((3 * 37 + 13) % 30)} ${Array.from({ length: 10 }).map((_, i) => `L ${(i + 1) * 20},${30 + ((i * 41 + 17) % 50)}`).join(' ')}`}
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
                  <Box sx={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', bgcolor: c.bgSecondaryHover, mt: 0.5 }}>
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
              <circle cx="70" cy="70" r="55" fill="none" stroke={c.borderSecondary} strokeWidth="20" />
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
function ThemeSpecificDashboard({ metricKey, metricInfo, periodMetrics, onBuildingSelect, onViewAllBuildings, buildingMode = 'buildings', onNavigateToDashboard, onViewAllTickets, onViewAllQuotations }: { metricKey: MetricType; metricInfo: Record<MetricType, { title: string; icon: React.ReactNode }>; periodMetrics: PeriodMetrics; onBuildingSelect?: (building: Building) => void; onViewAllBuildings?: (sort: 'Best to Worst' | 'Worst to Best') => void; buildingMode?: BuildingFilterMode; onNavigateToDashboard?: (dashboardId: string) => void; onViewAllTickets?: (actionRequired: boolean) => void; onViewAllQuotations?: (actionRequired: boolean) => void }) {
  const { themeColors: c } = useThemeMode();
  const info = metricInfo[metricKey];

  // Common header
  const header = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
      {info.icon}
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        {info.title} &mdash; Portfolio Analytics
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
          <SummaryStatCard label="Energy Cost" value="&euro;342K" subtitle="This month" trend={2} />
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
          <IndicatorChart title="Top Consumers" type="ranking" color={c.statusPoor} />
        </Box>
        <IndicatorChart title="Energy vs Temperature Correlation" type="line" color="#ed6c02" />
      </Box>
    );
  }

  // Sustainability Dashboard
  if (metricKey === 'sustainability') {
    const sustainabilityMetric = periodMetrics.themes.find(t => t.title === 'Sustainability');
    return <SustainabilityPerformancePage themeScore={sustainabilityMetric?.score ?? 72} themeTrend={sustainabilityMetric?.trend ?? 4} onBuildingSelect={onBuildingSelect} onViewAllBuildings={onViewAllBuildings} buildingMode={buildingMode} onNavigateToDashboard={onNavigateToDashboard} />;
  }

  // Comfort Dashboard
  if (metricKey === 'comfort') {
    const comfortMetric = periodMetrics.themes.find(t => t.title === 'Comfort');
    return <ComfortPerformancePage themeScore={comfortMetric?.score ?? 92} themeTrend={comfortMetric?.trend ?? 5} onBuildingSelect={onBuildingSelect} onViewAllBuildings={onViewAllBuildings} buildingMode={buildingMode} onNavigateToDashboard={onNavigateToDashboard} />;
  }

  // Asset Monitoring Dashboard
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
          <IndicatorChart title="Access Activity (24 hours)" type="line" color={c.brand} />
          <IndicatorChart title="Access by Building" type="bar" color={c.brand} />
        </Box>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <IndicatorChart title="Peak Access Times" type="bar" color={c.brand} />
          <IndicatorChart title="Card Status Distribution" type="pie" color={c.brand} />
          <IndicatorChart title="Security Events" type="ranking" color={c.statusPoor} />
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
          <SummaryStatCard label="Monthly Usage" value="142K m3" subtitle="vs 135K target" trend={5} />
          <SummaryStatCard label="Water Cost" value="&euro;68K" trend={4} />
          <SummaryStatCard label="Active Leaks" value="2" subtitle="Detected" trend={-50} />
          <SummaryStatCard label="Conservation Rate" value="15%" trend={8} />
        </Box>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <IndicatorChart title="Water Consumption Trend" type="line" color={c.brand} />
          <IndicatorChart title="Usage by Building" type="bar" color={c.brand} />
        </Box>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <IndicatorChart title="Leak Detection History" type="line" color={c.statusPoor} />
          <IndicatorChart title="Conservation Initiatives" type="bar" color={c.statusGood} />
          <IndicatorChart title="Top Water Consumers" type="ranking" color={c.brand} />
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
          <IndicatorChart title="Incident Trends" type="line" color={c.statusGood} />
          <IndicatorChart title="Security Coverage by Zone" type="bar" color={c.statusGood} />
        </Box>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <IndicatorChart title="Alert Types" type="pie" color={c.statusGood} />
          <IndicatorChart title="Response Times by Building" type="bar" color={c.statusGood} />
          <IndicatorChart title="Camera Health Status" type="ranking" color={c.statusGood} />
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
          <IndicatorChart title="Occupancy Trends (7 days)" type="line" color={c.brand} />
          <IndicatorChart title="Space Utilization by Floor" type="bar" color={c.brand} />
        </Box>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <IndicatorChart title="Peak Hours" type="bar" color={c.brand} />
          <IndicatorChart title="Space Types Distribution" type="pie" color={c.brand} />
          <IndicatorChart title="Booking Patterns" type="line" color={c.brand} />
        </Box>
      </Box>
    );
  }

  // Compliance Dashboard
  if (metricKey === 'compliance') {
    const complianceMetric = periodMetrics.themes.find(t => t.title === 'Compliance');
    return <CompliancePerformancePage themeScore={complianceMetric?.score ?? 88} themeTrend={complianceMetric?.trend ?? 6} onBuildingSelect={onBuildingSelect} onViewAllBuildings={onViewAllBuildings} buildingMode={buildingMode} onNavigateToDashboard={onNavigateToDashboard} />;
  }

  // Tickets Dashboard
  if (metricKey === 'tickets') {
    const ticketsMetric = periodMetrics.operations.find(t => t.title === 'Tickets');
    return <TicketsPerformancePage themeScore={ticketsMetric?.score ?? 71} themeTrend={ticketsMetric?.trend ?? 1} onBuildingSelect={onBuildingSelect} onViewAllBuildings={onViewAllBuildings} buildingMode={buildingMode} onNavigateToDashboard={onNavigateToDashboard} onViewAllTickets={onViewAllTickets} />;
  }

  // Quotations Dashboard
  if (metricKey === 'quotations') {
    const quotationsMetric = periodMetrics.operations.find(t => t.title === 'Quotations');
    return <QuotationsPerformancePage themeScore={quotationsMetric?.score ?? 74} themeTrend={quotationsMetric?.trend ?? 2} onBuildingSelect={onBuildingSelect} onViewAllBuildings={onViewAllBuildings} buildingMode={buildingMode} onNavigateToDashboard={onNavigateToDashboard} onViewAllQuotations={onViewAllQuotations} />;
  }

  // Maintenance Dashboard
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
      { label: 'Cost This Month', value: '\u20AC342K', target: '\u20AC320K', progress: 107, color: '#ed6c02' },
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
      { label: 'Avg Temperature', value: '21.5\u00B0C', target: '21\u00B0C', progress: 98, color: '#f44336' },
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
      { label: 'Monthly Usage', value: '142K m\u00B3', target: '135K m\u00B3', progress: 105, color: colors.brand },
      { label: 'Cost This Month', value: '\u20AC68K', target: '\u20AC65K', progress: 105, color: colors.brand },
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
      { label: 'Cost Outstanding', value: '\u20AC45K', progress: 70, color: '#ed6c02' },
    ]
  },
  quotations: {
    description: 'Quote management, approval tracking, and cost forecasting',
    alerts: 5,
    metrics: [
      { label: 'Pending Quotes', value: '23', progress: 70, color: '#ed6c02' },
      { label: 'Total Value', value: '\u20AC125K', progress: 80, color: '#ed6c02' },
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

/* Generic metric view for new themes that don't have dedicated chart components */
function GenericMetricView({ metricKey, metricInfo, buildingName }: { metricKey: MetricType; metricInfo: Record<MetricType, { title: string; icon: React.ReactNode }>; buildingName: string }) {
  const { themeColors: c } = useThemeMode();
  const info = metricInfo[metricKey];
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        {info.icon}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {info.title} &mdash; {buildingName}
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <SummaryStatCard label="Current Score" value="78%" trend={4} />
        <SummaryStatCard label="30-Day Average" value="75%" />
        <SummaryStatCard label="Active Alerts" value="3" subtitle="2 medium, 1 low" />
        <SummaryStatCard label="Last Updated" value="2h ago" subtitle="Auto-refreshing" />
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <IndicatorChart title={`${info.title} Trend \u2014 Last 12 Months`} type="line" color={c.brand} />
        <IndicatorChart title="Score Distribution" type="bar" color={c.statusGood} />
      </Box>

      <IndicatorChart title="Performance Breakdown" type="ranking" color={c.brand} />
    </Box>
  );
}
