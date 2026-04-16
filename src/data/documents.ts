import { randomFromArray, randomDate, padNumber, randomInt, STAFF_POOL, BUILDING_POOL } from './generators';
import { assetTree, type AssetNode } from './assetTree';

export type DocumentCategory = 'Contract' | 'Report' | 'Manual' | 'Certificate' | 'Drawing' | 'Specification' | 'Invoice' | 'Permit';

export interface DocumentFolder {
  id: string;
  type: 'folder';
  name: string;
  slug: string;
  parentId: string | null;
  modifiedDate: string;
  itemCount: number;
}

/** Reference to an asset linked to a document — id, display name, and the building it belongs to. */
export interface DocumentAssetRef {
  id: string;
  name: string;
  building: string;
}

export interface DocumentFile {
  id: string;
  type: 'file';
  title: string;
  /** List of building names this document relates to (can be empty if only asset-scoped). */
  buildings: string[];
  /** List of asset references this document relates to. */
  assets: DocumentAssetRef[];
  category: DocumentCategory;
  author: string;
  createdDate: string;
  modifiedDate: string;
  version: string;
  fileSize: string;
  fileType: string;
  parentId: string | null;
}

export type DocumentItem = DocumentFolder | DocumentFile;

const CATEGORY_OPTIONS: DocumentCategory[] = ['Contract', 'Report', 'Manual', 'Certificate', 'Drawing', 'Specification', 'Invoice', 'Permit'];

const DOCUMENT_TITLES: Record<DocumentCategory, string[]> = {
  Contract: [
    'HVAC Maintenance Service Agreement',
    'Annual Cleaning Services Contract',
    'Security Services Agreement',
    'Elevator Maintenance Contract',
    'Fire Protection Service Agreement',
    'Grounds Maintenance Contract',
    'Electrical Maintenance Agreement',
    'Plumbing Services Contract',
  ],
  Report: [
    'Monthly Energy Consumption Report',
    'Quarterly Safety Inspection Report',
    'Annual Building Performance Review',
    'Fire Safety Compliance Report',
    'Indoor Air Quality Assessment',
    'Structural Integrity Report',
    'Environmental Impact Assessment',
    'Facility Condition Assessment',
  ],
  Manual: [
    'HVAC System Operations Manual',
    'Building Emergency Procedures',
    'Fire Alarm System Manual',
    'BMS User Guide',
    'Elevator Operations Manual',
    'Security System Handbook',
    'Maintenance Procedures Manual',
    'Tenant Handbook',
  ],
  Certificate: [
    'Fire Safety Certificate',
    'Energy Performance Certificate',
    'Electrical Safety Certificate',
    'Legionella Compliance Certificate',
    'Elevator Inspection Certificate',
    'Building Occupancy Certificate',
    'Environmental Compliance Certificate',
    'Insurance Certificate',
  ],
  Drawing: [
    'Floor Plan - Level {floor}',
    'HVAC Layout Drawing',
    'Electrical Distribution Diagram',
    'Fire Escape Route Plan',
    'Plumbing Schematic',
    'Structural Engineering Drawing',
    'Landscape Design Plan',
    'Parking Layout Drawing',
  ],
  Specification: [
    'HVAC Equipment Specifications',
    'LED Lighting Specifications',
    'Security Camera Specifications',
    'Fire Suppression System Specs',
    'Elevator Modernization Specs',
    'Window Replacement Specifications',
    'Roofing Material Specifications',
    'Access Control System Specs',
  ],
  Invoice: [
    'HVAC Maintenance - Q{quarter} {year}',
    'Cleaning Services - {month} {year}',
    'Security Services Invoice',
    'Elevator Maintenance Invoice',
    'Emergency Repair Invoice',
    'Annual Insurance Premium',
    'Utility Services Invoice',
    'Landscaping Services Invoice',
  ],
  Permit: [
    'Building Renovation Permit',
    'Electrical Work Permit',
    'Plumbing Work Permit',
    'Fire System Modification Permit',
    'Structural Alteration Permit',
    'Environmental Discharge Permit',
    'Demolition Permit',
    'Occupancy Change Permit',
  ],
};

const FILE_TYPES: Record<DocumentCategory, string[]> = {
  Contract: ['PDF'],
  Report: ['PDF', 'XLSX'],
  Manual: ['PDF', 'DOCX'],
  Certificate: ['PDF'],
  Drawing: ['PDF', 'DWG', 'DXF'],
  Specification: ['PDF', 'DOCX'],
  Invoice: ['PDF', 'XLSX'],
  Permit: ['PDF'],
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function generateTitle(category: DocumentCategory): string {
  let title = randomFromArray(DOCUMENT_TITLES[category]);
  title = title
    .replace('{floor}', String(randomInt(0, 12)))
    .replace('{quarter}', String(randomInt(1, 4)))
    .replace('{year}', String(randomInt(2023, 2024)))
    .replace('{month}', randomFromArray(MONTHS));
  return title;
}

function generateFileSize(): string {
  const sizeKB = randomInt(50, 25000);
  if (sizeKB >= 1000) {
    return `${(sizeKB / 1000).toFixed(1)} MB`;
  }
  return `${sizeKB} KB`;
}

// ── Folder structure ──

const ROOT_FOLDERS: { id: string; name: string; slug: string }[] = [
  { id: 'folder-contracts', name: 'Contracts', slug: 'contracts' },
  { id: 'folder-reports', name: 'Reports', slug: 'reports' },
  { id: 'folder-manuals', name: 'Manuals & Guides', slug: 'manuals' },
  { id: 'folder-certificates', name: 'Certificates', slug: 'certificates' },
  { id: 'folder-drawings', name: 'Drawings & Plans', slug: 'drawings' },
  { id: 'folder-invoices', name: 'Invoices', slug: 'invoices' },
  { id: 'folder-permits', name: 'Permits', slug: 'permits' },
  { id: 'folder-specifications', name: 'Specifications', slug: 'specifications' },
];

const SUB_FOLDERS: { id: string; name: string; slug: string; parentId: string }[] = [
  { id: 'folder-contracts-2023', name: '2023', slug: '2023', parentId: 'folder-contracts' },
  { id: 'folder-contracts-2024', name: '2024', slug: '2024', parentId: 'folder-contracts' },
  { id: 'folder-reports-monthly', name: 'Monthly Reports', slug: 'monthly-reports', parentId: 'folder-reports' },
  { id: 'folder-reports-quarterly', name: 'Quarterly Reports', slug: 'quarterly-reports', parentId: 'folder-reports' },
  { id: 'folder-reports-annual', name: 'Annual Reviews', slug: 'annual-reviews', parentId: 'folder-reports' },
  { id: 'folder-drawings-hvac', name: 'HVAC', slug: 'hvac', parentId: 'folder-drawings' },
  { id: 'folder-drawings-electrical', name: 'Electrical', slug: 'electrical', parentId: 'folder-drawings' },
  { id: 'folder-drawings-floorplans', name: 'Floor Plans', slug: 'floor-plans', parentId: 'folder-drawings' },
  { id: 'folder-invoices-2023', name: '2023', slug: '2023', parentId: 'folder-invoices' },
  { id: 'folder-invoices-2024', name: '2024', slug: '2024', parentId: 'folder-invoices' },
  { id: 'folder-certificates-fire', name: 'Fire Safety', slug: 'fire-safety', parentId: 'folder-certificates' },
  { id: 'folder-certificates-energy', name: 'Energy', slug: 'energy', parentId: 'folder-certificates' },
];

// Map categories to likely parent folders
const CATEGORY_FOLDER_MAP: Record<DocumentCategory, string[]> = {
  Contract: ['folder-contracts-2023', 'folder-contracts-2024', 'folder-contracts'],
  Report: ['folder-reports-monthly', 'folder-reports-quarterly', 'folder-reports-annual', 'folder-reports'],
  Manual: ['folder-manuals'],
  Certificate: ['folder-certificates-fire', 'folder-certificates-energy', 'folder-certificates'],
  Drawing: ['folder-drawings-hvac', 'folder-drawings-electrical', 'folder-drawings-floorplans', 'folder-drawings'],
  Specification: ['folder-specifications'],
  Invoice: ['folder-invoices-2023', 'folder-invoices-2024', 'folder-invoices'],
  Permit: ['folder-permits'],
};

/** Collect flat list of asset nodes per building from the asset tree. */
function collectAssetsByBuilding(): Map<string, DocumentAssetRef[]> {
  const byBuilding = new Map<string, DocumentAssetRef[]>();
  const buildingsNode = assetTree.find(n => n.id === 'dt-buildings');
  if (!buildingsNode?.children) return byBuilding;

  const traverse = (node: AssetNode, building: string) => {
    const nextBuilding = node.type === 'building' ? node.name : building;
    if (node.type === 'asset') {
      if (!byBuilding.has(nextBuilding)) byBuilding.set(nextBuilding, []);
      byBuilding.get(nextBuilding)!.push({ id: node.id, name: node.name, building: nextBuilding });
    }
    if (node.children) node.children.forEach(c => traverse(c, nextBuilding));
  };

  buildingsNode.children.forEach(b => traverse(b, ''));
  return byBuilding;
}

/** Pick N distinct items from an array (using seeded generator). */
function pickDistinct<T>(arr: T[], n: number): T[] {
  if (n >= arr.length) return [...arr];
  const pool = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n; i++) {
    const idx = randomInt(0, pool.length - 1);
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}

/**
 * Decide how a document should be linked to buildings/assets based on its category.
 * Returns the number of buildings and assets to attach.
 */
function pickLinkageCounts(category: DocumentCategory): { buildingCount: number; assetCount: number } {
  // Roll a 1..100 bucket
  const roll = randomInt(1, 100);

  // Category-driven profiles — some categories lean wider (reports, manuals),
  // others lean narrower (certificates, permits, invoices).
  switch (category) {
    case 'Report':
      if (roll <= 40) return { buildingCount: 1, assetCount: 0 };
      if (roll <= 60) return { buildingCount: randomInt(2, 5), assetCount: 0 };
      if (roll <= 80) return { buildingCount: randomInt(3, 8), assetCount: randomInt(0, 3) };
      if (roll <= 92) return { buildingCount: randomInt(10, 15), assetCount: 0 };
      return { buildingCount: randomInt(1, 2), assetCount: randomInt(2, 6) };
    case 'Manual':
      if (roll <= 30) return { buildingCount: 0, assetCount: randomInt(1, 3) };
      if (roll <= 55) return { buildingCount: 1, assetCount: randomInt(1, 2) };
      if (roll <= 80) return { buildingCount: randomInt(2, 6), assetCount: randomInt(0, 2) };
      return { buildingCount: randomInt(8, 15), assetCount: 0 };
    case 'Drawing':
      if (roll <= 55) return { buildingCount: 1, assetCount: 0 };
      if (roll <= 80) return { buildingCount: 1, assetCount: randomInt(1, 4) };
      if (roll <= 95) return { buildingCount: 0, assetCount: randomInt(1, 3) };
      return { buildingCount: randomInt(2, 4), assetCount: randomInt(0, 2) };
    case 'Specification':
      if (roll <= 40) return { buildingCount: 0, assetCount: randomInt(1, 3) };
      if (roll <= 65) return { buildingCount: 1, assetCount: randomInt(0, 2) };
      if (roll <= 90) return { buildingCount: randomInt(2, 5), assetCount: randomInt(1, 3) };
      return { buildingCount: randomInt(6, 12), assetCount: randomInt(0, 2) };
    case 'Contract':
      if (roll <= 60) return { buildingCount: 1, assetCount: 0 };
      if (roll <= 85) return { buildingCount: randomInt(2, 4), assetCount: 0 };
      return { buildingCount: randomInt(5, 12), assetCount: 0 };
    case 'Invoice':
      if (roll <= 70) return { buildingCount: 1, assetCount: 0 };
      if (roll <= 90) return { buildingCount: 1, assetCount: randomInt(1, 2) };
      return { buildingCount: randomInt(2, 4), assetCount: 0 };
    case 'Certificate':
      if (roll <= 70) return { buildingCount: 1, assetCount: 0 };
      if (roll <= 90) return { buildingCount: 1, assetCount: randomInt(1, 2) };
      return { buildingCount: randomInt(2, 5), assetCount: 0 };
    case 'Permit':
      if (roll <= 75) return { buildingCount: 1, assetCount: 0 };
      if (roll <= 95) return { buildingCount: 1, assetCount: randomInt(1, 3) };
      return { buildingCount: randomInt(2, 3), assetCount: 0 };
  }
}

function generateDocuments(): { folders: DocumentFolder[]; files: DocumentFile[]; allItems: DocumentItem[] } {
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2024-01-23');
  const modifiedEnd = new Date('2024-01-23');

  const assetsByBuilding = collectAssetsByBuilding();
  const buildingsWithAssets = Array.from(assetsByBuilding.keys());

  // Create folder objects
  const folders: DocumentFolder[] = [];

  for (const rf of ROOT_FOLDERS) {
    const subCount = SUB_FOLDERS.filter(sf => sf.parentId === rf.id).length;
    folders.push({
      id: rf.id,
      type: 'folder',
      name: rf.name,
      slug: rf.slug,
      parentId: null,
      modifiedDate: randomDate(new Date('2024-01-01'), modifiedEnd),
      itemCount: subCount + randomInt(2, 8),
    });
  }

  for (const sf of SUB_FOLDERS) {
    folders.push({
      id: sf.id,
      type: 'folder',
      name: sf.name,
      slug: sf.slug,
      parentId: sf.parentId,
      modifiedDate: randomDate(new Date('2023-06-01'), modifiedEnd),
      itemCount: randomInt(3, 15),
    });
  }

  // Create file objects
  const files: DocumentFile[] = [];

  for (let i = 1; i <= 160; i++) {
    const category = randomFromArray(CATEGORY_OPTIONS);
    const possibleParents = CATEGORY_FOLDER_MAP[category];
    // Some files at root level (null), most in folders
    const parentId = randomInt(0, 10) > 2 ? randomFromArray(possibleParents) : null;

    const createdDate = randomDate(startDate, endDate);
    const createdDateObj = new Date(createdDate);
    const modifiedDate = randomDate(createdDateObj, modifiedEnd);

    const majorVersion = randomInt(1, 5);
    const minorVersion = randomInt(0, 9);

    // Pick buildings + assets per category profile
    const { buildingCount, assetCount } = pickLinkageCounts(category);
    const buildings = pickDistinct(BUILDING_POOL, buildingCount);

    // Assets must belong to one of the linked buildings — or, if no buildings were
    // picked, source them from any building (makes sense for purely asset-scoped docs).
    const assetSourceBuildings = buildings.length > 0
      ? buildings.filter(b => assetsByBuilding.has(b))
      : buildingsWithAssets;

    const assetPool: DocumentAssetRef[] = assetSourceBuildings.flatMap(b => assetsByBuilding.get(b) ?? []);
    const assets = assetCount > 0 && assetPool.length > 0
      ? pickDistinct(assetPool, Math.min(assetCount, assetPool.length))
      : [];

    // Guarantee every document is linked to at least one building or asset
    const safeBuildings = buildings.length === 0 && assets.length === 0
      ? [randomFromArray(BUILDING_POOL)]
      : buildings;

    files.push({
      id: `DOC-2024-${padNumber(i, 3)}`,
      type: 'file',
      title: generateTitle(category),
      buildings: safeBuildings,
      assets,
      category,
      author: randomFromArray(STAFF_POOL),
      createdDate,
      modifiedDate,
      version: `${majorVersion}.${minorVersion}`,
      fileSize: generateFileSize(),
      fileType: randomFromArray(FILE_TYPES[category]),
      parentId,
    });
  }

  return { folders, files, allItems: [...folders, ...files] };
}

const generated = generateDocuments();

export const documentFolders: DocumentFolder[] = generated.folders;
export const documentFiles: DocumentFile[] = generated.files;
export const allDocumentItems: DocumentItem[] = generated.allItems;

/** Resolve a URL path segments array (e.g. ['reports', 'monthly-reports']) to a folder ID, or null if not found. */
export function resolveFolderPath(pathSegments: string[]): DocumentFolder | null {
  let currentParentId: string | null = null;
  let currentFolder: DocumentFolder | null = null;

  for (const segment of pathSegments) {
    const folder = documentFolders.find(f => f.slug === segment && f.parentId === currentParentId);
    if (!folder) return null;
    currentFolder = folder;
    currentParentId = folder.id;
  }

  return currentFolder;
}

/** Build the URL path for a folder (e.g. 'reports/monthly-reports'). */
export function buildFolderPath(folderId: string): string {
  const segments: string[] = [];
  let currentId: string | null = folderId;
  while (currentId) {
    const folder = documentFolders.find(f => f.id === currentId);
    if (!folder) break;
    segments.unshift(folder.slug);
    currentId = folder.parentId;
  }
  return segments.join('/');
}
