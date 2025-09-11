import React from 'react';
import { markModule } from '@/debug/module-dupe-check';

// Mark module load for debugging
markModule('ThemeContext-v2');
console.log('[TRACE] ThemeContext-v2 file start - React available:', !!React);

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

console.log('[TRACE] Before createContext in ThemeContext');
export const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);
console.log('[TRACE] After createContext in ThemeContext');

export const useTheme = () => {
  console.log('[TRACE] useTheme invoked; typeof ThemeContext =', typeof ThemeContext);
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};