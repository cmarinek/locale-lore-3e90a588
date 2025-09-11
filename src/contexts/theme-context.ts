import { markModule } from '@/debug/module-dupe-check';

// Mark module load for debugging
markModule('ThemeContext-v14');


export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

// Pure type exports - no React API calls during module initialization
export const THEME_CONTEXT_NAME = 'theme-context-v14';