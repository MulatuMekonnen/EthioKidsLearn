import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

const EnglishCharacter = ({ letter, color, delay, hasChild }) => (
  <Animatable.View
    animation="bounceIn"
    delay={delay}
    style={[styles.characterContainer, hasChild && styles.characterWithChild]}
  >
    <Text style={[styles.letter, { color }]}>{letter}</Text>
    {hasChild && (
      <Animatable.View
        animation="fadeIn"
        delay={delay + 500}
        style={[styles.childIcon, { backgroundColor: color }]}
      >
        <Text style={styles.childEmoji}>👶</Text>
      </Animatable.View>
    )}
  </Animatable.View>
);

export default function EnglishLessonScreen() {
  const navigation = useNavigation();

  const characters = [
    { letter: 'E', color: '#FF69B4', hasChild: true },
    { letter: 'n', color: '#FFA500', hasChild: false },
    { letter: 'g', color: '#32CD32', hasChild: true },
    { letter: 'l', color: '#1E90FF', hasChild: false },
    { letter: 'i', color: '#FF69B4', hasChild: true },
    { letter: 's', color: '#9370DB', hasChild: false },
    { letter: 'h', color: '#4169E1', hasChild: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* English Characters with Children */}
        <View style={styles.headerContainer}>
          <View style={styles.charactersRow}>
            {characters.map((char, index) => (
              <EnglishCharacter
                key={index}
                letter={char.letter}
                color={char.color}
                delay={index * 100}
                hasChild={char.hasChild}
              />
            ))}
          </View>
        </View>

        {/* Main Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Alphabets Button */}
          <Animatable.View
            animation="fadeInUp"
            delay={800}
            style={styles.buttonWrapper}
          >
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#FFA500' }]}
              onPress={() => navigation.navigate('AlphabetsLesson')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Alphabets</Text>
            </TouchableOpacity>
          </Animatable.View>

          {/* Words Button */}
          <Animatable.View
            animation="fadeInUp"
            delay={1000}
            style={styles.buttonWrapper}
          >
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#00FF00' }]}
              onPress={() => navigation.navigate('WordsLesson')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Words</Text>
            </TouchableOpacity>
          </Animatable.View>

          {/* Take Quiz Button */}
          <Animatable.View
            animation="fadeInUp"
            delay={1200}
            style={styles.buttonWrapper}
          >
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#FFFF00' }]}
              onPress={() => navigation.navigate('EnglishQuiz')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Take Quiz</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
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
  },
  headerContainer: {
    height: width * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  charactersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  characterContainer: {
    alignItems: 'center',
    marginHorizontal: 2,
    marginVertical: 10,
  },
  characterWithChild: {
    marginTop: 30,
  },
  letter: {
    fontSize: 40,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  childIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -25,
  },
  childEmoji: {
    fontSize: 20,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonWrapper: {
    width: '100%',
    marginVertical: 10,
  },
  button: {
    width: '100%',
    paddingVertical: 20,
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
  buttonText: {
    color: '#000000',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
}); 