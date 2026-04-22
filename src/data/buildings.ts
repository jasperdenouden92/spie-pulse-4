import { locations } from './locations';
import { cityCoordinates } from './cityCoordinates';

export interface PerformanceMetric {
  green: number;
  yellow: number;
  red: number;
}

export type MetricKeys = 'overall' | 'sustainability' | 'comfort' | 'asset_monitoring' | 'tickets' | 'quotations' | 'maintenance' | 'energy' | 'workspace' | 'compliance' | 'water_management' | 'security_systems' | 'access_control';

export interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  group: string;
  tenant: string;
  image: string;
  hasContract: boolean;
  lat: number;
  lng: number;
  performance: PerformanceMetric;
  metrics: Record<MetricKeys, PerformanceMetric>;
  trends: Record<MetricKeys, number>;
}

export const tenants = [
  'SPIE Nederland',
  'de Bijenkorf',
  'KLM',
  'Philips Healthcare Best',
  'Provincie Noord-Holland',
  'Stichting Carmelcollege',
  'Nationaal Muziekkwartier',
];

export const tenantLogos: Record<string, string> = {
  'SPIE Nederland': '/images/logos/spie.svg',
  'de Bijenkorf': '/images/logos/bijenkorf.png',
  'KLM': '/images/logos/klm.png',
  'Philips Healthcare Best': '/images/logos/philips.png',
  'Provincie Noord-Holland': '/images/logos/provincie-noord-holland.png',
  'Stichting Carmelcollege': '/images/logos/carmelcollege.png',
  'Nationaal Muziekkwartier': '/images/logos/muziekkwartier.png',
};

// Seeded random for deterministic generation (xorshift32)
function createSeededRng(seed: number): () => number {
  let s = seed ^ 0xDEADBEEF;
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
  s = Math.imul(s ^ (s >>> 13), 0x45d9f3b);
  s = (s ^ (s >>> 16)) >>> 0;
  if (s === 0) s = 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

function genTrends(seed: number): Record<MetricKeys, number> {
  const rng = createSeededRng(seed);
  const gen = () => Math.round((rng() * 35 - 15) * 10) / 10;
  return {
    overall: gen(), sustainability: gen(), comfort: gen(), asset_monitoring: gen(),
    tickets: gen(), quotations: gen(), maintenance: gen(), energy: gen(),
    workspace: gen(), compliance: gen(), water_management: gen(),
    security_systems: gen(), access_control: gen(),
  };
}

// Generate a performance metric deterministically from a seed
function genMetric(seed: number, baseGreen: number): PerformanceMetric {
  const rng = createSeededRng(seed);
  const green = Math.max(20, Math.min(95, baseGreen + Math.floor((rng() - 0.5) * 16)));
  const remaining = 100 - green;
  const yellow = Math.floor(remaining * (0.5 + rng() * 0.3));
  const red = remaining - yellow;
  return { green, yellow, red };
}

// Generate all metrics for a building from a seed
function genAllMetrics(seed: number): { performance: PerformanceMetric; metrics: Record<MetricKeys, PerformanceMetric> } {
  const rng = createSeededRng(seed);
  const baseGreen = Math.floor(rng() * 60 + 25); // 25-85 range

  const keys: MetricKeys[] = ['overall', 'sustainability', 'comfort', 'asset_monitoring', 'tickets', 'quotations', 'maintenance', 'energy', 'workspace', 'compliance', 'water_management', 'security_systems', 'access_control'];
  const metrics = {} as Record<MetricKeys, PerformanceMetric>;
  for (let i = 0; i < keys.length; i++) {
    const variance = Math.floor(rng() * 20 - 10);
    metrics[keys[i]] = genMetric(seed * 17 + i * 31, baseGreen + variance);
  }

  // Overall is the average of theme-KPI average and operational-KPI average,
  // so it matches the two-topic breakdown shown on the building card.
  const themeKeys: MetricKeys[] = ['sustainability', 'comfort', 'asset_monitoring', 'compliance'];
  const opsKeys: MetricKeys[] = ['tickets', 'quotations', 'maintenance'];
  const themeAvg = Math.round(themeKeys.reduce((s, k) => s + metrics[k].green, 0) / themeKeys.length);
  const opsAvg = Math.round(opsKeys.reduce((s, k) => s + metrics[k].green, 0) / opsKeys.length);
  const overallGreen = Math.round((themeAvg + opsAvg) / 2);
  const overallRemaining = 100 - overallGreen;
  const overallYellow = Math.floor(overallRemaining * (0.5 + rng() * 0.3));
  const overallRed = overallRemaining - overallYellow;
  metrics.overall = { green: overallGreen, yellow: overallYellow, red: overallRed };

  return { performance: metrics.overall, metrics };
}

const placeholder = '/images/buildings/placeholder.png';

// Image pools per tenant — cycle through with placeholders mixed in
const tenantImages: Record<string, string[]> = {
  'SPIE Nederland': Array.from({ length: 16 }, (_, i) => `/images/buildings/spie-nederland/${i + 1}.jpeg`),
  'de Bijenkorf': [], // no building photos — placeholder only
  'KLM': Array.from({ length: 3 }, (_, i) => `/images/buildings/klm/${i + 1}.jpeg`),
  'Philips Healthcare Best': [
    ...Array.from({ length: 2 }, (_, i) => `/images/buildings/philips-healthcare/${i + 1}.jpeg`),
    ...Array.from({ length: 33 }, (_, i) => `/images/buildings/philips-real-estate/${i + 1}.jpeg`),
  ],
  'Provincie Noord-Holland': Array.from({ length: 7 }, (_, i) => `/images/buildings/provincie-noord-holland/${i + 1}.jpeg`),
  'Stichting Carmelcollege': Array.from({ length: 55 }, (_, i) => `/images/buildings/stichting-carmelcollege/${i + 1}.jpeg`),
  'Nationaal Muziekkwartier': [], // no building photos — placeholder only
};

// Pick an image for a building: use tenant-specific images with ~30% placeholders mixed in
function pickImage(tenant: string, indexInTenant: number, seed: number): string {
  const pool = tenantImages[tenant] ?? [];
  if (pool.length === 0) return placeholder;
  const rng = createSeededRng(seed);
  // ~30% chance of placeholder
  if (rng() < 0.3) return placeholder;
  return pool[indexInTenant % pool.length];
}

// Resolve a city for coordinate lookup — handles empty-city entries by extracting
// from the building name, or falls back to the Netherlands centre.
const NETHERLANDS_CENTER: [number, number] = [5.2913, 52.1326];

function resolveCity(name: string, city: string): string {
  if (city && cityCoordinates[city]) return city;
  // Try to extract city from building name (e.g. "SPIE Amsterdam" → "Amsterdam")
  for (const known of Object.keys(cityCoordinates)) {
    if (name.toLowerCase().includes(known.toLowerCase())) return known;
  }
  return '';
}

// Deterministic jitter so buildings in the same city don't all stack on one point
function jitterCoord(base: number, seed: number, spread = 0.004): number {
  const rng = createSeededRng(seed);
  return base + (rng() - 0.5) * 2 * spread;
}

// Pre-count buildings per resolved city so jitter spread scales with density
const cityTotals: Record<string, number> = {};
for (const loc of locations) {
  const city = resolveCity(loc.name, loc.city);
  cityTotals[city] = (cityTotals[city] ?? 0) + 1;
}

// Generate buildings from location data
// Track per-tenant index for image cycling
const tenantCounters: Record<string, number> = {};
const cityCounters: Record<string, number> = {};

const buildings: Building[] = locations.map((loc, i) => {
  const rng = createSeededRng(i * 97 + 13);
  const { performance, metrics } = genAllMetrics(i * 53 + 7);
  const tenantIdx = tenantCounters[loc.tenant] ?? 0;
  tenantCounters[loc.tenant] = tenantIdx + 1;

  const resolvedCity = resolveCity(loc.name, loc.city);
  const [baseLng, baseLat] = cityCoordinates[resolvedCity] ?? NETHERLANDS_CENTER;
  const cityIdx = cityCounters[resolvedCity] ?? 0;
  cityCounters[resolvedCity] = cityIdx + 1;
  // Spread increases slightly with more buildings in the same city
  const spread = 0.002 + Math.min(cityTotals[resolvedCity] ?? 1, 20) * 0.0003;
  const lat = jitterCoord(baseLat, i * 211 + 7, spread);
  const lng = jitterCoord(baseLng, i * 311 + 13, spread);

  return {
    id: `b-${String(i + 1).padStart(3, '0')}`,
    name: loc.name,
    address: loc.address,
    city: loc.city,
    group: loc.group,
    tenant: loc.tenant,
    image: pickImage(loc.tenant, tenantIdx, i * 41 + 3),
    hasContract: rng() > 0.35,
    lat,
    lng,
    performance,
    metrics,
    trends: genTrends(i * 137 + 42),
  };
});

export { buildings };

// Sort buildings by a specific metric (worst to best: lower green = worse)
export const sortBuildingsByMetric = (
  metric: keyof Building['metrics']
): Building[] => {
  return [...buildings].sort((a, b) => {
    const scoreA = a.metrics[metric].green;
    const scoreB = b.metrics[metric].green;
    return scoreA - scoreB;
  });
};

// Sort buildings by trend (most improved or most deteriorated)
export const sortBuildingsByTrend = (
  metric: keyof Building['metrics'],
  direction: 'improved' | 'deteriorated'
): Building[] => {
  return [...buildings].sort((a, b) => {
    const trendA = a.trends[metric];
    const trendB = b.trends[metric];
    return direction === 'improved'
      ? trendB - trendA
      : trendA - trendB;
  });
};
