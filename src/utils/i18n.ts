import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Export language utilities
export { SUPPORTED_LANGUAGES, isRTLLanguage, updateDocumentDirection } from './languages';
export type { SupportedLanguage } from './languages';

// Initialize i18n
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    
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
      useSuspense: false,
    },

    // Simple interpolation
    interpolation: {
      escapeValue: false,
    },

    // Resource loading
    load: 'languageOnly',
    preload: ['en'],
    
    // Separators
    keySeparator: '.',
    nsSeparator: ':',
  })
  .catch((error) => {
    console.warn('i18n initialization failed:', error);
  });

export default i18n;