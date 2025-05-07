// SignUpScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, SafeAreaView, ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSymbol: false,
    hasMinLength: false
  });
  const { register } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkPasswordStrength = (pass) => {
    setPasswordStrength({
      hasUpperCase: /[A-Z]/.test(pass),
      hasLowerCase: /[a-z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
      hasMinLength: pass.length >= 8
    });
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    checkPasswordStrength(text);
  };

  const isPasswordValid = () => {
    return Object.values(passwordStrength).every(Boolean);
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!isPasswordValid()) {
      Alert.alert('Error', 'Password does not meet the requirements');
      return;
    }

    try {
      setLoading(true);
      await register(email, password);
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        
        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={22} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={22} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={handlePasswordChange}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Ionicons 
              name={passwordVisible ? 'eye-off' : 'eye'} 
              size={22} 
              color="#999" 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordRequirements}>
          <Text style={styles.requirementTitle}>Password Requirements:</Text>
          <Text style={[styles.requirement, passwordStrength.hasMinLength && styles.requirementMet]}>
            • At least 8 characters
          </Text>
          <Text style={[styles.requirement, passwordStrength.hasUpperCase && styles.requirementMet]}>
            • At least one uppercase letter
          </Text>
          <Text style={[styles.requirement, passwordStrength.hasLowerCase && styles.requirementMet]}>
            • At least one lowercase letter
          </Text>
          <Text style={[styles.requirement, passwordStrength.hasNumber && styles.requirementMet]}>
            • At least one number
          </Text>
          <Text style={[styles.requirement, passwordStrength.hasSymbol && styles.requirementMet]}>
            • At least one special character
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1E90FF" />
        ) : (
          <>
            <View style={styles.buttonContainer}>
              <Button
                title="Sign Up"
                onPress={handleSignUp}
                color="#1E90FF"
              />
            </View>
            
            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>
                Already have an account?{' '}
                <Text 
                  style={styles.link}
                  onPress={() => navigation.navigate('Login')}
                >
                  Login
                </Text>
              </Text>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E90FF',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
  },
  inputIcon: {
    marginLeft: 15,
    marginRight: 5,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 5,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  buttonContainer: {
    marginTop: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  linkContainer: {
    marginTop: 25,
    alignItems: 'center',
  },
  linkText: {
    color: '#666666',
    fontSize: 16,
  },
  link: {
    color: '#1E90FF',
    fontWeight: '600',
  },
  passwordRequirements: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  requirementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  requirement: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  requirementMet: {
    color: '#4CAF50',
  },
});