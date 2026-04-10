'use client';

import { use } from 'react';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/navigation';
import ZoneTemplate from '@/templates/zone';
import type { ZoneDetailTab } from '@/templates/zone';
import { useURLState } from '@/hooks/useURLState';
import { useAppState } from '@/context/AppStateContext';
import { buildingToSlug } from '@/utils/slugs';
import { buildings as allBuildings } from '@/data/buildings';
import { zones as allZones } from '@/data/zones';

export default function ZoneDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const zone = allZones.find(z => z.id === id) ?? null;
  const isNarrow = useMediaQuery('(max-width:960px)');
  const router = useRouter();
  const { ztab, setZtab } = useURLState();
  const { leftSidebarCollapsed, setLeftSidebarCollapsed } = useAppState();

  if (!zone) {
    return (
      <Container maxWidth={false} sx={{ pb: 3, flex: 1, pt: 4, px: isNarrow ? 0.5 : 3, textAlign: 'center' }}>
        Zone not found.
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, pt: 0, px: isNarrow ? 0.5 : 3 }}>
      <ZoneTemplate
        zone={zone}
        tab={ztab as ZoneDetailTab}
        onTabChange={(t) => setZtab(t)}
        isCollapsed={leftSidebarCollapsed}
        onToggleCollapse={() => setLeftSidebarCollapsed(c => !c)}
        onBackToPortfolio={() => router.push('/portfolio/zones')}
        onBackToBuilding={() => router.push(`/buildings/${buildingToSlug(zone.buildingName)}`)}
        onZoneChange={(zid) => router.push(`/zones/${zid}`)}
      />
    </Container>
  );
}
