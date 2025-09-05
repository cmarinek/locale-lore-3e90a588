import { useTranslation } from 'react-i18next';

/**
 * Hook that provides quick access to commonly used translations
 * This reduces boilerplate and ensures consistency
 */
export const useCommonTranslations = () => {
  const { t: tCommon } = useTranslation('common');
  const { t: tAuth } = useTranslation('auth'); 
  const { t: tNav } = useTranslation('navigation');
  const { t: tLore } = useTranslation('lore');
  const { t: tProfile } = useTranslation('profile');
  const { t: tAdmin } = useTranslation('admin');
  const { t: tErrors } = useTranslation('errors');

  return {
    // Common actions
    save: tCommon('save'),
    cancel: tCommon('cancel'),
    delete: tCommon('delete'),
    edit: tCommon('edit'),
    view: tCommon('view'),
    share: tCommon('share'),
    submit: tCommon('submit'),
    back: tCommon('back'),
    next: tCommon('next'),
    close: tCommon('close'),
    open: tCommon('open'),
    search: tCommon('search'),
    loading: tCommon('loading'),
    success: tCommon('success'),
    error: tCommon('error'),

    // Auth related
    signIn: tAuth('signIn'),
    signUp: tAuth('signUp'),
    login: tAuth('login'),
    logout: tAuth('logout'),
    email: tAuth('email'),
    password: tAuth('password'),
    
    // Navigation
    home: tNav('home'),
    explore: tNav('explore'),
    profile: tNav('profile'),
    settings: tNav('settings'),
    admin: tNav('admin'),

    // Status
    pending: tCommon('pending'),
    approved: tCommon('approved'), 
    rejected: tCommon('rejected'),
    active: tCommon('active'),
    inactive: tCommon('inactive'),

    // Placeholders
    enterEmail: tAuth('enterEmail', { defaultValue: 'Enter your email' }),
    enterPassword: tAuth('enterPassword', { defaultValue: 'Enter your password' }),
    searchPlaceholder: tLore('search.searchPlaceholder'),
    
    // Helper function to get translation with fallback
    t: (key: string, namespace = 'common', fallback?: string) => {
      const translators = { common: tCommon, auth: tAuth, navigation: tNav, lore: tLore, profile: tProfile, admin: tAdmin, errors: tErrors };
      const translator = translators[namespace as keyof typeof translators] || tCommon;
      return translator(key, { defaultValue: fallback || key });
    }
  };
};