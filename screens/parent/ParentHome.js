import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
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
      icon: 'people',
      route: 'ParentDashboard',
      backgroundColor: '#2196F3',
    },
    {
      id: 2,
      title: 'My Profile',
      description: 'View and edit your profile information',
      icon: 'person-circle',
      route: 'Profile',
      backgroundColor: '#9C27B0',
    },
    {
      id: 3,
      title: 'Progress Report',
      description: 'View detailed learning progress',
      icon: 'document-text',
      route: 'ProgressReport',
      backgroundColor: '#FF9800',
    },
    {
      id: 4,
      title: 'Child Login',
      description: 'Switch to child profile login screen',
      icon: 'happy',
      route: 'ChildLogin',
      backgroundColor: '#4CAF50',
    },
    {
      id: 5,
      title: 'Settings',
      description: 'Customize app preferences and themes',
      icon: 'settings',
      route: 'Settings',
      backgroundColor: '#795548',
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome, <Text style={styles.userName}>{getDisplayName()}</Text></Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
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
                <Ionicons name={item.icon} size={28} color="#fff" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemTitle, { color: currentTheme.text }]}>{item.title}</Text>
                <Text style={styles.menuItemDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={currentTheme.border} />
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