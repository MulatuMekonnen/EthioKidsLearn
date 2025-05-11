import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView,
  Dimensions,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Animal images with sounds for counting
const animals = [
  { 
    name: 'Cat',
    image: require('../../../assets/images/animals/cat.png'),
    sound: require('../../../assets/sounds/animals/cat.mp3')
  },
  { 
    name: 'Dog',
    image: require('../../../assets/images/animals/dog.png'),
    sound: require('../../../assets/sounds/animals/dog.mp3')
  },
  { 
    name: 'Cow',
    image: require('../../../assets/images/animals/cow.png'),
    sound: require('../../../assets/sounds/animals/cow.mp3')
  },
  { 
    name: 'Sheep',
    image: require('../../../assets/images/animals/sheep.png'),
    sound: require('../../../assets/sounds/animals/sheep.mp3')
  },
  { 
    name: 'Lion',
    image: require('../../../assets/images/animals/lion.png'),
    sound: require('../../../assets/sounds/animals/lion.mp3')
  },
  { 
    name: 'Elephant',
    image: require('../../../assets/images/animals/elephant.png'),
    sound: require('../../../assets/sounds/animals/elephant.mp3')
  }
];

// Number sounds for counting
const numberSounds = {
  1: require('../../../assets/sounds/maths/1.m4a'),
  2: require('../../../assets/sounds/maths/2.m4a'),
  3: require('../../../assets/sounds/maths/3.m4a'),
  4: require('../../../assets/sounds/maths/4.m4a'),
  5: require('../../../assets/sounds/maths/5.m4a'),
  6: require('../../../assets/sounds/maths/6.m4a'),
  7: require('../../../assets/sounds/maths/7.m4a'),
  8: require('../../../assets/sounds/maths/8.m4a'),
  9: require('../../../assets/sounds/maths/9.m4a'),
  10: require('../../../assets/sounds/maths/10.m4a')
};

export default function CountGameScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentTheme } = useTheme();
  const [sound, setSound] = useState();
  const [currentAnimal, setCurrentAnimal] = useState(animals[0]);
  const [targetCount, setTargetCount] = useState(3);
  const [userCount, setUserCount] = useState(0);
  const [countedAnimals, setCountedAnimals] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
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

    // Generate initial problem
    generateNewProblem();

    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, []);

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

  // Get appropriate count range based on child's age
  const getAgeAppropriateCount = () => {
    if (!childInfo?.age) return 5; // Default max
    
    if (childInfo.age <= 4) {
      return Math.floor(Math.random() * 3) + 1; // 1-3 for very young children
    } else if (childInfo.age <= 6) {
      return Math.floor(Math.random() * 5) + 1; // 1-5 for young children
    } else {
      return Math.floor(Math.random() * 10) + 1; // 1-10 for older children
    }
  };

  const generateNewProblem = () => {
    // Select random animal
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    setCurrentAnimal(randomAnimal);
    
    // Set new target count based on age
    const newCount = getAgeAppropriateCount();
    setTargetCount(newCount);
    
    // Reset game state
    setUserCount(0);
    setCountedAnimals([]);
    setIsCorrect(null);
  };

  // Play sound when animal is tapped
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
        'The sound for this animal is not available yet.',
        [{ text: 'OK' }]
      );
    }
  }

  // Play number sound
  async function playNumberSound(number) {
    if (numberSounds[number]) {
      playSound(numberSounds[number]);
    }
  }

  // Handle animal tap
  const handleAnimalPress = () => {
    // Play animal sound
    playSound(currentAnimal.sound);
    
    // Limit counting to target
    if (userCount < targetCount) {
      // Increment count and add animal to array
      const newCount = userCount + 1;
      setUserCount(newCount);
      setCountedAnimals([...countedAnimals, { id: Date.now() }]);
      
      // Play number sound after a short delay to not overlap with animal sound
      setTimeout(() => {
        playNumberSound(newCount);
      }, 800);
    }
  };

  // Check if count is correct
  const checkAnswer = () => {
    const correct = userCount === targetCount;
    setIsCorrect(correct);
    
    // Play appropriate feedback sound
    if (correct) {
      playSound(require('../../../assets/sounds/correct.mp3'));
    } else {
      playSound(require('../../../assets/sounds/wrong.mp3'));
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
        <Text style={styles.headerText}>Counting Game</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.card}>
        <View style={styles.titleBar}>
          <Text style={styles.titleText}>Let's Count {currentAnimal.name}s!</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.instructionContainer}>
            <Image
              source={require('../../../assets/images/teacher.png')}
              style={styles.teacherImage}
              resizeMode="contain"
            />
            <Text style={styles.instructionText}>
              Count {targetCount} {currentAnimal.name}s by tapping them
            </Text>
          </View>

          {/* Display the target animal to count */}
          <TouchableOpacity 
            style={styles.animalContainer}
            onPress={handleAnimalPress}
            disabled={isCorrect !== null || userCount >= targetCount}
          >
            <Image
              source={currentAnimal.image}
              style={styles.animalImage}
              resizeMode="contain"
            />
            <View style={styles.soundIcon}>
              <Ionicons name="volume-high" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>

          {/* Display counted animals */}
          <View style={styles.countingContainer}>
            <Text style={styles.countText}>Count: {userCount}</Text>
            <View style={styles.countedAnimalsContainer}>
              {countedAnimals.map((animal, index) => (
                <Animatable.View
                  key={animal.id}
                  animation="bounceIn"
                  duration={500}
                >
                  <Image
                    source={currentAnimal.image}
                    style={styles.countedAnimalImage}
                    resizeMode="contain"
                  />
                </Animatable.View>
              ))}
            </View>
          </View>

          {/* Feedback message */}
          {isCorrect !== null && (
            <Animatable.View 
              animation={isCorrect ? "bounceIn" : "shake"}
              style={[styles.feedbackContainer, isCorrect ? styles.correctFeedback : styles.incorrectFeedback]}
            >
              <Text style={styles.feedbackText}>
                {isCorrect 
                  ? `Great job! You counted ${targetCount} ${currentAnimal.name}s!` 
                  : `Oops! We need exactly ${targetCount} ${currentAnimal.name}s.`}
              </Text>
            </Animatable.View>
          )}

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            {isCorrect === null ? (
              <TouchableOpacity
                style={styles.checkButton}
                onPress={checkAnswer}
                disabled={userCount === 0}
              >
                <Animatable.Text 
                  animation="pulse" 
                  iterationCount="infinite" 
                  style={styles.buttonText}
                >
                  Check
                </Animatable.Text>
              </TouchableOpacity>
            ) : (
              <Animatable.View animation="bounceIn">
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={generateNewProblem}
                >
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </Animatable.View>
            )}
          </View>
        </View>
      </View>
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
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 15,
    padding: 12,
    marginBottom: 20,
  },
  teacherImage: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  instructionText: {
    fontSize: 18,
    flex: 1,
    color: '#1A1B41',
  },
  animalContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  animalImage: {
    width: 120,
    height: 120,
  },
  soundIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    padding: 5,
  },
  countingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  countText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  countedAnimalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  countedAnimalImage: {
    width: 60,
    height: 60,
    margin: 5,
  },
  feedbackContainer: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  correctFeedback: {
    backgroundColor: '#D4EDDA',
  },
  incorrectFeedback: {
    backgroundColor: '#F8D7DA',
  },
  feedbackText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  checkButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#388E3C',
  },
  nextButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#2980B9',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  }
}); 