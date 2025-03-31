import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

const questions = [
  {
    question: 'What comes after letter E?',
    options: ['A. G', 'B. F', 'C.R'],
    correctAnswer: 1
  },
  {
    question: 'What comes before M?',
    options: ['A. L', 'B. N', 'C.H'],
    correctAnswer: 0
  },
  {
    question: 'What is missing? C_R.',
    options: ['A. U', 'B. Y', 'C.A'],
    correctAnswer: 0
  },
  {
    question: 'What is missing? AP_LE.',
    options: ['A. P', 'B. I', 'C.N'],
    correctAnswer: 1
  }
];

export default function EnglishQuizScreen() {
  const navigation = useNavigation();
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleOptionSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // Calculate score and show results
    let score = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        score++;
      }
    });
    // You can add score submission logic here
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
                onPress={() => !submitted && handleOptionSelect(questionIndex, optionIndex)}
                disabled={submitted}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </Animatable.View>
        ))}

        <Animatable.View 
          animation="fadeIn"
          delay={800}
          style={styles.submitContainer}
        >
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitted}
          >
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>

      <Animatable.View 
        animation="fadeIn"
        delay={1000}
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
}); 