import { buildings } from './buildings';

export const PROCESS_ORDERS_MIN_MONTH = { year: 2024, month: 0 };
export const PROCESS_ORDERS_MAX_MONTH = { year: 2026, month: 3 };

export const PROCESS_ORDER_STATUSES = ['planned', 'executed'] as const;
export type ProcessOrderStatus = (typeof PROCESS_ORDER_STATUSES)[number];

export interface ServiceOrderInstallation {
  /** Sap-style 9-digit installation number (clickable). */
  code: string;
  /** Friendly installation name, e.g. "Brandmeldinstallatie B-21". */
  name: string;
  /** Optional NL/SfB or generic category for icon mapping. */
  category?: string;
  /** Optional asset id if the installation maps to a known asset/PM asset. */
  assetId?: string;
}

export interface ServiceOrderObservation {
  title: string;
  followUpStatus: 'open' | 'pending' | 'closed';
  hasFollowUp: boolean;
  body: string;
}

export interface ServiceOrderAttachment {
  name: string;
  date?: string; // ISO date
}

export interface ServiceOrder {
  id: string;
  /** SAP-style 12-digit service order number. */
  number: string;
  /** Short title for the order, used as the side-peek heading. */
  title: string;
  /** Longer free-text description (often duplicates the title). */
  description: string;
  status: ProcessOrderStatus;
  buildingId: string;
  buildingName: string;
  /** Postal-code style "<zip><house>/<room>" reference, clickable to open the building peek. */
  buildingCode: string;
  /** Full work address line. */
  workAddress: string;
  /** Tenant-side customer number for this building. */
  customerNumber: string;
  /** Linked installation (clickable in the side peek). */
  installation?: ServiceOrderInstallation;
  /** Optional technique type, "-" when unknown. */
  techniqueType?: string;
  /** Compliance bucket: "Wetgeving" | "Niet beschikbaar" | "Overig". */
  compliance: 'Wetgeving' | 'Niet beschikbaar' | 'Overig';
  plannedWeek?: { year: number; week: number };
  executedWeek?: { year: number; week: number };
  observations: ServiceOrderObservation[];
  attachments: ServiceOrderAttachment[];
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

export function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const diff = (d.getTime() - firstThursday.getTime()) / 86400000;
  const week = 1 + Math.round((diff - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return { year: d.getUTCFullYear(), week };
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

const POSTAL_LETTERS = ['AB', 'AC', 'AD', 'AH', 'AK', 'BC', 'BD', 'BH', 'CD', 'EA', 'GH', 'JL', 'PA', 'RB', 'TC', 'XK'];

function buildPostalCode(r: () => number): string {
  const digits = String(1000 + Math.floor(r() * 8999));
  const letters = POSTAL_LETTERS[Math.floor(r() * POSTAL_LETTERS.length)];
  return `${digits} ${letters}`;
}

function buildBuildingCode(postal: string, r: () => number): string {
  // SPIE-style: <zipNoSpace><buildingNo>/<roomNo>
  const zip = postal.replace(/\s/g, '');
  const buildingNo = String(Math.floor(r() * 99) + 1).padStart(2, '0');
  const roomNo = String(Math.floor(r() * 99)).padStart(2, '0');
  return `${zip}${buildingNo}/${roomNo}`;
}

function buildCustomerNumber(buildingIdx: number): string {
  return String(500000 + (buildingIdx * 1733) % 499999);
}

interface BuildingMeta {
  postalCode: string;
  buildingCode: string;
  workAddress: string;
  customerNumber: string;
}

const buildingMeta: Map<string, BuildingMeta> = new Map();
buildings.forEach((b, idx) => {
  const r = rng(idx * 4099 + 11);
  const postal = buildPostalCode(r);
  buildingMeta.set(b.id, {
    postalCode: postal,
    buildingCode: buildBuildingCode(postal, r),
    workAddress: `${b.address}, ${postal} ${b.city.toUpperCase()}`,
    customerNumber: buildCustomerNumber(idx),
  });
});

export function getBuildingMeta(buildingId: string): BuildingMeta | undefined {
  return buildingMeta.get(buildingId);
}

const CURRENT_MONTH_INDEX = monthIndex(2026, 3); // April 2026

interface OrderTemplate {
  title: string;
  description: string;
  techniqueType?: string;
  installationCategory: string;
  installationPrefix: string;
}

const ORDER_TEMPLATES: OrderTemplate[] = [
  { title: 'UB Brandmeldinstallatie', description: 'Uitgebreid onderhoud brandmeldinstallatie', techniqueType: 'Detectie', installationCategory: 'Brandmeldinstallaties', installationPrefix: 'BMI' },
  { title: 'Vervang luchtfilter AHU', description: 'Filtervervanging luchtbehandelingskast', techniqueType: 'Filtratie', installationCategory: 'Ventilatie', installationPrefix: 'AHU' },
  { title: 'Kalibratie temperatuursensor', description: 'Periodieke kalibratie temperatuursensor', installationCategory: 'BMS', installationPrefix: 'TS' },
  { title: 'Inspectie brandblussers', description: 'Jaarlijkse NEN 2559 inspectie brandblussers', installationCategory: 'Blusmiddelen', installationPrefix: 'BB' },
  { title: 'Onderhoud liftinstallatie', description: 'Onderhoud en certificering personenlift', installationCategory: 'Liften', installationPrefix: 'LFT' },
  { title: 'Reiniging koeltoren', description: 'Reiniging koeltoren met legionellabeheer', installationCategory: 'Koeling', installationPrefix: 'KT' },
  { title: 'Controle noodverlichting', description: 'NEN-EN 1838 controle noodverlichting', installationCategory: 'Verlichting', installationPrefix: 'NV' },
  { title: 'Test rookmelders', description: 'Functietest rookmelders en sirenes', installationCategory: 'Brandmeldinstallaties', installationPrefix: 'RM' },
  { title: 'Vervang V-snaar ventilator', description: 'Vervangen aandrijfsnaar ventilator', installationCategory: 'Ventilatie', installationPrefix: 'VENT' },
  { title: 'Controle aardlekschakelaar', description: 'Periodieke meting aardlekschakelaar', installationCategory: 'Elektra', installationPrefix: 'ALS' },
  { title: 'Legionella-spoeling', description: 'Spoelen tappunten in kader van legionellabeheer', installationCategory: 'Sanitair', installationPrefix: 'LEG' },
  { title: 'Vervang accu UPS', description: 'Vervangen accupakket no-break installatie', installationCategory: 'Noodstroomvoorziening', installationPrefix: 'UPS' },
  { title: 'Inspectie valbeveiliging', description: 'Inspectie persoonlijke valbeveiliging dak', installationCategory: 'Veiligheid', installationPrefix: 'VBV' },
  { title: 'Reiniging warmtewisselaar', description: 'Chemische reiniging warmtewisselaar', installationCategory: 'Warmte-opwekking', installationPrefix: 'WW' },
];

const COMPLIANCE_VALUES: ServiceOrder['compliance'][] = ['Wetgeving', 'Niet beschikbaar', 'Overig'];

const OBSERVATION_TITLES = [
  'Mogelijk meerwerk',
  'Vervolgafspraak benodigd',
  'Onderdeel besteld',
  'Toegang ruimte beperkt',
  'Aanvullende meting nodig',
];

const OBSERVATION_BODIES = [
  'Restpunten oplossen na levering onderdeel.',
  'Toegang tot technische ruimte was beperkt — herplannen i.o.m. beheerder.',
  'Meting buiten tolerantie, opvolging via separate werkbon.',
  'Cliënt informeert intern; opdrachtbevestiging volgt.',
];

const ATTACHMENT_NAMES = [
  'inspectierapport',
  'meetwaarden',
  'opleveringsfoto',
  'CAR-rapport',
  'serviceformulier',
];

interface BuildOrderInput {
  id: string;
  number: string;
  status: ProcessOrderStatus;
  buildingId: string;
  buildingName: string;
  year: number;
  month: number;
  /** Day-of-month used to derive a deterministic ISO week. */
  dayInMonth: number;
  /** Optional installation override (used by preventive maintenance). */
  installation?: ServiceOrderInstallation;
  /** Optional template override (used by preventive maintenance). */
  template?: OrderTemplate;
  r: () => number;
}

export function buildServiceOrder(input: BuildOrderInput): ServiceOrder {
  const { id, number, status, buildingId, buildingName, year, month, dayInMonth, r } = input;
  const meta = buildingMeta.get(buildingId)!;

  const template = input.template ?? ORDER_TEMPLATES[Math.floor(r() * ORDER_TEMPLATES.length)];

  const installation: ServiceOrderInstallation = input.installation ?? {
    code: String(400000000 + Math.floor(r() * 99999999)),
    name: `${template.installationPrefix} ${POSTAL_LETTERS[Math.floor(r() * POSTAL_LETTERS.length)]}-${String(Math.floor(r() * 99) + 1).padStart(2, '0')}`,
    category: template.installationCategory,
  };

  const dueDate = new Date(year, month, Math.min(28, Math.max(1, dayInMonth)));
  const due = isoWeek(dueDate);

  let plannedWeek: { year: number; week: number } | undefined;
  let executedWeek: { year: number; week: number } | undefined;
  if (status === 'planned') {
    plannedWeek = due;
  } else {
    plannedWeek = due;
    // Executed close to planned (1-2 weeks earlier or same)
    const offset = Math.floor(r() * 3) - 1; // -1, 0, +1
    const exec = new Date(year, month, Math.min(28, Math.max(1, dayInMonth + offset * 7)));
    executedWeek = isoWeek(exec);
  }

  const compliance = COMPLIANCE_VALUES[Math.floor(r() * COMPLIANCE_VALUES.length)];

  // Observations: 0-2 items
  const observations: ServiceOrderObservation[] = [];
  const obsCount = r() < 0.45 ? (r() < 0.6 ? 1 : 2) : 0;
  for (let i = 0; i < obsCount; i++) {
    const followUpStatus: ServiceOrderObservation['followUpStatus'] =
      r() < 0.5 ? 'pending' : r() < 0.7 ? 'open' : 'closed';
    observations.push({
      title: OBSERVATION_TITLES[Math.floor(r() * OBSERVATION_TITLES.length)],
      followUpStatus,
      hasFollowUp: r() < 0.7,
      body: OBSERVATION_BODIES[Math.floor(r() * OBSERVATION_BODIES.length)],
    });
  }

  // Attachments: 1-3 items, more when executed
  const attachments: ServiceOrderAttachment[] = [];
  const attCount = status === 'executed'
    ? 1 + Math.floor(r() * 3)
    : 1 + (r() < 0.3 ? 1 : 0);
  for (let i = 0; i < attCount; i++) {
    const base = ATTACHMENT_NAMES[Math.floor(r() * ATTACHMENT_NAMES.length)];
    const datePart = `${year}${String(month + 1).padStart(2, '0')}${String(dayInMonth).padStart(2, '0')}`;
    attachments.push({
      name: `${datePart} ${base} ${installation.name}`,
      date: dueDate.toISOString().slice(0, 10),
    });
  }

  return {
    id,
    number,
    title: template.title,
    description: template.description,
    status,
    buildingId,
    buildingName,
    buildingCode: meta.buildingCode,
    workAddress: meta.workAddress,
    customerNumber: meta.customerNumber,
    installation,
    techniqueType: template.techniqueType,
    compliance,
    plannedWeek,
    executedWeek,
    observations,
    attachments,
    year,
    month,
  };
}

function generateLines(): ProcessOrderLocationLine[] {
  const allMonths = iterateMonths(
    PROCESS_ORDERS_MIN_MONTH.year,
    PROCESS_ORDERS_MIN_MONTH.month,
    PROCESS_ORDERS_MAX_MONTH.year,
    PROCESS_ORDERS_MAX_MONTH.month,
  );

  return buildings.map((b, bIdx) => {
    const r = rng(bIdx * 9973 + 17);
    const activity = 0.3 + r() * 0.7;
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
      if (isPast) plannedShare = r() < 0.85 ? 0 : 1 - r() * 0.4;
      else if (isCurrent) plannedShare = 0.3 + r() * 0.5;
      else plannedShare = r() < 0.9 ? 1 : 0.6 + r() * 0.4;

      const planned = Math.round(total * plannedShare);
      const executed = total - planned;

      const orders: ServiceOrder[] = [];
      for (let i = 0; i < total; i++) {
        const status: ProcessOrderStatus = i < planned ? 'planned' : 'executed';
        const number = String(1_000_000_000 + (bIdx * 100_000) + seq).padStart(12, '0');
        const dayInMonth = 1 + Math.floor(r() * 27);
        orders.push(buildServiceOrder({
          id: `so-${b.id}-${m.key}-${i}`,
          number,
          status,
          buildingId: b.id,
          buildingName: b.name,
          year: m.year,
          month: m.month,
          dayInMonth,
          r,
        }));
        seq += 1;
      }

      byMonth[m.key] = { planned, executed, orders };
    }

    return { buildingId: b.id, buildingName: b.name, byMonth };
  });
}

export const processOrderLines: ProcessOrderLocationLine[] = generateLines();

export const allServiceOrders: ServiceOrder[] = processOrderLines.flatMap(l =>
  Object.values(l.byMonth).flatMap(cell => cell.orders),
);

export function getServiceOrderById(id: string): ServiceOrder | undefined {
  return allServiceOrders.find(o => o.id === id);
}
