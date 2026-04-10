'use client';

import { use } from 'react';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/navigation';
import BuildingDetailPage from '@/components/BuildingDetailPage';
import PortfolioZonesPage from '@/components/PortfolioZonesPage';
import PortfolioAssetsPage from '@/components/PortfolioAssetsPage';
import { useURLState } from '@/hooks/useURLState';
import { useAppState } from '@/context/AppStateContext';
import { slugToBuilding, buildingToSlug } from '@/utils/slugs';
import { buildings as allBuildings } from '@/data/buildings';
import { zones as allZones } from '@/data/zones';
import { getAssetById } from '@/data/assetTree';
import { handleSidePeekClick } from '@/components/SidePeekPanel';
import type { BuildingDetailTab } from '@/components/BuildingDetailPage';

export default function BuildingDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const building = slugToBuilding(slug);
  const isNarrow = useMediaQuery('(max-width:960px)');
  const router = useRouter();
  const { btab, setBtab } = useURLState();
  const { leftSidebarCollapsed, setLeftSidebarCollapsed, setSidePeekBuilding, setSidePeekBuildingTab, setSidePeekZone, setSidePeekZoneTab, setSidePeekAsset, setSidePeekAssetTab } = useAppState();

  if (!building) {
    return (
      <Container maxWidth={false} sx={{ pb: 3, flex: 1, pt: 4, px: isNarrow ? 0.5 : 3, textAlign: 'center' }}>
        Building not found.
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, pt: 0, px: isNarrow ? 0.5 : 3 }}>
      <BuildingDetailPage
        building={building}
        tab={btab as BuildingDetailTab}
        onTabChange={(t) => setBtab(t)}
        isCollapsed={leftSidebarCollapsed}
        onToggleCollapse={() => setLeftSidebarCollapsed(c => !c)}
        onBackToPortfolio={() => router.push('/portfolio/buildings')}
        onBuildingChange={(name) => {
          router.push(`/buildings/${buildingToSlug(name)}`);
        }}
      />
      {btab === 'zones' && (
        <PortfolioZonesPage
          tenant={building.tenant}
          buildingName={building.name}
          onZoneClick={(id, e) => handleSidePeekClick(e,
            () => { const z = allZones.find(z => z.id === id); if (z) { setSidePeekBuilding(null); setSidePeekZone(z); setSidePeekZoneTab('overview'); } },
            () => router.push(`/zones/${id}`),
          )}
        />
      )}
      {btab === 'assets' && (
        <PortfolioAssetsPage
          buildingName={building.name}
          onAssetClick={(id, e) => handleSidePeekClick(e,
            () => { const a = getAssetById(id); if (a) { setSidePeekAsset(a); setSidePeekAssetTab('overview'); } },
            () => router.push(`/assets/${id}`),
          )}
        />
      )}
    </Container>
  );
}
