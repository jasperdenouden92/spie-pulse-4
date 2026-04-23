'use client';

import { use, useEffect, useMemo } from 'react';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/navigation';
import BuildingTemplate from '@/templates/building';
import type { BuildingDetailTab } from '@/templates/building';
import ZonesList from '@/components/ZonesList';
import AssetsList, { type EnrichedAsset } from '@/components/AssetsList';
import LinkedDocumentsList from '@/components/LinkedDocumentsList';
import BuildingPerformanceTab from '@/components/BuildingPerformanceTab';
import { useURLState } from '@/hooks/useURLState';
import { useAppState } from '@/context/AppStateContext';
import { slugToBuilding, buildingToSlug } from '@/utils/slugs';
import { zones as allZones } from '@/data/zones';
import { assetTree, type AssetNode, getAssetById } from '@/data/assetTree';
import { handleSidePeekClick } from '@/components/SidePeekPanel';

// ── Flatten Buildings tree with building context ──
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

const DEFAULT_TAB: BuildingDetailTab = 'overview';

export default function BuildingDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const building = slugToBuilding(slug);
  const isNarrow = useMediaQuery('(max-width:960px)');
  const router = useRouter();
  const { tab, setTab } = useURLState();
  const currentTab = (tab || DEFAULT_TAB) as BuildingDetailTab;
  const { leftSidebarCollapsed, setLeftSidebarCollapsed, setSidePeekBuilding, setSidePeekBuildingTab, setSidePeekZone, setSidePeekZoneTab, setSidePeekAsset, setSidePeekAssetTab } = useAppState();

  // Ensure default tab is always visible in the URL
  useEffect(() => {
    if (!tab) setTab(DEFAULT_TAB);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const buildingAssets = useMemo(
    () => ALL_ASSETS.filter(a => a.building === (building?.name ?? '')),
    [building]
  );

  if (!building) {
    return (
      <Container maxWidth={false} sx={{ pb: 3, flex: 1, pt: 4, px: isNarrow ? 0.5 : 3, textAlign: 'center' }}>
        Building not found.
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, pt: 0, px: isNarrow ? 0.5 : 3 }}>
      <BuildingTemplate
        building={building}
        tab={currentTab}
        onTabChange={(t) => setTab(t)}
        isCollapsed={leftSidebarCollapsed}
        onToggleCollapse={() => setLeftSidebarCollapsed(c => !c)}
        onBackToPortfolio={() => router.push('/portfolio/buildings')}
        onBuildingChange={(name) => {
          router.push(`/buildings/${buildingToSlug(name)}`);
        }}
      />
      {currentTab === 'zones' && (
        <ZonesList
          zones={allZones.filter(z => z.buildingName === building.name)}
          hideBuildingColumn
          showFilters
          onZoneClick={(id, e) => handleSidePeekClick(e,
            () => { const z = allZones.find(z => z.id === id); if (z) { setSidePeekBuilding(null); setSidePeekZone(z); setSidePeekZoneTab('overview'); } },
            () => router.push(`/zones/${id}`),
          )}
        />
      )}
      {currentTab === 'assets' && (
        <AssetsList
          assets={buildingAssets}
          hideBuildingColumn
          showFilters
          onAssetClick={(id, e) => handleSidePeekClick(e,
            () => { const a = getAssetById(id); if (a) { setSidePeekAsset(a); setSidePeekAssetTab('overview'); } },
            () => router.push(`/assets/${id}`),
          )}
        />
      )}
      {currentTab === 'documents' && (
        <LinkedDocumentsList buildingName={building.name} />
      )}
      {currentTab === 'performance' && (
        <BuildingPerformanceTab building={building} />
      )}
    </Container>
  );
}
