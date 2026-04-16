export interface Insight {
  id: string;
  assetName: string;
  assetType: 'Building' | 'HVAC' | 'Elevator' | 'Electrical' | 'Plumbing' | 'Fire Safety';
  building: string;
  insightType: 'opportunity' | 'warning' | 'info' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
  /** Mock follow-up flag: true when a ticket/workorder has been created for this observation. */
  hasFollowUp?: boolean;
}

export const insights: Insight[] = [
  {
    id: '1',
    assetName: 'Skyline Plaza',
    assetType: 'Building',
    building: 'Skyline Plaza',
    insightType: 'opportunity',
    title: 'Energy consumption trending 15% below forecast',
    description: 'Recent optimizations to HVAC systems are showing measurable impact on overall building energy usage. Consider applying similar changes to other buildings.',
    impact: 'high',
    timestamp: '2 hours ago',
    hasFollowUp: true,
  },
  {
    id: '2',
    assetName: 'Chiller Unit 02',
    assetType: 'HVAC',
    building: 'Innovation Hub',
    insightType: 'warning',
    title: 'Unusual vibration patterns detected',
    description: 'IoT sensors indicate vibration levels 20% above normal. Recommend inspection to prevent potential failure.',
    impact: 'high',
    timestamp: '5 hours ago',
    hasFollowUp: false,
  },
  {
    id: '3',
    assetName: 'Main Electrical Panel A',
    assetType: 'Electrical',
    building: 'Metro Heights',
    insightType: 'info',
    title: 'Load balancing opportunity identified',
    description: 'Circuit analysis shows uneven distribution across phases. Rebalancing could improve efficiency by 8%.',
    impact: 'medium',
    timestamp: 'Yesterday',
    hasFollowUp: false,
  },
  {
    id: '4',
    assetName: 'Elevator Bank 3',
    assetType: 'Elevator',
    building: 'Skyline Plaza',
    insightType: 'recommendation',
    title: 'Maintenance schedule optimization available',
    description: 'Usage patterns suggest shifting preventive maintenance to off-peak hours could reduce tenant impact by 40%.',
    impact: 'low',
    timestamp: '2 days ago',
    hasFollowUp: true,
  },
  {
    id: '5',
    assetName: 'Fire Suppression System',
    assetType: 'Fire Safety',
    building: 'Riverside Complex',
    insightType: 'warning',
    title: 'Inspection certification expiring soon',
    description: 'Annual fire safety inspection certificate expires in 14 days. Schedule inspection to maintain compliance.',
    impact: 'high',
    timestamp: '3 days ago',
    hasFollowUp: false,
  },
  {
    id: '6',
    assetName: 'Domestic Water Pumps',
    assetType: 'Plumbing',
    building: 'Gateway Center',
    insightType: 'opportunity',
    title: 'Water pressure optimization reducing wear',
    description: 'Recent pressure adjustments have decreased pump cycling by 30%, extending expected equipment life.',
    impact: 'medium',
    timestamp: '4 days ago',
    hasFollowUp: true,
  },
  {
    id: '7',
    assetName: 'Innovation Hub',
    assetType: 'Building',
    building: 'Innovation Hub',
    insightType: 'info',
    title: 'Tenant satisfaction scores increased',
    description: 'Recent facility improvements correlate with 12% increase in tenant comfort ratings.',
    impact: 'medium',
    timestamp: '5 days ago',
    hasFollowUp: true,
  },
  {
    id: '8',
    assetName: 'Rooftop HVAC Unit 5',
    assetType: 'HVAC',
    building: 'Metro Heights',
    insightType: 'recommendation',
    title: 'Filter replacement ahead of schedule',
    description: 'Air quality monitoring suggests filter replacement 2 weeks earlier than scheduled could improve efficiency by 12%.',
    impact: 'low',
    timestamp: '1 week ago',
    hasFollowUp: false,
  },
];
