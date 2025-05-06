import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

const MathCharacter = ({ character, color, symbol, delay }) => (
  <Animatable.View
    animation="bounceIn"
    delay={delay}
    style={styles.characterContainer}
  >
    <Text style={[styles.mathCharacter, { color }]}>{character}</Text>
    <Text style={[styles.mathSymbol, { color: '#FF69B4' }]}>{symbol}</Text>
  </Animatable.View>
);

const OperatorButton = ({ operator, color = '#FFFFFF' }) => (
  <Text style={[styles.operator, { color }]}>{operator}</Text>
);

export default function MathsLessonScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Math Characters Row */}
        <View style={styles.charactersRow}>
          <MathCharacter character="M" color="#4CAF50" symbol="÷" delay={0} />
          <MathCharacter character="A" color="#FFC107" symbol="+" delay={200} />
          <MathCharacter character="T" color="#2196F3" symbol="-" delay={400} />
          <MathCharacter character="H" color="#FF5252" symbol="×" delay={600} />
        </View>

        {/* Learn to Count Button */}
        <Animatable.View
          animation="fadeInUp"
          delay={800}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            style={[styles.button, styles.countButton]}
            onPress={() => navigation.navigate('LearnToCount')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Learn to count</Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* Operators Section */}
        <Animatable.View
          animation="fadeInUp"
          delay={1000}
          style={[styles.buttonContainer, styles.operatorsContainer]}
        >
          <View style={styles.operatorsRow}>
            <OperatorButton operator="+" />
            <OperatorButton operator="-" />
            <OperatorButton operator="×" />
            <OperatorButton operator="÷" />
          </View>
        </Animatable.View>

        {/* Take Quiz Button */}
        <Animatable.View
          animation="fadeInUp"
          delay={1200}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            style={[styles.button, styles.quizButton]}
            onPress={() => navigation.navigate('MathQuiz')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Take Quiz</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B41',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  charactersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  characterContainer: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  mathCharacter: {
    fontSize: 48,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  mathSymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    position: 'absolute',
    top: -15,
    right: -15,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    width: '80%',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  countButton: {
    backgroundColor: '#2196F3',
  },
  operatorsContainer: {
    backgroundColor: '#FF69B4',
    borderRadius: 15,
    padding: 20,
    width: '80%',
  },
  operatorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  operator: {
    fontSize: 36,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  quizButton: {
    backgroundColor: '#FF0000',
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
}); 