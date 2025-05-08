import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Svg, Path, Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const { width } = Dimensions.get('window');

export default function StudentDashboard({ navigation }) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({
    lessonsCompleted: 0,
    quizzesTaken: 0,
    averageScore: 0,
    streakDays: 0,
    lastCategory: '',
    isLoading: true
  });
  const [recentQuizzes, setRecentQuizzes] = useState([]);

  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user?.uid) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.profileImage) {
          setProfileImage(userData.profileImage);
        }
        setUserName(userData.displayName || userData.name || 'Student');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserStats = async () => {
    setStats(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Get quiz results from AsyncStorage
      const quizResultsJson = await AsyncStorage.getItem('quizResults');
      let quizResults = [];
      
      if (quizResultsJson) {
        const allResults = JSON.parse(quizResultsJson);
        // Filter results for the current user
        quizResults = allResults.filter(result => result.childId === user.uid);
        
        // Calculate stats
        const quizzesTaken = quizResults.length;
        let totalScore = 0;
        
        quizResults.forEach(result => {
          totalScore += (result.score / result.totalQuestions) * 100;
        });
        
        const averageScore = quizzesTaken > 0 ? Math.round(totalScore / quizzesTaken) : 0;
        
        // Get recent quizzes (up to 5)
        const recentResults = [...quizResults]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
        
        setRecentQuizzes(recentResults);
        
        // Get last accessed category
        const lastActivityJson = await AsyncStorage.getItem('lastActivity');
        let lastCategory = '';
        
        if (lastActivityJson) {
          const lastActivity = JSON.parse(lastActivityJson);
          if (lastActivity.userId === user.uid) {
            lastCategory = lastActivity.category || '';
          }
        }
        
        // Calculate lesson completion and streak
        const lessonsJson = await AsyncStorage.getItem('completedLessons');
        let lessonsCompleted = 0;
        
        if (lessonsJson) {
          const completedLessons = JSON.parse(lessonsJson);
          lessonsCompleted = completedLessons.filter(lesson => lesson.userId === user.uid).length;
        }
        
        // Get streak information
        const streakJson = await AsyncStorage.getItem('learningStreak');
        let streakDays = 0;
        
        if (streakJson) {
          const streak = JSON.parse(streakJson);
          if (streak.userId === user.uid) {
            streakDays = streak.currentStreak || 0;
          }
        }
        
        setStats({
          lessonsCompleted,
          quizzesTaken,
          averageScore,
          streakDays,
          lastCategory,
          isLoading: false
        });
      } else {
        // No quiz results, set defaults
        setStats({
          lessonsCompleted: 0,
          quizzesTaken: 0,
          averageScore: 0,
          streakDays: 0,
          lastCategory: '',
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setStats({
        lessonsCompleted: 0,
        quizzesTaken: 0,
        averageScore: 0,
        streakDays: 0,
        lastCategory: '',
        isLoading: false
      });
    }
  };

  // Get initials from name
  const getInitials = () => {
    if (!userName) return 'S';
    
    const names = userName.split(' ');
    const firstInitial = names[0].charAt(0).toUpperCase();
    
    return firstInitial;
  };

  // Back button component
  const BackButton = () => (
    <TouchableOpacity
      style={styles.backButton}
      onPress={() => navigation.goBack()}
    >
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path
          d="M19 12H5M5 12L12 19M5 12L12 5"
          stroke={currentTheme.text}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </TouchableOpacity>
  );

  const getSubjectIcon = (subject) => {
    switch (subject?.toLowerCase()) {
      case 'math':
      case 'mathematics':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M7 16H17M9 8H9.01M15 8H15.01M7 12H17"
              stroke={currentTheme.primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5Z"
              stroke={currentTheme.primary}
              strokeWidth="2"
            />
          </Svg>
        );
      case 'english':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 7V4H20V7M12 20V4M8 20H16"
              stroke={currentTheme.primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'amharic':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 4V20M20 12H4"
              stroke={currentTheme.primary}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Circle
              cx="12"
              cy="12"
              r="8"
              stroke={currentTheme.primary}
              strokeWidth="2"
            />
          </Svg>
        );
      case 'oromo':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
              stroke={currentTheme.primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke={currentTheme.primary}
              strokeWidth="2"
            />
          </Svg>
        );
      default:
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528"
              stroke={currentTheme.primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <BackButton />
        <Text style={styles.headerTitle}>My Dashboard</Text>
        <View style={styles.profileContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profilePlaceholder, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.profilePlaceholderText}>{getInitials()}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={[styles.welcomeSection, { backgroundColor: currentTheme.card }]}>
          <Text style={[styles.welcomeText, { color: currentTheme.text }]}>
            Welcome back, {userName}!
          </Text>
          <Text style={[styles.welcomeSubtext, { color: currentTheme.textSecondary }]}>
            Let's continue your learning journey.
          </Text>
        </View>

        {/* Statistics Section */}
        <View style={styles.statsContainer}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>My Progress</Text>
          
          {stats.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={currentTheme.primary} />
            </View>
          ) : (
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: currentTheme.card }]}>
                <Text style={[styles.statValue, { color: currentTheme.primary }]}>{stats.lessonsCompleted}</Text>
                <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>Lessons Completed</Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: currentTheme.card }]}>
                <Text style={[styles.statValue, { color: currentTheme.primary }]}>{stats.quizzesTaken}</Text>
                <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>Quizzes Taken</Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: currentTheme.card }]}>
                <Text style={[styles.statValue, { color: currentTheme.primary }]}>{stats.averageScore}%</Text>
                <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>Average Score</Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: currentTheme.card }]}>
                <Text style={[styles.statValue, { color: currentTheme.primary }]}>{stats.streakDays}</Text>
                <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>Day Streak</Text>
              </View>
            </View>
          )}
        </View>

        {/* Recent Quizzes Section */}
        <View style={styles.recentSection}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Recent Quizzes</Text>
          
          {recentQuizzes.length > 0 ? (
            <View style={styles.recentList}>
              {recentQuizzes.map((quiz, index) => (
                <View 
                  key={index} 
                  style={[styles.quizItem, { backgroundColor: currentTheme.card }]}
                >
                  <View style={styles.quizIconContainer}>
                    {getSubjectIcon(quiz.category)}
                  </View>
                  <View style={styles.quizInfo}>
                    <Text style={[styles.quizCategory, { color: currentTheme.text }]}>
                      {quiz.category} Quiz
                    </Text>
                    <Text style={[styles.quizDate, { color: currentTheme.textSecondary }]}>
                      {new Date(quiz.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={[styles.quizScore, { 
                    backgroundColor: 
                      quiz.score / quiz.totalQuestions >= 0.7 ? '#4CAF5020' : 
                      quiz.score / quiz.totalQuestions >= 0.4 ? '#FF980020' : '#F4433620'
                  }]}>
                    <Text style={[styles.quizScoreText, { 
                      color: 
                        quiz.score / quiz.totalQuestions >= 0.7 ? '#4CAF50' : 
                        quiz.score / quiz.totalQuestions >= 0.4 ? '#FF9800' : '#F44336'
                    }]}>
                      {quiz.score}/{quiz.totalQuestions}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: currentTheme.card }]}>
              <Text style={[styles.emptyStateText, { color: currentTheme.textSecondary }]}>
                You haven't taken any quizzes yet. Start learning to see your results here!
              </Text>
            </View>
          )}
        </View>

        {/* Continue Learning Section */}
        <View style={styles.continueSection}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Continue Learning</Text>
          
          <TouchableOpacity 
            style={[styles.continueCard, { 
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.primary,
            }]}
            onPress={() => {
              if (stats.lastCategory) {
                // Navigate based on the last category
                switch(stats.lastCategory.toLowerCase()) {
                  case 'math':
                  case 'mathematics':
                    navigation.navigate('MathLessons');
                    break;
                  case 'english':
                    navigation.navigate('EnglishLessons');
                    break;
                  case 'amharic':
                    navigation.navigate('AmharicLessonsScreen');
                    break;
                  case 'oromo':
                    navigation.navigate('OromoLessonScreen');
                    break;
                  default:
                    navigation.navigate('LessonsScreen');
                }
              } else {
                navigation.navigate('LessonsScreen');
              }
            }}
          >
            <View style={styles.continueCardContent}>
              <View style={styles.continueIconContainer}>
                {getSubjectIcon(stats.lastCategory)}
              </View>
              <View style={styles.continueInfo}>
                <Text style={[styles.continueTitle, { color: currentTheme.text }]}>
                  {stats.lastCategory ? `${stats.lastCategory} Lessons` : 'Start Learning'}
                </Text>
                <Text style={[styles.continueDesc, { color: currentTheme.textSecondary }]}>
                  {stats.lastCategory 
                    ? `Continue your progress in ${stats.lastCategory}` 
                    : 'Choose a subject to begin learning'}
                </Text>
              </View>
              <View style={styles.continueArrow}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M9 18L15 12L9 6"
                    stroke={currentTheme.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </View>
          </TouchableOpacity>
          
          {/* All Lessons Button */}
          <TouchableOpacity 
            style={[styles.allLessonsButton, { 
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
              marginTop: 12
            }]}
            onPress={() => navigation.navigate('LessonsScreen')}
          >
            <View style={styles.continueCardContent}>
              <View style={[styles.allLessonsIconContainer, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M4 6H20M4 12H20M4 18H20"
                    stroke={currentTheme.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <View style={styles.continueInfo}>
                <Text style={[styles.continueTitle, { color: currentTheme.text }]}>
                  View All Lessons
                </Text>
                <Text style={[styles.continueDesc, { color: currentTheme.textSecondary }]}>
                  Explore all available subjects and lessons
                </Text>
              </View>
              <View style={styles.continueArrow}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M9 18L15 12L9 6"
                    stroke={currentTheme.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </View>
          </TouchableOpacity>
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
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    width: 40,
    height: 40,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  welcomeSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsContainer: {
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 40) / 2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  recentSection: {
    marginBottom: 24,
  },
  recentList: {
    marginBottom: 8,
  },
  quizItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  quizIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quizInfo: {
    flex: 1,
  },
  quizCategory: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  quizDate: {
    fontSize: 13,
  },
  quizScore: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quizScoreText: {
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 15,
  },
  continueSection: {
    marginBottom: 8,
  },
  continueCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  continueCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  continueInfo: {
    flex: 1,
  },
  continueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  continueDesc: {
    fontSize: 14,
  },
  continueArrow: {
    padding: 8,
  },
  allLessonsButton: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  allLessonsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
}); 