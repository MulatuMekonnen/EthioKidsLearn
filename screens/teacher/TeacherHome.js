import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Svg, Path, Circle, Rect } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import Cloudinary service and ProfileImageManager
import Cloudinary, { uploadToCloudinary } from '../../services/cloudinary';
import ProfileImageManager from '../../components/ProfileImageManager';

export default function TeacherHome({ navigation }) {
  const { user, logout } = useAuth();
  const { currentTheme, toggleTheme } = useTheme();
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState('Teacher');
  const [userEmail, setUserEmail] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    studentsCount: 0,
    lessonsCount: 0,
    completionRate: 0,
    isLoading: true
  });

  // Fetch user profile data including profile image
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.profileImage) {
              setProfileImage(userData.profileImage);
            }
            if (userData.displayName) {
              setUserName(userData.displayName);
            }
            setUserEmail(userData.email || user.email || '');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    
    fetchUserProfile();
    fetchDashboardData();
  }, [user]);

  // Fetch dashboard statistics data
  const fetchDashboardData = async () => {
    setDashboardData(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Fetch students count from Firebase - try multiple approaches to get the most accurate count
      let studentsCount = 0;
      
      // 1. First approach: Check direct children collection
      try {
        const childrenCollection = collection(db, 'children');
        const childrenSnapshot = await getDocs(childrenCollection);
        studentsCount = childrenSnapshot.size;
      } catch (error) {
        console.log('No direct children collection found, trying alternatives');
      }
      
      // 2. Second approach: Check users with role 'child'
      if (studentsCount === 0) {
        try {
          const childrenQuery = query(collection(db, 'users'), where('role', '==', 'child'));
          const childrenSnapshot = await getDocs(childrenQuery);
          studentsCount = childrenSnapshot.size;
        } catch (error) {
          console.log('Error checking child users, trying next approach');
        }
      }
      
      // 3. Third approach: Check lesson_progress collection for unique childIds
      if (studentsCount === 0) {
        try {
          const lessonProgressCollection = collection(db, 'lesson_progress');
          const lessonProgressSnapshot = await getDocs(lessonProgressCollection);
          
          // Extract unique childIds
          const uniqueChildIds = new Set();
          lessonProgressSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.childId) {
              uniqueChildIds.add(data.childId);
            }
          });
          
          studentsCount = uniqueChildIds.size;
        } catch (error) {
          console.log('Error checking lesson_progress, trying next approach');
        }
      }
      
      // 4. Fourth approach: Check quiz_results collection for unique childIds
      if (studentsCount === 0) {
        try {
          const quizResultsCollection = collection(db, 'quiz_results');
          const quizResultsSnapshot = await getDocs(quizResultsCollection);
          
          // Extract unique childIds
          const uniqueChildIds = new Set();
          quizResultsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.childId) {
              uniqueChildIds.add(data.childId);
            }
          });
          
          studentsCount = uniqueChildIds.size;
        } catch (error) {
          console.log('Error checking quiz_results');
        }
      }
      
      // Fallback to local storage if no students found yet
      if (studentsCount === 0) {
        const childrenJson = await AsyncStorage.getItem('children');
        if (childrenJson) {
          const childrenData = JSON.parse(childrenJson);
          studentsCount = childrenData.filter(child => child && child.name).length;
        }
      }
      
      // Fetch lessons count
      let lessonsCount = 0;
      let mathLessons = 0;
      let englishLessons = 0;
      let amharicLessons = 0;
      let oromoLessons = 0;
      
      // Try to get lessons count from various collections if they exist
      try {
        // Math lessons
        const mathCollection = collection(db, 'lessons_math');
        const mathSnapshot = await getDocs(mathCollection);
        mathLessons = mathSnapshot.size;
        
        // English lessons
        const englishCollection = collection(db, 'lessons_english');
        const englishSnapshot = await getDocs(englishCollection);
        englishLessons = englishSnapshot.size;
        
        // Amharic lessons
        const amharicCollection = collection(db, 'lessons_amharic');
        const amharicSnapshot = await getDocs(amharicCollection);
        amharicLessons = amharicSnapshot.size;
        
        // Oromo lessons
        const oromoCollection = collection(db, 'lessons_oromo');
        const oromoSnapshot = await getDocs(oromoCollection);
        oromoLessons = oromoSnapshot.size;
        
        // Sum all lessons
        lessonsCount = mathLessons + englishLessons + amharicLessons + oromoLessons;
      } catch (e) {
        console.log('Error fetching subject-specific lesson collections');
      }
      
      // If no lessons found, try generic lessons collection
      if (lessonsCount === 0) {
        try {
          const lessonsCollection = collection(db, 'lessons');
          const lessonsSnapshot = await getDocs(lessonsCollection);
          lessonsCount = lessonsSnapshot.size;
        } catch (e) {
          console.log('No lessons collection found');
        }
      }
      
      // Try lesson_content collection if still no lessons
      if (lessonsCount === 0) {
        try {
          const lessonContentCollection = collection(db, 'lesson_content');
          const lessonContentSnapshot = await getDocs(lessonContentCollection);
          lessonsCount = lessonContentSnapshot.size;
        } catch (e) {
          console.log('No lesson_content collection found, using default count');
          lessonsCount = 14; // Default if no lessons collection
        }
      }
      
      // Calculate completion rate
      let completionRate = 0;
      
      // First try to calculate from lesson_progress collection
      if (studentsCount > 0) {
        try {
          // Get all lesson progress data
          const lessonProgressCollection = collection(db, 'lesson_progress');
          const lessonProgressSnapshot = await getDocs(lessonProgressCollection);
          
          const studentProgress = {};
          
          // Group by student
          lessonProgressSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.childId && data.isCompleted) {
              if (!studentProgress[data.childId]) {
                studentProgress[data.childId] = { completed: 0, total: 0 };
              }
              studentProgress[data.childId].total++;
              if (data.isCompleted) {
                studentProgress[data.childId].completed++;
              }
            }
          });
          
          // Calculate average completion percentage across students
          if (Object.keys(studentProgress).length > 0) {
            let totalCompletionPercent = 0;
            let studentsWithProgress = 0;
            
            Object.values(studentProgress).forEach(progress => {
              if (progress.total > 0) {
                studentsWithProgress++;
                totalCompletionPercent += (progress.completed / progress.total) * 100;
              }
            });
            
            if (studentsWithProgress > 0) {
              completionRate = Math.round(totalCompletionPercent / studentsWithProgress);
            }
          }
        } catch (e) {
          console.log('Error calculating completion from lesson_progress');
        }
      }
      
      // If no completion rate calculated yet, try quiz results
      if (completionRate === 0) {
        try {
          const quizResultsJson = await AsyncStorage.getItem('quizResults');
          if (quizResultsJson) {
            const quizResults = JSON.parse(quizResultsJson);
            
            // Calculate completion rate based on unique students who took quizzes
            if (studentsCount > 0 && quizResults.length > 0) {
              const uniqueStudents = new Set(quizResults.map(result => result.childId)).size;
              // Calculate completion as a percentage of students who attempted at least one quiz
              completionRate = Math.round((uniqueStudents / studentsCount) * 100);
            } else {
              // Fallback to default value
              completionRate = 75;
            }
          } else {
            // No quiz results found, use default value
            completionRate = 75;
          }
        } catch (e) {
          console.error('Error fetching quiz results:', e);
          completionRate = 75; // Default fallback
        }
      }
      
      // Update dashboard data state with real or fallback values
      setDashboardData({
        studentsCount: studentsCount || 24, // Fallback to 24 if no data
        lessonsCount: lessonsCount || 14,   // Fallback to 14 if no data
        completionRate: completionRate || 75, // Fallback to 75% if no data
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use fallback values if fetch fails
      setDashboardData({
        studentsCount: 24,
        lessonsCount: 14,
        completionRate: 75,
        isLoading: false
      });
    }
  };

  // Get initials from name
  const getInitials = () => {
    if (!userName) return 'T';
    
    const names = userName.split(' ');
    const firstInitial = names[0].charAt(0).toUpperCase();
    
    return firstInitial;
  };

  // Generate a color for profile icon
  const generateProfileColor = () => {
    // Fixed green color for all profile icons
    return '#4CAF50'; // Green
  };

  // Pick image from device
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

  // Upload image to Cloudinary instead of Firebase Storage
  const uploadProfileImage = async (uri) => {
    if (!user?.uid) return;
    
    try {
      // Show loading indicator
      Alert.alert('Uploading', 'Uploading profile picture...');
      
      // Upload to Cloudinary
      const result = await uploadToCloudinary(uri);
      
      if (result.success) {
        // Update user document with Cloudinary image URL
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          profileImage: result.url,
          cloudinaryPublicId: result.publicId // Store public ID for future reference
        });
        
        setProfileImage(result.url);
        Alert.alert('Success', 'Profile picture updated successfully');
      } else {
        throw new Error('Failed to upload image to Cloudinary');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  // Go to profile settings
  const goToProfileSettings = () => {
    setShowProfileMenu(false);
    // Navigate to profile settings page
    navigation.navigate('Profile');
  };

  // Toggle theme
  const handleToggleTheme = () => {
    toggleTheme();
    setShowProfileMenu(false);
  };

  // SVG Icons
  const LogoutIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M16 17L21 12M21 12L16 7M21 12H9" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );

  // Custom edit icon
  const EditIcon = () => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  // Custom profile picture component
  const ProfilePicture = () => {
    const profileColor = generateProfileColor();
    
    return (
      <TouchableOpacity 
        style={styles.profilePicContainer} 
        onPress={() => setShowProfileMenu(!showProfileMenu)}
      >
        <ProfileImageManager 
          userId={user?.uid}
          imageUrl={profileImage}
          size={44}
          name={userName}
          editable={false}
        />
        
        {showProfileMenu && (
          <Modal
            transparent={true}
            visible={showProfileMenu}
            animationType="fade"
            onRequestClose={() => setShowProfileMenu(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowProfileMenu(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={[styles.profileMenu, { 
                    backgroundColor: currentTheme.card,
                    top: Platform.OS === 'ios' ? 100 : 80,
                    right: 20
                  }]}>
                    <View style={styles.profileMenuHeader}>
                      <View style={styles.profileImageContainer}>
                        <ProfileImageManager 
                          userId={user?.uid}
                          imageUrl={profileImage}
                          size={80}
                          name={userName}
                          onImageChange={(url) => setProfileImage(url)}
                        />
                      </View>
                      <Text style={[styles.profileMenuName, { color: currentTheme.text }]}>{userName}</Text>
                      <Text style={[styles.profileMenuEmail, { color: currentTheme.textSecondary }]}>{userEmail}</Text>
                    </View>
                    
                    <View style={[styles.profileMenuDivider, { backgroundColor: currentTheme.border }]} />
                    
                    <TouchableOpacity 
                      style={styles.profileMenuItem}
                      onPress={goToProfileSettings}
                    >
                      <View style={styles.profileMenuItemIcon}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <Circle cx="12" cy="8" r="4" stroke={currentTheme.text} strokeWidth="2" />
                          <Path d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" />
                        </Svg>
                      </View>
                      <Text style={[styles.profileMenuItemText, { color: currentTheme.text }]}>My Profile</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.profileMenuItem}
                      onPress={handleToggleTheme}
                    >
                      <View style={styles.profileMenuItemIcon}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <Circle cx="12" cy="12" r="4" stroke={currentTheme.text} strokeWidth="2" />
                          <Path d="M12 2V4" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" />
                          <Path d="M12 20V22" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" />
                          <Path d="M4 12L2 12" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" />
                          <Path d="M22 12L20 12" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" />
                          <Path d="M19.7782 4.22166L18.364 5.63587" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" />
                          <Path d="M5.63599 18.364L4.22177 19.7782" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" />
                          <Path d="M19.7782 19.7782L18.364 18.364" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" />
                          <Path d="M5.63599 5.63589L4.22177 4.22168" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" />
                        </Svg>
                      </View>
                      <Text style={[styles.profileMenuItemText, { color: currentTheme.text }]}>
                        {currentTheme.mode === 'dark' ? 'Light Theme' : 'Dark Theme'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.profileMenuItem}
                      onPress={logout}
                    >
                      <View style={[styles.profileMenuItemIcon, { marginLeft: -3 }]}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <Path d="M16 17L21 12M21 12L16 7M21 12H9" stroke={currentTheme.danger || "#F44336"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <Path d="M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9" stroke={currentTheme.danger || "#F44336"} strokeWidth="2" strokeLinecap="round" />
                        </Svg>
                      </View>
                      <Text style={[styles.profileMenuItemText, { color: currentTheme.danger || "#F44336" }]}>Logout</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </TouchableOpacity>
    );
  };

  const SchoolIcon = ({color}) => (
    <Svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <Path d="M22 10V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 2L2 10H22L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 15H12.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const PeopleIcon = () => (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const DocumentIcon = () => (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path d="M14 3V7H18" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H14L19 8V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21Z" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 9H10" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" />
      <Path d="M9 13H15" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" />
      <Path d="M9 17H15" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );

  const CheckmarkIcon = () => (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#34A853" strokeWidth="2" />
      <Path d="M8 12L11 15L16 9" stroke="#34A853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const ChevronIcon = () => (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path d="M9 18L15 12L9 6" stroke={currentTheme.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  // Menu Icons
  const getMenuIcon = (iconName, color) => {
    switch(iconName) {
      case 'analytics-outline':
        return (
          <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <Path d="M21 21H3.8C3.51997 21 3.37996 21 3.273 20.945C3.17892 20.8969 3.10307 20.8211 3.05496 20.727C3 20.62 3 20.48 3 20.2V3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M7 14.5V17.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M11.5 11.5V17.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M16 8.5V17.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );
      case 'document-text-outline':
        return (
          <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <Path d="M14 3V7H18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H14L19 8V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M9 9H10" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M9 13H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M9 17H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );
      case 'book-outline':
        return (
          <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <Path d="M4 19.5V4.5C4 3.4 4.9 2.5 6 2.5H19.5V19.5H6C4.9 19.5 4 18.6 4 17.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M8 7H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M8 11H13" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M8 15H12" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );
      case 'calendar-outline':
        return (
          <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M16 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M8 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );
      default:
        return null;
    }
  };
  
  const menuItems = [
    {
      title: 'Student Progress',
      description: 'View and track student performance',
      icon: 'analytics-outline',
      onPress: () => navigation.navigate('StudentProgress'),
      color: '#4285F4'
    },
    {
      title: 'Student Reports',
      description: 'Create and manage subject-specific reports for students',
      icon: 'document-text-outline',
      onPress: () => navigation.navigate('StudentReports'),
      color: '#DB4437'
    },
    {
      title: 'Create Content',
      description: 'Develop new educational resources',
      icon: 'book-outline',
      onPress: () => navigation.navigate('CreateContent'),
      color: '#34A853'
    },
    {
      title: 'Class Schedule',
      description: 'Manage your teaching timetable',
      icon: 'calendar-outline',
      onPress: () => {},
      color: '#FBBC05'
    }
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentTheme.primary} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Teacher Dashboard</Text>
          <ProfilePicture />
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Teacher Welcome Card */}
        <View style={[styles.welcomeCard, { backgroundColor: currentTheme.card }]}>
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeHeader}>
              <Text style={[styles.welcomeTitle, { color: currentTheme.text }]}>
                Welcome back, 
              </Text>
              <Text style={[styles.teacherName, { color: currentTheme.primary }]}>
                {userName}
              </Text>
            </View>
            <Text style={[styles.welcomeSubtitle, { color: currentTheme.textSecondary }]}>
              Ready to inspire minds today?
            </Text>
          </View>
          <View style={[styles.avatarContainer, { backgroundColor: currentTheme.primary + '20' }]}>
            <SchoolIcon color={currentTheme.primary} />
          </View>
        </View>
        
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: currentTheme.card }]}
            onPress={fetchDashboardData}
          >
            <PeopleIcon />
            {dashboardData.isLoading ? (
              <ActivityIndicator color="#4285F4" size="small" style={styles.statLoader} />
            ) : (
              <Text style={[styles.statValue, { color: currentTheme.text }]}>
                {dashboardData.studentsCount}
              </Text>
            )}
            <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>Students</Text>
          </TouchableOpacity>
          
          <View style={[styles.statCard, { backgroundColor: currentTheme.card }]}>
            <DocumentIcon />
            {dashboardData.isLoading ? (
              <ActivityIndicator color="#EA4335" size="small" style={styles.statLoader} />
            ) : (
              <Text style={[styles.statValue, { color: currentTheme.text }]}>
                {dashboardData.lessonsCount}
              </Text>
            )}
            <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>Lessons</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: currentTheme.card }]}>
            <CheckmarkIcon />
            {dashboardData.isLoading ? (
              <ActivityIndicator color="#34A853" size="small" style={styles.statLoader} />
            ) : (
              <Text style={[styles.statValue, { color: currentTheme.text }]}>
                {dashboardData.completionRate}%
              </Text>
            )}
            <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>Completion</Text>
          </View>
        </View>
        
        {/* Menu Items */}
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Teacher Tools</Text>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuCard, { backgroundColor: currentTheme.card }]}
              onPress={item.onPress}
            >
              <View style={[styles.iconBubble, { backgroundColor: item.color + '20' }]}>
                {getMenuIcon(item.icon, item.color)}
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color: currentTheme.text }]}>{item.title}</Text>
                <Text style={[styles.menuDescription, { color: currentTheme.textSecondary }]} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              <ChevronIcon />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  welcomeCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  teacherName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    width: '31%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  menuContainer: {
    paddingHorizontal: 16,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.07,
    shadowRadius: 1.84,
    elevation: 2,
  },
  iconBubble: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  profilePicContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profilePic: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInnerShadow: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Subtle inner highlight
  },
  profilePlaceholderText: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  profileMenu: {
    position: 'absolute',
    width: 250,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  profileMenuHeader: {
    alignItems: 'center',
    padding: 16,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileMenuImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  menuProfilePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuProfileInnerShadow: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Subtle inner highlight
  },
  menuProfilePlaceholderText: {
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  editProfileButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  editIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileMenuName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileMenuEmail: {
    fontSize: 14,
  },
  profileMenuDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 8,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  profileMenuItemIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileMenuItemText: {
    fontSize: 16,
  },
  statLoader: {
    marginVertical: 5,
    height: 22, // Match the height of statValue text
  },
});
