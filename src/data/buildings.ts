export interface PerformanceMetric {
  green: number;
  yellow: number;
  red: number;
}

export type MetricKeys = 'overall' | 'sustainability' | 'comfort' | 'asset_monitoring' | 'tickets' | 'quotations' | 'maintenance' | 'energy' | 'workspace' | 'compliance' | 'water_management' | 'security_systems' | 'access_control';

export interface Building {
  name: string;
  address: string;
  city: string;
  group: string;
  image: string;
  hasContract: boolean;
  performance: PerformanceMetric;
  metrics: Record<MetricKeys, PerformanceMetric>;
  trends: Record<MetricKeys, number>;
}

// Seeded random for deterministic trend generation (xorshift32 for better distribution)
function seededRandom(seed: number): () => number {
  // Mix the seed to avoid clustering with similar inputs
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
  const rng = seededRandom(seed);
  // Range centered around 0: roughly -15 to +20, with good spread
  const gen = () => Math.round((rng() * 35 - 15) * 10) / 10;
  return {
    overall: gen(), sustainability: gen(), comfort: gen(), asset_monitoring: gen(),
    tickets: gen(), quotations: gen(), maintenance: gen(), energy: gen(),
    workspace: gen(), compliance: gen(), water_management: gen(),
    security_systems: gen(), access_control: gen(),
  };
}

// Helper to generate a performance metric with some variance around a base green score
function genMetric(baseGreen: number, variance: number = 8): PerformanceMetric {
  const green = Math.max(20, Math.min(95, baseGreen + Math.floor((Math.random() - 0.5) * variance)));
  const remaining = 100 - green;
  const yellow = Math.floor(remaining * (0.5 + Math.random() * 0.3));
  const red = remaining - yellow;
  return { green, yellow, red };
}

const buildingsData: Omit<Building, 'trends'>[] = [
  { name: 'Skyline Plaza', address: '123 Main St, Cityville', city: 'Amsterdam', group: 'Noord', image: '/images/Media-1.png', hasContract: true, performance: { green: 65, yellow: 20, red: 15 }, metrics: { overall: { green: 65, yellow: 20, red: 15 }, sustainability: { green: 72, yellow: 18, red: 10 }, comfort: { green: 68, yellow: 22, red: 10 }, asset_monitoring: { green: 60, yellow: 25, red: 15 }, tickets: { green: 55, yellow: 30, red: 15 }, quotations: { green: 70, yellow: 20, red: 10 }, maintenance: { green: 45, yellow: 35, red: 20 }, energy: genMetric(68), workspace: genMetric(62), compliance: genMetric(75), water_management: genMetric(58), security_systems: genMetric(70), access_control: genMetric(64) } },
  { name: 'Innovation Hub', address: '45 Tech Drive, Silicon Valley', city: 'Eindhoven', group: 'Noord', image: '/images/Media-2.png', hasContract: true, performance: { green: 60, yellow: 25, red: 15 }, metrics: { overall: { green: 60, yellow: 25, red: 15 }, sustainability: { green: 68, yellow: 22, red: 10 }, comfort: { green: 65, yellow: 25, red: 10 }, asset_monitoring: { green: 58, yellow: 27, red: 15 }, tickets: { green: 50, yellow: 30, red: 20 }, quotations: { green: 62, yellow: 23, red: 15 }, maintenance: { green: 57, yellow: 28, red: 15 }, energy: genMetric(64), workspace: genMetric(60), compliance: genMetric(72), water_management: genMetric(55), security_systems: genMetric(66), access_control: genMetric(61) } },
  { name: 'Harmony Estates', address: '789 Serenity Lane, Pleasantville', city: 'Utrecht', group: 'Noord', image: '/images/Media-3.png', hasContract: false, performance: { green: 55, yellow: 30, red: 15 }, metrics: { overall: { green: 55, yellow: 30, red: 15 }, sustainability: { green: 80, yellow: 12, red: 8 }, comfort: { green: 75, yellow: 15, red: 10 }, asset_monitoring: { green: 45, yellow: 35, red: 20 }, tickets: { green: 26, yellow: 40, red: 34 }, quotations: { green: 52, yellow: 30, red: 18 }, maintenance: { green: 48, yellow: 32, red: 20 }, energy: genMetric(76), workspace: genMetric(70), compliance: genMetric(82), water_management: genMetric(65), security_systems: genMetric(78), access_control: genMetric(72) } },
  { name: 'Atrium Towers', address: '12 Center Ave, Downtown', city: 'Amsterdam', group: 'Noord', image: '/images/Media-4.png', hasContract: false, performance: { green: 45, yellow: 35, red: 20 }, metrics: { overall: { green: 45, yellow: 35, red: 20 }, sustainability: { green: 38, yellow: 37, red: 25 }, comfort: { green: 42, yellow: 35, red: 23 }, asset_monitoring: { green: 50, yellow: 30, red: 20 }, tickets: { green: 48, yellow: 32, red: 20 }, quotations: { green: 43, yellow: 35, red: 22 }, maintenance: { green: 40, yellow: 35, red: 25 }, energy: genMetric(42), workspace: genMetric(40), compliance: genMetric(48), water_management: genMetric(38), security_systems: genMetric(45), access_control: genMetric(41) } },
  { name: 'Civic Center', address: '200 Market Rd, Metro City', city: 'Den Haag', group: 'Noord', image: '/images/Media-5.png', hasContract: false, performance: { green: 50, yellow: 30, red: 20 }, metrics: { overall: { green: 50, yellow: 30, red: 20 }, sustainability: { green: 45, yellow: 35, red: 20 }, comfort: { green: 48, yellow: 32, red: 20 }, asset_monitoring: { green: 55, yellow: 28, red: 17 }, tickets: { green: 52, yellow: 30, red: 18 }, quotations: { green: 48, yellow: 32, red: 20 }, maintenance: { green: 50, yellow: 30, red: 20 }, energy: genMetric(47), workspace: genMetric(46), compliance: genMetric(52), water_management: genMetric(44), security_systems: genMetric(50), access_control: genMetric(48) } },
  { name: 'Harbor Point', address: '9 Dockside, Waterfront', city: 'Rotterdam', group: 'Noord', image: '/images/Media-6.png', hasContract: true, performance: { green: 62, yellow: 23, red: 15 }, metrics: { overall: { green: 62, yellow: 23, red: 15 }, sustainability: { green: 70, yellow: 20, red: 10 }, comfort: { green: 65, yellow: 23, red: 12 }, asset_monitoring: { green: 58, yellow: 27, red: 15 }, tickets: { green: 60, yellow: 25, red: 15 }, quotations: { green: 63, yellow: 22, red: 15 }, maintenance: { green: 60, yellow: 25, red: 15 }, energy: genMetric(66), workspace: genMetric(62), compliance: genMetric(70), water_management: genMetric(60), security_systems: genMetric(68), access_control: genMetric(63) } },
  { name: 'Crystal Tower', address: '567 Glass Ave, Business District', city: 'Amsterdam', group: 'Noord', image: '/images/Media-1.png', hasContract: true, performance: { green: 58, yellow: 27, red: 15 }, metrics: { overall: { green: 58, yellow: 27, red: 15 }, sustainability: { green: 55, yellow: 30, red: 15 }, comfort: { green: 60, yellow: 25, red: 15 }, asset_monitoring: { green: 62, yellow: 23, red: 15 }, tickets: { green: 57, yellow: 28, red: 15 }, quotations: { green: 55, yellow: 30, red: 15 }, maintenance: { green: 58, yellow: 27, red: 15 }, energy: genMetric(57), workspace: genMetric(56), compliance: genMetric(60), water_management: genMetric(54), security_systems: genMetric(59), access_control: genMetric(56) } },
  { name: 'Green Park Office', address: '890 Oak Street, Eco Park', city: 'Utrecht', group: 'Oost', image: '/images/Media-2.png', hasContract: true, performance: { green: 75, yellow: 15, red: 10 }, metrics: { overall: { green: 75, yellow: 15, red: 10 }, sustainability: { green: 85, yellow: 10, red: 5 }, comfort: { green: 78, yellow: 14, red: 8 }, asset_monitoring: { green: 72, yellow: 18, red: 10 }, tickets: { green: 70, yellow: 20, red: 10 }, quotations: { green: 75, yellow: 15, red: 10 }, maintenance: { green: 73, yellow: 17, red: 10 }, energy: genMetric(82), workspace: genMetric(76), compliance: genMetric(85), water_management: genMetric(74), security_systems: genMetric(80), access_control: genMetric(77) } },
  { name: 'Sunset Plaza', address: '234 Horizon Blvd, West Side', city: 'Rotterdam', group: 'Oost', image: '/images/Media-3.png', hasContract: false, performance: { green: 40, yellow: 35, red: 25 }, metrics: { overall: { green: 40, yellow: 35, red: 25 }, sustainability: { green: 35, yellow: 40, red: 25 }, comfort: { green: 38, yellow: 37, red: 25 }, asset_monitoring: { green: 27, yellow: 40, red: 33 }, tickets: { green: 42, yellow: 35, red: 23 }, quotations: { green: 38, yellow: 37, red: 25 }, maintenance: { green: 40, yellow: 35, red: 25 }, energy: genMetric(36), workspace: genMetric(35), compliance: genMetric(40), water_management: genMetric(32), security_systems: genMetric(38), access_control: genMetric(34) } },
  { name: 'Metro Central', address: '456 Urban Plaza, City Center', city: 'Amsterdam', group: 'Oost', image: '/images/Media-4.png', hasContract: true, performance: { green: 57, yellow: 28, red: 15 }, metrics: { overall: { green: 57, yellow: 28, red: 15 }, sustainability: { green: 52, yellow: 30, red: 18 }, comfort: { green: 55, yellow: 30, red: 15 }, asset_monitoring: { green: 60, yellow: 25, red: 15 }, tickets: { green: 58, yellow: 27, red: 15 }, quotations: { green: 57, yellow: 28, red: 15 }, maintenance: { green: 55, yellow: 30, red: 15 }, energy: genMetric(54), workspace: genMetric(52), compliance: genMetric(58), water_management: genMetric(50), security_systems: genMetric(56), access_control: genMetric(53) } },
  { name: 'Riverside Complex', address: '321 River Road, Riverside', city: 'Rotterdam', group: 'Oost', image: '/images/Media-5.png', hasContract: true, performance: { green: 68, yellow: 20, red: 12 }, metrics: { overall: { green: 68, yellow: 20, red: 12 }, sustainability: { green: 75, yellow: 15, red: 10 }, comfort: { green: 70, yellow: 20, red: 10 }, asset_monitoring: { green: 65, yellow: 23, red: 12 }, tickets: { green: 63, yellow: 22, red: 15 }, quotations: { green: 68, yellow: 20, red: 12 }, maintenance: { green: 67, yellow: 21, red: 12 }, energy: genMetric(72), workspace: genMetric(68), compliance: genMetric(76), water_management: genMetric(66), security_systems: genMetric(73), access_control: genMetric(69) } },
  { name: 'North Star', address: '678 North Ave, Northern Heights', city: 'Utrecht', group: 'Oost', image: '/images/Media-6.png', hasContract: true, performance: { green: 78, yellow: 12, red: 10 }, metrics: { overall: { green: 78, yellow: 12, red: 10 }, sustainability: { green: 82, yellow: 10, red: 8 }, comfort: { green: 80, yellow: 12, red: 8 }, asset_monitoring: { green: 75, yellow: 15, red: 10 }, tickets: { green: 77, yellow: 13, red: 10 }, quotations: { green: 78, yellow: 12, red: 10 }, maintenance: { green: 76, yellow: 14, red: 10 }, energy: genMetric(80), workspace: genMetric(77), compliance: genMetric(84), water_management: genMetric(75), security_systems: genMetric(81), access_control: genMetric(78) } },
  { name: 'Gateway Plaza', address: '111 Entry Way, Gateway District', city: 'Den Haag', group: 'Oost', image: '/images/Media-1.png', hasContract: false, performance: { green: 52, yellow: 30, red: 18 }, metrics: { overall: { green: 52, yellow: 30, red: 18 }, sustainability: { green: 48, yellow: 32, red: 20 }, comfort: { green: 50, yellow: 30, red: 20 }, asset_monitoring: { green: 55, yellow: 28, red: 17 }, tickets: { green: 53, yellow: 30, red: 17 }, quotations: { green: 52, yellow: 30, red: 18 }, maintenance: { green: 50, yellow: 30, red: 20 }, energy: genMetric(50), workspace: genMetric(48), compliance: genMetric(54), water_management: genMetric(46), security_systems: genMetric(52), access_control: genMetric(49) } },
  { name: 'Tech Park East', address: '222 Innovation Rd, Tech Zone', city: 'Eindhoven', group: 'Oost', image: '/images/Media-2.png', hasContract: true, performance: { green: 64, yellow: 22, red: 14 }, metrics: { overall: { green: 64, yellow: 22, red: 14 }, sustainability: { green: 60, yellow: 25, red: 15 }, comfort: { green: 62, yellow: 23, red: 15 }, asset_monitoring: { green: 68, yellow: 20, red: 12 }, tickets: { green: 65, yellow: 22, red: 13 }, quotations: { green: 64, yellow: 22, red: 14 }, maintenance: { green: 63, yellow: 23, red: 14 }, energy: genMetric(62), workspace: genMetric(60), compliance: genMetric(66), water_management: genMetric(58), security_systems: genMetric(65), access_control: genMetric(61) } },
  { name: 'Crown Heights', address: '333 Summit St, Uptown', city: 'Den Haag', group: 'Zuid', image: '/images/Media-3.png', hasContract: false, performance: { green: 38, yellow: 37, red: 25 }, metrics: { overall: { green: 38, yellow: 37, red: 25 }, sustainability: { green: 32, yellow: 40, red: 28 }, comfort: { green: 28, yellow: 42, red: 30 }, asset_monitoring: { green: 42, yellow: 35, red: 23 }, tickets: { green: 40, yellow: 35, red: 25 }, quotations: { green: 38, yellow: 37, red: 25 }, maintenance: { green: 36, yellow: 39, red: 25 }, energy: genMetric(34), workspace: genMetric(30), compliance: genMetric(38), water_management: genMetric(28), security_systems: genMetric(36), access_control: genMetric(32) } },
  { name: 'Liberty Square', address: '444 Freedom Ave, Downtown', city: 'Amsterdam', group: 'Zuid', image: '/images/Media-4.png', hasContract: true, performance: { green: 60, yellow: 25, red: 15 }, metrics: { overall: { green: 60, yellow: 25, red: 15 }, sustainability: { green: 58, yellow: 27, red: 15 }, comfort: { green: 62, yellow: 23, red: 15 }, asset_monitoring: { green: 63, yellow: 22, red: 15 }, tickets: { green: 58, yellow: 27, red: 15 }, quotations: { green: 60, yellow: 25, red: 15 }, maintenance: { green: 59, yellow: 26, red: 15 }, energy: genMetric(59), workspace: genMetric(58), compliance: genMetric(63), water_management: genMetric(56), security_systems: genMetric(62), access_control: genMetric(58) } },
  { name: 'Pinnacle Tower', address: '555 Peak Lane, Financial District', city: 'Utrecht', group: 'Zuid', image: '/images/Media-5.png', hasContract: true, performance: { green: 72, yellow: 18, red: 10 }, metrics: { overall: { green: 72, yellow: 18, red: 10 }, sustainability: { green: 68, yellow: 22, red: 10 }, comfort: { green: 70, yellow: 20, red: 10 }, asset_monitoring: { green: 75, yellow: 15, red: 10 }, tickets: { green: 73, yellow: 17, red: 10 }, quotations: { green: 72, yellow: 18, red: 10 }, maintenance: { green: 71, yellow: 19, red: 10 }, energy: genMetric(70), workspace: genMetric(68), compliance: genMetric(74), water_management: genMetric(66), security_systems: genMetric(72), access_control: genMetric(69) } },
  { name: 'Heritage Building', address: '666 Historic Ave, Old Town', city: 'Rotterdam', group: 'Zuid', image: '/images/Media-6.png', hasContract: false, performance: { green: 35, yellow: 40, red: 25 }, metrics: { overall: { green: 35, yellow: 40, red: 25 }, sustainability: { green: 25, yellow: 45, red: 30 }, comfort: { green: 32, yellow: 40, red: 28 }, asset_monitoring: { green: 38, yellow: 37, red: 25 }, tickets: { green: 37, yellow: 38, red: 25 }, quotations: { green: 30, yellow: 42, red: 28 }, maintenance: { green: 33, yellow: 40, red: 27 }, energy: genMetric(28), workspace: genMetric(30), compliance: genMetric(34), water_management: genMetric(26), security_systems: genMetric(32), access_control: genMetric(29) } },
  { name: 'Modern Canvas', address: '777 Contemporary Blvd, Arts District', city: 'Den Haag', group: 'Zuid', image: '/images/Media-1.png', hasContract: true, performance: { green: 66, yellow: 21, red: 13 }, metrics: { overall: { green: 66, yellow: 21, red: 13 }, sustainability: { green: 70, yellow: 20, red: 10 }, comfort: { green: 68, yellow: 22, red: 10 }, asset_monitoring: { green: 63, yellow: 22, red: 15 }, tickets: { green: 65, yellow: 22, red: 13 }, quotations: { green: 66, yellow: 21, red: 13 }, maintenance: { green: 64, yellow: 23, red: 13 }, energy: genMetric(68), workspace: genMetric(66), compliance: genMetric(72), water_management: genMetric(64), security_systems: genMetric(70), access_control: genMetric(67) } },
  { name: 'Velocity Center', address: '888 Speed St, Tech Hub', city: 'Eindhoven', group: 'Zuid', image: '/images/Media-2.png', hasContract: true, performance: { green: 80, yellow: 12, red: 8 }, metrics: { overall: { green: 80, yellow: 12, red: 8 }, sustainability: { green: 78, yellow: 14, red: 8 }, comfort: { green: 82, yellow: 10, red: 8 }, asset_monitoring: { green: 80, yellow: 12, red: 8 }, tickets: { green: 79, yellow: 13, red: 8 }, quotations: { green: 80, yellow: 12, red: 8 }, maintenance: { green: 81, yellow: 11, red: 8 }, energy: genMetric(79), workspace: genMetric(78), compliance: genMetric(83), water_management: genMetric(76), security_systems: genMetric(81), access_control: genMetric(79) } },
  { name: 'Zenith Plaza', address: '999 Summit Way, Premium District', city: 'Den Haag', group: 'Zuid', image: '/images/Media-3.png', hasContract: false, performance: { green: 63, yellow: 23, red: 14 }, metrics: { overall: { green: 63, yellow: 23, red: 14 }, sustainability: { green: 60, yellow: 25, red: 15 }, comfort: { green: 65, yellow: 22, red: 13 }, asset_monitoring: { green: 66, yellow: 21, red: 13 }, tickets: { green: 62, yellow: 23, red: 15 }, quotations: { green: 63, yellow: 23, red: 14 }, maintenance: { green: 61, yellow: 24, red: 15 }, energy: genMetric(62), workspace: genMetric(61), compliance: genMetric(66), water_management: genMetric(59), security_systems: genMetric(64), access_control: genMetric(62) } },
  { name: 'Eclipse Tower', address: '1010 Shadow Lane, Executive Area', city: 'Rotterdam', group: 'West', image: '/images/Media-4.png', hasContract: false, performance: { green: 55, yellow: 30, red: 15 }, metrics: { overall: { green: 55, yellow: 30, red: 15 }, sustainability: { green: 50, yellow: 30, red: 20 }, comfort: { green: 53, yellow: 30, red: 17 }, asset_monitoring: { green: 58, yellow: 27, red: 15 }, tickets: { green: 56, yellow: 29, red: 15 }, quotations: { green: 55, yellow: 30, red: 15 }, maintenance: { green: 54, yellow: 30, red: 16 }, energy: genMetric(52), workspace: genMetric(50), compliance: genMetric(56), water_management: genMetric(48), security_systems: genMetric(54), access_control: genMetric(51) } },
  { name: 'Aurora Office', address: '1111 Dawn St, Morning Heights', city: 'Utrecht', group: 'West', image: '/images/Media-5.png', hasContract: true, performance: { green: 58, yellow: 27, red: 15 }, metrics: { overall: { green: 58, yellow: 27, red: 15 }, sustainability: { green: 55, yellow: 30, red: 15 }, comfort: { green: 60, yellow: 25, red: 15 }, asset_monitoring: { green: 61, yellow: 24, red: 15 }, tickets: { green: 57, yellow: 28, red: 15 }, quotations: { green: 58, yellow: 27, red: 15 }, maintenance: { green: 56, yellow: 29, red: 15 }, energy: genMetric(57), workspace: genMetric(56), compliance: genMetric(61), water_management: genMetric(54), security_systems: genMetric(59), access_control: genMetric(56) } },
  { name: 'Nexus Building', address: '1212 Connection Ave, Central Hub', city: 'Amsterdam', group: 'West', image: '/images/Media-6.png', hasContract: true, performance: { green: 68, yellow: 20, red: 12 }, metrics: { overall: { green: 68, yellow: 20, red: 12 }, sustainability: { green: 72, yellow: 18, red: 10 }, comfort: { green: 70, yellow: 20, red: 10 }, asset_monitoring: { green: 66, yellow: 21, red: 13 }, tickets: { green: 67, yellow: 21, red: 12 }, quotations: { green: 68, yellow: 20, red: 12 }, maintenance: { green: 69, yellow: 19, red: 12 }, energy: genMetric(70), workspace: genMetric(68), compliance: genMetric(74), water_management: genMetric(66), security_systems: genMetric(72), access_control: genMetric(69) } },
  { name: 'Vertex Square', address: '1313 Corner Plaza, Intersection', city: 'Rotterdam', group: 'West', image: '/images/Media-1.png', hasContract: false, performance: { green: 43, yellow: 35, red: 22 }, metrics: { overall: { green: 43, yellow: 35, red: 22 }, sustainability: { green: 40, yellow: 35, red: 25 }, comfort: { green: 42, yellow: 35, red: 23 }, asset_monitoring: { green: 46, yellow: 34, red: 20 }, tickets: { green: 44, yellow: 35, red: 21 }, quotations: { green: 43, yellow: 35, red: 22 }, maintenance: { green: 41, yellow: 35, red: 24 }, energy: genMetric(42), workspace: genMetric(40), compliance: genMetric(46), water_management: genMetric(38), security_systems: genMetric(44), access_control: genMetric(41) } },
  { name: 'Prism Complex', address: '1414 Spectrum Rd, Color District', city: 'Eindhoven', group: 'West', image: '/images/Media-2.png', hasContract: true, performance: { green: 75, yellow: 15, red: 10 }, metrics: { overall: { green: 75, yellow: 15, red: 10 }, sustainability: { green: 78, yellow: 14, red: 8 }, comfort: { green: 76, yellow: 14, red: 10 }, asset_monitoring: { green: 73, yellow: 17, red: 10 }, tickets: { green: 74, yellow: 16, red: 10 }, quotations: { green: 75, yellow: 15, red: 10 }, maintenance: { green: 77, yellow: 13, red: 10 }, energy: genMetric(76), workspace: genMetric(74), compliance: genMetric(80), water_management: genMetric(72), security_systems: genMetric(78), access_control: genMetric(75) } },
];

// Add deterministic trends to each building
const buildingsWithTrends: Building[] = buildingsData.map((b, i) => ({
  ...b,
  trends: genTrends(i * 137 + 42),
}));

// Export the raw building data
export const buildings = buildingsWithTrends;

// Sort buildings by a specific metric (worst to best: lower green = worse)
export const sortBuildingsByMetric = (
  metric: keyof Building['metrics']
): Building[] => {
  return [...buildingsWithTrends].sort((a, b) => {
    const scoreA = a.metrics[metric].green;
    const scoreB = b.metrics[metric].green;
    return scoreA - scoreB; // Ascending order: worst (lowest green) to best (highest green)
  });
};

// Sort buildings by trend (most improved or most deteriorated)
export const sortBuildingsByTrend = (
  metric: keyof Building['metrics'],
  direction: 'improved' | 'deteriorated'
): Building[] => {
  return [...buildingsWithTrends].sort((a, b) => {
    const trendA = a.trends[metric];
    const trendB = b.trends[metric];
    return direction === 'improved'
      ? trendB - trendA  // Highest positive trend first
      : trendA - trendB; // Most negative trend first
  });
};
