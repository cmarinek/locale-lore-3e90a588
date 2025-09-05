
import { format as formatDateFns, formatDistanceToNow } from 'date-fns';

// Simple fallback approach - use basic formatting without locales to avoid initialization issues
export const formatLocalizedDate = (
  date: string | Date,
  formatStr: string = 'PPP',
  language: string = 'en'
): string => {
  try {
    // Use basic date formatting without locales to avoid circular dependency
    return formatDateFns(new Date(date), formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return formatDateFns(new Date(date), 'PPP');
  }
};

export const formatLocalizedRelativeTime = (
  date: string | Date,
  language: string = 'en'
): string => {
  try {
    // Use basic relative time formatting without locales
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return formatDistanceToNow(new Date(date), { addSuffix: true });
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
