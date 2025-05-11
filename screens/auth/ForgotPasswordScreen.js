import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  Text,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Svg, Path } from 'react-native-svg';

export default function ForgotPasswordScreen({ navigation }) {
  const { resetPassword } = useAuth();
  const { currentTheme } = useTheme();
  const { translate } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      return Alert.alert(translate('errors.title'), translate('errors.fillAllFields'));
    }
    
    if (!email.includes('@')) {
      return Alert.alert(translate('errors.title'), translate('errors.invalidEmail'));
    }
    
    setLoading(true);
    
    try {
      await resetPassword(email);
      Alert.alert(
        translate('auth.passwordResetSent'),
        translate('auth.checkEmailForReset'),
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (err) {
      console.error('Error resetting password:', err);
      let errorMessage = translate('errors.unknown');
      
      if (err.message) {
        if (err.message.includes('user-not-found')) {
          errorMessage = translate('auth.userNotFound');
        } else if (err.message.includes('invalid-email')) {
          errorMessage = translate('errors.invalidEmail');
        } else if (err.message.includes('network-request-failed')) {
          errorMessage = translate('errors.networkError');
        } else {
          errorMessage = err.message;
        }
      }
      
      Alert.alert(translate('errors.title'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const BackIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const MailIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M22 6L12 13L2 6" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentTheme.primary} />
      
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translate('auth.forgotPassword')}</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: currentTheme.text }]}>
            {translate('auth.forgotPassword')}
          </Text>
          <Text style={[styles.subtitle, { color: currentTheme.textSecondary }]}>
            {translate('auth.enterEmailForReset')}
          </Text>
          
          <View style={[styles.formCard, { backgroundColor: currentTheme.card }]}>
            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <MailIcon />
              </View>
              <TextInput
                placeholder={translate('auth.email')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { 
                  color: currentTheme.text, 
                  borderColor: currentTheme.border,
                }]}
                placeholderTextColor={currentTheme.textSecondary}
              />
            </View>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: currentTheme.primary }]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>{translate('auth.resetPassword')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'left',
  },
  headerSpacer: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  formCard: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    paddingLeft: 56,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
}); 