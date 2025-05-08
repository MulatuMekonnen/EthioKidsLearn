// src/screens/admin/CreateTeacherScreen.js
import React, { useState, useEffect } from 'react';
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
  ScrollView,
  Linking
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Svg, Path, Circle, Rect } from 'react-native-svg';
import { getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { signOut } from 'firebase/auth';

export default function CreateTeacherScreen({ navigation }) {
  const { createTeacherAccount, userRole, user } = useAuth();
  const { currentTheme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  // Check admin status directly from Firestore
  useEffect(() => {
    const verifyAdmin = async () => {
      if (!user || !user.uid) {
        console.log('No user logged in');
        setAdminVerified(false);
        return;
      }

      try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists() && userDoc.data().role === 'admin') {
          console.log('User verified as admin');
            setAdminVerified(true);
          } else {
          console.log('User is not admin in Firestore:', userDoc.exists() ? userDoc.data().role : 'document does not exist');
          setAdminVerified(false);
          
          // If we're on this screen but not an admin, show alert and go back
          if (!userDoc.exists() || userDoc.data().role !== 'admin') {
            Alert.alert(
              'Permission Denied',
              'You do not have administrator privileges to create teacher accounts.',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          }
        }
      } catch (error) {
        console.error('Error verifying admin status:', error);
        setAdminVerified(false);
        Alert.alert('Error', 'Failed to verify admin permissions: ' + error.message);
      }
    };
    
    verifyAdmin();
  }, [user, navigation]);

  const showSuccessWithCredentials = (teacherEmail, teacherPassword) => {
    Alert.alert(
      'Teacher Account Created',
      `The account has been created successfully.\n\nTeacher Email: ${teacherEmail}\nPassword: ${teacherPassword}\n\nPlease share these credentials with the teacher.`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Reset form fields
            setName('');
            setEmail('');
            setPassword('');
            
            // Navigate back to manage users
            navigation.navigate('ManageUsers');
          }
        }
      ],
      { cancelable: false }
    );
  };

  const handleCreate = async () => {
    if (!name || !email || !password) {
      return Alert.alert('Error', 'All fields are required');
    }
    
    if (password.length < 6) {
      return Alert.alert('Error', 'Password must be at least 6 characters');
    }
    
    if (!email.includes('@')) {
      return Alert.alert('Error', 'Please enter a valid email address');
    }
    
    setLoading(true);
    setPermissionError(false);
    
    try {
      // Create the teacher account
      const teacherUser = await createTeacherAccount(email, password, name);
      console.log('Teacher account created successfully with UID:', teacherUser.uid);
      
      // Show success message with credentials
      showSuccessWithCredentials(email, password);
    } catch (err) {
      console.error('Error creating teacher account:', err);
      
      // Check for permissions error specifically
      if (err.message && err.message.includes('permission')) {
        setPermissionError(true);
      }
      
      // More specific error handling
      let errorMessage = 'An error occurred while creating the account';
      
      if (err.message) {
        if (err.message.includes('permissions') || err.message.includes('Unauthorized')) {
          errorMessage = 'Firebase security rules are preventing document creation. Please update your rules to allow admin access.';
        } else if (err.message.includes('email-already-in-use')) {
          errorMessage = 'This email is already registered. Please use a different email.';
        } else if (err.message.includes('network-request-failed')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      Alert.alert('Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to help guide admin to fix Firebase rules
  const openFirebaseConsole = () => {
    Alert.alert(
      'Firebase Console',
      'To fix permission issues, update your Firestore rules in the Firebase Console.',
      [
        {
          text: 'OK',
          onPress: () => {}
        }
      ]
    );
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // SVG Icons
  const BackIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const GraduationCapIcon = () => (
    <Svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 7V17" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 13V19C17 19.5304 16.7893 20.0391 16.4142 20.4142C16.0391 20.7893 15.5304 21 15 21H9C8.46957 21 7.96086 20.7893 7.58579 20.4142C7.21071 20.0391 7 19.5304 7 19V13" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const PersonIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="7" r="4" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const MailIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M22 6L12 13L2 6" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const LockIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="11" width="14" height="10" rx="2" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92172 3.42143 9.93913 3 11 3H13C14.0609 3 15.0783 3.42143 15.8284 4.17157C16.5786 4.92172 17 5.93913 17 7V11" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const EyeIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="12" r="3" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const EyeOffIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2047 20.84 15.19M14.12 14.12C13.8454 14.4147 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.481 9.80385 14.1962C9.51897 13.9113 9.29439 13.572 9.14351 13.1984C8.99262 12.8249 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2219 9.18488 10.8539C9.34884 10.4859 9.58525 10.1547 9.88 9.88" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M1 1L23 23" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const AddIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#FFF" strokeWidth="2" />
      <Path d="M12 8V16M8 12H16" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const InfoIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#999" strokeWidth="2" />
      <Path d="M12 16V12M12 8H12.01" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
        <Text style={styles.headerTitle}>Create Teacher Account</Text>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <View style={styles.iconContainer}>
              <View style={[styles.iconWrapper, { backgroundColor: '#E3F2FD' }]}>
                <GraduationCapIcon />
              </View>
            </View>
            
            <Text style={[styles.title, { color: currentTheme.text }]}>
              Create Teacher Account
            </Text>
            <Text style={[styles.subtitle, { color: currentTheme.textSecondary }]}>
              Add a new teacher to your educational platform
            </Text>
            
            <View style={[styles.formCard, { backgroundColor: currentTheme.card }]}>
              <View style={styles.inputGroup}>
                <View style={styles.inputIcon}>
                  <PersonIcon />
                </View>
                <TextInput
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  style={[styles.input, { 
                    color: currentTheme.text, 
                    borderColor: currentTheme.border,
                  }]}
                  placeholderTextColor={currentTheme.textSecondary}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <View style={styles.inputIcon}>
                  <MailIcon />
                </View>
                <TextInput
                  placeholder="Email"
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
              
              <View style={styles.inputGroup}>
                <View style={styles.inputIcon}>
                  <LockIcon />
                </View>
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  style={[styles.input, { 
                    color: currentTheme.text, 
                    borderColor: currentTheme.border,
                  }]}
                  placeholderTextColor={currentTheme.textSecondary}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={togglePasswordVisibility}
                >
                  {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={[styles.button, { backgroundColor: currentTheme.primary }]}
                onPress={handleCreate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <View style={styles.buttonIcon}>
                      <AddIcon />
                    </View>
                    <Text style={styles.buttonText}>Create Teacher</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.infoCard}>
              <InfoIcon />
              <Text style={[styles.infoText, { color: currentTheme.textSecondary }]}>
                New teachers will be able to login immediately with these credentials
              </Text>
            </View>

            {permissionError && (
              <View style={styles.errorCard}>
                <View style={styles.errorIconContainer}>
                  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" stroke="#FF3B30" strokeWidth="2" />
                    <Path d="M12 8V13" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" />
                    <Circle cx="12" cy="16" r="1" fill="#FF3B30" />
                  </Svg>
                </View>
                <Text style={styles.errorTitle}>Firebase Permission Error</Text>
                <Text style={styles.errorText}>
                  Firebase security rules are preventing teacher account creation. Please update your Firestore rules in the Firebase Console to allow admins to create user documents:
                  {"\n\n"}
                  1. Open the Firebase Console
                  {"\n"}
                  2. Navigate to Firestore {'>>'} Rules
                  {"\n"}
                  3. Update the rule for /users/{'{'}userId{'}'} to allow admins to create documents
                  {"\n\n"}
                  Rule example: allow create: if isAdmin() || (isAuthenticated() && request.auth.uid == userId);
                </Text>
                <TouchableOpacity 
                  style={styles.fixButton}
                  onPress={openFirebaseConsole}
                >
                  <Text style={styles.fixButtonText}>Open Firebase Console</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
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
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
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
  eyeIcon: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
  button: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  errorCard: {
    marginTop: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 12,
    backgroundColor: '#FFF1F0',
  },
  errorIconContainer: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  fixButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  fixButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
