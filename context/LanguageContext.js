import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, Alert } from 'react-native';
import en from '../translations/en.json';
import am from '../translations/am.json';
import or from '../translations/or.json';

const LANGUAGE_STORAGE_KEY = '@EthioKidsLearn:language';

// Create context with default values to prevent undefined errors
const LanguageContext = createContext({
  currentLanguage: 'en',
  changeLanguage: () => {},
  translate: () => '',
  languages: {},
  isLoading: true
});

const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    translations: en,
    isRTL: false,
  },
  am: {
    code: 'am',
    name: 'አማርኛ',
    translations: am,
    isRTL: true,
  },
  or: {
    code: 'or',
    name: 'Afaan Oromoo',
    translations: or,
    isRTL: false,
  },
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    console.warn('useLanguage must be used within a LanguageProvider');
    // Return fallback values instead of throwing an error
    return {
      currentLanguage: 'en',
      changeLanguage: () => {},
      translate: () => '',
      languages: LANGUAGES,
      isLoading: false
    };
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState(en);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('LanguageProvider initialized');
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      setIsLoading(true);
      console.log('Loading language from AsyncStorage');
      
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      console.log('Saved language:', savedLanguage);
      
      if (savedLanguage && LANGUAGES[savedLanguage]) {
        console.log('Setting language to:', savedLanguage);
        setCurrentLanguage(savedLanguage);
        setTranslations(LANGUAGES[savedLanguage].translations);
        
        // Set RTL orientation based on saved language
        const isRTL = LANGUAGES[savedLanguage].isRTL;
        try {
          I18nManager.allowRTL(isRTL);
          I18nManager.forceRTL(isRTL);
        } catch (rtlError) {
          console.error('Error setting RTL on load:', rtlError);
        }
      } else {
        console.log('No valid saved language found, using default: en');
        // Save default language
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (language) => {
    try {
      console.log('Changing language to:', language);
      if (!LANGUAGES[language]) {
        console.error('Invalid language code:', language);
        Alert.alert('Error', 'Invalid language selected');
        return;
      }
      
      // Save to AsyncStorage first
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      console.log('Language saved to AsyncStorage');
      
      // Then update the state
      setCurrentLanguage(language);
      setTranslations(LANGUAGES[language].translations);
      
      // Update RTL layout if needed
      const isRTL = LANGUAGES[language].isRTL;
      console.log('Setting RTL to:', isRTL);
      
      // Wrap in try-catch to prevent crashes on some devices
      try {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
      } catch (rtlError) {
        console.error('Error setting RTL:', rtlError);
      }
      
      console.log('Language changed successfully to:', language);
    } catch (error) {
      console.error('Error saving language:', error);
      Alert.alert('Error', 'Failed to change language. Please try again.');
    }
  };

  const translate = (key) => {
    // Handle empty or undefined key
    if (!key) {
      console.warn('Translation key is empty or undefined');
      return '';
    }
    
    try {
      const keys = key.split('.');
      let value = translations;
      
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) {
          console.warn(`Translation missing for key: ${key}`);
          return key;
        }
      }
      
      return value;
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  };

  const contextValue = {
    currentLanguage,
    changeLanguage,
    translate,
    languages: LANGUAGES,
    isLoading
  };
  
  console.log('LanguageContext value updated:', { currentLanguage });

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}; 