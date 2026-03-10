'use client';
import { colors } from '@/colors';

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NatureOutlinedIcon from '@mui/icons-material/NatureOutlined';
import AirOutlinedIcon from '@mui/icons-material/AirOutlined';
import SettingsInputComponentOutlinedIcon from '@mui/icons-material/SettingsInputComponentOutlined';
import ChairOutlinedIcon from '@mui/icons-material/ChairOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
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
    icon: <AirOutlinedIcon sx={{ fontSize: 18 }} />,
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
        id: 'kpi_comfortniveaus_luchtkwaliteit',
        label: 'KPI Comfortniveaus Luchtkwaliteit',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><ComfortAirQualityTrendChart buildingName={b} /></ChartCard>
            <ChartCard span={2}><PerformanceHeatmapChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'kpi_comfortniveaus_ruimtetemperaturen',
        label: 'KPI Comfortniveaus Ruimtetemperaturen',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><ComfortTemperatureTrendChart buildingName={b} /></ChartCard>
            <ChartCard span={2}><PerformanceHeatmapChart buildingName={b} /></ChartCard>
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
}

export default function DashboardsPage({ onDashboardChange, initialDashboardId, onInitialDashboardConsumed }: DashboardsPageProps) {
  const [selectedId, setSelectedId] = useState<string>(
    initialDashboardId ?? DASHBOARD_THEMES[0].dashboards[0].id
  );
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    DASHBOARD_THEMES.map(g => g.themeKey)
  );

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

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 56px)', mt: '56px', overflow: 'hidden' }}>
      {/* Left: Theme/Dashboard navigation */}
      <Box sx={{
        width: 260,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        overflowY: 'auto',
        bgcolor: colors.bgSecondary,
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { background: '#ddd', borderRadius: '4px' },
      }}>
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
            Dashboards
          </Typography>
        </Box>
        <List dense disablePadding sx={{ pb: 2 }}>
          {DASHBOARD_THEMES.map((group) => {
            const isOpen = expandedGroups.includes(group.themeKey);
            const hasActiveChild = group.dashboards.some(d => d.id === selectedId);
            return (
              <React.Fragment key={group.themeKey}>
                {/* Theme group header */}
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => toggleGroup(group.themeKey)}
                    sx={{ py: 0.75, px: 2, gap: 1.5 }}
                  >
                    <Box sx={{ color: hasActiveChild ? '#1e5a96' : 'text.secondary', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      {group.icon}
                    </Box>
                    <ListItemText
                      primary={group.theme}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        color: hasActiveChild ? '#1e5a96' : 'text.primary',
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

                {/* Dashboard items */}
                <Collapse in={isOpen} unmountOnExit>
                  {group.dashboards.map((dash) => {
                    const isActive = dash.id === selectedId;
                    return (
                      <ListItem key={dash.id} disablePadding>
                        <ListItemButton
                          onClick={() => setSelectedId(dash.id)}
                          sx={{
                            pl: 5.5,
                            pr: 2,
                            py: 0.5,
                            bgcolor: isActive ? '#eef2ff' : 'transparent',
                            borderRight: isActive ? '2px solid #1e5a96' : '2px solid transparent',
                            '&:hover': { bgcolor: isActive ? '#eef2ff' : colors.bgSecondaryHover },
                          }}
                        >
                          <ListItemText
                            primary={dash.label}
                            primaryTypographyProps={{
                              variant: 'body2',
                              fontSize: '0.8125rem',
                              fontWeight: isActive ? 600 : 400,
                              color: isActive ? '#1e5a96' : 'text.primary',
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
      </Box>

      {/* Right: Dashboard content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Dashboard content */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          {selectedDashboard ? (
            <>
              {/* Dashboard header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                  {selectedGroup?.icon}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.3 }}>
                    {selectedDashboard.label}
                  </Typography>
                  {selectedGroup && (
                    <Typography variant="caption" color="text.secondary">
                      {selectedGroup.theme}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Charts grid */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
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
      </Box>
    </Box>
  );
}
