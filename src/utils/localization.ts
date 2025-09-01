
import { format as formatDate, formatDistanceToNow } from 'date-fns';
import { 
  enUS, es, fr, de, ptBR, ru, ar, ja, zhCN 
} from 'date-fns/locale';

// Date-fns locale mapping
const DATE_LOCALES = {
  en: enUS,
  es,
  fr,
  de,
  pt: ptBR,
  ru,
  ar,
  ja,
  zh: zhCN,
  sw: enUS, // Fallback to English for Swahili
};

export const formatLocalizedDate = (
  date: string | Date,
  formatStr: string = 'PPP',
  language: string = 'en'
): string => {
  const locale = DATE_LOCALES[language as keyof typeof DATE_LOCALES] || enUS;
  
  try {
    return formatDate(new Date(date), formatStr, { locale });
  } catch (error) {
    console.error('Date formatting error:', error);
    return formatDate(new Date(date), formatStr, { locale: enUS });
  }
};

export const formatLocalizedRelativeTime = (
  date: string | Date,
  language: string = 'en'
): string => {
  const locale = DATE_LOCALES[language as keyof typeof DATE_LOCALES] || enUS;
  
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale });
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: enUS });
  }
};

export const formatLocalizedNumber = (
  num: number,
  language: string = 'en',
  options?: Intl.NumberFormatOptions
): string => {
  try {
    return new Intl.NumberFormat(language, options).format(num);
  } catch (error) {
    console.error('Number formatting error:', error);
    return new Intl.NumberFormat('en', options).format(num);
  }
};

export const formatLocalizedCurrency = (
  amount: number,
  currency: string = 'USD',
  language: string = 'en'
): string => {
  try {
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch (error) {
    console.error('Currency formatting error:', error);
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
    }).format(amount);
  }
};

export const formatLocalizedDistance = (
  meters: number,
  language: string = 'en'
): string => {
  if (meters < 1000) {
    return `${formatLocalizedNumber(Math.round(meters), language)}m`;
  }
  return `${formatLocalizedNumber(meters / 1000, language, { 
    minimumFractionDigits: 1,
    maximumFractionDigits: 1 
  })}km`;
};

// Pluralization helper for complex cases
export const getPlural = (
  count: number,
  language: string,
  options: {
    zero?: string;
    one: string;
    two?: string;
    few?: string;
    many?: string;
    other: string;
  }
): string => {
  const rules = new Intl.PluralRules(language);
  const rule = rules.select(count);
  
  if (count === 0 && options.zero) return options.zero;
  if (count === 1 && options.one) return options.one;
  if (count === 2 && options.two) return options.two;
  
  return options[rule as keyof typeof options] || options.other;
};
