import { randomFromArray, randomDate, randomInt, weightedRandom, padNumber, addDays, randomDecimal, STAFF_POOL, BUILDING_POOL } from './generators';

export interface MaintenanceSchedule {
  id: string;
  title: string;
  building: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';
  category: string;
  assignedTo: string;
  lastCompleted?: string;
  nextDue: string;
  status: 'Scheduled' | 'Overdue' | 'In Progress' | 'Completed';
  estimatedDuration: number; // in hours
  priority: 'Low' | 'Medium' | 'High';
  description: string;
  checklistItems: string[];
}

// Categories for maintenance
const CATEGORIES = [
  'HVAC',
  'Safety',
  'Vertical Transportation',
  'Building Automation',
  'Power Systems',
  'Electrical',
  'Plumbing',
  'Building Envelope',
  'Security',
  'Fire Protection'
];

// Maintenance task templates
const MAINTENANCE_TEMPLATES: Record<string, { titles: string[], checklists: string[][] }> = {
  HVAC: {
    titles: ['HVAC Filter Inspection & Replacement', 'Cooling Tower Maintenance', 'Air Handler Inspection', 'Chiller System Check', 'Thermostat Calibration', 'HVAC Coil Cleaning'],
    checklists: [
      ['Inspect all air filters', 'Replace filters with efficiency < 70%', 'Check airflow readings', 'Document filter conditions', 'Update maintenance log'],
      ['Check water levels', 'Inspect fan belts', 'Clean basin', 'Test chemical treatment system', 'Check for corrosion'],
      ['Inspect motor bearings', 'Check belt tension', 'Clean coils', 'Test dampers', 'Verify control systems'],
      ['Check refrigerant levels', 'Inspect compressor', 'Test safety controls', 'Monitor operating temperatures', 'Document performance'],
      ['Test sensor accuracy', 'Calibrate all thermostats', 'Check battery backup', 'Update settings', 'Document readings'],
      ['Power down systems', 'Remove access panels', 'Clean evaporator coils', 'Clean condenser coils', 'Reassemble and test']
    ]
  },
  Safety: {
    titles: ['Fire Suppression System Test', 'Emergency Exit Inspection', 'Safety Equipment Check', 'Emergency Lighting Test', 'First Aid Kit Inspection'],
    checklists: [
      ['Test all smoke detectors', 'Inspect fire extinguishers', 'Test emergency lighting', 'Verify sprinkler system pressure', 'Test alarm system', 'Generate compliance report'],
      ['Check exit signs', 'Verify door operation', 'Ensure clear pathways', 'Test push bars', 'Update emergency maps'],
      ['Inspect PPE equipment', 'Check AED batteries', 'Verify eyewash stations', 'Test emergency showers', 'Document equipment status'],
      ['Test all emergency lights', 'Replace batteries as needed', 'Verify automatic switching', 'Clean fixtures', 'Update testing log'],
      ['Check expiration dates', 'Restock supplies', 'Verify kit locations', 'Document contents', 'Update logs']
    ]
  },
  'Vertical Transportation': {
    titles: ['Elevator Safety Inspection', 'Escalator Maintenance', 'Elevator Door Adjustment', 'Cable Inspection', 'Emergency System Test'],
    checklists: [
      ['Inspect door mechanisms', 'Check emergency phone system', 'Test emergency brake', 'Lubricate moving parts', 'Verify load sensors', 'Test emergency stop button'],
      ['Inspect steps for wear', 'Check handrail tension', 'Lubricate chains', 'Test emergency stop', 'Clean components'],
      ['Test door sensors', 'Adjust door timing', 'Check safety edges', 'Lubricate tracks', 'Test reopen function'],
      ['Visual cable inspection', 'Measure cable wear', 'Check cable lubrication', 'Inspect connections', 'Document condition'],
      ['Test emergency power', 'Verify alarm system', 'Check emergency lighting', 'Test communication system', 'Simulate emergency procedures']
    ]
  },
  'Building Automation': {
    titles: ['Building Management System Check', 'Sensor Calibration', 'Network Equipment Maintenance', 'Control Panel Inspection', 'System Software Update'],
    checklists: [
      ['Review system alerts', 'Check sensor calibrations', 'Verify setpoints', 'Test remote access', 'Update software if needed'],
      ['Test temperature sensors', 'Calibrate humidity sensors', 'Check pressure sensors', 'Verify accuracy', 'Document readings'],
      ['Check network connections', 'Update firmware', 'Test backup systems', 'Verify security settings', 'Clean equipment'],
      ['Inspect wiring', 'Check indicators', 'Test manual overrides', 'Clean panels', 'Update labels'],
      ['Backup system data', 'Install updates', 'Test functionality', 'Verify integration', 'Document changes']
    ]
  },
  'Power Systems': {
    titles: ['Emergency Generator Test', 'UPS Battery Check', 'Electrical Panel Inspection', 'Power Distribution Check', 'Transfer Switch Test'],
    checklists: [
      ['Check fuel levels', 'Inspect battery condition', 'Run 30-minute load test', 'Check coolant levels', 'Inspect for leaks', 'Test automatic transfer switch'],
      ['Test battery voltage', 'Check battery connections', 'Verify runtime', 'Clean terminals', 'Document test results'],
      ['Inspect for overheating', 'Check breaker operations', 'Tighten connections', 'Test ground fault', 'Update panel labels'],
      ['Check voltage levels', 'Inspect connections', 'Test circuit protection', 'Verify load balance', 'Document readings'],
      ['Test automatic switching', 'Verify manual operation', 'Check timing', 'Test under load', 'Document performance']
    ]
  },
  Electrical: {
    titles: ['Lighting System Inspection', 'Circuit Testing', 'Outlet Safety Check', 'Emergency Power Review', 'Lighting Control Update'],
    checklists: [
      ['Test all emergency lighting', 'Replace burned out bulbs', 'Clean fixtures', 'Check for flickering lights', 'Inspect wiring connections', 'Update fixture inventory'],
      ['Test circuit breakers', 'Check voltage levels', 'Inspect wiring', 'Test GFCI outlets', 'Document readings'],
      ['Inspect all outlets', 'Test GFCI function', 'Check for damage', 'Tighten connections', 'Replace damaged outlets'],
      ['Test generator', 'Check fuel system', 'Verify automatic start', 'Test load transfer', 'Document runtime'],
      ['Update schedules', 'Test sensors', 'Calibrate daylight harvesting', 'Check zone controls', 'Update programming']
    ]
  },
  Plumbing: {
    titles: ['Plumbing System Inspection', 'Water Heater Check', 'Backflow Preventer Test', 'Drain System Cleaning', 'Fixture Inspection'],
    checklists: [
      ['Inspect all visible pipes for leaks', 'Check water pressure', 'Test backflow preventers', 'Inspect water heaters', 'Clean drain lines', 'Check for corrosion', 'Test shut-off valves'],
      ['Check temperature settings', 'Inspect for leaks', 'Test pressure relief valve', 'Check anode rod', 'Flush tank'],
      ['Visual inspection', 'Pressure test', 'Check test cocks', 'Document compliance', 'Schedule repairs if needed'],
      ['Clean main drains', 'Inspect for blockages', 'Test all drains', 'Check vent system', 'Document issues'],
      ['Check all faucets', 'Inspect toilets', 'Test flush valves', 'Check for leaks', 'Replace worn parts']
    ]
  },
  'Building Envelope': {
    titles: ['Roof & Drainage Inspection', 'Window Seal Check', 'Exterior Wall Inspection', 'Weatherproofing Review', 'Facade Maintenance'],
    checklists: [
      ['Inspect roof membrane condition', 'Clear debris from drains', 'Check for ponding water', 'Inspect flashing and seals', 'Check gutter condition', 'Document any damage'],
      ['Inspect window seals', 'Check for condensation', 'Test operation', 'Check weatherstripping', 'Document issues'],
      ['Visual inspection', 'Check for cracks', 'Inspect sealants', 'Check expansion joints', 'Document damage'],
      ['Inspect all seals', 'Check caulking', 'Test weatherstripping', 'Inspect thresholds', 'Plan repairs'],
      ['Clean facade', 'Inspect for damage', 'Check joints', 'Test waterproofing', 'Document condition']
    ]
  },
  Security: {
    titles: ['Access Control System Audit', 'Camera System Check', 'Lock Maintenance', 'Alarm System Test', 'Badge System Review'],
    checklists: [
      ['Review active user list', 'Remove inactive users', 'Test card readers', 'Verify door locks', 'Check system logs', 'Update access schedules'],
      ['Check camera operation', 'Clean lenses', 'Verify recording', 'Test motion detection', 'Check storage capacity'],
      ['Test all locks', 'Lubricate mechanisms', 'Check batteries', 'Test access codes', 'Document issues'],
      ['Test all zones', 'Verify sensors', 'Test communication', 'Check backup battery', 'Update contact list'],
      ['Test badge readers', 'Update badge database', 'Deactivate old badges', 'Test emergency access', 'Document updates']
    ]
  },
  'Fire Protection': {
    titles: ['Sprinkler System Inspection', 'Fire Alarm Panel Check', 'Fire Pump Test', 'Standpipe Test', 'Fire Extinguisher Inspection'],
    checklists: [
      ['Inspect all sprinkler heads', 'Check system pressure', 'Test alarm valves', 'Inspect piping', 'Test drainage', 'Document findings'],
      ['Test panel operation', 'Check battery backup', 'Verify zone indication', 'Test communication', 'Update programming'],
      ['Test pump operation', 'Check pressure readings', 'Inspect packing glands', 'Test automatic start', 'Document performance'],
      ['Pressure test', 'Inspect hose connections', 'Check caps', 'Verify signage', 'Document compliance'],
      ['Check pressure gauge', 'Inspect for damage', 'Verify tag date', 'Check accessibility', 'Document inspection']
    ]
  }
};

// Generate maintenance schedules
function generateMaintenanceSchedules(): MaintenanceSchedule[] {
  const schedules: MaintenanceSchedule[] = [];
  const today = new Date('2024-01-23');

  for (let i = 11; i <= 150; i++) {
    const category = randomFromArray(CATEGORIES);
    const frequency = weightedRandom<MaintenanceSchedule['frequency']>(
      ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Semi-Annual', 'Annual'],
      [10, 20, 35, 20, 10, 5]
    );
    const status = weightedRandom<MaintenanceSchedule['status']>(
      ['Scheduled', 'Overdue', 'In Progress', 'Completed'],
      [55, 15, 20, 10]
    );
    const priority = weightedRandom<MaintenanceSchedule['priority']>(
      ['Low', 'Medium', 'High'],
      [20, 50, 30]
    );

    // Get templates for this category
    const templates = MAINTENANCE_TEMPLATES[category];
    const title = randomFromArray(templates.titles);
    const checklistItems = randomFromArray(templates.checklists);

    // Calculate next due date based on frequency and status
    let nextDueDays: number;
    if (status === 'Overdue') {
      nextDueDays = -randomInt(1, 30); // Overdue by 1-30 days
    } else {
      const frequencyDays = {
        'Daily': 1,
        'Weekly': 7,
        'Monthly': 30,
        'Quarterly': 90,
        'Semi-Annual': 180,
        'Annual': 365
      };
      nextDueDays = randomInt(0, frequencyDays[frequency]);
    }

    const nextDue = addDays(today, nextDueDays).toISOString().split('T')[0];

    // Calculate last completed based on frequency
    let lastCompleted: string | undefined;
    if (status !== 'Scheduled' || Math.random() > 0.3) {
      const frequencyDays = {
        'Daily': 1,
        'Weekly': 7,
        'Monthly': 30,
        'Quarterly': 90,
        'Semi-Annual': 180,
        'Annual': 365
      };
      const lastCompletedDays = -randomInt(1, frequencyDays[frequency]);
      lastCompleted = addDays(today, lastCompletedDays).toISOString().split('T')[0];
    }

    const schedule: MaintenanceSchedule = {
      id: `PM-${padNumber(i, 3)}`,
      title,
      building: randomFromArray(BUILDING_POOL),
      frequency,
      category,
      assignedTo: randomFromArray(STAFF_POOL),
      lastCompleted,
      nextDue,
      status,
      estimatedDuration: randomDecimal(0.5, 8, 1),
      priority,
      description: `${title} - Regular preventative maintenance`,
      checklistItems
    };

    schedules.push(schedule);
  }

  return schedules;
}

// Original 10 maintenance schedules
export const maintenanceSchedules: MaintenanceSchedule[] = [
  {
    id: 'PM-001',
    title: 'HVAC Filter Inspection & Replacement',
    building: 'Skyline Plaza',
    frequency: 'Monthly',
    category: 'HVAC',
    assignedTo: 'John Smith',
    lastCompleted: '2024-01-05',
    nextDue: '2024-02-05',
    status: 'Scheduled',
    estimatedDuration: 3,
    priority: 'High',
    description: 'Inspect and replace HVAC filters across all units',
    checklistItems: [
      'Inspect all air filters',
      'Replace filters with efficiency < 70%',
      'Check airflow readings',
      'Document filter conditions',
      'Update maintenance log'
    ]
  },
  {
    id: 'PM-002',
    title: 'Fire Suppression System Test',
    building: 'Urban Tower',
    frequency: 'Quarterly',
    category: 'Safety',
    assignedTo: 'Marie Johnson',
    lastCompleted: '2023-10-15',
    nextDue: '2024-01-15',
    status: 'Overdue',
    estimatedDuration: 4,
    priority: 'High',
    description: 'Quarterly testing of fire suppression and alarm systems',
    checklistItems: [
      'Test all smoke detectors',
      'Inspect fire extinguishers',
      'Test emergency lighting',
      'Verify sprinkler system pressure',
      'Test alarm system',
      'Generate compliance report'
    ]
  },
  {
    id: 'PM-003',
    title: 'Elevator Safety Inspection',
    building: 'Metro Heights',
    frequency: 'Monthly',
    category: 'Vertical Transportation',
    assignedTo: 'Tom Anderson',
    lastCompleted: '2024-01-18',
    nextDue: '2024-02-18',
    status: 'Scheduled',
    estimatedDuration: 2.5,
    priority: 'High',
    description: 'Monthly safety inspection and preventative maintenance for all elevators',
    checklistItems: [
      'Inspect door mechanisms',
      'Check emergency phone system',
      'Test emergency brake',
      'Lubricate moving parts',
      'Verify load sensors',
      'Test emergency stop button'
    ]
  },
  {
    id: 'PM-004',
    title: 'Building Management System Check',
    building: 'Innovation Hub',
    frequency: 'Weekly',
    category: 'Building Automation',
    assignedTo: 'Lisa Chen',
    lastCompleted: '2024-01-19',
    nextDue: '2024-01-26',
    status: 'In Progress',
    estimatedDuration: 1.5,
    priority: 'Medium',
    description: 'Weekly BMS monitoring and calibration check',
    checklistItems: [
      'Review system alerts',
      'Check sensor calibrations',
      'Verify setpoints',
      'Test remote access',
      'Update software if needed'
    ]
  },
  {
    id: 'PM-005',
    title: 'Emergency Generator Test',
    building: 'Riverside Complex',
    frequency: 'Monthly',
    category: 'Power Systems',
    assignedTo: 'Robert Williams',
    lastCompleted: '2024-01-10',
    nextDue: '2024-02-10',
    status: 'Scheduled',
    estimatedDuration: 2,
    priority: 'High',
    description: 'Monthly emergency generator load test and inspection',
    checklistItems: [
      'Check fuel levels',
      'Inspect battery condition',
      'Run 30-minute load test',
      'Check coolant levels',
      'Inspect for leaks',
      'Test automatic transfer switch'
    ]
  },
  {
    id: 'PM-006',
    title: 'Lighting System Inspection',
    building: 'Gateway Center',
    frequency: 'Quarterly',
    category: 'Electrical',
    assignedTo: 'Sarah Martinez',
    lastCompleted: '2023-12-15',
    nextDue: '2024-03-15',
    status: 'Scheduled',
    estimatedDuration: 4,
    priority: 'Medium',
    description: 'Comprehensive lighting system inspection and maintenance',
    checklistItems: [
      'Test all emergency lighting',
      'Replace burned out bulbs',
      'Clean fixtures',
      'Check for flickering lights',
      'Inspect wiring connections',
      'Update fixture inventory'
    ]
  },
  {
    id: 'PM-007',
    title: 'Plumbing System Inspection',
    building: 'Parkside Office',
    frequency: 'Semi-Annual',
    category: 'Plumbing',
    assignedTo: 'Michael Lee',
    lastCompleted: '2023-08-20',
    nextDue: '2024-02-20',
    status: 'Scheduled',
    estimatedDuration: 5,
    priority: 'Medium',
    description: 'Comprehensive plumbing system inspection',
    checklistItems: [
      'Inspect all visible pipes for leaks',
      'Check water pressure',
      'Test backflow preventers',
      'Inspect water heaters',
      'Clean drain lines',
      'Check for corrosion',
      'Test shut-off valves'
    ]
  },
  {
    id: 'PM-008',
    title: 'Roof & Drainage Inspection',
    building: 'Skyline Plaza',
    frequency: 'Quarterly',
    category: 'Building Envelope',
    assignedTo: 'John Smith',
    lastCompleted: '2023-11-01',
    nextDue: '2024-02-01',
    status: 'Scheduled',
    estimatedDuration: 3,
    priority: 'Medium',
    description: 'Inspect roof condition and drainage systems',
    checklistItems: [
      'Inspect roof membrane condition',
      'Clear debris from drains',
      'Check for ponding water',
      'Inspect flashing and seals',
      'Check gutter condition',
      'Document any damage'
    ]
  },
  {
    id: 'PM-009',
    title: 'HVAC Coil Cleaning',
    building: 'Urban Tower',
    frequency: 'Semi-Annual',
    category: 'HVAC',
    assignedTo: 'Marie Johnson',
    lastCompleted: '2023-07-15',
    nextDue: '2024-01-15',
    status: 'Overdue',
    estimatedDuration: 6,
    priority: 'High',
    description: 'Deep cleaning of HVAC evaporator and condenser coils',
    checklistItems: [
      'Power down systems',
      'Remove access panels',
      'Clean evaporator coils',
      'Clean condenser coils',
      'Check coil fins for damage',
      'Reassemble and test operation'
    ]
  },
  {
    id: 'PM-010',
    title: 'Access Control System Audit',
    building: 'Innovation Hub',
    frequency: 'Quarterly',
    category: 'Security',
    assignedTo: 'Lisa Chen',
    lastCompleted: '2023-12-10',
    nextDue: '2024-03-10',
    status: 'Scheduled',
    estimatedDuration: 3,
    priority: 'Medium',
    description: 'Audit access control system and user permissions',
    checklistItems: [
      'Review active user list',
      'Remove inactive users',
      'Test card readers',
      'Verify door locks',
      'Check system logs',
      'Update access schedules'
    ]
  },
  // Generated maintenance schedules
  ...generateMaintenanceSchedules()
];
