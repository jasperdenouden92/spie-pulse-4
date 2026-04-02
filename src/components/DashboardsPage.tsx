'use client';
import { useThemeMode } from '@/theme-mode-context';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from '@mui/material/IconButton';
import NatureOutlinedIcon from '@mui/icons-material/NatureOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import SettingsInputComponentOutlinedIcon from '@mui/icons-material/SettingsInputComponentOutlined';
import ChairOutlinedIcon from '@mui/icons-material/ChairOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import DateRangeSelector, { parseDateRange, formatDateNL } from './DateRangeSelector';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { buildings as allBuildingsData } from '@/data/buildings';
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
} from '@/components/charts';

interface DashboardDef {
  id: string;
  label: string;
  renderCharts: (buildingName?: string) => React.ReactNode;
}

interface ThemeGroup {
  theme: string;
  themeKey: string;
  icon: React.ReactNode;
  dashboards: DashboardDef[];
}

const ChartCard = ({ children, span = 1 }: { children: React.ReactNode; span?: 1 | 2 }) => (
  <Box sx={{ gridColumn: `span ${span}` }}>
    {children}
  </Box>
);

const DASHBOARD_THEMES: ThemeGroup[] = [
  {
    theme: 'Sustainability',
    themeKey: 'sustainability',
    icon: <NatureOutlinedIcon sx={{ fontSize: 18 }} />,
    dashboards: [
      {
        id: 'gebouwtrend',
        label: 'Gebouwtrend',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><AssetTrendChart buildingName={b} /></ChartCard>
            <ChartCard span={2}><EnergyDistributionChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'energieverbruik_per_gebouw',
        label: 'Energieverbruik per gebouw',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><EnergyUseByBuildingChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><EnergyDistributionChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'totaalverbruik_opwekking',
        label: 'Totaalverbruik en -opwekking',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><ElectricityConsumptionChart buildingName={b} /></ChartCard>
            <ChartCard span={2}><GasConsumptionChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'kosten_co2',
        label: 'Kosten en CO\u2082',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><CostsCO2Chart buildingName={b} /></ChartCard>
            <ChartCard span={2}><ElectricityConsumptionChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'week_dagprofielen',
        label: 'Week- en dagprofielen',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><PowerProfilesChart buildingName={b} /></ChartCard>
            <ChartCard span={2}><EnergyDistributionChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'prognose_doelstelling',
        label: 'Prognose en doelstelling',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><ForecastTargetChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'metertrend',
        label: 'Metertrend',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><AssetTrendChart buildingName={b} /></ChartCard>
            <ChartCard span={2}><ElectricityConsumptionChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'energie_buitentemperatuur',
        label: 'Energie vs buitentemperatuur',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><EnergyTemperatureChart buildingName={b} /></ChartCard>
            <ChartCard span={2}><PowerProfilesChart buildingName={b} /></ChartCard>
          </>
        ),
      },
    ],
  },
  {
    theme: 'Comfort',
    themeKey: 'comfort',
    icon: <SpaOutlinedIcon sx={{ fontSize: 18 }} />,
    dashboards: [
      {
        id: 'comfort_gebouwoverzicht',
        label: 'Comfort gebouwoverzicht',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><ComfortTemperatureTrendChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><ComfortHumidityTrendChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><ComfortAirQualityTrendChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'comforttrend',
        label: 'Comforttrend',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><ComfortTemperatureTrendChart buildingName={b} /></ChartCard>
            <ChartCard span={2}><ComfortHumidityTrendChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'adaptieve_temperatuurgrenzen',
        label: 'Adaptieve temperatuurgrenzen',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><ComfortATGChart buildingName={b} /></ChartCard>
            <ChartCard span={2}><ComfortTemperatureTrendChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'frisse_scholen',
        label: 'Frisse Scholen',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><ComfortAirQualityTrendChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><ComfortHumidityTrendChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'instellingniveau_overzicht',
        label: 'Instellingniveau overzicht',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><PerformanceHeatmapChart buildingName={b} /></ChartCard>
            <ChartCard span={2}><ComfortTemperatureTrendChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'locatieniveau_overzicht',
        label: 'Locatieniveau overzicht',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><PerformanceHeatmapChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'workspace_pilot',
        label: 'Workspace Pilot',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><ComfortTemperatureTrendChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><ComfortHumidityTrendChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><ComfortAirQualityTrendChart buildingName={b} /></ChartCard>
          </>
        ),
      },
    ],
  },
  {
    theme: 'Asset Monitoring',
    themeKey: 'asset_monitoring',
    icon: <SettingsInputComponentOutlinedIcon sx={{ fontSize: 18 }} />,
    dashboards: [
      {
        id: 'asset_trend',
        label: 'Asset trend',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><AssetTrendChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><AssetHealthDistributionChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><CriticalAssetsCard buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'warmte_koudeopslag',
        label: 'Warmte- koudeopslag (WKO)',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><AssetPerformanceByCategoryChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><AssetHealthDistributionChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><CriticalAssetsCard buildingName={b} /></ChartCard>
          </>
        ),
      },
    ],
  },
  {
    theme: 'Workspace',
    themeKey: 'workspace',
    icon: <ChairOutlinedIcon sx={{ fontSize: 18 }} />,
    dashboards: [
      {
        id: 'overzicht_benutting',
        label: 'Overzicht benutting',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><PerformanceHeatmapChart buildingName={b} /></ChartCard>
            <ChartCard span={2}><AssetTrendChart buildingName={b} /></ChartCard>
          </>
        ),
      },
    ],
  },
  {
    theme: 'Compliance',
    themeKey: 'compliance',
    icon: <GavelOutlinedIcon sx={{ fontSize: 18 }} />,
    dashboards: [
      {
        id: 'compliance_dashboard',
        label: 'Compliance Dashboard',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><AssetTrendChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><AssetHealthDistributionChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><AssetPerformanceByCategoryChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'bacs_overview',
        label: 'BACS Overview',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><PerformanceHeatmapChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><AssetHealthDistributionChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><AssetPerformanceByCategoryChart buildingName={b} /></ChartCard>
          </>
        ),
      },
    ],
  },
  {
    theme: 'Maintenance',
    themeKey: 'maintenance',
    icon: <BuildOutlinedIcon sx={{ fontSize: 18 }} />,
    dashboards: [
      {
        id: 'preventief_onderhoud',
        label: 'Preventive maintenance',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><MaintenanceOverviewTable buildingName={b} title="Preventive maintenance" /></ChartCard>
            <ChartCard span={1}><AssetHealthDistributionChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><AssetPerformanceByCategoryChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'process_orders',
        label: 'Process orders',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><MaintenanceOverviewTable buildingName={b} title="Process orders" /></ChartCard>
            <ChartCard span={2}><AssetTrendChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'mjob',
        label: 'Multi-year maintenance budget',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><ForecastTargetChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><CostsCO2Chart buildingName={b} /></ChartCard>
            <ChartCard span={1}><AssetHealthDistributionChart buildingName={b} /></ChartCard>
          </>
        ),
      },
    ],
  },
  {
    theme: 'Other',
    themeKey: 'other',
    icon: <GridViewOutlinedIcon sx={{ fontSize: 18 }} />,
    dashboards: [
      {
        id: 'bijwerkdatum_meetdata',
        label: 'Bijwerkdatum Meetdata',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><MaintenanceOverviewTable buildingName={b} title="Bijwerkdatum Meetdata" /></ChartCard>
          </>
        ),
      },
      {
        id: 'co2_reductie',
        label: 'CO\u2082-reductie',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><CostsCO2Chart buildingName={b} /></ChartCard>
            <ChartCard span={2}><EnergyDistributionChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'kpi_co2_uitstoot',
        label: 'KPI CO\u2082-uitstoot',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><CostsCO2Chart buildingName={b} /></ChartCard>
            <ChartCard span={2}><ForecastTargetChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'kpi_gasverbruik_jaar',
        label: 'KPI Gasverbruik per jaar',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><GasConsumptionChart buildingName={b} /></ChartCard>
            <ChartCard span={2}><EnergyUseByBuildingChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'kpi_gasverbruik_maand',
        label: 'KPI Gasverbruik per maand',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><GasConsumptionChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'max_vermogen_check',
        label: 'Max Vermogen Check',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><PowerProfilesChart buildingName={b} /></ChartCard>
            <ChartCard span={2}><ElectricityConsumptionChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'stroomtangen',
        label: 'Stroomtangen',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><ElectricityConsumptionChart buildingName={b} /></ChartCard>
            <ChartCard span={2}><AssetTrendChart buildingName={b} /></ChartCard>
          </>
        ),
      },
    ],
  },
];

interface DashboardsPageProps {
  onDashboardChange?: (dashboardId: string, dashboardLabel: string) => void;
  initialDashboardId?: string | null;
  onInitialDashboardConsumed?: () => void;
  dateRange?: string;
  onDateRangeChange?: (value: string) => void;
  selectedBuildingNames?: string[];
}

export default function DashboardsPage({ onDashboardChange, initialDashboardId, onInitialDashboardConsumed, dateRange, onDateRangeChange, selectedBuildingNames = [] }: DashboardsPageProps) {
  const { themeColors: c } = useThemeMode();
  const isNarrow = useMediaQuery('(max-width:960px)');
  const [selectedId, setSelectedId] = useState<string>(
    initialDashboardId ?? DASHBOARD_THEMES[0].dashboards[0].id
  );
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    DASHBOARD_THEMES.map(g => g.themeKey)
  );
  const [mobilePickerOpen, setMobilePickerOpen] = useState(!initialDashboardId);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const shiftRangeRef = useRef<((dir: -1 | 1) => void) | null>(null);
  const handleShiftRangeRef = useCallback((fn: (dir: -1 | 1) => void) => {
    shiftRangeRef.current = fn;
  }, []);

  // Apply incoming dashboard navigation
  useEffect(() => {
    if (initialDashboardId) {
      const exists = DASHBOARD_THEMES.flatMap(g => g.dashboards).some(d => d.id === initialDashboardId);
      if (exists) {
        setSelectedId(initialDashboardId);
        // Expand the group containing this dashboard
        const group = DASHBOARD_THEMES.find(g => g.dashboards.some(d => d.id === initialDashboardId));
        if (group && !expandedGroups.includes(group.themeKey)) {
          setExpandedGroups(prev => [...prev, group.themeKey]);
        }
      }
      onInitialDashboardConsumed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDashboardId]);

  // Notify parent of dashboard selection changes
  useEffect(() => {
    const dashboard = DASHBOARD_THEMES.flatMap(g => g.dashboards).find(d => d.id === selectedId);
    onDashboardChange?.(selectedId, dashboard?.label ?? '');
  }, [selectedId, onDashboardChange]);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const selectedDashboard = DASHBOARD_THEMES.flatMap(g => g.dashboards).find(d => d.id === selectedId);
  const selectedGroup = DASHBOARD_THEMES.find(g => g.dashboards.some(d => d.id === selectedId));

  const handleMobileDashboardSelect = (dashId: string) => {
    setSelectedId(dashId);
    setMobilePickerOpen(false);
  };

  const dashboardNavList = (onSelect?: (id: string) => void) => (
    <>
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
          Dashboards
        </Typography>
      </Box>
      <List data-annotation-id="dashboardspage-lijst" dense disablePadding sx={{ pb: 2 }}>
        {DASHBOARD_THEMES.map((group) => {
          const isOpen = expandedGroups.includes(group.themeKey);
          const hasActiveChild = group.dashboards.some(d => d.id === selectedId);
          return (
            <React.Fragment key={group.themeKey}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => toggleGroup(group.themeKey)}
                  sx={{ py: 0.75, px: 2, gap: 1.5 }}
                >
                  <Box sx={{ color: hasActiveChild ? c.brand : 'text.secondary', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {group.icon}
                  </Box>
                  <ListItemText
                    primary={group.theme}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      color: hasActiveChild ? c.brand : 'text.primary',
                    }}
                  />
                  <ExpandMoreIcon sx={{
                    fontSize: 16,
                    color: 'text.secondary',
                    transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                  }} />
                </ListItemButton>
              </ListItem>
              <Collapse data-annotation-id="dashboardspage-accordion" in={isOpen} unmountOnExit>
                {group.dashboards.map((dash) => {
                  const isActive = dash.id === selectedId;
                  return (
                    <ListItem key={dash.id} disablePadding>
                      <ListItemButton
                        onClick={() => onSelect ? onSelect(dash.id) : setSelectedId(dash.id)}
                        sx={{
                          pl: 5.5,
                          pr: 2,
                          py: 0.5,
                          bgcolor: isActive ? c.bgActive : 'transparent',
                          borderRight: isActive ? `2px solid ${c.brand}` : '2px solid transparent',
                          '&:hover': { bgcolor: isActive ? c.bgActive : c.bgSecondaryHover },
                        }}
                      >
                        <ListItemText
                          primary={dash.label}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontSize: '0.8125rem',
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? c.brand : 'text.primary',
                            sx: { lineHeight: 1.4 },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </Collapse>
              <Divider sx={{ mx: 2 }} />
            </React.Fragment>
          );
        })}
      </List>
    </>
  );

  const dashboardContent = (
    <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
      {selectedDashboard ? (
        <>
          {/* Go back button - mobile only */}
          {isNarrow && (
            <Button
              variant="text"
              startIcon={<ChevronLeftIcon />}
              onClick={() => setMobilePickerOpen(true)}
              sx={{
                mb: 2,
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.875rem',
                textTransform: 'none',
                px: 1,
                '&:hover': { bgcolor: 'transparent', color: 'text.primary' },
              }}
            >
              Go back
            </Button>
          )}

          {/* Dashboard header + date dropdown */}
          <Box sx={{ mb: 1.5 }}>
            {selectedGroup && (
              <Typography variant="caption" color="text.secondary">
                {selectedGroup.theme}
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '2rem', lineHeight: 1.3 }}>
                {selectedDashboard.label}
              </Typography>
              {dateRange && onDateRangeChange && (() => {
                const { from, to } = parseDateRange(dateRange);
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => shiftRangeRef.current?.(-1)} sx={{ p: 0.25 }}>
                      <ChevronLeftIcon sx={{ fontSize: 18, color: c.brand }} />
                    </IconButton>
                    <Box
                      onClick={() => setDatePickerOpen(true)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 0.75,
                        cursor: 'pointer', px: 1.5, py: 0.5,
                        borderRadius: '8px', bgcolor: c.bgSecondary,
                        border: '1px solid', borderColor: c.borderSecondary,
                        '&:hover': { bgcolor: c.bgSecondaryHover, borderColor: c.borderPrimary },
                        transition: 'all 0.15s',
                      }}
                    >
                      <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: c.brand }} />
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: c.textPrimary, whiteSpace: 'nowrap' }}>
                        {formatDateNL(from)} - {formatDateNL(to)}
                      </Typography>
                      <ExpandMoreIcon sx={{ fontSize: 16, color: c.textSecondary, ml: -0.25 }} />
                    </Box>
                    <IconButton size="small" onClick={() => shiftRangeRef.current?.(1)} sx={{ p: 0.25 }}>
                      <ChevronRightIcon sx={{ fontSize: 18, color: c.brand }} />
                    </IconButton>
                  </Box>
                );
              })()}
            </Box>
          </Box>

          {/* Date range slider - no card */}
          {dateRange && onDateRangeChange && (
            <Box sx={{ mb: 4, px: 0.5 }}>
              <DateRangeSelector
                inline
                value={dateRange}
                onChange={onDateRangeChange}
                dialogOpen={datePickerOpen}
                onDialogOpenChange={setDatePickerOpen}
                onShiftRangeRef={handleShiftRangeRef}
              />
            </Box>
          )}

          {/* Charts grid */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: isNarrow ? '1fr' : 'repeat(2, 1fr)',
            gap: 3,
          }}>
            {selectedDashboard.renderCharts(undefined)}
          </Box>
        </>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography color="text.secondary">Selecteer een dashboard</Typography>
        </Box>
      )}
    </Box>
  );

  // Mobile layout: fullpage dialog for picker, then dashboard content
  if (isNarrow) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', mt: '56px', overflow: 'hidden' }}>
        <Dialog
          fullScreen
          open={mobilePickerOpen}
          onClose={() => setMobilePickerOpen(false)}
          sx={{
            '& .MuiDialog-paper': {
              bgcolor: c.bgSecondary,
              mt: '56px',
              height: 'calc(100vh - 56px)',
            },
          }}
        >
          <Box sx={{
            overflowY: 'auto',
            height: '100%',
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { background: '#ddd', borderRadius: '4px' },
          }}>
            {dashboardNavList(handleMobileDashboardSelect)}
          </Box>
        </Dialog>
        {dashboardContent}
      </Box>
    );
  }

  // Desktop layout: sidebar + content
  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 56px)', mt: '56px', overflow: 'hidden' }}>
      {/* Left: Theme/Dashboard navigation */}
      <Box sx={{
        width: 260,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        overflowY: 'auto',
        bgcolor: c.bgSecondary,
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { background: '#ddd', borderRadius: '4px' },
      }}>
        {dashboardNavList()}
      </Box>

      {/* Right: Dashboard content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {dashboardContent}
      </Box>
    </Box>
  );
}
