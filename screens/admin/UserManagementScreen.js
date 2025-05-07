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
import { Svg, Path, Circle, G, Rect } from 'react-native-svg';

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

  // Define SVG Icons
  const BackIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const RefreshIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M1 4V10H7" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M23 20V14H17" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M20.49 9C19.9828 7.56678 19.1209 6.2854 17.9845 5.27542C16.8482 4.26543 15.4745 3.55976 13.9917 3.22426C12.5089 2.88877 10.9652 2.93436 9.50481 3.35677C8.04437 3.77918 6.71475 4.56473 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0656 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.15181 19.7346 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const PeopleIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={selectedFilter === 'all' ? "#FFF" : "#333"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke={selectedFilter === 'all' ? "#FFF" : "#333"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={selectedFilter === 'all' ? "#FFF" : "#333"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke={selectedFilter === 'all' ? "#FFF" : "#333"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const ParentsIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path d="M17 20C17 18.4087 16.3679 16.8826 15.2426 15.7574C14.1174 14.6321 12.5913 14 11 14H7C5.4087 14 3.88258 14.6321 2.75736 15.7574C1.63214 16.8826 1 18.4087 1 20" stroke={selectedFilter === 'parent' ? "#FFF" : "#333"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="9" cy="7" r="4" stroke={selectedFilter === 'parent' ? "#FFF" : "#333"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M22 20C22 18.4087 21.3679 16.8826 20.2426 15.7574C19.1174 14.6321 17.5913 14 16 14H15" stroke={selectedFilter === 'parent' ? "#FFF" : "#333"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M15 7C16.6569 7 18 5.65685 18 4C18 2.34315 16.6569 1 15 1C13.3431 1 12 2.34315 12 4C12 5.65685 13.3431 7 15 7Z" stroke={selectedFilter === 'parent' ? "#FFF" : "#333"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const TeachersIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path d="M12 12L3 7L12 2L21 7L12 12Z" stroke={selectedFilter === 'teacher' ? "#FFF" : "#333"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3 7V17" stroke={selectedFilter === 'teacher' ? "#FFF" : "#333"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 12V22" stroke={selectedFilter === 'teacher' ? "#FFF" : "#333"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 7V17" stroke={selectedFilter === 'teacher' ? "#FFF" : "#333"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const TrashIcon = () => (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path d="M3 6H5M5 6H21M5 6V20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H17C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20V6H5Z" stroke="#F44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="#F44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 11V17" stroke="#F44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 11V17" stroke="#F44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const ParentAvatarIcon = () => (
    <Svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="12" fill="#E8F5E9" />
      <Path d="M8 15C8 13.9391 8.42143 12.9217 9.17157 12.1716C9.92172 11.4214 10.9391 11 12 11C13.0609 11 14.0783 11.4214 14.8284 12.1716C15.5786 12.9217 16 13.9391 16 15" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="7" r="3" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const TeacherAvatarIcon = () => (
    <Svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="12" fill="#E3F2FD" />
      <Path d="M6 12L12 17L18 12" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 17V7" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <RefreshIcon />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'all' ? 
                { backgroundColor: '#2196F3' } : 
                { backgroundColor: '#F5F5F5' }
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <PeopleIcon />
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'all' ? 
                  { color: '#FFFFFF' } : 
                  { color: '#333333' }
              ]}
            >
              All Users
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'parent' ? 
                { backgroundColor: '#2196F3' } : 
                { backgroundColor: '#F5F5F5' }
            ]}
            onPress={() => setSelectedFilter('parent')}
          >
            <ParentsIcon />
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'parent' ? 
                  { color: '#FFFFFF' } : 
                  { color: '#333333' }
              ]}
            >
              Parents
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'teacher' ? 
                { backgroundColor: '#2196F3' } : 
                { backgroundColor: '#F5F5F5' }
            ]}
            onPress={() => setSelectedFilter('teacher')}
          >
            <TeachersIcon />
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'teacher' ? 
                  { color: '#FFFFFF' } : 
                  { color: '#333333' }
              ]}
            >
              Teachers
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {users.filter(u => u.role === 'parent').length}
            </Text>
            <Text style={styles.statLabel}>Parents</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {users.filter(u => u.role === 'teacher').length}
            </Text>
            <Text style={styles.statLabel}>Teachers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {users.filter(u => u.role === 'admin').length}
            </Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={({ item }) => (
              <View style={styles.userCard}>
                <View style={styles.userAvatarSection}>
                  {item.role === 'teacher' ? <TeacherAvatarIcon /> : <ParentAvatarIcon />}
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  <Text style={[styles.userRole, { color: item.role === 'teacher' ? '#2196F3' : '#4CAF50' }]}>
                    {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
                  </Text>
                  {item.name && (
                    <Text style={styles.userName}>{item.name}</Text>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteUser(item.id, item.email)}
                >
                  <TrashIcon />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <PeopleIcon />
                <Text style={styles.emptyText}>
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#2196F3',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    width: '31%',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
    color: '#666666',
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  userCard: {
    padding: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    elevation: 1,
  },
  userAvatarSection: {
    marginRight: 14,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  userRole: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  userName: {
    fontSize: 14,
    marginTop: 4,
    color: '#666666',
  },
  deleteButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 16,
    color: '#666666',
  },
});
