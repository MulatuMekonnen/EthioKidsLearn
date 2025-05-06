// src/screens/admin/CreateTeacherScreen.js
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  Text,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function CreateTeacherScreen({ navigation }) {
  const { createTeacherAccount, userRole } = useAuth();
  const { currentTheme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !email || !password) {
      return Alert.alert('Error', 'All fields are required');
    }
    
    if (userRole !== 'admin') {
      return Alert.alert('Error', 'Only administrators can create teacher accounts');
    }
    
    setLoading(true);
    try {
      await createTeacherAccount(email, password, name);
      // Show an OK button that navigates back to ManageUsers
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Teacher Account</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={[styles.title, { color: currentTheme.text }]}>Create Teacher Account</Text>
        
        <View style={styles.inputGroup}>
          <Ionicons name="person-outline" size={24} color={currentTheme.primary} style={styles.inputIcon} />
          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            style={[styles.input, { 
              color: currentTheme.text, 
              borderColor: currentTheme.border,
              backgroundColor: currentTheme.card
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
              backgroundColor: currentTheme.card
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
            secureTextEntry
            style={[styles.input, { 
              color: currentTheme.text, 
              borderColor: currentTheme.border,
              backgroundColor: currentTheme.card
            }]}
            placeholderTextColor={currentTheme.textSecondary}
          />
        </View>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.primary }]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Create Teacher</Text>
          )}
        </TouchableOpacity>
      </View>
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
  formContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center'
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
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
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
  }
});
