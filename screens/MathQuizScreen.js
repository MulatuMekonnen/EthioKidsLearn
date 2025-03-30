import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';

const questions = [
  {
    question: 'What is 2 + 2 ?',
    options: ['A. 8', 'B. 4', 'C.5'],
    correctAnswer: 1
  },
  {
    question: 'What is 5 - 2 ?',
    options: ['A. 0', 'B. 3', 'C.5'],
    correctAnswer: 1
  },
  {
    question: 'What is 10 / 2 ?',
    options: ['A. 8', 'B. 20', 'C.5'],
    correctAnswer: 2
  },
  {
    question: 'What is 2 * 2 ?',
    options: ['A. 3', 'B. 4', 'C.5'],
    correctAnswer: 1
  },
  {
    question: 'What is 3 + 2 ?',
    options: ['A. 8', 'B. 4', 'C.5'],
    correctAnswer: 2
  },
  {
    question: 'What is 4 + 3 ?',
    options: ['A. 7', 'B. 6', 'C.8'],
    correctAnswer: 0
  },
  {
    question: 'What is 8 - 3 ?',
    options: ['A. 4', 'B. 5', 'C.6'],
    correctAnswer: 1
  },
  {
    question: 'What is 3 * 3 ?',
    options: ['A. 6', 'B. 8', 'C.9'],
    correctAnswer: 2
  }
];

export default function MathQuizScreen() {
  const navigation = useNavigation();
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  async function playSound(isCorrect) {
    const soundFile = isCorrect 
      ? require('../assets/sounds/correct.mp3')
      : require('../assets/sounds/wrong.mp3');
    
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
  };

  const handleSubmit = () => {
    setSubmitted(true);
    let newScore = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        newScore++;
      }
    });
    setScore(newScore);
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