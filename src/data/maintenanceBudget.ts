import { buildings } from './buildings';

export const BUDGET_MIN_YEAR = 2023;
export const BUDGET_MAX_YEAR = 2030;
export const BUDGET_YEARS = Array.from(
  { length: BUDGET_MAX_YEAR - BUDGET_MIN_YEAR + 1 },
  (_, i) => BUDGET_MIN_YEAR + i,
);

export const BUDGET_CATEGORIES = [
  'HVAC',
  'Lighting',
  'Electrical',
  'Fire Safety',
  'Plumbing',
  'Elevator',
  'Security',
  'Building Envelope',
] as const;
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

export const BUDGET_STATUSES = ['regular', 'major', 'replacement', 'inspection'] as const;
export type BudgetStatus = (typeof BUDGET_STATUSES)[number];

export interface MaintenanceBudgetLine {
  id: string;
  buildingId: string;
  buildingName: string;
  assetName: string;
  assetCategory: BudgetCategory;
  status: BudgetStatus;
  /** Year → euros. Year keys are integers in [BUDGET_MIN_YEAR..BUDGET_MAX_YEAR]. Missing / zero means no planned work. */
  yearlyCosts: Record<number, number>;
}

// Deterministic xorshift32 seeded by building index + line index
function rng(seed: number): () => number {
  let s = seed ^ 0xBADC0FFE;
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
  s = Math.imul(s ^ (s >>> 13), 0x45d9f3b);
  s = (s ^ (s >>> 16)) >>> 0;
  if (s === 0) s = 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

const ASSETS_PER_CATEGORY: Record<BudgetCategory, string[]> = {
  'HVAC': ['Air handler', 'Chiller', 'Cooling tower', 'Heat pump', 'VAV box', 'Boiler'],
  'Lighting': ['Emergency lighting', 'LED panels', 'Facade lighting', 'Exterior lighting'],
  'Electrical': ['Main switchgear', 'UPS system', 'Generator', 'Distribution board'],
  'Fire Safety': ['Sprinkler system', 'Fire alarm panel', 'Smoke detection', 'Fire extinguishers'],
  'Plumbing': ['Water softener', 'Drainage system', 'Hot water system', 'Backflow preventer'],
  'Elevator': ['Passenger lift A', 'Passenger lift B', 'Service lift', 'Platform lift'],
  'Security': ['Access control', 'CCTV system', 'Intrusion alarm'],
  'Building Envelope': ['Roof membrane', 'Facade cleaning', 'Window seals'],
};

const STATUS_COST_RANGE: Record<BudgetStatus, [number, number]> = {
  regular:     [500, 4_500],
  inspection:  [300, 2_000],
  major:       [5_000, 25_000],
  replacement: [12_000, 85_000],
};

// How often each status actually occurs (probability per year that this line has cost in that year)
const STATUS_YEARLY_PROB: Record<BudgetStatus, number> = {
  regular: 0.9,     // most years
  inspection: 0.75, // most years
  major: 0.25,      // once every 4 years
  replacement: 0.15, // rare, often single-year
};

function pickCategory(r: () => number): BudgetCategory {
  return BUDGET_CATEGORIES[Math.floor(r() * BUDGET_CATEGORIES.length)];
}

function pickStatus(r: () => number): BudgetStatus {
  // Bias toward regular/inspection
  const roll = r();
  if (roll < 0.45) return 'regular';
  if (roll < 0.75) return 'inspection';
  if (roll < 0.93) return 'major';
  return 'replacement';
}

function generateLinesForBuilding(buildingId: string, buildingName: string, seed: number): MaintenanceBudgetLine[] {
  const r = rng(seed);
  const lineCount = 4 + Math.floor(r() * 6); // 4–9 lines
  const lines: MaintenanceBudgetLine[] = [];
  const usedAssetNames = new Set<string>();

  for (let i = 0; i < lineCount; i++) {
    const category = pickCategory(r);
    const assetPool = ASSETS_PER_CATEGORY[category];
    let assetName = assetPool[Math.floor(r() * assetPool.length)];
    // Disambiguate duplicates within a building
    let suffix = 2;
    const baseName = assetName;
    while (usedAssetNames.has(assetName)) {
      assetName = `${baseName} #${suffix++}`;
    }
    usedAssetNames.add(assetName);

    const status = pickStatus(r);
    const [minCost, maxCost] = STATUS_COST_RANGE[status];
    const prob = STATUS_YEARLY_PROB[status];

    const yearlyCosts: Record<number, number> = {};
    for (const year of BUDGET_YEARS) {
      if (r() < prob) {
        const variance = 0.7 + r() * 0.6; // 0.7–1.3 ×
        const base = minCost + r() * (maxCost - minCost);
        // Round to nearest 50 euros for realism
        yearlyCosts[year] = Math.round((base * variance) / 50) * 50;
      }
    }

    lines.push({
      id: `mb-${buildingId}-${String(i + 1).padStart(2, '0')}`,
      buildingId,
      buildingName,
      assetName,
      assetCategory: category,
      status,
      yearlyCosts,
    });
  }

  return lines;
}

// Pick a reasonable subset of buildings so the view stays readable
const TARGET_BUILDING_COUNT = 24;
const selectedBuildings = buildings.slice(0, TARGET_BUILDING_COUNT);

export const maintenanceBudgetLines: MaintenanceBudgetLine[] = selectedBuildings.flatMap(
  (b, idx) => generateLinesForBuilding(b.id, b.name, idx * 131 + 17),
);
