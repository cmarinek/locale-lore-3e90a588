import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { log } from '@/utils/logger';

interface AccessibilitySettings {
  fontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  contrast: 'normal' | 'high' | 'low';
  reducedMotion: boolean;
  screenReader: boolean;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  focusRing: boolean;
  announcements: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  resetSettings: () => void;
  announce: (message: string) => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'base',
  contrast: 'normal',
  reducedMotion: false,
  screenReader: false,
  colorBlindness: 'none',
  focusRing: true,
  announcements: true
};

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('accessibility-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      log.error('Failed to load accessibility settings', error, { component: 'AccessibilityProvider', action: 'loadSettings' });
    }

    // Detect system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }

    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    if (prefersHighContrast) {
      setSettings(prev => ({ ...prev, contrast: 'high' }));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    } catch (error) {
      log.error('Failed to save accessibility settings', error, { component: 'AccessibilityProvider', action: 'updateSettings' });
    }
  }, [settings]);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    root.setAttribute('data-font-size', settings.fontSize);

    // Contrast
    root.setAttribute('data-contrast', settings.contrast);

    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // Color blindness filters
    const filterMap = {
      none: 'none',
      protanopia: 'url(#protanopia)',
      deuteranopia: 'url(#deuteranopia)',
      tritanopia: 'url(#tritanopia)'
    };
    root.style.filter = filterMap[settings.colorBlindness];

    // Focus ring
    if (!settings.focusRing) {
      root.classList.add('no-focus-ring');
    } else {
      root.classList.remove('no-focus-ring');
    }
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem('accessibility-settings');
  }, []);

  // Screen reader announcements
  const announce = useCallback((message: string) => {
    if (!settings.announcements) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [settings.announcements]);

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        announce
      }}
    >
      {children}

      {/* Color blindness filters */}
      <svg className="sr-only">
        <defs>
          <filter id="protanopia">
            <feColorMatrix values="0.567 0.433 0.000 0.000 0.000
                                  0.558 0.442 0.000 0.000 0.000
                                  0.000 0.242 0.758 0.000 0.000
                                  0.000 0.000 0.000 1.000 0.000" />
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix values="0.625 0.375 0.000 0.000 0.000
                                  0.700 0.300 0.000 0.000 0.000
                                  0.000 0.300 0.700 0.000 0.000
                                  0.000 0.000 0.000 1.000 0.000" />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix values="0.950 0.050 0.000 0.000 0.000
                                  0.000 0.433 0.567 0.000 0.000
                                  0.000 0.475 0.525 0.000 0.000
                                  0.000 0.000 0.000 1.000 0.000" />
          </filter>
        </defs>
      </svg>
    </AccessibilityContext.Provider>
  );
};