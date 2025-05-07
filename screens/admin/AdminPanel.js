// src/screens/admin/AdminPanel.js
import React from 'react';
import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Svg, Path, Circle } from 'react-native-svg';

export default function AdminPanel({ navigation }) {
  const { logout } = useAuth();
  const { currentTheme } = useTheme();

  const menuItems = [
    {
      title: 'Create Teacher',
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
      title: 'Manage Users',
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
      title: 'Manage Content',
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

  // Custom logout icon
  const LogoutIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M16 17L21 12M21 12L16 7M21 12H9" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentTheme.primary} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity 
          style={styles.logoutIcon}
          onPress={logout}
        >
          <LogoutIcon />
        </TouchableOpacity>
      </View>
      
      {/* Admin Info Card */}
      <View style={[styles.adminCard, { backgroundColor: currentTheme.card }]}>
        <View style={styles.adminIconContainer}>
          <ShieldIcon />
        </View>
        <View style={styles.adminInfo}>
          <Text style={[styles.adminTitle, { color: currentTheme.text }]}>Administrator</Text>
          <Text style={[styles.adminSubtitle, { color: currentTheme.textSecondary }]}>
            Manage your educational platform
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
    flex: 1,
    textAlign: 'center',
  },
  logoutIcon: {
    padding: 8,
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
  }
});
