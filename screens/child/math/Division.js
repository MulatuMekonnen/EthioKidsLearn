import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView,
  Dimensions,
  ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Define difficulty levels based on age groups
const DIFFICULTY_LEVELS = {
  BEGINNER: {
    // Ages 5-6
    divisors: [2, 3], // Simple divisors
    maxResult: 3,     // Small quotients
    minResult: 1
  },
  INTERMEDIATE: {
    // Ages 7-9
    divisors: [2, 3, 4, 5], // More divisors
    maxResult: 5,           // Larger quotients
    minResult: 2
  },
  ADVANCED: {
    // Ages 10+
    divisors: [2, 3, 4, 5, 6, 7, 8, 9, 10], // All single-digit divisors
    maxResult: 10,                          // Larger quotients
    minResult: 3
  }
};

export default function DivisionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentTheme } = useTheme();
  const [currentProblem, setCurrentProblem] = useState({
    num1: 6,
    num2: 2,
    result: 3
  });
  const [showResult, setShowResult] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState(DIFFICULTY_LEVELS.BEGINNER);
  const [childInfo, setChildInfo] = useState(null);

  useEffect(() => {
    // Get child info if available in route params
    const childId = route.params?.childId;
    const childName = route.params?.childName;
    
    if (childId && childName) {
      loadChildInfo(childId, childName);
    } else {
      loadDefaultChild();
    }
  }, [route.params]);

  useEffect(() => {
    // Set difficulty level based on child's age or level
    if (childInfo) {
      setDifficultyBasedOnChild();
    }
    
    // Generate initial problem
    generateProblem();
  }, [childInfo, difficultyLevel]);

  const loadChildInfo = async (childId, childName) => {
    try {
      const savedChildren = await AsyncStorage.getItem('children');
      if (savedChildren) {
        const children = JSON.parse(savedChildren);
        const child = children.find(c => c.id === childId);
        if (child) {
          setChildInfo(child);
        } else {
          setChildInfo({ id: childId, name: childName });
        }
      } else {
        setChildInfo({ id: childId, name: childName });
      }
    } catch (error) {
      console.error('Error loading child information:', error);
      setChildInfo({ id: childId, name: childName });
    }
  };

  const loadDefaultChild = async () => {
    try {
      const savedChildren = await AsyncStorage.getItem('children');
      if (savedChildren) {
        const children = JSON.parse(savedChildren);
        if (children.length > 0) {
          setChildInfo(children[0]);
        }
      }
    } catch (error) {
      console.error('Error loading default child:', error);
    }
  };

  const setDifficultyBasedOnChild = () => {
    if (!childInfo) return;

    // Set difficulty based on child's level or age
    if (childInfo.level === 'Advanced' || (childInfo.age && childInfo.age >= 10)) {
      setDifficultyLevel(DIFFICULTY_LEVELS.ADVANCED);
    } else if (childInfo.level === 'Intermediate' || (childInfo.age && childInfo.age >= 7)) {
      setDifficultyLevel(DIFFICULTY_LEVELS.INTERMEDIATE);
    } else {
      setDifficultyLevel(DIFFICULTY_LEVELS.BEGINNER);
    }
  };

  // Generate an age-appropriate problem
  const generateProblem = () => {
    // Get random divisor from the appropriate range
    const divisorIndex = Math.floor(Math.random() * difficultyLevel.divisors.length);
    const num2 = difficultyLevel.divisors[divisorIndex];
    
    // Get random result from the appropriate range
    const resultRange = difficultyLevel.maxResult - difficultyLevel.minResult + 1;
    const result = Math.floor(Math.random() * resultRange) + difficultyLevel.minResult;
    
    // Calculate dividend (ensure clean division)
    const num1 = num2 * result;
    
    setCurrentProblem({
      num1,
      num2,
      result
    });
    setShowResult(false);
  };

  const revealAnswer = () => {
    setShowResult(true);
  };

  // Get difficulty text for display
  const getDifficultyText = () => {
    if (difficultyLevel === DIFFICULTY_LEVELS.ADVANCED) {
      return "Advanced";
    } else if (difficultyLevel === DIFFICULTY_LEVELS.INTERMEDIATE) {
      return "Intermediate";
    } else {
      return "Beginner";
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme?.background || '#1A1B41' }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Division</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.card}>
          <View style={styles.titleBar}>
            <Text style={styles.titleText}>Let's Divide Things!</Text>
            <Text style={styles.difficultyText}>Level: {getDifficultyText()}</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.problemContainer}>
              <View style={styles.teacherImageContainer}>
                <Image
                  source={require('../../../assets/images/teacher.png')}
                  style={styles.teacherImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.equationContainer}>
                <Text style={styles.equationText}>
                  {currentProblem.num1} ÷ {currentProblem.num2} = {showResult ? currentProblem.result : "?"}
                </Text>
              </View>

              <View style={styles.visualContainer}>
                <Text style={styles.explanationText}>
                  Let's divide {currentProblem.num1} balls into {currentProblem.num2} equal groups
                </Text>
                
                <View style={styles.ballsContainer}>
                  {[...Array(currentProblem.num1)].map((_, i) => (
                    <Image
                      key={`ball-${i}`}
                      source={require('../../../assets/images/ball.png')}
                      style={styles.ballImage}
                    />
                  ))}
                </View>

                {showResult && (
                  <>
                    <View style={styles.equalsContainer}>
                      <Text style={styles.equalsText}>=</Text>
                    </View>
                    
                    <Text style={styles.resultText}>
                      {currentProblem.result} balls in each group
                    </Text>
                    
                    <View style={styles.groupsContainer}>
                      {[...Array(currentProblem.num2)].map((_, groupIndex) => (
                        <View key={`group-${groupIndex}`} style={styles.group}>
                          {[...Array(currentProblem.result)].map((_, ballIndex) => (
                            <Image
                              key={`group-${groupIndex}-ball-${ballIndex}`}
                              source={require('../../../assets/images/ball.png')}
                              style={styles.groupBallImage}
                            />
                          ))}
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              {!showResult ? (
                <TouchableOpacity
                  style={styles.answerButton}
                  onPress={revealAnswer}
                >
                  <Text style={styles.answerButtonText}>Show Answer</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={generateProblem}
                >
                  <Text style={styles.nextButtonText}>Next Problem</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 16,
    overflow: 'hidden',
    flex: 1,
  },
  titleBar: {
    backgroundColor: '#32CD32',
    paddingVertical: 12,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  difficultyText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 4,
  },
  content: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  teacherImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  teacherImage: {
    width: 100,
    height: 100,
  },
  problemContainer: {
    alignItems: 'center',
  },
  equationContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 15,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#4A6FA5',
  },
  equationText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1B41',
    textAlign: 'center',
  },
  visualContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  explanationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#32CD32',
    marginBottom: 15,
    textAlign: 'center',
  },
  ballsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
    maxWidth: '100%',
  },
  ballImage: {
    width: 40,
    height: 40,
    margin: 3,
  },
  equalsContainer: {
    marginVertical: 10,
    backgroundColor: '#E6F7FF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  equalsText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4682B4',
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#32CD32',
    marginVertical: 10,
    textAlign: 'center',
  },
  groupsContainer: {
    marginTop: 10,
    width: '100%',
  },
  group: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#F0FFF0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCFFCC',
    padding: 5,
    margin: 5,
  },
  groupBallImage: {
    width: 35,
    height: 35,
    margin: 3,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  answerButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  answerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 