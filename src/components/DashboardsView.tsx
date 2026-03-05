'use client';

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

interface DashboardsViewProps {
  selection?: string;
  selectedBuilding?: { name: string } | null;
}

interface DashboardDef {
  id: string;
  label: string;
  renderCharts: (buildingName?: string) => React.ReactNode;
}

interface ThemeGroup {
  theme: string;
  themeKey: string;
  dashboards: DashboardDef[];
}

const ChartCard = ({ children, span = 1 }: { children: React.ReactNode; span?: 1 | 2 }) => (
  <Box sx={{ gridColumn: `span ${span}` }}>
    {children}
  </Box>
);

const DASHBOARD_GROUPS: ThemeGroup[] = [
  {
    theme: 'Sustainability',
    themeKey: 'sustainability',
    dashboards: [
      {
        id: 'building_trend',
        label: 'Building trend',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><AssetTrendChart buildingName={b} /></ChartCard>
            <ChartCard span={2}><EnergyDistributionChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'energy_use',
        label: 'Energy use per building',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><EnergyUseByBuildingChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><EnergyDistributionChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'consumption_generation',
        label: 'Consumption and generation',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><ElectricityConsumptionChart buildingName={b} /></ChartCard>
            <ChartCard span={2}><GasConsumptionChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'costs_co2',
        label: 'Costs and CO2',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><CostsCO2Chart buildingName={b} /></ChartCard>
            <ChartCard span={2}><ElectricityConsumptionChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'week_day_profiles',
        label: 'Week and day profiles',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><PowerProfilesChart buildingName={b} /></ChartCard>
            <ChartCard span={2}><EnergyDistributionChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'forecast_target',
        label: 'Forecast and target',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><ForecastTargetChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'energy_temperature',
        label: 'Energy vs outside temperature',
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
    dashboards: [
      {
        id: 'comfort_overview',
        label: 'Comfort building overview',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><ComfortTemperatureTrendChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><ComfortHumidityTrendChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><ComfortAirQualityTrendChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'adaptive_temp',
        label: 'Adaptive temperature limits',
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
    ],
  },
  {
    theme: 'Asset Monitoring',
    themeKey: 'asset_monitoring',
    dashboards: [
      {
        id: 'ates',
        label: 'Aquifer Thermal Energy Storage (ATES)',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><AssetTrendChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><AssetHealthDistributionChart buildingName={b} /></ChartCard>
            <ChartCard span={1}><CriticalAssetsCard buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'bacs',
        label: 'BACS',
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
    theme: 'Compliance',
    themeKey: 'compliance',
    dashboards: [
      {
        id: 'compliance_overview',
        label: 'Compliance overview',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><PerformanceHeatmapChart buildingName={b} /></ChartCard>
            <ChartCard span={2}><MaintenanceOverviewTable buildingName={b} title="Compliance Records" /></ChartCard>
          </>
        ),
      },
    ],
  },
  {
    theme: 'Maintenance',
    themeKey: 'maintenance',
    dashboards: [
      {
        id: 'preventive_maintenance',
        label: 'Preventive maintenance',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><MaintenanceOverviewTable buildingName={b} title="Preventive Maintenance" /></ChartCard>
            <ChartCard span={2}><AssetTrendChart buildingName={b} /></ChartCard>
          </>
        ),
      },
      {
        id: 'process_orders',
        label: 'Process orders',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><MaintenanceOverviewTable buildingName={b} title="Process Orders" /></ChartCard>
          </>
        ),
      },
      {
        id: 'observations',
        label: 'Observations & follow-ups',
        renderCharts: (b) => (
          <>
            <ChartCard span={2}><MaintenanceOverviewTable buildingName={b} title="Observations & Follow-ups" /></ChartCard>
            <ChartCard span={1}><AssetHealthDistributionChart buildingName={b} /></ChartCard>
          </>
        ),
      },
    ],
  },
];

// Theme key aliases for when selection uses different casing/naming
const THEME_KEY_MAP: Record<string, string> = {
  energy: 'sustainability',
  water_management: 'sustainability',
};

export default function DashboardsView({ selection, selectedBuilding }: DashboardsViewProps) {
  const buildingName = selectedBuilding?.name;

  // Filter groups based on active theme selection
  const effectiveKey = selection ? (THEME_KEY_MAP[selection] ?? selection) : null;
  const isFiltered = !!effectiveKey && effectiveKey !== 'themes_group' && effectiveKey !== 'operations_group';
  const visibleGroups = isFiltered
    ? DASHBOARD_GROUPS.filter(g => g.themeKey === effectiveKey)
    : DASHBOARD_GROUPS;

  // Auto-select first dashboard
  const firstDashboard = visibleGroups[0]?.dashboards[0];
  const [selectedId, setSelectedId] = useState<string>(firstDashboard?.id ?? '');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    visibleGroups.map(g => g.themeKey)
  );

  // Reset selection when filter changes
  useEffect(() => {
    const first = visibleGroups[0]?.dashboards[0];
    if (first) setSelectedId(first.id);
    setExpandedGroups(visibleGroups.map(g => g.themeKey));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Find selected dashboard def
  const selectedDashboard = DASHBOARD_GROUPS.flatMap(g => g.dashboards).find(d => d.id === selectedId);
  const selectedGroup = DASHBOARD_GROUPS.find(g => g.dashboards.some(d => d.id === selectedId));

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left: Dashboard list */}
      <Box sx={{
        width: 228,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        overflowY: 'auto',
        bgcolor: '#fafafa',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { background: '#ddd', borderRadius: '4px' },
      }}>
        <List dense disablePadding sx={{ py: 1 }}>
          {visibleGroups.map((group) => {
            const isOpen = expandedGroups.includes(group.themeKey);
            return (
              <React.Fragment key={group.themeKey}>
                {/* Theme group header */}
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => toggleGroup(group.themeKey)}
                    sx={{ py: 0.75, px: 2, gap: 1 }}
                  >
                    <ExpandMoreIcon sx={{
                      fontSize: 16,
                      color: 'text.secondary',
                      transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.2s',
                      flexShrink: 0,
                    }} />
                    <ListItemText
                      primary={group.theme}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600, fontSize: '0.8125rem' }}
                    />
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
                            pl: 4.5,
                            pr: 2,
                            py: 0.625,
                            bgcolor: isActive ? '#eef2ff' : 'transparent',
                            borderRight: isActive ? '2px solid #1e5a96' : '2px solid transparent',
                            '&:hover': { bgcolor: isActive ? '#eef2ff' : '#f0f0f0' },
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
                <Divider />
              </React.Fragment>
            );
          })}
        </List>
      </Box>

      {/* Right: Dashboard content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
        {selectedDashboard ? (
          <>
            {/* Dashboard header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <GridViewOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
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
              {selectedDashboard.renderCharts(buildingName)}
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography color="text.secondary">Select a dashboard from the list</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
