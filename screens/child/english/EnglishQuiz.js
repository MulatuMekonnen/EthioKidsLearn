import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Age-based questions
const beginnerQuestions = [
  {
    question: 'What comes after letter E?',
    options: ['A. G', 'B. F', 'C. R'],
    correctAnswer: 1
  },
  {
    question: 'What comes before M?',
    options: ['A. L', 'B. N', 'C. H'],
    correctAnswer: 0
  },
  {
    question: 'What is missing? C_R.',
    options: ['A. U', 'B. Y', 'C. A'],
    correctAnswer: 0
  },
  {
    question: 'What is missing? AP_LE.',
    options: ['A. P', 'B. P', 'C. N'],
    correctAnswer: 1
  },
  {
    question: 'Find the vowel:',
    options: ['A. E', 'B. C', 'C. G'],
    correctAnswer: 0
  },
  {
    question: 'Which letter makes the "S" sound?',
    options: ['A. C', 'B. S', 'C. T'],
    correctAnswer: 1
  },
  {
    question: 'What letter does "Ball" start with?',
    options: ['A. A', 'B. B', 'C. C'],
    correctAnswer: 1
  },
  {
    question: 'What letter does "Cat" start with?',
    options: ['A. D', 'B. C', 'C. K'],
    correctAnswer: 1
  },
  {
    question: 'Which is a capital letter?',
    options: ['A. a', 'B. b', 'C. B'],
    correctAnswer: 2
  },
  {
    question: 'Which is a small letter?',
    options: ['A. a', 'B. B', 'C. C'],
    correctAnswer: 0
  },
  {
    question: 'Count the letters: B-A-T',
    options: ['A. 2', 'B. 3', 'C. 4'],
    correctAnswer: 1
  },
  {
    question: 'What is the first letter of the alphabet?',
    options: ['A. A', 'B. Z', 'C. B'],
    correctAnswer: 0
  },
  {
    question: 'What comes after letter B?',
    options: ['A. A', 'B. C', 'C. D'],
    correctAnswer: 1
  },
  {
    question: 'Which letter has a round shape?',
    options: ['A. T', 'B. O', 'C. L'],
    correctAnswer: 1
  },
  {
    question: 'What is missing? C_T.',
    options: ['A. A', 'B. I', 'C. U'],
    correctAnswer: 0
  },
  {
    question: 'What is another vowel besides A?',
    options: ['A. B', 'B. C', 'C. E'],
    correctAnswer: 2
  },
  {
    question: 'Which shows correct alphabetical order?',
    options: ['A. ABC', 'B. CBA', 'C. ACB'],
    correctAnswer: 0
  },
  {
    question: 'What letter does "Dog" start with?',
    options: ['A. C', 'B. D', 'C. G'],
    correctAnswer: 1
  },
  {
    question: 'What letter makes the "M" sound?',
    options: ['A. N', 'B. M', 'C. W'],
    correctAnswer: 1
  },
  {
    question: 'What is missing? B_D.',
    options: ['A. E', 'B. A', 'C. I'],
    correctAnswer: 1
  }
];

const intermediateQuestions = [
  {
    question: 'Which of these is a noun?',
    options: ['A. Run', 'B. Car', 'C. Fast'],
    correctAnswer: 1
  },
  {
    question: 'Which is a complete sentence?',
    options: ['A. Big dog', 'B. The cat sleeps.', 'C. Walking home'],
    correctAnswer: 1
  },
  {
    question: 'What is the plural of "child"?',
    options: ['A. Childs', 'B. Childes', 'C. Children'],
    correctAnswer: 2
  },
  {
    question: 'Which is a verb?',
    options: ['A. Happy', 'B. Jump', 'C. Red'],
    correctAnswer: 1
  },
  {
    question: 'What is an adjective?',
    options: ['A. School', 'B. Tall', 'C. Run'],
    correctAnswer: 1
  },
  {
    question: 'Choose the correct spelling:',
    options: ['A. Beutiful', 'B. Beautiful', 'C. Butiful'],
    correctAnswer: 1
  },
  {
    question: 'What is the opposite of "hot"?',
    options: ['A. Cold', 'B. Warm', 'C. Wet'],
    correctAnswer: 0
  },
  {
    question: 'Which word means "not happy"?',
    options: ['A. Sad', 'B. Glad', 'C. Mad'],
    correctAnswer: 0
  },
  {
    question: 'Which shows correct punctuation?',
    options: ['A. Where are you', 'B. Where are you.', 'C. Where are you?'],
    correctAnswer: 2
  },
  {
    question: 'What is the past tense of "walk"?',
    options: ['A. Walking', 'B. Walked', 'C. Will walk'],
    correctAnswer: 1
  },
  {
    question: 'Which animal is spelled correctly?',
    options: ['A. Elefant', 'B. Elephant', 'C. Eliphant'],
    correctAnswer: 1
  },
  {
    question: 'Choose the correct sentence:',
    options: ['A. She eat apples.', 'B. She eats apples.', 'C. She eating apples.'],
    correctAnswer: 1
  },
  {
    question: 'What is the correct word order?',
    options: ['A. Blue the sky is', 'B. Is blue the sky', 'C. The sky is blue'],
    correctAnswer: 2
  },
  {
    question: 'Which is a compound word?',
    options: ['A. Book', 'B. Sunshine', 'C. Happy'],
    correctAnswer: 1
  },
  {
    question: 'What is a synonym for "big"?',
    options: ['A. Small', 'B. Large', 'C. Tiny'],
    correctAnswer: 1
  },
  {
    question: 'Which is a question word?',
    options: ['A. Because', 'B. Why', 'C. Then'],
    correctAnswer: 1
  },
  {
    question: 'What sound does "ph" make?',
    options: ['A. "f" sound', 'B. "p" sound', 'C. "h" sound'],
    correctAnswer: 0
  },
  {
    question: 'Which is not a color?',
    options: ['A. Blue', 'B. Jump', 'C. Red'],
    correctAnswer: 1
  },
  {
    question: 'Which says "thank you" in another language?',
    options: ['A. Hello', 'B. Gracias', 'C. Please'],
    correctAnswer: 1
  },
  {
    question: 'What does the prefix "un-" mean?',
    options: ['A. Again', 'B. Not', 'C. Under'],
    correctAnswer: 1
  }
];

const advancedQuestions = [
  {
    question: 'Which is a preposition?',
    options: ['A. Between', 'B. Running', 'C. Happy'],
    correctAnswer: 0
  },
  {
    question: 'What is a relative pronoun?',
    options: ['A. She', 'B. Which', 'C. Fast'],
    correctAnswer: 1
  },
  {
    question: 'Identify the correct sentence:',
    options: ['A. Neither of the brothers were home.', 'B. Neither of the brothers was home.', 'C. Neither of the brothers is home.'],
    correctAnswer: 1
  },
  {
    question: 'What type of noun is "honesty"?',
    options: ['A. Proper noun', 'B. Common noun', 'C. Abstract noun'],
    correctAnswer: 2
  },
  {
    question: 'Which word contains a prefix?',
    options: ['A. Bicycle', 'B. Walking', 'C. Faster'],
    correctAnswer: 0
  },
  {
    question: 'Identify the conjunction:',
    options: ['A. During', 'B. Because', 'C. Quickly'],
    correctAnswer: 1
  },
  {
    question: 'Which sentence uses active voice?',
    options: ['A. The ball was kicked by John.', 'B. John kicked the ball.', 'C. The ball is being kicked.'],
    correctAnswer: 1
  },
  {
    question: 'What is the plural of "phenomenon"?',
    options: ['A. Phenomenons', 'B. Phenomena', 'C. Phenomens'],
    correctAnswer: 1
  },
  {
    question: 'Identify the adverb:',
    options: ['A. Quiet', 'B. Quietly', 'C. Quieter'],
    correctAnswer: 1
  },
  {
    question: 'Which tense is: "She will have been studying"?',
    options: ['A. Future perfect', 'B. Past perfect', 'C. Future perfect continuous'],
    correctAnswer: 2
  },
  {
    question: 'What is an oxymoron?',
    options: ['A. A contradictory phrase', 'B. A spelling mistake', 'C. A type of verb'],
    correctAnswer: 0
  },
  {
    question: 'Which is a metaphor?',
    options: ['A. She is as fast as a cheetah.', 'B. She is a cheetah on the track.', 'C. She runs faster than a cheetah.'],
    correctAnswer: 1
  },
  {
    question: 'Which of these is an idiom?',
    options: ['A. The weather is cold.', 'B. It is raining cats and dogs.', 'C. The sky is blue.'],
    correctAnswer: 1
  },
  {
    question: 'What is a synonym for "erudite"?',
    options: ['A. Scholarly', 'B. Confused', 'C. Silly'],
    correctAnswer: 0
  },
  {
    question: 'Identify the correct spelling:',
    options: ['A. Accomodate', 'B. Accommodate', 'C. Acommodate'],
    correctAnswer: 1
  },
  {
    question: 'Which sentence has a dangling modifier?',
    options: ['A. Hiking in the mountains, the bear surprised us.', 'B. Hiking in the mountains, we saw a bear.', 'C. We saw a bear while hiking in the mountains.'],
    correctAnswer: 0
  },
  {
    question: 'What does "omniscient" mean?',
    options: ['A. All-powerful', 'B. All-knowing', 'C. All-seeing'],
    correctAnswer: 1
  },
  {
    question: 'What literary device is: "The wind whispered"?',
    options: ['A. Metaphor', 'B. Personification', 'C. Simile'],
    correctAnswer: 1
  },
  {
    question: 'Which sentence uses the subjunctive mood?',
    options: ['A. I was at the park.', 'B. I wish I were at the park.', 'C. I will be at the park.'],
    correctAnswer: 1
  },
  {
    question: 'What is the antonym of "verbose"?',
    options: ['A. Concise', 'B. Wordy', 'C. Eloquent'],
    correctAnswer: 0
  }
];

export default function EnglishQuizScreen() {
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

  const handleOptionSelect = (questionIndex, optionIndex) => {
    if (submitted) return;
    
    const isCorrect = optionIndex === questions[questionIndex].correctAnswer;
    
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
    
    // Calculate score and show results
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
        category: 'English Quiz',
        subject: 'English', // Add subject for categorization
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
}); 