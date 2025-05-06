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
  ScrollView
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';

export default function CreateTeacherScreen({ navigation }) {
  const { createTeacherAccount, userRole, user } = useAuth();
  const { currentTheme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Check admin status directly from Firestore
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        if (user && user.uid) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setAdminVerified(true);
          } else {
            console.log('User is not admin in Firestore:', userDoc.data()?.role);
          }
        }
      } catch (error) {
        console.error('Error verifying admin status:', error);
      }
    };
    
    verifyAdmin();
  }, [user]);

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
    
    if (!adminVerified) {
      // Re-verify admin status directly
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists() || userDoc.data().role !== 'admin') {
          return Alert.alert('Error', `Only administrators can create teacher accounts.\nYour role: ${userDoc.exists() ? userDoc.data().role : 'unknown'}`);
        }
      } catch (error) {
        return Alert.alert('Error', `Failed to verify admin permissions: ${error.message}`);
      }
    }
    
    setLoading(true);
    try {
      // Create a new user in Firebase Authentication
      await createTeacherAccount(email, password, name);
      
      Alert.alert(
        'Success',
        'Teacher account created',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ManageUsers'),
          },
        ],
        { cancelable: false }
      );
    } catch (err) {
      Alert.alert('Failed', err.message || 'An error occurred while creating the account');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentTheme.primary} />
      
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
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
              <View style={[styles.iconWrapper, { backgroundColor: '#2196F3' + '20' }]}>
                <Ionicons name="school" size={40} color="#2196F3" />
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
                <Ionicons name="person-outline" size={24} color={currentTheme.primary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  style={[styles.input, { 
                    color: currentTheme.text, 
                    borderColor: currentTheme.border,
                    backgroundColor: currentTheme.background + '80'
                  }]}
                  placeholderTextColor={currentTheme.textSecondary}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Ionicons name="mail-outline" size={24} color={currentTheme.primary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, { 
                    color: currentTheme.text, 
                    borderColor: currentTheme.border,
                    backgroundColor: currentTheme.background + '80'
                  }]}
                  placeholderTextColor={currentTheme.textSecondary}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Ionicons name="lock-closed-outline" size={24} color={currentTheme.primary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  style={[styles.input, { 
                    color: currentTheme.text, 
                    borderColor: currentTheme.border,
                    backgroundColor: currentTheme.background + '80'
                  }]}
                  placeholderTextColor={currentTheme.textSecondary}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={togglePasswordVisibility}
                >
                  <Ionicons 
                    name={passwordVisible ? "eye-off-outline" : "eye-outline"} 
                    size={24} 
                    color={currentTheme.textSecondary} 
                  />
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
                    <Ionicons name="add-circle-outline" size={20} color="#FFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Create Teacher</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={20} color={currentTheme.textSecondary} />
              <Text style={[styles.infoText, { color: currentTheme.textSecondary }]}>
                New teachers will be able to login immediately with these credentials
              </Text>
            </View>
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
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  formCard: {
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 12,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  }
});
