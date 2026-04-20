'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import TimerOffOutlinedIcon from '@mui/icons-material/TimerOffOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage, type TranslationKey } from '@/i18n';
import { useAppState } from '@/context/AppStateContext';
import { useURLState } from '@/hooks/useURLState';
import { handleSidePeekClick } from '@/components/SidePeekPanel';
import { getTicketsToApprove, getQuotationsToApprove, getSlaExceededTickets } from '@/data/homeActivity';
import { insights } from '@/data/insights';
import { assetMutations } from '@/data/assetMutations';
import { buildings, type Building } from '@/data/buildings';
import { MOCK_NOW, timeAgoParts } from '@/utils/timeAgo';
import type { Ticket } from '@/data/tickets';
import type { Quotation } from '@/data/quotations';
import type { AssetMutation } from '@/data/assetMutations';
import type { Insight } from '@/data/insights';
import type { PlaceholderPeek } from '@/context/AppStateContext';
import type { HomeVariant } from './ControlRoomEntrance';

const PLACEHOLDER_IMAGE = '/images/buildings/placeholder.png';

/**
 * Pool of real buildings for a tenant, preferring those with non-placeholder
 * images. Used to re-assign rows whose underlying mock data still references
 * legacy building names like "Skyline Plaza".
 */
function tenantBuildingPool(tenant: string): Building[] {
  const inTenant = buildings.filter(b => b.tenant === tenant);
  const withImage = inTenant.filter(b => b.image && b.image !== PLACEHOLDER_IMAGE);
  if (withImage.length > 0) return withImage;
  if (inTenant.length > 0) return inTenant;
  // Defensive fallback: any building with a real image.
  return buildings.filter(b => b.image && b.image !== PLACEHOLDER_IMAGE);
}

/** Deterministic pick from a building pool based on a stable row id. */
function pickBuilding(pool: Building[], rowId: string): Building | undefined {
  if (pool.length === 0) return undefined;
  let h = 0;
  for (let i = 0; i < rowId.length; i++) h = (h * 31 + rowId.charCodeAt(i)) | 0;
  return pool[Math.abs(h) % pool.length];
}

interface WipItem {
  id: string;
  title: string;
  meta: string;
  trailing: string;
  /**
   * Leading square avatar shown only in Variant C. Uses the building's
   * thumbnail when the row is tied to a specific building; cross-building
   * categories (quotations, SLA, analyses) fall back to a neutral icon tile.
   */
  leadingAvatar: { imageUrl?: string; icon: React.ReactNode };
  /** Underlying moment used to sort Variant C's unified list. */
  sortDate: Date;
  onClick?: (e: React.MouseEvent) => void;
}

interface WipGroup {
  key: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  items: WipItem[];
}

// ── Helpers ──────────────────────────────────────────────────────

/**
 * Parse a mock insights-style relative timestamp ("2 hours ago", "Yesterday",
 * "3 days ago", "1 week ago") into an approximate Date for cross-group sorting.
 */
function parseRelativeTimestamp(s: string, now: Date = MOCK_NOW): Date {
  const lower = s.toLowerCase();
  if (lower.includes('yesterday')) return new Date(now.getTime() - 24 * 3_600_000);
  const n = parseInt(lower, 10);
  if (lower.includes('hour')) return new Date(now.getTime() - (n || 1) * 3_600_000);
  if (lower.includes('day')) return new Date(now.getTime() - (n || 1) * 86_400_000);
  if (lower.includes('week')) return new Date(now.getTime() - (n || 1) * 7 * 86_400_000);
  if (lower.includes('month')) return new Date(now.getTime() - (n || 1) * 30 * 86_400_000);
  return now;
}

const MUTATION_TITLE_KEY: Record<'created' | 'deleted' | 'moved' | 'renamed', TranslationKey> = {
  created: 'home.mutation.created',
  deleted: 'home.mutation.deleted',
  moved: 'home.mutation.moved',
  renamed: 'home.mutation.renamed',
};

const PRIORITY_KEY: Record<'Low' | 'Medium' | 'High' | 'Critical', TranslationKey> = {
  Low: 'priority.low',
  Medium: 'priority.medium',
  High: 'priority.high',
  Critical: 'priority.critical',
};

// ── Data assembly ────────────────────────────────────────────────

function useWorkInProgressData() {
  const ticketsToApprove = useMemo(() => getTicketsToApprove(3), []);
  const quotationsToApprove = useMemo(() => getQuotationsToApprove(3), []);
  const slaExceeded = useMemo(() => getSlaExceededTickets(2), []);
  const observations = useMemo(
    () => insights.filter(i => i.insightType === 'warning' && !i.hasFollowUp).slice(0, 3),
    []
  );
  const mutationsOpen = useMemo(() => assetMutations.filter(m => m.status === 'open').slice(0, 3), []);
  const mutationsProcessed = useMemo(() => assetMutations.filter(m => m.status === 'processed').slice(0, 2), []);
  const analyses = useMemo(
    () => insights.filter(i => i.insightType === 'recommendation' || i.impact === 'high').slice(0, 3),
    []
  );
  return { ticketsToApprove, quotationsToApprove, slaExceeded, observations, mutationsOpen, mutationsProcessed, analyses };
}

/** Exposed so the home page can render the "N items for you" count in the section header. */
export function useWorkInProgressCount(): number {
  const d = useWorkInProgressData();
  return (
    d.ticketsToApprove.length +
    d.quotationsToApprove.length +
    d.slaExceeded.responseExceeded.length +
    d.slaExceeded.recoveryExceeded.length +
    d.observations.length +
    d.mutationsOpen.length +
    d.mutationsProcessed.length +
    d.analyses.length
  );
}

// ── Row ──────────────────────────────────────────────────────────

interface RowProps {
  title: string;
  meta: string;
  trailing?: string;
  /**
   * Square avatar shown on the left of every row. Uses `imageUrl` when available
   * (typically a building thumbnail); otherwise renders the category `icon` on a
   * neutral background.
   */
  leadingAvatar?: { imageUrl?: string; icon: React.ReactNode };
  /**
   * Variant C category pill: neutral pill with a colored icon + label.
   * Rendered in a fixed-width column left of the trailing date so pills
   * across rows align at the same x-position.
   */
  categoryPill?: { icon: React.ReactNode; label: string; color: string };
  onClick?: (e: React.MouseEvent) => void;
}

/** Width of the category column in Variant C; wide enough for "Processed asset mutations". */
const CATEGORY_COL_WIDTH = 220;
/**
 * Fixed width of the trailing time column so that, across rows, the category
 * pill column always starts at the same x-position regardless of whether the
 * time reads "Nu" or "2 maanden geleden".
 */
const TIME_COL_WIDTH = 140;
/** Size of the square leading avatar. */
const AVATAR_SIZE = 40;

function Row({ title, meta, trailing, leadingAvatar, categoryPill, onClick }: RowProps) {
  const { themeColors: c } = useThemeMode();
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1.25,
        px: 0.5,
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 1,
        transition: 'background-color 0.15s ease',
        '&:hover': onClick ? { bgcolor: c.bgSecondary } : undefined,
        borderBottom: `1px solid ${c.bgPrimaryHover}`,
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      {leadingAvatar && (
        <Box
          sx={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: '8px',
            flexShrink: 0,
            overflow: 'hidden',
            bgcolor: c.bgSecondary,
            border: `1px solid ${c.cardBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            '& .MuiSvgIcon-root': { fontSize: 20 },
          }}
        >
          {leadingAvatar.imageUrl ? (
            <Box
              component="img"
              src={leadingAvatar.imageUrl}
              alt=""
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            leadingAvatar.icon
          )}
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }} noWrap>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }} noWrap>
          {meta}
        </Typography>
      </Box>
      {categoryPill && (
        <Box sx={{ width: CATEGORY_COL_WIDTH, flexShrink: 0, display: 'flex', justifyContent: 'flex-start' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              pl: 0.5,
              pr: 1.25,
              py: 0.5,
              borderRadius: '999px',
              bgcolor: c.bgSecondary,
              border: `1px solid ${c.cardBorder}`,
              maxWidth: '100%',
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '999px',
                bgcolor: c.bgPrimary,
                color: categoryPill.color,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                '& .MuiSvgIcon-root': { fontSize: 14 },
              }}
            >
              {categoryPill.icon}
            </Box>
            <Typography
              variant="caption"
              sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.4, minWidth: 0 }}
              noWrap
            >
              {categoryPill.label}
            </Typography>
          </Box>
        </Box>
      )}
      {trailing && (
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: '0.75rem',
            flexShrink: 0,
            width: categoryPill ? TIME_COL_WIDTH : undefined,
            textAlign: categoryPill ? 'right' : undefined,
          }}
        >
          {trailing}
        </Typography>
      )}
    </Box>
  );
}

// ── Group header (Variant A) ─────────────────────────────────────

interface GroupHeaderProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
}

function GroupHeader({ icon, label, count, color }: GroupHeaderProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 2, pb: 1 }}>
      <Box sx={{ color, display: 'flex', alignItems: 'center' }}>{icon}</Box>
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          fontWeight: 600,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
        · {count}
      </Typography>
    </Box>
  );
}

// ── Variant B: individual card per group ─────────────────────────

function GroupCard({ group }: { group: WipGroup }) {
  const { themeColors: c } = useThemeMode();
  return (
    <Box
      sx={{
        border: `1px solid ${c.cardBorder}`,
        borderRadius: '12px',
        bgcolor: c.bgPrimary,
        boxShadow: c.cardShadow,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <Box sx={{ color: group.color, display: 'flex', alignItems: 'center' }}>{group.icon}</Box>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.primary' }}
        >
          {group.label}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
          · {group.items.length}
        </Typography>
      </Box>
      {group.items.map(it => (
        <Row
          key={it.id}
          title={it.title}
          meta={it.meta}
          trailing={it.trailing}
          onClick={it.onClick}
        />
      ))}
    </Box>
  );
}

// ── Main component ───────────────────────────────────────────────

export interface WorkInProgressSectionProps {
  variant?: HomeVariant;
}

export default function WorkInProgressSection({ variant = 'A' }: WorkInProgressSectionProps) {
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();
  const router = useRouter();
  const { setSidePeekTicket, setSidePeekQuotation, setSidePeekPlaceholder } = useAppState();
  const { selectedTenant } = useURLState();

  const {
    ticketsToApprove, quotationsToApprove, slaExceeded,
    observations, mutationsOpen, mutationsProcessed, analyses,
  } = useWorkInProgressData();

  // Re-assign each building-bound row to a real tenant building so names and
  // thumbnails reflect the selected tenant instead of legacy mock names.
  const buildingPool = useMemo(() => tenantBuildingPool(selectedTenant), [selectedTenant]);

  const openTicket = (ticket: Ticket) => (e: React.MouseEvent) => {
    handleSidePeekClick(
      e,
      () => setSidePeekTicket(ticket),
      () => router.push(`/operations/tickets/${ticket.id}`),
    );
  };
  const openQuotation = (q: Quotation) => (e: React.MouseEvent) => {
    handleSidePeekClick(
      e,
      () => setSidePeekQuotation(q),
      () => router.push(`/operations/quotations/${q.id}`),
    );
  };
  // Open a placeholder side peek for insights (observations + analyses) and
  // asset mutations — these entity kinds don't have a dedicated detail template
  // yet, so the peek renders a generic metadata card. Shift+click still
  // navigates fullscreen to the closest listing page.
  const openInsightPeek = (insight: Insight, buildingName: string) => (e: React.MouseEvent) => {
    const peek: PlaceholderPeek = {
      kind: 'insight',
      id: insight.id,
      title: insight.title,
      subtitle: insight.assetType === 'Building'
        ? (buildingName || insight.assetName)
        : buildingName
          ? `${buildingName} / ${insight.assetName}`
          : insight.assetName,
      description: insight.description,
      metadata: [
        { label: t('placeholder.type'), value: insight.insightType },
        { label: t('placeholder.impact'), value: insight.impact },
      ],
    };
    handleSidePeekClick(
      e,
      () => setSidePeekPlaceholder(peek),
      () => router.push('/insights/alerts'),
    );
  };
  const openMutationPeek = (mutation: AssetMutation, buildingName: string) => (e: React.MouseEvent) => {
    const peek: PlaceholderPeek = {
      kind: 'mutation',
      id: mutation.id,
      title: `${t(MUTATION_TITLE_KEY[mutation.kind])} · ${mutation.assetName}`,
      subtitle: buildingName || mutation.building,
      description: mutation.detail,
      timestamp: mutation.timestamp,
      metadata: [
        { label: t('placeholder.actor'), value: mutation.actor },
        { label: t('placeholder.status'), value: mutation.status },
      ],
    };
    handleSidePeekClick(
      e,
      () => setSidePeekPlaceholder(peek),
      () => router.push('/operations'),
    );
  };

  /** "Created {timeAgo}" → localized "Gemaakt 12 minuten geleden" style string. */
  const fmtRelative = (prefixKey: TranslationKey, iso: string): string => {
    const parts = timeAgoParts(iso);
    const rel = parts.count !== undefined ? t(parts.key, { count: parts.count }) : t(parts.key);
    return `${t(prefixKey)} ${rel}`;
  };
  /** For insights whose timestamp is already a relative string like "2 hours ago". */
  const fmtInsightTimestamp = (s: string): string => {
    const d = parseRelativeTimestamp(s);
    const parts = timeAgoParts(d.toISOString());
    return parts.count !== undefined ? t(parts.key, { count: parts.count }) : t(parts.key);
  };

  // Build the list of groups once so every variant can pick what it needs.
  const groups: WipGroup[] = [];

  /**
   * Resolve the real tenant building + avatar for a building-bound row. The
   * returned name replaces the legacy mock name in the subline; the image
   * becomes the row thumbnail so building-bound rows never fall back to an
   * icon tile.
   */
  const resolveRowBuilding = (rowId: string, fallbackIcon: React.ReactNode) => {
    const b = pickBuilding(buildingPool, rowId);
    return {
      buildingName: b?.name ?? '',
      leadingAvatar: { imageUrl: b?.image, icon: fallbackIcon },
    };
  };

  if (ticketsToApprove.length > 0) {
    const icon = <AssignmentTurnedInOutlinedIcon />;
    groups.push({
      key: 'workorders',
      icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 16 }} />,
      label: t('home.workordersToApprove'),
      color: '#d84315',
      items: ticketsToApprove.map(ticket => {
        const rowId = `wo-${ticket.id}`;
        const { buildingName, leadingAvatar } = resolveRowBuilding(rowId, icon);
        return {
          id: rowId,
          title: ticket.title,
          meta: `${ticket.referenceNumber} · ${buildingName} · ${t(PRIORITY_KEY[ticket.priority])}`,
          trailing: fmtRelative('home.createdPrefix', ticket.createdDate),
          leadingAvatar,
          sortDate: new Date(ticket.createdDate),
          onClick: openTicket(ticket),
        };
      }),
    });
  }

  if (quotationsToApprove.length > 0) {
    const icon = <ReceiptLongOutlinedIcon />;
    groups.push({
      key: 'quotations',
      icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} />,
      label: t('home.quotationsToApprove'),
      color: '#2e7d32',
      // Quotations can span multiple buildings — drop the building name from
      // the subline and use a neutral category icon instead of a thumbnail.
      items: quotationsToApprove.map(q => ({
        id: `q-${q.id}`,
        title: q.title,
        meta: `${q.currency} ${q.amount.toLocaleString()}`,
        trailing: fmtRelative('home.updatedPrefix', q.createdDate),
        leadingAvatar: { icon },
        sortDate: new Date(q.createdDate),
        onClick: openQuotation(q),
      })),
    });
  }

  const slaIcon = <TimerOffOutlinedIcon />;
  // SLA breaches may aggregate across buildings — keep the reference number
  // and SLA type, but omit the building name and thumbnail.
  const slaItems: WipItem[] = [
    ...slaExceeded.responseExceeded.map(ticket => ({
      id: `resp-${ticket.id}`,
      title: ticket.title,
      meta: `${ticket.referenceNumber} · ${t('home.responseTimeExceeded')}`,
      trailing: fmtRelative('home.openedPrefix', ticket.createdDate),
      leadingAvatar: { icon: slaIcon },
      sortDate: new Date(ticket.createdDate),
      onClick: openTicket(ticket),
    })),
    ...slaExceeded.recoveryExceeded.map(ticket => ({
      id: `rec-${ticket.id}`,
      title: ticket.title,
      meta: `${ticket.referenceNumber} · ${t('home.recoveryTimeExceeded')}`,
      trailing: fmtRelative('home.duePrefix', ticket.dueDate),
      leadingAvatar: { icon: slaIcon },
      sortDate: new Date(ticket.dueDate),
      onClick: openTicket(ticket),
    })),
  ];
  if (slaItems.length > 0) {
    groups.push({
      key: 'sla',
      icon: <TimerOffOutlinedIcon sx={{ fontSize: 16 }} />,
      label: t('home.exceedingSla'),
      color: '#c62828',
      items: slaItems,
    });
  }

  if (observations.length > 0) {
    const icon = <VisibilityOutlinedIcon />;
    groups.push({
      key: 'observations',
      icon: <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />,
      label: t('home.observationsNoFollowUp'),
      color: '#e65100',
      // Assets live under buildings — show "Building / Asset" in the subline.
      // When the observation is already about a whole building (assetType
      // 'Building'), skip the redundant asset suffix.
      items: observations.map(o => {
        const rowId = `obs-${o.id}`;
        const { buildingName, leadingAvatar } = resolveRowBuilding(rowId, icon);
        const isBuildingLevel = o.assetType === 'Building';
        const meta =
          isBuildingLevel
            ? (buildingName || o.assetName)
            : buildingName
              ? `${buildingName} / ${o.assetName}`
              : o.assetName;
        return {
          id: rowId,
          title: o.title,
          meta,
          trailing: fmtInsightTimestamp(o.timestamp),
          leadingAvatar,
          sortDate: parseRelativeTimestamp(o.timestamp),
          onClick: openInsightPeek(o, buildingName),
        };
      }),
    });
  }

  if (mutationsOpen.length > 0) {
    const icon = <SettingsInputAntennaIcon />;
    groups.push({
      key: 'mutations-open',
      icon: <SettingsInputAntennaIcon sx={{ fontSize: 16 }} />,
      label: t('home.openAssetMutations'),
      color: '#6a1b9a',
      items: mutationsOpen.map(m => {
        const rowId = `muo-${m.id}`;
        const { buildingName, leadingAvatar } = resolveRowBuilding(rowId, icon);
        return {
          id: rowId,
          title: t(MUTATION_TITLE_KEY[m.kind]),
          meta: `${buildingName} / ${m.assetName}`,
          trailing: fmtRelative('home.submittedPrefix', m.timestamp),
          leadingAvatar,
          sortDate: new Date(m.timestamp),
          onClick: openMutationPeek(m, buildingName),
        };
      }),
    });
  }

  if (mutationsProcessed.length > 0) {
    const icon = <SettingsInputAntennaIcon />;
    groups.push({
      key: 'mutations-processed',
      icon: <SettingsInputAntennaIcon sx={{ fontSize: 16 }} />,
      label: t('home.processedAssetMutations'),
      color: '#7b1fa2',
      items: mutationsProcessed.map(m => {
        const rowId = `mup-${m.id}`;
        const { buildingName, leadingAvatar } = resolveRowBuilding(rowId, icon);
        return {
          id: rowId,
          title: t(MUTATION_TITLE_KEY[m.kind]),
          meta: `${buildingName} / ${m.assetName}`,
          trailing: fmtRelative('home.processedPrefix', m.timestamp),
          leadingAvatar,
          sortDate: new Date(m.timestamp),
          onClick: openMutationPeek(m, buildingName),
        };
      }),
    });
  }

  if (analyses.length > 0) {
    const icon = <InsightsOutlinedIcon />;
    groups.push({
      key: 'analyses',
      icon: <InsightsOutlinedIcon sx={{ fontSize: 16 }} />,
      label: t('home.analysesReadyForYou'),
      color: '#1565c0',
      // Analyses can cover the whole portfolio — keep a neutral icon tile,
      // and if the "asset" is actually a building, surface a real tenant
      // building name instead of the legacy mock name.
      items: analyses.map(a => {
        const rowId = `an-${a.id}`;
        const resolvedBuildingName =
          a.assetType === 'Building'
            ? (pickBuilding(buildingPool, rowId)?.name ?? a.assetName)
            : '';
        const meta = a.assetType === 'Building' ? resolvedBuildingName : a.assetName;
        return {
          id: rowId,
          title: a.title,
          meta,
          trailing: fmtInsightTimestamp(a.timestamp),
          leadingAvatar: { icon },
          sortDate: parseRelativeTimestamp(a.timestamp),
          onClick: openInsightPeek(a, resolvedBuildingName),
        };
      }),
    });
  }

  const totalCount = groups.reduce((acc, g) => acc + g.items.length, 0);
  const emptyState = (
    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
      {t('home.allCaughtUp')}
    </Typography>
  );

  // ── Variant B: stacked cards per group ────────────────────────
  if (variant === 'B') {
    if (totalCount === 0) {
      return (
        <Box sx={{
          border: `1px solid ${c.cardBorder}`, borderRadius: '12px',
          bgcolor: c.bgPrimary, boxShadow: c.cardShadow, p: 2,
        }}>
          {emptyState}
        </Box>
      );
    }
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {groups.map(g => <GroupCard key={g.key} group={g} />)}
      </Box>
    );
  }

  // ── Variant C: flat list sorted by date, neutral pill with colored icon ─
  if (variant === 'C') {
    const flat: Array<WipItem & { groupLabel: string; groupColor: string; groupIcon: React.ReactNode }> = [];
    for (const g of groups) {
      for (const it of g.items) {
        flat.push({ ...it, groupLabel: g.label, groupColor: g.color, groupIcon: g.icon });
      }
    }
    flat.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

    return (
      <Box sx={{
        border: `1px solid ${c.cardBorder}`, borderRadius: '12px',
        bgcolor: c.bgPrimary, boxShadow: c.cardShadow,
        p: 2.5, display: 'flex', flexDirection: 'column',
      }}>
        {flat.length === 0 ? emptyState : flat.map(it => (
          <Row
            key={it.id}
            title={it.title}
            meta={it.meta}
            trailing={it.trailing}
            leadingAvatar={it.leadingAvatar}
            categoryPill={{ icon: it.groupIcon, label: it.groupLabel, color: it.groupColor }}
            onClick={it.onClick}
          />
        ))}
      </Box>
    );
  }

  // ── Variant A (default): single card with group headers ───────
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
      {groups.map(g => (
        <React.Fragment key={g.key}>
          <GroupHeader icon={g.icon} label={g.label} count={g.items.length} color={g.color} />
          {g.items.map(it => (
            <Row
              key={it.id}
              title={it.title}
              meta={it.meta}
              trailing={it.trailing}
              onClick={it.onClick}
            />
          ))}
        </React.Fragment>
      ))}
      {totalCount === 0 && emptyState}
    </Box>
  );
}
