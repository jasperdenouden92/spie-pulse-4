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
  workOrders: {
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

export const buildingOperationalStats: Record<string, BuildingOperationalStats> = {
  'Skyline Plaza': {
    sustainability: { alerts: 3, weiiRating: 'A' },
    comfort: { alerts: 5 },
    assetMonitoring: { alerts: 7 },
    workOrders: { count: 12, outstanding: 6813 },
    quotations: { count: 8, due: 3, overdue: 2, totalAmount: 24500 },
    maintenance: { scheduled: 18, overdue: 3, completed: 45 }
  },
  'Innovation Hub': {
    sustainability: { alerts: 2, weiiRating: 'A+' },
    comfort: { alerts: 3 },
    assetMonitoring: { alerts: 4 },
    workOrders: { count: 8, outstanding: 4250 },
    quotations: { count: 5, due: 2, overdue: 1, totalAmount: 18200 },
    maintenance: { scheduled: 15, overdue: 2, completed: 38 }
  },
  'Metro Heights': {
    sustainability: { alerts: 6, weiiRating: 'B' },
    comfort: { alerts: 8 },
    assetMonitoring: { alerts: 12 },
    workOrders: { count: 15, outstanding: 9120 },
    quotations: { count: 11, due: 5, overdue: 3, totalAmount: 32400 },
    maintenance: { scheduled: 22, overdue: 5, completed: 52 }
  },
  'Riverside Complex': {
    sustainability: { alerts: 4, weiiRating: 'A' },
    comfort: { alerts: 6 },
    assetMonitoring: { alerts: 8 },
    workOrders: { count: 10, outstanding: 5675 },
    quotations: { count: 7, due: 3, overdue: 1, totalAmount: 21800 },
    maintenance: { scheduled: 20, overdue: 4, completed: 48 }
  },
  'Gateway Center': {
    sustainability: { alerts: 8, weiiRating: 'C' },
    comfort: { alerts: 10 },
    assetMonitoring: { alerts: 15 },
    workOrders: { count: 18, outstanding: 11250 },
    quotations: { count: 13, due: 6, overdue: 4, totalAmount: 38900 },
    maintenance: { scheduled: 25, overdue: 6, completed: 60 }
  },
  'Harbor View': {
    sustainability: { alerts: 1, weiiRating: 'A+' },
    comfort: { alerts: 2 },
    assetMonitoring: { alerts: 3 },
    workOrders: { count: 7, outstanding: 3890 },
    quotations: { count: 4, due: 1, overdue: 1, totalAmount: 15600 },
    maintenance: { scheduled: 12, overdue: 2, completed: 35 }
  },
  'Tech District Tower': {
    sustainability: { alerts: 5, weiiRating: 'B+' },
    comfort: { alerts: 7 },
    assetMonitoring: { alerts: 9 },
    workOrders: { count: 14, outstanding: 7950 },
    quotations: { count: 9, due: 4, overdue: 2, totalAmount: 27300 },
    maintenance: { scheduled: 19, overdue: 3, completed: 47 }
  },
  'Central Plaza': {
    sustainability: { alerts: 4, weiiRating: 'A' },
    comfort: { alerts: 5 },
    assetMonitoring: { alerts: 6 },
    workOrders: { count: 11, outstanding: 6200 },
    quotations: { count: 6, due: 2, overdue: 2, totalAmount: 19500 },
    maintenance: { scheduled: 16, overdue: 3, completed: 42 }
  },
  'Harmony Estates': {
    sustainability: { alerts: 2, weiiRating: 'A+' },
    comfort: { alerts: 3 },
    assetMonitoring: { alerts: 5 },
    workOrders: { count: 6, outstanding: 3200 },
    quotations: { count: 4, due: 1, overdue: 1, totalAmount: 14500 },
    maintenance: { scheduled: 10, overdue: 1, completed: 28 }
  },
  'Atrium Towers': {
    sustainability: { alerts: 7, weiiRating: 'C' },
    comfort: { alerts: 9 },
    assetMonitoring: { alerts: 11 },
    workOrders: { count: 16, outstanding: 10500 },
    quotations: { count: 12, due: 5, overdue: 4, totalAmount: 35600 },
    maintenance: { scheduled: 23, overdue: 5, completed: 50 }
  },
  'Civic Center': {
    sustainability: { alerts: 5, weiiRating: 'B+' },
    comfort: { alerts: 6 },
    assetMonitoring: { alerts: 7 },
    workOrders: { count: 9, outstanding: 4800 },
    quotations: { count: 7, due: 3, overdue: 2, totalAmount: 22400 },
    maintenance: { scheduled: 14, overdue: 2, completed: 40 }
  },
  'Harbor Point': {
    sustainability: { alerts: 2, weiiRating: 'A' },
    comfort: { alerts: 3 },
    assetMonitoring: { alerts: 4 },
    workOrders: { count: 6, outstanding: 3400 },
    quotations: { count: 5, due: 2, overdue: 1, totalAmount: 18200 },
    maintenance: { scheduled: 11, overdue: 1, completed: 32 }
  },
  'Crystal Tower': {
    sustainability: { alerts: 4, weiiRating: 'B+' },
    comfort: { alerts: 5 },
    assetMonitoring: { alerts: 6 },
    workOrders: { count: 10, outstanding: 5500 },
    quotations: { count: 8, due: 3, overdue: 2, totalAmount: 24800 },
    maintenance: { scheduled: 15, overdue: 2, completed: 42 }
  },
  'Green Park Office': {
    sustainability: { alerts: 1, weiiRating: 'A+' },
    comfort: { alerts: 1 },
    assetMonitoring: { alerts: 2 },
    workOrders: { count: 4, outstanding: 2100 },
    quotations: { count: 3, due: 1, overdue: 0, totalAmount: 12300 },
    maintenance: { scheduled: 8, overdue: 0, completed: 25 }
  },
  'Sunset Plaza': {
    sustainability: { alerts: 9, weiiRating: 'C' },
    comfort: { alerts: 11 },
    assetMonitoring: { alerts: 14 },
    workOrders: { count: 20, outstanding: 13200 },
    quotations: { count: 15, due: 7, overdue: 5, totalAmount: 42500 },
    maintenance: { scheduled: 28, overdue: 7, completed: 55 }
  },
  'Metro Central': {
    sustainability: { alerts: 3, weiiRating: 'A' },
    comfort: { alerts: 4 },
    assetMonitoring: { alerts: 5 },
    workOrders: { count: 9, outstanding: 4950 },
    quotations: { count: 7, due: 3, overdue: 2, totalAmount: 23100 },
    maintenance: { scheduled: 14, overdue: 2, completed: 38 }
  },
  'North Star': {
    sustainability: { alerts: 1, weiiRating: 'A+' },
    comfort: { alerts: 1 },
    assetMonitoring: { alerts: 2 },
    workOrders: { count: 3, outstanding: 1800 },
    quotations: { count: 2, due: 1, overdue: 0, totalAmount: 10500 },
    maintenance: { scheduled: 6, overdue: 0, completed: 20 }
  },
  'Gateway Plaza': {
    sustainability: { alerts: 6, weiiRating: 'B' },
    comfort: { alerts: 7 },
    assetMonitoring: { alerts: 8 },
    workOrders: { count: 13, outstanding: 7800 },
    quotations: { count: 10, due: 4, overdue: 3, totalAmount: 29400 },
    maintenance: { scheduled: 18, overdue: 4, completed: 45 }
  },
  'Tech Park East': {
    sustainability: { alerts: 3, weiiRating: 'A' },
    comfort: { alerts: 4 },
    assetMonitoring: { alerts: 5 },
    workOrders: { count: 8, outstanding: 4300 },
    quotations: { count: 6, due: 2, overdue: 1, totalAmount: 20100 },
    maintenance: { scheduled: 13, overdue: 2, completed: 36 }
  },
  'Crown Heights': {
    sustainability: { alerts: 10, weiiRating: 'D' },
    comfort: { alerts: 12 },
    assetMonitoring: { alerts: 15 },
    workOrders: { count: 22, outstanding: 14800 },
    quotations: { count: 17, due: 8, overdue: 6, totalAmount: 48200 },
    maintenance: { scheduled: 30, overdue: 8, completed: 58 }
  },
  'Liberty Square': {
    sustainability: { alerts: 3, weiiRating: 'A' },
    comfort: { alerts: 4 },
    assetMonitoring: { alerts: 5 },
    workOrders: { count: 9, outstanding: 5100 },
    quotations: { count: 5, due: 2, overdue: 1, totalAmount: 19800 },
    maintenance: { scheduled: 14, overdue: 2, completed: 39 }
  },
  'Pinnacle Tower': {
    sustainability: { alerts: 2, weiiRating: 'A' },
    comfort: { alerts: 2 },
    assetMonitoring: { alerts: 3 },
    workOrders: { count: 5, outstanding: 2800 },
    quotations: { count: 4, due: 1, overdue: 1, totalAmount: 15400 },
    maintenance: { scheduled: 9, overdue: 1, completed: 28 }
  },
  'Heritage Building': {
    sustainability: { alerts: 11, weiiRating: 'D' },
    comfort: { alerts: 13 },
    assetMonitoring: { alerts: 16 },
    workOrders: { count: 24, outstanding: 16500 },
    quotations: { count: 19, due: 9, overdue: 7, totalAmount: 52400 },
    maintenance: { scheduled: 32, overdue: 9, completed: 62 }
  },
  'Modern Canvas': {
    sustainability: { alerts: 3, weiiRating: 'A' },
    comfort: { alerts: 4 },
    assetMonitoring: { alerts: 5 },
    workOrders: { count: 8, outstanding: 4500 },
    quotations: { count: 6, due: 3, overdue: 1, totalAmount: 21200 },
    maintenance: { scheduled: 12, overdue: 2, completed: 35 }
  },
  'Velocity Center': {
    sustainability: { alerts: 1, weiiRating: 'A+' },
    comfort: { alerts: 1 },
    assetMonitoring: { alerts: 2 },
    workOrders: { count: 3, outstanding: 1600 },
    quotations: { count: 2, due: 0, overdue: 0, totalAmount: 9800 },
    maintenance: { scheduled: 5, overdue: 0, completed: 18 }
  },
  'Zenith Plaza': {
    sustainability: { alerts: 3, weiiRating: 'A' },
    comfort: { alerts: 4 },
    assetMonitoring: { alerts: 5 },
    workOrders: { count: 9, outstanding: 5200 },
    quotations: { count: 7, due: 3, overdue: 2, totalAmount: 23600 },
    maintenance: { scheduled: 14, overdue: 2, completed: 40 }
  },
  'Eclipse Tower': {
    sustainability: { alerts: 5, weiiRating: 'B+' },
    comfort: { alerts: 6 },
    assetMonitoring: { alerts: 7 },
    workOrders: { count: 11, outstanding: 6400 },
    quotations: { count: 8, due: 4, overdue: 2, totalAmount: 26700 },
    maintenance: { scheduled: 16, overdue: 3, completed: 43 }
  },
  'Aurora Office': {
    sustainability: { alerts: 4, weiiRating: 'B+' },
    comfort: { alerts: 5 },
    assetMonitoring: { alerts: 6 },
    workOrders: { count: 10, outstanding: 5600 },
    quotations: { count: 7, due: 3, overdue: 2, totalAmount: 24200 },
    maintenance: { scheduled: 15, overdue: 2, completed: 41 }
  },
  'Nexus Building': {
    sustainability: { alerts: 2, weiiRating: 'A' },
    comfort: { alerts: 3 },
    assetMonitoring: { alerts: 4 },
    workOrders: { count: 7, outstanding: 3700 },
    quotations: { count: 5, due: 2, overdue: 1, totalAmount: 18900 },
    maintenance: { scheduled: 11, overdue: 1, completed: 33 }
  },
  'Vertex Square': {
    sustainability: { alerts: 8, weiiRating: 'C' },
    comfort: { alerts: 9 },
    assetMonitoring: { alerts: 12 },
    workOrders: { count: 17, outstanding: 11800 },
    quotations: { count: 13, due: 6, overdue: 4, totalAmount: 38200 },
    maintenance: { scheduled: 24, overdue: 6, completed: 52 }
  },
  'Prism Complex': {
    sustainability: { alerts: 2, weiiRating: 'A+' },
    comfort: { alerts: 2 },
    assetMonitoring: { alerts: 3 },
    workOrders: { count: 5, outstanding: 2600 },
    quotations: { count: 4, due: 1, overdue: 1, totalAmount: 14800 },
    maintenance: { scheduled: 9, overdue: 1, completed: 26 }
  }
};

// Helper to format currency
export function formatCurrency(amount: number): string {
  return `€ ${amount.toLocaleString('en-US')}`;
}
