import { supabase } from '@/integrations/supabase/client';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/utils/languages';

interface TranslationRequest {
  content: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

interface TranslationResult {
  translated_content: string;
  detected_language: string;
  confidence: number;
  notes: string;
}

export class TranslationGenerator {
  private static async translateText(request: TranslationRequest): Promise<TranslationResult> {
    try {
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: {
          content: request.content,
          target_language: request.targetLanguage,
          source_language: request.sourceLanguage || 'auto'
        }
      });

      if (error) {
        throw new Error(`Translation failed: ${error.message}`);
      }

      return data as TranslationResult;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  static async generateMissingTranslations(
    sourceLanguage: SupportedLanguage = 'en',
    targetLanguages: SupportedLanguage[] = []
  ): Promise<Record<string, Record<string, any>>> {
    const namespaces = ['common', 'navigation', 'auth', 'lore', 'profile', 'admin', 'errors'];
    const results: Record<string, Record<string, any>> = {};

    // If no target languages specified, use all supported languages except source
    const languages = targetLanguages.length > 0 
      ? targetLanguages 
      : Object.keys(SUPPORTED_LANGUAGES).filter(lang => lang !== sourceLanguage) as SupportedLanguage[];

    console.log(`Generating translations for languages: ${languages.join(', ')}`);

    for (const targetLang of languages) {
      results[targetLang] = {};
      
      for (const namespace of namespaces) {
        console.log(`Processing ${namespace} for ${targetLang}...`);
        
        try {
          // Load source translations
          const sourceResponse = await fetch(`/locales/${sourceLanguage}/${namespace}.json`);
          if (!sourceResponse.ok) {
            console.warn(`Source file not found: ${sourceLanguage}/${namespace}.json`);
            continue;
          }
          
          const sourceTranslations = await sourceResponse.json();
          
          // Check if target translation file exists
          let targetTranslations = {};
          try {
            const targetResponse = await fetch(`/locales/${targetLang}/${namespace}.json`);
            if (targetResponse.ok) {
              targetTranslations = await targetResponse.json();
            }
          } catch (error) {
            console.log(`Creating new translation file for ${targetLang}/${namespace}`);
          }

          // Generate missing translations
          const translatedNamespace = await this.translateNestedObject(
            sourceTranslations,
            targetTranslations,
            SUPPORTED_LANGUAGES[targetLang].name,
            SUPPORTED_LANGUAGES[sourceLanguage].name
          );

          results[targetLang][namespace] = translatedNamespace;
          
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`Failed to process ${namespace} for ${targetLang}:`, error);
          results[targetLang][namespace] = {};
        }
      }
    }

    return results;
  }

  private static async translateNestedObject(
    source: any,
    existing: any,
    targetLanguage: string,
    sourceLanguage: string
  ): Promise<any> {
    const result = { ...existing };

    for (const [key, value] of Object.entries(source)) {
      if (typeof value === 'string') {
        // Only translate if missing or empty
        if (!result[key] || result[key].trim() === '') {
          try {
            const translationResult = await this.translateText({
              content: value,
              targetLanguage,
              sourceLanguage
            });
            
            result[key] = translationResult.translated_content;
            console.log(`Translated "${key}": "${value}" → "${result[key]}"`);
            
            // Add delay between translations
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (error) {
            console.error(`Failed to translate key "${key}":`, error);
            result[key] = value; // Fallback to original
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively translate nested objects
        result[key] = await this.translateNestedObject(
          value,
          result[key] || {},
          targetLanguage,
          sourceLanguage
        );
      }
    }

    return result;
  }

  static async generateTranslationFiles(
    translations: Record<string, Record<string, any>>
  ): Promise<string[]> {
    const generatedFiles: string[] = [];

    for (const [language, namespaces] of Object.entries(translations)) {
      for (const [namespace, content] of Object.entries(namespaces)) {
        try {
          const blob = new Blob([JSON.stringify(content, null, 2)], { 
            type: 'application/json' 
          });
          
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${language}-${namespace}.json`;
          a.click();
          URL.revokeObjectURL(url);
          
          generatedFiles.push(`${language}-${namespace}.json`);
        } catch (error) {
          console.error(`Failed to generate file for ${language}/${namespace}:`, error);
        }
      }
    }

    return generatedFiles;
  }

  static getLanguageProgress(
    sourceTranslations: Record<string, any>,
    targetTranslations: Record<string, any>
  ): { total: number; translated: number; percentage: number; missing: string[] } {
    const flattenObject = (obj: any, prefix = ''): string[] => {
      let keys: string[] = [];
      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          keys = keys.concat(flattenObject(obj[key], fullKey));
        } else if (typeof obj[key] === 'string') {
          keys.push(fullKey);
        }
      }
      return keys;
    };

    const getValue = (obj: any, path: string): any => {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    const sourceKeys = flattenObject(sourceTranslations);
    const translatedKeys = sourceKeys.filter(key => {
      const value = getValue(targetTranslations, key);
      return value && typeof value === 'string' && value.trim() !== '';
    });

    const missing = sourceKeys.filter(key => {
      const value = getValue(targetTranslations, key);
      return !value || typeof value !== 'string' || value.trim() === '';
    });

    return {
      total: sourceKeys.length,
      translated: translatedKeys.length,
      percentage: sourceKeys.length > 0 ? Math.round((translatedKeys.length / sourceKeys.length) * 100) : 100,
      missing
    };
  }
}