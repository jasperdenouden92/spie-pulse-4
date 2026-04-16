'use client';

import { use, useEffect, useMemo } from 'react';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/navigation';
import AssetTemplate from '@/templates/asset';
import type { AssetDetailTab } from '@/templates/asset';
import DocumentsList from '@/components/DocumentsList';
import { useURLState } from '@/hooks/useURLState';
import { useAppState } from '@/context/AppStateContext';
import { buildingToSlug } from '@/utils/slugs';
import { zones as allZones } from '@/data/zones';
import { getAssetById, getPathToAsset } from '@/data/assetTree';
import { documentFiles } from '@/data/documents';

const DEFAULT_TAB: AssetDetailTab = 'overview';

export default function AssetDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const asset = getAssetById(id) ?? null;
  const isNarrow = useMediaQuery('(max-width:960px)');
  const router = useRouter();
  const { tab, setTab } = useURLState();
  const currentTab = (tab || DEFAULT_TAB) as AssetDetailTab;
  const { leftSidebarCollapsed, setLeftSidebarCollapsed } = useAppState();

  // Ensure default tab is always visible in the URL
  useEffect(() => {
    if (!tab) setTab(DEFAULT_TAB);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!asset) {
    return (
      <Container maxWidth={false} sx={{ pb: 3, flex: 1, pt: 4, px: isNarrow ? 0.5 : 3, textAlign: 'center' }}>
        Asset not found.
      </Container>
    );
  }

  // Resolve breadcrumb path for back navigation
  const path = getPathToAsset(asset.id) ?? [];
  const buildingNode = path.find(s => s.node.type === 'building')?.node ?? null;
  const zoneNode = path.find(s => s.node.type === 'zone')?.node ?? null;
  const zoneRecord = buildingNode && zoneNode
    ? (allZones.find(z => z.buildingName === buildingNode.name && z.name === zoneNode.name) ?? null)
    : null;

  const assetDocuments = useMemo(
    () => documentFiles.filter(d => d.building === (buildingNode?.name ?? '')),
    [buildingNode]
  );

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, pt: 0, px: isNarrow ? 0.5 : 3 }}>
      <AssetTemplate
        asset={asset}
        tab={currentTab}
        onTabChange={(t) => setTab(t)}
        isCollapsed={leftSidebarCollapsed}
        onToggleCollapse={() => setLeftSidebarCollapsed(c => !c)}
        onBackToPortfolio={() => router.push('/portfolio/assets')}
        onBackToCluster={() => router.push('/portfolio/buildings')}
        onBackToBuilding={() => {
          if (buildingNode) router.push(`/buildings/${buildingToSlug(buildingNode.name)}`);
        }}
        onBackToZone={() => {
          if (zoneRecord) router.push(`/zones/${zoneRecord.id}`);
        }}
        onAssetChange={(aid) => router.push(`/assets/${aid}`)}
      />
      {currentTab === 'documents' && (
        <DocumentsList
          documents={assetDocuments}
          hideBuildingColumn
          showFilters
        />
      )}
    </Container>
  );
}
