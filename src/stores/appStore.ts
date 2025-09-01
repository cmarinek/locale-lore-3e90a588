import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';

// Enhanced mobile utilities
export const mobileUtils = {
  // Haptic feedback for different interactions
  hapticFeedback: {
    light: () => Haptics.impact({ style: ImpactStyle.Light }),
    medium: () => Haptics.impact({ style: ImpactStyle.Medium }),
    heavy: () => Haptics.impact({ style: ImpactStyle.Heavy }),
    selection: () => Haptics.selectionChanged(),
    notification: (type: 'success' | 'warning' | 'error') => 
      Haptics.notification({ type: type.toUpperCase() as any }),
  },

  // Status bar management
  statusBar: {
    setLight: () => StatusBar.setStyle({ style: Style.Light }),
    setDark: () => StatusBar.setStyle({ style: Style.Dark }),
    hide: () => StatusBar.hide(),
    show: () => StatusBar.show(),
  },

  // Keyboard management
  keyboard: {
    hide: () => Keyboard.hide(),
    show: () => Keyboard.show(),
  },

  // Touch utilities
  preventZoom: (element: HTMLElement) => {
    element.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
  },

  // Safe area utilities
  getSafeAreaInsets: () => {
    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
    };
  },
};

interface User {
  id: string;
  email: string;
  profile?: {
    display_name?: string;
    avatar_url?: string;
    bio?: string;
  };
}

interface SearchState {
  query: string;
  location?: { lat: number; lng: number; name?: string };
  category?: string;
  verified?: boolean;
  timeRange?: string;
  sortBy: 'relevance' | 'date' | 'popularity';
  searchHistory: string[];
  savedSearches: Array<{
    id: string;
    name: string;
    query: string;
    filters: any;
    createdAt: string;
  }>;
}

interface MobileState {
  // Touch and gesture state
  isScrolling: boolean;
  lastTouchTime: number;
  swipeDirection: 'up' | 'down' | 'left' | 'right' | null;
  
  // UI state optimized for mobile
  keyboardVisible: boolean;
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
  deviceOrientation: 'portrait' | 'landscape';
  isOnline: boolean;
  
  // Performance optimizations
  reduceAnimations: boolean;
  imageQuality: 'low' | 'medium' | 'high';
  prefetchEnabled: boolean;
}

interface AppState {
  // User data
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Search state
  search: SearchState;
  setSearchQuery: (query: string) => void;
  setSearchLocation: (location: { lat: number; lng: number; name?: string } | undefined) => void;
  setSearchCategory: (category: string | undefined) => void;
  setSearchVerified: (verified: boolean | undefined) => void;
  setSearchTimeRange: (timeRange: string | undefined) => void;
  setSearchSortBy: (sortBy: 'relevance' | 'date' | 'popularity') => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  addSavedSearch: (name: string, query: string, filters: any) => void;
  removeSavedSearch: (id: string) => void;
  clearSearchFilters: () => void;
  
  // Mobile-specific state
  mobile: MobileState;
  setScrolling: (isScrolling: boolean) => void;
  setSwipeDirection: (direction: 'up' | 'down' | 'left' | 'right' | null) => void;
  setKeyboardVisible: (visible: boolean) => void;
  setSafeAreaInsets: (insets: { top: number; bottom: number; left: number; right: number }) => void;
  setDeviceOrientation: (orientation: 'portrait' | 'landscape') => void;
  setOnlineStatus: (isOnline: boolean) => void;
  toggleReduceAnimations: () => void;
  setImageQuality: (quality: 'low' | 'medium' | 'high') => void;
  
  // UI state
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  activeTab: 'explore' | 'search' | 'submit' | 'profile';
  setActiveTab: (tab: 'explore' | 'search' | 'submit' | 'profile') => void;
  
  // Mobile actions with haptic feedback
  triggerHapticFeedback: (type: 'light' | 'medium' | 'heavy' | 'selection') => void;
  handleTouchInteraction: (type: 'tap' | 'swipe' | 'longPress') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      search: {
        query: '',
        location: undefined,
        category: undefined,
        verified: undefined,
        timeRange: undefined,
        sortBy: 'relevance',
        searchHistory: [],
        savedSearches: [],
      },
      mobile: {
        isScrolling: false,
        lastTouchTime: 0,
        swipeDirection: null,
        keyboardVisible: false,
        safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
        deviceOrientation: 'portrait',
        isOnline: navigator.onLine,
        reduceAnimations: false,
        imageQuality: 'medium',
        prefetchEnabled: true,
      },
      isMobileMenuOpen: false,
      activeTab: 'explore',

      // User actions
      setUser: (user) => set({ user }),

      // Search actions
      setSearchQuery: (query) =>
        set((state) => ({
          search: { ...state.search, query },
        })),

      setSearchLocation: (location) =>
        set((state) => ({
          search: { ...state.search, location },
        })),

      setSearchCategory: (category) =>
        set((state) => ({
          search: { ...state.search, category },
        })),

      setSearchVerified: (verified) =>
        set((state) => ({
          search: { ...state.search, verified },
        })),

      setSearchTimeRange: (timeRange) =>
        set((state) => ({
          search: { ...state.search, timeRange },
        })),

      setSearchSortBy: (sortBy) =>
        set((state) => ({
          search: { ...state.search, sortBy },
        })),

      addToSearchHistory: (query) =>
        set((state) => {
          const history = [
            query,
            ...state.search.searchHistory.filter((item) => item !== query),
          ].slice(0, 10);
          return {
            search: { ...state.search, searchHistory: history },
          };
        }),

      clearSearchHistory: () =>
        set((state) => ({
          search: { ...state.search, searchHistory: [] },
        })),

      addSavedSearch: (name, query, filters) =>
        set((state) => {
          const savedSearch = {
            id: Date.now().toString(),
            name,
            query,
            filters,
            createdAt: new Date().toISOString(),
          };
          return {
            search: {
              ...state.search,
              savedSearches: [...state.search.savedSearches, savedSearch],
            },
          };
        }),

      removeSavedSearch: (id) =>
        set((state) => ({
          search: {
            ...state.search,
            savedSearches: state.search.savedSearches.filter((s) => s.id !== id),
          },
        })),

      clearSearchFilters: () =>
        set((state) => ({
          search: {
            ...state.search,
            location: undefined,
            category: undefined,
            verified: undefined,
            timeRange: undefined,
            sortBy: 'relevance',
          },
        })),

      // Mobile-specific actions
      setScrolling: (isScrolling) =>
        set((state) => ({
          mobile: { ...state.mobile, isScrolling },
        })),

      setSwipeDirection: (swipeDirection) =>
        set((state) => ({
          mobile: { ...state.mobile, swipeDirection },
        })),

      setKeyboardVisible: (keyboardVisible) =>
        set((state) => ({
          mobile: { ...state.mobile, keyboardVisible },
        })),

      setSafeAreaInsets: (safeAreaInsets) =>
        set((state) => ({
          mobile: { ...state.mobile, safeAreaInsets },
        })),

      setDeviceOrientation: (deviceOrientation) =>
        set((state) => ({
          mobile: { ...state.mobile, deviceOrientation },
        })),

      setOnlineStatus: (isOnline) =>
        set((state) => ({
          mobile: { ...state.mobile, isOnline },
        })),

      toggleReduceAnimations: () =>
        set((state) => ({
          mobile: { ...state.mobile, reduceAnimations: !state.mobile.reduceAnimations },
        })),

      setImageQuality: (imageQuality) =>
        set((state) => ({
          mobile: { ...state.mobile, imageQuality },
        })),

      // UI actions
      setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
      setActiveTab: (activeTab) => set({ activeTab }),

      // Mobile interaction actions with haptic feedback
      triggerHapticFeedback: (type) => {
        try {
          switch (type) {
            case 'light':
              mobileUtils.hapticFeedback.light();
              break;
            case 'medium':
              mobileUtils.hapticFeedback.medium();
              break;
            case 'heavy':
              mobileUtils.hapticFeedback.heavy();
              break;
            case 'selection':
              mobileUtils.hapticFeedback.selection();
              break;
          }
        } catch (error) {
          // Fallback for web or when haptics are not available
          console.log('Haptic feedback not available');
        }
      },

      handleTouchInteraction: (type) => {
        const { triggerHapticFeedback } = get();
        switch (type) {
          case 'tap':
            triggerHapticFeedback('light');
            break;
          case 'swipe':
            triggerHapticFeedback('medium');
            break;
          case 'longPress':
            triggerHapticFeedback('heavy');
            break;
        }
      },
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        search: {
          searchHistory: state.search.searchHistory,
          savedSearches: state.search.savedSearches,
        },
        mobile: {
          reduceAnimations: state.mobile.reduceAnimations,
          imageQuality: state.mobile.imageQuality,
          prefetchEnabled: state.mobile.prefetchEnabled,
        },
      }),
    }
  )
);