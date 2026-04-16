'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
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
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';

import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import FloatingToolbar from '@/components/FloatingToolbar';
import AssetDetail from '@/components/AssetDetail';
import AssetBreadcrumb from '@/components/AssetBreadcrumb';
import NotificationsPanel from '@/components/NotificationsPanel';
import DataExplorerPanel from '@/components/DataExplorerPanel';
import SidePeekPanel, { handleSidePeekClick } from '@/components/SidePeekPanel';
import BuildingTemplate from '@/templates/building';
import ZoneTemplate from '@/templates/zone';
import AssetTemplate from '@/templates/asset';
import TicketTemplate from '@/templates/ticket';
import QuotationTemplate from '@/templates/quotation';
import ZonesList from '@/components/ZonesList';
import AssetsList, { type EnrichedAsset } from '@/components/AssetsList';
import DocumentsList from '@/components/DocumentsList';
import ChangelogButton from '@/components/ChangelogButton';
import DateRangeSelector, { getDateRangeDisplayLabel } from '@/components/DateRangeSelector';
import { BuildingSelectorPopover, getBuildingSelectorLabel, type BuildingFilterMode, type ContractFilter } from '@/components/BuildingSelector';

import { useAppState } from '@/context/AppStateContext';
import { useURLState } from '@/hooks/useURLState';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage } from '@/i18n';
import { buildings as allBuildings, tenants, type Building, type MetricKeys } from '@/data/buildings';
import { zones as allZones } from '@/data/zones';
import { assetTree, getAssetById, getPathToAsset, type AssetNode } from '@/data/assetTree';
import { tickets as allTickets } from '@/data/tickets';
import { quotations as allQuotations } from '@/data/quotations';
import { documentFiles } from '@/data/documents';
import { getMetricsForPeriod, applyContractVariation, CONTRACT_HIDDEN_THEME_KEYS, CONTRACT_HIDDEN_OPERATIONS_KEYS } from '@/data/metrics';
import { buildingToSlug, slugToBuilding } from '@/utils/slugs';

// ── Constants ──────────────────────────────────────────────────────────────

type MetricType = MetricKeys;

const PRIMARY_THEME_KEYS: MetricType[] = ['sustainability', 'comfort', 'asset_monitoring', 'compliance'];
const OPERATIONS_KEYS: MetricType[] = ['tickets', 'quotations', 'maintenance'];

const TENANT_THEME_KEYS: Record<string, MetricType[]> = {
  'de Bijenkorf': ['sustainability'],
  'Stichting Carmelcollege': ['comfort'],
};

// ── Flatten Buildings tree with building context (for side peek assets) ──
function collectFromBuildings(nodes: AssetNode[], seen = new Set<string>(), building = ''): EnrichedAsset[] {
  const result: EnrichedAsset[] = [];
  for (const node of nodes) {
    const ctx = node.type === 'building' ? node.name : building;
    if (node.type === 'asset' && !seen.has(node.id)) {
      result.push({ ...node, building: ctx });
      seen.add(node.id);
    } else if (node.children) {
      result.push(...collectFromBuildings(node.children, seen, ctx));
    }
  }
  return result;
}

const buildingsTreeNode = assetTree.find(n => n.id === 'dt-buildings');
const ALL_ASSETS: EnrichedAsset[] = buildingsTreeNode
  ? collectFromBuildings(buildingsTreeNode.children?.slice(0, 15) ?? [])
  : [];

// ── Helpers ──────────────────────────────────────────────────────────────

// ── Shell Layout ────────────────────────────────────────────────────────

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const { themeColors: tc } = useThemeMode();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const isNarrow = useMediaQuery('(max-width:960px)');

  // ── Context state ──────────────────────────────────────────────────────
  const {
    leftSidebarCollapsed, setLeftSidebarCollapsed,
    notificationsPanelOpen, setNotificationsPanelOpen,
    notificationsRef,
    hasUnreadNotifications, setHasUnreadNotifications,
    dataExplorerOpen, setDataExplorerOpen,
    dataExplorerWidth, setDataExplorerWidth,
    exportToast, setExportToast,
    sidePeekBuilding, setSidePeekBuilding,
    sidePeekBuildingTab, setSidePeekBuildingTab,
    sidePeekZone, setSidePeekZone,
    sidePeekZoneTab, setSidePeekZoneTab,
    sidePeekAsset, setSidePeekAsset,
    sidePeekAssetTab, setSidePeekAssetTab,
    sidePeekTicket, setSidePeekTicket,
    sidePeekQuotation, setSidePeekQuotation,
    favorites, setFavorites,
    localQuickviewAsset, setLocalQuickviewAsset,
    openedViaInspect, setOpenedViaInspect,
    mobileNavRef, mobileBackdropRef,
    activeDashboardId, activeDashboardLabel,
    pendingDashboardId, setPendingDashboardId,
  } = useAppState();

  // ── URL state ──────────────────────────────────────────────────────────
  const {
    selectedBuilding, selection, dateRange, contract,
    selectedGroup, selectedCity, selectedTenant,
    isInspectMode, isAssetExplorerOpen, assetTab, urlAsset,
    setURLParams, setDateRange, setSelectedGroup, setSelectedCity,
    setSelectedTenant, setIsInspectMode, setIsAssetExplorerOpen,
    setAssetTab, setViewMode, setSelection, setContract,
  } = useURLState();

  // ── Derived from pathname ──────────────────────────────────────────────
  // Detail pages hide the TopBar

  // ── Local shell state ──────────────────────────────────────────────────
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [titleDatePickerOpen, setTitleDatePickerOpen] = useState(false);
  const [titleBuildingAnchor, setTitleBuildingAnchor] = useState<null | HTMLElement>(null);
  const [contractMenuAnchor, setContractMenuAnchor] = useState<null | HTMLElement>(null);
  const [titleBuildingNames, setTitleBuildingNames] = useState<string[]>([]);
  const [titleBuildingMode, setTitleBuildingMode] = useState<BuildingFilterMode>('buildings');
  const contractFilter = contract as ContractFilter;
  const [hoveredBuilding, setHoveredBuilding] = useState<Building | null>(null);
  const [hoveredAsset, setHoveredAsset] = useState<{ id?: string; type?: string; name: string; category?: string } | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  // ── Clear side peek state on navigation ────────────────────────────────
  const navigatingRef = useRef(false);
  useEffect(() => {
    navigatingRef.current = true;
    setSidePeekBuilding(null);
    setSidePeekZone(null);
    setSidePeekAsset(null);
    setSidePeekTicket(null);
    setSidePeekQuotation(null);
    setLocalQuickviewAsset(null);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync side peek ↔ URL ?peek= param ─────────────────────────────────
  // Write: side peek state → URL
  const peekSyncRef = useRef(false); // guard against sync loops
  useEffect(() => {
    // Skip sync when peeks were cleared due to pathname change
    if (navigatingRef.current) { navigatingRef.current = false; return; }
    if (peekSyncRef.current) { peekSyncRef.current = false; return; }
    if (sidePeekBuilding) {
      setURLParams({ peek: `building:${sidePeekBuilding.id}` });
    } else if (sidePeekZone) {
      setURLParams({ peek: `zone:${sidePeekZone.id}` });
    } else if (sidePeekAsset) {
      setURLParams({ peek: `asset:${sidePeekAsset.id}` });
    } else if (sidePeekTicket) {
      setURLParams({ peek: `ticket:${sidePeekTicket.id}` });
    } else if (sidePeekQuotation) {
      setURLParams({ peek: `quotation:${sidePeekQuotation.id}` });
    } else {
      setURLParams({ peek: '' });
    }
  }, [sidePeekBuilding, sidePeekZone, sidePeekAsset, sidePeekTicket, sidePeekQuotation]); // eslint-disable-line react-hooks/exhaustive-deps

  // Read: URL ?peek= param → side peek state (on mount only)
  useEffect(() => {
    const peekParam = new URLSearchParams(window.location.search).get('peek');
    if (!peekParam) return;
    const colonIdx = peekParam.indexOf(':');
    if (colonIdx === -1) return;
    const type = peekParam.slice(0, colonIdx);
    const id = peekParam.slice(colonIdx + 1);
    peekSyncRef.current = true; // prevent the write effect from firing
    if (type === 'building') {
      const b = slugToBuilding(id);
      if (b) { setSidePeekBuilding(b); setSidePeekBuildingTab('overview'); }
    } else if (type === 'zone') {
      const z = allZones.find(z => z.id === id);
      if (z) { setSidePeekZone(z); setSidePeekZoneTab('overview'); }
    } else if (type === 'asset') {
      const a = getAssetById(id);
      if (a) { setSidePeekAsset(a); setSidePeekAssetTab('overview'); }
    } else if (type === 'ticket') {
      const t = allTickets.find(t => t.id === id);
      if (t) { setSidePeekTicket(t); }
    } else if (type === 'quotation') {
      const q = allQuotations.find(q => q.id === id);
      if (q) { setSidePeekQuotation(q); }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Close mobile nav on navigation ─────────────────────────────────────
  const closeMobileNav = useCallback(() => {
    mobileNavRef.current?.removeAttribute('data-open');
    mobileBackdropRef.current?.removeAttribute('data-open');
  }, [mobileNavRef, mobileBackdropRef]);

  const openMobileNav = useCallback(() => {
    mobileNavRef.current?.setAttribute('data-open', 'true');
    mobileBackdropRef.current?.setAttribute('data-open', 'true');
  }, [mobileNavRef, mobileBackdropRef]);

  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  // ── Layout calculations ────────────────────────────────────────────────
  const leftSidebarWidth = leftSidebarCollapsed ? 64 : 280;
  const quickviewAsset = localQuickviewAsset ?? urlAsset;
  const isAssetQuickviewOpen = !!quickviewAsset;
  const viewingAssetDetail = isAssetQuickviewOpen;
  const selectedAsset = quickviewAsset;
  const hideTopBar = pathname.startsWith('/buildings/') || pathname.startsWith('/zones/') || pathname.startsWith('/assets/') || pathname.startsWith('/operations/tickets/') || pathname.startsWith('/operations/quotations/');

  // ── Active theme keys for tenant ───────────────────────────────────────
  const activeThemeKeys = TENANT_THEME_KEYS[selectedTenant] ?? PRIMARY_THEME_KEYS;

  // ── Data computations for TopBar ───────────────────────────────────────

  // Filter buildings by selected tenant
  const tenantBuildings = useMemo(() => {
    return allBuildings.filter(b => b.tenant === selectedTenant);
  }, [selectedTenant]);

  // Filtered buildings (with contract filter)
  const filteredBuildings = useMemo(() => {
    if (!contractFilter) return tenantBuildings;
    return tenantBuildings.filter(b => b.hasContract);
  }, [tenantBuildings, contractFilter]);

  // Period-aware metrics
  const periodMetrics = useMemo(() => {
    const base = getMetricsForPeriod(dateRange, titleBuildingNames);
    return contractFilter ? applyContractVariation(base) : base;
  }, [dateRange, contractFilter, titleBuildingNames]);

  // Score for the currently selected KPI (shown in breadcrumb)
  const selectionScore = (() => {
    const themeIdx = activeThemeKeys.indexOf(selection as MetricType);
    if (themeIdx !== -1) {
      const fullIdx = PRIMARY_THEME_KEYS.indexOf(selection as MetricType);
      return selectedBuilding ? selectedBuilding.metrics[selection as MetricType].green : periodMetrics.themes[fullIdx]?.score ?? null;
    }
    const opsIdx = OPERATIONS_KEYS.indexOf(selection as MetricType);
    if (opsIdx !== -1) {
      return selectedBuilding ? selectedBuilding.metrics[selection as MetricType].green : periodMetrics.operations[opsIdx]?.score ?? null;
    }
    return null;
  })();

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

  // Metric items for breadcrumb dropdown
  const metricItems = useMemo(() => [
    ...activeThemeKeys.map((key) => {
      const i = PRIMARY_THEME_KEYS.indexOf(key);
      return {
        key,
        label: periodMetrics.themes[i]?.title ?? key,
        icon: themeIcons[periodMetrics.themes[i]?.title ?? ''],
        score: selectedBuilding ? selectedBuilding.metrics[key].green : periodMetrics.themes[i]?.score ?? 0,
        group: 'themes' as const,
      };
    }),
    ...OPERATIONS_KEYS.map((key, i) => ({
      key,
      label: periodMetrics.operations[i]?.title ?? key,
      icon: operationsIcons[periodMetrics.operations[i]?.title ?? ''],
      score: selectedBuilding ? selectedBuilding.metrics[key].green : periodMetrics.operations[i]?.score ?? 0,
      group: 'operations' as const,
    })),
  ], [periodMetrics, selectedBuilding, activeThemeKeys]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleBuildingFilterModeChange = (mode: BuildingFilterMode) => {
    setTitleBuildingMode(mode);
    setTitleBuildingNames([]);
  };

  const getTitleBuildingLabel = () => getBuildingSelectorLabel(titleBuildingNames, titleBuildingMode, t);
  const getPeriodDisplayLabel = (range: string): string => getDateRangeDisplayLabel(range, t);

  // Sequential closing of both drawers (concertina effect)
  const handleCloseBothDrawers = () => {
    setLocalQuickviewAsset(null);
    setURLParams({ asset: '', assetTab: '0' });
    setTimeout(() => {
      setURLParams({ explorer: '0' });
      setOpenedViaInspect(false);
    }, 300);
  };

  // Handle asset selection from tree
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

  // Handle left sidebar toggle
  const handleLeftSidebarToggle = useCallback(() => {
    if (window.matchMedia('(max-width: 926px)').matches) {
      const isOpen = mobileNavRef.current?.hasAttribute('data-open');
      if (isOpen) closeMobileNav(); else openMobileNav();
      return;
    }
    if (leftSidebarCollapsed) {
      setURLParams({ view: 'dashboard' });
    }
    setLeftSidebarCollapsed(c => !c);
  }, [leftSidebarCollapsed, setURLParams, openMobileNav, closeMobileNav, mobileNavRef, setLeftSidebarCollapsed]);

  // Navigate helper for sidebar
  const handleNavigate = useCallback((path: string) => {
    router.push(path, { scroll: false });
  }, [router]);

  // Sidebar metric/selection callbacks
  const handleSidebarMetricSelect = useCallback((metric: string) => setSelection(metric), [setSelection]);
  const handleSidebarSelectionChange = useCallback((s: string) => setSelection(s), [setSelection]);
  const handleDashboardNavigate = useCallback((id: string) => setPendingDashboardId(id), [setPendingDashboardId]);

  const handleAssetExplorerToggle = useCallback(() => {
    setIsAssetExplorerOpen(!isAssetExplorerOpen);
    if (!isAssetExplorerOpen && isInspectMode) {
      setIsInspectMode(false);
    }
  }, [isAssetExplorerOpen, isInspectMode, setIsAssetExplorerOpen, setIsInspectMode]);

  const handleNotificationsPanelToggle = useCallback(() => {
    const opening = !notificationsPanelOpen;
    setNotificationsPanelOpen(opening);
    if (opening) {
      setHasUnreadNotifications(false);
      setDataExplorerOpen(false);
    }
  }, [notificationsPanelOpen, setNotificationsPanelOpen, setHasUnreadNotifications, setDataExplorerOpen]);

  const handleDataExplorerToggle = useCallback(() => {
    const opening = !dataExplorerOpen;
    setDataExplorerOpen(opening);
    if (opening) setNotificationsPanelOpen(false);
  }, [dataExplorerOpen, setDataExplorerOpen, setNotificationsPanelOpen]);

  // Page name + favorites
  const getCurrentPageName = () => {
    if (pathname === '/dashboards' && activeDashboardLabel) return `Dashboards - ${activeDashboardLabel}`;
    if (pathname === '/dashboards') return 'Dashboards';
    if (pathname === '/insights/alerts' || pathname === '/insights') return 'Insights - Alerts';
    if (pathname === '/insights/analyses') return 'Insights - Analyses';
    if (pathname === '/insights/performance') return 'Insights - Performance';
    if (pathname === '/themes') return 'Themes';
    if (pathname === '/exports') return 'Exports';
    if (pathname === '/portfolio/buildings') return 'Portfolio';
    if (pathname === '/portfolio/zones') return 'Zones';
    if (pathname === '/portfolio/assets') return 'Assets';
    if (pathname.startsWith('/buildings/')) return selectedBuilding?.name ?? 'Building';
    if (pathname.startsWith('/zones/')) return 'Zone';
    if (pathname.startsWith('/assets/')) return 'Asset';
    if (pathname === '/bms/access' || pathname === '/bms') return 'BMS - Access';
    if (pathname === '/bms/logging') return 'BMS - Logging';
    if (pathname.startsWith('/operations')) return 'Operations';
    if (pathname === '/settings') return 'Settings';
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
    if (pathname === '/dashboards') return 'dashboard';
    if (selectedBuilding) return 'building';
    return 'page';
  };

  const handleFavoriteToggle = (pageName: string, isFavorited: boolean) => {
    if (isFavorited) {
      const newFavorite = {
        id: Date.now().toString(),
        name: pageName,
        type: getFavoriteType(),
      };
      setFavorites([...favorites, newFavorite]);
    } else {
      setFavorites(favorites.filter(fav => fav.name !== pageName));
    }
  };

  const handleExport = () => {
    const exportName = selectedBuilding
      ? `${selectedBuilding.name} — ${selection === 'overall' ? 'Overview' : String(selection).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`
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

  const setSelectedBuilding = useCallback((b: Building | null) => {
    if (b) {
      router.push(`/buildings/${b.id}`, { scroll: false });
    }
  }, [router]);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: tc.bgSecondary, overflow: 'hidden', width: '100%', maxWidth: '100vw' }}>
      {/* Mobile backdrop -- always rendered, hidden on desktop via CSS */}
      <Box
        ref={mobileBackdropRef}
        onClick={closeMobileNav}
        sx={{
          display: 'none',
          '@media (max-width: 926px)': {
            display: 'block',
          },
          position: 'fixed',
          inset: 0,
          bgcolor: 'rgba(0,0,0,0.5)',
          zIndex: 1499,
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.3s ease',
          '&[data-open]': {
            opacity: 1,
            pointerEvents: 'auto',
          },
        }}
      />

      {/* Left Sidebar */}
      <Box ref={mobileNavRef} component="aside" sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: leftSidebarWidth,
        borderRight: '1px solid',
        borderColor: tc.borderSecondary,
        zIndex: 1500,
        transition: 'width 0.3s ease, transform 0.3s ease',
        bgcolor: 'background.paper',
        '@media (max-width: 926px)': {
          width: 280,
          transform: 'translateX(-100%)',
          '&[data-open]': {
            transform: 'translateX(0)',
          },
        },
      }}>
        <Sidebar
          data-annotation-id="app-navigatie"
          selectedBuilding={selectedBuilding}
          selectedMetric={'overall'}
          onBuildingSelect={setSelectedBuilding}
          onMetricSelect={handleSidebarMetricSelect}
          selectedTenant={selectedTenant}
          onTenantChange={setSelectedTenant}
          favorites={favorites}
          onFavoritesChange={setFavorites}
          selection={selection}
          onSelectionChange={handleSidebarSelectionChange}
          isCollapsed={leftSidebarCollapsed}
          onToggleCollapse={handleLeftSidebarToggle}
          onDashboardNavigate={handleDashboardNavigate}
          onAssetExplorerToggle={handleAssetExplorerToggle}
          isAssetExplorerOpen={isAssetExplorerOpen}
          notificationsPanelOpen={notificationsPanelOpen}
          onNotificationsPanelToggle={handleNotificationsPanelToggle}
          hasUnreadNotifications={hasUnreadNotifications}
          dataExplorerOpen={dataExplorerOpen}
          onDataExplorerToggle={handleDataExplorerToggle}
        />
      </Box>

      {/* Notifications Panel -- outside sidebar stacking context */}
      <NotificationsPanel
        ref={notificationsRef}
        open={notificationsPanelOpen}
        onClose={() => setNotificationsPanelOpen(false)}
        sidebarWidth={leftSidebarWidth}
      />

      {/* Data Explorer Panel */}
      <DataExplorerPanel
        open={dataExplorerOpen}
        onClose={() => { setDataExplorerOpen(false); setLocalQuickviewAsset(null); setURLParams({ asset: '', assetTab: '0' }); }}
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
        onWidthChange={setDataExplorerWidth}
      />

      {/* Scrim/Backdrop when Asset Explorer is open */}
      {isAssetExplorerOpen && (
        <Box
          onClick={() => {
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
          top: 0,
          left: `${leftSidebarWidth + Math.max(dataExplorerOpen ? dataExplorerWidth : 0, isAssetExplorerOpen ? 280 : 0)}px`,
          width: `calc(100% - ${leftSidebarWidth + Math.max(dataExplorerOpen ? dataExplorerWidth : 0, isAssetExplorerOpen ? 280 : 0)}px)`,
          height: '100vh',
          zIndex: 1425,
          clipPath: isAssetQuickviewOpen && quickviewAsset ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
          transition: 'clip-path 0.3s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          bgcolor: tc.bgPrimary,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pointerEvents: isAssetQuickviewOpen && quickviewAsset ? 'auto' : 'none',
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
            bgcolor: 'rgba(227, 242, 253, 0.3)',
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
            bgcolor: tc.bgPrimary,
            border: `2px dashed ${tc.brand}`,
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
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: tc.brand, fontWeight: 500 }}>
            Click to inspect &rarr;
          </Typography>
        </Paper>
      )}

      {/* Main Content Area */}
      <Box component="main" sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        ml: viewingAssetDetail ? `${leftSidebarWidth + Math.max(dataExplorerOpen ? dataExplorerWidth : 0, isAssetExplorerOpen ? 280 : 0)}px` : `${leftSidebarWidth}px`,
        '@media (max-width: 926px)': { ml: 0 },
        transition: 'margin-left 0.3s ease, border-color 0.3s ease',
        position: 'relative',
        zIndex: 1,
        outline: isInspectMode ? `3px dashed ${tc.brand}` : 'none',
        minWidth: 0,
        overflow: 'hidden'
      }}>
        {!hideTopBar && <TopBar
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
          onSelectionChange={(s) => setSelection(s)}
          isAssetExplorerOpen={isAssetExplorerOpen}
          viewingAssetDetail={viewingAssetDetail}
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          selectedDateRange={dateRange}
          isCollapsed={leftSidebarCollapsed}
          onToggleCollapse={handleLeftSidebarToggle}
          onExport={handleExport}
          activeDashboardId={activeDashboardId}
          activeDashboardLabel={activeDashboardLabel}
          filterPeriodLabel={pathname === '/control-room' ? getPeriodDisplayLabel(dateRange) : undefined}
          filterBuildingLabel={
            (pathname === '/control-room' && !selectedBuilding) || pathname === '/dashboards'
              ? getTitleBuildingLabel() : undefined
          }
          onFilterDateClick={pathname === '/control-room' ? () => setTitleDatePickerOpen(true) : undefined}
          onFilterBuildingClick={
            ((pathname === '/control-room' && !selectedBuilding) || pathname === '/dashboards')
              ? (e) => setTitleBuildingAnchor(e.currentTarget) : undefined
          }
          contractFilter={contractFilter}
          onContractFilterChange={(v) => setContract(!!v)}
          selectionScore={selectionScore}
          metricItems={metricItems}
        />}

        {/* Shared filter menus (used by inline title & header compact filter) */}
        <DateRangeSelector
          inline
          hideSlider
          value={dateRange}
          onChange={(v) => { setDateRange(v); }}
          dialogOpen={titleDatePickerOpen}
          onDialogOpenChange={setTitleDatePickerOpen}
        />

        <BuildingSelectorPopover
          anchorEl={titleBuildingAnchor}
          onClose={() => setTitleBuildingAnchor(null)}
          selectedNames={titleBuildingNames}
          onSelectionChange={setTitleBuildingNames}
          mode={titleBuildingMode}
          onModeChange={handleBuildingFilterModeChange}
        />

        {children}
      </Box>

      {/* Building SidePeek Panel */}
      <SidePeekPanel
        open={!!sidePeekBuilding}
        onClose={() => setSidePeekBuilding(null)}
      >
        {sidePeekBuilding && (
          <Box sx={{ px: 3 }}>
            <BuildingTemplate
              building={sidePeekBuilding}
              tab={sidePeekBuildingTab}
              onTabChange={setSidePeekBuildingTab}
              onBackToPortfolio={() => setSidePeekBuilding(null)}
              onBuildingChange={(name) => {
                const b = allBuildings.find(b => b.name === name);
                if (b) setSidePeekBuilding(b);
              }}
              onPanelClose={() => setSidePeekBuilding(null)}
              onPanelFullscreen={() => {
                router.push(`/buildings/${sidePeekBuilding.id}?tab=${sidePeekBuildingTab}`);
              }}
            />
            {sidePeekBuildingTab === 'zones' && (
              <ZonesList
                zones={allZones.filter(z => z.buildingName === sidePeekBuilding.name)}
                hideBuildingColumn
                showFilters
                onZoneClick={(id, e) => handleSidePeekClick(e,
                  () => { const z = allZones.find(z => z.id === id); if (z) { setSidePeekZone(z); setSidePeekZoneTab('overview'); setSidePeekBuilding(null); } },
                  () => { router.push('/zones/' + id, { scroll: false }); },
                )}
              />
            )}
            {sidePeekBuildingTab === 'assets' && (
              <AssetsList assets={ALL_ASSETS.filter(a => a.building === sidePeekBuilding.name)} hideBuildingColumn showFilters onAssetClick={(id) => {
                const a = getAssetById(id);
                if (a) { setSidePeekBuilding(null); setSidePeekAsset(a); setSidePeekAssetTab('overview'); }
              }} />
            )}
            {sidePeekBuildingTab === 'documents' && (
              <DocumentsList
                documents={documentFiles.filter(d => d.building === sidePeekBuilding.name)}
                hideBuildingColumn
                showFilters
              />
            )}
          </Box>
        )}
      </SidePeekPanel>

      {/* Zone SidePeek Panel */}
      <SidePeekPanel
        open={!!sidePeekZone}
        onClose={() => setSidePeekZone(null)}
      >
        {sidePeekZone && (
          <Box sx={{ px: 3 }}>
            <ZoneTemplate
              zone={sidePeekZone}
              tab={sidePeekZoneTab}
              onTabChange={setSidePeekZoneTab}
              onBackToPortfolio={() => setSidePeekZone(null)}
              onBackToBuilding={() => {
                const building = allBuildings.find(b => b.name === sidePeekZone.buildingName);
                if (building) { setSidePeekBuilding(building); setSidePeekBuildingTab('zones'); }
                setSidePeekZone(null);
              }}
              onZoneChange={(id) => {
                const z = allZones.find(z => z.id === id);
                if (z) setSidePeekZone(z);
              }}
              onPanelClose={() => setSidePeekZone(null)}
              onPanelFullscreen={() => {
                router.push(`/zones/${sidePeekZone.id}?tab=${sidePeekZoneTab}`);
              }}
            />
          </Box>
        )}
      </SidePeekPanel>

      {/* Asset SidePeek Panel */}
      <SidePeekPanel
        open={!!sidePeekAsset}
        onClose={() => setSidePeekAsset(null)}
      >
        {sidePeekAsset && (() => {
          const peekPath = getPathToAsset(sidePeekAsset.id) ?? [];
          const peekBuilding = peekPath.find(s => s.node.type === 'building')?.node ?? null;
          const peekZoneNode = peekPath.find(s => s.node.type === 'zone')?.node ?? null;
          const peekZone = peekBuilding && peekZoneNode
            ? (allZones.find(z => z.buildingName === peekBuilding.name && z.name === peekZoneNode.name) ?? null)
            : null;
          return (
            <Box sx={{ px: 3 }}>
              <AssetTemplate
                asset={sidePeekAsset}
                tab={sidePeekAssetTab}
                onTabChange={setSidePeekAssetTab}
                onBackToPortfolio={() => setSidePeekAsset(null)}
                onBackToCluster={() => setSidePeekAsset(null)}
                onBackToBuilding={() => {
                  setSidePeekAsset(null);
                  const b = peekBuilding ? allBuildings.find(b => b.name === peekBuilding.name) : null;
                  if (b) { setSidePeekBuilding(b); setSidePeekBuildingTab('overview'); }
                }}
                onBackToZone={() => {
                  setSidePeekAsset(null);
                  if (peekZone) { setSidePeekZone(peekZone); setSidePeekZoneTab('overview'); }
                }}
                onAssetChange={(id) => {
                  const a = getAssetById(id);
                  if (a) setSidePeekAsset(a);
                }}
                onPanelClose={() => setSidePeekAsset(null)}
                onPanelFullscreen={() => {
                  router.push(`/assets/${sidePeekAsset.id}?tab=${sidePeekAssetTab}`);
                }}
              />
              {sidePeekAssetTab === 'documents' && (
                <DocumentsList
                  documents={documentFiles.filter(d => d.building === (peekBuilding?.name ?? ''))}
                  hideBuildingColumn
                  showFilters
                />
              )}
            </Box>
          );
        })()}
      </SidePeekPanel>

      {/* Ticket SidePeek Panel */}
      <SidePeekPanel
        open={!!sidePeekTicket}
        onClose={() => setSidePeekTicket(null)}
      >
        {sidePeekTicket && (
          <Box sx={{ px: 3 }}>
            <TicketTemplate
              ticket={sidePeekTicket}
              onBackToTickets={() => setSidePeekTicket(null)}
              onPanelClose={() => setSidePeekTicket(null)}
              onPanelFullscreen={() => {
                router.push('/operations/tickets/' + sidePeekTicket.id);
              }}
            />
          </Box>
        )}
      </SidePeekPanel>

      {/* Quotation SidePeek Panel */}
      <SidePeekPanel
        open={!!sidePeekQuotation}
        onClose={() => setSidePeekQuotation(null)}
      >
        {sidePeekQuotation && (
          <Box sx={{ px: 3 }}>
            <QuotationTemplate
              quotation={sidePeekQuotation}
              onBackToQuotations={() => setSidePeekQuotation(null)}
              onPanelClose={() => setSidePeekQuotation(null)}
              onPanelFullscreen={() => {
                router.push('/operations/quotations/' + sidePeekQuotation.id);
              }}
            />
          </Box>
        )}
      </SidePeekPanel>

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
