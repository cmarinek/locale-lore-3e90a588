import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Export language utilities
export { SUPPORTED_LANGUAGES, isRTLLanguage, updateDocumentDirection } from './languages';
export type { SupportedLanguage } from './languages';

// Initialize i18n with performance optimizations
const initI18n = async () => {
  return i18n
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

      // Backend configuration with performance optimizations
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        allowMultiLoading: false, // Load one namespace at a time for better performance
        crossDomain: false,
        withCredentials: false,
        requestOptions: {
          cache: 'default',
        },
      },

      // React options
      react: {
        useSuspense: false, // Prevents blocking render
        bindI18n: 'languageChanged loaded',
        bindI18nStore: 'added removed',
        transEmptyNodeValue: '',
        transSupportBasicHtmlNodes: true,
        transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
      },

      // Simple interpolation
      interpolation: {
        escapeValue: false,
      },

      // Resource loading optimizations
      load: 'languageOnly',
      preload: ['en'], // Only preload English to reduce initial bundle
      
      // Performance settings
      partialBundledLanguages: true, // Load only needed namespaces
      cleanCode: true, // Remove unused translations
      
      // Separators
      keySeparator: '.',
      nsSeparator: ':',
    });
};

// Initialize immediately but handle errors gracefully
initI18n().catch((error) => {
  console.warn('i18n initialization failed:', error);
  // Fallback to English if initialization fails
  i18n.changeLanguage('en');
});

export default i18n;