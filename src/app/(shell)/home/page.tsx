'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useLanguage } from '@/i18n';
import { useAppState } from '@/context/AppStateContext';
import { handleSidePeekClick } from '@/components/SidePeekPanel';
import { buildingToSlug } from '@/utils/slugs';
import type { RecentItem, RecentItemKind } from '@/context/AppStateContext';
import { resolveRecentEntity } from '@/components/home/recentHelpers';
import RecentlyVisitedCard from '@/components/home/RecentlyVisitedCard';
import WorkInProgressSection, { useWorkInProgressCount } from '@/components/home/WorkInProgressSection';
import LatestActivitySection from '@/components/home/LatestActivitySection';
import ControlRoomEntrance, { type HomeVariant, VARIANT_TITLE_KEYS } from '@/components/home/ControlRoomEntrance';
import HomeVariantToolbar from '@/components/home/HomeVariantToolbar';
import HomeSectionHeader from '@/components/home/HomeSectionHeader';
import { buildings, type Building } from '@/data/buildings';
import type { Zone } from '@/data/zones';
import type { AssetNode } from '@/data/assetTree';
import type { Ticket } from '@/data/tickets';
import type { Quotation } from '@/data/quotations';
import { useURLState } from '@/hooks/useURLState';

/**
 * Build the "Recently Visited" fallback using real tenant buildings and
 * tickets/quotations, so subtitles show valid building names for the active
 * tenant instead of legacy mock names (Skyline Plaza, Metro Heights, …).
 */
function buildFallbackRecent(tenant: string): RecentItem[] {
  const tenantBuildings = buildings.filter(b => b.tenant === tenant);
  const source = tenantBuildings.length > 0 ? tenantBuildings : buildings;
  const pick = (i: number) => source[i % source.length];
  const b0 = pick(0);
  const b1 = pick(1);
  const b2 = pick(2);
  const b3 = pick(3);
  return [
    { kind: 'building', id: b0.id, label: b0.name, subtitle: b0.city, visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { kind: 'ticket', id: 't-0001', label: 'HVAC malfunction in main office', subtitle: b1.name, visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
    { kind: 'ticket', id: 't-0002', label: 'Leaky faucet in conference room A', subtitle: b2.name, visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString() },
    { kind: 'quotation', id: 'q-0001', label: 'Painting of the lobby area', subtitle: b3.name, visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
  ];
}

const VARIANT_STORAGE_KEY = 'pulse:homeControlRoomVariant';

interface RecentSetters {
  setSidePeekBuilding: (v: Building | null) => void;
  setSidePeekZone: (v: Zone | null) => void;
  setSidePeekAsset: (v: AssetNode | null) => void;
  setSidePeekTicket: (v: Ticket | null) => void;
  setSidePeekQuotation: (v: Quotation | null) => void;
}

function openRecentEntity(
  item: RecentItem,
  e: React.MouseEvent,
  router: ReturnType<typeof useRouter>,
  setters: RecentSetters,
) {
  const entity = resolveRecentEntity(item);
  if (!entity) return;
  switch (item.kind) {
    case 'building': {
      const b = entity as Building;
      handleSidePeekClick(
        e,
        () => setters.setSidePeekBuilding(b),
        () => router.push(`/buildings/${buildingToSlug(b)}`),
      );
      return;
    }
    case 'zone': {
      const z = entity as Zone;
      handleSidePeekClick(
        e,
        () => setters.setSidePeekZone(z),
        () => router.push(`/zones/${z.id}`),
      );
      return;
    }
    case 'asset': {
      const a = entity as AssetNode;
      handleSidePeekClick(
        e,
        () => setters.setSidePeekAsset(a),
        () => router.push(`/assets/${a.id}`),
      );
      return;
    }
    case 'ticket': {
      const tk = entity as Ticket;
      handleSidePeekClick(
        e,
        () => setters.setSidePeekTicket(tk),
        () => router.push(`/operations/tickets/${tk.id}`),
      );
      return;
    }
    case 'quotation': {
      const q = entity as Quotation;
      handleSidePeekClick(
        e,
        () => setters.setSidePeekQuotation(q),
        () => router.push(`/operations/quotations/${q.id}`),
      );
      return;
    }
  }
}

export default function HomeRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  const { t } = useLanguage();
  const router = useRouter();
  const { selectedTenant } = useURLState();
  const {
    recentlyVisited,
    setSidePeekBuilding, setSidePeekZone, setSidePeekAsset, setSidePeekTicket, setSidePeekQuotation,
  } = useAppState();

  const userName = 'Marc';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? t('home.goodMorning') : currentHour < 18 ? t('home.goodAfternoon') : t('home.goodEvening');

  // Variant selection persisted locally per browser
  const [variant, setVariantState] = useState<HomeVariant>('A');
  const [variantHydrated, setVariantHydrated] = useState(false);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(VARIANT_STORAGE_KEY);
      if (stored === 'A' || stored === 'B' || stored === 'C') {
        setVariantState(stored);
      }
    } catch { /* ignore */ }
    setVariantHydrated(true);
  }, []);
  const setVariant = (v: HomeVariant) => {
    setVariantState(v);
    try { localStorage.setItem(VARIANT_STORAGE_KEY, v); } catch { /* ignore */ }
  };

  const recentToShow = useMemo<RecentItem[]>(() => {
    // Session items take the leftmost slots; mock items shift right to fill the
    // remaining slots so the row never collapses to fewer than 4 cards.
    const validKinds: RecentItemKind[] = ['building', 'zone', 'asset', 'ticket', 'quotation'];
    const session = recentlyVisited.filter(r => validKinds.includes(r.kind)).slice(0, 4);
    if (session.length >= 4) return session;
    const seen = new Set(session.map(r => `${r.kind}:${r.id}`));
    const fallback = buildFallbackRecent(selectedTenant).filter(r => !seen.has(`${r.kind}:${r.id}`));
    return [...session, ...fallback].slice(0, 4);
  }, [recentlyVisited, selectedTenant]);

  const workInProgressCount = useWorkInProgressCount();

  return (
    <Container maxWidth={false} sx={{ pb: 12, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <Box>
        {/* Greeting */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WbSunnyOutlinedIcon sx={{ fontSize: 24, color: '#f57c00' }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {greeting}, {userName}.
            </Typography>
          </Box>
        </Box>

        {/* Recently visited */}
        <Box sx={{ mb: 3 }}>
          <HomeSectionHeader
            icon={<AccessTimeIcon />}
            label={t('home.recentlyVisited')}
            action={
              <IconButton size="small" sx={{ borderRadius: '50%', aspectRatio: 1 }}>
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            }
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: isNarrow ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 1.5 }}>
            {recentToShow.map(item => (
              <RecentlyVisitedCard
                key={`${item.kind}:${item.id}`}
                item={item}
                onClick={(e) => openRecentEntity(item, e, router, {
                  setSidePeekBuilding, setSidePeekZone, setSidePeekAsset, setSidePeekTicket, setSidePeekQuotation,
                })}
              />
            ))}
          </Box>
        </Box>

        {/*
          Layout: variant B fuses the Control Room section into the same 2fr/1fr
          grid as Work in progress + Latest activity, so the chart matches the
          WIP card width and Latest activity can span both rows. Other variants
          keep the full-width entrance above a 2fr/1fr grid.
        */}
        {variantHydrated && variant === 'B' ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isNarrow ? '1fr' : 'minmax(0, 2fr) minmax(0, 1fr)',
              columnGap: 4,
              rowGap: 2,
              alignItems: 'start',
            }}
          >
            {/* Left column, row 1: Control Room */}
            <Box sx={{ gridColumn: isNarrow ? 'auto' : 1, gridRow: isNarrow ? 'auto' : 1 }}>
              <HomeSectionHeader
                icon={<DashboardOutlinedIcon />}
                label={t(VARIANT_TITLE_KEYS[variant])}
                action={
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                    onClick={() => router.push('/control-room')}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', minWidth: 0, color: 'primary.main' }}
                  >
                    {t('home.openControlRoom')}
                  </Button>
                }
              />
              <ControlRoomEntrance variant={variant} />
            </Box>
            {/* Left column, row 2: Work in progress */}
            <Box sx={{ gridColumn: isNarrow ? 'auto' : 1, gridRow: isNarrow ? 'auto' : 2 }}>
              <HomeSectionHeader
                icon={<AssignmentTurnedInOutlinedIcon />}
                label={t('home.workInProgress')}
                infoTooltip={t('home.workInProgressSubtitle')}
                sublabel={`${workInProgressCount} ${t('home.itemsForYou')}`}
              />
              <WorkInProgressSection variant={variant} />
            </Box>
            {/* Right column, spans both rows: Latest activity */}
            <Box sx={{ gridColumn: isNarrow ? 'auto' : 2, gridRow: isNarrow ? 'auto' : '1 / span 2' }}>
              <HomeSectionHeader
                icon={<TimelineOutlinedIcon />}
                label={t('home.latestActivity')}
              />
              <LatestActivitySection />
            </Box>
          </Box>
        ) : (
          <>
            {/* Control Room entrance (variant switchable) */}
            <Box sx={{ mb: 3 }}>
              <HomeSectionHeader
                icon={<DashboardOutlinedIcon />}
                label={t(VARIANT_TITLE_KEYS[variantHydrated ? variant : 'A'])}
                action={
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                    onClick={() => router.push('/control-room')}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', minWidth: 0, color: 'primary.main' }}
                  >
                    {t('home.openControlRoom')}
                  </Button>
                }
              />
              {variantHydrated && <ControlRoomEntrance variant={variant} />}
            </Box>

            {/* Work in progress + Latest activity */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: isNarrow ? '1fr' : 'minmax(0, 2fr) minmax(0, 1fr)',
                columnGap: 4,
                rowGap: 2,
                alignItems: 'start',
              }}
            >
              <Box>
                <HomeSectionHeader
                  icon={<AssignmentTurnedInOutlinedIcon />}
                  label={t('home.workInProgress')}
                  infoTooltip={t('home.workInProgressSubtitle')}
                  sublabel={`${workInProgressCount} ${t('home.itemsForYou')}`}
                />
                <WorkInProgressSection variant={variant} />
              </Box>
              <Box>
                <HomeSectionHeader
                  icon={<TimelineOutlinedIcon />}
                  label={t('home.latestActivity')}
                />
                <LatestActivitySection />
              </Box>
            </Box>
          </>
        )}
      </Box>

      {/* Floating toolbar — demo control for picking Control Room variant */}
      {variantHydrated && <HomeVariantToolbar value={variant} onChange={setVariant} />}
    </Container>
  );
}
