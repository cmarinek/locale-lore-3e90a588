import React, { useEffect } from 'react';
import { Keyboard } from '@capacitor/keyboard';
import { StatusBar } from '@capacitor/status-bar';
import { useAppStore } from '@/stores/appStore';

interface MobileProviderProps {
  children: React.ReactNode;
}

export const MobileProvider: React.FC<MobileProviderProps> = ({ children }) => {
  const { 
    setKeyboardVisible, 
    setDeviceOrientation, 
    setOnlineStatus,
    setSafeAreaInsets 
  } = useAppStore();

  useEffect(() => {
    // Keyboard event listeners
    const keyboardWillShow = () => setKeyboardVisible(true);
    const keyboardWillHide = () => setKeyboardVisible(false);

    Keyboard.addListener('keyboardWillShow', keyboardWillShow);
    Keyboard.addListener('keyboardWillHide', keyboardWillHide);

    // Orientation change listener
    const handleOrientationChange = () => {
      const orientation = window.screen.orientation?.angle === 0 || window.screen.orientation?.angle === 180 
        ? 'portrait' 
        : 'landscape';
      setDeviceOrientation(orientation);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    handleOrientationChange(); // Set initial orientation

    // Online/offline status
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Safe area insets detection
    const updateSafeAreaInsets = () => {
      const style = getComputedStyle(document.documentElement);
      const insets = {
        top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
        bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
        right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
      };
      setSafeAreaInsets(insets);
    };

    updateSafeAreaInsets();
    window.addEventListener('resize', updateSafeAreaInsets);

    // Status bar styling
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      StatusBar.setStyle({ style: 'DARK' as any });
    } else {
      StatusBar.setStyle({ style: 'LIGHT' as any });
    }

    // Prevent zoom on input focus (iOS Safari)
    const preventZoom = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
          viewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
          );
          
          // Reset after a delay
          setTimeout(() => {
            viewport.setAttribute('content', 
              'width=device-width, initial-scale=1.0, user-scalable=yes'
            );
          }, 500);
        }
      }
    };

    document.addEventListener('focusin', preventZoom);

    return () => {
      Keyboard.removeAllListeners();
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('resize', updateSafeAreaInsets);
      document.removeEventListener('focusin', preventZoom);
    };
  }, [setKeyboardVisible, setDeviceOrientation, setOnlineStatus, setSafeAreaInsets]);

  return <>{children}</>;
};