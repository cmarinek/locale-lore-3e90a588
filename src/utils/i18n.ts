import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Export language utilities
export { SUPPORTED_LANGUAGES, isRTLLanguage, updateDocumentDirection } from './languages';
export type { SupportedLanguage } from './languages';

// Simple, standalone i18n configuration
const initI18n = async () => {
  try {
    await i18n
      .use(Backend)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        fallbackLng: 'en',
        debug: false, // Keep quiet to avoid console noise
        
        // Namespace organization
        ns: ['common', 'navigation', 'auth', 'lore', 'profile', 'admin', 'errors'],
        defaultNS: 'common',

        // Language detection
        detection: {
          order: ['localStorage', 'navigator', 'htmlTag'],
          lookupLocalStorage: 'locale-lore-language',
          caches: ['localStorage'],
        },

        // Backend configuration
        backend: {
          loadPath: '/locales/{{lng}}/{{ns}}.json',
        },

        // React options
        react: {
          useSuspense: false, // Don't block rendering
        },

        // Simple interpolation
        interpolation: {
          escapeValue: false, // React already escapes
        },

        // Resource loading
        load: 'languageOnly',
        preload: ['en'], // Always preload English as fallback
        
        // Separators
        keySeparator: '.',
        nsSeparator: ':',
      });
    
    console.log('i18n initialized successfully');
  } catch (error) {
    console.warn('i18n initialization failed, using fallback:', error);
    // Don't break the app if i18n fails
  }
};

// Initialize immediately
initI18n();

export default i18n;