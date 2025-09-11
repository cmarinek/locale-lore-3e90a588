import React from 'react';
import { markModule } from '@/debug/module-dupe-check';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/utils/languages';

// Mark module load for debugging
markModule('LanguageContext-v13');
console.log('[TRACE] LanguageContext-v13 file start');

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