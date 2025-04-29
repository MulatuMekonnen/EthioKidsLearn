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

const ParentDashboard = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { translate } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [stats, setStats] = useState({
    totalChildren: 0,
    totalProgress: 0,
    totalAssignments: 0,
    totalLessons: 0
  });

  useEffect(() => {
    fetchChildren();
    fetchStats();
  }, []);

  const fetchChildren = async () => {
    try {
      const childrenRef = collection(db, 'children');
      const q = query(childrenRef, where('parentId', '==', user.uid));
      const childrenSnapshot = await getDocs(q);

      const childrenData = childrenSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setChildren(childrenData);
    } catch (error) {
      console.error('Error fetching children:', error);
      Alert.alert(translate('error.title'), translate('error.fetchChildren'));
    }
  };

  const fetchStats = async () => {
    try {
      // Get total progress records for all children
      const progressRef = collection(db, 'progress');
      const progressQuery = query(progressRef, where('parentId', '==', user.uid));
      const progressSnapshot = await getDocs(progressQuery);

      // Get total assignments for all children
      const assignmentsRef = collection(db, 'assignments');
      const assignmentsQuery = query(assignmentsRef, where('parentId', '==', user.uid));
      const assignmentsSnapshot = await getDocs(assignmentsQuery);

      // Get total lessons for all children
      const lessonsRef = collection(db, 'lessons');
      const lessonsQuery = query(lessonsRef, where('parentId', '==', user.uid));
      const lessonsSnapshot = await getDocs(lessonsQuery);

      setStats({
        totalChildren: children.length,
        totalProgress: progressSnapshot.size,
        totalAssignments: assignmentsSnapshot.size,
        totalLessons: lessonsSnapshot.size
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
        <Text style={styles.title}>{translate('parent.dashboard')}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{translate('auth.logout')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalChildren}</Text>
          <Text style={styles.statLabel}>{translate('parent.totalChildren')}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalProgress}</Text>
          <Text style={styles.statLabel}>{translate('parent.totalProgress')}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalAssignments}</Text>
          <Text style={styles.statLabel}>{translate('parent.totalAssignments')}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalLessons}</Text>
          <Text style={styles.statLabel}>{translate('parent.totalLessons')}</Text>
        </View>
      </View>

      <View style={styles.childrenContainer}>
        <Text style={styles.sectionTitle}>{translate('parent.myChildren')}</Text>
        {children.map(child => (
          <TouchableOpacity
            key={child.id}
            style={styles.childCard}
            onPress={() => navigation.navigate('ChildDetails', { childId: child.id })}
          >
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childInfo}>
              {translate('parent.age')}: {child.age} | {translate('parent.grade')}: {child.grade}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddChild')}
        >
          <Text style={styles.actionButtonText}>
            {translate('parent.addChild')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('ProgressReports')}
        >
          <Text style={styles.actionButtonText}>
            {translate('parent.progressReports')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Assignments')}
        >
          <Text style={styles.actionButtonText}>
            {translate('parent.assignments')}
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
  childrenContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  childCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
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
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  childInfo: {
    fontSize: 14,
    color: '#666',
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

export default ParentDashboard; 