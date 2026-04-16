import type { RecentItem, RecentItemKind } from '@/context/AppStateContext';
import { buildings as allBuildings } from '@/data/buildings';
import { zones as allZones } from '@/data/zones';
import { getAssetById } from '@/data/assetTree';
import { tickets as allTickets } from '@/data/tickets';
import { quotations as allQuotations } from '@/data/quotations';

const KIND_COLORS: Record<RecentItemKind, string> = {
  building: '#1565c0',
  zone: '#00838f',
  asset: '#6a1b9a',
  ticket: '#d84315',
  quotation: '#2e7d32',
};

export function colorForRecentKind(kind: RecentItemKind): string {
  return KIND_COLORS[kind];
}

export function labelForRecentKind(kind: RecentItemKind): string {
  switch (kind) {
    case 'building': return 'Building';
    case 'zone': return 'Zone';
    case 'asset': return 'Asset';
    case 'ticket': return 'Ticket';
    case 'quotation': return 'Quotation';
  }
}

/**
 * Resolve a RecentItem back to the live entity. The entity is required to open
 * it in a side peek, since the side peek setters take full objects (not IDs).
 * Returns null when the entity can't be located (e.g. underlying mock data changed).
 */
export function resolveRecentEntity(item: RecentItem) {
  switch (item.kind) {
    case 'building':
      return allBuildings.find(b => b.id === item.id) ?? null;
    case 'zone':
      return allZones.find(z => z.id === item.id) ?? null;
    case 'asset':
      return getAssetById(item.id);
    case 'ticket':
      return allTickets.find(t => t.id === item.id) ?? null;
    case 'quotation':
      return allQuotations.find(q => q.id === item.id) ?? null;
  }
}
