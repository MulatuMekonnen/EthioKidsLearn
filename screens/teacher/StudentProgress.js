import React, { useState, useEffect, useCallback } from 'react';
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
import { useLanguage } from '../../context/LanguageContext';

export default function StudentProgress() {
  const navigation = useNavigation();
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const { translate } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [cachedDataShown, setCachedDataShown] = useState(false);

  const subjects = [
    { id: 'math', name: translate('subjects.math.title') || 'Math', color: '#2196F3' },
    { id: 'english', name: translate('subjects.english.title') || 'English', color: '#4CAF50' },
    { id: 'amharic', name: translate('subjects.አማርኛ.title') || 'Amharic', color: '#FF9800' },
    { id: 'oromo', name: translate('subjects.a/oromo.title') || 'Oromo', color: '#9C27B0' }
  ];

  useEffect(() => {
    // First try to load from cache for immediate display
    loadCachedProgressData();
    // Then load fresh data
    loadStudentsAndProgress();
  }, []);

  const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const loadCachedProgressData = async () => {
    try {
      const cachedProgress = await AsyncStorage.getItem('student_progress_cache');
      const cachedStudents = await AsyncStorage.getItem('student_list_cache');
      
      if (cachedProgress && cachedStudents) {
        const parsedProgress = JSON.parse(cachedProgress);
        const parsedStudents = JSON.parse(cachedStudents);
        
        console.log("Using cached data for immediate display while loading fresh data...");
        setProgressData(parsedProgress);
        setStudents(parsedStudents);
        setCachedDataShown(true);
      }
    } catch (error) {
      console.log('Error loading cached data:', error);
    }
  };

  const loadStudentsAndProgress = async () => {
    setRefreshing(true);
    try {
      // First load students
      const studentsData = await loadStudents();
      
      if (studentsData.length === 0) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      // Then load progress data for these students (in batches for better performance)
      await loadProgressData(studentsData);
      
      // After loading progress, filter out students without any real progress data
      const progressData = await AsyncStorage.getItem('student_progress_cache');
      if (progressData) {
        const parsedProgress = JSON.parse(progressData);
        
        // Check which students have actual progress data (non-zero count in any subject)
        const studentsWithProgress = studentsData.filter(student => {
          const studentProgress = parsedProgress[student.id];
          if (!studentProgress) return false;
          
          // Check if student has any real activity in any subject
          return Object.keys(studentProgress).some(subject => {
            if (subject === 'all') return false; // Skip 'all' category
            return studentProgress[subject].count > 0;
          });
        });
        
        // Update students list to only include those with progress
        setStudents(studentsWithProgress);
        
        // Cache the filtered student list
        await AsyncStorage.setItem('student_list_cache', JSON.stringify(studentsWithProgress));
      }
      setCachedDataShown(false);
    } catch (error) {
      console.error('Error loading student progress:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStudents = async () => {
    try {
      let childrenData = [];
      
      // Only load from Firebase - no local storage fallback for real data
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
      let dataSourceStats = {
        firebase: { reports: 0, quizResults: 0, lessonProgress: 0 },
        total: 0
      };
      
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
              console.log("Using cached progress data (less than 15 minutes old)");
              return; // Exit early if using cache
            }
          }
        }
      } catch (cacheError) {
        console.log('Error checking cache:', cacheError);
      }
      
      // Only continue if we need to refresh the data
      if (!shouldRefreshCache) return;
      
      console.log("Fetching fresh progress data for", studentsData.length, "students");
      
      // Get data from Firebase only
      if (user) {
        // Initialize progress structure for all students
        studentsData.forEach(student => {
          progress[student.id] = {
            math: { scores: [], average: 0, count: 0, lessons: { total: 0, completed: 0 } },
            english: { scores: [], average: 0, count: 0, lessons: { total: 0, completed: 0 } },
            amharic: { scores: [], average: 0, count: 0, lessons: { total: 0, completed: 0 } },
            oromo: { scores: [], average: 0, count: 0, lessons: { total: 0, completed: 0 } },
            all: { scores: [], average: 0, count: 0, lessons: { total: 0, completed: 0 } }
          };
        });
        
        // Process students in batches for better performance
        const BATCH_SIZE = 5; // Process 5 students at a time
        for (let i = 0; i < studentsData.length; i += BATCH_SIZE) {
          const batch = studentsData.slice(i, i + BATCH_SIZE);
          
          // Process batch in parallel
          await Promise.all(batch.map(async (student) => {
            try {
              const studentData = await fetchStudentProgress(student, progress, dataSourceStats);
              if (studentData) {
                // Merge the data from the async function
                Object.assign(progress[student.id], studentData);
              }
            } catch (studentError) {
              console.error(`Error processing student ${student.name}:`, studentError);
            }
          }));
        }
        
        // Try to load local data from AsyncStorage in one go
        try {
          const resultsJson = await AsyncStorage.getItem('quizResults');
          if (resultsJson) {
            const results = JSON.parse(resultsJson);
            
            // Process all local results for all students at once
            for (const result of results) {
              // Skip demo data or test data
              if (result.isDemo || result.isTest) continue;
              
              // Find if this result belongs to one of our students
              const studentId = result.childId;
              if (!progress[studentId]) continue;
              
              const { category, subject, score, totalQuestions } = result;
              
              // Determine the correct category
              let categoryToUse = category;
              
              // If no category but we have subject, use that
              if (!categoryToUse && subject) {
                categoryToUse = subject.toLowerCase();
              }
              
              // Map category names
              if (categoryToUse === "English Quiz") categoryToUse = "english";
              if (categoryToUse === "Math Quiz") categoryToUse = "math";
              if (categoryToUse === "Amharic Quiz") categoryToUse = "amharic";
              if (categoryToUse === "Oromo Quiz") categoryToUse = "oromo";
              if (categoryToUse === "Qubee") categoryToUse = "oromo";
              if (categoryToUse === "Lakkoofsa") categoryToUse = "math";
              if (categoryToUse === "ፊደላት") categoryToUse = "amharic";
              
              if (categoryToUse && progress[studentId][categoryToUse] && score !== undefined) {
                let percentageScore;
                
                // Calculate percentage score
                if (totalQuestions !== undefined && totalQuestions > 0) {
                  percentageScore = Math.round((score / totalQuestions) * 100);
                } else {
                  percentageScore = score;
                }
                
                // Ensure percentage is within reasonable bounds
                percentageScore = Math.min(100, Math.max(0, percentageScore));
                
                progress[studentId][categoryToUse].scores.push(percentageScore);
                progress[studentId][categoryToUse].count++;
                progress[studentId].all.scores.push(percentageScore);
                progress[studentId].all.count++;
              }
            }
          }
        } catch (localError) {
          console.log('Error loading local quiz results:', localError);
        }
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
      
      // Log data source statistics
      console.log("Progress data source statistics:", {
        firebase: {
          reports: dataSourceStats.firebase.reports,
          quizResults: dataSourceStats.firebase.quizResults,
          lessonProgress: dataSourceStats.firebase.lessonProgress,
          total: dataSourceStats.firebase.reports + dataSourceStats.firebase.quizResults + dataSourceStats.firebase.lessonProgress
        },
        total: dataSourceStats.total
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

  // Helper function to fetch progress for a single student
  const fetchStudentProgress = async (student, progressObj, statsObj) => {
    // Use a timeout to prevent queries from running too long
    const TIMEOUT_MS = 4000;
    
    try {
      // Try to fetch subcollection data with timeout protection
      const fetchWithTimeout = async (promise) => {
        let timer;
        try {
          const result = await Promise.race([
            promise,
            new Promise((_, reject) => {
              timer = setTimeout(() => reject(new Error('Query timeout')), TIMEOUT_MS);
            })
          ]);
          return result;
        } catch (error) {
          console.log(`Timeout or error fetching data for ${student.name}: ${error.message}`);
          return null;
        } finally {
          if (timer) clearTimeout(timer);
        }
      };
      
      // Define fetch functions that handle their own errors
      const fetchReports = async () => {
        try {
          const studentReportsQuery = query(
            collection(db, 'reports'),
            where('childId', '==', student.id),
            orderBy('timestamp', 'desc'),
            limit(15) // Reduced for better performance
          );
          
          const snapshot = await getDocs(studentReportsQuery);
          return snapshot;
        } catch (error) {
          if (error.code === 'permission-denied') {
            console.log('Permission denied for reports');
          }
          return null;
        }
      };
      
      const fetchQuizResults = async () => {
        try {
          const quizResultsQuery = query(
            collection(db, 'quiz_results'),
            where('childId', '==', student.id),
            orderBy('timestamp', 'desc'),
            limit(15) // Reduced for better performance
          );
          
          const snapshot = await getDocs(quizResultsQuery);
          return snapshot;
        } catch (error) {
          if (error.code === 'permission-denied') {
            console.log('Permission denied for quiz results');
          }
          return null;
        }
      };
      
      const fetchLessonProgress = async () => {
        try {
          const lessonProgressQuery = query(
            collection(db, 'lesson_progress'),
            where('childId', '==', student.id),
            limit(20) // Reduced for better performance
          );
          
          const snapshot = await getDocs(lessonProgressQuery);
          return snapshot;
        } catch (error) {
          if (error.code === 'permission-denied') {
            console.log('Permission denied for lesson progress');
          }
          return null;
        }
      };
      
      // Run queries in parallel with timeout protection
      const [reportsData, quizResultsData, lessonProgressData] = await Promise.all([
        fetchWithTimeout(fetchReports()),
        fetchWithTimeout(fetchQuizResults()),
        fetchWithTimeout(fetchLessonProgress())
      ]);
      
      // Only process data if we got something back
      if (reportsData && !reportsData.empty) {
        reportsData.forEach(doc => {
          const reportData = doc.data();
          const { quizType, score } = reportData;
          
          // Skip any demo data or test data
          if (reportData.isDemo || reportData.isTest) return;
          
          // Add score to the appropriate subject
          if (score !== null && score !== undefined && quizType) {
            if (progressObj[student.id][quizType]) {
              progressObj[student.id][quizType].scores.push(score);
              progressObj[student.id][quizType].count++;
              progressObj[student.id].all.scores.push(score);
              progressObj[student.id].all.count++;
              statsObj.firebase.reports++;
              statsObj.total++;
            }
          }
        });
      }
      
      // Process quiz results data
      if (quizResultsData && !quizResultsData.empty) {
        quizResultsData.forEach(doc => {
          const quizData = doc.data();
          const { category, score, totalQuestions, subject } = quizData;
          
          // Skip demo data or test data
          if (quizData.isDemo || quizData.isTest) return;
          
          // Determine the correct category
          let categoryToUse = category;
          
          // If no category but we have subject, use that
          if (!categoryToUse && subject) {
            categoryToUse = subject.toLowerCase();
          }
          
          // Map "English Quiz" to "english", etc.
          if (categoryToUse === "English Quiz") categoryToUse = "english";
          if (categoryToUse === "Math Quiz") categoryToUse = "math";
          if (categoryToUse === "Amharic Quiz") categoryToUse = "amharic";
          if (categoryToUse === "Oromo Quiz") categoryToUse = "oromo";
          
          if (categoryToUse && score !== undefined) {
            let percentageScore;
            
            // Calculate percentage score based on available data
            if (totalQuestions !== undefined && totalQuestions > 0) {
              percentageScore = Math.round((score / totalQuestions) * 100);
            } else if (quizData.percentage) {
              percentageScore = quizData.percentage;
            } else {
              // Assume score is already a percentage if no totalQuestions
              percentageScore = score;
            }
            
            // Ensure percentage is within reasonable bounds
            percentageScore = Math.min(100, Math.max(0, percentageScore));
            
            if (progressObj[student.id][categoryToUse]) {
              progressObj[student.id][categoryToUse].scores.push(percentageScore);
              progressObj[student.id][categoryToUse].count++;
              progressObj[student.id].all.scores.push(percentageScore);
              progressObj[student.id].all.count++;
              statsObj.firebase.quizResults++;
              statsObj.total++;
            }
          }
        });
      }
      
      // Process lesson progress data
      if (lessonProgressData && !lessonProgressData.empty) {
        // Group lesson progress by subject
        const lessonsBySubject = {
          math: { total: 0, completed: 0 },
          english: { total: 0, completed: 0 },
          amharic: { total: 0, completed: 0 },
          oromo: { total: 0, completed: 0 },
          all: { total: 0, completed: 0 }
        };
        
        lessonProgressData.forEach(doc => {
          const lessonData = doc.data();
          const { subject, isCompleted, lessonId } = lessonData;
          
          // Skip demo data or test data
          if (lessonData.isDemo || lessonData.isTest) return;
          
          // Normalize subject name
          let subjectToUse = subject ? subject.toLowerCase() : null;
          
          // Map subject names if needed
          if (subjectToUse === "mathematics") subjectToUse = "math";
          if (subjectToUse === "english language") subjectToUse = "english";
          
          if (subjectToUse && lessonsBySubject[subjectToUse]) {
            lessonsBySubject[subjectToUse].total++;
            lessonsBySubject.all.total++;
            statsObj.firebase.lessonProgress++;
            
            if (isCompleted) {
              lessonsBySubject[subjectToUse].completed++;
              lessonsBySubject.all.completed++;
            }
          }
        });
        
        // Add lesson data to progress object
        Object.keys(lessonsBySubject).forEach(subject => {
          if (progressObj[student.id][subject]) {
            progressObj[student.id][subject].lessons = lessonsBySubject[subject];
          }
        });
      }
      
      // No need to return anything since we're modifying the passed objects directly
      return null;
    } catch (error) {
      console.error(`Error fetching progress for student ${student.name}:`, error);
      return null;
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

  // Update the renderStudentProgress function to remove data generation and demo indicators
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
                {translate('teacher.studentAge')}: {student.age || 'N/A'} • {translate('teacher.studentLevel')}: {student.level ? translate(`teacher.levels.${student.level.toLowerCase()}`) || student.level : 'N/A'}
              </Text>
              {student.parentName && (
                <Text style={[styles.studentDetail, { color: currentTheme?.textSecondary || '#666' }]}>
                  {translate('teacher.parent')}: {student.parentName}
                </Text>
              )}
            </View>
          </View>
          <View style={[styles.noProgressContainer, { borderTopColor: currentTheme?.border || '#E0E0E0' }]}>
            <Text style={[styles.noProgressText, { color: currentTheme?.textSecondary || '#666' }]}>
              {translate('progressReport.noData') || 'No progress data available'}
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
                {translate('teacher.studentAge')}: {student.age || 'N/A'} • {translate('teacher.studentLevel')}: {student.level ? translate(`teacher.levels.${student.level.toLowerCase()}`) || student.level : 'N/A'}
              </Text>
              {student.parentName && (
                <Text style={[styles.studentDetail, { color: currentTheme?.textSecondary || '#666' }]}>
                  {translate('teacher.parent')}: {student.parentName}
                </Text>
              )}
            </View>
          </View>
          <View style={[styles.noProgressContainer, { borderTopColor: currentTheme?.border || '#E0E0E0' }]}>
            <Text style={[styles.noProgressText, { color: currentTheme?.textSecondary || '#666' }]}>
              {translate('progressReport.noData') || `No ${selectedSubject === 'all' ? '' : selectedSubject} data available`}
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
              {translate('teacher.studentAge')}: {student.age || 'N/A'} • {translate('teacher.studentLevel')}: {student.level ? translate(`teacher.levels.${student.level.toLowerCase()}`) || student.level : 'N/A'}
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
              {subjects.filter(subject => {
                const subProgress = studentProgress[subject.id];
                return subProgress && subProgress.count > 0;
              }).map(subject => {
                const subProgress = studentProgress[subject.id];
                
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
        "The cached data has been cleared. Loading fresh data from Firebase...",
        [{ text: "OK" }]
      );
      
      // Reload data
      loadStudentsAndProgress();
    } catch (error) {
      console.error('Error clearing cache:', error);
      Alert.alert("Error", "Failed to clear cache");
    }
  };

  // Create a debounced refresh function
  const debouncedRefresh = useCallback(
    debounce(() => {
      loadStudentsAndProgress();
    }, 300),
    []
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme?.background || '#F5F5F5' }]}>
      <View style={[styles.header, { backgroundColor: currentTheme?.primary || '#2196F3' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translate('teacher.studentprogress') || 'Student Progress'}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.clearButton} onPress={clearCache}>
            <Ionicons name="trash-outline" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={debouncedRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="refresh" size={24} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {cachedDataShown && !loading && (
        <View style={styles.cachedDataBanner}>
          <Ionicons name="time-outline" size={16} color="#555" />
          <Text style={styles.cachedDataText}>
            Showing cached data. Loading fresh data...
          </Text>
        </View>
      )}

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
            {translate('progressReport.loading') || 'Loading student progress...'}
          </Text>
        </View>
      ) : students.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={48} color={currentTheme?.textSecondary || '#666'} />
          <Text style={[styles.emptyText, { color: currentTheme?.text || '#333' }]}>
            {translate('progressReport.noChildData') || 'No student progress found'}
          </Text>
          <Text style={[styles.emptySubtext, { color: currentTheme?.textSecondary || '#666' }]}>
            {translate('progressReport.progressHelp') || 'Students who have completed quizzes or lessons will appear here. Demo or test data is filtered out.'}
          </Text>
          <TouchableOpacity 
            style={[styles.emptyRefreshButton, { 
              backgroundColor: currentTheme?.primary || '#2196F3',
              marginTop: 16
            }]}
            onPress={loadStudentsAndProgress}
          >
            <Ionicons name="refresh" size={20} color="#FFF" style={{marginRight: 8}} />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
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
  refreshButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  emptyRefreshButton: {
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cachedDataBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  cachedDataText: {
    fontSize: 14,
    marginLeft: 8,
  },
}); 