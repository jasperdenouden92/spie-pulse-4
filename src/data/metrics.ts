export interface MetricData {
  title: string;
  score: number;
  trend: number;
  sparklineData: number[];
}

export const overallMetrics = {
  score: 79,
  trend: 8
};

// Theme KPIs (first 3 are primary, next 6 are expanded)
export const themeMetrics: MetricData[] = [
  {
    title: 'Sustainability',
    score: 85,
    trend: 12,
    sparklineData: [65, 63, 68, 72, 70, 75, 78, 82, 84, 85]
  },
  {
    title: 'Comfort',
    score: 92,
    trend: 5,
    sparklineData: [88, 90, 95, 93, 96, 94, 92, 91, 93, 92]
  },
  {
    title: 'Asset Monitoring',
    score: 78,
    trend: -3,
    sparklineData: [85, 83, 82, 84, 81, 80, 82, 79, 80, 78]
  },
  {
    title: 'Compliance',
    score: 88,
    trend: 6,
    sparklineData: [75, 78, 82, 80, 85, 83, 87, 85, 88, 88]
  },
];

// Additional theme KPIs
export const expandedThemeMetrics: MetricData[] = [];

// Operations KPIs
export const operationsMetrics: MetricData[] = [
  {
    title: 'Tickets',
    score: 88,
    trend: 15,
    sparklineData: [78, 80, 83, 81, 85, 84, 87, 86, 88, 88]
  },
  {
    title: 'Quotations',
    score: 73,
    trend: -6,
    sparklineData: [80, 78, 79, 76, 77, 75, 76, 74, 74, 73]
  },
  {
    title: 'Maintenance',
    score: 91,
    trend: 22,
    sparklineData: [70, 74, 78, 76, 82, 85, 83, 88, 90, 91]
  }
];

// Combined for backwards compatibility
export const kpiMetrics: MetricData[] = [
  ...themeMetrics,
  ...operationsMetrics
];

// Period label mapping for tooltip display.
// Returns a label describing the period the current range is compared against
// (e.g. "This Quarter" → "last quarter", "Last Quarter" → "the previous quarter").
export function getPeriodLabel(dateRange: string): string | null {
  // Named preset values (legacy / default values in URL)
  const named: Record<string, string> = {
    'Today': 'yesterday',
    'Yesterday': 'the previous day',
    'This Week': 'last week',
    'Last Week': 'the previous week',
    'This Month': 'last month',
    'Last Month': 'the previous month',
    'This Quarter': 'last quarter',
    'Last Quarter': 'the previous quarter',
    'This Year': 'last year',
    'Last Year': 'the previous year',
  };
  if (dateRange in named) return named[dateRange];
  if (dateRange === 'All Time') return null;

  // Date-range strings: YYYY-MM-DD|YYYY-MM-DD (from DateRangeSelector)
  if (dateRange.includes('|')) {
    const [a, b] = dateRange.split('|');
    const from = new Date(a); from.setHours(0, 0, 0, 0);
    const to = new Date(b); to.setHours(0, 0, 0, 0);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return 'the previous period';

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const lastDayOfToMonth = new Date(to.getFullYear(), to.getMonth() + 1, 0).getDate();
    const diffDays = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
    const endsToday = to.getTime() === today.getTime();

    // Full completed periods (e.g. "Last quarter", "Last year")
    if (from.getMonth() === 0 && from.getDate() === 1 && to.getMonth() === 11 && to.getDate() === 31) return 'the previous year';
    if (from.getDate() === 1 && from.getMonth() % 3 === 0 && (to.getMonth() + 1) % 3 === 0 && to.getDate() === lastDayOfToMonth) return 'the previous quarter';
    if (from.getDate() === 1 && from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear() && to.getDate() === lastDayOfToMonth) return 'the previous month';
    if (diffDays === 7 && from.getDay() === 1) return 'the previous week';
    if (diffDays === 1) return endsToday ? 'yesterday' : 'the previous day';

    // Partial "This X" periods (start of period → today)
    if (endsToday) {
      if (from.getMonth() === 0 && from.getDate() === 1) return 'last year';
      if (from.getDate() === 1 && from.getMonth() % 3 === 0) return 'last quarter';
      if (from.getDate() === 1) return 'last month';
    }

    return 'the previous period';
  }

  return null;
}

// Seeded random to produce stable per-period variations
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash);
}

// Generate a simulated metric variation for a given date range
function varyMetric(metric: MetricData, dateRange: string): MetricData {
  const rand = seededRandom(hashString(metric.title + dateRange));

  // Generate a trend between -15 and +25
  const trend = Math.round((rand() * 40 - 15));
  // Derive score from base score + small shift per period
  const scoreShift = Math.round((rand() * 10 - 5));
  const score = Math.max(10, Math.min(99, metric.score + scoreShift));

  // Generate sparkline: start from (score - |trend| adjusted) and trend toward score
  const startScore = Math.max(10, Math.min(99, score - trend));
  const sparklineData = Array.from({ length: 10 }, (_, i) => {
    const progress = i / 9;
    const base = startScore + (score - startScore) * progress;
    const noise = (rand() - 0.5) * 6;
    return Math.round(Math.max(5, Math.min(99, base + noise)));
  });
  // Ensure last point matches score
  sparklineData[9] = score;

  return { title: metric.title, score, trend, sparklineData };
}

function varyOverall(dateRange: string): { score: number; trend: number } {
  const rand = seededRandom(hashString('overall' + dateRange));
  const trend = Math.round((rand() * 30 - 10));
  const scoreShift = Math.round((rand() * 8 - 4));
  const score = Math.max(10, Math.min(99, overallMetrics.score + scoreShift));
  return { score, trend };
}

export interface PeriodMetrics {
  overall: { score: number; trend: number };
  themes: MetricData[];
  expandedThemes: MetricData[];
  operations: MetricData[];
  periodLabel: string | null;
}

/** Keys hidden from the nested KPI cards when contract mode is active */
export const CONTRACT_HIDDEN_THEME_KEYS = ['asset_monitoring'];
export const CONTRACT_HIDDEN_OPERATIONS_KEYS = ['quotations'];

/** Apply a deterministic contract-mode variation to metrics */
export function applyContractVariation(metrics: PeriodMetrics): PeriodMetrics {
  const vary = (m: MetricData): MetricData => varyMetric(m, 'contract');
  return {
    overall: {
      score: Math.max(10, Math.min(99, metrics.overall.score - 4)),
      trend: metrics.overall.trend + 3,
    },
    themes: metrics.themes.map(vary),
    expandedThemes: metrics.expandedThemes.map(vary),
    operations: metrics.operations.map(vary),
    periodLabel: metrics.periodLabel,
  };
}

export function getMetricsForPeriod(dateRange: string, buildingNames: string[] = []): PeriodMetrics {
  // Include building selection in the seed so metrics vary when buildings change
  const buildingSuffix = buildingNames.length > 0 ? '|' + [...buildingNames].sort().join(',') : '';
  const seed = dateRange + buildingSuffix;

  if (dateRange === 'This Quarter' && buildingNames.length === 0) {
    // Default period with no building filter — return original data as-is
    return {
      overall: overallMetrics,
      themes: themeMetrics,
      expandedThemes: expandedThemeMetrics,
      operations: operationsMetrics,
      periodLabel: getPeriodLabel(dateRange),
    };
  }

  return {
    overall: varyOverall(seed),
    themes: themeMetrics.map(m => varyMetric(m, seed)),
    expandedThemes: expandedThemeMetrics.map(m => varyMetric(m, seed)),
    operations: operationsMetrics.map(m => varyMetric(m, seed)),
    periodLabel: getPeriodLabel(dateRange),
  };
}
