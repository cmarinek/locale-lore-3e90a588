/**
 * Translation File Writer Utility
 * 
 * This utility helps write translation files to the repository.
 * In development, admins can use this to update translation files after auto-translation.
 * 
 * USAGE:
 * 1. Admin runs auto-translation from the Translation Manager
 * 2. Files are downloaded automatically
 * 3. Admin uploads files to public/locales/{language}/{namespace}.json
 * 4. Refresh the app to see updated translations
 * 
 * AUTOMATION:
 * For CI/CD pipelines, you can:
 * - Add a pre-commit hook to run translation sync
 * - Set up a GitHub Action to auto-translate on PR
 * - Use the edge functions directly in build scripts
 */

import { SUPPORTED_LANGUAGES, SupportedLanguage } from './languages';

const NAMESPACES = ['common', 'navigation', 'auth', 'lore', 'profile', 'admin', 'errors'];

export interface TranslationSyncResult {
  language: string;
  namespace: string;
  totalKeys: number;
  translatedKeys: number;
  completionPercentage: number;
  missingKeys: string[];
  emptyKeys: string[];
}

export interface TranslationUpdate {
  language: SupportedLanguage;
  namespace: string;
  translations: Record<string, any>;
  keysUpdated: number;
}

/**
 * Generate file path for a translation file
 */
export const getTranslationFilePath = (language: SupportedLanguage, namespace: string): string => {
  return `public/locales/${language}/${namespace}.json`;
};

/**
 * Format translation JSON for file output
 */
export const formatTranslationJSON = (translations: Record<string, any>): string => {
  return JSON.stringify(translations, null, 2);
};

/**
 * Download translation file to user's computer
 */
export const downloadTranslationFile = (
  language: SupportedLanguage,
  namespace: string,
  translations: Record<string, any>
): void => {
  const content = formatTranslationJSON(translations);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${language}-${namespace}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Batch download multiple translation files
 */
export const batchDownloadTranslations = (updates: TranslationUpdate[]): void => {
  updates.forEach((update, index) => {
    // Stagger downloads to avoid browser blocking
    setTimeout(() => {
      downloadTranslationFile(update.language, update.namespace, update.translations);
    }, index * 500);
  });
};

/**
 * Generate upload instructions for user
 */
export const generateUploadInstructions = (updates: TranslationUpdate[]): string => {
  const instructions = updates.map(update => 
    `- Upload ${update.language}-${update.namespace}.json to public/locales/${update.language}/${update.namespace}.json`
  ).join('\n');

  return `
Translation files ready for upload:

${instructions}

Steps to apply:
1. All files have been downloaded to your Downloads folder
2. Move each file to the corresponding location in your repository
3. Commit the changes
4. Deploy or refresh your development server

Alternative: In Lovable, you can also manually edit the files in the project explorer.
  `.trim();
};

/**
 * Log sync summary to console for debugging
 */
export const logSyncSummary = (results: TranslationSyncResult[]): void => {
  console.group('🌐 Translation Sync Summary');
  
  const byLanguage = results.reduce((acc, result) => {
    if (!acc[result.language]) {
      acc[result.language] = [];
    }
    acc[result.language].push(result);
    return acc;
  }, {} as Record<string, TranslationSyncResult[]>);

  Object.entries(byLanguage).forEach(([language, langResults]) => {
    console.group(`${language}`);
    langResults.forEach(result => {
      const status = result.completionPercentage === 100 ? '✅' : '⚠️';
      console.log(
        `${status} ${result.namespace}: ${result.completionPercentage}% (${result.translatedKeys}/${result.totalKeys})`
      );
      if (result.missingKeys.length > 0) {
        console.log(`  Missing: ${result.missingKeys.slice(0, 5).join(', ')}${result.missingKeys.length > 5 ? '...' : ''}`);
      }
    });
    console.groupEnd();
  });
  
  console.groupEnd();
};

/**
 * Validate translation structure matches source
 */
export const validateTranslationStructure = (
  source: Record<string, any>,
  translation: Record<string, any>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const checkStructure = (src: any, trans: any, path: string = ''): void => {
    if (typeof src === 'object' && src !== null) {
      if (typeof trans !== 'object' || trans === null) {
        errors.push(`Structure mismatch at ${path}: expected object, got ${typeof trans}`);
        return;
      }

      for (const key in src) {
        const newPath = path ? `${path}.${key}` : key;
        if (!(key in trans)) {
          errors.push(`Missing key: ${newPath}`);
        } else {
          checkStructure(src[key], trans[key], newPath);
        }
      }
    } else if (typeof src === 'string') {
      if (typeof trans !== 'string') {
        errors.push(`Type mismatch at ${path}: expected string, got ${typeof trans}`);
      }
    }
  };

  checkStructure(source, translation);

  return {
    valid: errors.length === 0,
    errors
  };
};