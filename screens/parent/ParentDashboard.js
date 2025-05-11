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
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, storage } from '../../services/firebase';
import { collection, addDoc, getDocs, doc, setDoc, deleteDoc, query, orderBy, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Svg, Path, Circle, Rect } from 'react-native-svg';

export default function ParentDashboard() {
  const navigation = useNavigation();
  const { currentTheme } = useTheme();
  const { translate } = useLanguage();
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childLevel, setChildLevel] = useState('Beginner');
  const [childPin, setChildPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [childProgress, setChildProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [selectedChildForPin, setSelectedChildForPin] = useState(null);
  const [pin, setPin] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Function to capitalize first letter of each word
  const capitalizeWords = (text) => {
    if (!text) return '';
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Get display name with proper capitalization
  const getDisplayName = () => {
    if (user?.displayName) {
      return capitalizeWords(user.displayName);
    } else if (user?.email) {
      const name = user.email.split('@')[0];
      return capitalizeWords(name);
    }
    return 'Parent';
  };
  
  useEffect(() => {
    loadChildren();
    loadQuizResults();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        if (data.profileImage) {
          setProfileImage(data.profileImage);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const pickImage = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to upload a profile picture");
      return;
    }
    
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "You need to grant permission to access your photos");
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadingImage(true);
        const imageUri = result.assets[0].uri;
        
        // Upload to Firebase Storage
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const filename = `profile_${user.uid}_${Date.now()}`;
        const storageRef = ref(storage, `profiles/${user.uid}/${filename}`);
        
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        
        // Update user document in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          profileImage: downloadURL,
          updatedAt: new Date().toISOString()
        });
        
        setProfileImage(downloadURL);
        setUploadingImage(false);
        Alert.alert("Success", "Profile picture uploaded successfully");
      }
    } catch (error) {
      console.error('Error picking or uploading image:', error);
      setUploadingImage(false);
      Alert.alert("Error", "Failed to upload profile picture");
    }
  };

  const loadChildren = async () => {
    try {
      setLoading(true);
      
      if (user) {
        // Load children from Firestore
        const childrenCollectionRef = collection(db, `users/${user.uid}/children`);
        const querySnapshot = await getDocs(query(childrenCollectionRef, orderBy('name')));
        
        if (!querySnapshot.empty) {
          const childrenData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            parentId: user.uid // Ensure parent ID is set
          }));
          setChildren(childrenData);
          
          // Also save to AsyncStorage for offline access
          await AsyncStorage.setItem('children', JSON.stringify(childrenData));
        } else {
          // If no children in Firestore, check AsyncStorage for legacy data
          const savedChildren = await AsyncStorage.getItem('children');
          if (savedChildren) {
            const parsedChildren = JSON.parse(savedChildren);
            
            // Filter to only include this parent's children or unassigned children
            const filteredChildren = parsedChildren.filter(child => 
              !child.parentId || child.parentId === user.uid
            );
            
            if (filteredChildren.length > 0) {
              setChildren(filteredChildren);
              
              // Migrate local children to Firestore
              for (const child of filteredChildren) {
                // Add parent ID if missing
                const childData = { 
                  ...child,
                  parentId: user.uid 
                };
                delete childData.id; // Remove ID as Firestore will generate one
                await addDoc(collection(db, `users/${user.uid}/children`), childData);
              }
            } else {
              setChildren([]);
            }
          } else {
            setChildren([]);
          }
        }
      } else {
        // Fallback to AsyncStorage if user is not authenticated
        const savedChildren = await AsyncStorage.getItem('children');
        if (savedChildren) {
          const parsedChildren = JSON.parse(savedChildren);
          // For non-authenticated users, show only children without a parent ID
          const filteredChildren = parsedChildren.filter(child => !child.parentId);
          setChildren(filteredChildren);
        } else {
          setChildren([]);
        }
      }
    } catch (error) {
      console.error('Error loading children:', error);
      Alert.alert('Error', 'Failed to load children data');
      
      // Fallback to AsyncStorage if Firestore fails
      try {
        const savedChildren = await AsyncStorage.getItem('children');
        if (savedChildren) {
          setChildren(JSON.parse(savedChildren));
        }
      } catch (e) {
        console.error('Error with AsyncStorage fallback:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadQuizResults = async () => {
    try {
      const resultsJson = await AsyncStorage.getItem('quizResults');
      if (resultsJson) {
        const results = JSON.parse(resultsJson);
        
        // Group results by childId
        const progressByChild = {};
        results.forEach(result => {
          const childId = result.childId || '1'; // Default to first child if no childId
          if (!progressByChild[childId]) {
            progressByChild[childId] = [];
          }
          progressByChild[childId].push(result);
        });
        
        setChildProgress(progressByChild);
      }
    } catch (error) {
      console.error('Error loading quiz results:', error);
    }
  };
  
  const handleAddChild = async () => {
    if (!childName.trim()) {
      Alert.alert('Error', 'Please enter child name');
      return;
    }
    
    const age = parseInt(childAge, 10);
    if (isNaN(age) || age < 3 || age > 12) {
      Alert.alert('Error', 'Age must be between 3 and 12');
      return;
    }
    
    if (childPin.length !== 4 || !/^\d+$/.test(childPin)) {
      Alert.alert('Invalid PIN', 'PIN must be 4 digits');
      return;
    }

    if (childPin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'PINs do not match. Please try again.');
      return;
    }
    
    try {
      const newChild = {
        name: capitalizeWords(childName.trim()),
        age,
        level: childLevel || (age < 7 ? 'Beginner' : age < 10 ? 'Intermediate' : 'Advanced'),
        pin: childPin,
        createdAt: new Date().toISOString(),
        parentId: user ? user.uid : null // Associate child with parent
      };
      
      let childId;
      
      if (user) {
        // Save to Firestore if user is authenticated
        const childrenCollectionRef = collection(db, `users/${user.uid}/children`);
        const docRef = await addDoc(childrenCollectionRef, newChild);
        childId = docRef.id;
      } else {
        // Use timestamp as ID for AsyncStorage
        childId = Date.now().toString();
      }
      
      const childWithId = { ...newChild, id: childId };
      const updatedChildren = [...children, childWithId];
      
      setChildren(updatedChildren);
      
      // Also save to AsyncStorage for offline access
      await AsyncStorage.setItem('children', JSON.stringify(updatedChildren));
      
      // Reset form
      setChildName('');
      setChildAge('');
      setChildLevel('Beginner');
      setChildPin('');
      setConfirmPin('');
      setModalVisible(false);
      
      Alert.alert('Success', `Child ${childName} has been added`);
    } catch (error) {
      console.error('Error adding child:', error);
      Alert.alert('Error', 'Failed to add child. Please try again.');
    }
  };
  
  const handleViewChildProgress = (child) => {
    navigation.navigate('ChildProgress', { childId: child.id, childName: child.name });
  };
  
  const handleRemoveChild = async (childId) => {
    Alert.alert(
      'Confirm Removal',
      'Are you sure you want to remove this child?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedChildren = children.filter(child => child.id !== childId);
              setChildren(updatedChildren);
              
              // Update AsyncStorage
              await AsyncStorage.setItem('children', JSON.stringify(updatedChildren));
              
              // Remove from Firestore if user is authenticated
              if (user) {
                await deleteDoc(doc(db, `users/${user.uid}/children`, childId));
              }
            } catch (error) {
              console.error('Error removing child:', error);
              Alert.alert('Error', 'Failed to remove child');
            }
          },
        },
      ]
    );
  };

  // Get recent progress for a child
  const getChildRecentProgress = (childId) => {
    const childResults = childProgress[childId] || [];
    return childResults.length > 0 
      ? Math.round((childResults[0].score / childResults[0].totalQuestions) * 100) 
      : 0;
  };

  // Get total quizzes completed for a child
  const getQuizzesCompleted = (childId) => {
    return (childProgress[childId] || []).length;
  };

  // Handle setting PIN for a child
  const handleSetPin = (child) => {
    setSelectedChildForPin(child);
    setPin('');
    setConfirmPin('');
    setPinModalVisible(true);
  };

  // Save PIN for a child
  const savePin = async () => {
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      Alert.alert('Invalid PIN', 'PIN must be 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'PINs do not match. Please try again.');
      return;
    }

    try {
      // Find and update the child
      const updatedChildren = children.map(child => {
        if (child.id === selectedChildForPin.id) {
          return { ...child, pin };
        }
        return child;
      });

      setChildren(updatedChildren);
      
      // Update in AsyncStorage
      await AsyncStorage.setItem('children', JSON.stringify(updatedChildren));
      
      // Update in Firestore if user is authenticated
      if (user) {
        const childDocRef = doc(db, `users/${user.uid}/children`, selectedChildForPin.id);
        await setDoc(childDocRef, { pin }, { merge: true });
      }
      
      setPinModalVisible(false);
      Alert.alert('Success', `PIN set for ${selectedChildForPin.name}`);
    } catch (error) {
      console.error('Error saving PIN:', error);
      Alert.alert('Error', 'Failed to save PIN');
    }
  };

  // Add a function to get the translated level for display
  const getDisplayLevel = (level) => {
    switch(level) {
      case 'Beginner': return translate('teacher.levels.beginner') || 'Beginner';
      case 'Intermediate': return translate('teacher.levels.intermediate') || 'Intermediate';
      case 'Advanced': return translate('teacher.levels.advanced') || 'Advanced';
      default: return level;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
      <TouchableOpacity
        style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path 
              d="M19 12H5M5 12L12 19M5 12L12 5" 
              stroke="#FFF" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translate('parent.dashboard')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <TouchableOpacity 
          style={[styles.profileSection, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.profileImageContainer}>
            {uploadingImage ? (
              <View style={[styles.profileImage, { backgroundColor: currentTheme.border }]}>
                <ActivityIndicator size="large" color={currentTheme.primary} />
              </View>
            ) : profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, { backgroundColor: currentTheme.primary }]}>
                <Text style={styles.profileImageText}>
                  {(user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'P').toUpperCase()}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={[styles.uploadButton, { backgroundColor: currentTheme.primary }]}
              onPress={(e) => {
                e.stopPropagation();
                pickImage();
              }}
            >
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                  stroke="#FFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M3 16.8V9.2C3 8.0799 3 7.51984 3.21799 7.09202C3.40973 6.71569 3.71569 6.40973 4.09202 6.21799C4.51984 6 5.0799 6 6.2 6H7.25464C7.37758 6 7.43905 6 7.49576 5.9935C7.79166 5.95961 8.05705 5.82688 8.2432 5.62353C8.29848 5.56215 8.34911 5.49119 8.45038 5.34926L9.45038 3.94926C9.55164 3.80733 9.60228 3.73637 9.65756 3.67499C9.84371 3.47164 10.1091 3.33891 10.405 3.30502C10.4617 3.29852 10.5232 3.29852 10.6461 3.29852H13.3539C13.4768 3.29852 13.5383 3.29852 13.595 3.30502C13.8909 3.33891 14.1563 3.47164 14.3424 3.67499C14.3977 3.73637 14.4484 3.80733 14.5496 3.94926L15.5496 5.34926C15.6509 5.49119 15.7015 5.56215 15.7568 5.62353C15.943 5.82688 16.2083 5.95961 16.5042 5.9935C16.561 6 16.6224 6 16.7454 6H17.8C18.9201 6 19.4802 6 19.908 6.21799C20.2843 6.40973 20.5903 6.71569 20.782 7.09202C21 7.51984 21 8.0799 21 9.2V16.8C21 17.9201 21 18.4802 20.782 18.908C20.5903 19.2843 20.2843 19.5903 19.908 19.782C19.4802 20 18.9201 20 17.8 20H6.2C5.0799 20 4.51984 20 4.09202 19.782C3.71569 19.5903 3.40973 19.2843 3.21799 18.908C3 18.4802 3 17.9201 3 16.8Z"
                  stroke="#FFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: currentTheme.text }]}>{getDisplayName()}</Text>
            <Text style={[styles.profileEmail, { color: currentTheme.textSecondary }]}>{user?.email}</Text>
            <View style={styles.profileStat}>
              <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
                  stroke={currentTheme.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M3 21V19C3 16.7909 4.79086 15 7 15H11C13.2091 15 15 16.7909 15 19V21"
                  stroke={currentTheme.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
                  stroke={currentTheme.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M21 21V19C20.9949 18.1172 20.6979 17.2608 20.1553 16.5644C19.6126 15.868 18.8548 15.3707 18 15.15"
                  stroke={currentTheme.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={[styles.profileStatText, { color: currentTheme.text }]}>
                {children.length} {children.length === 1 ? translate('auth.children').slice(0, -1) : translate('auth.children')}
              </Text>
            </View>
            <View style={[styles.editProfileButton, { borderColor: currentTheme.primary }]}>
              <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 10L14 6M2.5 21.5L5.88437 21.124C6.29786 21.0781 6.5046 21.0551 6.69785 20.9925C6.87149 20.9373 7.03509 20.8577 7.18333 20.7562C7.35061 20.6421 7.49232 20.4945 7.77573 20.1992L21 7C22.1046 5.89543 22.1046 4.10457 21 3C19.8954 1.89543 18.1046 1.89543 17 3L3.8008 16.2243C3.50546 16.5077 3.35779 16.6494 3.24383 16.8167C3.14234 16.9649 3.06269 17.1285 3.00748 17.3022C2.94496 17.4954 2.92192 17.7021 2.87584 18.1156L2.5 21.5Z"
                  stroke={currentTheme.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={[styles.editProfileText, { color: currentTheme.primary }]}>{translate('profile.editProfile')}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={[styles.section, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{translate('auth.children')}</Text>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: currentTheme.primary }]}
              onPress={() => setModalVisible(true)}
            >
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path 
                  d="M12 5V19M5 12H19" 
                  stroke="#FFF" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>
          
          {children.length === 0 ? (
            <View style={styles.emptyState}>
              <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                  stroke={currentTheme.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
                  stroke={currentTheme.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M16 8H20M18 6V10"
                  stroke={currentTheme.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={[styles.emptyStateText, { color: currentTheme.text }]}>
                {translate('parent.noChildrenYet')}
              </Text>
              <Text style={[styles.emptyStateSubText, { color: currentTheme.text }]}>
                {translate('parent.addChildToTrack')}
              </Text>
            </View>
          ) : (
            <View style={styles.childrenList}>
              {children.map((child) => (
              <View 
                key={child.id} 
                style={[styles.childCard, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}
              >
                <View style={styles.childInfo}>
                    <View style={[styles.childAvatar, { backgroundColor: currentTheme.primary }]}>
                      <Text style={styles.childAvatarText}>{child.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.childDetails}>
                    <Text style={[styles.childName, { color: currentTheme.text }]}>{child.name}</Text>
                      <Text style={[styles.childAge, { color: currentTheme.textSecondary }]}>
                      {translate('auth.age')}: {child.age} • {translate('auth.grade')}: {getDisplayLevel(child.level)}
                    </Text>
                      
                      {childProgress[child.id] && (
                        <View style={styles.childProgressIndicator}>
                          <Text style={[styles.childProgressText, { color: currentTheme.textSecondary }]}>
                            {getQuizzesCompleted(child.id)} {translate('auth.quizzesCompleted')}
                      </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                <View style={styles.childActions}>
                  <TouchableOpacity 
                      style={[styles.childActionButton, { borderColor: currentTheme.border }]}
                      onPress={() => handleSetPin(child)}
                  >
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <Path 
                        d="M12 10V14M19 15V10C19 6.13401 15.866 3 12 3C8.13401 3 5 6.13401 5 10V15C5 16.6569 6.34315 18 8 18H16C17.6569 18 19 16.6569 19 15Z"
                        stroke={currentTheme.primary}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <Path 
                        d="M12 18V21"
                        stroke={currentTheme.primary}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </Svg>
                  </TouchableOpacity>
                  <TouchableOpacity 
                      style={[styles.childActionButton, { borderColor: currentTheme.border }]}
                      onPress={() => handleViewChildProgress(child)}
                  >
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <Path 
                        d="M7 18V9M12 18V5M17 18V13"
                        stroke={currentTheme.primary}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </Svg>
                  </TouchableOpacity>
                  <TouchableOpacity 
                      style={[styles.childActionButton, { borderColor: currentTheme.border }]}
                    onPress={() => handleRemoveChild(child.id)}
                  >
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <Path 
                        d="M4 6H20M10 10V16M14 10V16M5 6L6 19C6 19.5304 6.21071 20.0391 6.58579 20.4142C6.96086 20.7893 7.46957 21 8 21H16C16.5304 21 17.0391 20.7893 17.4142 20.4142C17.7893 20.0391 18 19.5304 18 19L19 6M15 6V5C15 4.46957 14.7893 3.96086 14.4142 3.58579C14.0391 3.21071 13.5304 3 13 3H11C10.4696 3 9.96086 3.21071 9.58579 3.58579C9.21071 3.96086 9 4.46957 9 5V6"
                        stroke="#F44336"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </TouchableOpacity>
                </View>
              </View>
              ))}
            </View>
          )}
        </View>
        
        <View style={[styles.section, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{translate('parent.quickAccess')}</Text>
          <View style={styles.quickAccessRow}>
            <TouchableOpacity 
              style={[styles.quickAccessButton, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}
              onPress={() => navigation.navigate('Profile')}
            >
              <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                  stroke={currentTheme.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
                  stroke={currentTheme.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={[styles.quickAccessText, { color: currentTheme.text }]}>{translate('profile.myProfile')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAccessButton, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}
              onPress={() => navigation.navigate('ProgressReport')}
            >
              <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M3 8L6.39 10.09C6.49 10.15 6.6 10.13 6.68 10.05L11.7 5.1"
                  stroke={currentTheme.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M12.2 5.1L17.3 10.05C17.4 10.14 17.55 10.14 17.65 10.05L21.8 6"
                  stroke={currentTheme.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M20 12V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V12"
                  stroke={currentTheme.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={[styles.quickAccessText, { color: currentTheme.text }]}>{translate('parent.progressReport')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Add Child Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.card }]}>
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>{translate('auth.addChild')}</Text>
            
                <TextInput
                  style={[styles.input, { borderColor: currentTheme.border, color: currentTheme.text }]}
              placeholder={translate('auth.childName')}
              placeholderTextColor={currentTheme.textSecondary}
                  value={childName}
                  onChangeText={setChildName}
                />
              
                <TextInput
                  style={[styles.input, { borderColor: currentTheme.border, color: currentTheme.text }]}
              placeholder={`${translate('auth.age')} (3-12)`}
              placeholderTextColor={currentTheme.textSecondary}
                  value={childAge}
                  onChangeText={setChildAge}
              keyboardType="number-pad"
                />
              
            <View style={styles.levelSelector}>
              <Text style={[styles.levelLabel, { color: currentTheme.text }]}>{translate('auth.grade')}:</Text>
              <View style={styles.levelOptions}>
                {[
                  { value: 'Beginner', label: translate('teacher.levels.beginner') || 'Beginner' },
                  { value: 'Intermediate', label: translate('teacher.levels.intermediate') || 'Intermediate' }, 
                  { value: 'Advanced', label: translate('teacher.levels.advanced') || 'Advanced' }
                ].map((level) => (
                    <TouchableOpacity
                      key={level.value}
                      style={[
                      styles.levelOption,
                      { 
                        backgroundColor: childLevel === level.value ? currentTheme.primary : currentTheme.background,
                        borderColor: currentTheme.border,
                      }
                      ]}
                      onPress={() => setChildLevel(level.value)}
                    >
                      <Text 
                        style={[
                        styles.levelOptionText, 
                        { color: childLevel === level.value ? '#FFF' : currentTheme.text }
                        ]}
                      >
                        {level.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
            <Text style={[styles.pinInstructions, { color: currentTheme.text }]}>
              {translate('parent.createPin')}
            </Text>
            
                <TextInput
                  style={[styles.input, { borderColor: currentTheme.border, color: currentTheme.text }]}
              placeholder={`${translate('auth.pin')} (4 ${translate('parent.digits')})`}
              placeholderTextColor={currentTheme.textSecondary}
              value={childPin}
              onChangeText={setChildPin}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              
                <TextInput
                  style={[styles.input, { borderColor: currentTheme.border, color: currentTheme.text }]}
                  placeholder={translate('parent.confirmPin')}
              placeholderTextColor={currentTheme.textSecondary}
              value={confirmPin}
              onChangeText={setConfirmPin}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
            
            <View style={styles.modalButtons}>
            <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton, { borderColor: currentTheme.border }]} 
                onPress={() => {
                  setModalVisible(false);
                  setChildName('');
                  setChildAge('');
                  setChildLevel('Beginner');
                  setChildPin('');
                  setConfirmPin('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: currentTheme.text }]}>{translate('common.cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalAddButton, { backgroundColor: currentTheme.primary }]} 
              onPress={handleAddChild}
            >
                <Text style={[styles.modalButtonText, { color: '#FFF' }]}>{translate('common.add')}</Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* PIN Modal */}
      <Modal
        visible={pinModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>{translate('parent.setPin')}</Text>
            
            <Text style={[styles.pinInstructions, { color: currentTheme.text }]}>
              {selectedChildForPin ? `${translate('parent.createNewPinFor')} ${selectedChildForPin.name}` : translate('parent.createNewPin')}
            </Text>
            
            <TextInput
              style={[styles.input, { borderColor: currentTheme.border, color: currentTheme.text }]}
              placeholder={`${translate('parent.newPin')} (4 ${translate('parent.digits')})`}
              placeholderTextColor={currentTheme.textSecondary}
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
            
            <TextInput
              style={[styles.input, { borderColor: currentTheme.border, color: currentTheme.text }]}
              placeholder={translate('parent.confirmPin')}
              placeholderTextColor={currentTheme.textSecondary}
              value={confirmPin}
              onChangeText={setConfirmPin}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
            
            <View style={styles.modalButtons}>
            <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: currentTheme.border }]} 
                onPress={() => {
                  setPinModalVisible(false);
                  setPin('');
                  setConfirmPin('');
                  setSelectedChildForPin(null);
                }}
              >
                <Text style={[styles.modalButtonText, { color: currentTheme.text }]}>{translate('common.cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalAddButton, { backgroundColor: currentTheme.primary }]} 
              onPress={savePin}
            >
                <Text style={[styles.modalButtonText, { color: '#FFF' }]}>{translate('common.save')}</Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  profileSectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFF',
  },
  uploadButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  profileStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  profileStatText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAddButton: {
    backgroundColor: '#4CAF50',
    minWidth: 100,
    flex: 1.2,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateSubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  childrenList: {
    marginTop: 8,
  },
  childCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  childAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  childAge: {
    fontSize: 14,
    marginTop: 2,
  },
  childProgressIndicator: {
    marginTop: 4,
  },
  childProgressText: {
    fontSize: 12,
  },
  childActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  childActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  levelSelector: {
    marginBottom: 16,
  },
  levelLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  levelOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  levelOptionText: {
    fontWeight: '500',
  },
  pinInstructions: {
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 0.9,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    borderWidth: 1,
    flex: 0.8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  quickAccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickAccessButton: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  quickAccessSpacer: {
    width: '24%',
  },
  quickAccessText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'center',
  },
  editProfileText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
