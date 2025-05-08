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
import { Svg, Path, Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../services/firebase';

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [editingField, setEditingField] = useState(null);

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
        const displayName = userData.displayName || userData.name || '';
        const userEmail = userData.email || user.email || '';
        const userPhone = userData.phone || '';
        const userBio = userData.bio || '';
        const userSpecialization = userData.specialization || '';
        
        setName(displayName);
        setEmail(userEmail);
        setPhone(userPhone);
        setBio(userBio);
        setSpecialization(userSpecialization);
        
        // Store original data for possible cancel action
        setOriginalData({
          name: displayName,
          phone: userPhone,
          bio: userBio,
          specialization: userSpecialization
        });
        
        if (userData.profileImage) {
          setProfileImage(userData.profileImage);
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      
      if (!result.canceled && result.assets && result.assets[0].uri) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadProfileImage = async (uri) => {
    if (!user?.uid) return;
    
    setSaving(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const storage = getStorage();
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user document with image URL
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        profileImage: downloadURL
      });
      
      setProfileImage(downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async () => {
    if (!user?.uid) return;
    
    // Validate required fields
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: name,
        name: name,
        phone: phone,
        bio: bio,
        specialization: specialization,
        updatedAt: new Date().toISOString()
      });
      
      // Update original data after successful save
      setOriginalData({
        name: name,
        phone: phone,
        bio: bio,
        specialization: specialization
      });
      
      setIsEditMode(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // User is canceling - restore original values
      setName(originalData.name);
      setPhone(originalData.phone);
      setBio(originalData.bio);
      setSpecialization(originalData.specialization);
    }
    setIsEditMode(!isEditMode);
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

  // Edit Icon Component
  const EditIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke={currentTheme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke={currentTheme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  // Cancel Icon Component
  const CancelIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18" stroke={currentTheme.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6 6L18 18" stroke={currentTheme.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  // Teacher Icon Component
  const TeacherIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M22 10V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V10" stroke={currentTheme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 2L2 10H22L12 2Z" stroke={currentTheme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 15H12.01" stroke={currentTheme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  // Small Edit Icon
  const SmallEditIcon = () => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke={currentTheme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke={currentTheme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const renderReadOnlyField = (label, value, placeholder, fieldName) => {
    return (
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: currentTheme.textSecondary }]}>{label}</Text>
        <View style={styles.readOnlyContainer}>
          <View style={[styles.readOnlyField, { 
            backgroundColor: currentTheme.inputBackground || 'rgba(0,0,0,0.05)',
            borderColor: currentTheme.border,
            flex: 1
          }]}>
            <Text style={[styles.readOnlyText, { 
              color: value ? currentTheme.text : currentTheme.textSecondary 
            }]}>
              {value || placeholder}
            </Text>
          </View>
          {fieldName !== 'email' && (
            <TouchableOpacity 
              style={styles.fieldEditButton}
              onPress={() => handleFieldEdit(fieldName)}
            >
              <SmallEditIcon />
            </TouchableOpacity>
          )}
        </View>
        {fieldName === 'email' && (
          <Text style={[styles.helperText, { color: currentTheme.textSecondary }]}>
            Email cannot be changed
          </Text>
        )}
      </View>
    );
  };

  // Handle edit button click for a specific field
  const handleFieldEdit = (fieldName) => {
    setEditingField(fieldName);
  };

  // Handle saving a single field
  const saveField = async (fieldName) => {
    if (!user?.uid || !fieldName) return;
    
    // Validate the field
    if (fieldName === 'name' && !name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    
    setSaving(true);
    try {
      const fieldData = {};
      switch (fieldName) {
        case 'name':
          fieldData.displayName = name;
          fieldData.name = name;
          break;
        case 'specialization':
          fieldData.specialization = specialization;
          break;
        case 'phone':
          fieldData.phone = phone;
          break;
        case 'bio':
          fieldData.bio = bio;
          break;
        default:
          break;
      }
      
      if (Object.keys(fieldData).length > 0) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          ...fieldData,
          updatedAt: new Date().toISOString()
        });
        
        // Update original data for this field
        setOriginalData(prev => ({
          ...prev,
          [fieldName]: fieldName === 'name' ? name : 
                       fieldName === 'specialization' ? specialization :
                       fieldName === 'phone' ? phone : 
                       fieldName === 'bio' ? bio : prev[fieldName]
        }));
        
        setEditingField(null);
        Alert.alert('Success', `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} updated successfully`);
      }
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error);
      Alert.alert('Error', `Failed to update ${fieldName}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle canceling edit of a field
  const cancelFieldEdit = (fieldName) => {
    // Restore original value
    switch (fieldName) {
      case 'name':
        setName(originalData.name);
        break;
      case 'specialization':
        setSpecialization(originalData.specialization);
        break;
      case 'phone':
        setPhone(originalData.phone);
        break;
      case 'bio':
        setBio(originalData.bio);
        break;
      default:
        break;
    }
    setEditingField(null);
  };

  // Render a single editable field
  const renderEditableField = (label, value, onChangeText, placeholder, fieldName, keyboardType = 'default', multiline = false) => {
    return (
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: currentTheme.textSecondary }]}>{label}</Text>
        <View style={styles.editableFieldContainer}>
          <TextInput
            style={[
              multiline ? styles.textArea : styles.input, 
              { 
                color: currentTheme.text,
                backgroundColor: currentTheme.inputBackground || 'rgba(0,0,0,0.05)',
                borderColor: currentTheme.border,
                flex: 1
              }
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={currentTheme.textSecondary}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            textAlignVertical={multiline ? "top" : "center"}
          />
          <View style={styles.fieldActionButtons}>
            <TouchableOpacity 
              style={[styles.fieldActionButton, styles.fieldSaveButton]}
              onPress={() => saveField(fieldName)}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.fieldActionButtonText}>Save</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.fieldActionButton, styles.fieldCancelButton]}
              onPress={() => cancelFieldEdit(fieldName)}
              disabled={saving}
            >
              <Text style={styles.fieldActionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
        {fieldName === 'email' && (
          <Text style={[styles.helperText, { color: currentTheme.textSecondary }]}>
            Email cannot be changed
          </Text>
        )}
      </View>
    );
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
        <Text style={styles.headerTitle}>Teacher Profile</Text>
        {!editingField && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={toggleEditMode}
          >
            {isEditMode ? <CancelIcon /> : <EditIcon />}
          </TouchableOpacity>
        )}
        {editingField && <View style={styles.headerRight} />}
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
                <View style={styles.profileImageContainer}>
                  {profileImage ? (
                    <Image 
                      source={{ uri: profileImage }} 
                      style={styles.profileImage} 
                    />
                  ) : (
                    <View style={[styles.profilePlaceholder, { backgroundColor: '#4CAF50' }]}>
                      <Text style={styles.profilePlaceholderText}>{name ? name.charAt(0).toUpperCase() : 'T'}</Text>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.cameraButton}
                    onPress={pickImage}
                  >
                    <View style={styles.cameraIconContainer}>
                      <CameraIcon />
                    </View>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.profileRole, { color: currentTheme.textSecondary }]}>
                  Teacher
                </Text>
              </View>
              
              {/* Form */}
              <View style={[styles.formCard, { backgroundColor: currentTheme.card }]}>
                <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Profile Information</Text>
                
                {isEditMode ? (
                  // Edit mode - show editable fields
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: currentTheme.textSecondary }]}>Full Name</Text>
                      <TextInput
                        style={[styles.input, { 
                          color: currentTheme.text,
                          backgroundColor: currentTheme.inputBackground || 'rgba(0,0,0,0.05)',
                          borderColor: currentTheme.border
                        }]}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your full name"
                        placeholderTextColor={currentTheme.textSecondary}
                      />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: currentTheme.textSecondary }]}>Email</Text>
                      <TextInput
                        style={[styles.input, { 
                          color: currentTheme.textSecondary,
                          backgroundColor: currentTheme.inputBackground || 'rgba(0,0,0,0.05)',
                          borderColor: currentTheme.border
                        }]}
                        value={email}
                        editable={false}
                        placeholderTextColor={currentTheme.textSecondary}
                      />
                      <Text style={[styles.helperText, { color: currentTheme.textSecondary }]}>
                        Email cannot be changed
                      </Text>
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: currentTheme.textSecondary }]}>Specialization</Text>
                      <TextInput
                        style={[styles.input, { 
                          color: currentTheme.text,
                          backgroundColor: currentTheme.inputBackground || 'rgba(0,0,0,0.05)',
                          borderColor: currentTheme.border
                        }]}
                        value={specialization}
                        onChangeText={setSpecialization}
                        placeholder="Subject you specialize in"
                        placeholderTextColor={currentTheme.textSecondary}
                      />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: currentTheme.textSecondary }]}>Phone Number</Text>
                      <TextInput
                        style={[styles.input, { 
                          color: currentTheme.text,
                          backgroundColor: currentTheme.inputBackground || 'rgba(0,0,0,0.05)',
                          borderColor: currentTheme.border
                        }]}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Enter your phone number"
                        placeholderTextColor={currentTheme.textSecondary}
                        keyboardType="phone-pad"
                      />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: currentTheme.textSecondary }]}>Bio</Text>
                      <TextInput
                        style={[styles.textArea, { 
                          color: currentTheme.text,
                          backgroundColor: currentTheme.inputBackground || 'rgba(0,0,0,0.05)',
                          borderColor: currentTheme.border
                        }]}
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Share your teaching philosophy and experience"
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
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  // View mode - show read-only fields with individual edit options
                  <>
                    {editingField === 'name' ? 
                      renderEditableField('Full Name', name, setName, 'Enter your full name', 'name') :
                      renderReadOnlyField('Full Name', name, 'Not specified', 'name')
                    }
                    
                    {editingField === 'email' ? 
                      renderEditableField('Email', email, setEmail, 'Enter your email', 'email') :
                      renderReadOnlyField('Email', email, 'Not specified', 'email')
                    }
                    
                    {editingField === 'specialization' ? 
                      renderEditableField('Specialization', specialization, setSpecialization, 'Subject you specialize in', 'specialization') :
                      renderReadOnlyField('Specialization', specialization, 'Not specified', 'specialization')
                    }
                    
                    {editingField === 'phone' ? 
                      renderEditableField('Phone Number', phone, setPhone, 'Enter your phone number', 'phone', 'phone-pad') :
                      renderReadOnlyField('Phone Number', phone, 'Not specified', 'phone')
                    }
                    
                    {editingField === 'bio' ? (
                      <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: currentTheme.textSecondary }]}>Bio</Text>
                        <TextInput
                          style={[styles.textArea, { 
                            color: currentTheme.text,
                            backgroundColor: currentTheme.inputBackground || 'rgba(0,0,0,0.05)',
                            borderColor: currentTheme.border
                          }]}
                          value={bio}
                          onChangeText={setBio}
                          placeholder="Share your teaching philosophy and experience"
                          placeholderTextColor={currentTheme.textSecondary}
                          multiline
                          numberOfLines={4}
                          textAlignVertical="top"
                        />
                        <View style={styles.fieldActionButtons}>
                          <TouchableOpacity 
                            style={[styles.fieldActionButton, styles.fieldSaveButton]}
                            onPress={() => saveField('bio')}
                            disabled={saving}
                          >
                            {saving ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <Text style={styles.fieldActionButtonText}>Save</Text>
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.fieldActionButton, styles.fieldCancelButton]}
                            onPress={() => cancelFieldEdit('bio')}
                            disabled={saving}
                          >
                            <Text style={styles.fieldActionButtonText}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: currentTheme.textSecondary }]}>Bio</Text>
                        <View style={styles.readOnlyContainer}>
                          <View style={[styles.readOnlyTextArea, { 
                            backgroundColor: currentTheme.inputBackground || 'rgba(0,0,0,0.05)',
                            borderColor: currentTheme.border,
                            flex: 1
                          }]}>
                            <Text style={[styles.readOnlyText, { 
                              color: bio ? currentTheme.text : currentTheme.textSecondary 
                            }]}>
                              {bio || "No bio information provided"}
                            </Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.fieldEditButton}
                            onPress={() => handleFieldEdit('bio')}
                          >
                            <SmallEditIcon />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </>
                )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerRight: {
    width: 40,
  },
  editButton: {
    padding: 8,
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
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
  readOnlyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readOnlyField: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  readOnlyTextArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 120,
  },
  readOnlyText: {
    fontSize: 16,
  },
  fieldEditButton: {
    marginLeft: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editableFieldContainer: {
    marginBottom: 10,
  },
  fieldActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  fieldActionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  fieldSaveButton: {
    backgroundColor: '#4CAF50',
  },
  fieldCancelButton: {
    backgroundColor: '#F44336',
  },
  fieldActionButtonText: {
    color: 'white',
    fontWeight: 'bold',
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