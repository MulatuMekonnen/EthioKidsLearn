// src/screens/admin/UserManagementScreen.js
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useUserManagement } from '../../context/UserManagementContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function UserManagementScreen({ navigation }) {
  const { users, loading, fetchUsers, deleteUser } = useUserManagement();
  const { currentTheme } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleDeleteUser = (userId, userEmail) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${userEmail}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(userId);
              Alert.alert("Success", "User has been deleted");
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to delete user");
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
        selectedFilter === filter && { backgroundColor: currentTheme.primary }
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter ? { color: currentTheme.background } : { color: currentTheme.text }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <View style={[styles.userCard, { backgroundColor: currentTheme.card }]}>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: currentTheme.text }]}>{item.email}</Text>
        <Text style={[styles.userRole, { color: currentTheme.textSecondary }]}>Role: {item.role}</Text>
        {item.name && (
          <Text style={[styles.userName, { color: currentTheme.text, fontSize: 14 }]}>
            {item.name}
          </Text>
        )}
      </View>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#F44336' }]}
        onPress={() => handleDeleteUser(item.id, item.email)}
      >
        <Text style={[styles.buttonText, { color: currentTheme.background }]}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.filterContainer}>
          {renderFilterButton('all', 'All Users')}
          {renderFilterButton('parent', 'Parents')}
          {renderFilterButton('teacher', 'Teachers')}
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={currentTheme.primary} />
            <Text style={[styles.loadingText, { color: currentTheme.text }]}>Loading users...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={60} color={currentTheme.textSecondary} />
                <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>
                  No users found
                </Text>
              </View>
            }
          />
        )}
      </View>
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
    padding: 16,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
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
    flexGrow: 1,
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
    marginBottom: 16,
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
    marginTop: 16,
  },
});
