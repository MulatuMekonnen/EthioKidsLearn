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
  ActivityIndicator,
  StatusBar
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

  const getUserIcon = (role) => {
    switch(role) {
      case 'parent':
        return { name: 'people-circle-outline', color: '#4CAF50' };
      case 'teacher':
        return { name: 'school-outline', color: '#2196F3' };
      case 'admin':
        return { name: 'shield-outline', color: '#F44336' };
      default:
        return { name: 'person-outline', color: currentTheme.textSecondary };
    }
  };

  const renderFilterButton = (filter, label, icon) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter ? 
          { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary } : 
          { backgroundColor: 'transparent', borderColor: currentTheme.border }
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Ionicons 
        name={icon} 
        size={18} 
        color={selectedFilter === filter ? currentTheme.background : currentTheme.text} 
        style={styles.filterIcon}
      />
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter ? 
            { color: currentTheme.background } : 
            { color: currentTheme.text }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    const userIcon = getUserIcon(item.role);
    
    return (
      <View style={[styles.userCard, { backgroundColor: currentTheme.card }]}>
        <View style={[styles.userIconContainer, { backgroundColor: userIcon.color + '15' }]}>
          <Ionicons name={userIcon.name} size={28} color={userIcon.color} />
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: currentTheme.text }]}>{item.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={[styles.userRole, { color: userIcon.color }]}>
              {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
            </Text>
          </View>
          {item.name && (
            <Text style={[styles.userFullName, { color: currentTheme.textSecondary }]}>
              {item.name}
            </Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteUser(item.id, item.email)}
        >
          <Ionicons name="trash-outline" size={22} color="#F44336" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentTheme.primary} />
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Ionicons name="refresh" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.filterContainer}>
          {renderFilterButton('all', 'All Users', 'people')}
          {renderFilterButton('parent', 'Parents', 'people-circle')}
          {renderFilterButton('teacher', 'Teachers', 'school')}
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.statValue, { color: currentTheme.text }]}>
              {users.filter(u => u.role === 'parent').length}
            </Text>
            <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>Parents</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.statValue, { color: currentTheme.text }]}>
              {users.filter(u => u.role === 'teacher').length}
            </Text>
            <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>Teachers</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.statValue, { color: currentTheme.text }]}>
              {users.filter(u => u.role === 'admin').length}
            </Text>
            <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>Admins</Text>
          </View>
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
            showsVerticalScrollIndicator={false}
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
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
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
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
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
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    flexGrow: 1,
    paddingTop: 0,
  },
  userCard: {
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
    elevation: 3,
    marginBottom: 16,
  },
  userIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userFullName: {
    fontSize: 14,
    marginTop: 4,
  },
  roleBadge: {
    marginTop: 6,
  },
  userRole: {
    fontSize: 13,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 16,
  },
});
