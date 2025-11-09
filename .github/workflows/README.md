# Translation Sync Workflow

This GitHub Action automatically detects missing translations and generates pull requests with updated translation files.

## Setup

### Required Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

1. **SUPABASE_URL** - Your Supabase project URL
2. **SUPABASE_SERVICE_ROLE_KEY** - Your Supabase service role key (with admin access)
3. **OPENAI_API_KEY** - Your OpenAI API key for translations

### How It Works

1. **Trigger**: Runs automatically when:
   - Changes are pushed to the `main` branch that affect:
     - English translation files (`public/locales/en/**/*.json`)
     - Source code files (`src/**/*.tsx`, `src/**/*.ts`)
   - Can also be triggered manually via "Run workflow"

2. **Detection**: Scans all translation files and compares them to the English source to find:
   - Missing translation keys
   - Empty translation values

3. **Translation**: Automatically translates missing keys using OpenAI API

4. **PR Creation**: Creates a pull request with:
   - Updated translation files
   - Detailed coverage report
   - Language-by-language breakdown
   - Namespace-specific statistics

## Manual Usage

You can also run the translation detection locally:

```bash
# Install dependencies
npm install

# Run detection
SUPABASE_URL=your_url \
SUPABASE_SERVICE_ROLE_KEY=your_key \
OPENAI_API_KEY=your_key \
node scripts/detect-translations.js

# Generate coverage report
node scripts/translation-coverage-report.js
```

## Configuration

### Modify Languages

Edit `scripts/detect-translations.js` and update the `LANGUAGES` array:

```javascript
const LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ar', 'hi', 'sw', 'zh'];
```

### Modify Namespaces

Edit `scripts/detect-translations.js` and update the `NAMESPACES` array:

```javascript
const NAMESPACES = ['common', 'navigation', 'auth', 'lore', 'profile', 'admin', 'errors'];
```

### Change Trigger Paths

Edit `.github/workflows/translation-sync.yml` to change which file changes trigger the workflow:

```yaml
on:
  push:
    paths:
      - 'public/locales/en/**/*.json'  # English translation changes
      - 'src/**/*.tsx'                 # React component changes
      - 'src/**/*.ts'                  # TypeScript file changes
```

## Translation Debug Mode

During development, enable translation debug mode to visually identify missing translations:

1. Toggle the "Translation Debug" button in the bottom-right corner (dev mode only)
2. Missing translations will be highlighted with a red background
3. Hover over highlighted text to see the missing key

This helps identify hardcoded strings that need to be translated.
