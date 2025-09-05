
import { useTranslation as useI18nTranslation } from 'react-i18next';
import { 
  formatLocalizedDate, 
  formatLocalizedRelativeTime, 
  formatLocalizedNumber, 
  formatLocalizedCurrency,
  formatLocalizedDistance,
  getPlural
} from '@/utils/localization';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/utils/languages';

interface TranslationOptions {
  context?: string;
  count?: number;
  defaultValue?: string;
  interpolation?: Record<string, any>;
}

interface ExtendedTFunction {
  (key: string, options?: TranslationOptions): string;
  formatDate: (date: string | Date, format?: string) => string;
  formatRelativeTime: (date: string | Date) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDistance: (meters: number) => string;
  plural: (count: number, options: {
    zero?: string;
    one: string;
    two?: string;
    few?: string;
    many?: string;
    other: string;
  }) => string;
}

export const useTranslation = (namespace?: string | string[]) => {
  const { t: originalT, i18n, ready } = useI18nTranslation(namespace);
  
  // Get language info directly from i18n to avoid circular dependency
  const currentLanguage = (i18n.language?.split('-')[0] || 'en') as SupportedLanguage;
  const isRTL = SUPPORTED_LANGUAGES[currentLanguage]?.rtl || false;

  // Enhanced translation function with context support
  const t: ExtendedTFunction = Object.assign(
    (key: string, options?: TranslationOptions) => {
      let translationKey = key;
      
      // Add context to key if provided
      if (options?.context) {
        translationKey = `${key}_${options.context}`;
      }
      
      return originalT(translationKey, {
        count: options?.count,
        defaultValue: options?.defaultValue,
        ...options?.interpolation,
      });
    },
    {
      // Date formatting methods
      formatDate: (date: string | Date, format?: string) => 
        formatLocalizedDate(date, format, currentLanguage),
      
      formatRelativeTime: (date: string | Date) => 
        formatLocalizedRelativeTime(date, currentLanguage),
      
      // Number formatting methods
      formatNumber: (num: number, options?: Intl.NumberFormatOptions) => 
        formatLocalizedNumber(num, currentLanguage, options),
      
      formatCurrency: (amount: number, currency: string = 'USD') => 
        formatLocalizedCurrency(amount, currency, currentLanguage),
      
      formatDistance: (meters: number) => 
        formatLocalizedDistance(meters, currentLanguage),
      
      // Pluralization method
      plural: (count: number, options: Parameters<typeof getPlural>[2]) => 
        getPlural(count, currentLanguage, options),
    }
  );

  return {
    t,
    i18n,
    ready,
    language: currentLanguage,
    isRTL,
    changeLanguage: i18n.changeLanguage,
  };
};

// Context-aware translation hook for specific scenarios
export const useContextualTranslation = (
  namespace: string | string[],
  context?: string
) => {
  const { t: baseT, ...rest } = useTranslation(namespace);
  
  const t = (key: string, options?: Omit<TranslationOptions, 'context'>) => {
    return baseT(key, { ...options, context });
  };

  return { t, ...rest };
};
