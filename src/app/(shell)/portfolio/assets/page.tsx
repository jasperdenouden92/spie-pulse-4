'use client';

import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/navigation';
import PortfolioAssetsPage from '@/components/PortfolioAssetsPage';
import { useAppState } from '@/context/AppStateContext';
import { handleSidePeekClick } from '@/components/SidePeekPanel';
import { buildingToSlug } from '@/utils/slugs';
import { buildings as allBuildings } from '@/data/buildings';
import { getAssetById } from '@/data/assetTree';

export default function PortfolioAssetsRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  const router = useRouter();
  const { setSidePeekBuilding, setSidePeekBuildingTab, setSidePeekZone, setSidePeekAsset, setSidePeekAssetTab } = useAppState();

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <PortfolioAssetsPage
        onBuildingLabelClick={(name, e) => handleSidePeekClick(e,
          () => { const b = allBuildings.find(b => b.name === name); if (b) { setSidePeekZone(null); setSidePeekBuilding(b); setSidePeekBuildingTab('overview'); } },
          () => router.push(`/buildings/${buildingToSlug(name)}`),
        )}
        onAssetClick={(id, e) => handleSidePeekClick(e,
          () => { const a = getAssetById(id); if (a) { setSidePeekAsset(a); setSidePeekAssetTab('overview'); } },
          () => router.push(`/assets/${id}`),
        )}
      />
    </Container>
  );
}
