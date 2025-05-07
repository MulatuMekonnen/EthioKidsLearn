import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getQuizScoresByChild, getProgressReportsByChild } from '../../services/firebase';

export default function ChildProgress() {
  const navigation = useNavigation();
  const route = useRoute();
  const { childId, childName } = route.params || { childId: '1', childName: 'Child' };
  const { currentTheme } = useTheme();
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const { user } = useAuth();
  const [quizScores, setQuizScores] = useState([]);
  const [progressReports, setProgressReports] = useState([]);

  // Default colors if theme is not available
  const colors = {
    primary: '#1E90FF',
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666'
  };

  useEffect(() => {
    loadQuizResults();
    loadChildProgress();
  }, [childId]);

  const loadQuizResults = async () => {
    try {
      setLoading(true);
      const resultsJson = await AsyncStorage.getItem('quizResults');
      if (resultsJson) {
        let results = JSON.parse(resultsJson);
        
        // Filter results for the current child
        results = results.filter(result => {
          // If a result doesn't have a childId, check if it needs to be updated
          if (!result.childId) {
            // Assign to the first child for backward compatibility
            return childId === '1';
          }
          return result.childId === childId;
        });
        
        // Sort by date, newest first
        results.sort((a, b) => new Date(b.date) - new Date(a.date));
        setQuizResults(results);
      }
    } catch (error) {
      console.error('Error loading quiz results:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChildProgress = async () => {
    try {
      // Use childId from route params instead of user.childId
      if (!childId) {
        Alert.alert('Error', 'No child ID found');
        return;
      }

      const [scores, reports] = await Promise.all([
        getQuizScoresByChild(childId),
        getProgressReportsByChild(childId),
      ]);

      setQuizScores(scores);
      setProgressReports(reports);
    } catch (error) {
      Alert.alert('Error', 'Failed to load child progress');
    }
  };

  const handleResultPress = (result) => {
    setSelectedResult(result);
  };

  const closeDetails = () => {
    setSelectedResult(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return '#4CAF50'; // Good - Green
    if (percentage >= 60) return '#FFC107'; // Average - Yellow
    return '#F44336'; // Needs Improvement - Red
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Alphabet': return '#FF9800';
      case 'Family': return '#FF6B8B';
      case 'Basic Words': return '#4CAF50';
      case 'Greetings': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const getPerformanceFeedback = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) {
      return `${childName} has a strong understanding of this category. Consider moving to more advanced topics.`;
    } else if (percentage >= 60) {
      return `${childName} is making good progress but may need more practice with some concepts in this category.`;
    } else {
      return `${childName} needs additional practice in this area. Consider reviewing the lessons together.`;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{childName}'s Learning Progress</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadQuizResults}
        >
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={[styles.scrollView, { backgroundColor: colors.background }]}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quiz Scores</Text>
          {quizScores.length > 0 ? (
            quizScores.map((score, index) => (
              <View key={`quiz-${score.id}-${index}`} style={[styles.card, { backgroundColor: colors.card }]}>
                <Text style={[styles.quizType, { color: colors.text }]}>{score.quizType}</Text>
                <View style={styles.scoreContainer}>
                  <Text style={[styles.score, { color: colors.primary }]}>
                    {score.score}/{score.totalQuestions}
                  </Text>
                  <Text style={[styles.percentage, { color: colors.primary }]}>
                    {score.percentage.toFixed(1)}%
                  </Text>
                </View>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  {new Date(score.timestamp).toLocaleDateString()}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.noData, { color: colors.textSecondary }]}>No quiz scores yet</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Progress Reports</Text>
          {progressReports.length > 0 ? (
            progressReports.map((report, index) => (
              <View key={`report-${report.id}-${index}`} style={[styles.card, { backgroundColor: colors.card }]}>
                <View style={styles.reportHeader}>
                  <Text style={[styles.teacherName, { color: colors.text }]}>
                    {report.teacherName}
                  </Text>
                  <Text style={[styles.date, { color: colors.textSecondary }]}>
                    {new Date(report.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[styles.reportText, { color: colors.text }]}>
                  {report.report}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.noData, { color: colors.textSecondary }]}>No progress reports yet</Text>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quizType: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  score: {
    fontSize: 16,
    fontWeight: '600',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    opacity: 0.7,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
  },
  reportText: {
    fontSize: 14,
    lineHeight: 20,
  },
  noData: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 8,
  },
}); 