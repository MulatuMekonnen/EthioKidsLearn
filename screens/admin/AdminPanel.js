// src/screens/admin/AdminPanel.js
import React from 'react';
import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function AdminPanel({ navigation }) {
  const { logout } = useAuth();
  const { currentTheme } = useTheme();

  const menuItems = [
    {
      title: 'Create Teacher',
      icon: 'person-add-outline',
      onPress: () => navigation.navigate('CreateTeacher'),
      color: '#4CAF50',
    },
    {
      title: 'Manage Users',
      icon: 'people-outline',
      onPress: () => navigation.navigate('ManageUsers'),
      color: '#2196F3',
    },
    {
      title: 'Manage Content',
      icon: 'document-text-outline',
      onPress: () => navigation.navigate('ManageContent'),
      color: '#9C27B0',
    }
  ];

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
          <Ionicons name="log-out-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      {/* Admin Info Card */}
      <View style={[styles.adminCard, { backgroundColor: currentTheme.card }]}>
        <View style={styles.adminIconContainer}>
          <Ionicons name="shield-checkmark" size={36} color={currentTheme.primary} />
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
              <Ionicons name={item.icon} size={32} color={item.color} />
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
