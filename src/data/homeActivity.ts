import { tickets } from './tickets';
import { quotations } from './quotations';
import { maintenanceSchedules } from './maintenance';
import { documentFiles } from './documents';
import { assetMutations } from './assetMutations';
import { MOCK_NOW } from '@/utils/timeAgo';

export type ActivityTargetKind = 'ticket' | 'quotation' | 'maintenance' | 'document' | 'asset' | 'building';

export interface ActivityEvent {
  id: string;
  /** Who performed the action. */
  actor: string;
  /** Short human-readable sentence, e.g. "approved quotation 'Boiler service'". */
  description: string;
  /** ISO timestamp. */
  timestamp: string;
  /** The related entity that should open in a side peek on click. */
  target: {
    kind: ActivityTargetKind;
    id: string;
    label: string;
  };
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysSince(isoDate: string): number {
  return (MOCK_NOW.getTime() - new Date(isoDate).getTime()) / MS_PER_DAY;
}

/**
 * Synthesize a unified activity feed for the homepage timeline. Pulls from
 * tickets, quotations, maintenance, document modifications, and asset
 * mutations, then sorts descending and slices.
 */
export function getLatestActivity(limit: number = 10): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  // Tickets completed recently
  for (const t of tickets) {
    if (t.completedDate && daysSince(t.completedDate) <= 14) {
      events.push({
        id: `tc-${t.id}`,
        actor: t.assignedTo,
        description: `completed workorder "${t.title}"`,
        timestamp: t.completedDate,
        target: { kind: 'ticket', id: t.id, label: t.title },
      });
    }
  }

  // Tickets created recently (top signal for new work)
  for (const t of tickets) {
    if (daysSince(t.createdDate) <= 7 && t.status !== 'Completed') {
      events.push({
        id: `tn-${t.id}`,
        actor: t.assignedTo,
        description: `opened ticket "${t.title}"`,
        timestamp: t.createdDate,
        target: { kind: 'ticket', id: t.id, label: t.title },
      });
    }
  }

  // Quotation status — approvals & rejections
  for (const q of quotations) {
    const days = daysSince(q.createdDate);
    if (days > 30) continue;
    if (q.status === 'Assigned' || q.status === 'Received') {
      events.push({
        id: `qa-${q.id}`,
        actor: q.contactPerson,
        description: `approved quotation "${q.title}"`,
        timestamp: q.createdDate,
        target: { kind: 'quotation', id: q.id, label: q.title },
      });
    } else if (q.status === 'Rejected') {
      events.push({
        id: `qr-${q.id}`,
        actor: q.contactPerson,
        description: `rejected quotation "${q.title}"`,
        timestamp: q.createdDate,
        target: { kind: 'quotation', id: q.id, label: q.title },
      });
    }
  }

  // Maintenance completions
  for (const m of maintenanceSchedules) {
    if (m.lastCompleted && daysSince(m.lastCompleted) <= 14) {
      events.push({
        id: `mc-${m.id}`,
        actor: m.assignedTo,
        description: `completed maintenance "${m.title}"`,
        timestamp: m.lastCompleted,
        target: { kind: 'maintenance', id: m.id, label: m.title },
      });
    }
  }

  // Document modifications (top 6 most recent)
  const recentDocs = [...documentFiles]
    .sort((a, b) => b.modifiedDate.localeCompare(a.modifiedDate))
    .slice(0, 6);
  for (const d of recentDocs) {
    events.push({
      id: `dm-${d.id}`,
      actor: d.author,
      description: `updated document "${d.title}"`,
      timestamp: d.modifiedDate,
      target: { kind: 'document', id: d.id, label: d.title },
    });
  }

  // Asset mutations
  for (const m of assetMutations) {
    const verb =
      m.kind === 'created' ? 'added asset' :
      m.kind === 'deleted' ? 'deleted asset' :
      m.kind === 'moved' ? 'moved asset' :
      'renamed asset';
    events.push({
      id: `am-${m.id}`,
      actor: m.actor,
      description: `${verb} "${m.assetName}"`,
      timestamp: m.timestamp,
      target: { kind: 'asset', id: m.id, label: m.assetName },
    });
  }

  events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return events.slice(0, limit);
}

// ── Work in progress aggregators ─────────────────────────────────

/** Tickets in an "awaiting approval" status. */
export function getTicketsToApprove(limit: number = 3) {
  return tickets
    .filter(t => t.status === 'To approve' || t.status === 'Priced out')
    .slice(0, limit);
}

/** Quotations awaiting review. */
export function getQuotationsToApprove(limit: number = 3) {
  return quotations
    .filter(q => q.status === 'Pending' || q.status === 'Open')
    .slice(0, limit);
}

/**
 * Tickets exceeding SLA. We split into two synthetic buckets since there is no
 * explicit response/recovery time field on the mock data:
 *   - responseExceeded: Received status AND more than 2 days since creation
 *   - recoveryExceeded: In-progress/Received, dueDate in the past
 */
export function getSlaExceededTickets(limit: number = 3) {
  const responseExceeded = tickets.filter(t =>
    t.status === 'Received' && daysSince(t.createdDate) > 2
  );
  const recoveryExceeded = tickets.filter(t =>
    (t.status === 'In progress' || t.status === 'Received') &&
    new Date(t.dueDate).getTime() < MOCK_NOW.getTime()
  );
  return {
    responseExceeded: responseExceeded.slice(0, limit),
    recoveryExceeded: recoveryExceeded.slice(0, limit),
  };
}
