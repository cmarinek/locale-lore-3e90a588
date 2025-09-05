// Minimal i18n setup to avoid initialization errors
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

console.log('DIAGNOSTIC: Starting minimal i18n setup...');

// Export language constants separately to avoid circular deps
export { SUPPORTED_LANGUAGES, isRTLLanguage, updateDocumentDirection } from './languages';
export type { SupportedLanguage } from './languages';

try {
  console.log('DIAGNOSTIC: About to initialize i18n...');
  
  i18n
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      debug: false,
      ns: ['common'],
      defaultNS: 'common',
      react: {
        useSuspense: false,
      },
      resources: {
        en: {
          common: {
            loading: 'Loading...',
            error: 'Error',
            save: 'Save',
            cancel: 'Cancel'
          }
        }
      }
    });
    
  console.log('DIAGNOSTIC: i18n initialized successfully');
} catch (error) {
  console.error('DIAGNOSTIC: i18n initialization failed:', error);
}

export default i18n;