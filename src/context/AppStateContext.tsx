'use client';

import React, { createContext, useContext, useState, useRef } from 'react';
import type { Building } from '@/data/buildings';
import type { Zone } from '@/data/zones';
import type { AssetNode } from '@/data/assetTree';
import type { BuildingDetailTab } from '@/components/BuildingDetailPage';
import type { ZoneDetailTab } from '@/components/ZoneDetailPage';
import type { AssetDetailTab } from '@/components/AssetDetailPage';
import type { NotificationsPanelHandle } from '@/components/NotificationsPanel';

export interface Favorite {
  id: string;
  name: string;
  type: string;
}

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

  // Side peek
  const [sidePeekBuilding, setSidePeekBuilding] = useState<Building | null>(null);
  const [sidePeekBuildingTab, setSidePeekBuildingTab] = useState<BuildingDetailTab>('overview');
  const [sidePeekZone, setSidePeekZone] = useState<Zone | null>(null);
  const [sidePeekZoneTab, setSidePeekZoneTab] = useState<ZoneDetailTab>('overview');
  const [sidePeekAsset, setSidePeekAsset] = useState<AssetNode | null>(null);
  const [sidePeekAssetTab, setSidePeekAssetTab] = useState<AssetDetailTab>('overview');

  // Favorites
  const [favorites, setFavorites] = useState<Favorite[]>([
    { id: '1', name: 'Skyline Plaza', type: 'building' },
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
      favorites, setFavorites,
      localQuickviewAsset, setLocalQuickviewAsset,
      openedViaInspect, setOpenedViaInspect,
      mobileNavRef, mobileBackdropRef,
      activeDashboardId, setActiveDashboardId,
      activeDashboardLabel, setActiveDashboardLabel,
      pendingDashboardId, setPendingDashboardId,
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
