/**
 * Shared "now" anchor for mock data.
 *
 * The data generators in `src/data/*` use `2024-01-23` as their end date, so we
 * pin "now" one day later. All time-relative UI (time-ago labels, SLA filters,
 * activity timelines) MUST use this constant — using `new Date()` with mock
 * data frozen in 2024 will make everything look overdue or ancient.
 */
export const MOCK_NOW = new Date('2024-01-24');

/** Return a human-readable relative time, e.g. "Today", "3 days ago", "2 weeks ago". */
export function timeAgo(dateStr: string, now: Date = MOCK_NOW): string {
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'In the future';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Locale-agnostic breakdown of a relative time into an i18n key + count. The
 * caller runs it through `t(...)` so labels like "12 minutes ago" /
 * "12 minuten geleden" / "Now" / "Nu" can be translated consistently.
 */
export type TimeAgoKey =
  | 'time.now'
  | 'time.minutesAgo'
  | 'time.hoursAgo'
  | 'time.daysAgo'
  | 'time.weeksAgo'
  | 'time.monthsAgo'
  | 'time.yearsAgo';

export interface TimeAgoParts {
  key: TimeAgoKey;
  /** Omitted for `time.now`; present for all other keys. */
  count?: number;
}

export function timeAgoParts(dateStr: string, now: Date = MOCK_NOW): TimeAgoParts {
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return { key: 'time.now' };
  if (diffMin < 60) return { key: 'time.minutesAgo', count: diffMin };
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return { key: 'time.hoursAgo', count: diffH };
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return { key: 'time.daysAgo', count: diffD };
  const diffW = Math.floor(diffD / 7);
  if (diffW < 4) return { key: 'time.weeksAgo', count: diffW };
  const diffMo = Math.floor(diffD / 30);
  if (diffMo < 12) return { key: 'time.monthsAgo', count: diffMo };
  return { key: 'time.yearsAgo', count: Math.floor(diffD / 365) };
}

/** Short relative time, e.g. "5m", "3h", "2d", "3w". Useful for dense timelines. */
export function timeAgoShort(dateStr: string, now: Date = MOCK_NOW): string {
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d`;
  const diffW = Math.floor(diffD / 7);
  if (diffW < 4) return `${diffW}w`;
  const diffMo = Math.floor(diffD / 30);
  if (diffMo < 12) return `${diffMo}mo`;
  return `${Math.floor(diffD / 365)}y`;
}
