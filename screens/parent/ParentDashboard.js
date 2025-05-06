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
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Parent Dashboard</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={[styles.profileSection, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
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
              onPress={pickImage}
            >
              <Ionicons name="camera" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: currentTheme.text }]}>{getDisplayName()}</Text>
            <Text style={[styles.profileEmail, { color: currentTheme.textSecondary }]}>{user?.email}</Text>
            <View style={styles.profileStat}>
              <Ionicons name="people" size={16} color={currentTheme.primary} />
              <Text style={[styles.profileStatText, { color: currentTheme.text }]}>
                {children.length} {children.length === 1 ? 'Child' : 'Children'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Children</Text>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: currentTheme.primary }]}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          {children.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="person-add-outline" size={48} color={currentTheme.primary} />
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
                      <Ionicons name="key-outline" size={20} color={currentTheme.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                      style={[styles.childActionButton, { borderColor: currentTheme.border }]}
                      onPress={() => handleViewChildProgress(child)}
                  >
                      <Ionicons name="bar-chart-outline" size={20} color={currentTheme.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                      style={[styles.childActionButton, { borderColor: currentTheme.border }]}
                    onPress={() => handleRemoveChild(child.id)}
                  >
                      <Ionicons name="trash-outline" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
              ))}
            </View>
          )}
        </View>
        
        <View style={[styles.section, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Quick Access</Text>
          <View style={styles.quickAccessContainer}>
            <TouchableOpacity 
              style={[styles.quickAccessButton, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}
              onPress={() => navigation.navigate('ProgressReport')}
            >
              <Ionicons name="stats-chart" size={28} color={currentTheme.primary} />
              <Text style={[styles.quickAccessText, { color: currentTheme.text }]}>Progress Report</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAccessButton, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings" size={28} color={currentTheme.primary} />
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
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
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
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickAccessButton: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  quickAccessText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
