// Data generation utilities for creating realistic mock data

// Seeded PRNG (mulberry32) — ensures server and client produce identical values
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export const seededRandom = mulberry32(42);

export const STAFF_POOL = [
  'John Smith',
  'Marie Johnson',
  'Tom Anderson',
  'Lisa Chen',
  'Robert Williams',
  'David Park',
  'Sarah Martinez',
  'Michael Lee',
  'Emily Rodriguez',
  'James Wilson',
  'Jennifer Brown',
  'Daniel Taylor',
  'Patricia Garcia',
  'Christopher Moore',
  'Nancy White',
  'Matthew Harris'
];

import { locations } from './locations';

// Use all location names as the building pool
export const BUILDING_POOL = locations.map(l => l.name);

export const VENDOR_POOL = [
  'Climate Control Systems',
  'Bright Future Electrical',
  'ProFlow Plumbing Services',
  'SecureTech Solutions',
  'RoofMaster Pro',
  'Vertical Solutions Inc',
  'Green Spaces Landscaping',
  'TechServe Maintenance',
  'Elite Building Services',
  'SafeGuard Fire Protection',
  'EcoClean Solutions',
  'PowerGrid Electrical',
  'AquaPure Plumbing',
  'SkyLift Elevator Services',
  'BuildRight Construction',
  'SmartBuild Automation',
  'CleanSweep Janitorial',
  'Guardian Security Systems',
  'Premier HVAC',
  'Advanced Facilities Management'
];

/**
 * Generates a random date between start and end dates
 */
export function randomDate(start: Date, end: Date): string {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + seededRandom() * (endTime - startTime);
  const date = new Date(randomTime);

  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
}

/**
 * Returns a random element from an array
 */
export function randomFromArray<T>(array: T[]): T {
  return array[Math.floor(seededRandom() * array.length)];
}

/**
 * Generates a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}

/**
 * Generates a random amount within a range
 */
export function randomAmount(min: number, max: number): number {
  return Math.round((seededRandom() * (max - min) + min) / 100) * 100; // Round to nearest 100
}

/**
 * Returns a weighted random selection
 */
export function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = seededRandom() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

/**
 * Formats a number with leading zeros
 */
export function padNumber(num: number, length: number): string {
  return String(num).padStart(length, '0');
}

/**
 * Adds days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Generates a random decimal between min and max
 */
export function randomDecimal(min: number, max: number, decimals: number = 1): number {
  const value = seededRandom() * (max - min) + min;
  return Number(value.toFixed(decimals));
}
