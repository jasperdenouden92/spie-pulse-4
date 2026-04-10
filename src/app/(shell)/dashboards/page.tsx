'use client';

import DashboardsPage from '@/components/DashboardsPage';
import { useAppState } from '@/context/AppStateContext';
import { useURLState } from '@/hooks/useURLState';

export default function DashboardsRoute() {
  const { pendingDashboardId, setPendingDashboardId, setActiveDashboardId, setActiveDashboardLabel } = useAppState();
  const { dateRange, setDateRange } = useURLState();

  return (
    <DashboardsPage
      initialDashboardId={pendingDashboardId}
      onInitialDashboardConsumed={() => setPendingDashboardId(null)}
      onDashboardChange={(id, label) => { setActiveDashboardId(id); setActiveDashboardLabel(label); }}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      selectedBuildingNames={[]}
    />
  );
}
