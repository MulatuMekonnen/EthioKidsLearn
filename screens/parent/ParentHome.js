import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Svg, Path, Circle, G } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

export default function ParentHome() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const { currentTheme } = useTheme();

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
    },
    {
      id: 5,
      title: 'Settings',
      description: 'Customize app preferences and themes',
      icon: (color) => (
        <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <Path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke={color} strokeWidth="2" />
          <Path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.287 15.9606C19.3468 16.285 19.5043 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4243 16.365 19.2668 16.0406 19.207C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.287C7.71502 19.3468 7.41568 19.5043 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.57568 16.6643 4.73325 16.365 4.793 16.0406C4.85275 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77275 8.36381 4.713 8.03941C4.65325 7.71502 4.49568 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.57568 7.63502 4.73325 7.95941 4.793C8.28381 4.85275 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77275 15.9606 4.713C16.285 4.65325 16.5843 4.49568 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4243 7.33568 19.2668 7.63502 19.207 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ),
      route: 'Settings',
      backgroundColor: '#795548',
    }
  ];

  // Custom logout icon
  const LogoutIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M16 17L21 12M21 12L16 7M21 12H9" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const ChevronRightIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M9 18L15 12L9 6" stroke={currentTheme.border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome, <Text style={styles.userName}>{getDisplayName()}</Text></Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogoutIcon />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.route)}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: item.backgroundColor }]}
              >
                {item.icon('#fff')}
              </View>
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemTitle, { color: currentTheme.text }]}>{item.title}</Text>
                <Text style={styles.menuItemDescription}>{item.description}</Text>
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
    color: '#757575',
    marginTop: 4,
  },
});