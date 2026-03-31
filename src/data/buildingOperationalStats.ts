import { locations } from './locations';

// Operational statistics for each building
export interface BuildingOperationalStats {
  sustainability: {
    alerts: number;
    weiiRating: string;
  };
  comfort: {
    alerts: number;
  };
  assetMonitoring: {
    alerts: number;
  };
  tickets: {
    count: number;
    outstanding: number; // in euros
  };
  quotations: {
    count: number;
    due: number;
    overdue: number;
    totalAmount: number; // in euros
  };
  maintenance: {
    scheduled: number;
    overdue: number;
    completed: number;
  };
}

// Seeded RNG for deterministic stats
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

const weiiRatings = ['A+', 'A', 'A', 'B+', 'B', 'B', 'C', 'D'];

function generateStats(seed: number): BuildingOperationalStats {
  const rng = createSeededRng(seed);
  const ri = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;

  const sustainAlerts = ri(0, 12);
  const ratingIdx = Math.min(Math.floor(sustainAlerts / 1.5), weiiRatings.length - 1);

  const ticketCount = ri(3, 25);
  const quotCount = ri(2, 19);
  const quotDue = ri(0, Math.floor(quotCount * 0.5));
  const quotOverdue = ri(0, Math.floor(quotCount * 0.4));
  const scheduled = ri(5, 32);
  const overdue = ri(0, Math.floor(scheduled * 0.3));

  return {
    sustainability: { alerts: sustainAlerts, weiiRating: weiiRatings[ratingIdx] },
    comfort: { alerts: ri(1, 14) },
    assetMonitoring: { alerts: ri(2, 16) },
    tickets: { count: ticketCount, outstanding: ri(1500, 17000) },
    quotations: { count: quotCount, due: quotDue, overdue: quotOverdue, totalAmount: ri(9000, 53000) },
    maintenance: { scheduled, overdue, completed: ri(18, 65) },
  };
}

export const buildingOperationalStats: Record<string, BuildingOperationalStats> = Object.fromEntries(
  locations.map((loc, i) => [loc.name, generateStats(i * 71 + 23)])
);

// Helper to format currency
export function formatCurrency(amount: number): string {
  return `€ ${amount.toLocaleString('en-US')}`;
}
