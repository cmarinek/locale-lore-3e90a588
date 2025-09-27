import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '@/contexts/ThemeProvider';
import { SupportedLanguage } from '@/utils/languages';

interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  contrast: 'normal' | 'high';
  reduceMotion: boolean;
  enableScreenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  textToSpeech: boolean;
  voiceControl: boolean;
}

interface AppPreferences {
  showOnboarding: boolean;
  pwaDismissed: boolean;
  pwaInstalled: boolean;
  cookieConsent: boolean;
  autoSave: boolean;
  notifications: boolean;
  compactMode: boolean;
}

interface SettingsState {
  // Theme & Language
  theme: Theme;
  language: SupportedLanguage;
  
  // Accessibility
  accessibility: AccessibilitySettings;
  
  // App Preferences
  preferences: AppPreferences;
  
  // Actions
  setTheme: (theme: Theme) => void;
  setLanguage: (language: SupportedLanguage) => void;
  updateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  updatePreferences: (prefs: Partial<AppPreferences>) => void;
  resetAccessibility: () => void;
  resetPreferences: () => void;
  exportSettings: () => string;
  importSettings: (settings: string) => void;
}

const defaultAccessibility: AccessibilitySettings = {
  fontSize: 'medium',
  contrast: 'normal',
  reduceMotion: false,
  enableScreenReader: false,
  keyboardNavigation: true,
  focusIndicators: true,
  textToSpeech: false,
  voiceControl: false,
};

const defaultPreferences: AppPreferences = {
  showOnboarding: true,
  pwaDismissed: false,
  pwaInstalled: false,
  cookieConsent: false,
  autoSave: true,
  notifications: true,
  compactMode: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'auto',
      language: 'en',
      accessibility: defaultAccessibility,
      preferences: defaultPreferences,

      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', isDark);
      },

      setLanguage: (language) => {
        set({ language });
      },

      updateAccessibility: (settings) => {
        set((state) => ({
          accessibility: { ...state.accessibility, ...settings }
        }));
      },

      updatePreferences: (prefs) => {
        set((state) => ({
          preferences: { ...state.preferences, ...prefs }
        }));
      },

      resetAccessibility: () => {
        set({ accessibility: defaultAccessibility });
      },

      resetPreferences: () => {
        set({ preferences: defaultPreferences });
      },

      exportSettings: () => {
        const state = get();
        return JSON.stringify({
          theme: state.theme,
          language: state.language,
          accessibility: state.accessibility,
          preferences: state.preferences,
        });
      },

      importSettings: (settingsJson) => {
        try {
          const settings = JSON.parse(settingsJson);
          set({
            theme: settings.theme || 'auto',
            language: settings.language || 'en',
            accessibility: { ...defaultAccessibility, ...settings.accessibility },
            preferences: { ...defaultPreferences, ...settings.preferences },
          });
        } catch (error) {
          console.error('Failed to import settings:', error);
        }
      },
    }),
    {
      name: 'app-settings',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        accessibility: state.accessibility,
        preferences: state.preferences,
      }),
    }
  )
);