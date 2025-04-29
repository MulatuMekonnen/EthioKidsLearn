import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const AdminDashboard = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { translate } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChildren: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalLessons: 0,
    totalAssignments: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total users
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      // Get total children
      const childrenRef = collection(db, 'children');
      const childrenSnapshot = await getDocs(childrenRef);
      
      // Get total teachers
      const teachersQuery = query(usersRef, where('role', '==', 'teacher'));
      const teachersSnapshot = await getDocs(teachersQuery);
      
      // Get total parents
      const parentsQuery = query(usersRef, where('role', '==', 'parent'));
      const parentsSnapshot = await getDocs(parentsQuery);
      
      // Get total lessons
      const lessonsRef = collection(db, 'lessons');
      const lessonsSnapshot = await getDocs(lessonsRef);
      
      // Get total assignments
      const assignmentsRef = collection(db, 'assignments');
      const assignmentsSnapshot = await getDocs(assignmentsRef);

      setStats({
        totalUsers: usersSnapshot.size,
        totalChildren: childrenSnapshot.size,
        totalTeachers: teachersSnapshot.size,
        totalParents: parentsSnapshot.size,
        totalLessons: lessonsSnapshot.size,
        totalAssignments: assignmentsSnapshot.size
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      Alert.alert(translate('error.title'), translate('error.fetchStats'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('Login');
    } catch (error) {
      Alert.alert(translate('error.title'), translate('error.logout'));
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{translate('admin.dashboard')}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{translate('auth.logout')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>{translate('admin.totalUsers')}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalChildren}</Text>
          <Text style={styles.statLabel}>{translate('admin.totalChildren')}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalTeachers}</Text>
          <Text style={styles.statLabel}>{translate('admin.totalTeachers')}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalParents}</Text>
          <Text style={styles.statLabel}>{translate('admin.totalParents')}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalLessons}</Text>
          <Text style={styles.statLabel}>{translate('admin.totalLessons')}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalAssignments}</Text>
          <Text style={styles.statLabel}>{translate('admin.totalAssignments')}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('UserManagement')}
        >
          <Text style={styles.actionButtonText}>
            {translate('admin.userManagement')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('ContentManagement')}
        >
          <Text style={styles.actionButtonText}>
            {translate('admin.contentManagement')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Reports')}
        >
          <Text style={styles.actionButtonText}>
            {translate('admin.reports')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default AdminDashboard; 