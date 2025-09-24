// Optimized i18n loading strategy
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Language chunks for better code splitting
const languageChunks = {
  critical: ['common', 'navigation'], // Load immediately
  important: ['lore', 'auth', 'errors'], // Load on demand
  optional: ['admin', 'profile'] // Load when needed
};

// Cache for loaded translations
const translationCache = new Map<string, any>();

// Optimized resource loader with caching
const optimizedBackend = {
  type: 'backend',
  init: () => {},
  read: async (language: string, namespace: string, callback: (err: any, data?: any) => void) => {
    const cacheKey = `${language}-${namespace}`;
    
    // Check cache first
    if (translationCache.has(cacheKey)) {
      callback(null, translationCache.get(cacheKey));
      return;
    }

    try {
      // Use dynamic import for better code splitting
      const response = await fetch(`/locales/${language}/${namespace}.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to load ${cacheKey}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      translationCache.set(cacheKey, data);
      
      callback(null, data);
    } catch (error) {
      console.warn(`Failed to load translation ${cacheKey}:`, error);
      callback(error);
    }
  }
};

// Preload critical translations
export const preloadCriticalTranslations = async (language = 'en') => {
  const promises = languageChunks.critical.map(namespace => 
    fetch(`/locales/${language}/${namespace}.json`)
      .then(res => res.json())
      .then(data => {
        translationCache.set(`${language}-${namespace}`, data);
        return data;
      })
      .catch(error => {
        console.warn(`Failed to preload ${language}-${namespace}:`, error);
        return {};
      })
  );
  
  await Promise.all(promises);
};

// Initialize optimized i18n
export const initOptimizedI18n = async () => {
  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng: 'en',
      fallbackLng: 'en',
      
      // Performance optimizations
      load: 'languageOnly', // Don't load country-specific variants
      preload: ['en'], // Only preload English
      
      ns: languageChunks.critical, // Start with critical namespaces
      defaultNS: 'common',
      
      interpolation: {
        escapeValue: false // React already escapes
      },
      
      // Optimized settings
      initImmediate: false, // Don't block render
      returnEmptyString: false,
      returnNull: false,
      
      // Cache settings
      updateMissing: false, // Don't update missing keys in production
      saveMissing: false,
      
      // Performance settings
      cleanCode: true,
      lowerCaseLng: true,
      
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'locale-preference'
      }
    });

  return i18n;
};

// Lazy load namespace
export const loadNamespace = async (namespace: string, language = i18n.language) => {
  if (!i18n.hasResourceBundle(language, namespace)) {
    await i18n.loadNamespaces([namespace]);
  }
};

// Preload important translations based on route
export const preloadRouteTranslations = (route: string) => {
  const routeNamespaces: Record<string, string[]> = {
    '/auth': ['auth', 'errors'],
    '/admin': ['admin', 'common'],
    '/profile': ['profile', 'common'],
    '/stories': ['lore', 'common'],
    '/explore': ['lore', 'common'],
    '/search': ['lore', 'common']
  };

  const namespaces = routeNamespaces[route] || [];
  namespaces.forEach(ns => loadNamespace(ns));
};

// Memory cleanup for translations
export const cleanupUnusedTranslations = () => {
  // Remove unused language packs to free memory
  const currentLng = i18n.language;
  const availableLanguages = Object.keys(i18n.store.data);
  
  availableLanguages.forEach(lng => {
    if (lng !== currentLng && lng !== 'en') {
      // Keep English as fallback, remove others
      Object.keys(i18n.store.data[lng] || {}).forEach(ns => {
        i18n.removeResourceBundle(lng, ns);
      });
    }
  });
  
  // Clear translation cache for unused namespaces
  const usedNamespaces = new Set([...languageChunks.critical, ...languageChunks.important]);
  for (const [key] of translationCache) {
    const [, namespace] = key.split('-');
    if (!usedNamespaces.has(namespace)) {
      translationCache.delete(key);
    }
  }
};

export default i18n;
