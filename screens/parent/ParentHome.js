import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Modal, TouchableWithoutFeedback, Platform, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Svg, Path, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileImageManager from '../../components/ProfileImageManager';

export default function ParentHome() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const { currentTheme, toggleTheme } = useTheme();
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState('Parent');
  const [userEmail, setUserEmail] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

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

  // Function to capitalize first letter of each word
  const capitalizeWords = (text) => {
    if (!text) return '';
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
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

  // Custom profile picture component
  const ProfilePicture = () => {
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

  // Custom edit icon
  const EditIcon = () => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  // Custom logout icon
  const LogoutIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M16 17L21 12M21 12L16 7M21 12H9" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );

  const ChevronRightIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M9 18L15 12L9 6" stroke={currentTheme.textSecondary || currentTheme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const menuItems = [
    {
      id: 1,
      title: 'Parent Dashboard',
      description: 'Manage child profiles and view quiz results',
      icon: (color) => (
        <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" />
          <Path d="M3 21V16C3 13.7909 4.79086 12 7 12H11C13.2091 12 15 13.7909 15 16V21" stroke={color} strokeWidth="2" />
          <Path d="M15 10C17 10 19 8.5 19 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Path d="M15 10V8C15 6.34315 16.3431 5 18 5H20" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      ),
      route: 'ParentDashboard',
      backgroundColor: '#2196F3',
    },
    {
      id: 3,
      title: 'Progress Report',
      description: 'View detailed learning progress',
      icon: (color) => (
        <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <Path d="M8 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V16" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Path d="M7 13L10 16L21 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ),
      route: 'ProgressReport',
      backgroundColor: '#FF9800',
    },
    {
      id: 4,
      title: 'Child Login',
      description: 'Switch to child profile login screen',
      icon: (color) => (
        <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
          <Path d="M8 13C8.5 15 10 16 12 16C14 16 15.5 15 16 13" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Circle cx="9" cy="9" r="1" fill={color} />
          <Circle cx="15" cy="9" r="1" fill={color} />
        </Svg>
      ),
      route: 'ChildLogin',
      backgroundColor: '#4CAF50',
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome, <Text style={styles.userName}>{capitalizeWords(userName)}</Text></Text>
        </View>
        <ProfilePicture />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { backgroundColor: currentTheme.card }]}
              onPress={() => navigation.navigate(item.route)}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: item.backgroundColor }]}
              >
                {item.icon('#fff')}
              </View>
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemTitle, { color: currentTheme.text }]}>{item.title}</Text>
                <Text style={[styles.menuItemDescription, { color: currentTheme.textSecondary || '#757575' }]}>{item.description}</Text>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    color: '#fff',
    opacity: 0.8,
    fontStyle: 'italic',
  },
  userName: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuItemDescription: {
    fontSize: 14,
    marginTop: 4,
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
    borderRadius: 22,
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
});