// Custom hook for theme management
import { useState, useEffect, createContext, useContext } from 'react';
import { localStorage } from '../utils/storage';

// Create Theme Context
const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.get('userSettings');
    const darkMode = savedTheme?.darkMode || false;
    
    setIsDarkMode(darkMode);
    
    // Apply theme to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    // Save to localStorage
    const currentSettings = localStorage.get('userSettings') || {};
    localStorage.set('userSettings', {
      ...currentSettings,
      darkMode: newTheme
    });
    
    // Apply theme to document
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Set theme
  const setTheme = (darkMode) => {
    setIsDarkMode(darkMode);
    
    // Save to localStorage
    const currentSettings = localStorage.get('userSettings') || {};
    localStorage.set('userSettings', {
      ...currentSettings,
      darkMode
    });
    
    // Apply theme to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const value = {
    isDarkMode,
    toggleTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
