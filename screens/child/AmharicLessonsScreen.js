import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView, Modal, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const amharicContent = [
  // First row of Amharic alphabet
  {
    letter: 'ሀ',
    pronunciation: 'ha',
    sound: require('../../assets/sounds/amharic/ሀ.mp3'),
    category: 'ፊደላት'  // 'Alphabet' in Amharic
  },
  {
    letter: 'ለ',
    pronunciation: 'le',
    sound: require('../../assets/sounds/amharic/ለ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ሐ',
    pronunciation: 'ha',
    sound: require('../../assets/sounds/amharic/ሐ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'መ',
    pronunciation: 'me',
    sound: require('../../assets/sounds/amharic/መ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ሠ',
    pronunciation: 'se',
    sound: require('../../assets/sounds/amharic/ሠ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ረ',
    pronunciation: 're',
    sound: require('../../assets/sounds/amharic/ረ.m4a'),
    category: 'ፊደላት'
  },
  // Adding more alphabets
  {
    letter: 'ሰ',
    pronunciation: 'se',
    sound: require('../../assets/sounds/amharic/ሰ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ሸ',
    pronunciation: 'she',
    sound: require('../../assets/sounds/amharic/ሸ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ቀ',
    pronunciation: 'qe',
    sound: require('../../assets/sounds/amharic/ቀ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'በ',
    pronunciation: 'be',
    sound: require('../../assets/sounds/amharic/በ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ተ',
    pronunciation: 'te',
    sound: require('../../assets/sounds/amharic/ተ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ቸ',
    pronunciation: 'che',
    sound: require('../../assets/sounds/amharic/ቸ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ኀ',
    pronunciation: 'ha',
    sound: require('../../assets/sounds/amharic/ኀ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ነ',
    pronunciation: 'ne',
    sound: require('../../assets/sounds/amharic/ነ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ኘ',
    pronunciation: 'nye',
    sound: require('../../assets/sounds/amharic/ኘ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'አ',
    pronunciation: 'a',
    sound: require('../../assets/sounds/amharic/አ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ከ',
    pronunciation: 'ke',
    sound: require('../../assets/sounds/amharic/ከ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ኸ',
    pronunciation: 'he',
    sound: require('../../assets/sounds/amharic/ኸ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ወ',
    pronunciation: 'we',
    sound: require('../../assets/sounds/amharic/ወ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ዐ',
    pronunciation: 'a',
    sound: require('../../assets/sounds/amharic/ዐ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ዘ',
    pronunciation: 'ze',
    sound: require('../../assets/sounds/amharic/ዘ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ዠ',
    pronunciation: 'zhe',
    sound: require('../../assets/sounds/amharic/ዠ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'የ',
    pronunciation: 'ye',
    sound: require('../../assets/sounds/amharic/የ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ደ',
    pronunciation: 'de',
    sound: require('../../assets/sounds/amharic/ደ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ጀ',
    pronunciation: 'je',
    sound: require('../../assets/sounds/amharic/ጀ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ገ',
    pronunciation: 'ge',
    sound: require('../../assets/sounds/amharic/ገ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ጠ',
    pronunciation: 'te',
    sound: require('../../assets/sounds/amharic/ጠ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ጨ',
    pronunciation: 'che',
    sound: require('../../assets/sounds/amharic/ጨ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ጰ',
    pronunciation: 'pe',
    sound: require('../../assets/sounds/amharic/ጰ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ጸ',
    pronunciation: 'tse',
    sound: require('../../assets/sounds/amharic/ጸ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ፀ',
    pronunciation: 'tse',
    sound: require('../../assets/sounds/amharic/ፀ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ፈ',
    pronunciation: 'fe',
    sound: require('../../assets/sounds/amharic/ፈ.m4a'),
    category: 'ፊደላት'
  },
  {
    letter: 'ፐ',
    pronunciation: 'pe',
    sound: require('../../assets/sounds/amharic/ፐ.m4a'),
    category: 'ፊደላት'
  },
  
  // Family Category - Expanded
  {
    word: 'እናት',
    pronunciation: 'Inat',
    meaning: 'Mother',
    sound: require('../../assets/sounds/amharic/mother.mp3'),
    category: 'ቤተሰብ'  // 'Family' in Amharic
  },
  {
    word: 'አባት',
    pronunciation: 'Abat',
    meaning: 'Father',
    sound: require('../../assets/sounds/amharic/father.mp3'),
    category: 'ቤተሰብ'
  },
  {
    word: 'ወንድም',
    pronunciation: 'Wendim',
    meaning: 'Brother',
    sound: require('../../assets/sounds/amharic/father.mp3'), // Placeholder
    category: 'ቤተሰብ'
  },
  {
    word: 'እህት',
    pronunciation: 'Ihit',
    meaning: 'Sister',
    sound: require('../../assets/sounds/amharic/mother.mp3'), // Placeholder
    category: 'ቤተሰብ'
  },
  {
    word: 'አያት ወንድ',
    pronunciation: 'Ayat Wend',
    meaning: 'Grandfather',
    sound: require('../../assets/sounds/amharic/father.mp3'), // Placeholder
    category: 'ቤተሰብ'
  },
  {
    word: 'አያት ሴት',
    pronunciation: 'Ayat Set',
    meaning: 'Grandmother',
    sound: require('../../assets/sounds/amharic/mother.mp3'), // Placeholder
    category: 'ቤተሰብ'
  },
  {
    word: 'ልጅ',
    pronunciation: 'Lij',
    meaning: 'Child',
    sound: require('../../assets/sounds/amharic/mother.mp3'), // Placeholder
    category: 'ቤተሰብ'
  },
  {
    word: 'ባል',
    pronunciation: 'Bal',
    meaning: 'Husband',
    sound: require('../../assets/sounds/amharic/father.mp3'), // Placeholder
    category: 'ቤተሰብ'
  },
  {
    word: 'ሚስት',
    pronunciation: 'Mist',
    meaning: 'Wife',
    sound: require('../../assets/sounds/amharic/mother.mp3'), // Placeholder
    category: 'ቤተሰብ'
  },
  
  // Basic Words Category - Expanded
  {
    word: 'ውሃ',
    pronunciation: 'Wuha',
    meaning: 'Water',
    sound: require('../../assets/sounds/amharic/water.mp3'),
    category: 'መሰረታዊ ቃላት'  // 'Basic Words' in Amharic
  },
  {
    word: 'ቀን',
    pronunciation: 'Ken',
    meaning: 'Day',
    sound: require('../../assets/sounds/amharic/water.mp3'), // Placeholder
    category: 'መሰረታዊ ቃላት'
  },
  {
    word: 'ሰላም',
    pronunciation: 'Selam',
    meaning: 'Peace/Hello',
    sound: require('../../assets/sounds/amharic/water.mp3'), // Placeholder
    category: 'መሰረታዊ ቃላት'
  },
  {
    word: 'ደህና',
    pronunciation: 'Dehna',
    meaning: 'Good/Fine',
    sound: require('../../assets/sounds/amharic/water.mp3'), // Placeholder
    category: 'መሰረታዊ ቃላት'
  },
  {
    word: 'አመሰግናለሁ',
    pronunciation: 'Ameseginalehu',
    meaning: 'Thank you',
    sound: require('../../assets/sounds/amharic/water.mp3'), // Placeholder
    category: 'መሰረታዊ ቃላት'
  },
  {
    word: 'ሰማይ',
    pronunciation: 'Semay',
    meaning: 'Sky',
    sound: require('../../assets/sounds/amharic/water.mp3'), // Placeholder
    category: 'መሰረታዊ ቃላት'
  },
  {
    word: 'ምድር',
    pronunciation: 'Midir',
    meaning: 'Earth/Ground',
    sound: require('../../assets/sounds/amharic/water.mp3'), // Placeholder
    category: 'መሰረታዊ ቃላት'
  },
  {
    word: 'እሳት',
    pronunciation: 'Isat',
    meaning: 'Fire',
    sound: require('../../assets/sounds/amharic/water.mp3'), // Placeholder
    category: 'መሰረታዊ ቃላት'
  },
  
  // Food Category - Expanded
  {
    word: 'ዳቦ',
    pronunciation: 'Dabo',
    meaning: 'Bread',
    sound: require('../../assets/sounds/amharic/bread.mp3'),
    category: 'ምግብ'  // 'Food' in Amharic
  },
  {
    word: 'ወጥ',
    pronunciation: 'Wet',
    meaning: 'Stew',
    sound: require('../../assets/sounds/amharic/bread.mp3'), // Placeholder
    category: 'ምግብ'
  },
  {
    word: 'ሥጋ',
    pronunciation: 'Siga',
    meaning: 'Meat',
    sound: require('../../assets/sounds/amharic/bread.mp3'), // Placeholder
    category: 'ምግብ'
  },
  {
    word: 'ፍራፍሬ',
    pronunciation: 'Frafire',
    meaning: 'Fruit',
    sound: require('../../assets/sounds/amharic/bread.mp3'), // Placeholder
    category: 'ምግብ'
  },
  {
    word: 'አትክልት',
    pronunciation: 'Atkilt',
    meaning: 'Vegetable',
    sound: require('../../assets/sounds/amharic/bread.mp3'), // Placeholder
    category: 'ምግብ'
  },
  {
    word: 'ቡና',
    pronunciation: 'Buna',
    meaning: 'Coffee',
    sound: require('../../assets/sounds/amharic/bread.mp3'), // Placeholder
    category: 'ምግብ'
  },
  {
    word: 'ወተት',
    pronunciation: 'Wetet',
    meaning: 'Milk',
    sound: require('../../assets/sounds/amharic/bread.mp3'), // Placeholder
    category: 'ምግብ'
  },
  {
    word: 'እንጀራ',
    pronunciation: 'Injera',
    meaning: 'Injera',
    sound: require('../../assets/sounds/amharic/bread.mp3'), // Placeholder
    category: 'ምግብ'
  },
];

// Quiz questions organized by category
const quizQuestions = {
  ፊደላት: [  // 'Alphabet' in Amharic
    {
      id: 1,
      question: "Which letter makes the 'ha' sound?",
      options: ["ሀ", "ለ", "መ", "ሰ"],
      correctAnswer: "ሀ",
      image: require('../../assets/images/speaker.png')
    },
    {
      id: 2,
      question: "What is the pronunciation of 'ለ'?",
      options: ["ha", "le", "me", "se"],
      correctAnswer: "le",
      image: require('../../assets/images/speaker.png')
    },
    {
      id: 3,
      question: "Which letter is this?",
      options: ["ሐ", "መ", "ሰ", "ረ"],
      correctAnswer: "መ",
      image: require('../../assets/images/speaker.png')
    },
    {
      id: 4,
      question: "Which letter is pronounced as 'se'?",
      options: ["ሀ", "ለ", "መ", "ሰ"],
      correctAnswer: "ሰ",
      image: require('../../assets/images/speaker.png')
    },
    {
      id: 5,
      question: "Match the letter with its pronunciation: 're'",
      options: ["ሀ", "ለ", "መ", "ረ"],
      correctAnswer: "ረ",
      image: require('../../assets/images/speaker.png')
    }
  ],
  ቤተሰብ: [  // 'Family' in Amharic
    {
      id: 1,
      question: "Which word means 'Mother'?",
      options: ["እናት", "አባት", "ወንድም", "እህት"],
      correctAnswer: "እናት",
      image: require('../../assets/images/speaker.png')
    },
    {
      id: 2,
      question: "Which word means 'Father'?",
      options: ["እናት", "አባት", "ወንድም", "እህት"],
      correctAnswer: "አባት",
      image: require('../../assets/images/speaker.png')
    },
    {
      id: 3,
      question: "What does 'ወንድም' mean?",
      options: ["Mother", "Father", "Brother", "Sister"],
      correctAnswer: "Brother",
      image: require('../../assets/images/speaker.png')
    },
    {
      id: 4,
      question: "What is the Amharic word for 'Sister'?",
      options: ["እናት", "አባት", "ወንድም", "እህት"],
      correctAnswer: "እህት",
      image: require('../../assets/images/speaker.png')
    },
    {
      id: 5,
      question: "Match the word with its meaning: 'ልጅ'",
      options: ["Grandparent", "Child", "Brother", "Mother"],
      correctAnswer: "Child",
      image: require('../../assets/images/speaker.png')
    }
  ],
  "መሰረታዊ ቃላት": [  // 'Basic Words' in Amharic
    {
      id: 1,
      question: "Which word means 'Water'?",
      options: ["ውሃ", "ቀን", "ሰላም", "ደህና"],
      correctAnswer: "ውሃ",
      image: require('../../assets/images/speaker.png')
    },
    {
      id: 2,
      question: "What does 'ሰላም' mean?",
      options: ["Water", "Day", "Peace/Hello", "Good/Fine"],
      correctAnswer: "Peace/Hello",
      image: require('../../assets/images/speaker.png')
    },
    {
      id: 3,
      question: "Which word means 'Day'?",
      options: ["ውሃ", "ቀን", "ሰላም", "ደህና"],
      correctAnswer: "ቀን",
      image: require('../../assets/images/speaker.png')
    },
    {
      id: 4,
      question: "Match the word with its meaning: 'ደህና'",
      options: ["Water", "Day", "Peace/Hello", "Good/Fine"],
      correctAnswer: "Good/Fine",
      image: require('../../assets/images/speaker.png')
    },
    {
      id: 5,
      question: "What does 'አመሰግናለሁ' mean?",
      options: ["Hello", "Goodbye", "Thank you", "Sorry"],
      correctAnswer: "Thank you",
      image: require('../../assets/images/speaker.png')
    }
  ],
  ምግብ: [  // 'Food' in Amharic
    {
      id: 1,
      question: "Which word means 'Bread'?",
      options: ["ዳቦ", "ወጥ", "ሥጋ", "ፍራፍሬ"],
      correctAnswer: "ዳቦ",
      image: require('../../assets/images/speaker.png')
    },
    {
      id: 2,
      question: "What does 'ወጥ' mean?",
      options: ["Bread", "Stew", "Meat", "Fruit"],
      correctAnswer: "Stew",
      image: require('../../assets/images/speaker.png')
    },
    {
      id: 3,
      question: "Which word means 'Meat'?",
      options: ["ዳቦ", "ወጥ", "ሥጋ", "ፍራፍሬ"],
      correctAnswer: "ሥጋ",
      image: require('../../assets/images/speaker.png')
    },
    {
      id: 4,
      question: "Match the word with its meaning: 'ፍራፍሬ'",
      options: ["Bread", "Stew", "Meat", "Fruit"],
      correctAnswer: "Fruit",
      image: require('../../assets/images/speaker.png')
    },
    {
      id: 5,
      question: "What does 'አትክልት' mean?",
      options: ["Fruit", "Meat", "Vegetable", "Stew"],
      correctAnswer: "Vegetable",
      image: require('../../assets/images/speaker.png')
    }
  ]
};

const categories = [...new Set(amharicContent.map(item => item.category))];
categories.push('ይዘቶች'); // Add content category

const amharicTopics = [
  // ... existing topics ...
  {
    id: 7,
    title: 'የአማርኛ ይዘቶች',
    icon: 'library-outline',
    screen: 'ContentsScreen',
    color: '#9C27B0',
    description: 'ከመምህራን የተጽፉ የተጽዕኖ ያላቸውን የአማርኛ ይዘቶች ይመልከቱ እና ያውሉ',
    params: { category: 'amharic' }
  }
];

export default function AmharicLessonScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { childId, childName } = route.params || { childId: '1', childName: 'Child' };
  const [selectedCategory, setSelectedCategory] = useState('ፊደላት');  // 'Alphabet' in Amharic
  const [sound, setSound] = useState();
  
  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCategory, setQuizCategory] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Get current quiz questions based on category
  const currentQuizQuestions = quizCategory ? quizQuestions[quizCategory] : [];
  const currentQuestion = currentQuizQuestions[currentQuestionIndex];

  async function playSound(soundFile) {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(soundFile);
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const filteredContent = selectedCategory === 'ይዘቶች'
    ? [{
        title: 'የአማርኛ ይዘቶች',
        icon: 'library-outline',
        screen: 'ContentsScreen',
        color: '#9C27B0',
        description: 'ከመምህራን የተጽፉ የተጽዕኖ ያላቸውን የአማርኛ ይዘቶች ይመልከቱ እና ያውሉ',
        params: { category: 'amharic' }
      }]
    : amharicContent.filter(item => item.category === selectedCategory);

  // Start quiz for the selected category
  const startQuiz = (category) => {
    setQuizCategory(category);
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers([]);
    setQuizComplete(false);
    setShowResults(false);
    setShowQuiz(true);
  };
  
  // Handle answer selection
  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
  };
  
  // Go to next question or finish quiz
  const nextQuestion = () => {
    if (selectedAnswer === null) {
      Alert.alert('Please select an answer');
      return;
    }
    
    // Record answer and update score
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }
    
    // Save answer for results
    setAnswers([...answers, {
      question: currentQuestion.question,
      selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect
    }]);
    
    // Reset selected answer
    setSelectedAnswer(null);
    
    // Go to next question or end quiz
    if (currentQuestionIndex < currentQuizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };
  
  // Finish quiz and save results
  const finishQuiz = async () => {
    setQuizComplete(true);
    setShowResults(true);
    
    try {
      // Get child ID from route params or use default
      const childId = route.params?.childId || navigation.getState()?.routes?.find(r => r.name === 'AmharicLessonScreen')?.params?.childId || '1';
      const childName = route.params?.childName || navigation.getState()?.routes?.find(r => r.name === 'AmharicLessonScreen')?.params?.childName || 'Child';
      
      // Get existing results
      const existingResultsJson = await AsyncStorage.getItem('quizResults');
      const existingResults = existingResultsJson ? JSON.parse(existingResultsJson) : [];
      
      // Add new result
      const newResult = {
        id: Date.now().toString(),
        childId, // Add childId to the result
        childName, // Also save the child's name
        category: quizCategory,
        subject: 'Amharic', // Add subject to differentiate from Oromo
        date: new Date().toISOString(),
        score,
        totalQuestions: currentQuizQuestions.length,
        answers
      };
      
      // Save updated results
      await AsyncStorage.setItem('quizResults', JSON.stringify([...existingResults, newResult]));
      
      // Alert success
      Alert.alert(
        'Quiz Complete!',
        `Your score: ${score}/${currentQuizQuestions.length}\n\nResults saved for your parents to view.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }
  };
  
  // Close quiz and return to lessons
  const closeQuiz = () => {
    setShowQuiz(false);
    setQuizCategory(null);
  };

  // Render the quiz section
  const renderQuiz = () => {
    if (!currentQuestion) return null;
    
    if (showResults) {
      // Show results screen
      return (
        <View style={styles.quizContainer}>
          <Text style={styles.quizTitle}>Quiz Results</Text>
          <Text style={styles.scoreText}>Your Score: {score}/{currentQuizQuestions.length}</Text>
          
          <View style={styles.resultsContainer}>
            {answers.map((answer, index) => (
              <View key={index} style={styles.resultItem}>
                <Text style={styles.resultQuestion}>{index + 1}. {answer.question}</Text>
                <View style={styles.resultAnswers}>
                  <Text style={answer.isCorrect ? styles.correctAnswer : styles.wrongAnswer}>
                    Your answer: {answer.selectedAnswer}
                  </Text>
                  {!answer.isCorrect && (
                    <Text style={styles.correctAnswer}>
                      Correct answer: {answer.correctAnswer}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.backToLessonsButton}
            onPress={closeQuiz}
          >
            <Text style={styles.backToLessonsButtonText}>Back to Lessons</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Show question screen
    return (
      <View style={styles.quizContainer}>
        <Text style={styles.quizTitle}>{quizCategory} Quiz</Text>
        <Text style={styles.progressText}>Question {currentQuestionIndex + 1} of {currentQuizQuestions.length}</Text>
        
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          
          {currentQuestion.image && (
            <Image 
              source={currentQuestion.image}
              style={styles.questionImage}
              resizeMode="contain"
            />
          )}
          
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === option && styles.selectedOption
                ]}
                onPress={() => handleAnswer(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={nextQuestion}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex < currentQuizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {!showQuiz ? (
        // Learning screen
        <>
      <Animatable.View 
        animation="fadeIn"
        style={styles.header}
      >
        <Text style={styles.headerText}>Learn Amharic</Text>
      </Animatable.View>

      <View style={styles.categoryContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategory
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText
              ]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {filteredContent.map((item, index) => (
            <Animatable.View
              key={item.letter || item.word || item.title}
              animation="zoomIn"
              delay={index * 100}
              style={styles.card}
            >
              <TouchableOpacity
                style={[
                  styles.button,
                  item.category === 'ይዘቶች' && styles.contentButton
                ]}
                onPress={() => {
                  if (item.screen) {
                    navigation.navigate(item.screen, item.params);
                  } else {
                    playSound(item.sound);
                  }
                }}
                activeOpacity={0.7}
              >
                {item.icon ? (
                  <Ionicons name={item.icon} size={32} color={item.color} />
                ) : (
                  <Text style={styles.mainText}>
                    {item.letter || item.word}
                  </Text>
                )}
                {item.pronunciation && (
                  <Text style={styles.pronunciationText}>
                    ({item.pronunciation})
                  </Text>
                )}
                {item.description && (
                  <Text style={styles.descriptionText}>
                    {item.description}
                  </Text>
                )}
                {item.meaning && (
                  <Text style={styles.meaningText}>
                    {item.meaning}
                  </Text>
                )}
                {!item.icon && (
                  <View style={styles.soundIcon}>
                    <Image 
                      source={require('../../assets/images/speaker.png')}
                      style={styles.speakerImage}
                    />
                  </View>
                )}
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>
            
            {/* Quiz section */}
            <View style={styles.quizSection}>
              <Text style={styles.quizHeader}>Test Your Knowledge</Text>
              <Text style={styles.quizSubHeader}>Choose a category to take a quiz:</Text>
              
              <View style={styles.quizButtons}>
                {categories.filter(cat => cat !== 'All' && quizQuestions[cat]).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.quizButton,
                      category === 'ቤተሰብ' && styles.familyQuizButton,
                      category === 'መሰረታዊ ቃላት' && styles.basicWordsQuizButton,
                      category === 'ምግብ' && styles.foodQuizButton,
                      category === 'ፊደላት' && styles.alphabetQuizButton
                    ]}
                    onPress={() => startQuiz(category)}
                  >
                    <Text style={styles.quizButtonText}>{category} Quiz</Text>
                    <Image 
                      source={require('../../assets/images/speaker.png')}
                      style={styles.quizButtonIcon}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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
        </>
      ) : (
        // Quiz screen
        renderQuiz()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B41',
  },
  header: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 15,
    margin: 10,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  categoryContainer: {
    height: 60,
    marginBottom: 10,
  },
  categoryScroll: {
    paddingHorizontal: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
  },
  selectedCategory: {
    backgroundColor: '#FF6B6B',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1B41',
  },
  selectedCategoryText: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  card: {
    width: '45%',
    aspectRatio: 1,
    margin: 8,
  },
  button: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mainText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1B41',
    textAlign: 'center',
    marginBottom: 5,
  },
  pronunciationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  meaningText: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
  },
  soundIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 5,
  },
  speakerImage: {
    width: 14,
    height: 14,
    tintColor: 'white',
  },
  backButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  backButton: {
    backgroundColor: '#FF6B6B',
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
  
  // Quiz Section Styles
  quizSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  quizHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1B41',
    textAlign: 'center',
    marginBottom: 5,
  },
  quizSubHeader: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  quizButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  quizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    backgroundColor: '#FFA500',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  alphabetQuizButton: {
    backgroundColor: '#FF6B6B',
  },
  familyQuizButton: {
    backgroundColor: '#FF6B8B',
  },
  basicWordsQuizButton: {
    backgroundColor: '#4CAF50',
  },
  foodQuizButton: {
    backgroundColor: '#2196F3',
  },
  quizButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  quizButtonIcon: {
    width: 16,
    height: 16,
    tintColor: 'white',
  },
  
  // Quiz container styles
  quizContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 16,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1B41',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1B41',
    textAlign: 'center',
    marginBottom: 20,
  },
  questionImage: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  optionText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#1A1B41',
  },
  nextButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backToLessonsButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  backToLessonsButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Quiz results styles
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  resultsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  resultItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  resultQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1A1B41',
  },
  resultAnswers: {
    marginLeft: 10,
  },
  correctAnswer: {
    color: '#4CAF50',
  },
  wrongAnswer: {
    color: '#F44336',
  },
  
  contentButton: {
    borderLeftWidth: 5,
    borderLeftColor: '#9C27B0',
  },
  
  descriptionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
});