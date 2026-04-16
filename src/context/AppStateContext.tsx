'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import type { Building } from '@/data/buildings';
import type { Zone } from '@/data/zones';
import type { AssetNode } from '@/data/assetTree';
import type { BuildingDetailTab } from '@/templates/building';
import type { ZoneDetailTab } from '@/templates/zone';
import type { AssetDetailTab } from '@/templates/asset';
import type { Ticket } from '@/data/tickets';
import type { Quotation } from '@/data/quotations';
import type { NotificationsPanelHandle } from '@/components/NotificationsPanel';

export interface Favorite {
  id: string;
  name: string;
  type: string;
}

/**
 * Lightweight side-peek payload for entity kinds that don't have their own
 * dedicated template yet (insight, mutation, maintenance, document). Renders
 * as a simple card inside the SidePeekPanel with a "coming soon" hint so the
 * homepage can route every row to *some* peek without 404-style navigation.
 */
export type PlaceholderPeekKind = 'insight' | 'mutation' | 'maintenance' | 'document';
export interface PlaceholderPeek {
  kind: PlaceholderPeekKind;
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  /** Optional label/value pairs rendered as a small definition list. */
  metadata?: Array<{ label: string; value: string }>;
  /** Optional ISO timestamp shown under the title. */
  timestamp?: string;
}

export type RecentItemKind = 'building' | 'zone' | 'asset' | 'ticket' | 'quotation';

export interface RecentItem {
  kind: RecentItemKind;
  id: string;
  label: string;
  subtitle?: string;
  visitedAt: string; // ISO timestamp
}

const RECENT_STORAGE_KEY = 'pulse:recentlyVisited';
const RECENT_MAX = 20;

interface ExportToast {
  open: boolean;
  message: string;
  severity: 'info' | 'success';
}

interface AppStateValue {
  // Sidebar
  leftSidebarCollapsed: boolean;
  setLeftSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;

  // Notifications
  notificationsPanelOpen: boolean;
  setNotificationsPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  notificationsRef: React.RefObject<NotificationsPanelHandle | null>;
  hasUnreadNotifications: boolean;
  setHasUnreadNotifications: React.Dispatch<React.SetStateAction<boolean>>;

  // Data explorer
  dataExplorerOpen: boolean;
  setDataExplorerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dataExplorerWidth: number;
  setDataExplorerWidth: React.Dispatch<React.SetStateAction<number>>;

  // Export toast
  exportToast: ExportToast;
  setExportToast: React.Dispatch<React.SetStateAction<ExportToast>>;

  // Side peek - building
  sidePeekBuilding: Building | null;
  setSidePeekBuilding: React.Dispatch<React.SetStateAction<Building | null>>;
  sidePeekBuildingTab: BuildingDetailTab;
  setSidePeekBuildingTab: React.Dispatch<React.SetStateAction<BuildingDetailTab>>;

  // Side peek - zone
  sidePeekZone: Zone | null;
  setSidePeekZone: React.Dispatch<React.SetStateAction<Zone | null>>;
  sidePeekZoneTab: ZoneDetailTab;
  setSidePeekZoneTab: React.Dispatch<React.SetStateAction<ZoneDetailTab>>;

  // Side peek - asset
  sidePeekAsset: AssetNode | null;
  setSidePeekAsset: React.Dispatch<React.SetStateAction<AssetNode | null>>;
  sidePeekAssetTab: AssetDetailTab;
  setSidePeekAssetTab: React.Dispatch<React.SetStateAction<AssetDetailTab>>;

  // Side peek - ticket
  sidePeekTicket: Ticket | null;
  setSidePeekTicket: React.Dispatch<React.SetStateAction<Ticket | null>>;

  // Side peek - quotation
  sidePeekQuotation: Quotation | null;
  setSidePeekQuotation: React.Dispatch<React.SetStateAction<Quotation | null>>;

  // Side peek - generic placeholder (insight / mutation / maintenance / document)
  sidePeekPlaceholder: PlaceholderPeek | null;
  setSidePeekPlaceholder: React.Dispatch<React.SetStateAction<PlaceholderPeek | null>>;

  // Favorites
  favorites: Favorite[];
  setFavorites: React.Dispatch<React.SetStateAction<Favorite[]>>;

  // Asset quickview (non-URL-serializable synthetic nodes)
  localQuickviewAsset: AssetNode | null;
  setLocalQuickviewAsset: React.Dispatch<React.SetStateAction<AssetNode | null>>;
  openedViaInspect: boolean;
  setOpenedViaInspect: React.Dispatch<React.SetStateAction<boolean>>;

  // Mobile nav refs
  mobileNavRef: React.RefObject<HTMLDivElement | null>;
  mobileBackdropRef: React.RefObject<HTMLDivElement | null>;

  // Dashboard
  activeDashboardId: string;
  setActiveDashboardId: React.Dispatch<React.SetStateAction<string>>;
  activeDashboardLabel: string;
  setActiveDashboardLabel: React.Dispatch<React.SetStateAction<string>>;
  pendingDashboardId: string | null;
  setPendingDashboardId: React.Dispatch<React.SetStateAction<string | null>>;

  // Recently visited (persisted to localStorage)
  recentlyVisited: RecentItem[];
  addRecentlyVisited: (item: Omit<RecentItem, 'visitedAt'> & { visitedAt?: string }) => void;
  clearRecentlyVisited: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  // Sidebar
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);

  // Notifications
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const notificationsRef = useRef<NotificationsPanelHandle>(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  // Data explorer
  const [dataExplorerOpen, setDataExplorerOpen] = useState(false);
  const [dataExplorerWidth, setDataExplorerWidth] = useState(0);

  // Export toast
  const [exportToast, setExportToast] = useState<ExportToast>({ open: false, message: '', severity: 'info' });

  // Side peek — only one can be open at a time
  const [sidePeekBuilding, _setSidePeekBuilding] = useState<Building | null>(null);
  const [sidePeekBuildingTab, setSidePeekBuildingTab] = useState<BuildingDetailTab>('overview');
  const [sidePeekZone, _setSidePeekZone] = useState<Zone | null>(null);
  const [sidePeekZoneTab, setSidePeekZoneTab] = useState<ZoneDetailTab>('overview');
  const [sidePeekAsset, _setSidePeekAsset] = useState<AssetNode | null>(null);
  const [sidePeekAssetTab, setSidePeekAssetTab] = useState<AssetDetailTab>('overview');
  const [sidePeekTicket, _setSidePeekTicket] = useState<Ticket | null>(null);
  const [sidePeekQuotation, _setSidePeekQuotation] = useState<Quotation | null>(null);
  const [sidePeekPlaceholder, _setSidePeekPlaceholder] = useState<PlaceholderPeek | null>(null);

  // Wrappers that enforce single-peek: opening one closes the others
  const setSidePeekBuilding: typeof _setSidePeekBuilding = (v) => {
    _setSidePeekBuilding(v);
    if (v) { _setSidePeekZone(null); _setSidePeekAsset(null); _setSidePeekTicket(null); _setSidePeekQuotation(null); _setSidePeekPlaceholder(null); }
  };
  const setSidePeekZone: typeof _setSidePeekZone = (v) => {
    _setSidePeekZone(v);
    if (v) { _setSidePeekBuilding(null); _setSidePeekAsset(null); _setSidePeekTicket(null); _setSidePeekQuotation(null); _setSidePeekPlaceholder(null); }
  };
  const setSidePeekAsset: typeof _setSidePeekAsset = (v) => {
    _setSidePeekAsset(v);
    if (v) { _setSidePeekBuilding(null); _setSidePeekZone(null); _setSidePeekTicket(null); _setSidePeekQuotation(null); _setSidePeekPlaceholder(null); }
  };
  const setSidePeekTicket: typeof _setSidePeekTicket = (v) => {
    _setSidePeekTicket(v);
    if (v) { _setSidePeekBuilding(null); _setSidePeekZone(null); _setSidePeekAsset(null); _setSidePeekQuotation(null); _setSidePeekPlaceholder(null); }
  };
  const setSidePeekQuotation: typeof _setSidePeekQuotation = (v) => {
    _setSidePeekQuotation(v);
    if (v) { _setSidePeekBuilding(null); _setSidePeekZone(null); _setSidePeekAsset(null); _setSidePeekTicket(null); _setSidePeekPlaceholder(null); }
  };
  const setSidePeekPlaceholder: typeof _setSidePeekPlaceholder = (v) => {
    _setSidePeekPlaceholder(v);
    if (v) { _setSidePeekBuilding(null); _setSidePeekZone(null); _setSidePeekAsset(null); _setSidePeekTicket(null); _setSidePeekQuotation(null); }
  };

  // Favorites — default to a real tenant building so the sidebar never shows
  // legacy mock names. "Philips Healthcare Best" is the portfolio default.
  const [favorites, setFavorites] = useState<Favorite[]>([
    { id: '1', name: 'PHB Geb. HQ', type: 'building' },
    { id: '2', name: 'Aanpassen verlichting', type: 'task' },
    { id: '3', name: 'Reparatie toilet 1e ver', type: 'task' },
  ]);

  // Asset quickview
  const [localQuickviewAsset, setLocalQuickviewAsset] = useState<AssetNode | null>(null);
  const [openedViaInspect, setOpenedViaInspect] = useState(false);

  // Mobile nav refs
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobileBackdropRef = useRef<HTMLDivElement>(null);

  // Dashboard
  const [activeDashboardId, setActiveDashboardId] = useState('');
  const [activeDashboardLabel, setActiveDashboardLabel] = useState('');
  const [pendingDashboardId, setPendingDashboardId] = useState<string | null>(null);

  // Recently visited — hydrate from localStorage after mount (SSR-safe)
  const [recentlyVisited, setRecentlyVisited] = useState<RecentItem[]>([]);
  const recentlyVisitedHydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setRecentlyVisited(parsed);
      }
    } catch { /* ignore */ }
    recentlyVisitedHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!recentlyVisitedHydrated.current) return;
    try {
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentlyVisited));
    } catch { /* ignore */ }
  }, [recentlyVisited]);

  const addRecentlyVisited = useCallback<AppStateValue['addRecentlyVisited']>((item) => {
    setRecentlyVisited(prev => {
      const visitedAt = item.visitedAt ?? new Date().toISOString();
      const next: RecentItem = { ...item, visitedAt };
      const without = prev.filter(x => !(x.kind === next.kind && x.id === next.id));
      return [next, ...without].slice(0, RECENT_MAX);
    });
  }, []);

  const clearRecentlyVisited = useCallback(() => setRecentlyVisited([]), []);

  return (
    <AppStateContext.Provider value={{
      leftSidebarCollapsed, setLeftSidebarCollapsed,
      notificationsPanelOpen, setNotificationsPanelOpen,
      notificationsRef,
      hasUnreadNotifications, setHasUnreadNotifications,
      dataExplorerOpen, setDataExplorerOpen,
      dataExplorerWidth, setDataExplorerWidth,
      exportToast, setExportToast,
      sidePeekBuilding, setSidePeekBuilding,
      sidePeekBuildingTab, setSidePeekBuildingTab,
      sidePeekZone, setSidePeekZone,
      sidePeekZoneTab, setSidePeekZoneTab,
      sidePeekAsset, setSidePeekAsset,
      sidePeekAssetTab, setSidePeekAssetTab,
      sidePeekTicket, setSidePeekTicket,
      sidePeekQuotation, setSidePeekQuotation,
      sidePeekPlaceholder, setSidePeekPlaceholder,
      favorites, setFavorites,
      localQuickviewAsset, setLocalQuickviewAsset,
      openedViaInspect, setOpenedViaInspect,
      mobileNavRef, mobileBackdropRef,
      activeDashboardId, setActiveDashboardId,
      activeDashboardLabel, setActiveDashboardLabel,
      pendingDashboardId, setPendingDashboardId,
      recentlyVisited, addRecentlyVisited, clearRecentlyVisited,
    }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
