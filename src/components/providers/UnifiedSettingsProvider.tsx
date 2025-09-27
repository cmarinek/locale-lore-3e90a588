import React from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { LanguageProvider } from '@/contexts/LanguageProvider';

interface UnifiedSettingsProviderProps {
  children: React.ReactNode;
}

/**
 * Unified provider that replaces individual Theme and Language providers
 * Uses the settings store as single source of truth
 */
export const UnifiedSettingsProvider: React.FC<UnifiedSettingsProviderProps> = ({ children }) => {
  const { theme, language, setTheme, setLanguage } = useSettingsStore();

  // Create mock theme context for backward compatibility
  const themeContextValue = {
    theme,
    setTheme,
    actualTheme: theme === 'auto' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme as 'light' | 'dark'
  };

  // Create mock language context for backward compatibility
  const languageContextValue = {
    currentLanguage: language,
    setLanguage: async (lang: any) => setLanguage(lang),
    supportedLanguages: {},
    isLoading: false,
    isRTL: ['ar', 'he', 'fa'].includes(language)
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
};