import { i18n } from 'i18next';

interface TranslationStatus {
  [key: string]: {
    percentage: number;
    missing: string[];
    lastUpdated: string;
  };
}

interface TranslationKey {
  key: string;
  defaultValue: string;
  namespace?: string;
  context?: string;
}

class TranslationManager {
  private static instance: TranslationManager;
  private i18nInstance: i18n | null = null;
  
  static getInstance(): TranslationManager {
    if (!TranslationManager.instance) {
      TranslationManager.instance = new TranslationManager();
    }
    return TranslationManager.instance;
  }

  setI18nInstance(i18n: i18n) {
    this.i18nInstance = i18n;
  }

  // Core translation keys that must be translated in all languages
  private getCoreTranslationKeys(): TranslationKey[] {
    return [
      // Navigation
      { key: 'navigation.home', defaultValue: 'Home' },
      { key: 'navigation.explore', defaultValue: 'Explore' },
      { key: 'navigation.search', defaultValue: 'Search' },
      { key: 'navigation.submit', defaultValue: 'Submit' },
      { key: 'navigation.profile', defaultValue: 'Profile' },
      { key: 'navigation.map', defaultValue: 'Map' },
      
      // Common actions
      { key: 'common.save', defaultValue: 'Save' },
      { key: 'common.cancel', defaultValue: 'Cancel' },
      { key: 'common.delete', defaultValue: 'Delete' },
      { key: 'common.edit', defaultValue: 'Edit' },
      { key: 'common.view', defaultValue: 'View' },
      { key: 'common.share', defaultValue: 'Share' },
      { key: 'common.like', defaultValue: 'Like' },
      { key: 'common.comment', defaultValue: 'Comment' },
      { key: 'common.loading', defaultValue: 'Loading...' },
      { key: 'common.error', defaultValue: 'Error' },
      { key: 'common.success', defaultValue: 'Success' },
      
      // Authentication
      { key: 'auth.login', defaultValue: 'Login' },
      { key: 'auth.register', defaultValue: 'Register' },
      { key: 'auth.logout', defaultValue: 'Logout' },
      { key: 'auth.email', defaultValue: 'Email' },
      { key: 'auth.password', defaultValue: 'Password' },
      { key: 'auth.forgotPassword', defaultValue: 'Forgot Password?' },
      
      // Forms
      { key: 'forms.title', defaultValue: 'Title' },
      { key: 'forms.description', defaultValue: 'Description' },
      { key: 'forms.location', defaultValue: 'Location' },
      { key: 'forms.category', defaultValue: 'Category' },
      { key: 'forms.tags', defaultValue: 'Tags' },
      { key: 'forms.required', defaultValue: 'Required' },
      
      // Stories/Facts
      { key: 'stories.title', defaultValue: 'Stories' },
      { key: 'stories.addNew', defaultValue: 'Add New Story' },
      { key: 'stories.verified', defaultValue: 'Verified' },
      { key: 'stories.pending', defaultValue: 'Pending' },
      { key: 'stories.rejected', defaultValue: 'Rejected' },
      
      // Search
      { key: 'search.placeholder', defaultValue: 'Search stories, locations...' },
      { key: 'search.results', defaultValue: 'Search Results' },
      { key: 'search.noResults', defaultValue: 'No results found' },
      { key: 'search.filters', defaultValue: 'Filters' },
      
      // Profile
      { key: 'profile.settings', defaultValue: 'Settings' },
      { key: 'profile.achievements', defaultValue: 'Achievements' },
      { key: 'profile.stories', defaultValue: 'My Stories' },
      { key: 'profile.favorites', defaultValue: 'Favorites' },
      
      // Time
      { key: 'time.justNow', defaultValue: 'Just now' },
      { key: 'time.minutesAgo', defaultValue: '{{count}} minutes ago' },
      { key: 'time.hoursAgo', defaultValue: '{{count}} hours ago' },
      { key: 'time.daysAgo', defaultValue: '{{count}} days ago' },
      
      // Errors
      { key: 'errors.general', defaultValue: 'Something went wrong. Please try again.' },
      { key: 'errors.network', defaultValue: 'Network error. Please check your connection.' },
      { key: 'errors.unauthorized', defaultValue: 'You are not authorized to perform this action.' },
      { key: 'errors.notFound', defaultValue: 'The requested content was not found.' },
      
      // Success messages
      { key: 'success.storySaved', defaultValue: 'Story saved successfully!' },
      { key: 'success.profileUpdated', defaultValue: 'Profile updated successfully!' },
      { key: 'success.commentAdded', defaultValue: 'Comment added successfully!' },
    ];
  }

  // Get supported languages
  getSupportedLanguages(): string[] {
    return ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'];
  }

  // Check translation status for a language
  async checkTranslationStatus(languageCode: string): Promise<TranslationStatus[string]> {
    if (!this.i18nInstance) {
      throw new Error('i18n instance not set');
    }

    const coreKeys = this.getCoreTranslationKeys();
    const missing: string[] = [];
    let translatedCount = 0;

    for (const keyObj of coreKeys) {
      const translation = this.i18nInstance.t(keyObj.key, { 
        lng: languageCode,
        fallbackLng: false,
        defaultValue: null 
      });
      
      if (!translation || translation === keyObj.key) {
        missing.push(keyObj.key);
      } else {
        translatedCount++;
      }
    }

    const percentage = Math.round((translatedCount / coreKeys.length) * 100);

    return {
      percentage,
      missing,
      lastUpdated: new Date().toISOString(),
    };
  }

  // Get all translation statuses
  async getAllTranslationStatuses(): Promise<TranslationStatus> {
    const languages = this.getSupportedLanguages();
    const statuses: TranslationStatus = {};

    for (const lang of languages) {
      try {
        statuses[lang] = await this.checkTranslationStatus(lang);
      } catch (error) {
        console.error(`Error checking translation status for ${lang}:`, error);
        statuses[lang] = {
          percentage: 0,
          missing: this.getCoreTranslationKeys().map(k => k.key),
          lastUpdated: new Date().toISOString(),
        };
      }
    }

    return statuses;
  }

  // Get missing translations for a specific language
  getMissingTranslations(languageCode: string): TranslationKey[] {
    if (!this.i18nInstance) {
      throw new Error('i18n instance not set');
    }

    const coreKeys = this.getCoreTranslationKeys();
    const missing: TranslationKey[] = [];

    for (const keyObj of coreKeys) {
      const translation = this.i18nInstance.t(keyObj.key, { 
        lng: languageCode,
        fallbackLng: false,
        defaultValue: null 
      });
      
      if (!translation || translation === keyObj.key) {
        missing.push(keyObj);
      }
    }

    return missing;
  }

  // Generate translation template for a language
  generateTranslationTemplate(languageCode: string): Record<string, any> {
    const template: Record<string, any> = {};
    const coreKeys = this.getCoreTranslationKeys();

    for (const keyObj of coreKeys) {
      this.setNestedProperty(template, keyObj.key, keyObj.defaultValue);
    }

    return template;
  }

  // Helper to set nested properties in object
  private setNestedProperty(obj: any, path: string, value: any) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  // Validate translation coverage
  validateTranslationCoverage(minimumPercentage: number = 90): { 
    isValid: boolean; 
    issues: string[]; 
  } {
    // This would be called during build time to ensure translation quality
    const issues: string[] = [];
    
    // Add validation logic here
    if (minimumPercentage < 100) {
      issues.push(`Translation coverage is below ${minimumPercentage}%`);
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }
}

export const translationManager = TranslationManager.getInstance();
export type { TranslationStatus, TranslationKey };