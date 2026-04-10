import { buildings as allBuildings, type Building } from '@/data/buildings';

/** Get the URL identifier for a building (its ID). */
export function buildingToSlug(building: Building | string): string {
  if (typeof building === 'string') {
    // Legacy: accept a name and find the building
    const b = allBuildings.find(b => b.name === building);
    return b?.id ?? '';
  }
  return building.id;
}

/** Find a building by its URL identifier (ID). */
export function slugToBuilding(slug: string): Building | undefined {
  return allBuildings.find(b => b.id === slug);
}
