// Language configuration constants - separate from i18n setup to avoid circular dependencies

// Define supported languages with their configuration
export const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    rtl: false
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    rtl: false
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    rtl: false
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    rtl: false
  },
  sw: {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    flag: '🇰🇪',
    rtl: false
  }
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// RTL language detection
export const isRTLLanguage = (language: string): boolean => {
  const lang = language.split('-')[0] as SupportedLanguage;
  return SUPPORTED_LANGUAGES[lang]?.rtl || false;
};

// Update document direction
export const updateDocumentDirection = (language: string) => {
  const isRTL = isRTLLanguage(language);
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
};