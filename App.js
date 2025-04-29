import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import AppNavigator from './navigation/AppNavigator';
import './config/firebase'; // Import Firebase configuration
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

// Root app component that wraps everything with providers
export default function App() {
  return (
    <NavigationContainer>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </NavigationContainer>
  );
}

// Inner component that can use the language context
function AppContent() {
  const { isLoading } = useLanguage();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A1B41" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#1A1B41',
  }
});