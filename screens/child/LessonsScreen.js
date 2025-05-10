import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const { width } = Dimensions.get('window');

const subjects = [
  { id: '1', title: 'Math', color: '#FF0000', route: 'MathLessons', icon: 'calculator-outline', description: 'Learn numbers, counting and basic arithmetic' },
  { id: '2', title: 'English', color: '#FFFF00', route: 'EnglishLessons', icon: 'text-outline', description: 'Practice letters, words and basic reading' },
  { id: '3', title: 'አማርኛ', color: '#00FF00', route: 'AmharicLessonsScreen', icon: 'language-outline', description: 'Learn Amharic alphabet and words' },
  { id: '4', title: 'A/Oromo', color: '#FF00FF', route: 'OromoLessonScreen', icon: 'earth-outline', description: 'Learn Oromo language basics' },
  { id: '5', title: 'Animals and their Sound', color: '#0088FF', route: 'AnimalSoundsScreen', icon: 'paw-outline', description: 'Discover animals and their sounds' },
  { id: '6', title: 'Time and Calendar', color: '#FF8800', route: 'TimeNavigationScreen', icon: 'time-outline', description: 'Learn about time, days and months' },
];

export default function LessonsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { translate } = useLanguage();
  const [activeChild, setActiveChild] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const userName = activeChild?.name || user?.displayName || user?.email?.split('@')[0] || 'Student';

  useEffect(() => {
    loadActiveChild();
  }, []);

  useEffect(() => {
    // If route params include childId and childName, update active child
    if (route.params?.childId && route.params?.childName) {
      const child = {
        id: route.params.childId,
        name: route.params.childName
      };
      setActiveChild(child);
      
      // Save active child to AsyncStorage
      saveActiveChild(child);
      
      // Fetch progress data for this child
      fetchChildProgress(route.params.childId);
    }
  }, [route.params]);

  useEffect(() => {
    if (activeChild?.id) {
      fetchChildProgress(activeChild.id);
    }
  }, [activeChild]);

  const loadActiveChild = async () => {
    try {
      const savedActiveChild = await AsyncStorage.getItem('activeChild');
      if (savedActiveChild) {
        const child = JSON.parse(savedActiveChild);
        setActiveChild(child);
        fetchChildProgress(child.id);
      } else if (route.params?.childId && route.params?.childName) {
        // Use route params if available
        const child = {
          id: route.params.childId,
          name: route.params.childName
        };
        setActiveChild(child);
        fetchChildProgress(child.id);
      } else if (user && user.role === 'child') {
        // If user is a child, use their own data
        fetchChildProgress(user.uid);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading active child:', error);
      setLoading(false);
    }
  };
  
  const saveActiveChild = async (child) => {
    try {
      await AsyncStorage.setItem('activeChild', JSON.stringify(child));
    } catch (error) {
      console.error('Error saving active child:', error);
    }
  };

  const fetchChildProgress = async (childId) => {
    setLoading(true);
    
    try {
      const subjectProgress = {};
      
      // Initialize progress data structure for all subjects
      subjects.forEach(subject => {
        subjectProgress[subject.title.toLowerCase()] = {
          completed: 0,
          total: 0,
          percentage: 0,
          quizScores: []
        };
      });
      
      // 1. Fetch completed lessons from AsyncStorage
      const completedLessonsJson = await AsyncStorage.getItem('completedLessons');
      if (completedLessonsJson) {
        const completedLessons = JSON.parse(completedLessonsJson);
        const userLessons = completedLessons.filter(lesson => lesson.userId === childId);
        
        // Count completed lessons by category
        userLessons.forEach(lesson => {
          const category = lesson.category.toLowerCase();
          if (subjectProgress[category]) {
            subjectProgress[category].completed += 1;
          } else if (category === 'mathematics') {
            subjectProgress['math'].completed += 1;
          } else if (category === 'animals') {
            subjectProgress['animals and their sound'].completed += 1;
          } else if (category === 'time') {
            subjectProgress['time and calendar'].completed += 1;
          } else if (category.includes('oromo')) {
            subjectProgress['a/oromo'].completed += 1;
          }
        });
      }
      
      // 2. Fetch quiz results from AsyncStorage
      const quizResultsJson = await AsyncStorage.getItem('quizResults');
      if (quizResultsJson) {
        const quizResults = JSON.parse(quizResultsJson);
        const userQuizzes = quizResults.filter(quiz => quiz.childId === childId);
        
        // Process quiz results by category
        userQuizzes.forEach(quiz => {
          const category = quiz.category.toLowerCase();
          if (subjectProgress[category]) {
            subjectProgress[category].quizScores.push({
              score: quiz.score,
              total: quiz.totalQuestions,
              date: quiz.date
            });
          } else if (category === 'mathematics') {
            subjectProgress['math'].quizScores.push({
              score: quiz.score,
              total: quiz.totalQuestions,
              date: quiz.date
            });
          } else if (category === 'animals') {
            subjectProgress['animals and their sound'].quizScores.push({
              score: quiz.score,
              total: quiz.totalQuestions,
              date: quiz.date
            });
          } else if (category === 'time') {
            subjectProgress['time and calendar'].quizScores.push({
              score: quiz.score,
              total: quiz.totalQuestions,
              date: quiz.date
            });
          } else if (category.includes('oromo')) {
            subjectProgress['a/oromo'].quizScores.push({
              score: quiz.score,
              total: quiz.totalQuestions,
              date: quiz.date
            });
          }
        });
      }
      
      // 3. Try to fetch total lessons per category from Firestore (if available)
      try {
        // Math lessons
        const mathLessonsRef = collection(db, 'lessons', 'math', 'topics');
        const mathLessonsSnapshot = await getDocs(mathLessonsRef);
        subjectProgress['math'].total = mathLessonsSnapshot.size || 5;
        
        // English lessons
        const englishLessonsRef = collection(db, 'lessons', 'english', 'topics');
        const englishLessonsSnapshot = await getDocs(englishLessonsRef);
        subjectProgress['english'].total = englishLessonsSnapshot.size || 5;
        
        // Fetch other subjects similarly
      } catch (error) {
        // If Firestore fetch fails, use default values
        subjectProgress['math'].total = 5;
        subjectProgress['english'].total = 5;
        subjectProgress['አማርኛ'].total = 5;
        subjectProgress['a/oromo'].total = 5;
        subjectProgress['animals and their sound'].total = 5;
        subjectProgress['time and calendar'].total = 5;
      }
      
      // 4. Calculate progress percentages
      Object.keys(subjectProgress).forEach(key => {
        const subject = subjectProgress[key];
        
        // Calculate average quiz score if there are quiz results
        if (subject.quizScores.length > 0) {
          let totalScore = 0;
          let totalQuestions = 0;
          
          subject.quizScores.forEach(quiz => {
            totalScore += quiz.score;
            totalQuestions += quiz.total;
          });
          
          subject.quizAverage = Math.round((totalScore / totalQuestions) * 100);
        }
        
        // If total lessons is 0, set it to a default value to avoid division by zero
        if (subject.total === 0) {
          subject.total = 5;
        }
        
        // Calculate completion percentage
        subject.percentage = Math.min(100, Math.round((subject.completed / subject.total) * 100));
      });
      
      // Save the progress data
      setProgress(subjectProgress);
    } catch (error) {
      console.error('Error fetching child progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get the normalized category key
  const getNormalizedCategory = (subjectTitle) => {
    const title = subjectTitle.toLowerCase();
    if (title === 'አማርኛ') return 'አማርኛ';
    return title;
  };

  const getProgressForSubject = (subject) => {
    const categoryKey = getNormalizedCategory(subject.title);
    
    // Handle special cases for category mappings
    let normalizedKey = categoryKey;
    if (categoryKey === 'animals and their sound') normalizedKey = 'animals and their sound';
    if (categoryKey === 'time and calendar') normalizedKey = 'time and calendar';
    if (categoryKey === 'a/oromo') normalizedKey = 'a/oromo';
    
    return progress[normalizedKey] || { completed: 0, total: 5, percentage: 0 };
  };

  const renderSubjectCard = (subject, index) => {
    const subjectProgress = getProgressForSubject(subject);
    const progressPercentage = subjectProgress.percentage || 0;
    
    // Get translated description if available
    const translatedDescription = translate(`subjects.${subject.title.toLowerCase().replace(/\s+/g, '_')}.description`, { defaultValue: subject.description });
    
    return (
      <TouchableOpacity
        key={subject.id}
        style={[
          styles.subjectCard, 
          { 
            borderLeftColor: subject.color, 
            borderLeftWidth: 5,
            backgroundColor: currentTheme?.card || '#ffffff'
          }
        ]}
        onPress={() => navigation.navigate(subject.route, 
          activeChild ? { childId: activeChild.id, childName: activeChild.name } : undefined
        )}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: subject.color }]}>
          <Ionicons name={subject.icon} size={28} color="#fff" />
        </View>
        <View style={styles.subjectContent}>
          <Text style={[styles.subjectTitle, { color: currentTheme?.text || '#333' }]}>
            {translate(`subjects.${subject.title.toLowerCase().replace(/\s+/g, '_')}.title`, { defaultValue: subject.title })}
          </Text>
          <Text style={[styles.subjectDescription, { color: currentTheme?.textSecondary || 'rgba(0,0,0,0.7)' }]}>
            {translatedDescription}
          </Text>
          
          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progressPercentage}%`, backgroundColor: subject.color }]} />
          </View>
          
          <View style={styles.progressStats}>
            <Text style={[styles.progressText, { color: currentTheme?.textSecondary || 'rgba(0,0,0,0.7)' }]}>
              {translate('lessons.progress')}: {progressPercentage}%
            </Text>
            <Text style={[styles.lessonCount, { color: currentTheme?.textSecondary || 'rgba(0,0,0,0.7)' }]}>
              {subjectProgress.completed}/{subjectProgress.total} {translate('lessons.lessonsLabel')}
            </Text>
          </View>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={24} 
          color={currentTheme?.textSecondary || currentTheme?.border || '#ccc'} 
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme?.background || '#1A1B41' }]}>
        <View style={[styles.header, { backgroundColor: currentTheme?.primary || '#2196F3' }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{translate('lessons.title')}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme?.primary || '#2196F3'} />
          <Text style={[styles.loadingText, { color: currentTheme?.text || '#fff' }]}>
            {translate('lessons.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme?.background || '#1A1B41' }]}>
      <View style={[styles.header, { backgroundColor: currentTheme?.primary || '#2196F3' }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translate('lessons.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.welcome}>
        <Text style={[styles.greeting, { color: currentTheme?.text || '#333' }]}>
          {translate('lessons.greeting', { 0: userName })}
        </Text>
        <Text style={[styles.subtitle, { color: currentTheme?.textSecondary || '#666' }]}>
          {translate('lessons.chooseSubject')}
        </Text>
      </View>

      {activeChild && (
        <View style={[styles.activeChildBanner, { 
          backgroundColor: currentTheme?.card || '#FFFFFF20',
          borderWidth: 1,
          borderColor: currentTheme?.border || 'transparent' 
        }]}>
          <View style={styles.childAvatarCircle}>
            <Text style={styles.childAvatarText}>
              {activeChild.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={[styles.activeChildText, { color: currentTheme?.text || '#fff' }]}>
              {translate('lessons.learningAs')}: {activeChild.name}
            </Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        <View style={styles.subjectsContainer}>
          {subjects.map((subject, index) => renderSubjectCard(subject, index))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  welcome: {
    padding: 20,
    marginBottom: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 5,
    opacity: 0.8,
  },
  activeChildBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  childAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  childAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  activeChildText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  subjectsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  subjectCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  subjectContent: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subjectDescription: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },
  progressBarContainer: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressText: {
    fontSize: 12,
  },
  lessonCount: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});
