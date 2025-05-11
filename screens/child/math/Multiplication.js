import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function MultiplicationScreen() {
  const navigation = useNavigation();
  const { currentTheme } = useTheme();
  const [currentProblem, setCurrentProblem] = useState({
    num1: 2,
    num2: 2,
    result: 4
  });
  const [showResult, setShowResult] = useState(false);

  // Generate an age-appropriate problem
  const generateProblem = () => {
    // Keep numbers very small for young children (1-3)
    const num1 = Math.floor(Math.random() * 3) + 1; // 1-3
    const num2 = Math.floor(Math.random() * 3) + 1; // 1-3
    setCurrentProblem({
      num1,
      num2,
      result: num1 * num2
    });
    setShowResult(false);
  };

  const revealAnswer = () => {
    setShowResult(true);
  };

  // Create a visual representation of the multiplication as groups
  const renderMultiplicationGroups = () => {
    const groups = [];
    
    for (let i = 0; i < currentProblem.num1; i++) {
      const group = (
        <View key={`group-${i}`} style={styles.group}>
          {[...Array(currentProblem.num2)].map((_, j) => (
            <Image
              key={`ball-${i}-${j}`}
              source={require('../../../assets/images/ball.png')}
              style={styles.ballImage}
            />
          ))}
        </View>
      );
      groups.push(group);
    }
    
    return groups;
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
        <Text style={styles.headerText}>Multiplication</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.card}>
        <View style={styles.titleBar}>
          <Text style={styles.titleText}>Let's Multiply Numbers!</Text>
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
                {currentProblem.num1} × {currentProblem.num2} = {showResult ? currentProblem.result : "?"}
              </Text>
            </View>

            <View style={styles.visualContainer}>
              <Text style={styles.explanationText}>
                {currentProblem.num1} groups of {currentProblem.num2}
              </Text>
              
              {renderMultiplicationGroups()}
              
              {showResult && (
                <>
                  <View style={styles.equalsContainer}>
                    <Text style={styles.equalsText}>=</Text>
                  </View>
                  
                  <Text style={styles.resultText}>
                    {currentProblem.result} total
                  </Text>
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
    backgroundColor: '#A066FF',
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
    color: '#A066FF',
    marginBottom: 10,
  },
  group: {
    flexDirection: 'row',
    backgroundColor: '#F0F0FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0D0FF',
    padding: 5,
    margin: 5,
    justifyContent: 'center',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A066FF',
    marginTop: 5,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
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
