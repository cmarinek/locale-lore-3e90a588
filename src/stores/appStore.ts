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
  // Mobile-specific state - REMOVED user and search state (now in dedicated stores)
  mobile: MobileState;
  
  // UI state - ONLY app-level UI state
  mobileMenuOpen: boolean;
  activeTab: string;
  
  // Actions - ONLY app-level actions
  setMobileMenuOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  setScrolling: (scrolling: boolean) => void;
  setKeyboardVisible: (visible: boolean) => void;
  setDeviceOrientation: (orientation: 'portrait' | 'landscape') => void;
  setOnlineStatus: (online: boolean) => void;
  updateSafeAreaInsets: () => void;
  setSafeAreaInsets: (insets: { top: number; bottom: number; left: number; right: number }) => void;
  setPerformanceSettings: (settings: Partial<Pick<MobileState, 'reduceAnimations' | 'imageQuality' | 'prefetchEnabled'>>) => void;
  triggerHapticFeedback: (type: 'light' | 'medium' | 'heavy' | 'selection') => void;
  handleTouchInteraction: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Mobile state
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
      
      // UI state - SIMPLIFIED to only app-level state
      mobileMenuOpen: false,
      activeTab: 'explore',
      
      // Actions - SIMPLIFIED to only app-level actions
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      setScrolling: (scrolling) => set(state => ({
        mobile: { ...state.mobile, isScrolling: scrolling, lastTouchTime: Date.now() }
      })),
      
      setKeyboardVisible: (visible) => set(state => ({
        mobile: { ...state.mobile, keyboardVisible: visible }
      })),
      
      setDeviceOrientation: (orientation) => set(state => ({
        mobile: { ...state.mobile, deviceOrientation: orientation }
      })),
      
      setOnlineStatus: (online) => set(state => ({
        mobile: { ...state.mobile, isOnline: online }
      })),
      
      updateSafeAreaInsets: () => {
        const insets = mobileUtils.getSafeAreaInsets();
        set(state => ({
          mobile: { ...state.mobile, safeAreaInsets: insets }
        }));
      },
      
      setSafeAreaInsets: (insets) => set(state => ({
        mobile: { ...state.mobile, safeAreaInsets: insets }
      })),
      
      setPerformanceSettings: (settings) => set(state => ({
        mobile: { ...state.mobile, ...settings }
      })),
      
      triggerHapticFeedback: (type) => {
        try {
          mobileUtils.hapticFeedback[type]();
        } catch (error) {
          console.warn('Haptic feedback not available:', error);
        }
      },
      
      handleTouchInteraction: () => {
        set(state => ({
          mobile: { ...state.mobile, lastTouchTime: Date.now() }
        }));
      },
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        mobile: {
          reduceAnimations: state.mobile.reduceAnimations,
          imageQuality: state.mobile.imageQuality,
          prefetchEnabled: state.mobile.prefetchEnabled,
        },
        activeTab: state.activeTab,
      }),
    }
  )
);