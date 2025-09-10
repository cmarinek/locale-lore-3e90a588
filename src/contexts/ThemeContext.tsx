import React, { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

// Temporarily disable context to prevent bundling issues
let globalThemeState: ThemeContextType = {
  theme: 'auto',
  setTheme: () => {},
  actualTheme: 'light'
};

export const useTheme = () => {
  return globalThemeState;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
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

  // Update global state
  globalThemeState = {
    theme,
    setTheme,
    actualTheme,
  };

  return <div>{children}</div>;
};

