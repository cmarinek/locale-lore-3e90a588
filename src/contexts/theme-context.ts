import React from 'react';
import { markModule } from '@/debug/module-dupe-check';

// Mark module load for debugging
markModule('ThemeContext-v6');
console.log('[TRACE] ThemeContext-v6 file start');

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

console.log('[TRACE] Before createContext in ThemeContext');

// Lazy context creation to avoid TDZ issues
let _themeContext: React.Context<ThemeContextType | undefined> | null = null;

function getThemeContext() {
  if (!_themeContext) {
    console.log('[TRACE] Creating ThemeContext lazily');
    _themeContext = React.createContext<ThemeContextType | undefined>(undefined);
  }
  return _themeContext;
}

export const ThemeContext = new Proxy({} as React.Context<ThemeContextType | undefined>, {
  get(target, prop) {
    return getThemeContext()[prop as keyof React.Context<ThemeContextType | undefined>];
  }
});

console.log('[TRACE] After createContext in ThemeContext');

export const useTheme = () => {
  console.log('[TRACE] useTheme invoked; typeof ThemeContext =', typeof ThemeContext);
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};