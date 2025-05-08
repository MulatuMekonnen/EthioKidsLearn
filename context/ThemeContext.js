import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const lightTheme = {
  mode: 'light',
  primary: '#2196F3',
  secondary: '#1976D2',
  background: '#f5f5f5',
  text: '#333333',
  textSecondary: '#666666',
  card: '#ffffff',
  border: '#e0e0e0',
  inputBackground: '#f9f9f9',
  danger: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
};

const darkTheme = {
  mode: 'dark',
  primary: '#2196F3',
  secondary: '#1976D2',
  background: '#121212',
  text: '#ffffff',
  textSecondary: '#aaaaaa',
  card: '#1e1e1e',
  border: '#333333',
  inputBackground: '#2c2c2c',
  danger: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(lightTheme);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedThemeMode = await AsyncStorage.getItem('themeMode');
      if (savedThemeMode) {
        setCurrentTheme(savedThemeMode === 'dark' ? darkTheme : lightTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = currentTheme.mode === 'light' ? darkTheme : lightTheme;
      setCurrentTheme(newTheme);
      await AsyncStorage.setItem('themeMode', newTheme.mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 