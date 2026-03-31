import { seededRandom } from './generators';

export interface AssetNode {
  id: string;
  name: string;
  type: 'building' | 'floor' | 'zone' | 'room' | 'system' | 'category' | 'asset';
  children?: AssetNode[];
  metadata?: {
    category?: string;
    model?: string;
    serialNumber?: string;
    installDate?: string;
    lastMaintenance?: string;
    manufacturer?: string;
    capacity?: string;
    location?: string;
    floor?: string;
    zone?: string;
    status?: string;
  };
}

// Building configurations for different types
const buildingConfigs = [
  { name: 'Skyline Plaza', floors: 8, type: 'office' },
  { name: 'Innovation Hub', floors: 6, type: 'tech' },
  { name: 'Harmony Estates', floors: 4, type: 'residential' },
  { name: 'Atrium Towers', floors: 12, type: 'office' },
  { name: 'Civic Center', floors: 5, type: 'civic' },
  { name: 'Harbor Point', floors: 7, type: 'mixed' },
  { name: 'Crystal Tower', floors: 15, type: 'office' },
  { name: 'Green Park Office', floors: 5, type: 'office' },
  { name: 'Sunset Plaza', floors: 8, type: 'retail' },
  { name: 'Metro Central', floors: 10, type: 'office' },
  { name: 'Riverside Complex', floors: 6, type: 'mixed' },
  { name: 'North Star', floors: 9, type: 'office' },
  { name: 'Gateway Plaza', floors: 7, type: 'mixed' },
  { name: 'Tech Park East', floors: 4, type: 'tech' },
  { name: 'Crown Heights', floors: 8, type: 'residential' },
  { name: 'Liberty Square', floors: 6, type: 'office' },
  { name: 'Pinnacle Tower', floors: 20, type: 'office' },
  { name: 'Heritage Building', floors: 3, type: 'civic' },
  { name: 'Modern Canvas', floors: 5, type: 'mixed' },
  { name: 'Velocity Center', floors: 7, type: 'tech' },
  { name: 'Zenith Plaza', floors: 11, type: 'office' },
  { name: 'Eclipse Tower', floors: 14, type: 'office' },
  { name: 'Aurora Office', floors: 6, type: 'office' },
  { name: 'Nexus Building', floors: 8, type: 'tech' },
  { name: 'Vertex Square', floors: 5, type: 'retail' },
  { name: 'Prism Complex', floors: 9, type: 'mixed' },
];

// Manufacturers by category
const manufacturers = {
  HVAC: ['Carrier', 'Trane', 'Daikin', 'York', 'Lennox', 'McQuay', 'Mitsubishi'],
  Lighting: ['Lutron', 'Philips', 'Crestron', 'Leviton'],
  Fire: ['Notifier', 'Simplex', 'Edwards', 'Honeywell'],
  Electrical: ['Eaton', 'Schneider', 'ABB', 'Siemens'],
  Plumbing: ['Sloan', 'Kohler', 'Moen', 'Delta'],
  Security: ['Honeywell', 'Bosch', 'Axis', 'Hikvision'],
  Elevator: ['Otis', 'Schindler', 'KONE', 'ThyssenKrupp'],
};

// Helper to generate a random manufacturer
const getManufacturer = (category: keyof typeof manufacturers) =>
  manufacturers[category][Math.floor(seededRandom() * manufacturers[category].length)];

// Helper to generate install dates (2015-2023)
const getInstallDate = () => {
  const year = 2015 + Math.floor(seededRandom() * 9);
  const month = 1 + Math.floor(seededRandom() * 12);
  const day = 1 + Math.floor(seededRandom() * 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// Helper to generate maintenance dates (2023-2024)
const getMaintenanceDate = () => {
  const year = 2023 + Math.floor(seededRandom() * 2);
  const month = 1 + Math.floor(seededRandom() * 12);
  const day = 1 + Math.floor(seededRandom() * 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// Helper to generate asset status
const getStatus = () => {
  const statuses = ['operational', 'operational', 'operational', 'operational', 'maintenance', 'offline'];
  return statuses[Math.floor(seededRandom() * statuses.length)];
};

// Helper to create a building ID
const getBuildingId = (name: string) =>
  'building-' + name.toLowerCase().replace(/\s+/g, '-');

// Generate assets for a zone
const generateZoneAssets = (buildingId: string, floorNum: number, zone: string): AssetNode[] => {
  const assets: AssetNode[] = [];
  const zoneId = zone.toLowerCase().replace(/\s+/g, '-');

  // HVAC unit
  const hvacManuf = getManufacturer('HVAC');
  assets.push({
    id: `${buildingId}-hvac-${floorNum}-${zoneId}`,
    name: `HVAC Unit ${floorNum}${zone.charAt(0)}`,
    type: 'asset',
    metadata: {
      category: 'HVAC',
      manufacturer: hvacManuf,
      model: `${hvacManuf}-${Math.floor(seededRandom() * 900 + 100)}`,
      serialNumber: `${hvacManuf.substring(0, 3).toUpperCase()}-${floorNum}${zone.charAt(0).toUpperCase()}${String(Math.floor(seededRandom() * 99 + 1)).padStart(2, '0')}`,
      capacity: `${15 + Math.floor(seededRandom() * 35)} kW`,
      installDate: getInstallDate(),
      lastMaintenance: getMaintenanceDate(),
      floor: `Floor ${floorNum}`,
      zone: zone,
      status: getStatus(),
    }
  });

  // Lighting control
  const lightManuf = getManufacturer('Lighting');
  assets.push({
    id: `${buildingId}-light-${floorNum}-${zoneId}`,
    name: `Lighting Control ${floorNum}${zone.charAt(0)}`,
    type: 'asset',
    metadata: {
      category: 'Lighting',
      manufacturer: lightManuf,
      model: `${lightManuf} ${['Pro', 'Elite', 'Quantum'][Math.floor(seededRandom() * 3)]}`,
      serialNumber: `${lightManuf.substring(0, 3).toUpperCase()}-${floorNum}${zone.charAt(0).toUpperCase()}${String(Math.floor(seededRandom() * 99 + 1)).padStart(2, '0')}`,
      installDate: getInstallDate(),
      lastMaintenance: getMaintenanceDate(),
      floor: `Floor ${floorNum}`,
      zone: zone,
      status: getStatus(),
    }
  });

  // Add fire safety on some floors
  if (floorNum % 2 === 0 || floorNum === 1) {
    const fireManuf = getManufacturer('Fire');
    assets.push({
      id: `${buildingId}-fire-${floorNum}-${zoneId}`,
      name: `Fire System ${floorNum}${zone.charAt(0)}`,
      type: 'asset',
      metadata: {
        category: 'Fire Safety',
        manufacturer: fireManuf,
        model: `${fireManuf}-${Math.floor(seededRandom() * 9000 + 1000)}`,
        serialNumber: `${fireManuf.substring(0, 3).toUpperCase()}-${floorNum}${zone.charAt(0).toUpperCase()}${String(Math.floor(seededRandom() * 99 + 1)).padStart(2, '0')}`,
        installDate: getInstallDate(),
        lastMaintenance: getMaintenanceDate(),
        floor: `Floor ${floorNum}`,
        zone: zone,
        status: getStatus(),
      }
    });
  }

  // Add electrical panel
  if (floorNum % 3 === 0 || floorNum === 1) {
    const elecManuf = getManufacturer('Electrical');
    assets.push({
      id: `${buildingId}-elec-${floorNum}-${zoneId}`,
      name: `Electrical Panel ${floorNum}${zone.charAt(0)}`,
      type: 'asset',
      metadata: {
        category: 'Electrical',
        manufacturer: elecManuf,
        model: `${elecManuf}-${Math.floor(seededRandom() * 900 + 100)}`,
        serialNumber: `${elecManuf.substring(0, 3).toUpperCase()}-${floorNum}${zone.charAt(0).toUpperCase()}${String(Math.floor(seededRandom() * 99 + 1)).padStart(2, '0')}`,
        capacity: `${200 + Math.floor(seededRandom() * 400)}A`,
        installDate: getInstallDate(),
        lastMaintenance: getMaintenanceDate(),
        floor: `Floor ${floorNum}`,
        zone: zone,
        status: getStatus(),
      }
    });
  }

  return assets;
};

// Generate floors for a building
const generateFloors = (buildingId: string, numFloors: number, buildingType: string): AssetNode[] => {
  const floors: AssetNode[] = [];

  for (let i = 1; i <= numFloors; i++) {
    const floorName = i === 1 ? 'Floor 1 - Lobby' :
                      i === numFloors ? `Floor ${i} - ${buildingType === 'office' ? 'Executive' : 'Top Floor'}` :
                      `Floor ${i}`;

    // Determine zones based on building type
    const zones = i === 1 ? ['Main Area'] :
                  buildingType === 'residential' ? ['North Wing', 'South Wing'] :
                  buildingType === 'tech' ? ['Open Plan', 'Labs'] :
                  ['North Wing', 'South Wing', 'East Wing', 'West Wing'].slice(0, 2 + (i % 2));

    const zoneNodes: AssetNode[] = zones.map(zone => ({
      id: `${buildingId}-floor-${i}-${zone.toLowerCase().replace(/\s+/g, '-')}`,
      name: zone,
      type: 'zone',
      metadata: { status: 'operational' },
      children: generateZoneAssets(buildingId, i, zone)
    }));

    floors.push({
      id: `${buildingId}-floor-${i}`,
      name: floorName,
      type: 'floor',
      metadata: { status: 'operational' },
      children: zoneNodes
    });
  }

  return floors;
};

// Generate a complete building asset tree
const generateBuilding = (name: string, numFloors: number, buildingType: string): AssetNode => {
  const buildingId = getBuildingId(name);

  return {
    id: buildingId,
    name: name,
    type: 'building',
    metadata: {
      status: 'operational'
    },
    children: [
      {
        id: `${buildingId}-floors`,
        name: 'By Floors',
        type: 'category',
        children: generateFloors(buildingId, numFloors, buildingType)
      }
    ]
  };
};

// Generate all buildings
const allBuildings = buildingConfigs.map(config =>
  generateBuilding(config.name, config.floors, config.type)
);

// Helper to clone an asset for use in multiple tree paths
const cloneAsset = (asset: AssetNode): AssetNode => ({
  ...asset,
  id: asset.id,
  metadata: asset.metadata ? { ...asset.metadata } : undefined
});

// Collect all assets by category for system views
const collectAssetsByCategory = (buildings: AssetNode[], category: string): AssetNode[] => {
  const assets: AssetNode[] = [];
  const seen = new Set<string>();

  const traverse = (node: AssetNode) => {
    if (node.type === 'asset' && node.metadata?.category === category && !seen.has(node.id)) {
      assets.push(cloneAsset(node));
      seen.add(node.id);
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  };

  buildings.forEach(traverse);
  return assets;
};

// Digital Twin Asset Ontology - organized by asset types at top level
export const assetTree: AssetNode[] = [
  // Buildings Category
  {
    id: 'dt-buildings',
    name: 'Buildings',
    type: 'category',
    metadata: { status: 'operational' },
    children: allBuildings
  },
  // Systems Category
  {
    id: 'dt-systems',
    name: 'Systems',
    type: 'category',
    metadata: { status: 'operational' },
    children: [
      {
        id: 'dt-system-hvac',
        name: 'HVAC System',
        type: 'system',
        metadata: { status: 'operational' },
        children: collectAssetsByCategory(allBuildings, 'HVAC').slice(0, 50)
      },
      {
        id: 'dt-system-lighting',
        name: 'Lighting System',
        type: 'system',
        metadata: { status: 'operational' },
        children: collectAssetsByCategory(allBuildings, 'Lighting').slice(0, 50)
      },
      {
        id: 'dt-system-fire',
        name: 'Fire Safety System',
        type: 'system',
        metadata: { status: 'operational' },
        children: collectAssetsByCategory(allBuildings, 'Fire Safety').slice(0, 50)
      },
      {
        id: 'dt-system-electrical',
        name: 'Electrical System',
        type: 'system',
        metadata: { status: 'operational' },
        children: collectAssetsByCategory(allBuildings, 'Electrical').slice(0, 50)
      }
    ]
  },
  // Zones Category - Sample zones from first few buildings
  {
    id: 'dt-zones',
    name: 'Zones',
    type: 'category',
    metadata: { status: 'operational' },
    children: allBuildings.slice(0, 5).flatMap(building => {
      const floors = building.children?.[0]?.children || [];
      return floors.slice(0, 2).flatMap(floor =>
        (floor.children || []).map(zone => cloneAsset(zone))
      );
    })
  },
  // Equipment Types Category
  {
    id: 'dt-equipment',
    name: 'Equipment Types',
    type: 'category',
    metadata: { status: 'operational' },
    children: [
      {
        id: 'dt-equip-hvac',
        name: 'HVAC Equipment',
        type: 'category',
        metadata: { status: 'operational' },
        children: collectAssetsByCategory(allBuildings, 'HVAC').slice(0, 30)
      },
      {
        id: 'dt-equip-lighting',
        name: 'Lighting Controls',
        type: 'category',
        metadata: { status: 'operational' },
        children: collectAssetsByCategory(allBuildings, 'Lighting').slice(0, 30)
      },
      {
        id: 'dt-equip-life-safety',
        name: 'Life Safety Equipment',
        type: 'category',
        metadata: { status: 'operational' },
        children: collectAssetsByCategory(allBuildings, 'Fire Safety').slice(0, 30)
      }
    ]
  }
];

// Helper function to search the asset tree
export function searchAssetTree(query: string, tree: AssetNode[] = assetTree): AssetNode[] {
  const results: AssetNode[] = [];
  const seen = new Set<string>();

  const search = (nodes: AssetNode[]) => {
    for (const node of nodes) {
      if (!seen.has(node.id) &&
          (node.name.toLowerCase().includes(query.toLowerCase()) ||
           node.metadata?.category?.toLowerCase().includes(query.toLowerCase()) ||
           node.metadata?.model?.toLowerCase().includes(query.toLowerCase()))) {
        results.push(node);
        seen.add(node.id);
      }
      if (node.children) {
        search(node.children);
      }
    }
  };

  search(tree);
  return results;
}

// Helper to get asset by ID
export function getAssetById(id: string, tree: AssetNode[] = assetTree): AssetNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = getAssetById(id, node.children);
      if (found) return found;
    }
  }
  return null;
}

// Helper to filter tree by building
export function filterTreeByBuilding(buildingName: string): AssetNode[] {
  const buildingsCategory = assetTree.find(node => node.id === 'dt-buildings');
  if (!buildingsCategory || !buildingsCategory.children) return [];

  return buildingsCategory.children.filter(node => node.name === buildingName);
}

// A single breadcrumb segment with its node and sibling nodes at the same level
export interface PathSegment {
  node: AssetNode;
  siblings: AssetNode[];
}

// Returns the path from root to the given asset ID, skipping category nodes.
// Each segment includes the node and its siblings (for dropdown navigation).
export function getPathToAsset(
  id: string,
  tree: AssetNode[] = assetTree,
  currentPath: PathSegment[] = []
): PathSegment[] | null {
  const nonCategoryNodes = tree.filter(n => n.type !== 'category');

  for (const node of tree) {
    if (node.type === 'category') {
      if (node.children) {
        const result = getPathToAsset(id, node.children, currentPath);
        if (result) return result;
      }
      continue;
    }

    const newPath = [...currentPath, { node, siblings: nonCategoryNodes }];

    if (node.id === id) return newPath;

    if (node.children) {
      const result = getPathToAsset(id, node.children, newPath);
      if (result) return result;
    }
  }

  return null;
}

// Returns the first asset node found under (or equal to) a given node
export function getFirstAsset(node: AssetNode): AssetNode | null {
  if (node.type === 'asset') return node;
  if (node.children) {
    for (const child of node.children) {
      const found = getFirstAsset(child);
      if (found) return found;
    }
  }
  return null;
}
