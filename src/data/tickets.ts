import { randomFromArray, randomDate, randomInt, weightedRandom, padNumber, addDays, randomDecimal, STAFF_POOL, BUILDING_POOL } from './generators';

export type TicketType = 'Malfunction' | 'Maintenance';
export type TicketStatus = 'Received' | 'In progress' | 'Function restored' | 'Completed' | 'Priced out' | 'To approve';

export interface Ticket {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  building: string;
  client: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: TicketStatus;
  type: TicketType;
  category: string;
  assignedTo: string;
  createdDate: string;
  dueDate: string;
  completedDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  amount?: number;
  imageUrl?: string;
}

// Disciplines
const CATEGORIES = [
  'HVAC',
  'Electrical',
  'Plumbing',
  'Structural',
  'Safety',
  'Vertical transport',
  'Building automation',
  'Fire protection',
  'Grounds maintenance',
  'Pest control'
];

// Clients
const CLIENTS = [
  'Rijksvastgoedbedrijf',
  'CBRE',
  'Cushman & Wakefield',
  'Jones Lang LaSalle',
  'Facilicom',
  'ISS Facility Services',
  'Strukton Worksphere',
  'BAM Bouw en Techniek',
  'Heijmans',
  'Dura Vermeer',
];

// Task templates for variety
const TASK_TEMPLATES: Record<string, string[]> = {
  HVAC: [
    'HVAC maintenance - Floor {floor}',
    'Air filter replacement - Zone {zone}',
    'Thermostat calibration - {area}',
    'Cooling tower inspection',
    'Duct cleaning - Floor {floor}',
    'Chiller repair',
    'Ventilation check'
  ],
  Electrical: [
    'Lighting replacement - {area}',
    'Fuse box inspection',
    'Emergency power test',
    'Electrical panel upgrade - Floor {floor}',
    'Wiring inspection - {area}',
    'Outlet repair',
    'Lighting control update'
  ],
  Plumbing: [
    'Leak repair - Floor {floor}',
    'Boiler maintenance',
    'Drain cleaning - {area}',
    'Faucet replacement',
    'Water pressure check',
    'Backflow valve test',
    'Sump pit inspection'
  ],
  Structural: [
    'Window sealant replacement',
    'Roof inspection and repair',
    'Facade repointing',
    'Weather strip replacement',
    'Facade cleaning',
    'Gutter maintenance',
    'Skylight repair'
  ],
  Safety: [
    'Fire alarm test',
    'Emergency exit sign repair',
    'Fire extinguisher inspection',
    'Smoke detector replacement',
    'Safety railing repair',
    'Emergency lighting check',
    'Fire door inspection'
  ],
  'Vertical transport': [
    'Elevator maintenance - Lift {num}',
    'Escalator inspection',
    'Elevator door adjustment',
    'Emergency phone test',
    'Cable inspection',
    'Motor lubrication',
    'Safety sensor calibration'
  ],
  'Building automation': [
    'BMS controller upgrade',
    'Sensor calibration - Zone {zone}',
    'Access control update',
    'Automation software patch',
    'Network equipment maintenance',
    'Control panel repair',
    'System integration update'
  ],
  'Fire protection': [
    'Sprinkler inspection',
    'Fire pump test',
    'Suppression system maintenance',
    'Standpipe pressure test',
    'Fire hose cabinet inspection',
    'Dry system check',
    'Fire panel battery replacement'
  ],
  'Grounds maintenance': [
    'Grounds maintenance',
    'Tree care - Grounds',
    'Irrigation repair',
    'Lawn maintenance',
    'Planter maintenance',
    'Snow removal',
    'Outdoor plant care'
  ],
  'Pest control': [
    'Monthly pest inspection',
    'Rodent control',
    'Insect barrier application',
    'Termite inspection',
    'Preventive pest maintenance',
    'Trap check and replacement',
    'Sanitary treatment'
  ]
};

// Image pool: real building photos + placeholder
const TICKET_IMAGE_POOL = [
  ...Array.from({ length: 16 }, (_, i) => `/images/buildings/spie-nederland/${i + 1}.jpeg`),
  ...Array.from({ length: 33 }, (_, i) => `/images/buildings/philips-real-estate/${i + 1}.jpeg`),
  ...Array.from({ length: 7 }, (_, i) => `/images/buildings/provincie-noord-holland/${i + 1}.jpeg`),
  ...Array.from({ length: 3 }, (_, i) => `/images/buildings/klm/${i + 1}.jpeg`),
];
const PLACEHOLDER_IMAGE = '/images/buildings/placeholder.png';

// Generate tickets
function generateTickets(): Ticket[] {
  const orders: Ticket[] = [];
  const startDate = new Date('2023-07-01');
  const endDate = new Date('2024-01-23');

  for (let i = 9; i <= 150; i++) {
    const category = randomFromArray(CATEGORIES);
    const priority = weightedRandom<Ticket['priority']>(
      ['Low', 'Medium', 'High', 'Critical'],
      [30, 40, 25, 5]
    );
    const status = weightedRandom<TicketStatus>(
      ['Received', 'In progress', 'Function restored', 'Completed', 'Priced out', 'To approve'],
      [20, 22, 13, 22, 10, 13]
    );
    const type = weightedRandom<TicketType>(
      ['Malfunction', 'Maintenance'],
      [60, 40]
    );

    // Generate title from templates
    const templates = TASK_TEMPLATES[category];
    let title = randomFromArray(templates);
    title = title
      .replace('{floor}', String(randomInt(1, 15)))
      .replace('{zone}', String.fromCharCode(65 + randomInt(0, 3))) // A-D
      .replace('{area}', randomFromArray(['North wing', 'South wing', 'East wing', 'West wing', 'Main lobby', 'Parking area']))
      .replace('{num}', String(randomInt(1, 4)));

    const createdDate = randomDate(startDate, endDate);
    const createdDateObj = new Date(createdDate);

    // Due date based on priority
    const daysUntilDue = priority === 'Critical' ? randomInt(1, 3) :
                        priority === 'High' ? randomInt(3, 7) :
                        priority === 'Medium' ? randomInt(7, 14) :
                        randomInt(14, 30);

    const dueDate = addDays(createdDateObj, daysUntilDue).toISOString().split('T')[0];

    // Amount only for Completed and Priced out statuses
    const hasAmount = status === 'Completed' || status === 'Priced out';

    const order: Ticket = {
      id: `WB-2024-${padNumber(i, 3)}`,
      referenceNumber: `REF-${padNumber(randomInt(10000, 99999), 5)}`,
      title,
      description: `${title} - Scheduled maintenance and inspection`,
      building: randomFromArray(BUILDING_POOL),
      client: randomFromArray(CLIENTS),
      priority,
      status,
      type,
      category,
      assignedTo: randomFromArray(STAFF_POOL),
      createdDate,
      dueDate,
      estimatedHours: randomDecimal(1, 8, 1),
      amount: hasAmount ? Math.round(randomDecimal(25, 4500, 2) * 100) / 100 : undefined,
      // ~60% real building photo, ~40% no image (placeholder in UI)
      imageUrl: randomInt(0, 4) > 1 ? TICKET_IMAGE_POOL[randomInt(0, TICKET_IMAGE_POOL.length - 1)] : undefined,
    };

    // Add completion details for completed orders
    if (status === 'Completed') {
      const dueDateObj = new Date(dueDate);
      const completedDaysOffset = randomInt(-2, 1);
      order.completedDate = addDays(dueDateObj, completedDaysOffset).toISOString().split('T')[0];
      order.actualHours = randomDecimal(order.estimatedHours! * 0.8, order.estimatedHours! * 1.2, 1);
    } else if (status === 'In progress') {
      order.actualHours = randomDecimal(0, order.estimatedHours! * 0.6, 1);
    }

    orders.push(order);
  }

  return orders;
}

// Original 8 tickets
export const tickets: Ticket[] = [
  {
    id: 'WB-2024-001',
    referenceNumber: 'REF-48291',
    title: 'HVAC maintenance - Floor 3',
    description: 'Routine maintenance and filter replacement for HVAC units on floor 3',
    building: 'Skyline Plaza',
    client: 'Rijksvastgoedbedrijf',
    priority: 'High',
    status: 'In progress',
    type: 'Malfunction',
    category: 'HVAC',
    assignedTo: 'John Smith',
    createdDate: '2024-01-15',
    dueDate: '2024-01-22',
    estimatedHours: 4,
    actualHours: 2.5,
    imageUrl: '/images/buildings/spie-nederland/3.jpeg',
  },
  {
    id: 'WB-2024-002',
    referenceNumber: 'REF-51034',
    title: 'Lighting adjustment',
    description: 'Adjust lighting in the main lobby',
    building: 'Urban Tower',
    client: 'CBRE',
    priority: 'Medium',
    status: 'Received',
    type: 'Maintenance',
    category: 'Electrical',
    assignedTo: 'Marie Johnson',
    createdDate: '2024-01-18',
    dueDate: '2024-01-25',
  },
  {
    id: 'WB-2024-003',
    referenceNumber: 'REF-33892',
    title: 'Toilet repair 1st floor',
    description: 'Emergency repair of toilet facilities on the first floor',
    building: 'Metro Heights',
    client: 'Cushman & Wakefield',
    priority: 'Critical',
    status: 'In progress',
    type: 'Malfunction',
    category: 'Plumbing',
    assignedTo: 'Tom Anderson',
    createdDate: '2024-01-20',
    dueDate: '2024-01-21',
    estimatedHours: 3,
    actualHours: 1.5,
    imageUrl: '/images/buildings/philips-real-estate/8.jpeg',
  },
  {
    id: 'WB-2024-004',
    referenceNumber: 'REF-27561',
    title: 'Window sealant replacement',
    description: 'Replace worn window sealant on the north facade',
    building: 'Innovation Hub',
    client: 'Jones Lang LaSalle',
    priority: 'Medium',
    status: 'Completed',
    type: 'Maintenance',
    category: 'Structural',
    assignedTo: 'Lisa Chen',
    createdDate: '2024-01-10',
    dueDate: '2024-01-17',
    completedDate: '2024-01-16',
    estimatedHours: 8,
    actualHours: 7.5,
    amount: 740.00,
    imageUrl: '/images/buildings/provincie-noord-holland/2.jpeg',
  },
  {
    id: 'WB-2024-005',
    referenceNumber: 'REF-60128',
    title: 'Fire alarm test',
    description: 'Quarterly fire alarm system test and inspection',
    building: 'Riverside Complex',
    client: 'Facilicom',
    priority: 'High',
    status: 'Received',
    type: 'Malfunction',
    category: 'Safety',
    assignedTo: 'Robert Williams',
    createdDate: '2024-01-22',
    dueDate: '2024-01-29',
    estimatedHours: 6,
    imageUrl: '/images/buildings/spie-nederland/11.jpeg',
  },
  {
    id: 'WB-2024-006',
    referenceNumber: 'REF-44893',
    title: 'Elevator maintenance - Lift 2',
    description: 'Monthly elevator maintenance and safety inspection',
    building: 'Skyline Plaza',
    client: 'Rijksvastgoedbedrijf',
    priority: 'High',
    status: 'Completed',
    type: 'Maintenance',
    category: 'Vertical transport',
    assignedTo: 'David Park',
    createdDate: '2024-01-08',
    dueDate: '2024-01-15',
    completedDate: '2024-01-14',
    estimatedHours: 5,
    actualHours: 4.5,
    amount: 520.00,
  },
  {
    id: 'WB-2024-007',
    referenceNumber: 'REF-71540',
    title: 'Parking area lighting repair',
    description: 'Replace non-working lighting in parking area - awaiting parts',
    building: 'Gateway Center',
    client: 'ISS Facility Services',
    priority: 'Medium',
    status: 'Function restored',
    type: 'Malfunction',
    category: 'Electrical',
    assignedTo: 'Sarah Martinez',
    createdDate: '2024-01-19',
    dueDate: '2024-01-26',
    estimatedHours: 4,
    imageUrl: '/images/buildings/klm/1.jpeg',
  },
  {
    id: 'WB-2024-008',
    referenceNumber: 'REF-82367',
    title: 'BMS controller upgrade',
    description: 'Software update for building management system controllers',
    building: 'Parkside Office',
    client: 'Strukton Worksphere',
    priority: 'Low',
    status: 'Priced out',
    type: 'Maintenance',
    category: 'Building automation',
    assignedTo: 'Michael Lee',
    createdDate: '2024-01-21',
    dueDate: '2024-02-05',
    estimatedHours: 3,
    amount: 1200.00,
    imageUrl: '/images/buildings/philips-real-estate/20.jpeg',
  },
  // Generated tickets
  ...generateTickets()
];
