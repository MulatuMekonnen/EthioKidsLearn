import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const themes = {
  default: {
    id: 'default',
    name: 'Default',
    primary: '#2196F3',
    secondary: '#1976D2',
    background: '#f5f5f5',
    text: '#333333',
    card: '#ffffff',
    border: '#e0e0e0',
  },
  nature: {
    id: 'nature',
    name: 'Nature',
    primary: '#4CAF50',
    secondary: '#388E3C',
    background: '#f1f8e9',
    text: '#2e7d32',
    card: '#ffffff',
    border: '#c8e6c9',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    primary: '#00BCD4',
    secondary: '#0097A7',
    background: '#e0f7fa',
    text: '#00838f',
    card: '#ffffff',
    border: '#b2ebf2',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    primary: '#FF9800',
    secondary: '#F57C00',
    background: '#fff3e0',
    text: '#e65100',
    card: '#ffffff',
    border: '#ffe0b2',
  },
  royal: {
    id: 'royal',
    name: 'Royal',
    primary: '#9C27B0',
    secondary: '#7B1FA2',
    background: '#f3e5f5',
    text: '#6a1b9a',
    card: '#ffffff',
    border: '#e1bee7',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(themes.default);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem('selectedTheme');
      if (savedThemeId && themes[savedThemeId]) {
        setCurrentTheme(themes[savedThemeId]);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const changeTheme = async (themeId) => {
    try {
      if (themes[themeId]) {
        setCurrentTheme(themes[themeId]);
        await AsyncStorage.setItem('selectedTheme', themeId);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, themes }}>
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