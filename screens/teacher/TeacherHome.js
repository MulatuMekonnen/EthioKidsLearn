import React from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView,
  Image
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function TeacherHome({ navigation }) {
  const { user, logout } = useAuth();
  const { currentTheme } = useTheme();

  const teacherName = user?.displayName || 'Teacher';
  
  const menuItems = [
    {
      title: 'Track Student Progress',
      description: 'View learning analytics and progress reports',
      icon: 'analytics-outline',
      onPress: () => {},
      color: '#4285F4'
    },
    {
      title: 'Give Reports',
      description: 'Submit evaluations and feedback for students',
      icon: 'create-outline',
      onPress: () => navigation.navigate('ChildScores'),
      color: '#EA4335'
    },
    {
      title: 'Create Content',
      description: 'Develop new educational resources',
      icon: 'book-outline',
      onPress: () => navigation.navigate('CreateContent'),
      color: '#34A853'
    },
    {
      title: 'Class Schedule',
      description: 'Manage your teaching timetable',
      icon: 'calendar-outline',
      onPress: () => {},
      color: '#FBBC05'
    }
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentTheme.primary} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Teacher Dashboard</Text>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Teacher Welcome Card */}
        <View style={[styles.welcomeCard, { backgroundColor: currentTheme.card }]}>
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeHeader}>
              <Text style={[styles.welcomeTitle, { color: currentTheme.text }]}>
                Welcome back, 
              </Text>
              <Text style={[styles.teacherName, { color: currentTheme.primary }]}>
                {teacherName}
              </Text>
            </View>
            <Text style={[styles.welcomeSubtitle, { color: currentTheme.textSecondary }]}>
              Ready to inspire minds today?
            </Text>
          </View>
          <View style={[styles.avatarContainer, { backgroundColor: currentTheme.primary + '20' }]}>
            <Ionicons name="school" size={40} color={currentTheme.primary} />
          </View>
        </View>
        
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: currentTheme.card }]}>
            <Ionicons name="people-outline" size={22} color="#4285F4" style={styles.statIcon} />
            <Text style={[styles.statValue, { color: currentTheme.text }]}>24</Text>
            <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>Students</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: currentTheme.card }]}>
            <Ionicons name="document-text-outline" size={22} color="#EA4335" style={styles.statIcon} />
            <Text style={[styles.statValue, { color: currentTheme.text }]}>14</Text>
            <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>Lessons</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: currentTheme.card }]}>
            <Ionicons name="checkmark-circle-outline" size={22} color="#34A853" style={styles.statIcon} />
            <Text style={[styles.statValue, { color: currentTheme.text }]}>92%</Text>
            <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>Completion</Text>
          </View>
        </View>
        
        {/* Menu Items */}
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Teacher Tools</Text>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuCard, { backgroundColor: currentTheme.card }]}
              onPress={item.onPress}
            >
              <View style={[styles.iconBubble, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={28} color={item.color} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color: currentTheme.text }]}>{item.title}</Text>
                <Text style={[styles.menuDescription, { color: currentTheme.textSecondary }]} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={currentTheme.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Recent Activity */}
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Recent Activity</Text>
        <View style={[styles.activityCard, { backgroundColor: currentTheme.card }]}>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <Text style={[styles.activityText, { color: currentTheme.text }]}>
              Submitted reports for 8 students
            </Text>
            <Text style={[styles.activityTime, { color: currentTheme.textSecondary }]}>2h ago</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <Text style={[styles.activityText, { color: currentTheme.text }]}>
              Created new math lesson
            </Text>
            <Text style={[styles.activityTime, { color: currentTheme.textSecondary }]}>Yesterday</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <Text style={[styles.activityText, { color: currentTheme.text }]}>
              Provided feedback on 3 assignments
            </Text>
            <Text style={[styles.activityTime, { color: currentTheme.textSecondary }]}>2 days ago</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  welcomeCard: {
    margin: 16,
    marginBottom: 8,
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
    elevation: 3,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  teacherName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  menuContainer: {
    paddingHorizontal: 16,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.07,
    shadowRadius: 1.84,
    elevation: 2,
  },
  iconBubble: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  activityCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4285F4',
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
  },
  activityTime: {
    fontSize: 12,
    marginLeft: 8,
  }
});
