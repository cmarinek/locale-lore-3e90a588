import { markModule } from '@/debug/module-dupe-check';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/utils/languages';

// Mark module load for debugging
markModule('LanguageContext-v14');
console.log('[TRACE] LanguageContext-v14 file start');

export interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  isRTL: boolean;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  isLoading: boolean;
}

// Pure type exports - no React API calls during module initialization
export const LANGUAGE_CONTEXT_NAME = 'language-context-v14';