'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage } from '@/i18n';
import { useAppState } from '@/context/AppStateContext';
import { handleSidePeekClick } from '@/components/SidePeekPanel';
import { getOwnerAvatarColor, getFirstInitial } from '@/components/DocumentsList';
import { getLatestActivity, type ActivityEvent } from '@/data/homeActivity';
import { timeAgoParts } from '@/utils/timeAgo';
import { tickets as allTickets } from '@/data/tickets';
import { quotations as allQuotations } from '@/data/quotations';
import { buildings as allBuildings } from '@/data/buildings';
import { assetTree, getAssetById, type AssetNode } from '@/data/assetTree';
import { maintenanceSchedules } from '@/data/maintenance';
import { documentFiles } from '@/data/documents';
import type { PlaceholderPeek } from '@/context/AppStateContext';

/**
 * Flatten the asset tree into a pool of real leaf assets (type === 'asset').
 * Used to deterministically re-point asset-mutation activity events — whose
 * ids are mutation ids, not real asset ids — to an actual tenant asset so the
 * row opens an asset side peek instead of a dead listing route.
 */
function collectLeafAssets(nodes: AssetNode[], out: AssetNode[] = []): AssetNode[] {
  for (const n of nodes) {
    if (n.type === 'asset') out.push(n);
    if (n.children) collectLeafAssets(n.children, out);
  }
  return out;
}
const LEAF_ASSETS: AssetNode[] = collectLeafAssets(assetTree);

function hashPick<T>(pool: T[], key: string): T | undefined {
  if (pool.length === 0) return undefined;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return pool[Math.abs(h) % pool.length];
}

export default function LatestActivitySection() {
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();
  const router = useRouter();
  const {
    setSidePeekTicket, setSidePeekQuotation,
    setSidePeekBuilding, setSidePeekAsset,
    setSidePeekPlaceholder,
  } = useAppState();

  const events = useMemo(() => getLatestActivity(10), []);

  const openEvent = (ev: ActivityEvent) => (e: React.MouseEvent) => {
    switch (ev.target.kind) {
      case 'ticket': {
        const ticket = allTickets.find(x => x.id === ev.target.id);
        if (!ticket) return;
        handleSidePeekClick(e, () => setSidePeekTicket(ticket), () => router.push(`/operations/tickets/${ticket.id}`));
        return;
      }
      case 'quotation': {
        const q = allQuotations.find(x => x.id === ev.target.id);
        if (!q) return;
        handleSidePeekClick(e, () => setSidePeekQuotation(q), () => router.push(`/operations/quotations/${q.id}`));
        return;
      }
      case 'building': {
        const b = allBuildings.find(x => x.id === ev.target.id) ?? allBuildings.find(x => x.name === ev.target.label);
        if (!b) { router.push('/portfolio/buildings'); return; }
        handleSidePeekClick(e, () => setSidePeekBuilding(b), () => router.push(`/buildings/${b.id}`));
        return;
      }
      case 'asset': {
        // Activity ids for asset mutations are mutation ids (e.g. `am-001`),
        // not real asset ids — fall back to a deterministic pick from the
        // real asset pool so the row always opens an asset side peek.
        const a = getAssetById(ev.target.id) ?? hashPick(LEAF_ASSETS, ev.id);
        if (!a) { router.push('/portfolio/assets'); return; }
        handleSidePeekClick(e, () => setSidePeekAsset(a), () => router.push(`/assets/${a.id}`));
        return;
      }
      case 'maintenance': {
        const m = maintenanceSchedules.find(x => x.id === ev.target.id);
        const peek: PlaceholderPeek = {
          kind: 'maintenance',
          id: ev.target.id,
          title: m?.title ?? ev.target.label,
          subtitle: m?.building,
          description: m?.description,
          timestamp: ev.timestamp,
          metadata: m ? [
            { label: 'Frequency', value: m.frequency },
            { label: 'Category', value: m.category },
            { label: 'Assigned to', value: m.assignedTo },
            { label: 'Status', value: m.status },
          ] : undefined,
        };
        handleSidePeekClick(e, () => setSidePeekPlaceholder(peek), () => router.push(`/operations/maintenance/${ev.target.id}`));
        return;
      }
      case 'document': {
        const d = documentFiles.find(x => x.id === ev.target.id);
        const peek: PlaceholderPeek = {
          kind: 'document',
          id: ev.target.id,
          title: d?.title ?? ev.target.label,
          subtitle: d?.buildings?.[0],
          timestamp: ev.timestamp,
          metadata: d ? [
            { label: 'Category', value: d.category },
            { label: 'Author', value: d.author },
            { label: 'Version', value: d.version },
            { label: 'File', value: `${d.fileType} · ${d.fileSize}` },
          ] : undefined,
        };
        handleSidePeekClick(e, () => setSidePeekPlaceholder(peek), () => router.push('/operations/documents'));
        return;
      }
    }
  };

  return (
    <Box
      sx={{
        border: `1px solid ${c.cardBorder}`,
        borderRadius: '12px',
        bgcolor: c.bgPrimary,
        boxShadow: c.cardShadow,
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {events.map(ev => (
          <Box
            key={ev.id}
            onClick={openEvent(ev)}
            sx={{
              display: 'flex',
              gap: 1.25,
              py: 1.25,
              px: 0.5,
              cursor: 'pointer',
              borderRadius: 1,
              transition: 'background-color 0.15s ease',
              '&:hover': { bgcolor: c.bgSecondary },
              borderBottom: `1px solid ${c.bgPrimaryHover}`,
              '&:last-of-type': { borderBottom: 'none' },
            }}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: getOwnerAvatarColor(ev.actor),
                fontSize: '0.7rem',
                fontWeight: 700,
                flexShrink: 0,
                mt: 0.25,
              }}
            >
              {getFirstInitial(ev.actor)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontSize: '0.8125rem', lineHeight: 1.4 }}>
                <Box component="span" sx={{ fontWeight: 600 }}>{ev.actor}</Box>
                {' '}{t(`activity.${ev.action}`, { label: ev.actionLabel })}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                {(() => {
                  const parts = timeAgoParts(ev.timestamp);
                  return parts.count !== undefined ? t(parts.key, { count: parts.count }) : t(parts.key);
                })()}
              </Typography>
            </Box>
          </Box>
        ))}
        {events.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
            {t('home.noRecentActivity')}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
