import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

export default function ChildProgress() {
  const navigation = useNavigation();
  const route = useRoute();
  const { childId, childName } = route.params || { childId: '1', childName: 'Child' };
  const { currentTheme } = useTheme();
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    loadQuizResults();
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme?.background || '#F5F5F5' }]}>
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFA500" />
          <Text style={styles.loadingText}>Loading progress reports...</Text>
        </View>
      ) : (
        <>
          {quizResults.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="school-outline" size={80} color="#BDBDBD" />
              <Text style={styles.emptyText}>No quiz results yet</Text>
              <Text style={styles.emptySubText}>{childName} hasn't completed any quizzes</Text>
            </View>
          ) : (
            <>
              {!selectedResult ? (
                // Results list view
                <ScrollView style={styles.scrollView}>
                  <View style={styles.resultsContainer}>
                    <Text style={styles.sectionTitle}>Oromo Language Quizzes</Text>
                    <Text style={styles.resultCount}>{quizResults.length} quiz results</Text>
                    
                    {quizResults.map((result, index) => (
                      <TouchableOpacity
                        key={result.id || index}
                        style={styles.resultCard}
                        onPress={() => handleResultPress(result)}
                      >
                        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(result.category) }]}>
                          <Text style={styles.categoryText}>{result.category}</Text>
                        </View>
                        
                        <View style={styles.resultInfo}>
                          <Text style={styles.dateText}>{formatDate(result.date)}</Text>
                          <View style={styles.scoreContainer}>
                            <Text style={[styles.scoreText, { color: getScoreColor(result.score, result.totalQuestions) }]}>
                              Score: {result.score}/{result.totalQuestions}
                            </Text>
                            <Text style={styles.percentText}>
                              ({Math.round((result.score / result.totalQuestions) * 100)}%)
                            </Text>
                          </View>
                        </View>
                        
                        <Ionicons name="chevron-forward" size={24} color="#BDBDBD" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              ) : (
                // Detail view
                <ScrollView style={styles.scrollView}>
                  <View style={styles.detailsContainer}>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={closeDetails}
                    >
                      <Ionicons name="arrow-back" size={20} color="#666" />
                      <Text style={styles.closeText}>Back to list</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.detailsHeader}>
                      <View style={[styles.detailsCategoryBadge, { backgroundColor: getCategoryColor(selectedResult.category) }]}>
                        <Text style={styles.detailsCategoryText}>{selectedResult.category}</Text>
                      </View>
                      <Text style={styles.detailsDate}>{formatDate(selectedResult.date)}</Text>
                    </View>
                    
                    <View style={styles.scoreBox}>
                      <Text style={styles.scoreBoxTitle}>Quiz Score</Text>
                      <View style={styles.scoreBoxContent}>
                        <Text style={[styles.scoreBoxValue, { color: getScoreColor(selectedResult.score, selectedResult.totalQuestions) }]}>
                          {selectedResult.score}/{selectedResult.totalQuestions}
                        </Text>
                        <Text style={[styles.scoreBoxPercent, { color: getScoreColor(selectedResult.score, selectedResult.totalQuestions) }]}>
                          {Math.round((selectedResult.score / selectedResult.totalQuestions) * 100)}%
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.answersTitle}>Question Details</Text>
                    
                    {selectedResult.answers.map((answer, index) => (
                      <View 
                        key={index} 
                        style={[
                          styles.answerItem,
                          { borderLeftColor: answer.isCorrect ? '#4CAF50' : '#F44336' }
                        ]}
                      >
                        <Text style={styles.questionText}>{index + 1}. {answer.question}</Text>
                        <View style={styles.answerDetail}>
                          <Text style={styles.answerLabel}>Child's answer: </Text>
                          <Text style={{ 
                            color: answer.isCorrect ? '#4CAF50' : '#F44336',
                            fontWeight: 'bold'
                          }}>
                            {answer.selectedAnswer}
                          </Text>
                        </View>
                        
                        {!answer.isCorrect && (
                          <View style={styles.answerDetail}>
                            <Text style={styles.answerLabel}>Correct answer: </Text>
                            <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                              {answer.correctAnswer}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                    
                    <View style={styles.feedbackBox}>
                      <Text style={styles.feedbackTitle}>Feedback for Parent</Text>
                      <Text style={styles.feedbackText}>
                        {getPerformanceFeedback(selectedResult.score, selectedResult.totalQuestions)}
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              )}
            </>
          )}
        </>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
    color: '#666',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  resultsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  resultCount: {
    fontSize: 14,
    color: '#777',
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
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
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  resultInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  percentText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  // Detail view styles
  detailsContainer: {
    padding: 16,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  detailsHeader: {
    marginBottom: 20,
  },
  detailsCategoryBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  detailsCategoryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  detailsDate: {
    fontSize: 14,
    color: '#666',
  },
  scoreBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scoreBoxTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  scoreBoxContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreBoxValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreBoxPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  answersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  answerItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  questionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  answerDetail: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  answerLabel: {
    fontSize: 14,
    color: '#666',
  },
  feedbackBox: {
    backgroundColor: '#F5F8FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  }
}); 