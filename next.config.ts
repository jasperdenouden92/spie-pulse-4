import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      // Legacy ?page= query-param redirects
      { source: '/', has: [{ type: 'query', key: 'page', value: 'home' }], destination: '/home', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'page', value: 'portfolio' }], destination: '/control-room', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'page', value: 'portfolio_buildings' }], destination: '/portfolio/buildings', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'page', value: 'portfolio_zones' }], destination: '/portfolio/assets?groupBy=zone', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'page', value: 'portfolio_assets' }], destination: '/portfolio/assets', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'page', value: 'insights' }], destination: '/insights/alerts', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'page', value: 'insights_alerts' }], destination: '/insights/alerts', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'page', value: 'insights_analyses' }], destination: '/insights/analyses', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'page', value: 'insights_performance' }], destination: '/insights/performance', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'page', value: 'bms' }], destination: '/bms/access', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'page', value: 'bms_access' }], destination: '/bms/access', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'page', value: 'bms_logging' }], destination: '/bms/logging', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'page', value: 'operations' }], destination: '/operations', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'page', value: 'operations_tickets' }], destination: '/operations/tickets', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'page', value: 'operations_quotations' }], destination: '/operations/quotations', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'page', value: 'operations_docs' }], destination: '/operations/documents', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'page', value: 'operations_maintenance' }], destination: '/operations/maintenance', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'page', value: 'dashboards' }], destination: '/dashboards', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'page', value: 'exports' }], destination: '/exports', permanent: true },
    ];
  },
};

export default nextConfig;
