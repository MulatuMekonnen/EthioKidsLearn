import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  ScrollView, 
  Alert,
  Dimensions,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useTheme } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const oromoContent = [
  // A-Z Alphabet
  {
    letter: 'A',
    pronunciation: 'aa',
    example: 'Aadaa',
    meaning: 'Culture',
    sound: require('../../assets/sounds/oromo/qube/A.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'B',
    pronunciation: 'ba',
    example: 'Buna',
    meaning: 'Coffee',
    sound: require('../../assets/sounds/oromo/qube/B.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'C',
    pronunciation: 'ca',
    example: 'Cabbii',
    meaning: 'Butter',
    sound: require('../../assets/sounds/oromo/qube/C.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'D',
    pronunciation: 'da',
    example: 'Damma',
    meaning: 'Honey',
    sound: require('../../assets/sounds/oromo/qube/D.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'E',
    pronunciation: 'ee',
    example: 'Eeboo',
    meaning: 'Spear',
    sound: require('../../assets/sounds/oromo/qube/E.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'F',
    pronunciation: 'fa',
    example: 'Farda',
    meaning: 'Horse',
    sound: require('../../assets/sounds/oromo/qube/F.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'G',
    pronunciation: 'ga',
    example: 'Gurbaa',
    meaning: 'Boy',
    sound: require('../../assets/sounds/oromo/qube/G.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'H',
    pronunciation: 'ha',
    example: 'Hoolaa',
    meaning: 'Sheep',
    sound: require('../../assets/sounds/oromo/qube/H.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'I',
    pronunciation: 'i',
    example: 'Ijoollee',
    meaning: 'Children',
    sound: require('../../assets/sounds/oromo/qube/I.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'J',
    pronunciation: 'ja',
    example: 'Jabbii',
    meaning: 'Calf',
    sound: require('../../assets/sounds/oromo/qube/J.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'K',
    pronunciation: 'ka',
    example: 'Kitaaba',
    meaning: 'Book',
    sound: require('../../assets/sounds/oromo/qube/k.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'L',
    pronunciation: 'la',
    example: 'Laga',
    meaning: 'River',
    sound: require('../../assets/sounds/oromo/qube/L.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'M',
    pronunciation: 'ma',
    example: 'Mana',
    meaning: 'House',
    sound: require('../../assets/sounds/oromo/qube/M.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'N',
    pronunciation: 'na',
    example: 'Nama',
    meaning: 'Person',
    sound: require('../../assets/sounds/oromo/qube/N.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'O',
    pronunciation: 'o',
    example: 'Oromiyaa',
    meaning: 'Oromia',
    sound: require('../../assets/sounds/oromo/qube/o.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'P',
    pronunciation: 'pa',
    example: 'Paappaya',
    meaning: 'Papaya',
    sound: require('../../assets/sounds/oromo/qube/p.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'Q',
    pronunciation: 'qa',
    example: 'Qabeenya',
    meaning: 'Wealth',
    sound: require('../../assets/sounds/oromo/qube/Q.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'R',
    pronunciation: 'ra',
    example: 'Rooba',
    meaning: 'Rain',
    sound: require('../../assets/sounds/oromo/qube/R.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'S',
    pronunciation: 'sa',
    example: 'Sagalee',
    meaning: 'Voice',
    sound: require('../../assets/sounds/oromo/qube/s.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'T',
    pronunciation: 'ta',
    example: 'Tulluu',
    meaning: 'Mountain',
    sound: require('../../assets/sounds/oromo/qube/T.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'U',
    pronunciation: 'u',
    example: 'Urjii',
    meaning: 'Star',
    sound: require('../../assets/sounds/oromo/qube/U.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'V',
    pronunciation: 'va',
    example: 'Vaayirusii',
    meaning: 'Virus',
    sound: require('../../assets/sounds/oromo/qube/v.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'W',
    pronunciation: 'wa',
    example: 'Waaqa',
    meaning: 'God/Sky',
    sound: require('../../assets/sounds/oromo/qube/W.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'X',
    pronunciation: 'xa',
    example: 'Xalayaa',
    meaning: 'Letter',
    sound: require('../../assets/sounds/oromo/qube/x.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'Y',
    pronunciation: 'ya',
    example: 'Yaada',
    meaning: 'Idea',
    sound: require('../../assets/sounds/oromo/qube/Y.m4a'),
    category: 'Qubee'
  },
  {
    letter: 'Z',
    pronunciation: 'za',
    example: 'Zeyituuna',
    meaning: 'Olive',
    sound: require('../../assets/sounds/oromo/qube/Z.m4a'),
    category: 'Qubee'
  },

  // Numbers Category - Adding counting in Oromo
  {
    letter: '1',
    pronunciation: 'Tokko',
    example: '1',
    meaning: 'One',
    sound: require('../../assets/sounds/oromo/numbers/1.m4a'),
    category: 'Lakkoofsa'
  },
  {
    letter: '2',
    pronunciation: 'Lama',
    example: '2',
    meaning: 'Two',
    sound: require('../../assets/sounds/oromo/numbers/2.m4a'),
    category: 'Lakkoofsa'
  },
  {
    letter: '3',
    pronunciation: 'Sadii',
    example: '3',
    meaning: 'Three',
    sound: require('../../assets/sounds/oromo/numbers/3.m4a'),
    category: 'Lakkoofsa'
  },
  {
    letter: '4',
    pronunciation: 'Afur',
    example: '4',
    meaning: 'Four',
    sound: require('../../assets/sounds/oromo/numbers/4.m4a'),
    category: 'Lakkoofsa'
  },
  {
    letter: '5',
    pronunciation: 'Shan',
    example: '5', 
    meaning: 'Five',
    sound: require('../../assets/sounds/oromo/numbers/5.m4a'),
    category: 'Lakkoofsa'
  },
  {
    letter: '6',
    pronunciation: 'Jaha',
    example: '6',
    meaning: 'Six',
    sound: require('../../assets/sounds/oromo/numbers/6.m4a'),
    category: 'Lakkoofsa'
  },
  {
    letter: '7',
    pronunciation: 'Torba',
    example: '7',
    meaning: 'Seven',
    sound: require('../../assets/sounds/oromo/numbers/7.m4a'),
    category: 'Lakkoofsa'
  },
  {
    letter: '8',
    pronunciation: 'Saddeet',
    example: '8',
    meaning: 'Eight',
    sound: require('../../assets/sounds/oromo/numbers/8.m4a'),
    category: 'Lakkoofsa'
  },
  {
    letter: '9',
    pronunciation: 'Sagal',
    example: '9',
    meaning: 'Nine',
    sound: require('../../assets/sounds/oromo/numbers/9.m4a'),
    category: 'Lakkoofsa'
  },
  {
    letter: '10',
    pronunciation: 'Kudhan',
    example: '10',
    meaning: 'Ten',
    sound: require('../../assets/sounds/oromo/numbers/10.m4a'),
    category: 'Lakkoofsa'
  },
  {
    letter: '11',
    pronunciation: 'Kudha Tokko',
    example: '11',
    meaning: 'Eleven',
    sound: require('../../assets/sounds/oromo/numbers/11.m4a'),
    category: 'Lakkoofsa'
  },
  {
    letter: '12',
    pronunciation: 'Kudha Lama',
    example: '12',
    meaning: 'Twelve',
    sound: require('../../assets/sounds/oromo/numbers/12.m4a'),
    category: 'Lakkoofsa'
  },
  {
    letter: '13',
    pronunciation: 'Kudha Sadii',
    example: '13',
    meaning: 'Thirteen',
    sound: require('../../assets/sounds/oromo/numbers/13.m4a'),
    category: 'Lakkoofsa'
  },
  {
    letter: '14',
    pronunciation: 'Kudha Afur',
    example: '14',
    meaning: 'Fourteen',
    sound: require('../../assets/sounds/oromo/numbers/14.m4a'),
    category: 'Lakkoofsa'
  },
  {
    letter: '15',
    pronunciation: 'Kudha Shan',
    example: '15',
    meaning: 'Fifteen',
    sound: require('../../assets/sounds/oromo/numbers/15.m4a'),
    category: 'Lakkoofsa'
  },
  {
    letter: '16',
    pronunciation: 'Kudha Jaha',
    example: '16',
    meaning: 'Sixteen',
    sound: require('../../assets/sounds/oromo/numbers/16.m4a'),
    category: 'Lakkoofsa'
  },
  {
    letter: '17',
    pronunciation: 'Kudha Torba',
    example: '17',
    meaning: 'Seventeen',
    sound: require('../../assets/sounds/oromo/numbers/17.m4a'),
    category: 'Lakkoofsa'
  },
  {
    letter: '18',
    pronunciation: 'Kudha Saddeet',
    example: '18',
    meaning: 'Eighteen',
    sound: require('../../assets/sounds/oromo/numbers/18.m4a'),
    category: 'Lakkoofsa'
  },
  {
    letter: '19',
    pronunciation: 'Kudha Sagal',
    example: '19',
    meaning: 'Nineteen',
    sound: require('../../assets/sounds/oromo/numbers/19.m4a'),
    category: 'Lakkoofsa'
  },
  {
    letter: '20',
    pronunciation: 'Digdama',
    example: '20',
    meaning: 'Twenty',
    sound: require('../../assets/sounds/oromo/numbers/20.m4a'),
    category: 'Lakkoofsa'
  },

  // Family Category - Expanded
  {
    word: 'Abbaa',
    pronunciation: 'Ab-baa',
    meaning: 'Father',
    sound: require('../../assets/sounds/oromo/father.mp3'),
    category: 'Maatii'
  },
  {
    word: 'Haadha',
    pronunciation: 'Haa-dha',
    meaning: 'Mother',
    sound: require('../../assets/sounds/oromo/mother.mp3'),
    category: 'Maatii'
  },
  {
    word: 'Obboleessa',
    pronunciation: 'Ob-bo-lees-sa',
    meaning: 'Brother',
    sound: require('../../assets/sounds/oromo/father.mp3'), // Placeholder
    category: 'Maatii'
  },
  {
    word: 'Obboleettii',
    pronunciation: 'Ob-bo-leet-tii',
    meaning: 'Sister',
    sound: require('../../assets/sounds/oromo/mother.mp3'), // Placeholder
    category: 'Maatii'
  },
  {
    word: 'Akkaakayuu',
    pronunciation: 'Ak-kaa-ka-yuu',
    meaning: 'Grandfather',
    sound: require('../../assets/sounds/oromo/father.mp3'), // Placeholder
    category: 'Maatii'
  },
  {
    word: 'Akkaakoo',
    pronunciation: 'Ak-kaa-koo',
    meaning: 'Grandmother',
    sound: require('../../assets/sounds/oromo/mother.mp3'), // Placeholder
    category: 'Maatii'
  },
  {
    word: 'Ilma',
    pronunciation: 'Il-ma',
    meaning: 'Son',
    sound: require('../../assets/sounds/oromo/father.mp3'), // Placeholder
    category: 'Maatii'
  },
  {
    word: 'Intala',
    pronunciation: 'In-ta-la',
    meaning: 'Daughter',
    sound: require('../../assets/sounds/oromo/mother.mp3'), // Placeholder
    category: 'Maatii'
  },

  // Basic Words Category - Expanded
  {
    word: 'Bishaan',
    pronunciation: 'Bi-shaan',
    meaning: 'Water',
    sound: require('../../assets/sounds/oromo/water.mp3'),
    category: 'Jecha Bu\'uraa'
  },
  {
    word: 'Nyaata',
    pronunciation: 'Nya-ata',
    meaning: 'Food',
    sound: require('../../assets/sounds/oromo/food.mp3'),
    category: 'Jecha Bu\'uraa'
  },
  {
    word: 'Aduu',
    pronunciation: 'A-duu',
    meaning: 'Sun',
    sound: require('../../assets/sounds/oromo/water.mp3'), // Placeholder
    category: 'Jecha Bu\'uraa'
  },
  {
    word: "Ji'a",
    pronunciation: 'Ji-a',
    meaning: 'Moon',
    sound: require('../../assets/sounds/oromo/food.mp3'), // Placeholder
    category: 'Jecha Bu\'uraa'
  },
  {
    word: 'Qilleensa',
    pronunciation: 'Qi-lleen-sa',
    meaning: 'Air',
    sound: require('../../assets/sounds/oromo/water.mp3'), // Placeholder
    category: 'Jecha Bu\'uraa'
  },
  {
    word: 'Lafa',
    pronunciation: 'La-fa',
    meaning: 'Earth',
    sound: require('../../assets/sounds/oromo/food.mp3'), // Placeholder
    category: 'Jecha Bu\'uraa'
  },

  // Greetings Category - Expanded
  {
    word: 'Nagaa',
    pronunciation: 'Na-gaa',
    meaning: 'Peace',
    sound: require('../../assets/sounds/oromo/peace.mp3'),
    category: 'Nagaa'
  },
  {
    word: 'Akkam',
    pronunciation: 'Ak-kam',
    meaning: 'How are you',
    sound: require('../../assets/sounds/oromo/peace.mp3'), // Placeholder
    category: 'Nagaa'
  },
  {
    word: 'Nagaatti',
    pronunciation: 'Na-gaa-tti',
    meaning: 'Goodbye',
    sound: require('../../assets/sounds/oromo/peace.mp3'), // Placeholder
    category: 'Nagaa'
  },
  {
    word: 'Galatoomaa',
    pronunciation: 'Ga-la-too-maa',
    meaning: 'Thank you',
    sound: require('../../assets/sounds/oromo/peace.mp3'), // Placeholder
    category: 'Nagaa'
  }
];

// Quiz questions organized by category
const quizQuestions = {
  Qubee: [
    {
      id: 1,
      question: "Which letter makes the 'ba' sound?",
      options: ["A", "B", "C", "D"],
      correctAnswer: "B",
      image: require('../../assets/images/ball.png') // Reusing existing image
    },
    {
      id: 2,
      question: "Match the letter with its example: 'Buna'",
      options: ["A", "B", "C", "D"],
      correctAnswer: "B",
      image: require('../../assets/images/ball.png')
    },
    {
      id: 3,
      question: "Which letter makes the 'aa' sound?",
      options: ["C", "B", "A", "D"],
      correctAnswer: "A",
      image: require('../../assets/images/ball.png')
    },
    {
      id: 4,
      question: "Which letter means 'Culture' in its example?",
      options: ["A", "B", "C", "D"],
      correctAnswer: "A",
      image: require('../../assets/images/ball.png')
    },
    {
      id: 5,
      question: "What letter is this?",
      soundHint: require('../../assets/sounds/oromo/c.mp3'),
      options: ["A", "B", "C", "D"],
      correctAnswer: "C",
      image: require('../../assets/images/ball.png')
    }
  ],
  Lakkoofsa: [
    {
      id: 1,
      question: "What is the Oromo word for 'Five'?",
      options: ["Lama", "Sadii", "Shan", "Afur"],
      correctAnswer: "Shan",
      soundHint: require('../../assets/sounds/oromo/numbers/5.m4a'),
      image: require('../../assets/images/ball.png')
    },
    {
      id: 2,
      question: "Which number is 'Kudhan' in Oromo?",
      options: ["5", "8", "10", "12"],
      correctAnswer: "10",
      soundHint: require('../../assets/sounds/oromo/numbers/10.m4a'),
      image: require('../../assets/images/ball.png')
    },
    {
      id: 3,
      question: "What is the Oromo word for '3'?",
      options: ["Tokko", "Lama", "Sadii", "Afur"],
      correctAnswer: "Sadii",
      soundHint: require('../../assets/sounds/oromo/numbers/3.m4a'),
      image: require('../../assets/images/ball.png')
    },
    {
      id: 4,
      question: "Which number is 'Jaha' in Oromo?",
      options: ["4", "6", "8", "9"],
      correctAnswer: "6",
      soundHint: require('../../assets/sounds/oromo/numbers/6.m4a'),
      image: require('../../assets/images/ball.png')
    },
    {
      id: 5,
      question: "What does 'Digdama' mean?",
      options: ["Ten", "Fifteen", "Twenty", "Hundred"],
      correctAnswer: "Twenty",
      soundHint: require('../../assets/sounds/oromo/numbers/20.m4a'),
      image: require('../../assets/images/ball.png')
    }
  ],
  Maatii: [
    {
      id: 1,
      question: "Which word means 'Father'?",
      options: ["Abbaa", "Haadha", "Obboleessa", "Ilma"],
      correctAnswer: "Abbaa",
      image: require('../../assets/images/teacher.png')
    },
    {
      id: 2,
      question: "Which word means 'Mother'?",
      options: ["Intala", "Haadha", "Obboleettii", "Akkaakoo"],
      correctAnswer: "Haadha",
      image: require('../../assets/images/teacher.png')
    },
    {
      id: 3,
      question: "Match the word with its meaning: 'Brother'",
      options: ["Obboleessa", "Ilma", "Abbaa", "Intala"],
      correctAnswer: "Obboleessa",
      image: require('../../assets/images/teacher.png')
    },
    {
      id: 4,
      question: "Which word means 'Sister'?",
      options: ["Akkaakoo", "Haadha", "Obboleettii", "Abbaa"],
      correctAnswer: "Obboleettii",
      image: require('../../assets/images/teacher.png')
    },
    {
      id: 5,
      question: "Who is this family member?",
      soundHint: require('../../assets/sounds/oromo/father.mp3'),
      options: ["Sister", "Father", "Brother", "Mother"],
      correctAnswer: "Father",
      image: require('../../assets/images/teacher.png')
    }
  ],
  "Jecha Bu'uraa": [
    {
      id: 1,
      question: "Which word means 'Water'?",
      options: ["Bishaan", "Nyaata", "Lafa", "Aduu"],
      correctAnswer: "Bishaan",
      image: require('../../assets/images/ball.png')
    },
    {
      id: 2,
      question: "Which word means 'Food'?",
      options: ["Qilleensa", "Aduu", "Bishaan", "Nyaata"],
      correctAnswer: "Nyaata",
      image: require('../../assets/images/ball.png')
    },
    {
      id: 3,
      question: "Match the word with its meaning: 'Sun'",
      options: ["Lafa", "Ji'a", "Aduu", "Qilleensa"],
      correctAnswer: "Aduu",
      image: require('../../assets/images/ball.png')
    },
    {
      id: 4,
      question: "Which word means 'Moon'?",
      options: ["Ji'a", "Aduu", "Bishaan", "Lafa"],
      correctAnswer: "Ji'a",
      image: require('../../assets/images/ball.png')
    },
    {
      id: 5,
      question: "What does 'Qilleensa' mean?",
      options: ["Water", "Earth", "Air", "Food"],
      correctAnswer: "Air",
      image: require('../../assets/images/ball.png')
    }
  ],
  Nagaa: [
    {
      id: 1,
      question: "Which word means 'Peace'?",
      options: ["Nagaa", "Akkam", "Nagaatti", "Galatoomaa"],
      correctAnswer: "Nagaa",
      image: require('../../assets/images/teacher.png')
    },
    {
      id: 2,
      question: "Which greeting means 'How are you'?",
      options: ["Nagaatti", "Nagaa", "Galatoomaa", "Akkam"],
      correctAnswer: "Akkam",
      image: require('../../assets/images/teacher.png')
    },
    {
      id: 3,
      question: "Match the word with its meaning: 'Goodbye'",
      options: ["Nagaa", "Galatoomaa", "Nagaatti", "Akkam"],
      correctAnswer: "Nagaatti",
      image: require('../../assets/images/teacher.png')
    },
    {
      id: 4,
      question: "Which word means 'Thank you'?",
      options: ["Nagaa", "Galatoomaa", "Nagaatti", "Akkam"],
      correctAnswer: "Galatoomaa",
      image: require('../../assets/images/teacher.png')
    },
    {
      id: 5,
      question: "What does 'Akkam' mean?",
      options: ["Peace", "Goodbye", "How are you", "Thank you"],
      correctAnswer: "How are you",
      image: require('../../assets/images/teacher.png')
    }
  ]
};

const categories = [...new Set(oromoContent.map(item => item.category))];

export default function OromoLessonScreen() {
  const navigation = useNavigation();
  const { currentTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('Qubee');
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
      Alert.alert(
        'Sound Not Available',
        'The sound file for this item is not available yet.',
        [{ text: 'OK' }]
      );
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const filteredContent = oromoContent.filter(item => item.category === selectedCategory);

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
      // Get child ID from navigation params or use default
      const childId = navigation.getState()?.routes?.find(r => r.name === 'OromoLessonScreen')?.params?.childId || '1';
      const childName = navigation.getState()?.routes?.find(r => r.name === 'OromoLessonScreen')?.params?.childName || 'Child';
      
      // Get existing results
      const existingResultsJson = await AsyncStorage.getItem('quizResults');
      const existingResults = existingResultsJson ? JSON.parse(existingResultsJson) : [];
      
      // Add new result
      const newResult = {
        id: Date.now().toString(),
        childId, // Add childId to the result
        childName, // Also save the child's name
        category: quizCategory,
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
            style={styles.nextButton}
            onPress={closeQuiz}
          >
            <Text style={styles.nextButtonText}>Back to Lessons</Text>
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
          
          {currentQuestion.soundHint && (
            <TouchableOpacity
              style={styles.soundButton}
              onPress={() => playSound(currentQuestion.soundHint)}
            >
              <Ionicons name="volume-high" size={24} color="white" />
              <Text style={styles.soundButtonText}>Listen</Text>
            </TouchableOpacity>
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
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme?.background || '#1A1B41' }]}>
      {!showQuiz ? (
        // Learning screen
        <>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButtonHeader}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
        <Text style={styles.headerText}>Learn Oromo</Text>
            <View style={{ width: 24 }} />
          </View>

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
                <View
              key={item.letter || item.word}
              style={styles.card}
            >
              <TouchableOpacity
                    style={[
                      styles.button,
                      item.category === 'Maatii' && styles.familyButton,
                      item.category === 'Jecha Bu\'uraa' && styles.basicWordsButton,
                      item.category === 'Nagaa' && styles.greetingsButton,
                      item.category === 'Lakkoofsa' && styles.numbersButton
                    ]}
                onPress={() => playSound(item.sound)}
                activeOpacity={0.7}
              >
                <Text style={styles.mainText}>
                  {item.letter || item.word}
                </Text>
                <Text style={styles.pronunciationText}>
                  ({item.pronunciation})
                </Text>
                {item.example && (
                  <Text style={styles.exampleText}>
                    {item.example}
                  </Text>
                )}
                    <Text style={[
                      styles.meaningText,
                      item.category === 'Maatii' && styles.familyMeaning,
                      item.category === 'Jecha Bu\'uraa' && styles.basicWordsMeaning,
                      item.category === 'Nagaa' && styles.greetingsMeaning,
                      item.category === 'Lakkoofsa' && styles.numbersMeaning
                    ]}>
                  {item.meaning}
                </Text>
                    <View style={[
                      styles.soundIcon,
                      item.category === 'Maatii' && styles.familySoundIcon,
                      item.category === 'Jecha Bu\'uraa' && styles.basicWordsSoundIcon,
                      item.category === 'Nagaa' && styles.greetingsSoundIcon,
                      item.category === 'Lakkoofsa' && styles.numbersSoundIcon
                    ]}>
                      <Ionicons name="volume-high" size={16} color="white" />
                    </View>
                  </TouchableOpacity>
                </View>
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
                      category === 'Maatii' && styles.familyQuizButton,
                      category === 'Jecha Bu\'uraa' && styles.basicWordsQuizButton,
                      category === 'Nagaa' && styles.greetingsQuizButton,
                      category === 'Qubee' && styles.alphabetQuizButton,
                      category === 'Lakkoofsa' && styles.numbersQuizButton
                    ]}
                    onPress={() => startQuiz(category)}
                  >
                    <Text style={styles.quizButtonText}>{category} Quiz</Text>
                    <Ionicons name="school" size={20} color="white" />
        </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    marginVertical: 10,
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
    backgroundColor: '#FFA500',
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
    paddingBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  card: {
    width: width > 500 ? '30%' : '45%',
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
  familyButton: {
    borderLeftWidth: 5,
    borderLeftColor: '#FF6B8B',
  },
  basicWordsButton: {
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  greetingsButton: {
    borderLeftWidth: 5,
    borderLeftColor: '#2196F3',
  },
  numbersButton: {
    borderLeftWidth: 5,
    borderLeftColor: '#FF9800',
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
  exampleText: {
    fontSize: 14,
    color: '#FFA500',
    textAlign: 'center',
    marginBottom: 5,
  },
  meaningText: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
  },
  familyMeaning: {
    color: '#FF6B8B',
  },
  basicWordsMeaning: {
    color: '#4CAF50',
  },
  greetingsMeaning: {
    color: '#2196F3',
  },
  numbersMeaning: {
    color: '#FF9800',
  },
  soundIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FFA500',
    borderRadius: 12,
    padding: 5,
  },
  familySoundIcon: {
    backgroundColor: '#FF6B8B',
  },
  basicWordsSoundIcon: {
    backgroundColor: '#4CAF50',
  },
  greetingsSoundIcon: {
    backgroundColor: '#2196F3',
  },
  numbersSoundIcon: {
    backgroundColor: '#FF9800',
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
    backgroundColor: '#FF9800',
  },
  familyQuizButton: {
    backgroundColor: '#FF6B8B',
  },
  basicWordsQuizButton: {
    backgroundColor: '#4CAF50',
  },
  greetingsQuizButton: {
    backgroundColor: '#2196F3',
  },
  numbersQuizButton: {
    backgroundColor: '#FF9800',
  },
  quizButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
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
  soundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFA500',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 20,
    alignSelf: 'center',
  },
  soundButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
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
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
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
  }
}); 