'use client';

import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/navigation';
import PortfolioZonesPage from '@/components/PortfolioZonesPage';
import { useURLState } from '@/hooks/useURLState';
import { useAppState } from '@/context/AppStateContext';
import { handleSidePeekClick } from '@/components/SidePeekPanel';
import { buildingToSlug } from '@/utils/slugs';
import { buildings as allBuildings } from '@/data/buildings';
import { zones as allZones } from '@/data/zones';

export default function PortfolioZonesRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  const router = useRouter();
  const { selectedTenant } = useURLState();
  const { setSidePeekBuilding, setSidePeekBuildingTab, setSidePeekZone, setSidePeekZoneTab } = useAppState();

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <PortfolioZonesPage
        tenant={selectedTenant}
        onZoneClick={(id, e) => handleSidePeekClick(e,
          () => { const z = allZones.find(z => z.id === id); if (z) { setSidePeekBuilding(null); setSidePeekZone(z); setSidePeekZoneTab('overview'); } },
          () => router.push(`/zones/${id}`),
        )}
        onBuildingLabelClick={(name, e) => handleSidePeekClick(e,
          () => { const b = allBuildings.find(b => b.name === name); if (b) { setSidePeekZone(null); setSidePeekBuilding(b); setSidePeekBuildingTab('overview'); } },
          () => router.push(`/buildings/${buildingToSlug(name)}`),
        )}
      />
    </Container>
  );
}
