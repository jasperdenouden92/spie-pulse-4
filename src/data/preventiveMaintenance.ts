import { buildings } from './buildings';
import {
  buildServiceOrder,
  iterateMonths,
  monthIndex,
  PROCESS_ORDERS_MAX_MONTH,
  PROCESS_ORDERS_MIN_MONTH,
  PROCESS_ORDER_STATUSES,
  type ProcessOrderStatus,
  type ServiceOrder,
} from './processOrders';

export const PM_MIN_MONTH = PROCESS_ORDERS_MIN_MONTH;
export const PM_MAX_MONTH = PROCESS_ORDERS_MAX_MONTH;
export const PM_STATUSES = PROCESS_ORDER_STATUSES;
export type PMStatus = ProcessOrderStatus;

export const NL_SFB_CATEGORIES = [
  'Warmte-opwekking',
  'Blusmiddelen',
  'Liften',
  'Koeling',
  'Ventilatie',
  'Verlichting',
  'Sanitair',
  'Beveiliging',
  'Toegangscontrole',
  'Noodstroomvoorziening',
] as const;
export type NLSfBCategory = (typeof NL_SFB_CATEGORIES)[number];

export const REGULATORY_CATEGORIES = ['Wetgeving', 'Niet beschikbaar', 'Overig'] as const;
export type RegulatoryCategory = (typeof REGULATORY_CATEGORIES)[number];

export const PARTICULARITY_CATEGORIES = ['Onderhoudsrapportage', 'Constatering'] as const;
export type ParticularityCategory = (typeof PARTICULARITY_CATEGORIES)[number];

export interface PMMonthCell {
  planned: number;
  executed: number;
  orders: ServiceOrder[];
}

export interface PMAsset {
  id: string;
  name: string;
  nlSfb: NLSfBCategory;
  regulatory: RegulatoryCategory;
  particularity: ParticularityCategory;
  byMonth: Record<string, PMMonthCell>;
}

export interface PMBuildingPart {
  id: string;
  name: string;
  assets: PMAsset[];
}

export interface PMBuildingLine {
  buildingId: string;
  buildingName: string;
  parts: PMBuildingPart[];
}

function rng(seed: number): () => number {
  let s = seed ^ 0xC0FFEE42;
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

const CURRENT_MONTH_INDEX = monthIndex(2026, 3);

const PART_NAME_POOLS: string[][] = [
  ['Hoofdgebouw', 'Bijgebouw', 'Magazijn'],
  ['Kantoorgedeelte', 'Productiehal', 'Buitenterrein'],
  ['Hoofdvleugel', 'Zijvleugel', 'Technische ruimte'],
  ['Hoofdgebouw', 'Aanbouw'],
  ['Hoofdgebouw', 'Parkeergarage', 'Buitenterrein'],
];

interface AssetSpec {
  prefix: string;
  description: string;
}

const ASSETS_BY_CATEGORY: Record<NLSfBCategory, AssetSpec[]> = {
  'Warmte-opwekking': [
    { prefix: 'CV-ketel', description: 'Vervang waakvlam en service' },
    { prefix: 'Warmtepomp', description: 'Onderhoud bron- en verdamperzijde' },
    { prefix: 'Stadsverwarmingsunit', description: 'Inspectie afleverset' },
  ],
  Blusmiddelen: [
    { prefix: 'Brandblusser', description: 'NEN 2559 keuring brandblusser' },
    { prefix: 'Brandhaspel', description: 'NEN 671-3 controle brandhaspel' },
    { prefix: 'Sprinklerinstallatie', description: 'Periodieke inspectie sprinkler' },
  ],
  Liften: [
    { prefix: 'Personenlift', description: 'Onderhoud lift en certificering' },
    { prefix: 'Goederenlift', description: 'Smering en kabelinspectie' },
  ],
  Koeling: [
    { prefix: 'Koelmachine', description: 'F-gassen lekcontrole koelmachine' },
    { prefix: 'Koeltoren', description: 'Reiniging koeltoren legionellabeheer' },
    { prefix: 'Splitsysteem', description: 'Filter- en condensorreiniging' },
  ],
  Ventilatie: [
    { prefix: 'Luchtbehandelingskast', description: 'Vervang filters AHU' },
    { prefix: 'Toiletventilator', description: 'Reinigen en V-snaar controle' },
    { prefix: 'WTW-unit', description: 'Filtervervanging WTW' },
  ],
  Verlichting: [
    { prefix: 'Noodverlichting', description: 'NEN-EN 1838 functietest noodverlichting' },
    { prefix: 'LED-armatuur', description: 'Vervangen defecte armaturen' },
  ],
  Sanitair: [
    { prefix: 'Watermeter', description: 'Aflezen en kalibratie watermeter' },
    { prefix: 'Boiler', description: 'Anode controle en spoelen' },
    { prefix: 'Keerklep', description: 'Controle keerklep volgens BRL-K14010' },
  ],
  Beveiliging: [
    { prefix: 'Brandmeldcentrale', description: 'NEN 2654 onderhoud BMC' },
    { prefix: 'Camera-installatie', description: 'Beeldcontrole en lensreiniging' },
  ],
  Toegangscontrole: [
    { prefix: 'Toegangsdeur', description: 'Onderhoud automatische deur' },
    { prefix: 'Slagboom', description: 'Smering en eindstandcontrole' },
  ],
  Noodstroomvoorziening: [
    { prefix: 'Diesel motor', description: 'Proefdraaien noodstroomaggregaat' },
    { prefix: 'UPS', description: 'Accutest en capaciteitsmeting UPS' },
  ],
};

function pickWeighted<T>(items: readonly T[], r: () => number, weights?: number[]): T {
  if (!weights) return items[Math.floor(r() * items.length)];
  const total = weights.reduce((a, b) => a + b, 0);
  let target = r() * total;
  for (let i = 0; i < items.length; i++) {
    target -= weights[i];
    if (target <= 0) return items[i];
  }
  return items[items.length - 1];
}

function buildAssetCode(prefix: string, partIdx: number, assetIdx: number, r: () => number): string {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const a = letters[Math.floor(r() * letters.length)];
  const b = letters[Math.floor(r() * letters.length)];
  const num = String(Math.floor(r() * 99) + 1).padStart(2, '0');
  return `${prefix} ${a}${b}-${partIdx + 1}.${num}-${String(assetIdx).padStart(2, '0')}`;
}

function generateAssetForPart(
  buildingIdx: number,
  partIdx: number,
  assetIdx: number,
  category: NLSfBCategory,
  r: () => number,
): PMAsset {
  const specs = ASSETS_BY_CATEGORY[category];
  const spec = specs[Math.floor(r() * specs.length)];
  const code = buildAssetCode(spec.prefix, partIdx, assetIdx, r);

  const regulatory = pickWeighted(REGULATORY_CATEGORIES, r, [0.55, 0.2, 0.25]);
  const particularity = pickWeighted(PARTICULARITY_CATEGORIES, r, [0.7, 0.3]);

  const allMonths = iterateMonths(
    PM_MIN_MONTH.year,
    PM_MIN_MONTH.month,
    PM_MAX_MONTH.year,
    PM_MAX_MONTH.month,
  );
  const byMonth: Record<string, PMMonthCell> = {};
  let seq = 1;

  // Asset cadence: how often it has a PM order (every N months)
  const cadence = Math.max(1, Math.floor(r() * 6) + 1);
  const offset = Math.floor(r() * cadence);

  for (let mIdx = 0; mIdx < allMonths.length; mIdx++) {
    const m = allMonths[mIdx];
    const due = (mIdx + offset) % cadence === 0;
    if (!due || r() < 0.25) {
      byMonth[m.key] = { planned: 0, executed: 0, orders: [] };
      continue;
    }

    const total = 1 + (r() < 0.2 ? 1 : 0);
    const idx = monthIndex(m.year, m.month);
    const isPast = idx < CURRENT_MONTH_INDEX;
    const isCurrent = idx === CURRENT_MONTH_INDEX;
    let plannedShare: number;
    if (isPast) plannedShare = r() < 0.85 ? 0 : 1;
    else if (isCurrent) plannedShare = r() < 0.5 ? 1 : 0;
    else plannedShare = r() < 0.92 ? 1 : 0;

    const planned = Math.round(total * plannedShare);
    const executed = total - planned;

    const orders: ServiceOrder[] = [];
    for (let i = 0; i < total; i++) {
      const status: PMStatus = i < planned ? 'planned' : 'executed';
      const number = String(1_000_000_000 + buildingIdx * 100_000 + partIdx * 1_000 + assetIdx * 30 + seq).padStart(12, '0');
      const b = buildings[buildingIdx];
      const dayInMonth = 1 + Math.floor(r() * 27);
      orders.push(buildServiceOrder({
        id: `pm-${b.id}-p${partIdx}-a${assetIdx}-${m.key}-${i}`,
        number,
        status,
        buildingId: b.id,
        buildingName: b.name,
        year: m.year,
        month: m.month,
        dayInMonth,
        installation: {
          code: String(400000000 + (buildingIdx * 9973 + partIdx * 113 + assetIdx * 7) % 99999999).padStart(9, '0'),
          name: code,
          category: category,
          assetId: `pma-${b.id}-p${partIdx}-${assetIdx}`,
        },
        template: {
          title: spec.prefix,
          description: spec.description,
          installationCategory: category,
          installationPrefix: spec.prefix,
        },
        r,
      }));
      seq += 1;
    }

    byMonth[m.key] = { planned, executed, orders };
  }

  return {
    id: `pma-${buildings[buildingIdx].id}-p${partIdx}-${assetIdx}`,
    name: code,
    nlSfb: category,
    regulatory,
    particularity,
    byMonth,
  };
}

function generateLines(): PMBuildingLine[] {
  return buildings.map((b, bIdx) => {
    const r = rng(bIdx * 7919 + 31);
    const partPool = PART_NAME_POOLS[bIdx % PART_NAME_POOLS.length];
    const partCount = 1 + Math.floor(r() * Math.min(partPool.length, 3));
    const partNames = partPool.slice(0, partCount);

    const parts: PMBuildingPart[] = partNames.map((name, partIdx) => {
      // 4-9 assets per part, drawn from a few NL/SfB categories
      const assetCount = 4 + Math.floor(r() * 6);
      const categoryCount = 2 + Math.floor(r() * 3);
      const categoryPool: NLSfBCategory[] = [];
      while (categoryPool.length < categoryCount) {
        const cat = NL_SFB_CATEGORIES[Math.floor(r() * NL_SFB_CATEGORIES.length)];
        if (!categoryPool.includes(cat)) categoryPool.push(cat);
      }

      const assets: PMAsset[] = [];
      for (let aIdx = 0; aIdx < assetCount; aIdx++) {
        const cat = categoryPool[aIdx % categoryPool.length];
        assets.push(generateAssetForPart(bIdx, partIdx, aIdx, cat, r));
      }
      return {
        id: `pmp-${b.id}-${partIdx}`,
        name,
        assets,
      };
    });

    return { buildingId: b.id, buildingName: b.name, parts };
  });
}

export const preventiveMaintenanceLines: PMBuildingLine[] = generateLines();

export function aggregateAssetMonth(
  assets: PMAsset[],
  monthKey: string,
): { planned: number; executed: number; orders: ServiceOrder[] } {
  let planned = 0;
  let executed = 0;
  const orders: ServiceOrder[] = [];
  for (const a of assets) {
    const cell = a.byMonth[monthKey];
    if (!cell) continue;
    planned += cell.planned;
    executed += cell.executed;
    if (cell.orders.length) orders.push(...cell.orders);
  }
  return { planned, executed, orders };
}
