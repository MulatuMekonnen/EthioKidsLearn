// src/screens/admin/UserManagementScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useUserManagement } from '../../context/UserManagementContext';
import { useTheme } from '../../context/ThemeContext';

export default function UserManagementScreen() {
  const { users, loading, fetchUsers, deleteUser } = useUserManagement();
  const { colors } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = (userId) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(userId);
            } catch (error) {
              Alert.alert("Error", "Failed to delete user");
            }
          }
        }
      ]
    );
  };

  const filteredUsers = selectedFilter === 'all' 
    ? users 
    : users.filter(user => user.role === selectedFilter);

  const renderFilterButton = (filter, label) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && { backgroundColor: colors.primary }
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter ? { color: colors.background } : { color: colors.text }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <View style={[styles.userCard, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>{item.email}</Text>
        <Text style={[styles.userRole, { color: colors.secondaryText }]}>Role: {item.role}</Text>
      </View>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.error }]}
        onPress={() => handleDeleteUser(item.id)}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>User Management</Text>
      
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All Users')}
        {renderFilterButton('parent', 'Parents')}
        {renderFilterButton('teacher', 'Teachers')}
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            No users found
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    marginHorizontal: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    gap: 16,
  },
  userCard: {
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
    elevation: 5,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userRole: {
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});
