// Data generation utilities for creating realistic mock data

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

export const BUILDING_POOL = [
  'Skyline Plaza',
  'Urban Tower',
  'Metro Heights',
  'Innovation Hub',
  'Riverside Complex',
  'Gateway Center',
  'Parkside Office',
  'Harbor Point',
  'Crystal Tower',
  'Green Park Office',
  'Sunset Plaza',
  'Metro Central'
];

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
  const randomTime = startTime + Math.random() * (endTime - startTime);
  const date = new Date(randomTime);

  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
}

/**
 * Returns a random element from an array
 */
export function randomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generates a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random amount within a range
 */
export function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) / 100) * 100; // Round to nearest 100
}

/**
 * Returns a weighted random selection
 */
export function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;

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
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}
