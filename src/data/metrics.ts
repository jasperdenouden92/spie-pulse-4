export interface MetricData {
  title: string;
  score: number;
  trend: number;
  sparklineData: number[];
}

export const overallMetrics = {
  score: 79,
  trend: 8
};

// Theme KPIs (first 3 are primary, next 6 are expanded)
export const themeMetrics: MetricData[] = [
  {
    title: 'Sustainability',
    score: 85,
    trend: 12,
    sparklineData: [65, 63, 68, 72, 70, 75, 78, 82, 84, 85]
  },
  {
    title: 'Comfort',
    score: 92,
    trend: 5,
    sparklineData: [88, 90, 95, 93, 96, 94, 92, 91, 93, 92]
  },
  {
    title: 'Asset Monitoring',
    score: 78,
    trend: -3,
    sparklineData: [85, 83, 82, 84, 81, 80, 82, 79, 80, 78]
  },
];

// Additional theme KPIs (revealed by "Show more themes")
export const expandedThemeMetrics: MetricData[] = [
  {
    title: 'Energy',
    score: 81,
    trend: 9,
    sparklineData: [70, 68, 72, 75, 73, 77, 79, 78, 80, 81]
  },
  {
    title: 'Workspace',
    score: 74,
    trend: -4,
    sparklineData: [82, 79, 81, 78, 76, 77, 75, 76, 75, 74]
  },
  {
    title: 'Compliance',
    score: 88,
    trend: 6,
    sparklineData: [75, 78, 82, 80, 85, 83, 87, 85, 88, 88]
  },
  {
    title: 'Water Management',
    score: 71,
    trend: -5,
    sparklineData: [78, 77, 75, 76, 74, 73, 75, 72, 72, 71]
  },
  {
    title: 'Security Systems',
    score: 83,
    trend: 11,
    sparklineData: [72, 73, 71, 75, 78, 77, 80, 81, 82, 83]
  },
  {
    title: 'Access Control',
    score: 77,
    trend: 7,
    sparklineData: [68, 70, 73, 72, 75, 74, 76, 75, 76, 77]
  },
];

// Operations KPIs
export const operationsMetrics: MetricData[] = [
  {
    title: 'Work Orders',
    score: 88,
    trend: 15,
    sparklineData: [78, 80, 83, 81, 85, 84, 87, 86, 88, 88]
  },
  {
    title: 'Quotations',
    score: 73,
    trend: -6,
    sparklineData: [80, 78, 79, 76, 77, 75, 76, 74, 74, 73]
  },
  {
    title: 'Maintenance',
    score: 91,
    trend: 22,
    sparklineData: [70, 74, 78, 76, 82, 85, 83, 88, 90, 91]
  }
];

// Combined for backwards compatibility
export const kpiMetrics: MetricData[] = [
  ...themeMetrics,
  ...operationsMetrics
];
