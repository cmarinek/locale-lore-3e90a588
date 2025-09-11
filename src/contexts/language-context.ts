import React from 'react';
import { markModule } from '@/debug/module-dupe-check';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/utils/languages';

// Mark module load for debugging
markModule('LanguageContext-v6');
console.log('[TRACE] LanguageContext-v6 file start');
console.log('[TRACE] About to create LanguageContext-v6');

export interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  isRTL: boolean;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  isLoading: boolean;
}

console.log('[TRACE] Before createContext in LanguageContext');

// Lazy context creation to avoid TDZ issues
let _languageContext: React.Context<LanguageContextType | null> | null = null;

function getLanguageContext() {
  if (!_languageContext) {
    console.log('[TRACE] Creating LanguageContext lazily');
    _languageContext = React.createContext<LanguageContextType | null>(null);
  }
  return _languageContext;
}

export const LanguageContext = new Proxy({} as React.Context<LanguageContextType | null>, {
  get(target, prop) {
    return getLanguageContext()[prop as keyof React.Context<LanguageContextType | null>];
  }
});

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