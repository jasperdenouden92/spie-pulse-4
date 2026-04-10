'use client';

import { use } from 'react';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/navigation';
import AssetTemplate from '@/templates/asset';
import type { AssetDetailTab } from '@/templates/asset';
import { useURLState } from '@/hooks/useURLState';
import { useAppState } from '@/context/AppStateContext';
import { buildingToSlug } from '@/utils/slugs';
import { buildings as allBuildings } from '@/data/buildings';
import { zones as allZones } from '@/data/zones';
import { getAssetById, getPathToAsset } from '@/data/assetTree';

export default function AssetDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const asset = getAssetById(id) ?? null;
  const isNarrow = useMediaQuery('(max-width:960px)');
  const router = useRouter();
  const { atab, setAtab } = useURLState();
  const { leftSidebarCollapsed, setLeftSidebarCollapsed } = useAppState();

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

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, pt: 0, px: isNarrow ? 0.5 : 3 }}>
      <AssetTemplate
        asset={asset}
        tab={atab as AssetDetailTab}
        onTabChange={(t) => setAtab(t)}
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
    </Container>
  );
}
