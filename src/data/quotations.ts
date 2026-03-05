import { randomFromArray, randomDate, randomAmount, weightedRandom, padNumber, addDays, randomInt, STAFF_POOL, BUILDING_POOL, VENDOR_POOL } from './generators';

export interface Quotation {
  id: string;
  title: string;
  building: string;
  amount: number;
  currency: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Expired';
  category: string;
  vendor: string;
  requestedBy: string;
  createdDate: string;
  validUntil: string;
  approvedDate?: string;
  description: string;
  items: { name: string; quantity: number; unitPrice: number }[];
}

// Categories for quotations
const CATEGORIES = [
  'HVAC',
  'Electrical',
  'Plumbing',
  'Security',
  'Building Envelope',
  'Vertical Transportation',
  'Grounds Maintenance',
  'Furniture',
  'IT Equipment',
  'Cleaning Services',
  'Waste Management',
  'Fire Protection'
];

// Quotation templates
const QUOTATION_TEMPLATES: Record<string, { titles: string[], items: string[][] }> = {
  HVAC: {
    titles: ['Annual HVAC Maintenance Contract', 'Cooling System Upgrade', 'Air Quality Improvement Project', 'HVAC Replacement - Floor {floor}'],
    items: [
      ['System Inspection', 'Filter Replacement', 'Emergency Call-out Coverage'],
      ['Equipment Purchase', 'Installation Labor', 'System Integration'],
      ['Air Purification Units', 'Installation', 'Annual Maintenance'],
      ['HVAC Units', 'Ductwork', 'Installation Labor', 'System Testing']
    ]
  },
  Electrical: {
    titles: ['LED Lighting Upgrade - Floors {floor}-{floor2}', 'Emergency Power System Installation', 'Electrical Panel Modernization', 'Building-wide Circuit Upgrade'],
    items: [
      ['LED Fixtures', 'Installation Labor', 'Disposal of Old Fixtures'],
      ['Generator Equipment', 'Transfer Switch', 'Installation', 'Testing & Commissioning'],
      ['Electrical Panels', 'Circuit Breakers', 'Labor', 'Inspection & Certification'],
      ['Wiring Materials', 'Circuit Breakers', 'Labor', 'Code Compliance Review']
    ]
  },
  Plumbing: {
    titles: ['Plumbing System Overhaul', 'Water Heater Replacement Program', 'Pipe Infrastructure Upgrade', 'Backflow Prevention System'],
    items: [
      ['Pipe Replacement', 'Fixture Upgrades', 'Labor & Project Management'],
      ['Water Heaters', 'Installation', 'Old Unit Removal & Disposal'],
      ['Piping Materials', 'Valves & Fittings', 'Installation Labor', 'Pressure Testing'],
      ['Backflow Preventers', 'Installation', 'Annual Testing Service']
    ]
  },
  Security: {
    titles: ['Building Security System Upgrade', 'Access Control Modernization', 'Surveillance Camera Installation', 'Integrated Security Platform'],
    items: [
      ['IP Cameras', 'Access Control Hardware', 'System Integration & Programming'],
      ['Card Readers', 'Electronic Locks', 'Control Panel', 'Installation & Configuration'],
      ['HD Cameras', 'NVR System', 'Cabling', 'Installation'],
      ['Security Platform License', 'Hardware', 'Implementation', 'Training']
    ]
  },
  'Building Envelope': {
    titles: ['Roof Waterproofing Repair', 'Window Replacement Project', 'Facade Restoration', 'Weatherproofing Upgrade'],
    items: [
      ['Waterproofing Membrane', 'Structural Repairs', 'Labor'],
      ['Energy-Efficient Windows', 'Installation', 'Old Window Removal'],
      ['Cleaning & Repair', 'Sealant Application', 'Painting', 'Scaffolding Rental'],
      ['Weatherstripping', 'Caulking Materials', 'Labor', 'Inspection']
    ]
  },
  'Vertical Transportation': {
    titles: ['Elevator Modernization Package', 'Escalator Refurbishment', 'Elevator Control System Upgrade', 'Lift Cab Interior Renovation'],
    items: [
      ['Control System Upgrade', 'Cab Interior Renovation', 'Safety System Modernization'],
      ['Mechanical Components', 'Step Replacement', 'Safety System Update', 'Labor'],
      ['Controller Hardware', 'Software Licensing', 'Installation', 'Programming'],
      ['Interior Finishes', 'Lighting Upgrade', 'Handrail Replacement', 'Installation']
    ]
  },
  'Grounds Maintenance': {
    titles: ['Annual Landscaping Service', 'Irrigation System Installation', 'Tree Care Program', 'Snow Removal Contract'],
    items: [
      ['Monthly Lawn Care', 'Seasonal Planting', 'Snow Removal (Winter)'],
      ['Sprinkler System', 'Control Panel', 'Installation', 'System Programming'],
      ['Tree Trimming & Pruning', 'Disease Treatment', 'Fertilization'],
      ['Snow Plowing', 'Salt & Ice Melt', 'Sidewalk Clearing']
    ]
  },
  Furniture: {
    titles: ['Office Furniture Refresh', 'Conference Room Furnishing', 'Lobby Seating Upgrade', 'Workstation Reconfiguration'],
    items: [
      ['Desks', 'Chairs', 'Storage Units', 'Delivery & Assembly'],
      ['Conference Table', 'Chairs', 'AV Credenza', 'Installation'],
      ['Seating', 'Coffee Tables', 'Accent Pieces', 'Delivery'],
      ['Modular Workstations', 'Task Chairs', 'Cable Management', 'Installation']
    ]
  },
  'IT Equipment': {
    titles: ['Server Room Equipment Upgrade', 'Network Infrastructure Modernization', 'Workstation Computer Replacement', 'AV System Installation'],
    items: [
      ['Server Hardware', 'UPS Systems', 'Rack Equipment', 'Installation & Configuration'],
      ['Network Switches', 'Access Points', 'Cabling', 'Installation'],
      ['Desktop Computers', 'Monitors', 'Peripherals', 'Setup & Deployment'],
      ['Projectors', 'Screens', 'Control Systems', 'Installation & Programming']
    ]
  },
  'Cleaning Services': {
    titles: ['Janitorial Services Contract', 'Deep Cleaning Project', 'Window Cleaning Service', 'Carpet Cleaning & Maintenance'],
    items: [
      ['Daily Cleaning Service', 'Supplies', 'Waste Management'],
      ['Comprehensive Cleaning', 'Equipment', 'Specialized Treatments'],
      ['Exterior Window Cleaning', 'Interior Window Cleaning', 'Equipment Rental'],
      ['Steam Cleaning', 'Stain Treatment', 'Protection Application']
    ]
  },
  'Waste Management': {
    titles: ['Waste Disposal Services Contract', 'Recycling Program Implementation', 'E-Waste Disposal Service', 'Hazardous Waste Removal'],
    items: [
      ['Weekly Pickup', 'Bin Rental', 'Disposal Fees'],
      ['Recycling Bins', 'Training Materials', 'Monthly Collection Service'],
      ['Electronics Collection', 'Data Destruction', 'Proper Disposal'],
      ['Collection & Transportation', 'Disposal Fee', 'Documentation']
    ]
  },
  'Fire Protection': {
    titles: ['Fire Suppression System Upgrade', 'Fire Alarm Modernization', 'Sprinkler System Installation', 'Emergency Lighting Upgrade'],
    items: [
      ['Suppression Equipment', 'Control Panel', 'Installation', 'Testing & Certification'],
      ['Alarm Panels', 'Smoke Detectors', 'Pull Stations', 'Installation'],
      ['Sprinkler Heads', 'Piping', 'Pump System', 'Installation & Testing'],
      ['Emergency Lights', 'Exit Signs', 'Battery Backup', 'Installation']
    ]
  }
};

// Generate quotations
function generateQuotations(): Quotation[] {
  const quotes: Quotation[] = [];
  const startDate = new Date('2023-07-01');
  const endDate = new Date('2024-01-23');

  for (let i = 8; i <= 150; i++) {
    const category = randomFromArray(CATEGORIES);
    const status = weightedRandom<Quotation['status']>(
      ['Draft', 'Pending', 'Approved', 'Rejected', 'Expired'],
      [15, 30, 35, 10, 10]
    );

    // Get templates for this category
    const templates = QUOTATION_TEMPLATES[category];
    let title = randomFromArray(templates.titles);
    title = title
      .replace('{floor}', String(randomInt(1, 10)))
      .replace('{floor2}', String(randomInt(11, 15)));

    const createdDate = randomDate(startDate, endDate);
    const createdDateObj = new Date(createdDate);
    const validUntil = addDays(createdDateObj, randomInt(30, 90)).toISOString().split('T')[0];

    // Generate line items
    const itemTemplate = randomFromArray(templates.items);
    const items = itemTemplate.map(itemName => ({
      name: itemName,
      quantity: randomInt(1, 50),
      unitPrice: randomAmount(50, 5000)
    }));

    const amount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    const quotation: Quotation = {
      id: `QUO-2024-${padNumber(i, 3)}`,
      title,
      building: randomFromArray(BUILDING_POOL),
      amount,
      currency: 'EUR',
      status,
      category,
      vendor: randomFromArray(VENDOR_POOL),
      requestedBy: randomFromArray(STAFF_POOL),
      createdDate,
      validUntil,
      description: `${title} - Comprehensive service quote`,
      items
    };

    // Add approval date for approved quotations
    if (status === 'Approved') {
      const approvedDaysOffset = randomInt(3, 20);
      quotation.approvedDate = addDays(createdDateObj, approvedDaysOffset).toISOString().split('T')[0];
    }

    quotes.push(quotation);
  }

  return quotes;
}

// Original 7 quotations
export const quotations: Quotation[] = [
  {
    id: 'QUO-2024-001',
    title: 'Annual HVAC Maintenance Contract',
    building: 'Skyline Plaza',
    amount: 45000,
    currency: 'EUR',
    status: 'Approved',
    category: 'HVAC',
    vendor: 'Climate Control Systems',
    requestedBy: 'John Smith',
    createdDate: '2024-01-05',
    validUntil: '2024-02-05',
    approvedDate: '2024-01-12',
    description: 'Comprehensive HVAC maintenance package for 2024',
    items: [
      { name: 'Quarterly System Inspection', quantity: 4, unitPrice: 5000 },
      { name: 'Filter Replacement', quantity: 12, unitPrice: 800 },
      { name: 'Emergency Call-out Coverage', quantity: 1, unitPrice: 15400 }
    ]
  },
  {
    id: 'QUO-2024-002',
    title: 'LED Lighting Upgrade - Floors 1-5',
    building: 'Urban Tower',
    amount: 32500,
    currency: 'EUR',
    status: 'Pending',
    category: 'Electrical',
    vendor: 'Bright Future Electrical',
    requestedBy: 'Marie Johnson',
    createdDate: '2024-01-18',
    validUntil: '2024-02-18',
    description: 'Complete LED lighting upgrade for energy efficiency',
    items: [
      { name: 'LED Fixtures', quantity: 250, unitPrice: 85 },
      { name: 'Installation Labor', quantity: 80, unitPrice: 95 },
      { name: 'Disposal of Old Fixtures', quantity: 1, unitPrice: 2750 }
    ]
  },
  {
    id: 'QUO-2024-003',
    title: 'Plumbing System Overhaul',
    building: 'Metro Heights',
    amount: 78000,
    currency: 'EUR',
    status: 'Draft',
    category: 'Plumbing',
    vendor: 'ProFlow Plumbing Services',
    requestedBy: 'Tom Anderson',
    createdDate: '2024-01-22',
    validUntil: '2024-03-22',
    description: 'Major plumbing infrastructure upgrades',
    items: [
      { name: 'Pipe Replacement', quantity: 1, unitPrice: 45000 },
      { name: 'Fixture Upgrades', quantity: 35, unitPrice: 650 },
      { name: 'Labor & Project Management', quantity: 1, unitPrice: 10250 }
    ]
  },
  {
    id: 'QUO-2024-004',
    title: 'Building Security System Upgrade',
    building: 'Innovation Hub',
    amount: 52000,
    currency: 'EUR',
    status: 'Approved',
    category: 'Security',
    vendor: 'SecureTech Solutions',
    requestedBy: 'Lisa Chen',
    createdDate: '2024-01-08',
    validUntil: '2024-02-08',
    approvedDate: '2024-01-15',
    description: 'Access control and surveillance system modernization',
    items: [
      { name: 'IP Cameras', quantity: 28, unitPrice: 850 },
      { name: 'Access Control Hardware', quantity: 15, unitPrice: 1200 },
      { name: 'System Integration & Programming', quantity: 1, unitPrice: 16200 }
    ]
  },
  {
    id: 'QUO-2024-005',
    title: 'Roof Waterproofing Repair',
    building: 'Riverside Complex',
    amount: 28500,
    currency: 'EUR',
    status: 'Pending',
    category: 'Building Envelope',
    vendor: 'RoofMaster Pro',
    requestedBy: 'Robert Williams',
    createdDate: '2024-01-20',
    validUntil: '2024-02-20',
    description: 'Emergency roof repairs and waterproofing',
    items: [
      { name: 'Waterproofing Membrane', quantity: 350, unitPrice: 45 },
      { name: 'Structural Repairs', quantity: 1, unitPrice: 8500 },
      { name: 'Labor', quantity: 120, unitPrice: 85 }
    ]
  },
  {
    id: 'QUO-2024-006',
    title: 'Elevator Modernization Package',
    building: 'Gateway Center',
    amount: 125000,
    currency: 'EUR',
    status: 'Rejected',
    category: 'Vertical Transportation',
    vendor: 'Vertical Solutions Inc',
    requestedBy: 'Sarah Martinez',
    createdDate: '2024-01-10',
    validUntil: '2024-02-10',
    description: 'Complete elevator system modernization - rejected due to budget',
    items: [
      { name: 'Control System Upgrade', quantity: 3, unitPrice: 25000 },
      { name: 'Cab Interior Renovation', quantity: 3, unitPrice: 12000 },
      { name: 'Safety System Modernization', quantity: 1, unitPrice: 14000 }
    ]
  },
  {
    id: 'QUO-2024-007',
    title: 'Annual Landscaping Service',
    building: 'Parkside Office',
    amount: 18000,
    currency: 'EUR',
    status: 'Approved',
    category: 'Grounds Maintenance',
    vendor: 'Green Spaces Landscaping',
    requestedBy: 'Michael Lee',
    createdDate: '2024-01-12',
    validUntil: '2024-02-12',
    approvedDate: '2024-01-18',
    description: 'Year-round landscaping and grounds maintenance',
    items: [
      { name: 'Monthly Lawn Care', quantity: 12, unitPrice: 800 },
      { name: 'Seasonal Planting', quantity: 4, unitPrice: 1200 },
      { name: 'Snow Removal (Winter)', quantity: 1, unitPrice: 2400 }
    ]
  },
  // Generated quotations
  ...generateQuotations()
];
