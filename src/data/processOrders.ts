import { buildings } from './buildings';

export const PROCESS_ORDERS_MIN_MONTH = { year: 2024, month: 0 };
export const PROCESS_ORDERS_MAX_MONTH = { year: 2026, month: 3 };

export const PROCESS_ORDER_STATUSES = ['planned', 'executed'] as const;
export type ProcessOrderStatus = (typeof PROCESS_ORDER_STATUSES)[number];

export interface ServiceOrder {
  id: string;
  number: string;
  description: string;
  status: ProcessOrderStatus;
  buildingId: string;
  buildingName: string;
  year: number;
  month: number;
}

export interface ProcessOrderMonthCell {
  planned: number;
  executed: number;
  orders: ServiceOrder[];
}

export interface ProcessOrderLocationLine {
  buildingId: string;
  buildingName: string;
  byMonth: Record<string, ProcessOrderMonthCell>;
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function iterateMonths(
  fromYear: number,
  fromMonth: number,
  toYear: number,
  toMonth: number,
): Array<{ year: number; month: number; key: string }> {
  const out: Array<{ year: number; month: number; key: string }> = [];
  let y = fromYear;
  let m = fromMonth;
  while (y < toYear || (y === toYear && m <= toMonth)) {
    out.push({ year: y, month: m, key: monthKey(y, m) });
    m += 1;
    if (m > 11) { m = 0; y += 1; }
  }
  return out;
}

export function monthIndex(year: number, month: number): number {
  return year * 12 + month;
}

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

// "Current" month used to bias planned vs executed: months at or before this are
// more likely to be executed, months after are more likely to be still planned.
const CURRENT_MONTH_INDEX = monthIndex(2026, 3); // April 2026, matches PROCESS_ORDERS_MAX_MONTH

const ORDER_DESCRIPTIONS = [
  'Vervang luchtfilter AHU',
  'Kalibratie temperatuursensor',
  'Inspectie brandblussers',
  'Onderhoud liftinstallatie',
  'Reiniging koeltoren',
  'Controle noodverlichting',
  'Vervang LED-armatuur',
  'Smeren deurdrangers',
  'Legionella-spoeling',
  'Test rookmelders',
  'Vervang V-snaar ventilator',
  'Controle aardlek',
  'Reinigen dakgoten',
  'Keuring hefwerktuig',
  'Onderhoud brandkleppen',
  'Vervang accu UPS',
  'Inspectie valbeveiliging',
  'Controle stadswater',
  'Reiniging warmtewisselaar',
  'Vervang dichtingen pompen',
];

function generateLines(): ProcessOrderLocationLine[] {
  const allMonths = iterateMonths(
    PROCESS_ORDERS_MIN_MONTH.year,
    PROCESS_ORDERS_MIN_MONTH.month,
    PROCESS_ORDERS_MAX_MONTH.year,
    PROCESS_ORDERS_MAX_MONTH.month,
  );

  return buildings.map((b, bIdx) => {
    const r = rng(bIdx * 9973 + 17);
    const activity = 0.3 + r() * 0.7; // base order volume per building
    const byMonth: Record<string, ProcessOrderMonthCell> = {};
    let seq = 1;

    for (const m of allMonths) {
      const idx = monthIndex(m.year, m.month);
      const isPast = idx < CURRENT_MONTH_INDEX;
      const isCurrent = idx === CURRENT_MONTH_INDEX;

      const anyProb = 0.7 * activity;
      if (r() > anyProb) {
        byMonth[m.key] = { planned: 0, executed: 0, orders: [] };
        continue;
      }

      const total = 1 + Math.floor(r() * (1 + activity * 5));

      let plannedShare: number;
      if (isPast) {
        plannedShare = r() < 0.85 ? 0 : 1 - r() * 0.4;
      } else if (isCurrent) {
        plannedShare = 0.3 + r() * 0.5;
      } else {
        plannedShare = r() < 0.9 ? 1 : 0.6 + r() * 0.4;
      }

      const planned = Math.round(total * plannedShare);
      const executed = total - planned;

      const orders: ServiceOrder[] = [];
      for (let i = 0; i < total; i++) {
        const status: ProcessOrderStatus = i < planned ? 'planned' : 'executed';
        const descIdx = Math.floor(r() * ORDER_DESCRIPTIONS.length);
        const number = `SO-${String(2024 + bIdx).slice(-2)}${String(m.month + 1).padStart(2, '0')}-${String(bIdx * 1000 + seq).padStart(5, '0')}`;
        orders.push({
          id: `so-${b.id}-${m.key}-${i}`,
          number,
          description: ORDER_DESCRIPTIONS[descIdx],
          status,
          buildingId: b.id,
          buildingName: b.name,
          year: m.year,
          month: m.month,
        });
        seq += 1;
      }

      byMonth[m.key] = { planned, executed, orders };
    }

    return {
      buildingId: b.id,
      buildingName: b.name,
      byMonth,
    };
  });
}

export const processOrderLines: ProcessOrderLocationLine[] = generateLines();

export const allServiceOrders: ServiceOrder[] = processOrderLines.flatMap(l =>
  Object.values(l.byMonth).flatMap(cell => cell.orders),
);

export function getServiceOrderById(id: string): ServiceOrder | undefined {
  return allServiceOrders.find(o => o.id === id);
}
