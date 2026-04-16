/**
 * Asset mutations — stub data for the homepage "Work in progress" section.
 * Real mutation tracking doesn't exist in the codebase yet; this file simulates
 * entries so the UI can show "open" (awaiting review) and "processed" flows.
 */

export type AssetMutationKind = 'created' | 'deleted' | 'moved' | 'renamed';
export type AssetMutationStatus = 'open' | 'processed';

export interface AssetMutation {
  id: string;
  kind: AssetMutationKind;
  status: AssetMutationStatus;
  assetName: string;
  building: string;
  /** Free-form description, e.g. "added to Floor 3 · Zone B". */
  detail?: string;
  /** Who submitted / performed the mutation. */
  actor: string;
  /** ISO timestamp. Dates land in mid-Jan 2024 to stay consistent with MOCK_NOW. */
  timestamp: string;
}

export const assetMutations: AssetMutation[] = [
  {
    id: 'am-001',
    kind: 'created',
    status: 'open',
    assetName: 'VRV condensor unit 4B',
    building: 'Skyline Plaza',
    detail: 'Added to Floor 3 · East wing',
    actor: 'Lisa Bakker',
    timestamp: '2024-01-23T14:12:00Z',
  },
  {
    id: 'am-002',
    kind: 'deleted',
    status: 'open',
    assetName: 'Legacy boiler #02',
    building: 'Metro Heights',
    detail: 'Decommissioned during retrofit',
    actor: 'Jens de Vries',
    timestamp: '2024-01-22T09:45:00Z',
  },
  {
    id: 'am-003',
    kind: 'moved',
    status: 'open',
    assetName: 'Fire panel — central',
    building: 'Innovation Hub',
    detail: 'Relocated from Lobby to Plant room 1',
    actor: 'Maarten Koster',
    timestamp: '2024-01-21T16:30:00Z',
  },
  {
    id: 'am-004',
    kind: 'created',
    status: 'processed',
    assetName: 'Access turnstile 12',
    building: 'Gateway Center',
    detail: 'New install — main entrance',
    actor: 'Sofie Jansen',
    timestamp: '2024-01-18T11:00:00Z',
  },
  {
    id: 'am-005',
    kind: 'deleted',
    status: 'processed',
    assetName: 'CCTV camera 07',
    building: 'Riverside Complex',
    detail: 'Replaced by unit 07-B',
    actor: 'Pieter Smit',
    timestamp: '2024-01-16T08:20:00Z',
  },
  {
    id: 'am-006',
    kind: 'renamed',
    status: 'processed',
    assetName: 'AHU Rooftop North',
    building: 'Skyline Plaza',
    detail: 'Renamed from "AHU-R1"',
    actor: 'Lisa Bakker',
    timestamp: '2024-01-15T13:10:00Z',
  },
];
