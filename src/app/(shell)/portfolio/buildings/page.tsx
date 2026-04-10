'use client';

import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/navigation';
import PortfolioPage from '@/components/PortfolioPage';
import { useURLState } from '@/hooks/useURLState';
import { useAppState } from '@/context/AppStateContext';
import { handleSidePeekClick } from '@/components/SidePeekPanel';
import { buildingToSlug } from '@/utils/slugs';

export default function PortfolioBuildingsRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  const router = useRouter();
  const { selectedTenant, setURLParams } = useURLState();
  const { setSidePeekBuilding, setSidePeekBuildingTab, setSidePeekZone } = useAppState();

  const portfolioViewMode = (new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('pview') ?? 'grid') as 'grid' | 'map';
  const setPortfolioViewMode = (v: 'grid' | 'map') => setURLParams({ pview: v });

  return (
    <Container maxWidth={false} sx={{
      pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3,
      ...(portfolioViewMode === 'map' ? { display: 'flex', flexDirection: 'column', pb: 0, overflow: 'hidden' } : {}),
    }}>
      <PortfolioPage
        tenant={selectedTenant}
        onBuildingClick={(b, e?) => handleSidePeekClick(e,
          () => { setSidePeekZone(null); setSidePeekBuilding(b); setSidePeekBuildingTab('overview'); },
          () => router.push(`/buildings/${b.id}`),
        )}
        viewMode={portfolioViewMode}
        onViewModeChange={setPortfolioViewMode}
      />
    </Container>
  );
}
