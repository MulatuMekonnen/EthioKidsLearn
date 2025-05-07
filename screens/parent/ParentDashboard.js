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
        <Text style={styles.headerTitle}>Parent Dashboard</Text>
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
                {children.length} {children.length === 1 ? 'Child' : 'Children'}
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
              <Text style={[styles.editProfileText, { color: currentTheme.primary }]}>Edit Profile</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={[styles.section, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Children</Text>
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
                No children added yet
              </Text>
              <Text style={[styles.emptyStateSubText, { color: currentTheme.text }]}>
                Add a child to start tracking their progress
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
                      Age: {child.age} • Level: {child.level}
                    </Text>
                      
                      {childProgress[child.id] && (
                        <View style={styles.childProgressIndicator}>
                          <Text style={[styles.childProgressText, { color: currentTheme.textSecondary }]}>
                            {getQuizzesCompleted(child.id)} quizzes completed
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
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Quick Access</Text>
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
              <Text style={[styles.quickAccessText, { color: currentTheme.text }]}>My Profile</Text>
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
              <Text style={[styles.quickAccessText, { color: currentTheme.text }]}>Progress Report</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.quickAccessRow, { justifyContent: 'center' }]}>
            <TouchableOpacity 
              style={[styles.quickAccessButton, { backgroundColor: currentTheme.background, borderColor: currentTheme.border, marginHorizontal: 0 }]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke={currentTheme.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M18.7273 14.7273C18.6063 15.0254 18.5702 15.3496 18.6226 15.6652C18.6751 15.9808 18.8142 16.2761 19.0273 16.5182L19.0818 16.5727C19.2509 16.7417 19.3853 16.9422 19.4765 17.1639C19.5677 17.3855 19.6142 17.6237 19.6142 17.8636C19.6142 18.1036 19.5677 18.3418 19.4765 18.5634C19.3853 18.785 19.2509 18.9856 19.0818 19.1545C18.9128 19.3236 18.7123 19.458 18.4906 19.5492C18.269 19.6404 18.0308 19.6869 17.7909 19.6869C17.5509 19.6869 17.3127 19.6404 17.0911 19.5492C16.8695 19.458 16.6689 19.3236 16.5 19.1545L16.4455 19.1C16.2033 18.8869 15.908 18.7478 15.5924 18.6953C15.2768 18.6429 14.9526 18.679 14.6545 18.8C14.363 18.9161 14.1092 19.1139 13.9274 19.3708C13.7456 19.6277 13.6435 19.9318 13.6364 20.2455V20.3636C13.6364 20.8485 13.4435 21.3138 13.0998 21.6575C12.756 22.0013 12.2908 22.1941 11.8059 22.1941C11.3209 22.1941 10.8557 22.0013 10.512 21.6575C10.1682 21.3138 9.97532 20.8485 9.97532 20.3636V20.2818C9.96114 19.9568 9.84751 19.6442 9.6502 19.3842C9.45288 19.1241 9.18083 18.9297 8.87727 18.8227C8.57916 18.7018 8.25497 18.6656 7.93936 18.7181C7.62376 18.7705 7.32846 18.9096 7.08636 19.1227L7.03182 19.1773C6.86287 19.3463 6.66233 19.4808 6.44067 19.572C6.21901 19.6632 5.98078 19.7097 5.74086 19.7097C5.50094 19.7097 5.26271 19.6632 5.04105 19.572C4.81939 19.4808 4.61885 19.3463 4.44991 19.1773C4.28088 19.0083 4.14648 18.8078 4.05526 18.5861C3.96405 18.3645 3.91756 18.1262 3.91756 17.8863C3.91756 17.6464 3.96405 17.4082 4.05526 17.1865C4.14648 16.9649 4.28088 16.7643 4.44991 16.5954L4.50445 16.5409C4.71759 16.2988 4.85668 16.0035 4.9091 15.6879C4.96152 15.3723 4.92542 15.0481 4.80445 14.75C4.68836 14.4585 4.49057 14.2047 4.23373 14.0229C3.97689 13.8411 3.67272 13.739 3.35909 13.7318H3.24091C2.75595 13.7318 2.29071 13.539 1.94695 13.1952C1.6032 12.8515 1.41037 12.3862 1.41037 11.9013C1.41037 11.4163 1.6032 10.9511 1.94695 10.6073C2.29071 10.2636 2.75595 10.0707 3.24091 10.0707H3.32273C3.64768 10.0565 3.96034 9.94291 4.22039 9.74559C4.48043 9.54828 4.67482 9.27623 4.78182 8.97273C4.90279 8.67461 4.93889 8.35042 4.88647 8.03482C4.83405 7.71921 4.69496 7.42391 4.48182 7.18182L4.42727 7.12727C4.25824 6.95833 4.12384 6.75779 4.03263 6.53613C3.94142 6.31447 3.89493 6.07624 3.89493 5.83632C3.89493 5.5964 3.94142 5.35817 4.03263 5.13651C4.12384 4.91485 4.25824 4.71431 4.42727 4.54536C4.59622 4.37634 4.79676 4.24193 5.01842 4.15072C5.24008 4.05951 5.47831 4.01302 5.71823 4.01302C5.95815 4.01302 6.19638 4.05951 6.41804 4.15072C6.6397 4.24193 6.84024 4.37634 7.00918 4.54536L7.06373 4.59991C7.30582 4.81305 7.60112 4.95213 7.91673 5.00455C8.23233 5.05698 8.55652 5.02087 8.85464 4.89991H8.86373C9.15522 4.78382 9.40903 4.58603 9.59086 4.32919C9.77268 4.07235 9.87476 3.76818 9.88191 3.45455V3.33636C9.88191 2.8514 10.0747 2.38616 10.4185 2.04241C10.7622 1.69865 11.2275 1.50582 11.7125 1.50582C12.1974 1.50582 12.6627 1.69865 13.0064 2.04241C13.3502 2.38616 13.543 2.8514 13.543 3.33636V3.41818C13.5502 3.73182 13.6523 4.03598 13.8341 4.29282C14.0159 4.54966 14.2697 4.74746 14.5612 4.86354C14.8593 4.98451 15.1835 5.02062 15.4991 4.96819C15.8147 4.91577 16.11 4.77669 16.3521 4.56354L16.4066 4.50899C16.5756 4.33997 16.7761 4.20556 16.9978 4.11435C17.2194 4.02314 17.4577 3.97665 17.6976 3.97665C17.9375 3.97665 18.1757 4.02314 18.3974 4.11435C18.619 4.20556 18.8196 4.33997 18.9885 4.50899C19.1575 4.67794 19.2919 4.87848 19.3831 5.10014C19.4744 5.3218 19.5208 5.56003 19.5208 5.79995C19.5208 6.03987 19.4744 6.2781 19.3831 6.49976C19.2919 6.72142 19.1575 6.92196 18.9885 7.09091L18.9339 7.14545C18.7208 7.38755 18.5817 7.68285 18.5293 7.99846C18.4769 8.31406 18.513 8.63825 18.6339 8.93636V8.94545C18.75 9.23695 18.9478 9.49076 19.2046 9.67259C19.4615 9.85441 19.7657 9.95649 20.0793 9.96364H20.1975C20.6824 9.96364 21.1477 10.1565 21.4914 10.5002C21.8352 10.844 22.028 11.3092 22.028 11.7941C22.028 12.2791 21.8352 12.7443 21.4914 13.0881C21.1477 13.4318 20.6824 13.6247 20.1975 13.6247H20.1157C19.802 13.6318 19.4979 13.7339 19.241 13.9157C18.9842 14.0975 18.7864 14.3513 18.6703 14.6427V14.6427"
                  stroke={currentTheme.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={[styles.quickAccessText, { color: currentTheme.text }]}>Settings</Text>
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
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>Add Child</Text>
            
                <TextInput
                  style={[styles.input, { borderColor: currentTheme.border, color: currentTheme.text }]}
              placeholder="Child's Name"
              placeholderTextColor={currentTheme.textSecondary}
                  value={childName}
                  onChangeText={setChildName}
                />
              
                <TextInput
                  style={[styles.input, { borderColor: currentTheme.border, color: currentTheme.text }]}
              placeholder="Age (3-12)"
              placeholderTextColor={currentTheme.textSecondary}
                  value={childAge}
                  onChangeText={setChildAge}
              keyboardType="number-pad"
                />
              
            <View style={styles.levelSelector}>
              <Text style={[styles.levelLabel, { color: currentTheme.text }]}>Level:</Text>
              <View style={styles.levelOptions}>
                {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                      styles.levelOption,
                      { 
                        backgroundColor: childLevel === level ? currentTheme.primary : currentTheme.background,
                        borderColor: currentTheme.border,
                      }
                      ]}
                      onPress={() => setChildLevel(level)}
                    >
                      <Text 
                        style={[
                        styles.levelOptionText, 
                        { color: childLevel === level ? '#FFF' : currentTheme.text }
                        ]}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
            <Text style={[styles.pinInstructions, { color: currentTheme.text }]}>
              Create a 4-digit PIN for the child to log in
            </Text>
            
                <TextInput
                  style={[styles.input, { borderColor: currentTheme.border, color: currentTheme.text }]}
              placeholder="4-digit PIN"
              placeholderTextColor={currentTheme.textSecondary}
              value={childPin}
              onChangeText={setChildPin}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              
                <TextInput
                  style={[styles.input, { borderColor: currentTheme.border, color: currentTheme.text }]}
                  placeholder="Confirm PIN"
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
                <Text style={[styles.modalButtonText, { color: currentTheme.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.addButton, { backgroundColor: currentTheme.primary }]} 
              onPress={handleAddChild}
            >
                <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Add</Text>
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
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>Set PIN</Text>
            
            <Text style={[styles.pinInstructions, { color: currentTheme.text }]}>
              {selectedChildForPin ? `Create a new PIN for ${selectedChildForPin.name}` : 'Create a new PIN'}
            </Text>
            
            <TextInput
              style={[styles.input, { borderColor: currentTheme.border, color: currentTheme.text }]}
              placeholder="New 4-digit PIN"
              placeholderTextColor={currentTheme.textSecondary}
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
            
            <TextInput
              style={[styles.input, { borderColor: currentTheme.border, color: currentTheme.text }]}
              placeholder="Confirm PIN"
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
                <Text style={[styles.modalButtonText, { color: currentTheme.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.addButton, { backgroundColor: currentTheme.primary }]} 
              onPress={savePin}
            >
                <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Save</Text>
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
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    borderWidth: 1,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
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
