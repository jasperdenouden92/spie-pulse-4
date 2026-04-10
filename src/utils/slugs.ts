import { buildings as allBuildings, type Building } from '@/data/buildings';

/** Convert a building name to a URL-safe slug. */
export function buildingToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Find a building by its slug. */
export function slugToBuilding(slug: string): Building | undefined {
  return allBuildings.find(b => buildingToSlug(b.name) === slug);
}
