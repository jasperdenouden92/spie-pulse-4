import { randomFromArray, randomDate, randomInt, weightedRandom, padNumber, addDays, randomDecimal, STAFF_POOL, BUILDING_POOL } from './generators';

export interface Ticket {
  id: string;
  title: string;
  building: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  type: 'Corrective' | 'Preventive' | 'Request' | 'Improvement';
  category: string;
  assignedTo: string;
  createdDate: string;
  dueDate: string;
  completedDate?: string;
  description: string;
  estimatedHours?: number;
  actualHours?: number;
  amount?: number;
}

// Categories for tickets
const CATEGORIES = [
  'HVAC',
  'Electrical',
  'Plumbing',
  'Building Envelope',
  'Safety',
  'Vertical Transportation',
  'Building Automation',
  'Fire Protection',
  'Landscaping',
  'Pest Control'
];

// Task templates for variety
const TASK_TEMPLATES: Record<string, string[]> = {
  HVAC: [
    'HVAC System Maintenance - Floor {floor}',
    'Air Filter Replacement - Zone {zone}',
    'Thermostat Calibration - {area}',
    'Cooling Tower Inspection',
    'Ductwork Cleaning - Level {floor}',
    'Chiller System Repair',
    'Ventilation System Check'
  ],
  Electrical: [
    'Light Fixture Replacement - {area}',
    'Circuit Breaker Inspection',
    'Emergency Power System Test',
    'Electrical Panel Upgrade - Floor {floor}',
    'Wiring Inspection - {area}',
    'Power Outlet Repair',
    'Lighting Control System Update'
  ],
  Plumbing: [
    'Pipe Leak Repair - Floor {floor}',
    'Water Heater Maintenance',
    'Drain Cleaning - {area}',
    'Faucet Replacement',
    'Water Pressure Check',
    'Backflow Preventer Test',
    'Sump Pump Inspection'
  ],
  'Building Envelope': [
    'Window Seal Replacement',
    'Roof Inspection and Repair',
    'Exterior Wall Caulking',
    'Weatherstripping Replacement',
    'Facade Cleaning',
    'Gutter Maintenance',
    'Skylight Repair'
  ],
  Safety: [
    'Fire Alarm System Test',
    'Emergency Exit Sign Repair',
    'Fire Extinguisher Inspection',
    'Smoke Detector Replacement',
    'Safety Railing Repair',
    'Emergency Lighting Check',
    'Fire Door Inspection'
  ],
  'Vertical Transportation': [
    'Elevator Maintenance - Elevator {num}',
    'Escalator Inspection',
    'Elevator Door Adjustment',
    'Emergency Phone Test',
    'Cable Inspection',
    'Motor Lubrication',
    'Safety Sensor Calibration'
  ],
  'Building Automation': [
    'BMS Controller Upgrade',
    'Sensor Calibration - Zone {zone}',
    'Access Control System Update',
    'Automation Software Patch',
    'Network Equipment Maintenance',
    'Control Panel Repair',
    'System Integration Update'
  ],
  'Fire Protection': [
    'Sprinkler System Inspection',
    'Fire Pump Test',
    'Fire Suppression System Maintenance',
    'Standpipe Pressure Test',
    'Fire Hose Cabinet Inspection',
    'Dry Pipe System Check',
    'Fire Panel Battery Replacement'
  ],
  Landscaping: [
    'Grounds Maintenance',
    'Tree Trimming - Perimeter',
    'Irrigation System Repair',
    'Lawn Care Service',
    'Planting Beds Maintenance',
    'Snow Removal',
    'Exterior Plant Care'
  ],
  'Pest Control': [
    'Monthly Pest Inspection',
    'Rodent Control Treatment',
    'Insect Barrier Application',
    'Termite Inspection',
    'Pest Prevention Maintenance',
    'Trap Monitoring and Replacement',
    'Sanitization Service'
  ]
};

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
    const status = weightedRandom<Ticket['status']>(
      ['Open', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
      [35, 25, 5, 30, 5]
    );
    const type = weightedRandom<Ticket['type']>(
      ['Corrective', 'Preventive', 'Request', 'Improvement'],
      [40, 30, 20, 10]
    );

    // Generate title from templates
    const templates = TASK_TEMPLATES[category];
    let title = randomFromArray(templates);
    title = title
      .replace('{floor}', String(randomInt(1, 15)))
      .replace('{zone}', String.fromCharCode(65 + randomInt(0, 3))) // A-D
      .replace('{area}', randomFromArray(['North Wing', 'South Wing', 'East Wing', 'West Wing', 'Main Lobby', 'Parking Area']))
      .replace('{num}', String(randomInt(1, 4)));

    const createdDate = randomDate(startDate, endDate);
    const createdDateObj = new Date(createdDate);

    // Due date based on priority
    const daysUntilDue = priority === 'Critical' ? randomInt(1, 3) :
                        priority === 'High' ? randomInt(3, 7) :
                        priority === 'Medium' ? randomInt(7, 14) :
                        randomInt(14, 30);

    const dueDate = addDays(createdDateObj, daysUntilDue).toISOString().split('T')[0];

    const order: Ticket = {
      id: `WO-2024-${padNumber(i, 3)}`,
      title,
      building: randomFromArray(BUILDING_POOL),
      priority,
      status,
      type,
      category,
      assignedTo: randomFromArray(STAFF_POOL),
      createdDate,
      dueDate,
      description: `${title} - Scheduled maintenance and inspection`,
      estimatedHours: randomDecimal(1, 8, 1),
      amount: randomInt(0, 4) > 0 ? Math.round(randomDecimal(25, 4500, 2) * 100) / 100 : undefined,
    };

    // Add completion details for completed/cancelled orders
    if (status === 'Completed') {
      const dueDateObj = new Date(dueDate);
      const completedDaysOffset = randomInt(-2, 1); // Complete up to 2 days early or 1 day late
      order.completedDate = addDays(dueDateObj, completedDaysOffset).toISOString().split('T')[0];
      order.actualHours = randomDecimal(order.estimatedHours! * 0.8, order.estimatedHours! * 1.2, 1);
    } else if (status === 'In Progress') {
      order.actualHours = randomDecimal(0, order.estimatedHours! * 0.6, 1);
    } else if (status === 'Cancelled') {
      const dueDateObj = new Date(dueDate);
      order.completedDate = addDays(dueDateObj, randomInt(-5, 0)).toISOString().split('T')[0];
    }

    orders.push(order);
  }

  return orders;
}

// Original 8 tickets
export const tickets: Ticket[] = [
  {
    id: 'WO-2024-001',
    title: 'HVAC System Maintenance - Floor 3',
    building: 'Skyline Plaza',
    priority: 'High',
    status: 'In Progress',
    type: 'Preventive',
    category: 'HVAC',
    assignedTo: 'John Smith',
    createdDate: '2024-01-15',
    dueDate: '2024-01-22',
    description: 'Routine maintenance and filter replacement for HVAC units on floor 3',
    estimatedHours: 4,
    actualHours: 2.5,
    amount: 380.00,
  },
  {
    id: 'WO-2024-002',
    title: 'Aanpassen verlichting',
    building: 'Urban Tower',
    priority: 'Medium',
    status: 'Open',
    type: 'Request',
    category: 'Electrical',
    assignedTo: 'Marie Johnson',
    createdDate: '2024-01-18',
    dueDate: '2024-01-25',
    description: 'Adjust lighting levels in main lobby area',
    amount: 125.50,
  },
  {
    id: 'WO-2024-003',
    title: 'Reparatie toilet 1e verdieping',
    building: 'Metro Heights',
    priority: 'Critical',
    status: 'In Progress',
    type: 'Corrective',
    category: 'Plumbing',
    assignedTo: 'Tom Anderson',
    createdDate: '2024-01-20',
    dueDate: '2024-01-21',
    description: 'Emergency repair of toilet facilities on first floor',
    estimatedHours: 3,
    actualHours: 1.5,
    amount: 210.00,
  },
  {
    id: 'WO-2024-004',
    title: 'Window Seal Replacement',
    building: 'Innovation Hub',
    priority: 'Medium',
    status: 'Completed',
    type: 'Preventive',
    category: 'Building Envelope',
    assignedTo: 'Lisa Chen',
    createdDate: '2024-01-10',
    dueDate: '2024-01-17',
    completedDate: '2024-01-16',
    description: 'Replace deteriorated window seals on north facade',
    estimatedHours: 8,
    actualHours: 7.5,
    amount: 740.00,
  },
  {
    id: 'WO-2024-005',
    title: 'Fire Alarm System Test',
    building: 'Riverside Complex',
    priority: 'High',
    status: 'Open',
    type: 'Preventive',
    category: 'Safety',
    assignedTo: 'Robert Williams',
    createdDate: '2024-01-22',
    dueDate: '2024-01-29',
    description: 'Quarterly fire alarm system testing and inspection',
    estimatedHours: 6,
  },
  {
    id: 'WO-2024-006',
    title: 'Elevator Maintenance - Elevator 2',
    building: 'Skyline Plaza',
    priority: 'High',
    status: 'Completed',
    type: 'Preventive',
    category: 'Vertical Transportation',
    assignedTo: 'David Park',
    createdDate: '2024-01-08',
    dueDate: '2024-01-15',
    completedDate: '2024-01-14',
    description: 'Monthly elevator maintenance and safety inspection',
    estimatedHours: 5,
    actualHours: 4.5,
    amount: 520.00,
  },
  {
    id: 'WO-2024-007',
    title: 'Parking Lot Lighting Repair',
    building: 'Gateway Center',
    priority: 'Medium',
    status: 'On Hold',
    type: 'Corrective',
    category: 'Electrical',
    assignedTo: 'Sarah Martinez',
    createdDate: '2024-01-19',
    dueDate: '2024-01-26',
    description: 'Replace non-functioning lights in parking area - awaiting parts',
    estimatedHours: 4,
    amount: 290.00,
  },
  {
    id: 'WO-2024-008',
    title: 'BMS Controller Upgrade',
    building: 'Parkside Office',
    priority: 'Low',
    status: 'Open',
    type: 'Improvement',
    category: 'Building Automation',
    assignedTo: 'Michael Lee',
    createdDate: '2024-01-21',
    dueDate: '2024-02-05',
    description: 'Software update for building management system controllers',
    estimatedHours: 3,
    amount: 1200.00,
  },
  // Generated tickets
  ...generateTickets()
];
