// src/screens/admin/AdminPanel.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  Text, 
  TouchableOpacity, 
  StatusBar, 
  Image, 
  Modal,
  TouchableWithoutFeedback,
  Platform,
  Alert
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Svg, Path, Circle, Rect } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
// Import ProfileImageManager for Cloudinary uploads
import ProfileImageManager from '../../components/ProfileImageManager';
import { uploadToCloudinary } from '../../services/cloudinary';
import AdminLanguageSelector from '../../components/AdminLanguageSelector';

export default function AdminPanel({ navigation }) {
  const { user, logout } = useAuth();
  const { currentTheme, toggleTheme } = useTheme();
  const { translate } = useLanguage();
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState('Admin');
  const [userEmail, setUserEmail] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
  }, [user]);

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
      Alert.alert(translate('errors.title'), 'Failed to pick image');
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
      Alert.alert(translate('errors.title'), 'Failed to upload image. Please try again.');
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

  // Get initials from name
  const getInitials = () => {
    if (!userName) return 'A';
    
    const names = userName.split(' ');
    const firstInitial = names[0].charAt(0).toUpperCase();
    
    return firstInitial;
  };

  // Generate a color based on username
  const generateProfileColor = () => {
    // Fixed green color for all profile icons
    return '#4CAF50'; // Green
  };
  
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
                      <Text style={[styles.profileMenuItemText, { color: currentTheme.text }]}>
                        {translate('profile.myProfile')}
                      </Text>
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
                        {currentTheme.mode === 'dark' ? translate('theme.lightTheme') : translate('theme.darkTheme')}
                      </Text>
                    </TouchableOpacity>
                    
                    {/* Language Selector */}
                    <View style={styles.profileMenuItem}>
                      <View style={styles.profileMenuItemIcon}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <Circle cx="12" cy="12" r="10" stroke={currentTheme.text} strokeWidth="2" />
                          <Path d="M12 2C16.4183 2 20 5.58172 20 10C20 14.4183 16.4183 18 12 18" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" />
                          <Path d="M2 10H20" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" />
                          <Path d="M12 2V18" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" />
                        </Svg>
                      </View>
                      <View style={{ flex: 1 }}>
                        <AdminLanguageSelector />
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.profileMenuItem}
                      onPress={logout}
                    >
                      <View style={styles.profileMenuItemIcon}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <Path d="M16 17L21 12M21 12L16 7M21 12H9" stroke={currentTheme.danger || "#F44336"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <Path d="M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9" stroke={currentTheme.danger || "#F44336"} strokeWidth="2" strokeLinecap="round" />
                        </Svg>
                      </View>
                      <Text style={[styles.profileMenuItemText, { color: currentTheme.danger || "#F44336" }]}>
                        {translate('auth.logout')}
                      </Text>
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

  // Custom edit icon
  const EditIcon = () => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const menuItems = [
    {
      title: translate('admin.createTeacher'),
      icon: (color) => (
        <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="10" r="4" stroke={color} strokeWidth="2" />
          <Path d="M19 21H5C5 17.134 8.134 14 12 14C13.5 14 14.9 14.5 16 15.3" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Path d="M15 9H19M17 7L17 11" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      ),
      onPress: () => navigation.navigate('CreateTeacher'),
      color: '#4CAF50',
    },
    {
      title: translate('admin.manageUsers'),
      icon: (color) => (
        <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" />
          <Circle cx="16" cy="15" r="3" stroke={color} strokeWidth="2" />
          <Path d="M5 19C5 16.7909 6.79086 15 9 15C10.0098 15 10.9447 15.3921 11.6464 16.0503" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      ),
      onPress: () => navigation.navigate('ManageUsers'),
      color: '#2196F3',
    },
    {
      title: translate('admin.manageContent'),
      icon: (color) => (
        <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <Path d="M5 7.8C5 6.11984 5 5.27976 5.32698 4.63803C5.6146 4.07354 6.07354 3.6146 6.63803 3.32698C7.27976 3 8.11984 3 9.8 3H14.2C15.8802 3 16.7202 3 17.362 3.32698C17.9265 3.6146 18.3854 4.07354 18.673 4.63803C19 5.27976 19 6.11984 19 7.8V16.2C19 17.8802 19 18.7202 18.673 19.362C18.3854 19.9265 17.9265 20.3854 17.362 20.673C16.7202 21 15.8802 21 14.2 21H9.8C8.11984 21 7.27976 21 6.63803 20.673C6.07354 20.3854 5.6146 19.9265 5.32698 19.362C5 18.7202 5 17.8802 5 16.2V7.8Z" stroke={color} strokeWidth="2" />
          <Path d="M9 8H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Path d="M9 12H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Path d="M9 16H13" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      ),
      onPress: () => navigation.navigate('ManageContent'),
      color: '#9C27B0',
    }
  ];

  // Custom shield icon SVG for admin logo
  const ShieldIcon = () => (
    <Svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <Path d="M12 3L20 7V12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12V7L12 3Z" stroke={currentTheme.primary} strokeWidth="2" />
      <Path d="M15 10L11 14L9 12" stroke={currentTheme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentTheme.primary} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <Text style={styles.headerTitle}>{translate('admin.dashboard')}</Text>
        <View style={styles.headerRight} />
        <ProfilePicture />
      </View>
      
      {/* Admin Info Card */}
      <View style={[styles.adminCard, { backgroundColor: currentTheme.card }]}>
        <View style={styles.adminIconContainer}>
          <ShieldIcon />
        </View>
        <View style={styles.adminInfo}>
          <Text style={[styles.adminTitle, { color: currentTheme.text }]}>{translate('admin.adminTitle')}</Text>
          <Text style={[styles.adminSubtitle, { color: currentTheme.textSecondary }]}>
            {translate('admin.adminSubtitle')}
          </Text>
        </View>
      </View>
      
      {/* Menu Grid */}
      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuCard, { backgroundColor: currentTheme.card }]}
            onPress={item.onPress}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
              {item.icon(item.color)}
            </View>
            <Text style={[styles.menuTitle, { color: currentTheme.text }]}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'left',
  },
  headerRight: {
    flex: 1,
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
  adminCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  adminIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    marginRight: 16,
  },
  adminInfo: {
    flex: 1,
  },
  adminTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  adminSubtitle: {
    fontSize: 14,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  menuCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
});
