
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language constants from separate file to avoid circular dependencies
export { SUPPORTED_LANGUAGES, isRTLLanguage, updateDocumentDirection } from './languages';
export type { SupportedLanguage } from './languages';

// Initialize i18n configuration
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    
    // Namespace organization
    ns: ['common', 'navigation', 'auth', 'lore', 'profile', 'admin', 'errors'],
    defaultNS: 'common',

    // Language detection
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'locale-lore-language',
      caches: ['localStorage'],
    },

    // Backend configuration for lazy loading
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
      format: (value, format, lng) => {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        if (format === 'capitalize') return value.charAt(0).toUpperCase() + value.slice(1);
        return value;
      }
    },

    // React options
    react: {
      useSuspense: false,
    },

    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',

    // Resources loading
    load: 'languageOnly',
    preload: ['en'],
    
    // Keyseparator
    keySeparator: '.',
    nsSeparator: ':',
  });

export default i18n;
