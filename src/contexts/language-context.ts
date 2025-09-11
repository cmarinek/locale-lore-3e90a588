import React from 'react';
import { markModule } from '@/debug/module-dupe-check';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/utils/languages';

// Mark module load for debugging
markModule('LanguageContext-v9');
console.log('[TRACE] LanguageContext-v9 file start');

export interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  isRTL: boolean;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  isLoading: boolean;
}

// Create a placeholder that will be replaced by the actual context  
export let LanguageContext: React.Context<LanguageContextType | null> = null as any;

// This will be called by the provider to set the actual context
export const _setLanguageContext = (context: React.Context<LanguageContextType | null>) => {
  LanguageContext = context;
};

// Optional hook - app should work without this context
export const useLanguage = () => {
  if (!LanguageContext) {
    // Return fallback values instead of throwing error
    console.warn('useLanguage called before LanguageContext was initialized, using fallback values');
    return {
      currentLanguage: 'en' as SupportedLanguage,
      setLanguage: async () => {},
      isRTL: false,
      supportedLanguages: SUPPORTED_LANGUAGES,
      isLoading: false,
    };
  }
  
  const React = require('react') as typeof import('react');
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