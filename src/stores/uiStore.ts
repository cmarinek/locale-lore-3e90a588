// UI state management - SSOT for modals, drawers, sidebars, and overlays
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Modal state
  activeModal: string | null;
  modalData: any;
  openModal: (modalId: string, data?: any) => void;
  closeModal: () => void;
  
  // Drawer/Sidebar state
  leftDrawerOpen: boolean;
  rightDrawerOpen: boolean;
  toggleLeftDrawer: () => void;
  toggleRightDrawer: () => void;
  setLeftDrawerOpen: (open: boolean) => void;
  setRightDrawerOpen: (open: boolean) => void;
  
  // Map UI state
  showMapLegend: boolean;
  showMapStats: boolean;
  showMapFilters: boolean;
  toggleMapLegend: () => void;
  toggleMapStats: () => void;
  toggleMapFilters: () => void;
  
  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Toast/Notification state (for tracking, actual display handled by sonner)
  lastToastId: string | null;
  setLastToastId: (id: string) => void;
  
  // Mobile-specific
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  
  // Search overlay
  isSearchOverlayOpen: boolean;
  toggleSearchOverlay: () => void;
  
  // Panel visibility
  visiblePanels: Set<string>;
  showPanel: (panelId: string) => void;
  hidePanel: (panelId: string) => void;
  togglePanel: (panelId: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Modal state
      activeModal: null,
      modalData: null,
      openModal: (modalId: string, data?: any) => {
        set({ activeModal: modalId, modalData: data });
      },
      closeModal: () => {
        set({ activeModal: null, modalData: null });
      },
      
      // Drawer state
      leftDrawerOpen: false,
      rightDrawerOpen: false,
      toggleLeftDrawer: () => set((state) => ({ leftDrawerOpen: !state.leftDrawerOpen })),
      toggleRightDrawer: () => set((state) => ({ rightDrawerOpen: !state.rightDrawerOpen })),
      setLeftDrawerOpen: (open: boolean) => set({ leftDrawerOpen: open }),
      setRightDrawerOpen: (open: boolean) => set({ rightDrawerOpen: open }),
      
      // Map UI state (persisted preferences)
      showMapLegend: true,
      showMapStats: true,
      showMapFilters: false,
      toggleMapLegend: () => set((state) => ({ showMapLegend: !state.showMapLegend })),
      toggleMapStats: () => set((state) => ({ showMapStats: !state.showMapStats })),
      toggleMapFilters: () => set((state) => ({ showMapFilters: !state.showMapFilters })),
      
      // Loading states
      globalLoading: false,
      loadingMessage: null,
      setGlobalLoading: (loading: boolean, message?: string) => {
        set({ globalLoading: loading, loadingMessage: message || null });
      },
      
      // Toast state
      lastToastId: null,
      setLastToastId: (id: string) => set({ lastToastId: id }),
      
      // Mobile menu
      isMobileMenuOpen: false,
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      
      // Search overlay
      isSearchOverlayOpen: false,
      toggleSearchOverlay: () => set((state) => ({ isSearchOverlayOpen: !state.isSearchOverlayOpen })),
      
      // Panel visibility
      visiblePanels: new Set(),
      showPanel: (panelId: string) => {
        const panels = new Set(get().visiblePanels);
        panels.add(panelId);
        set({ visiblePanels: panels });
      },
      hidePanel: (panelId: string) => {
        const panels = new Set(get().visiblePanels);
        panels.delete(panelId);
        set({ visiblePanels: panels });
      },
      togglePanel: (panelId: string) => {
        const panels = new Set(get().visiblePanels);
        if (panels.has(panelId)) {
          panels.delete(panelId);
        } else {
          panels.add(panelId);
        }
        set({ visiblePanels: panels });
      },
    }),
    {
      name: 'ui-store',
      // Only persist user preferences, not transient state
      partialize: (state) => ({
        showMapLegend: state.showMapLegend,
        showMapStats: state.showMapStats,
        showMapFilters: state.showMapFilters,
      }),
    }
  )
);
