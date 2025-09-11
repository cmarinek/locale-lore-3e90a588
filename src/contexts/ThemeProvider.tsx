import React, { useEffect, useState } from 'react';
import { markModule } from '@/debug/module-dupe-check';
import { Theme, ThemeContextType, THEME_CONTEXT_NAME } from './theme-context';
import { createContextSafely } from '@/lib/context-registry';

// Mark module load for debugging
markModule('ThemeProvider-v14');
console.log('[TRACE] ThemeProvider-v14 file start');

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  console.log('[TRACE] ThemeProvider component initializing');
  
  // Create context safely using registry
  const ThemeContext = createContextSafely<ThemeContextType | undefined>(THEME_CONTEXT_NAME, undefined);
  
  // Use localStorage for theme persistence instead of depending on user authentication
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('locale-lore-theme');
    return (stored as Theme) || 'auto';
  });
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  const applyTheme = (themeToApply: Theme) => {
    const root = document.documentElement;
    
    let finalTheme: 'light' | 'dark';
    
    if (themeToApply === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      finalTheme = mediaQuery.matches ? 'dark' : 'light';
    } else {
      finalTheme = themeToApply;
    }

    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add the appropriate theme class
    root.classList.add(finalTheme);
    
    setActualTheme(finalTheme);
  };

  const setTheme = (newTheme: Theme) => {
    // Store theme in localStorage for persistence
    localStorage.setItem('locale-lore-theme', newTheme);
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  useEffect(() => {
    // Apply theme on mount and when theme changes
    applyTheme(theme);

    // Listen for system theme changes when in auto mode
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme(theme);
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    actualTheme,
  };

  console.log('[TRACE] ThemeProvider rendering with value:', { theme, actualTheme });

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Export hook from here
export const useTheme = () => {
  const ThemeContext = createContextSafely<ThemeContextType | undefined>(THEME_CONTEXT_NAME, undefined);
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};