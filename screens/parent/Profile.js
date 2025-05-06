import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { updateProfile } from 'firebase/auth';

export default function Profile() {
  const navigation = useNavigation();
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
      
      setDisplayName(user.displayName || '');
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Update displayName in Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName: displayName,
      });
      
      // Update user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: displayName,
        updatedAt: new Date().toISOString()
      });
      
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
      
      // Refresh user data
      loadUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={[styles.profileCard, { backgroundColor: currentTheme.card }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: currentTheme.primary }]}>
              <Text style={styles.avatarText}>
                {(user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
              </Text>
            </View>
            {editing && (
              <TouchableOpacity style={styles.changePhotoButton}>
                <Text style={{ color: currentTheme.primary }}>Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.infoContainer}>
            {editing ? (
              <TextInput
                style={[styles.nameInput, { color: currentTheme.text, borderColor: currentTheme.border }]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your name"
                placeholderTextColor={currentTheme.textSecondary}
              />
            ) : (
              <Text style={[styles.userName, { color: currentTheme.text }]}>
                {user?.displayName || 'Set your name'}
              </Text>
            )}
            <Text style={[styles.userEmail, { color: currentTheme.textSecondary }]}>
              {user?.email}
            </Text>
            <Text style={[styles.userRole, { color: currentTheme.text }]}>
              Role: {userData?.role || 'Parent'}
            </Text>
          </View>
          
          {editing ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: currentTheme.secondary }]}
                onPress={() => setEditing(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: currentTheme.primary }]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: currentTheme.primary }]}
              onPress={() => setEditing(true)}
            >
              <Ionicons name="pencil" size={16} color="#FFF" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={[styles.accountSection, { backgroundColor: currentTheme.card }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Account Information</Text>
          
          <View style={styles.accountItem}>
            <Ionicons name="calendar-outline" size={20} color={currentTheme.primary} />
            <View style={styles.accountItemContent}>
              <Text style={[styles.accountItemTitle, { color: currentTheme.text }]}>Account Created</Text>
              <Text style={[styles.accountItemValue, { color: currentTheme.textSecondary }]}>
                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}
              </Text>
            </View>
          </View>
          
          <View style={styles.accountItem}>
            <Ionicons name="people-outline" size={20} color={currentTheme.primary} />
            <View style={styles.accountItemContent}>
              <Text style={[styles.accountItemTitle, { color: currentTheme.text }]}>Children</Text>
              <Text style={[styles.accountItemValue, { color: currentTheme.textSecondary }]}>
                {userData?.children?.length || 0} child profiles
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFF',
  },
  changePhotoButton: {
    marginTop: 8,
  },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  nameInput: {
    fontSize: 20,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 200,
    textAlign: 'center',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    marginTop: 5,
  },
  userRole: {
    fontSize: 16,
    marginTop: 5,
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  accountSection: {
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountItemContent: {
    marginLeft: 12,
    flex: 1,
  },
  accountItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  accountItemValue: {
    fontSize: 14,
    marginTop: 2,
  },
}); 