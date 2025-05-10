import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, orderBy, limit, getDoc, doc, collectionGroup } from 'firebase/firestore';

export default function StudentProgress() {
  const navigation = useNavigation();
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [selectedSubject, setSelectedSubject] = useState('all');

  const subjects = [
    { id: 'math', name: 'Math', color: '#2196F3' },
    { id: 'english', name: 'English', color: '#4CAF50' },
    { id: 'amharic', name: 'Amharic', color: '#FF9800' },
    { id: 'oromo', name: 'Oromo', color: '#9C27B0' }
  ];

  useEffect(() => {
    loadStudentsAndProgress();
  }, []);

  const loadStudentsAndProgress = async () => {
    setLoading(true);
    try {
      // First load students
      const studentsData = await loadStudents();
      
      if (studentsData.length === 0) {
        setLoading(false);
        return;
      }
      
      // Then load progress data for these students
      await loadProgressData(studentsData);
    } catch (error) {
      console.error('Error loading student progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      let childrenData = [];
      
      // First try to load from Firebase if user is authenticated
      if (user) {
        // Try to fetch children directly from the 'children' collection if it exists
        try {
          const childrenCollectionRef = collection(db, 'children');
          const childrenSnapshot = await getDocs(childrenCollectionRef);
          
          if (!childrenSnapshot.empty) {
            childrenData = childrenSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          }
        } catch (error) {
          console.log('No direct children collection, trying other methods');
        }
        
        // If no children found yet, try users with role 'child'
        if (childrenData.length === 0) {
          const childrenQuery = query(
            collection(db, 'users'),
            where('role', '==', 'child')
          );
          
          const childrenSnapshot = await getDocs(childrenQuery);
          
          if (!childrenSnapshot.empty) {
            childrenData = childrenSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          }
        }
        
        // If still no children, scan parent's children subcollections
        if (childrenData.length === 0) {
          const parentsQuery = query(
            collection(db, 'users'),
            where('role', '==', 'parent')
          );
          
          const parentsSnapshot = await getDocs(parentsQuery);
          
          if (!parentsSnapshot.empty) {
            let allChildren = [];
            
            // For each parent, get their children
            for (const parentDoc of parentsSnapshot.docs) {
              const parentId = parentDoc.id;
              const parentData = parentDoc.data();
              const childrenCollectionRef = collection(db, `users/${parentId}/children`);
              const childrenDocs = await getDocs(childrenCollectionRef);
              
              if (!childrenDocs.empty) {
                const parentChildren = childrenDocs.docs.map(doc => ({
                  id: doc.id,
                  parentId: parentId,
                  parentName: parentData.displayName || parentData.email || 'Parent',
                  ...doc.data()
                }));
                
                allChildren = [...allChildren, ...parentChildren];
              }
            }
            
            if (allChildren.length > 0) {
              childrenData = allChildren;
            }
          }
        }
      }
      
      // If no children found in Firebase or not authenticated, fallback to AsyncStorage
      if (childrenData.length === 0) {
        const childrenJson = await AsyncStorage.getItem('children');
        if (childrenJson) {
          childrenData = JSON.parse(childrenJson);
        }
      }
      
      // Filter out any entries that don't have a name or are incomplete
      childrenData = childrenData.filter(child => 
        child && child.name && child.name.trim() !== ''
      );
      
      // Sort by name for better display
      childrenData.sort((a, b) => a.name.localeCompare(b.name));
      
      setStudents(childrenData);
      return childrenData;
    } catch (error) {
      console.error('Error loading students:', error);
      
      // Final fallback - try AsyncStorage
      try {
        const childrenJson = await AsyncStorage.getItem('children');
        if (childrenJson) {
          const childrenData = JSON.parse(childrenJson);
          // Filter out unknown students
          const filteredChildren = childrenData.filter(child => 
            child && child.name && child.name.trim() !== ''
          );
          setStudents(filteredChildren);
          return filteredChildren;
        }
      } catch (e) {
        console.error('AsyncStorage fallback failed:', e);
      }
      
      return [];
    }
  };

  const loadProgressData = async (studentsData) => {
    try {
      // Initialize progress data structure
      const progress = {};
      const progressCacheKey = 'student_progress_cache';
      const cacheExpiry = 'student_progress_cache_timestamp';
      let shouldRefreshCache = true;
      
      // Check if we have a recent cache (less than 15 minutes old)
      try {
        const lastCacheTime = await AsyncStorage.getItem(cacheExpiry);
        if (lastCacheTime) {
          const cacheAge = Date.now() - parseInt(lastCacheTime);
          // If cache is less than 15 minutes old, use it
          if (cacheAge < 15 * 60 * 1000) {
            shouldRefreshCache = false;
            const cachedProgress = await AsyncStorage.getItem(progressCacheKey);
            if (cachedProgress) {
              const parsedCache = JSON.parse(cachedProgress);
              setProgressData(parsedCache);
              return; // Exit early if using cache
            }
          }
        }
      } catch (cacheError) {
        console.log('Error checking cache:', cacheError);
      }
      
      // Only continue if we need to refresh the data
      if (!shouldRefreshCache) return;
      
      // First try to get quiz results from Firebase
      if (user) {
        try {
          // Process each student individually for better indexed queries
          for (const student of studentsData) {
            if (!progress[student.id]) {
              progress[student.id] = {
                math: { scores: [], average: 0, count: 0, lessons: { total: 0, completed: 0 } },
                english: { scores: [], average: 0, count: 0, lessons: { total: 0, completed: 0 } },
                amharic: { scores: [], average: 0, count: 0, lessons: { total: 0, completed: 0 } },
                oromo: { scores: [], average: 0, count: 0, lessons: { total: 0, completed: 0 } },
                all: { scores: [], average: 0, count: 0, lessons: { total: 0, completed: 0 } }
              };
            }
            
            // 1. Get reports for this student
            const studentReportsQuery = query(
              collection(db, 'reports'),
              where('childId', '==', student.id),
              orderBy('timestamp', 'desc'),
              limit(50)
            );
            
            const reportsSnapshot = await getDocs(studentReportsQuery);
            
            if (!reportsSnapshot.empty) {
              reportsSnapshot.forEach(doc => {
                const reportData = doc.data();
                const { quizType, score } = reportData;
                
                // Add score to the appropriate subject
                if (score !== null && score !== undefined && quizType) {
                  if (progress[student.id][quizType]) {
                    progress[student.id][quizType].scores.push(score);
                    progress[student.id][quizType].count++;
                    progress[student.id].all.scores.push(score);
                    progress[student.id].all.count++;
                  }
                }
              });
            }
            
            // 2. Try to get individual quiz results from quiz_results collection
            try {
              const quizResultsQuery = query(
                collection(db, 'quiz_results'),
                where('childId', '==', student.id),
                orderBy('timestamp', 'desc'),
                limit(50)
              );
              
              const quizResultsSnapshot = await getDocs(quizResultsQuery);
              
              if (!quizResultsSnapshot.empty) {
                quizResultsSnapshot.forEach(doc => {
                  const quizData = doc.data();
                  const { category, score, totalQuestions } = quizData;
                  
                  if (category && score !== undefined && totalQuestions !== undefined) {
                    const percentageScore = Math.round((score / totalQuestions) * 100);
                    
                    if (progress[student.id][category]) {
                      progress[student.id][category].scores.push(percentageScore);
                      progress[student.id][category].count++;
                      progress[student.id].all.scores.push(percentageScore);
                      progress[student.id].all.count++;
                    }
                  }
                });
              }
            } catch (error) {
              console.log('Error fetching quiz_results:', error);
            }
            
            // 3. Get lesson completion data from 'lesson_progress' collection if it exists
            try {
              const lessonProgressQuery = query(
                collection(db, 'lesson_progress'),
                where('childId', '==', student.id),
                limit(100)
              );
              
              const lessonProgressSnapshot = await getDocs(lessonProgressQuery);
              
              if (!lessonProgressSnapshot.empty) {
                // Group lesson progress by subject
                const lessonsBySubject = {
                  math: { total: 0, completed: 0 },
                  english: { total: 0, completed: 0 },
                  amharic: { total: 0, completed: 0 },
                  oromo: { total: 0, completed: 0 },
                  all: { total: 0, completed: 0 }
                };
                
                lessonProgressSnapshot.forEach(doc => {
                  const lessonData = doc.data();
                  const { subject, isCompleted, lessonId } = lessonData;
                  
                  if (subject && lessonsBySubject[subject]) {
                    lessonsBySubject[subject].total++;
                    lessonsBySubject.all.total++;
                    
                    if (isCompleted) {
                      lessonsBySubject[subject].completed++;
                      lessonsBySubject.all.completed++;
                    }
                  }
                });
                
                // Add lesson data to progress object
                Object.keys(lessonsBySubject).forEach(subject => {
                  if (progress[student.id][subject]) {
                    progress[student.id][subject].lessons = lessonsBySubject[subject];
                  }
                });
              }
            } catch (error) {
              console.log('Error fetching lesson_progress:', error);
            }
          }
        } catch (error) {
          console.error('Error fetching reports from Firebase:', error);
        }
      }
      
      // If no data from Firebase or missing data for some students, try AsyncStorage
      const quizResultsJson = await AsyncStorage.getItem('quizResults');
      if (quizResultsJson) {
        const quizResults = JSON.parse(quizResultsJson);
        
        // Filter for real results (not demo data)
        const realResults = quizResults.filter(result => !result.isDemo);
        
        // Process each result
        realResults.forEach(result => {
          const { childId, category, score, totalQuestions } = result;
          
          // Skip if no childId, category or score
          if (!childId || !category || score === undefined || totalQuestions === undefined) return;
          
          // Check if this is one of our loaded students
          if (studentsData.some(student => student.id === childId)) {
            if (!progress[childId]) {
              progress[childId] = {
                math: { scores: [], average: 0, count: 0, lessons: { total: 0, completed: 0 } },
                english: { scores: [], average: 0, count: 0, lessons: { total: 0, completed: 0 } },
                amharic: { scores: [], average: 0, count: 0, lessons: { total: 0, completed: 0 } },
                oromo: { scores: [], average: 0, count: 0, lessons: { total: 0, completed: 0 } },
                all: { scores: [], average: 0, count: 0, lessons: { total: 0, completed: 0 } }
              };
            }
            
            // Calculate percentage score
            const percentageScore = Math.round((score / totalQuestions) * 100);
            
            // Add score to the appropriate subject
            if (progress[childId][category]) {
              progress[childId][category].scores.push(percentageScore);
              progress[childId][category].count++;
              progress[childId].all.scores.push(percentageScore);
              progress[childId].all.count++;
            }
          }
        });
      }
      
      // Try to get lesson completion data from AsyncStorage
      try {
        const lessonProgressJson = await AsyncStorage.getItem('lessonProgress');
        if (lessonProgressJson) {
          const lessonProgress = JSON.parse(lessonProgressJson);
          
          Object.entries(lessonProgress).forEach(([childId, subjectData]) => {
            if (progress[childId]) {
              Object.entries(subjectData).forEach(([subject, lessons]) => {
                if (progress[childId][subject]) {
                  progress[childId][subject].lessons = {
                    total: lessons.length || 0,
                    completed: lessons.filter(lesson => lesson.completed).length || 0
                  };
                }
              });
            }
          });
        }
      } catch (error) {
        console.log('Error getting lesson progress from AsyncStorage:', error);
      }
      
      // Calculate averages for each subject for each student
      Object.keys(progress).forEach(childId => {
        const childProgress = progress[childId];
        
        subjects.forEach(subject => {
          const subjectData = childProgress[subject.id];
          if (subjectData && subjectData.scores.length > 0) {
            const sum = subjectData.scores.reduce((acc, score) => acc + score, 0);
            subjectData.average = Math.round(sum / subjectData.scores.length);
          }
        });
      });
      
      // Cache the results
      try {
        await AsyncStorage.setItem(progressCacheKey, JSON.stringify(progress));
        await AsyncStorage.setItem(cacheExpiry, Date.now().toString());
      } catch (cacheError) {
        console.log('Error caching progress data:', cacheError);
      }
      
      setProgressData(progress);
    } catch (error) {
      console.error('Error loading progress data:', error);
      
      // Try to load from cache as fallback if online fetch fails
      try {
        const cachedProgress = await AsyncStorage.getItem('student_progress_cache');
        if (cachedProgress) {
          setProgressData(JSON.parse(cachedProgress));
        }
      } catch (cacheError) {
        console.log('Error reading cache:', cacheError);
      }
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 75) return '#2196F3'; // Blue
    if (score >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const renderSubjectTab = (subject) => (
    <TouchableOpacity
      key={subject.id}
      style={[
        styles.tab,
        selectedSubject === subject.id && { borderBottomColor: subject.color, borderBottomWidth: 3 }
      ]}
      onPress={() => setSelectedSubject(subject.id)}
    >
      <Text
        style={[
          styles.tabText,
          { color: selectedSubject === subject.id ? subject.color : currentTheme?.textSecondary || '#666' }
        ]}
      >
        {subject.name}
      </Text>
    </TouchableOpacity>
  );

  const renderStudentProgress = ({ item }) => {
    const student = item;
    const studentProgress = progressData[student.id];
    
    // If no progress data for this student, show minimal card
    if (!studentProgress) {
      return (
        <View style={[styles.studentCard, { 
          backgroundColor: currentTheme?.card || '#FFF',
          borderColor: currentTheme?.border || '#E0E0E0' 
        }]}>
          <View style={styles.studentHeader}>
            <View style={[styles.studentAvatar, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.studentInitial}>
                {student.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={[styles.studentName, { color: currentTheme?.text || '#333' }]}>
                {student.name}
              </Text>
              <Text style={[styles.studentDetail, { color: currentTheme?.textSecondary || '#666' }]}>
                Age: {student.age || 'N/A'} • Level: {student.level || 'N/A'}
              </Text>
              {student.parentName && (
                <Text style={[styles.studentDetail, { color: currentTheme?.textSecondary || '#666' }]}>
                  Parent: {student.parentName}
                </Text>
              )}
            </View>
          </View>
          <View style={[styles.noProgressContainer, { borderTopColor: currentTheme?.border || '#E0E0E0' }]}>
            <Text style={[styles.noProgressText, { color: currentTheme?.textSecondary || '#666' }]}>
              No progress data available
            </Text>
          </View>
        </View>
      );
    }
    
    // Get the subject data based on selected subject
    const subjectData = studentProgress[selectedSubject];
    
    // If no data for the selected subject, show no data message
    if (!subjectData || subjectData.count === 0) {
      return (
        <View style={[styles.studentCard, { 
          backgroundColor: currentTheme?.card || '#FFF',
          borderColor: currentTheme?.border || '#E0E0E0' 
        }]}>
          <View style={styles.studentHeader}>
            <View style={[styles.studentAvatar, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.studentInitial}>
                {student.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={[styles.studentName, { color: currentTheme?.text || '#333' }]}>
                {student.name}
              </Text>
              <Text style={[styles.studentDetail, { color: currentTheme?.textSecondary || '#666' }]}>
                Age: {student.age || 'N/A'} • Level: {student.level || 'N/A'}
              </Text>
              {student.parentName && (
                <Text style={[styles.studentDetail, { color: currentTheme?.textSecondary || '#666' }]}>
                  Parent: {student.parentName}
                </Text>
              )}
            </View>
          </View>
          <View style={[styles.noProgressContainer, { borderTopColor: currentTheme?.border || '#E0E0E0' }]}>
            <Text style={[styles.noProgressText, { color: currentTheme?.textSecondary || '#666' }]}>
              No {selectedSubject === 'all' ? '' : selectedSubject} data available
            </Text>
          </View>
        </View>
      );
    }
    
    // Show progress data
    return (
      <View style={[styles.studentCard, { 
        backgroundColor: currentTheme?.card || '#FFF',
        borderColor: currentTheme?.border || '#E0E0E0' 
      }]}>
        <View style={styles.studentHeader}>
          <View style={[styles.studentAvatar, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.studentInitial}>
              {student.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={[styles.studentName, { color: currentTheme?.text || '#333' }]}>
              {student.name}
            </Text>
            <Text style={[styles.studentDetail, { color: currentTheme?.textSecondary || '#666' }]}>
              Age: {student.age || 'N/A'} • Level: {student.level || 'N/A'}
            </Text>
          </View>
          <View style={[styles.scoreChip, { backgroundColor: getScoreColor(subjectData.average) }]}>
            <Text style={styles.scoreChipText}>{subjectData.average}%</Text>
          </View>
        </View>
        
        <View style={[styles.progressContainer, { borderTopColor: currentTheme?.border || '#E0E0E0' }]}>
          {/* Show progress for selected subject */}
          {selectedSubject === 'all' ? (
            // Show progress for all subjects
            <View style={styles.allSubjectsProgress}>
              {subjects.slice(1).map(subject => {
                const subProgress = studentProgress[subject.id];
                if (!subProgress || subProgress.count === 0) return null;
                
                return (
                  <View key={subject.id} style={styles.subjectProgressItem}>
                    <View style={styles.subjectProgressHeader}>
                      <Text style={[styles.subjectName, { color: currentTheme?.text || '#333' }]}>
                        {subject.name}
                      </Text>
                      <View style={[styles.miniScoreChip, { backgroundColor: getScoreColor(subProgress.average) }]}>
                        <Text style={styles.miniScoreText}>{subProgress.average}%</Text>
                      </View>
                    </View>
                    <View style={[styles.progressBarBackground, { 
                      backgroundColor: currentTheme?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' 
                    }]}>
                      <View 
                        style={[
                          styles.progressBar, 
                          { 
                            width: `${subProgress.average}%`, 
                            backgroundColor: subject.color 
                          }
                        ]} 
                      />
                    </View>
                    <View style={styles.progressFooter}>
                      <Text style={[styles.quizCount, { color: currentTheme?.textSecondary || '#666' }]}>
                        {subProgress.count} {subProgress.count === 1 ? 'quiz' : 'quizzes'}
                      </Text>
                      {subProgress.lessons && subProgress.lessons.total > 0 && (
                        <Text style={[styles.lessonProgress, { color: currentTheme?.textSecondary || '#666' }]}>
                          {subProgress.lessons.completed}/{subProgress.lessons.total} lessons completed
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            // Show detailed progress for the selected subject
            <View style={styles.subjectDetailProgress}>
              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <Text style={[styles.progressStatValue, { color: currentTheme?.text || '#333' }]}>
                    {subjectData.average}%
                  </Text>
                  <Text style={[styles.progressStatLabel, { color: currentTheme?.textSecondary || '#666' }]}>
                    Average Score
                  </Text>
                </View>
                <View style={styles.progressStat}>
                  <Text style={[styles.progressStatValue, { color: currentTheme?.text || '#333' }]}>
                    {subjectData.count}
                  </Text>
                  <Text style={[styles.progressStatLabel, { color: currentTheme?.textSecondary || '#666' }]}>
                    Quizzes Taken
                  </Text>
                </View>
                <View style={styles.progressStat}>
                  <Text style={[styles.progressStatValue, { color: currentTheme?.text || '#333' }]}>
                    {subjectData.scores.length > 0 ? Math.max(...subjectData.scores) : 0}%
                  </Text>
                  <Text style={[styles.progressStatLabel, { color: currentTheme?.textSecondary || '#666' }]}>
                    Highest Score
                  </Text>
                </View>
              </View>
              
              <View style={[styles.progressBarBackground, { 
                backgroundColor: currentTheme?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                marginTop: 12
              }]}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${subjectData.average}%`, 
                      backgroundColor: subjects.find(s => s.id === selectedSubject)?.color || '#2196F3'
                    }
                  ]} 
                />
              </View>
              
              {/* Lesson Progress Section */}
              {subjectData.lessons && subjectData.lessons.total > 0 && (
                <View style={styles.lessonProgressContainer}>
                  <Text style={[styles.lessonProgressTitle, { color: currentTheme?.text || '#333' }]}>
                    Lesson Progress
                  </Text>
                  <View style={styles.lessonProgressStats}>
                    <Text style={[styles.lessonProgressText, { color: currentTheme?.textSecondary || '#666' }]}>
                      {subjectData.lessons.completed} of {subjectData.lessons.total} lessons completed
                    </Text>
                    <Text style={[styles.lessonProgressPercentage, { color: currentTheme?.primary || '#2196F3' }]}>
                      {subjectData.lessons.total > 0 
                        ? Math.round((subjectData.lessons.completed / subjectData.lessons.total) * 100) 
                        : 0}%
                    </Text>
                  </View>
                  <View style={[styles.progressBarBackground, { 
                    backgroundColor: currentTheme?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  }]}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { 
                          width: `${subjectData.lessons.total > 0 
                            ? Math.round((subjectData.lessons.completed / subjectData.lessons.total) * 100) 
                            : 0}%`, 
                          backgroundColor: subjects.find(s => s.id === selectedSubject)?.color || '#2196F3'
                        }
                      ]} 
                    />
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  // Function to clear cache and force data reload
  const clearCache = async () => {
    try {
      await AsyncStorage.removeItem('student_progress_cache');
      await AsyncStorage.removeItem('student_progress_cache_timestamp');
      
      Alert.alert(
        "Cache Cleared", 
        "The cached data has been cleared. Loading fresh data...",
        [{ text: "OK" }]
      );
      
      // Reload data
      loadStudentsAndProgress();
    } catch (error) {
      console.error('Error clearing cache:', error);
      Alert.alert("Error", "Failed to clear cache");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme?.background || '#F5F5F5' }]}>
      <View style={[styles.header, { backgroundColor: currentTheme?.primary || '#2196F3' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Progress</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.clearButton} onPress={clearCache}>
            <Ionicons name="trash-outline" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} onPress={loadStudentsAndProgress}>
            <Ionicons name="refresh" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {subjects.map(subject => renderSubjectTab(subject))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme?.primary || '#2196F3'} />
          <Text style={[styles.loadingText, { color: currentTheme?.textSecondary || '#666' }]}>
            Loading student progress...
          </Text>
        </View>
      ) : students.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={48} color={currentTheme?.textSecondary || '#666'} />
          <Text style={[styles.emptyText, { color: currentTheme?.text || '#333' }]}>
            No students found
          </Text>
          <Text style={[styles.emptySubtext, { color: currentTheme?.textSecondary || '#666' }]}>
            There are no students available to track progress
          </Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={renderStudentProgress}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  backButton: {
    padding: 8,
  },
  refreshButton: {
    padding: 8,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  listContent: {
    padding: 16,
  },
  studentCard: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  studentInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentDetail: {
    fontSize: 12,
    marginTop: 2,
  },
  scoreChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  scoreChipText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  noProgressContainer: {
    padding: 16,
    borderTopWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noProgressText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  progressContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  allSubjectsProgress: {
    gap: 12,
  },
  subjectProgressItem: {
    marginBottom: 8,
  },
  subjectProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '600',
  },
  miniScoreChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  miniScoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  quizCount: {
    fontSize: 12,
    textAlign: 'right',
  },
  subjectDetailProgress: {
    
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressStatLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    padding: 8,
    marginRight: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  lessonProgress: {
    fontSize: 12,
    textAlign: 'right',
  },
  lessonProgressContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  lessonProgressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  lessonProgressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonProgressText: {
    fontSize: 14,
  },
  lessonProgressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 