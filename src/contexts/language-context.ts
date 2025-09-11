import React from 'react';
import { markModule } from '@/debug/module-dupe-check';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/utils/languages';

// Mark module load for debugging
markModule('LanguageContext');
console.log('[TRACE] LanguageContext file start - React available:', !!React);
console.log('[TRACE] About to create LanguageContext');

export interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  isRTL: boolean;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  isLoading: boolean;
}

console.log('[TRACE] Before createContext in LanguageContext');
export const LanguageContext = React.createContext<LanguageContextType | null>(null);
console.log('[TRACE] After createContext in LanguageContext');

// Optional hook - app should work without this context
export const useLanguage = () => {
  console.log('[TRACE] useLanguage invoked; typeof LanguageContext =', typeof LanguageContext);
  const context = React.useContext(LanguageContext);
  if (!context) {
    // Return fallback values instead of throwing error
    console.warn('useLanguage called outside LanguageProvider, using fallback values');
    return {
      currentLanguage: 'en' as SupportedLanguage,
      setLanguage: async () => {},
      isRTL: false,
      supportedLanguages: SUPPORTED_LANGUAGES,
      isLoading: false,
    };
  }
  return context;
};