import React from 'react';
import { markModule } from '@/debug/module-dupe-check';

// Mark module load for debugging
markModule('ThemeContext-v10');
console.log('[TRACE] ThemeContext-v10 file start');

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

// Create a placeholder that will be replaced by the actual context
export let ThemeContext: React.Context<ThemeContextType | undefined> = null as any;

// This will be called by the provider to set the actual context
export const _setThemeContext = (context: React.Context<ThemeContextType | undefined>) => {
  ThemeContext = context;
};

export const useTheme = () => {
  if (!ThemeContext) {
    throw new Error('useTheme must be used within a ThemeProvider - context not initialized');
  }
  
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};