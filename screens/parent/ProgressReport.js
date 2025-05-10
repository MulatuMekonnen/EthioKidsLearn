import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// Subject categories with colors
const subjects = [
  { id: 'math', name: 'Math', color: '#4285F4' },
  { id: 'english', name: 'English', color: '#EA4335' },
  { id: 'amharic', name: 'Amharic', color: '#FBBC05' },
  { id: 'oromo', name: 'Oromo', color: '#34A853' },
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ProgressReport() {
  const navigation = useNavigation();
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [loading, setLoading] = useState(true);
  const [childData, setChildData] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [processedData, setProcessedData] = useState({
    categories: {},
    timeSpent: {},
    weeklyActivity: Array(7).fill(0),
    childProgress: {}
  });
  const [teacherReports, setTeacherReports] = useState({});

  // Get the current week's start date (Sunday)
  const getWeekStartDate = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const diff = now.getDate() - dayOfWeek;
    return new Date(now.setDate(diff));
  };

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    loadData();
  }, []);

  // Generate test data for display
  const generateTestData = (children) => {
    console.log("Generating test data for", children.length, "children");
    const testResults = [];
    const now = new Date();
    
    children.forEach(child => {
      // Generate math quiz results
      for (let i = 0; i < 5; i++) {
        const dayOffset = Math.floor(Math.random() * 14); // Last 2 weeks
        const date = new Date();
        date.setDate(now.getDate() - dayOffset);
        
        testResults.push({
          childId: child.id,
          childName: child.name,
          category: 'math',
          score: Math.floor(Math.random() * 7) + 4, // 4-10 score
          totalQuestions: 10,
          timestamp: date.toISOString(),
          timeSpentMinutes: Math.floor(Math.random() * 15) + 10, // 10-25 min
          isDemo: true // Mark as demo data
        });
      }
      
      // Generate english results
      for (let i = 0; i < 4; i++) {
        const dayOffset = Math.floor(Math.random() * 14);
        const date = new Date();
        date.setDate(now.getDate() - dayOffset);
        
        testResults.push({
          childId: child.id,
          childName: child.name,
          category: 'english',
          score: Math.floor(Math.random() * 7) + 4,
          totalQuestions: 10,
          timestamp: date.toISOString(),
          timeSpentMinutes: Math.floor(Math.random() * 15) + 10,
          isDemo: true // Mark as demo data
        });
      }
      
      // Generate amharic results
      for (let i = 0; i < 3; i++) {
        const dayOffset = Math.floor(Math.random() * 14);
        const date = new Date();
        date.setDate(now.getDate() - dayOffset);
        
        testResults.push({
          childId: child.id,
          childName: child.name,
          category: 'amharic',
          score: Math.floor(Math.random() * 7) + 4,
          totalQuestions: 10,
          timestamp: date.toISOString(),
          timeSpentMinutes: Math.floor(Math.random() * 15) + 10,
          isDemo: true // Mark as demo data
        });
      }
      
      // Generate oromo results
      for (let i = 0; i < 2; i++) {
        const dayOffset = Math.floor(Math.random() * 14);
        const date = new Date();
        date.setDate(now.getDate() - dayOffset);
        
        testResults.push({
          childId: child.id,
          childName: child.name,
          category: 'oromo',
          score: Math.floor(Math.random() * 7) + 4,
          totalQuestions: 10,
          timestamp: date.toISOString(),
          timeSpentMinutes: Math.floor(Math.random() * 15) + 10,
          isDemo: true // Mark as demo data
        });
      }
    });
    
    return testResults;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // First load the children
      const childrenJson = await AsyncStorage.getItem('children');
      let children = childrenJson ? JSON.parse(childrenJson) : [];
      
      // Filter for current parent's children if a user is logged in
      const filteredChildren = user 
        ? children.filter(child => !child.parentId || child.parentId === user.uid)
        : children;
      
      setChildData(filteredChildren);
      
      // Then load quiz results
      let resultsJson = await AsyncStorage.getItem('quizResults');
      let results = resultsJson ? JSON.parse(resultsJson) : [];
      
      // Filter quiz results for only the children of this parent
        if (filteredChildren.length > 0) {
        const childIds = filteredChildren.map(child => child.id);
        
        // Filter results to only include this parent's children
        const childResults = results.filter(result => childIds.includes(result.childId));
        
        // Separate real quiz results from demo data
        const realResults = childResults.filter(result => !result.isDemo);
        
        // If we have real results, use them; otherwise generate demo data
        if (realResults.length > 0) {
          console.log("Using real quiz data, found", realResults.length, "results");
          results = realResults;
        } else {
          // Only generate demo data if we have no real quiz results for these children
          console.log("No real quiz results found for these children, generating test data");
          const demoResults = generateTestData(filteredChildren);
          
          // Save the generated data
          await AsyncStorage.setItem('quizResults', JSON.stringify([...results, ...demoResults]));
          
          // Use the newly generated demo data
          results = demoResults;
          
          Alert.alert("Demo Data", "Sample quiz data has been generated for demonstration purposes.");
        }
      }
      
      setQuizResults(results);
      
      // Load teacher reports
      await loadTeacherReports(filteredChildren);
      
      // Now process all the data
      processResultsData(results, filteredChildren);
    } catch (error) {
      console.error('Error loading progress data:', error);
      Alert.alert("Error", "Failed to load progress data.");
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherReports = async (children) => {
    if (!children || children.length === 0) return;
    
    try {
      // First check if we have cached reports
      const cachedReportsJson = await AsyncStorage.getItem('teacherReports');
      let cachedReports = cachedReportsJson ? JSON.parse(cachedReportsJson) : null;
      
      if (cachedReports && Object.keys(cachedReports).length > 0) {
        console.log("Using cached teacher reports");
        setTeacherReports(cachedReports);
        return;
      }
      
      // If no cached reports or they're expired, fetch from Firebase
      console.log("Fetching teacher reports from Firebase");
      
      if (!user) {
        console.log("No authenticated user, skipping Firebase fetch");
        return;
      }
      
      const childIds = children.map(child => child.id);
      
      // Initialize reports structure
      const reports = {};
      subjects.forEach(subject => {
        reports[subject.id] = {};
        childIds.forEach(childId => {
          reports[subject.id][childId] = [];
        });
      });
      
      // Fetch reports from Firebase
      // First try to get reports directly connected to the parent
      const parentReportsQuery = query(
        collection(db, 'reports'),
        where('parentId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      
      const parentReportsSnapshot = await getDocs(parentReportsQuery);
      
      if (!parentReportsSnapshot.empty) {
        parentReportsSnapshot.forEach(doc => {
          const reportData = doc.data();
          const { childId, quizType, report, score, timestamp } = reportData;
          
          // Make sure this is a child of this parent
          if (childIds.includes(childId) && subjects.some(s => s.id === quizType)) {
            if (!reports[quizType][childId]) {
              reports[quizType][childId] = [];
            }
            
            reports[quizType][childId].push({
              id: doc.id,
              childId,
              subject: quizType,
              report,
              score,
              timestamp: timestamp ? timestamp.toDate().toISOString() : new Date().toISOString()
            });
          }
        });
      } else {
        // If no direct parent reports, try fetching by childIds
        for (const childId of childIds) {
          const childReportsQuery = query(
            collection(db, 'reports'),
            where('childId', '==', childId),
            orderBy('timestamp', 'desc')
          );
          
          const childReportsSnapshot = await getDocs(childReportsQuery);
          
          if (!childReportsSnapshot.empty) {
            childReportsSnapshot.forEach(doc => {
              const reportData = doc.data();
              const { quizType, report, score, timestamp } = reportData;
              
              // Make sure it's a subject we recognize
              if (subjects.some(s => s.id === quizType)) {
                if (!reports[quizType][childId]) {
                  reports[quizType][childId] = [];
                }
                
                reports[quizType][childId].push({
                  id: doc.id,
                  childId,
                  subject: quizType,
                  report,
                  score,
                  timestamp: timestamp ? timestamp.toDate().toISOString() : new Date().toISOString()
                });
              }
            });
          }
        }
      }
      
      // Save reports to state and cache them
      setTeacherReports(reports);
      await AsyncStorage.setItem('teacherReports', JSON.stringify(reports));
      
    } catch (error) {
      console.error('Error loading teacher reports:', error);
    }
  };

  const processResultsData = (results, children) => {
    // Initialize data structure
    const processed = {
      categories: {},
      timeSpent: {},
      weeklyActivity: Array(7).fill(0),
      childProgress: {}
    };
    
    // Initialize categories for each subject
    subjects.forEach(subject => {
      processed.categories[subject.id] = [];
      processed.timeSpent[subject.id] = 0;
    });
    
    // Initialize child progress
    children.forEach(child => {
      processed.childProgress[child.id] = {
        name: child.name,
        scores: subjects.reduce((acc, subject) => {
          acc[subject.id] = [];
          return acc;
        }, {}),
        averageScore: 0,
        completedQuizzes: 0
      };
    });
    
    // Current week's start date
    const weekStart = getWeekStartDate();
    
    // Process all results
    results.forEach(result => {
      const { category, childId, score, totalQuestions, timestamp, timeSpentMinutes } = result;
      
      // Skip if no category or not matching our known subjects
      if (!category || !subjects.some(s => s.id === category)) return;
      
      // Add to category data
      const scorePercentage = Math.round((score / totalQuestions) * 100);
      processed.categories[category].push({
        score: scorePercentage,
        timestamp
      });
      
      // Add time spent
      if (timeSpentMinutes) {
        processed.timeSpent[category] += timeSpentMinutes;
      }
      
      // Add to weekly activity
      if (timestamp) {
        const resultDate = new Date(timestamp);
        const daysSinceWeekStart = Math.floor((resultDate - weekStart) / (24 * 60 * 60 * 1000));
        
        // Only count if it's in the current week (0-6 days since week start)
        if (daysSinceWeekStart >= 0 && daysSinceWeekStart < 7) {
          processed.weeklyActivity[daysSinceWeekStart] += timeSpentMinutes || 10; // Default 10 min if not specified
        }
      }
      
      // Add to child progress
      if (childId && processed.childProgress[childId]) {
        processed.childProgress[childId].scores[category].push(scorePercentage);
        processed.childProgress[childId].completedQuizzes++;
      }
    });
    
    // Calculate average scores for each child
    Object.keys(processed.childProgress).forEach(childId => {
      const child = processed.childProgress[childId];
      let totalScore = 0;
      let totalQuizzes = 0;
      
      Object.values(child.scores).forEach(scores => {
        if (scores.length > 0) {
          totalScore += scores.reduce((sum, score) => sum + score, 0);
          totalQuizzes += scores.length;
        }
      });
      
      child.averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
    });
    
    // Sort results by timestamp
    Object.keys(processed.categories).forEach(category => {
      processed.categories[category].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });
    
    setProcessedData(processed);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 75) return '#2196F3'; // Blue
    if (score >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getSubjectColor = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.color : '#CCCCCC';
  };

  const getAverageScore = (scores) => {
    if (!scores.length) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  const getCategoryScores = () => {
    return processedData.categories[selectedSubject] || [];
  };

  const getTimeSpent = () => {
    return processedData.timeSpent[selectedSubject] || 0;
  };

  const getCompletedLessons = () => {
    return (processedData.categories[selectedSubject] || []).length;
  };

  const renderSubjectTab = (subject) => {
    const isSelected = selectedSubject === subject.id;
    return (
      <TouchableOpacity
        key={subject.id}
        style={[
          styles.subjectTab,
          {
            backgroundColor: isSelected ? subject.color : currentTheme?.card || '#ffffff',
            borderColor: currentTheme?.border || '#e0e0e0',
          },
        ]}
        onPress={() => setSelectedSubject(subject.id)}
      >
        <Text
          style={[
            styles.subjectTabText,
            { color: isSelected ? '#fff' : currentTheme?.text || '#333333' },
          ]}
        >
          {subject.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderScoreBar = (scoreData, index, maxScore = 100) => {
    const score = scoreData.score;
    const date = new Date(scoreData.timestamp).toLocaleDateString();
    const percentage = (score / maxScore) * 100;
    
    return (
      <View style={styles.scoreBarContainer} key={index}>
        <Text style={[styles.scoreLabel, { color: currentTheme?.text || '#333' }]}>
          Test {index + 1} - {date}
        </Text>
        <View style={[styles.scoreBarBackground, { 
          backgroundColor: currentTheme?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }]}>
          <View
            style={[
              styles.scoreBar,
              {
                width: `${percentage}%`,
                backgroundColor: getScoreColor(score),
              },
            ]}
          />
        </View>
        <Text style={[styles.scoreValue, { color: currentTheme?.text || '#333' }]}>
          {score}%
        </Text>
      </View>
    );
  };

  const renderWeeklyActivity = () => {
    const maxActivity = Math.max(...processedData.weeklyActivity, 10); // Ensure there's always a visible bar
    
    return (
      <View style={styles.weeklyActivityContainer}>
        {processedData.weeklyActivity.map((activity, index) => {
          const height = (activity / maxActivity) * 100;
          return (
            <View style={styles.activityDayContainer} key={index}>
              <View style={[styles.activityBarContainer, { backgroundColor: currentTheme?.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                <View
                  style={[
                    styles.activityBar,
                    {
                      height: `${height}%`,
                      backgroundColor: currentTheme?.primary || '#2196F3',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.activityDayLabel, { color: currentTheme?.text || '#333' }]}>
                {weekDays[index]}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderSubjectDistribution = () => {
    // Calculate total quiz count for each subject
    const subjectCounts = subjects.map(subject => ({
      name: subject.name,
      count: (processedData.categories[subject.id] || []).length,
      color: subject.color,
      legendFontColor: currentTheme?.text || '#333',
    }));
    
    // Filter out subjects with no quizzes
    const filteredCounts = subjectCounts.filter(subject => subject.count > 0);
    
    // If no data, show a message
    if (filteredCounts.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={[styles.noDataText, { color: currentTheme?.textSecondary || '#999' }]}>
            No quiz data available
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.subjectDistributionContainer}>
        {filteredCounts.map((subject, index) => (
          <View key={index} style={styles.subjectDistributionItem}>
            <View style={[styles.subjectDistributionBar, { 
              backgroundColor: subject.color,
              minWidth: 80, // Ensure the bar is wide enough to show text
              paddingHorizontal: 8, // Add padding for text
              paddingVertical: 4 // Add padding for text
            }]}>
              <Text style={[styles.subjectDistributionText, { 
                color: 'white', // Always use white text on colored background
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }]}>
                {subject.name}
              </Text>
            </View>
            <Text style={[styles.subjectDistributionValue, { color: currentTheme?.text || '#333' }]}>
              {subject.count}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderChildProgress = () => {
    const children = Object.values(processedData.childProgress || {});
    
    if (children.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={[styles.noDataText, { color: currentTheme?.textSecondary || '#999' }]}>
            No child data available
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.childProgressContainer}>
        {children.map((child, index) => {
          // Only show children with some quiz activity
          if (child.completedQuizzes === 0) return null;
          
          // Get subject scores that have data
          const subjectScores = subjects
            .filter(subject => (child.scores[subject.id] || []).length > 0)
            .map(subject => ({
              ...subject,
              avgScore: getAverageScore(child.scores[subject.id] || [])
            }));
          
          return (
            <View 
              key={index} 
              style={[styles.childCard, { 
                backgroundColor: currentTheme?.card || '#fff', 
                borderColor: currentTheme?.border || '#e0e0e0',
                shadowColor: currentTheme?.mode === 'dark' ? '#000' : '#000',
                shadowOpacity: currentTheme?.mode === 'dark' ? 0.2 : 0.1,
              }]}
            >
              <View style={styles.childHeader}>
                <View style={[styles.childAvatar, { backgroundColor: getSubjectColor(selectedSubject) }]}>
                  <Text style={styles.childAvatarText}>{child.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.childInfo}>
                  <Text style={[styles.childName, { color: currentTheme?.text || '#333' }]}>{child.name}</Text>
                  <Text style={[styles.childStats, { color: currentTheme?.textSecondary || '#999' }]}>
                    Completed: {child.completedQuizzes} quizzes
                  </Text>
                </View>
                <View style={[styles.averageScoreBadge, { backgroundColor: getScoreColor(child.averageScore) }]}>
                  <Text style={styles.averageScoreText}>{child.averageScore}%</Text>
                </View>
              </View>
              
              {/* Show subject scores for this child */}
              <View style={styles.childSubjectScores}>
                {subjectScores.map(subject => (
                  <View key={subject.id} style={styles.subjectScoreItem}>
                    <Text style={[styles.subjectScoreName, { color: currentTheme?.text || '#333' }]}>
                      {subject.name}
                    </Text>
                    <View style={[styles.subjectScoreBarContainer, {
                      backgroundColor: currentTheme?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }]}>
                      <View 
                        style={[
                          styles.subjectScoreBar,
                          { width: `${subject.avgScore}%`, backgroundColor: subject.color }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.subjectScoreValue, { color: currentTheme?.text || '#333' }]}>
                      {subject.avgScore}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // Add a new render function for teacher reports
  const renderTeacherReports = () => {
    const childReports = teacherReports[selectedSubject] || {};
    const hasAnyReports = Object.values(childReports).some(reports => reports && reports.length > 0);
    
    if (!hasAnyReports) {
      return (
        <View style={[styles.emptyReportsContainer, { backgroundColor: currentTheme?.cardAlt || '#f5f5f5' }]}>
          <Text style={[styles.emptyReportsText, { color: currentTheme?.textSecondary || '#666' }]}>
            No teacher reports available for this subject
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.teacherReportsContainer}>
        {Object.entries(childReports).map(([childId, reports]) => {
          if (!reports || reports.length === 0) return null;
          
          // Find child name
          const child = childData.find(c => c.id === childId);
          if (!child) return null;
          
          return (
            <View key={childId} style={[styles.childReportCard, { 
              backgroundColor: currentTheme?.cardAlt || '#f9f9f9',
              borderColor: currentTheme?.border || '#e0e0e0'
            }]}>
              <Text style={[styles.childReportName, { color: currentTheme?.text || '#333' }]}>
                {child.name}
              </Text>
              
              {reports.map((report, idx) => (
                <View key={report.id || idx} style={styles.reportEntry}>
                  <View style={styles.reportHeader}>
                    <Text style={[styles.reportDate, { color: currentTheme?.textSecondary || '#666' }]}>
                      {report.timestamp ? new Date(report.timestamp).toLocaleDateString() : 'No date'}
                    </Text>
                    {report.score && (
                      <View style={[styles.scoreChip, { backgroundColor: getScoreColor(report.score) }]}>
                        <Text style={styles.scoreText}>{report.score}%</Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={[styles.reportText, { color: currentTheme?.text || '#333' }]}>
                    {report.report || 'No details provided'}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  };

  // Get scores for the selected subject
  const scores = getCategoryScores();
  const averageScore = scores.length > 0 
    ? getAverageScore(scores.map(s => s.score)) 
    : 0;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme?.background || '#f5f5f5' }]}>
        <View style={[styles.header, { backgroundColor: currentTheme?.primary || '#2196F3' }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Progress Report</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme?.primary || '#2196F3'} />
          <Text style={[styles.loadingText, { color: currentTheme?.text || '#333' }]}>Loading data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme?.background || '#f5f5f5' }]}>
      <View style={[styles.header, { backgroundColor: currentTheme?.primary || '#2196F3' }]}>
      <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
      >
          <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress Report</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={async () => {
            setLoading(true);
            try {
              // Reload real data
              await loadData();
            } finally {
              setLoading(false);
            }
          }}
        >
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.subjectTabsContainer}>
          {subjects.map(subject => renderSubjectTab(subject))}
        </View>

        <View style={[styles.section, { backgroundColor: currentTheme?.card || '#fff', borderColor: currentTheme?.border || '#e0e0e0' }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme?.text || '#333' }]}>Teacher Reports</Text>
          <Text style={[styles.sectionSubtitle, { color: currentTheme?.textSecondary || '#666' }]}>
            Feedback from teachers for {subjects.find(s => s.id === selectedSubject)?.name}
          </Text>
          {renderTeacherReports()}
        </View>

        <View style={[styles.section, { backgroundColor: currentTheme?.card || '#fff', borderColor: currentTheme?.border || '#e0e0e0' }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme?.text || '#333' }]}>Overview</Text>
          
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: currentTheme?.background || '#f5f5f5', borderColor: currentTheme?.border || '#e0e0e0' }]}>
              <Ionicons name="time-outline" size={24} color={getSubjectColor(selectedSubject)} />
              <Text style={[styles.statValue, { color: currentTheme?.text || '#333' }]}>{getTimeSpent()}</Text>
              <Text style={[styles.statLabel, { color: currentTheme?.text || '#333' }]}>Minutes</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: currentTheme?.background || '#f5f5f5', borderColor: currentTheme?.border || '#e0e0e0' }]}>
              <Ionicons name="book-outline" size={24} color={getSubjectColor(selectedSubject)} />
              <Text style={[styles.statValue, { color: currentTheme?.text || '#333' }]}>{getCompletedLessons()}</Text>
              <Text style={[styles.statLabel, { color: currentTheme?.text || '#333' }]}>Quizzes</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: currentTheme?.background || '#f5f5f5', borderColor: currentTheme?.border || '#e0e0e0' }]}>
              <Ionicons name="star-outline" size={24} color={getSubjectColor(selectedSubject)} />
              <Text style={[styles.statValue, { color: currentTheme?.text || '#333' }]}>{averageScore}%</Text>
              <Text style={[styles.statLabel, { color: currentTheme?.text || '#333' }]}>Average</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: currentTheme?.card || '#fff', borderColor: currentTheme?.border || '#e0e0e0' }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme?.text || '#333' }]}>Test Scores</Text>
          {scores.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Text style={[styles.noDataText, { color: currentTheme?.textSecondary || '#999' }]}>
                No test scores available for {subjects.find(s => s.id === selectedSubject)?.name}
              </Text>
            </View>
          ) : (
            scores.map((score, index) => renderScoreBar(score, index))
          )}
        </View>

        <View style={[styles.section, { backgroundColor: currentTheme?.card || '#fff', borderColor: currentTheme?.border || '#e0e0e0' }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme?.text || '#333' }]}>Subject Distribution</Text>
          <Text style={[styles.sectionSubtitle, { color: currentTheme?.text || '#333' }]}>Quiz completion by subject</Text>
          {renderSubjectDistribution()}
        </View>

        <View style={[styles.section, { backgroundColor: currentTheme?.card || '#fff', borderColor: currentTheme?.border || '#e0e0e0' }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme?.text || '#333' }]}>Weekly Activity</Text>
          <Text style={[styles.sectionSubtitle, { color: currentTheme?.text || '#333' }]}>Minutes spent learning</Text>
          {renderWeeklyActivity()}
        </View>

        <View style={[styles.section, { backgroundColor: currentTheme?.card || '#fff', borderColor: currentTheme?.border || '#e0e0e0' }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme?.text || '#333' }]}>Child Progress</Text>
          <Text style={[styles.sectionSubtitle, { color: currentTheme?.text || '#333' }]}>Performance by child</Text>
          {renderChildProgress()}
        </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const screenWidth = Dimensions.get('window').width;

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
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  subjectTabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  subjectTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  subjectTabText: {
    fontWeight: 'bold',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '30%',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  scoreBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreLabel: {
    width: 100,
    fontSize: 14,
  },
  scoreBarBackground: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 8,
  },
  scoreValue: {
    width: 40,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  weeklyActivityContainer: {
    flexDirection: 'row',
    height: 200,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 20,
  },
  activityDayContainer: {
    flex: 1,
    alignItems: 'center',
  },
  activityBarContainer: {
    width: 20,
    height: 150,
    justifyContent: 'flex-end',
  },
  activityBar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  activityDayLabel: {
    marginTop: 8,
    fontSize: 12,
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
  },
  childProgressContainer: {
    marginTop: 8,
  },
  childCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  childInfo: {
    flex: 1,
    marginLeft: 12,
  },
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  childStats: {
    fontSize: 12,
  },
  averageScoreBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  averageScoreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  childSubjectScores: {
    marginTop: 8,
  },
  subjectScoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectScoreName: {
    width: 70,
    fontSize: 14,
  },
  subjectScoreBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  subjectScoreBar: {
    height: '100%',
    borderRadius: 6,
  },
  subjectScoreValue: {
    width: 40,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  refreshButton: {
    padding: 8,
  },
  subjectDistributionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  subjectDistributionItem: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  subjectDistributionBar: {
    width: '80%',
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectDistributionText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  subjectDistributionValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  teacherReportsContainer: {
    marginTop: 12,
  },
  childReportCard: {
    marginBottom: 12,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  childReportName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reportEntry: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
  },
  scoreChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  reportText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyReportsContainer: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyReportsText: {
    fontSize: 14,
    textAlign: 'center',
  },
});