// Temporarily disabled i18n to prevent vendor bundle issues
// import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';
// import Backend from 'i18next-http-backend';
// import LanguageDetector from 'i18next-browser-languagedetector';

// Export language utilities
export { SUPPORTED_LANGUAGES, isRTLLanguage, updateDocumentDirection } from './languages';
export type { SupportedLanguage } from './languages';

// Temporarily disabled - i18n initialization will be restored later
console.log('i18n initialization skipped - using fallback translations');

// export default i18n;