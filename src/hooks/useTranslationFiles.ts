import { useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/utils/languages';

interface TranslationFile {
  [key: string]: string | object;
}

interface TranslationProgress {
  language: string;
  namespace: string;
  total: number;
  translated: number;
  percentage: number;
  missing: string[];
}

export const useTranslationFiles = () => {
  const [translations, setTranslations] = useState<Record<string, Record<string, TranslationFile>>>({});
  const [progress, setProgress] = useState<TranslationProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const namespaces = ['common', 'navigation', 'auth', 'lore', 'profile', 'admin', 'errors'];

  const loadTranslations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const translationData: Record<string, Record<string, TranslationFile>> = {};
      const progressData: TranslationProgress[] = [];

      // Load English as reference
      const englishTranslations: Record<string, TranslationFile> = {};
      for (const namespace of namespaces) {
        try {
          const response = await fetch(`/locales/en/${namespace}.json`);
          if (response.ok) {
            englishTranslations[namespace] = await response.json();
          }
        } catch (error) {
          console.warn(`Failed to load English ${namespace} translations`);
        }
      }

      // Load all other languages
      for (const [langCode, langInfo] of Object.entries(SUPPORTED_LANGUAGES)) {
        translationData[langCode] = {};
        
        for (const namespace of namespaces) {
          try {
            const response = await fetch(`/locales/${langCode}/${namespace}.json`);
            if (response.ok) {
              translationData[langCode][namespace] = await response.json();
            } else {
              translationData[langCode][namespace] = {};
            }
          } catch {
            translationData[langCode][namespace] = {};
          }

          // Calculate progress
          const englishKeys = flattenKeys(englishTranslations[namespace] || {});
          const translatedKeys = flattenKeys(translationData[langCode][namespace] || {});
          const totalKeys = englishKeys.length;
          const translatedCount = englishKeys.filter(key => 
            translatedKeys.includes(key) && 
            getNestedValue(translationData[langCode][namespace], key)
          ).length;
          const missingKeys = englishKeys.filter(key => 
            !translatedKeys.includes(key) || 
            !getNestedValue(translationData[langCode][namespace], key)
          );

          progressData.push({
            language: langCode,
            namespace,
            total: totalKeys,
            translated: translatedCount,
            percentage: totalKeys > 0 ? Math.round((translatedCount / totalKeys) * 100) : 100,
            missing: missingKeys
          });
        }
      }

      setTranslations(translationData);
      setProgress(progressData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load translations');
    } finally {
      setLoading(false);
    }
  };

  const saveTranslation = async (language: string, namespace: string, key: string, value: string) => {
    try {
      setTranslations(prev => ({
        ...prev,
        [language]: {
          ...prev[language],
          [namespace]: {
            ...prev[language]?.[namespace],
            ...setNestedValue(prev[language]?.[namespace] || {}, key, value)
          }
        }
      }));

      // Recalculate progress
      await loadTranslations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save translation');
    }
  };

  const bulkTranslate = async (targetLanguage: string, namespace: string, keys: string[]) => {
    setLoading(true);
    
    try {
      const englishTranslations = translations.en?.[namespace] || {};
      const results = [];

      for (const key of keys) {
        const sourceText = getNestedValue(englishTranslations, key);
        if (sourceText && typeof sourceText === 'string') {
          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: sourceText,
              target_language: SUPPORTED_LANGUAGES[targetLanguage as SupportedLanguage]?.name || targetLanguage,
              source_language: 'English'
            }),
          });

          if (response.ok) {
            const data = await response.json();
            results.push({
              key,
              translated: data.translated_content || sourceText
            });
          }
        }
      }

      // Apply bulk translations
      let updatedTranslations = { ...translations };
      for (const result of results) {
        updatedTranslations = {
          ...updatedTranslations,
          [targetLanguage]: {
            ...updatedTranslations[targetLanguage],
            [namespace]: {
              ...updatedTranslations[targetLanguage]?.[namespace],
              ...setNestedValue(updatedTranslations[targetLanguage]?.[namespace] || {}, result.key, result.translated)
            }
          }
        };
      }

      setTranslations(updatedTranslations);
      await loadTranslations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk translation failed');
    } finally {
      setLoading(false);
    }
  };

  const exportTranslations = (language: string, namespace: string) => {
    const data = translations[language]?.[namespace] || {};
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${language}-${namespace}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadTranslations();
  }, []);

  return {
    translations,
    progress,
    loading,
    error,
    saveTranslation,
    bulkTranslate,
    exportTranslations,
    reloadTranslations: loadTranslations
  };
};

// Helper functions
const flattenKeys = (obj: any, prefix = ''): string[] => {
  let keys: string[] = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(flattenKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
};

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const setNestedValue = (obj: any, path: string, value: any): any => {
  const keys = path.split('.');
  const result = { ...obj };
  let current = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return result;
};