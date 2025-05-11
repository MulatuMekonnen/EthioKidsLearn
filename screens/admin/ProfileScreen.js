import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Svg, Path, Circle } from 'react-native-svg';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import ProfileImageManager from '../../components/ProfileImageManager';

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { translate } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setName(userData.displayName || '');
        setEmail(userData.email || user.email || '');
        setPhone(userData.phone || '');
        setBio(userData.bio || '');
        
        if (userData.profileImage) {
          setProfileImage(userData.profileImage);
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      Alert.alert(translate('errors.title'), translate('admin.failedToUpdate'));
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user?.uid) return;
    
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: name,
        phone: phone,
        bio: bio,
        updatedAt: new Date().toISOString()
      });
      
      Alert.alert('Success', translate('admin.profileUpdated'));
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(translate('errors.title'), translate('admin.failedToUpdate'));
    } finally {
      setSaving(false);
    }
  };

  // Back Icon Component
  const BackIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  // Camera Icon Component
  const CameraIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3 16.8V9.2C3 8.0799 3 7.51984 3.21799 7.09202C3.40973 6.71569 3.71569 6.40973 4.09202 6.21799C4.51984 6 5.0799 6 6.2 6H7.25464C7.37758 6 7.43905 6 7.49576 5.9935C7.79166 5.95961 8.05705 5.79559 8.21969 5.54609C8.25086 5.49827 8.27836 5.44328 8.33333 5.33333C8.44329 5.11342 8.49827 5.00346 8.56062 4.90782C8.8859 4.40882 9.41668 4.08078 10.0085 4.01299C10.1219 4 10.2448 4 10.4907 4H13.5093C13.7552 4 13.8781 4 13.9915 4.01299C14.5833 4.08078 15.1141 4.40882 15.4394 4.90782C15.5017 5.00345 15.5567 5.11343 15.6667 5.33333C15.7216 5.44329 15.7491 5.49827 15.7803 5.54609C15.943 5.79559 16.2083 5.95961 16.5042 5.9935C16.561 6 16.6224 6 16.7454 6H17.8C18.9201 6 19.4802 6 19.908 6.21799C20.2843 6.40973 20.5903 6.71569 20.782 7.09202C21 7.51984 21 8.0799 21 9.2V16.8C21 17.9201 21 18.4802 20.782 18.908C20.5903 19.2843 20.2843 19.5903 19.908 19.782C19.4802 20 18.9201 20 17.8 20H6.2C5.0799 20 4.51984 20 4.09202 19.782C3.71569 19.5903 3.40973 19.2843 3.21799 18.908C3 18.4802 3 17.9201 3 16.8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const handleProfileImageChange = (imageUrl) => {
    setProfileImage(imageUrl);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentTheme.primary} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translate('profile.myProfile')}</Text>
        <View style={styles.headerRight} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={currentTheme.primary} />
            </View>
          ) : (
            <>
              {/* Profile Image */}
              <View style={styles.profileImageSection}>
                <ProfileImageManager
                  userId={user?.uid}
                  imageUrl={profileImage}
                  size={120}
                  name={name}
                  onImageChange={handleProfileImageChange}
                />
                <Text style={[styles.profileRole, { color: currentTheme.textSecondary }]}>
                  {translate('roles.admin')}
                </Text>
              </View>
              
              {/* Form */}
              <View style={[styles.formCard, { backgroundColor: currentTheme.card }]}>
                <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{translate('profile.personalInfo')}</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: currentTheme.textSecondary }]}>{translate('admin.fullName')}</Text>
                  <TextInput
                    style={[styles.input, { 
                      color: currentTheme.text,
                      backgroundColor: currentTheme.inputBackground,
                      borderColor: currentTheme.border
                    }]}
                    value={name}
                    onChangeText={setName}
                    placeholder={translate('admin.enterFullName')}
                    placeholderTextColor={currentTheme.textSecondary}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: currentTheme.textSecondary }]}>{translate('auth.email')}</Text>
                  <TextInput
                    style={[styles.input, { 
                      color: currentTheme.textSecondary,
                      backgroundColor: currentTheme.inputBackground,
                      borderColor: currentTheme.border
                    }]}
                    value={email}
                    editable={false}
                    placeholderTextColor={currentTheme.textSecondary}
                  />
                  <Text style={[styles.helperText, { color: currentTheme.textSecondary }]}>
                    {translate('admin.emailCannotBeChanged')}
                  </Text>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: currentTheme.textSecondary }]}>{translate('admin.phoneNumber')}</Text>
                  <TextInput
                    style={[styles.input, { 
                      color: currentTheme.text,
                      backgroundColor: currentTheme.inputBackground,
                      borderColor: currentTheme.border
                    }]}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder={translate('admin.enterPhoneNumber')}
                    placeholderTextColor={currentTheme.textSecondary}
                    keyboardType="phone-pad"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: currentTheme.textSecondary }]}>{translate('admin.bio')}</Text>
                  <TextInput
                    style={[styles.textArea, { 
                      color: currentTheme.text,
                      backgroundColor: currentTheme.inputBackground,
                      borderColor: currentTheme.border
                    }]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder={translate('admin.aboutYourself')}
                    placeholderTextColor={currentTheme.textSecondary}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
                
                <TouchableOpacity
                  style={[styles.saveButton, { 
                    backgroundColor: currentTheme.primary,
                    opacity: saving ? 0.7 : 1
                  }]}
                  onPress={saveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>{translate('admin.saveChanges')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'left',
  },
  headerRight: {
    flex: 1,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  profileImageSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePlaceholderText: {
    fontSize: 48,
    color: 'white',
    fontWeight: 'bold',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  cameraIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  profileRole: {
    fontSize: 16,
    fontWeight: '500',
  },
  formCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 120,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 