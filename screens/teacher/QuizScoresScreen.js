import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getAllQuizScores, createProgressReport } from '../../services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function QuizScoresScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScore, setSelectedScore] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [report, setReport] = useState('');

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    try {
      // Get all quiz scores
      const quizScores = await getAllQuizScores();
      
      // Get existing progress reports
      const reportsJson = await AsyncStorage.getItem('progressReports');
      const reports = reportsJson ? JSON.parse(reportsJson) : [];
      
      // Create a set of child IDs and timestamps that already have reports
      const reportedScores = new Set(
        reports.map(report => `${report.childId}-${report.timestamp}`)
      );
      
      // Filter out scores that already have reports
      const unreportedScores = quizScores.filter(score => 
        !reportedScores.has(`${score.childId}-${score.timestamp}`)
      );
      
      setScores(unreportedScores);
    } catch (error) {
      Alert.alert('Error', 'Failed to load quiz scores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!report.trim()) {
      Alert.alert('Error', 'Please enter a report');
      return;
    }

    try {
      await createProgressReport(
        selectedScore.childId,
        selectedScore.childName,
        user.uid,
        user.displayName || 'Teacher',
        report.trim()
      );
      
      // Immediately remove the reported score from the state
      setScores(prevScores => 
        prevScores.filter(score => 
          !(score.childId === selectedScore.childId && 
            score.timestamp === selectedScore.timestamp)
        )
      );
      
      Alert.alert('Success', 'Progress report created successfully');
      setModalVisible(false);
      setReport('');
      setSelectedScore(null);
      
      // Reload all scores to ensure consistency
      loadScores();
    } catch (error) {
      Alert.alert('Error', 'Failed to create progress report');
    }
  };

  const renderScoreItem = ({ item }) => (
    <TouchableOpacity
      style={styles.scoreItem}
      onPress={() => {
        setSelectedScore(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.scoreHeader}>
        <Text style={styles.childName}>{item.childName}</Text>
        <Text style={styles.quizType}>{item.quizType}</Text>
      </View>
      <View style={styles.scoreDetails}>
        <Text style={styles.scoreText}>
          Score: {item.score}/{item.totalQuestions}
        </Text>
        <Text style={styles.percentageText}>
          {item.percentage.toFixed(1)}%
        </Text>
      </View>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Quiz Scores</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={scores}
        renderItem={renderScoreItem}
        keyExtractor={(item, index) => item.id || `score-${index}-${item.timestamp}`}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Progress Report</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.studentInfo}>
              Student: {selectedScore?.childName}
            </Text>
            <Text style={styles.quizInfo}>
              Quiz: {selectedScore?.quizType}
            </Text>
            <Text style={styles.scoreInfo}>
              Score: {selectedScore?.score}/{selectedScore?.totalQuestions}
            </Text>

            <TextInput
              style={styles.reportInput}
              multiline
              placeholder="Enter progress report..."
              value={report}
              onChangeText={setReport}
              numberOfLines={6}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateReport}
            >
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1E90FF',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  scoreItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quizType: {
    fontSize: 16,
    color: '#666',
  },
  scoreDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 16,
    color: '#666',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E90FF',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  studentInfo: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  quizInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  scoreInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  reportInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#1E90FF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 