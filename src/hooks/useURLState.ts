'use client';

import { useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { buildings as allBuildings, tenants, type Building, type MetricKeys } from '@/data/buildings';
import { zones as allZones, type Zone } from '@/data/zones';
import { getAssetById } from '@/data/assetTree';

export const URL_DEFAULTS: Record<string, string> = {
  metric: 'overall',
  building: '',
  asset: '',
  view: 'dashboard',
  sort: 'Worst to Best',
  dateRange: 'This Month',
  group: 'All Groups',
  city: 'All Cities',
  inspect: '0',
  explorer: '0',
  assetTab: '0',
  tab: '',
  contract: '',
  themes: '0',
};

/**
 * Shared hook for URL query-param state.
 *
 * - `setURLParams` uses `router.replace` (no history entry) — for filter changes
 * - `navigateTo` uses `router.push` — for real navigation to a new path
 */
export function useURLState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mutable ref so callbacks created in stale closures still see the latest params
  const latestParamsRef = useRef(searchParams);
  latestParamsRef.current = searchParams;

  /** Build a query string, omitting params that match their default value. */
  const buildParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(latestParamsRef.current.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === (URL_DEFAULTS[key] ?? '')) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    // Remove legacy params
    params.delete('page');
    params.delete('btab');
    params.delete('ztab');
    params.delete('atab');
    params.delete('panel');
    latestParamsRef.current = params as unknown as typeof searchParams;
    return params.toString();
  }, []);

  /** Replace current URL params (no history entry). Use for filters/preferences. */
  const setURLParams = useCallback((updates: Record<string, string>) => {
    const qs = buildParams(updates);
    const path = window.location.pathname;
    router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
  }, [router, buildParams]);

  /** Push navigation to a new path with optional query params. */
  const navigateTo = useCallback((path: string, params?: Record<string, string>) => {
    if (params) {
      const qs = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== (URL_DEFAULTS[key] ?? '')) {
          qs.set(key, value);
        }
      }
      const qsStr = qs.toString();
      router.push(qsStr ? `${path}?${qsStr}` : path, { scroll: false });
    } else {
      router.push(path, { scroll: false });
    }
  }, [router]);

  // ── Derived state from URL params ─────────────────────────────────
  const buildingName = searchParams.get('building') ?? '';
  const selectedBuilding: Building | null = buildingName
    ? (allBuildings.find(b => b.name === buildingName) ?? null)
    : null;

  const selection = (searchParams.get('metric') ?? 'overall') as
    | MetricKeys
    | 'themes_group'
    | 'operations_group';

  const assetId = searchParams.get('asset') ?? '';
  const viewMode = (searchParams.get('view') ?? 'dashboard') as 'dashboard' | 'list' | 'tree';
  const sortOrder = searchParams.get('sort') ?? 'Worst to Best';
  const dateRange = searchParams.get('dateRange') ?? 'This Month';
  const selectedGroup = searchParams.get('group') ?? 'All Groups';
  const selectedCity = searchParams.get('city') ?? 'All Cities';
  const selectedTenant = searchParams.get('tenant') ?? tenants[0];
  const isInspectMode = searchParams.get('inspect') === '1';
  const isAssetExplorerOpen = searchParams.get('explorer') === '1';
  const assetTab = parseInt(searchParams.get('assetTab') ?? '0', 10);
  const tab = searchParams.get('tab') ?? '';
  const contract = searchParams.get('contract') === 'yes';
  const zoneId = searchParams.get('zone') ?? '';
  const selectedZone: Zone | null = zoneId
    ? (allZones.find(z => z.id === zoneId) ?? null)
    : null;
  const urlAsset = assetId ? getAssetById(assetId) : null;
  const statusFilter = searchParams.get('statusFilter');

  // Convenience URL-param setters (replace, no history)
  const setSelection = useCallback((s: string) => setURLParams({ metric: s }), [setURLParams]);
  const setDateRange = useCallback((r: string) => setURLParams({ dateRange: r }), [setURLParams]);
  const setSelectedGroup = useCallback((g: string) => setURLParams({ group: g }), [setURLParams]);
  const setSelectedCity = useCallback((c: string) => setURLParams({ city: c }), [setURLParams]);
  const setSelectedTenant = useCallback((t: string) => setURLParams({ tenant: t }), [setURLParams]);
  const setIsInspectMode = useCallback((v: boolean) => setURLParams({ inspect: v ? '1' : '0' }), [setURLParams]);
  const setIsAssetExplorerOpen = useCallback((v: boolean) => setURLParams({ explorer: v ? '1' : '0' }), [setURLParams]);
  const setAssetTab = useCallback((n: number) => setURLParams({ assetTab: String(n) }), [setURLParams]);
  const setTab = useCallback((t: string) => setURLParams({ tab: t }), [setURLParams]);
  const setContract = useCallback((v: boolean) => setURLParams({ contract: v ? 'yes' : '' }), [setURLParams]);
  const setSortOrder = useCallback((s: string) => setURLParams({ sort: s }), [setURLParams]);
  const setViewMode = useCallback((v: string) => setURLParams({ view: v }), [setURLParams]);

  return {
    // Helpers
    setURLParams,
    navigateTo,
    buildParams,
    // Derived URL state
    buildingName,
    selectedBuilding,
    selection,
    assetId,
    viewMode,
    sortOrder,
    dateRange,
    selectedGroup,
    selectedCity,
    selectedTenant,
    isInspectMode,
    isAssetExplorerOpen,
    assetTab,
    tab,
    contract,
    zoneId,
    selectedZone,
    urlAsset,
    statusFilter,
    // Convenience setters
    setSelection,
    setDateRange,
    setSelectedGroup,
    setSelectedCity,
    setSelectedTenant,
    setIsInspectMode,
    setIsAssetExplorerOpen,
    setAssetTab,
    setTab,
    setContract,
    setSortOrder,
    setViewMode,
  };
}
