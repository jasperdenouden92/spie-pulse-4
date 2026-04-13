import { locations } from './locations';

const BUILDING_TYPES = ['office', 'tech', 'retail', 'mixed', 'civic'];

function configRng(seed: number): () => number {
  let s = seed ^ 0xDEADBEEF;
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
  s = Math.imul(s ^ (s >>> 13), 0x45d9f3b);
  s = (s ^ (s >>> 16)) >>> 0;
  if (s === 0) s = 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };
}

function getZonesForFloor(floorNum: number, buildingType: string): string[] {
  if (floorNum === 1) return ['Main Area'];
  if (buildingType === 'tech') return ['Open Plan', 'Labs'];
  return ['North Wing', 'South Wing', 'East Wing', 'West Wing'].slice(0, 2 + (floorNum % 2));
}

function getAssetCount(floorNum: number): number {
  let count = 2;
  if (floorNum % 2 === 0 || floorNum === 1) count++;
  if (floorNum % 3 === 0 || floorNum === 1) count++;
  return count;
}

export interface Zone {
  id: string;
  name: string;
  buildingName: string;
  buildingCity: string;
  buildingGroup: string;
  buildingTenant: string;
  floor: string;
  floorNumber: number;
  assetCount: number;
  buildingType: string;
}

let zoneCounter = 0;

export const zones: Zone[] = locations.flatMap((loc, i) => {
  const rng = configRng(i * 43 + 7);
  const floors = Math.floor(rng() * 12) + 2;
  const buildingType = BUILDING_TYPES[Math.floor(rng() * BUILDING_TYPES.length)];
  const result: Zone[] = [];

  for (let f = 1; f <= floors; f++) {
    const floorLabel =
      f === 1 ? 'Floor 1 \u2014 Lobby' :
      f === floors ? `Floor ${f} \u2014 ${buildingType === 'office' ? 'Executive' : 'Top Floor'}` :
      `Floor ${f}`;
    const zoneNames = getZonesForFloor(f, buildingType);
    const assetCount = getAssetCount(f);

    for (const zoneName of zoneNames) {
      zoneCounter++;
      result.push({
        id: `z-${String(zoneCounter).padStart(4, '0')}`,
        name: zoneName,
        buildingName: loc.name,
        buildingCity: loc.city,
        buildingGroup: loc.group,
        buildingTenant: loc.tenant,
        floor: floorLabel,
        floorNumber: f,
        assetCount,
        buildingType,
      });
    }
  }

  return result;
});

export const ZONE_COLORS: Record<string, string> = {
  'Main Area':  '#0d9488',
  'North Wing': '#0284c7',
  'South Wing': '#16a34a',
  'East Wing':  '#d97706',
  'West Wing':  '#7c3aed',
  'Open Plan':  '#0891b2',
  'Labs':       '#4f46e5',
};

export function getZoneColor(name: string): string {
  return ZONE_COLORS[name] ?? '#6b7280';
}
