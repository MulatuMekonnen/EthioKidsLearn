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
import { useLanguage } from '../../context/LanguageContext';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TeacherHome({ navigation }) {
  const { user, logout } = useAuth();
  const { currentTheme, toggleTheme } = useTheme();
  const { translate, currentLanguage, changeLanguage, languages } = useLanguage();
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState('Teacher');
  const [userEmail, setUserEmail] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    studentsCount: 0,
    lessonsCount: 0,
    completionRate: 0,
    isLoading: true
  });
  const [dataStatus, setDataStatus] = useState({
    hasData: false,
    message: ''
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
    setDataStatus({ hasData: false, message: 'Loading data...' });
    
    try {
      // Fetch students count from Firebase - try multiple approaches to get the most accurate count
      let studentsCount = 0;
      let lessonsCount = 0;
      let completionRate = 0;
      let totalLessonsCompleted = 0;
      let totalLessonsAvailable = 0;
      let dataSource = "Unknown";
      
      // First check if we have cached progress data from StudentProgress screen
      try {
        const cachedProgress = await AsyncStorage.getItem('student_progress_cache');
        const cachedStudents = await AsyncStorage.getItem('student_list_cache');
        
        if (cachedProgress && cachedStudents) {
          const progressData = JSON.parse(cachedProgress);
          const studentsList = JSON.parse(cachedStudents);
          dataSource = "Cache";
          
          // Count students with actual progress data
          studentsCount = studentsList.length;
          
          // Count lessons and completion data
          Object.values(progressData).forEach(student => {
            // Check each subject for lesson data
            ['math', 'english', 'amharic', 'oromo'].forEach(subject => {
              if (student[subject] && student[subject].lessons) {
                const lessonData = student[subject].lessons;
                totalLessonsAvailable += lessonData.total;
                totalLessonsCompleted += lessonData.completed;
              }
            });
          });
          
          lessonsCount = Math.max(
            ...Object.values(progressData).map(student => 
              student.all.lessons ? student.all.lessons.total : 0
            )
          );
          
          if (totalLessonsAvailable > 0) {
            completionRate = Math.round((totalLessonsCompleted / totalLessonsAvailable) * 100);
          }
        }
      } catch (cacheError) {
        console.log('Error reading from cache, falling back to Firebase:', cacheError);
      }
      
      // If no cached data, try Firebase directly
      if (studentsCount === 0) {
        dataSource = "Firebase";
        
        // 1. First approach: Check direct children collection
        try {
          const childrenCollection = collection(db, 'children');
          const childrenSnapshot = await getDocs(childrenCollection);
          studentsCount = childrenSnapshot.size;
          console.log('Found students in children collection:', studentsCount);
        } catch (error) {
          console.log('No direct children collection found, trying alternatives');
        }
        
        // 2. Second approach: Check users with role 'child'
        if (studentsCount === 0) {
          try {
            const childrenQuery = query(collection(db, 'users'), where('role', '==', 'child'));
            const childrenSnapshot = await getDocs(childrenQuery);
            studentsCount = childrenSnapshot.size;
            console.log('Found students in users collection with role=child:', studentsCount);
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
            console.log('Found unique students in lesson_progress:', studentsCount);
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
            console.log('Found unique students in quiz_results:', studentsCount);
          } catch (error) {
            console.log('Error checking quiz_results');
          }
        }
        
        // 5. Fifth approach: Check AsyncStorage for children data
        if (studentsCount === 0) {
          try {
            const childrenJson = await AsyncStorage.getItem('children');
            if (childrenJson) {
              const childrenData = JSON.parse(childrenJson);
              studentsCount = childrenData.filter(child => child && child.name).length;
              console.log('Found students in AsyncStorage:', studentsCount);
            }
          } catch (error) {
            console.log('Error checking AsyncStorage for children');
          }
        }
        
        // 6. Check AsyncStorage for quiz results
        try {
          const quizResultsJson = await AsyncStorage.getItem('quizResults');
          if (quizResultsJson) {
            const quizResults = JSON.parse(quizResultsJson);
            
            // Count unique childIds
            const uniqueChildIds = new Set();
            quizResults.forEach(result => {
              if (result.childId) {
                uniqueChildIds.add(result.childId);
              }
            });
            
            if (uniqueChildIds.size > studentsCount) {
              studentsCount = uniqueChildIds.size;
              console.log('Found more students in quiz results:', studentsCount);
            }
          }
        } catch (error) {
          console.log('Error checking AsyncStorage for quiz results');
        }
        
        // Fetch lessons count
        try {
          // Try to get lesson count from lesson_progress collection
          const lessonProgressCollection = collection(db, 'lesson_progress');
          const lessonProgressSnapshot = await getDocs(lessonProgressCollection);
          
          // Get total lessons and completed lessons
          const lessonData = {
            unique: new Set(),
            completed: 0,
            total: 0
          };
          
          lessonProgressSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.lessonId) {
              lessonData.unique.add(data.lessonId);
              lessonData.total++;
              if (data.isCompleted) {
                lessonData.completed++;
              }
            }
          });
          
          lessonsCount = lessonData.unique.size || lessonProgressSnapshot.size;
          totalLessonsAvailable = lessonData.total;
          totalLessonsCompleted = lessonData.completed;
          console.log('Found lessons in lesson_progress:', lessonsCount);
        } catch (error) {
          console.log('Error checking lesson_progress for lesson count');
        }
        
        // If no lessons found, try generic lessons collection
        if (lessonsCount === 0) {
          try {
            const lessonsCollection = collection(db, 'lessons');
            const lessonsSnapshot = await getDocs(lessonsCollection);
            lessonsCount = lessonsSnapshot.size;
            
            // Count completed lessons
            let completed = 0;
            lessonsSnapshot.forEach(doc => {
              const data = doc.data();
              if (data.completed) {
                completed++;
              }
            });
            
            totalLessonsAvailable = lessonsCount;
            totalLessonsCompleted = completed;
            console.log('Found lessons in generic collection:', lessonsCount);
          } catch (error) {
            console.log('No lessons collection found');
          }
        }
        
        // Try lesson_content collection if still no lessons
        if (lessonsCount === 0) {
          try {
            const lessonContentCollection = collection(db, 'lesson_content');
            const lessonContentSnapshot = await getDocs(lessonContentCollection);
            lessonsCount = lessonContentSnapshot.size;
            console.log('Found lessons in lesson_content collection:', lessonsCount);
          } catch (error) {
            console.log('No lesson_content collection found');
          }
        }
        
        // If still no lessons found, check AsyncStorage
        if (lessonsCount === 0) {
          try {
            const cachedProgress = await AsyncStorage.getItem('student_progress_cache');
            if (cachedProgress) {
              const progressData = JSON.parse(cachedProgress);
              
              // Find the max number of lessons across all students
              Object.values(progressData).forEach(student => {
                // Check each subject for lesson data
                ['math', 'english', 'amharic', 'oromo'].forEach(subject => {
                  if (student[subject] && student[subject].lessons) {
                    const lessonData = student[subject].lessons;
                    totalLessonsAvailable += lessonData.total;
                    totalLessonsCompleted += lessonData.completed;
                  }
                });
              });
              
              lessonsCount = Math.max(
                ...Object.values(progressData).map(student => 
                  student.all.lessons ? student.all.lessons.total : 0
                )
              );
            }
          } catch (error) {
            console.log('Error checking AsyncStorage for lesson data');
          }
        }
        
        // Calculate completion rate
        if (totalLessonsAvailable > 0) {
          completionRate = Math.round((totalLessonsCompleted / totalLessonsAvailable) * 100);
        }
      }
      
      // Update dashboard data state
      setDashboardData({
        studentsCount,
        lessonsCount,
        completionRate,
        isLoading: false
      });
      
      // Update data status
      setDataStatus({
        hasData: studentsCount > 0 || lessonsCount > 0 || completionRate > 0,
        message: `Data source: ${dataSource} | Last updated: ${new Date().toLocaleTimeString()}`
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData({
        studentsCount: 0,
        lessonsCount: 0,
        completionRate: 0,
        isLoading: false
      });
      setDataStatus({
        hasData: false,
        message: 'Error loading data'
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

  // Language selection handler
  const handleLanguageChange = (language) => {
    changeLanguage(language);
    setShowLanguageModal(false);
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
                    
                    {/* Language selection */}
                    <TouchableOpacity 
                      style={styles.profileMenuItem}
                      onPress={() => setShowLanguageModal(true)}
                    >
                      <View style={styles.profileMenuItemIcon}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <Circle cx="12" cy="12" r="10" stroke={currentTheme.text} strokeWidth="2" />
                          <Path d="M12 2C14.4 5.4 16 9.6 16 12C16 14.4 14.4 18.6 12 22M12 2C9.6 5.4 8 9.6 8 12C8 14.4 9.6 18.6 12 22" stroke={currentTheme.text} strokeWidth="2" />
                          <Path d="M2 12H22" stroke={currentTheme.text} strokeWidth="2" />
                        </Svg>
                      </View>
                      <Text style={[styles.profileMenuItemText, { color: currentTheme.text, flex: 1 }]}>
                        {translate('common.language') || 'Language'}
                      </Text>
                      <Text style={[styles.languageCode, { color: currentTheme.primary }]}>
                        {currentLanguage.toUpperCase()}
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
  
  // First, initialize menuItems array with translated strings
  const menuItems = [
    {
      title: translate('teacher.studentProgress') || 'Student Progress',
      description: translate('teacher.studentProgressDesc') || 'View and track student performance',
      icon: 'analytics-outline',
      onPress: () => navigation.navigate('StudentProgress'),
      color: '#4285F4',
      translationKey: 'studentprogress',
      translationDescKey: 'studentprogressDesc'
    },
    {
      title: translate('teacher.studentReports') || 'Student Reports',
      description: translate('teacher.studentReportsDesc') || 'Create and manage subject-specific reports for students',
      icon: 'document-text-outline',
      onPress: () => navigation.navigate('StudentReports'),
      color: '#DB4437',
      translationKey: 'studentreports',
      translationDescKey: 'studentreportsDesc'
    },
    {
      title: translate('teacher.createContent') || 'Create Content',
      description: translate('teacher.createContentDesc') || 'Develop new educational resources',
      icon: 'book-outline',
      onPress: () => navigation.navigate('CreateContent'),
      color: '#34A853',
      translationKey: 'createcontent',
      translationDescKey: 'createcontentDesc'
    },
    {
      title: translate('teacher.classSchedule') || 'Class Schedule',
      description: translate('teacher.classScheduleDesc') || 'Manage your teaching timetable',
      icon: 'calendar-outline',
      onPress: () => {},
      color: '#FBBC05',
      translationKey: 'classschedule',
      translationDescKey: 'classscheduleDesc'
    }
  ];

  // First, add a refresh function to the component
  const refreshDashboard = () => {
    fetchDashboardData();
  };

  // Function to get color based on completion percentage
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#34A853'; // Green for high completion
    if (percentage >= 50) return '#FBBC05'; // Yellow for medium completion
    return '#EA4335'; // Red for low completion
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentTheme.primary} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{translate('teacher.dashboard') || 'Teacher Dashboard'}</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={refreshDashboard}
            >
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M1 4V10H7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M23 20V14H17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M20.49 9C19.9828 7.56678 19.1209 6.2854 17.9845 5.27542C16.8482 4.26543 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93434 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7346 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
          </TouchableOpacity>
            <ProfilePicture />
          </View>
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
                {translate('teacher.welcome')}, 
              </Text>
              <Text style={[styles.teacherName, { color: currentTheme.primary }]}>
                {userName}
              </Text>
            </View>
            <Text style={[styles.welcomeSubtitle, { color: currentTheme.textSecondary }]}>
              {translate('teacher.inspire')}
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
            ) : dashboardData.studentsCount > 0 ? (
              <Text style={[styles.statValue, { color: currentTheme.text }]}>
                {dashboardData.studentsCount}
              </Text>
            ) : (
              <Text style={[styles.statNoData, { color: currentTheme.textSecondary }]}>
                {translate('teacher.noData')}
              </Text>
            )}
            <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>{translate('teacher.students')}</Text>
          </TouchableOpacity>
          
          <View style={[styles.statCard, { backgroundColor: currentTheme.card }]}>
            <DocumentIcon />
            {dashboardData.isLoading ? (
              <ActivityIndicator color="#EA4335" size="small" style={styles.statLoader} />
            ) : dashboardData.lessonsCount > 0 ? (
              <Text style={[styles.statValue, { color: currentTheme.text }]}>
                {dashboardData.lessonsCount}
              </Text>
            ) : (
              <Text style={[styles.statNoData, { color: currentTheme.textSecondary }]}>
                {translate('teacher.noData')}
              </Text>
            )}
            <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>{translate('teacher.lessons')}</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: currentTheme.card }]}>
            <CheckmarkIcon />
            {dashboardData.isLoading ? (
              <ActivityIndicator color="#34A853" size="small" style={styles.statLoader} />
            ) : dashboardData.completionRate > 0 ? (
              <Text style={[styles.statValue, { color: currentTheme.text }]}>
                {dashboardData.completionRate}%
              </Text>
            ) : (
              <Text style={[styles.statNoData, { color: currentTheme.textSecondary }]}>
                {translate('teacher.noData')}
              </Text>
            )}
            <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>{translate('teacher.completion')}</Text>
          </View>
        </View>
        
        {/* Data Status Indicator */}
        {!dashboardData.isLoading && (
          <View style={styles.dataStatusContainer}>
            <Text style={[
              styles.dataStatusText, 
              { color: dataStatus.hasData ? currentTheme.success : currentTheme.textSecondary }
            ]}>
              {dataStatus.hasData 
                ? translate('progressReport.dataSuccess') || 'Data loaded successfully'
                : translate('teacher.dataNotAvailable') || 'No data available'}
            </Text>
            {dataStatus.message && (
              <Text style={[styles.dataSourceText, { color: currentTheme.textSecondary }]}>
                {dataStatus.message}
              </Text>
            )}
            {!dataStatus.hasData && (
              <TouchableOpacity 
                style={[styles.refreshDataButton, { backgroundColor: currentTheme.primary }]}
                onPress={refreshDashboard}
              >
                <Text style={styles.refreshDataButtonText}>{translate('teacher.refreshData') || 'Refresh Data'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Dashboard Summary */}
        {dataStatus.hasData && !dashboardData.isLoading && (
          <View style={[styles.dashboardSummary, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.summaryTitle, { color: currentTheme.text }]}>
              {translate('teacher.summary') || 'Dashboard Summary'}
            </Text>
            
            <View style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <View style={[styles.summaryIconContainer, { backgroundColor: '#4285F420' }]}>
                  <PeopleIcon />
                </View>
                <View style={styles.summaryDetails}>
                  <Text style={[styles.summaryValue, { color: currentTheme.text }]}>
                    {dashboardData.studentsCount}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: currentTheme.textSecondary }]}>
                    {translate('teacher.activeStudents') || 'Active Students'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.summaryItem}>
                <View style={[styles.summaryIconContainer, { backgroundColor: '#EA433520' }]}>
                  <DocumentIcon />
                </View>
                <View style={styles.summaryDetails}>
                  <Text style={[styles.summaryValue, { color: currentTheme.text }]}>
                    {dashboardData.lessonsCount}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: currentTheme.textSecondary }]}>
                    {translate('teacher.totalLessons') || 'Total Lessons'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.summaryItem}>
                <View style={[styles.summaryIconContainer, { backgroundColor: '#34A85320' }]}>
                  <CheckmarkIcon />
                </View>
                <View style={styles.summaryDetails}>
                  <Text style={[styles.summaryValue, { color: currentTheme.text }]}>
                    {dashboardData.completionRate}%
                  </Text>
                  <Text style={[styles.summaryLabel, { color: currentTheme.textSecondary }]}>
                    {translate('teacher.completionRate') || 'Completion Rate'}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressTitle, { color: currentTheme.textSecondary }]}>
                  {translate('teacher.overallProgress') || 'Overall Progress'}
                </Text>
                <Text style={[styles.progressPercent, { color: currentTheme.primary }]}>
                  {dashboardData.completionRate}%
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: currentTheme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${dashboardData.completionRate}%`,
                      backgroundColor: getProgressColor(dashboardData.completionRate)
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        )}
        
        {/* Teacher Tools Section Title */}
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{translate('teacher.teacherTools')}</Text>
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
                <Text style={[styles.menuTitle, { color: currentTheme.text }]}>
                  {translate(`teacher.${item.translationKey}`) || item.title}
                </Text>
                <Text style={[styles.menuDescription, { color: currentTheme.textSecondary }]} numberOfLines={2}>
                  {translate(`teacher.${item.translationDescKey}`) || item.description}
                </Text>
              </View>
              <ChevronIcon />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowLanguageModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.languageModalContainer, { backgroundColor: currentTheme.card }]}>
                <Text style={[styles.languageModalTitle, { color: currentTheme.text }]}>
                  {translate('common.selectLanguage') || 'Select Language'}
                </Text>
                
                {Object.values(languages).map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageOption,
                      currentLanguage === lang.code && styles.selectedLanguageOption
                    ]}
                    onPress={() => handleLanguageChange(lang.code)}
                  >
                    <Text style={[
                      styles.languageOptionText,
                      { color: currentTheme.text }
                    ]}>
                      {lang.name}
                    </Text>
                    
                    {currentLanguage === lang.code && (
                      <Ionicons name="checkmark" size={24} color="#4285F4" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'flex-end',
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
  statNoData: {
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    padding: 4,
  },
  dataStatusContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataStatusText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  dataSourceText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  refreshDataButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 4,
  },
  refreshDataButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  languageSelector: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageOptions: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  languageOption: {
    marginVertical: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginRight: 8,
  },
  selectedLanguageOption: {
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
  },
  languageOptionText: {
    fontSize: 16,
  },
  languageCode: {
    fontSize: 14,
    fontWeight: '600',
  },
  languageModalContainer: {
    width: '65%',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 0,
    marginRight: 20,
  },
  languageModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dashboardSummary: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryDetails: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  progressSection: {
    marginTop: 16,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#4285F4',
  },
});
