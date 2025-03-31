import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';

export default function MultiplicationScreen() {
  const navigation = useNavigation();
  const [sound, setSound] = useState();
  const [currentProblem, setCurrentProblem] = useState({
    num1: 2,
    num2: 3,
    result: 6
  });

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/correct.mp3')
    );
    setSound(sound);
    await sound.playAsync();
  }

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerText}>let us try!</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.teacherContainer}>
            <Image
              source={require('../../assets/images/teacher.png')}
              style={styles.teacherImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.problemContainer}>
            <View style={styles.equation}>
              <Text style={styles.equationText}>
                {currentProblem.num1} × {currentProblem.num2} =
              </Text>
              <Animatable.Text
                animation="bounceIn"
                style={styles.resultText}
              >
                {currentProblem.result}
              </Animatable.Text>
            </View>

            <View style={styles.visualHelp}>
              {[...Array(currentProblem.num1)].map((_, i) => (
                <View key={`group-${i}`} style={styles.groupContainer}>
                  {[...Array(currentProblem.num2)].map((_, j) => (
                    <Animatable.Image
                      key={`ball-${i}-${j}`}
                      source={require('../../assets/images/ball.png')}
                      style={styles.helpImage}
                      animation="bounceIn"
                      delay={(i * currentProblem.num2 + j) * 100}
                    />
                  ))}
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.playButton}
              onPress={playSound}
            >
              <Image
                source={require('../../assets/images/play.png')}
                style={styles.playIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => {
          // Generate new problem
          const num1 = Math.floor(Math.random() * 2) + 1; // 1-3
          const num2 = Math.floor(Math.random() * 2) + 1; // 1-3
          setCurrentProblem({
            num1,
            num2,
            result: num1 * num2
          });
        }}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B41',
    padding: 20,
  },
  card: {
    backgroundColor: '#7FFFD4',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    backgroundColor: '#FF7F50',
    padding: 15,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    backgroundColor: '#FFFAF0',
  },
  teacherContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  teacherImage: {
    width: 100,
    height: 100,
  },
  problemContainer: {
    alignItems: 'center',
  },
  equation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  equationText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1B41',
  },
  resultText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF0000',
    marginLeft: 10,
  },
  visualHelp: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  groupContainer: {
    flexDirection: 'row',
    margin: 5,
  },
  helpImage: {
    width: 30,
    height: 30,
    margin: 2,
  },
  playButton: {
    backgroundColor: '#FF0000',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  playIcon: {
    width: 30,
    height: 30,
    tintColor: 'white',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
