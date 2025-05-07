// SignUpScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, SafeAreaView, ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Svg, Path, Circle, Rect } from 'react-native-svg';

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
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

<<<<<<< HEAD
  // SVG Icons
  const PersonIcon = () => (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const MailIcon = () => (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M22 6L12 13L2 6" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const LockIcon = () => (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="11" width="14" height="10" rx="2" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92172 3.42143 9.93913 3 11 3H13C14.0609 3 15.0783 3.42143 15.8284 4.17157C16.5786 4.92172 17 5.93913 17 7V11" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const EyeIcon = () => (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="12" r="3" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const EyeOffIcon = () => (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2047 20.84 15.19M14.12 14.12C13.8454 14.4147 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.481 9.80385 14.1962C9.51897 13.9113 9.29439 13.572 9.14351 13.1984C8.99262 12.8249 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2219 9.18488 10.8539C9.34884 10.4859 9.58525 10.1547 9.88 9.88" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M1 1L23 23" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  // Email validation function
  const isValidEmail = (email) => {
=======
  const validateEmail = (email) => {
>>>>>>> 59f2af2f64e79dc2ec8270ef05b67fbf70274111
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

<<<<<<< HEAD
=======
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

>>>>>>> 59f2af2f64e79dc2ec8270ef05b67fbf70274111
  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

<<<<<<< HEAD
    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
=======
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!isPasswordValid()) {
      Alert.alert('Error', 'Password does not meet the requirements');
>>>>>>> 59f2af2f64e79dc2ec8270ef05b67fbf70274111
      return;
    }

    try {
      setLoading(true);
      // Create user with email and password
      await register(email, password, fullName);
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
          <View style={styles.inputIcon}>
            <PersonIcon />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <MailIcon />
          </View>
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
          <View style={styles.inputIcon}>
            <LockIcon />
          </View>
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
            {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
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