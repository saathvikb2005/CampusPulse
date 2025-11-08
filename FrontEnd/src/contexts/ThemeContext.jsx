import React, { createContext, useContext, useEffect, useState } from 'react';
import { getThemePreference, applyTheme } from '../utils/preferences';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = getThemePreference();
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);

    // Listen for system theme changes when auto is selected
    if (savedTheme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleThemeChange = () => {
        applyTheme('auto');
      };
      
      mediaQuery.addEventListener('change', handleThemeChange);
      return () => mediaQuery.removeEventListener('change', handleThemeChange);
    }
  }, []);

  const setTheme = (theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    
    // Save to localStorage
    try {
      const existingPrefs = localStorage.getItem('userPreferences');
      const userPrefs = existingPrefs ? JSON.parse(existingPrefs) : {};
      userPrefs.theme = theme;
      localStorage.setItem('userPreferences', JSON.stringify(userPrefs));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const getEffectiveTheme = () => {
    return currentTheme === 'auto' ? getSystemTheme() : currentTheme;
  };

  const value = {
    currentTheme,
    setTheme,
    getSystemTheme,
    getEffectiveTheme,
    isDark: getEffectiveTheme() === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};