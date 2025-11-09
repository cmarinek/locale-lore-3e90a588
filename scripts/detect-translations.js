#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ar', 'hi', 'sw', 'zh'];
const NAMESPACES = ['common', 'navigation', 'auth', 'lore', 'profile', 'admin', 'errors'];

async function detectMissingTranslations() {
  console.log('🔍 Detecting missing translations...\n');
  
  const results = [];
  
  for (const namespace of NAMESPACES) {
    const englishPath = path.join('public', 'locales', 'en', `${namespace}.json`);
    
    if (!fs.existsSync(englishPath)) {
      console.log(`⚠️  English source not found for ${namespace}, skipping...`);
      continue;
    }
    
    const englishContent = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
    
    for (const lang of LANGUAGES) {
      if (lang === 'en') continue;
      
      const targetPath = path.join('public', 'locales', lang, `${namespace}.json`);
      
      let targetContent = {};
      if (fs.existsSync(targetPath)) {
        targetContent = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      }
      
      const analysis = analyzeTranslations(englishContent, targetContent);
      
      if (analysis.missingKeys.length > 0 || analysis.emptyKeys.length > 0) {
        console.log(`📝 ${lang}/${namespace}: ${analysis.missingKeys.length} missing, ${analysis.emptyKeys.length} empty`);
        
        results.push({
          language: lang,
          namespace,
          missing: [...analysis.missingKeys, ...analysis.emptyKeys],
          analysis
        });
        
        // Auto-translate if OpenAI key is available
        if (process.env.OPENAI_API_KEY) {
          await translateAndUpdate(lang, namespace, englishContent, targetContent, analysis);
        }
      }
    }
  }
  
  console.log(`\n✅ Detection complete. Found ${results.length} namespaces needing translations.`);
  return results;
}

function analyzeTranslations(source, target, prefix = '') {
  let missingKeys = [];
  let emptyKeys = [];
  let totalKeys = 0;
  
  for (const key in source) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    totalKeys++;
    
    if (typeof source[key] === 'object' && source[key] !== null) {
      const nested = analyzeTranslations(source[key], target[key] || {}, fullKey);
      missingKeys = [...missingKeys, ...nested.missingKeys];
      emptyKeys = [...emptyKeys, ...nested.emptyKeys];
      totalKeys += nested.totalKeys - 1;
    } else {
      if (!(key in target)) {
        missingKeys.push(fullKey);
      } else if (!target[key] || target[key].trim() === '') {
        emptyKeys.push(fullKey);
      }
    }
  }
  
  return { missingKeys, emptyKeys, totalKeys };
}

async function translateAndUpdate(language, namespace, sourceContent, targetContent, analysis) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('⚠️  Supabase credentials not found, skipping auto-translation');
    return;
  }
  
  try {
    // Call the translation-sync edge function
    const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/translation-sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceLanguage: 'English',
        targetLanguage: getLanguageName(language),
        translations: sourceContent,
        namespace
      })
    });
    
    if (!response.ok) {
      throw new Error(`Translation failed: ${response.status}`);
    }
    
    const { translations } = await response.json();
    
    // Merge with existing translations
    const merged = { ...targetContent, ...translations };
    
    // Write updated file
    const targetPath = path.join('public', 'locales', language, `${namespace}.json`);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, JSON.stringify(merged, null, 2));
    
    console.log(`✅ Updated ${language}/${namespace}.json`);
  } catch (error) {
    console.error(`❌ Failed to translate ${language}/${namespace}:`, error.message);
  }
}

function getLanguageName(code) {
  const names = {
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    ar: 'Arabic',
    hi: 'Hindi',
    sw: 'Swahili',
    zh: 'Chinese'
  };
  return names[code] || code;
}

// Run detection
detectMissingTranslations()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Translation detection failed:', error);
    process.exit(1);
  });
