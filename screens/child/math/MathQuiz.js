import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Age-based questions
const beginnerQuestions = [
  {
    question: 'What is 1 + 1 ?',
    options: ['A. 1', 'B. 2', 'C. 3'],
    correctAnswer: 1
  },
  {
    question: 'What is 2 + 2 ?',
    options: ['A. 3', 'B. 4', 'C. 5'],
    correctAnswer: 1
  },
  {
    question: 'What is 3 + 1 ?',
    options: ['A. 2', 'B. 3', 'C. 4'],
    correctAnswer: 2
  },
  {
    question: 'What is 5 - 2 ?',
    options: ['A. 2', 'B. 3', 'C. 4'],
    correctAnswer: 1
  },
  {
    question: 'What is 4 - 1 ?',
    options: ['A. 2', 'B. 3', 'C. 5'],
    correctAnswer: 1
  },
  {
    question: 'What is 2 + 3 ?',
    options: ['A. 4', 'B. 5', 'C. 6'],
    correctAnswer: 1
  },
  {
    question: 'What is 3 + 3 ?',
    options: ['A. 5', 'B. 6', 'C. 7'],
    correctAnswer: 1
  },
  {
    question: 'What is 4 + 2 ?',
    options: ['A. 6', 'B. 7', 'C. 8'],
    correctAnswer: 0
  },
  {
    question: 'What is 5 + 1 ?',
    options: ['A. 5', 'B. 6', 'C. 7'],
    correctAnswer: 1
  },
  {
    question: 'What is 3 - 1 ?',
    options: ['A. 1', 'B. 2', 'C. 3'],
    correctAnswer: 1
  },
  {
    question: 'What is 4 - 2 ?',
    options: ['A. 1', 'B. 2', 'C. 3'],
    correctAnswer: 1
  },
  {
    question: 'Count the numbers: 1, 2, 3, __, 5',
    options: ['A. 3', 'B. 4', 'C. 6'],
    correctAnswer: 1
  },
  {
    question: 'Which number is bigger: 2 or 5?',
    options: ['A. 2', 'B. 5', 'C. Same'],
    correctAnswer: 1
  },
  {
    question: 'Which number is smaller: 7 or 3?',
    options: ['A. 7', 'B. 3', 'C. Same'],
    correctAnswer: 1
  },
  {
    question: 'What is 1 + 1 + 1?',
    options: ['A. 2', 'B. 3', 'C. 4'],
    correctAnswer: 1
  }
];

const intermediateQuestions = [
  {
    question: 'What is 5 + 4 ?',
    options: ['A. 8', 'B. 9', 'C. 10'],
    correctAnswer: 1
  },
  {
    question: 'What is 8 - 3 ?',
    options: ['A. 4', 'B. 5', 'C. 6'],
    correctAnswer: 1
  },
  {
    question: 'What is 2 * 3 ?',
    options: ['A. 5', 'B. 6', 'C. 8'],
    correctAnswer: 1
  },
  {
    question: 'What is 10 / 2 ?',
    options: ['A. 4', 'B. 5', 'C. 6'],
    correctAnswer: 1
  },
  {
    question: 'What is 7 + 5 ?',
    options: ['A. 11', 'B. 12', 'C. 13'],
    correctAnswer: 1
  },
  {
    question: 'What is 15 - 6 ?',
    options: ['A. 8', 'B. 9', 'C. 10'],
    correctAnswer: 1
  },
  {
    question: 'What is 3 * 4 ?',
    options: ['A. 10', 'B. 11', 'C. 12'],
    correctAnswer: 2
  },
  {
    question: 'What is 16 / 4 ?',
    options: ['A. 3', 'B. 4', 'C. 5'],
    correctAnswer: 1
  },
  {
    question: 'What is 9 + 8 ?',
    options: ['A. 16', 'B. 17', 'C. 18'],
    correctAnswer: 1
  },
  {
    question: 'What is 20 - 7 ?',
    options: ['A. 12', 'B. 13', 'C. 14'],
    correctAnswer: 1
  },
  {
    question: 'What is 5 * 2 ?',
    options: ['A. 8', 'B. 10', 'C. 12'],
    correctAnswer: 1
  },
  {
    question: 'What is 18 / 3 ?',
    options: ['A. 5', 'B. 6', 'C. 7'],
    correctAnswer: 1
  },
  {
    question: 'What is 11 + 5 ?',
    options: ['A. 15', 'B. 16', 'C. 17'],
    correctAnswer: 1
  },
  {
    question: 'What is 13 - 4 ?',
    options: ['A. 8', 'B. 9', 'C. 10'],
    correctAnswer: 1
  },
  {
    question: 'What is 4 * 3 ?',
    options: ['A. 10', 'B. 11', 'C. 12'],
    correctAnswer: 2
  }
];

const advancedQuestions = [
  {
    question: 'What is 12 * 3 ?',
    options: ['A. 33', 'B. 36', 'C. 39'],
    correctAnswer: 1
  },
  {
    question: 'What is 45 / 9 ?',
    options: ['A. 4', 'B. 5', 'C. 6'],
    correctAnswer: 1
  },
  {
    question: 'What is 17 + 26 ?',
    options: ['A. 41', 'B. 43', 'C. 47'],
    correctAnswer: 1
  },
  {
    question: 'What is 53 - 28 ?',
    options: ['A. 23', 'B. 25', 'C. 27'],
    correctAnswer: 1
  },
  {
    question: 'What is 7 * 8 ?',
    options: ['A. 54', 'B. 56', 'C. 58'],
    correctAnswer: 1
  },
  {
    question: 'What is 72 / 8 ?',
    options: ['A. 8', 'B. 9', 'C. 10'],
    correctAnswer: 1
  },
  {
    question: 'What is 125 + 75 ?',
    options: ['A. 190', 'B. 200', 'C. 210'],
    correctAnswer: 1
  },
  {
    question: 'What is 200 - 65 ?',
    options: ['A. 125', 'B. 135', 'C. 145'],
    correctAnswer: 1
  },
  {
    question: 'What is 9 * 9 ?',
    options: ['A. 72', 'B. 81', 'C. 90'],
    correctAnswer: 1
  },
  {
    question: 'What is 96 / 12 ?',
    options: ['A. 6', 'B. 7', 'C. 8'],
    correctAnswer: 2
  },
  {
    question: 'What is 13 * 4 ?',
    options: ['A. 48', 'B. 52', 'C. 56'],
    correctAnswer: 1
  },
  {
    question: 'What is 75 + 48 ?',
    options: ['A. 123', 'B. 133', 'C. 143'],
    correctAnswer: 0
  },
  {
    question: 'What is 156 - 79 ?',
    options: ['A. 67', 'B. 77', 'C. 87'],
    correctAnswer: 1
  },
  {
    question: 'What is 6 * 12 ?',
    options: ['A. 62', 'B. 72', 'C. 82'],
    correctAnswer: 1
  },
  {
    question: 'What is 144 / 12 ?',
    options: ['A. 10', 'B. 12', 'C. 14'],
    correctAnswer: 1
  }
];

export default function MathQuizScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [childInfo, setChildInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    // Get child info if available in route params
    const childId = route.params?.childId;
    const childName = route.params?.childName;
    
    if (childId && childName) {
      setChildInfo({ id: childId, name: childName });
    } else {
      loadDefaultChild();
    }
  }, [route.params]);

  useEffect(() => {
    // Load appropriate questions based on child's age/level
    if (childInfo) {
      loadAgeAppropriateQuestions();
    }
  }, [childInfo]);

  const loadDefaultChild = async () => {
    try {
      const savedChildren = await AsyncStorage.getItem('children');
      if (savedChildren) {
        const children = JSON.parse(savedChildren);
        if (children.length > 0) {
          // Use the first child by default
          setChildInfo({ id: children[0].id, name: children[0].name, age: children[0].age, level: children[0].level });
        }
      }
    } catch (error) {
      console.error('Error loading child information:', error);
    }
  };

  const loadAgeAppropriateQuestions = () => {
    if (!childInfo) return;
    
    let questionSet;
    
    // Select questions based on child's age/level
    if (childInfo.level === 'Advanced' || (childInfo.age && childInfo.age >= 10)) {
      questionSet = advancedQuestions;
    } else if (childInfo.level === 'Intermediate' || (childInfo.age && childInfo.age >= 7)) {
      questionSet = intermediateQuestions;
    } else {
      questionSet = beginnerQuestions;
    }
    
    setQuestions(questionSet);
  };

  async function playSound(isCorrect) {
    const soundFile = isCorrect 
      ? require('../../../assets/sounds/correct.mp3')
      : require('../../../assets/sounds/wrong.mp3');
    
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await sound.unloadAsync();
  }

  const handleOptionSelect = async (questionIndex, optionIndex) => {
    if (submitted) return;

    const isCorrect = optionIndex === questions[questionIndex].correctAnswer;
    await playSound(isCorrect);

    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex
    });

    // Save answer for reporting
    const newAnswers = [...answers];
    newAnswers[questionIndex] = {
      question: questions[questionIndex].question,
      selectedAnswer: questions[questionIndex].options[optionIndex],
      correctAnswer: questions[questionIndex].options[questions[questionIndex].correctAnswer],
      isCorrect
    };
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    let newScore = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        newScore++;
      }
    });
    setScore(newScore);

    // Save quiz results for parent report
    try {
      // Ensure we have a child ID
      const childId = childInfo?.id || '1';
      const childName = childInfo?.name || 'Child';
      
      // Get existing results
      const existingResultsJson = await AsyncStorage.getItem('quizResults');
      const existingResults = existingResultsJson ? JSON.parse(existingResultsJson) : [];
      
      // Add new result
      const newResult = {
        id: Date.now().toString(),
        childId,
        childName,
        category: 'Math Quiz',
        subject: 'Math', // Add subject for categorization
        date: new Date().toISOString(),
        score: newScore,
        totalQuestions: questions.length,
        answers
      };
      
      // Save updated results
      await AsyncStorage.setItem('quizResults', JSON.stringify([...existingResults, newResult]));
      
      // Alert success (optional for better UX)
      Alert.alert(
        'Quiz Complete!',
        `Your score: ${newScore}/${questions.length}\n\nResults saved for your parents to view.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {questions.map((question, questionIndex) => (
          <Animatable.View
            key={questionIndex}
            animation="fadeInUp"
            delay={questionIndex * 200}
            style={styles.questionContainer}
          >
            <Text style={styles.questionText}>{question.question}</Text>
            {question.options.map((option, optionIndex) => (
              <TouchableOpacity
                key={optionIndex}
                style={[
                  styles.optionButton,
                  selectedAnswers[questionIndex] === optionIndex && styles.selectedOption,
                  submitted && optionIndex === question.correctAnswer && styles.correctOption,
                  submitted && selectedAnswers[questionIndex] === optionIndex && 
                  optionIndex !== question.correctAnswer && styles.wrongOption
                ]}
                onPress={() => handleOptionSelect(questionIndex, optionIndex)}
                disabled={submitted}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </Animatable.View>
        ))}

        {submitted && (
          <Animatable.View 
            animation="bounceIn"
            style={styles.scoreContainer}
          >
            <Text style={styles.scoreText}>
              Your Score: {score} / {questions.length}
            </Text>
          </Animatable.View>
        )}

        <Animatable.View 
          animation="fadeIn"
          delay={1000}
          style={styles.submitContainer}
        >
          <TouchableOpacity
            style={[styles.submitButton, submitted && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={submitted}
          >
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>

      <Animatable.View 
        animation="fadeIn"
        delay={1200}
        style={styles.backButtonContainer}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </Animatable.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B41',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  questionContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1A1B41',
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  selectedOption: {
    backgroundColor: '#2196F3',
  },
  correctOption: {
    backgroundColor: '#4CAF50',
  },
  wrongOption: {
    backgroundColor: '#FF5252',
  },
  optionText: {
    fontSize: 18,
    color: '#1A1B41',
  },
  submitContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 5,
  },
  submitText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 3,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreContainer: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 15,
    marginVertical: 20,
    alignItems: 'center',
  },
  scoreText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 