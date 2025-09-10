// Temporary fallback translation hook to prevent vendor bundle loading issues
export const useTranslation = (namespace = 'common') => {
  const t = (key: string, options?: any) => {
    // Return the key as fallback until real i18n is loaded
    return key;
  };
  
  const i18n = {
    language: 'en',
    changeLanguage: async (lng: string) => {
      console.log(`Language change requested: ${lng} (i18n disabled)`);
    },
    exists: (key: string) => false
  };
  
  const ready = true; // Always ready in fallback mode

  return { t, i18n, ready };
};

// Export other i18n utilities that components might need
export const Trans = ({ children, i18nKey, ...props }: any) => {
  return children || i18nKey || '';
};