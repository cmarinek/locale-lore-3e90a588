import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Export language utilities
export { SUPPORTED_LANGUAGES, isRTLLanguage, updateDocumentDirection } from './languages';
export type { SupportedLanguage } from './languages';

// Flag to track if i18n has been initialized
let i18nInitialized = false;

// Lazy initialization of i18n - called only when needed
export const initI18n = async () => {
  if (i18nInitialized) return i18n;
  
  try {
    await i18n
      .use(Backend)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        fallbackLng: 'en',
        debug: false,
        
        // Namespace organization
        ns: ['common', 'navigation', 'auth', 'lore', 'profile', 'admin', 'errors', 'legal'],
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
          allowMultiLoading: false,
          crossDomain: false,
          withCredentials: false,
          requestOptions: {
            cache: 'default',
          },
        },

        // React options
        react: {
          useSuspense: false,
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
        preload: ['en'],
        
        // Performance settings
        partialBundledLanguages: true,
        cleanCode: true,
        
        // Separators
        keySeparator: '.',
        nsSeparator: ':',
      });
      
    i18nInitialized = true;
    
  } catch (error) {
    console.warn('[i18n] Initialization failed:', error);
    // Fallback to English if initialization fails
    await i18n.changeLanguage('en');
    i18nInitialized = true;
  }
  
  return i18n;
};

export default i18n;