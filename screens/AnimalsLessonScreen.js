import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';

const animals = [
  { name: 'Lion', sound: require('../assets/sounds/animals/lion.mp3'), image: require('../assets/images/animals/lion.png') },
  { name: 'Elephant', sound: require('../assets/sounds/animals/elephant.mp3'), image: require('../assets/images/animals/elephant.png') },
  { name: 'Giraffe', sound: require('../assets/sounds/animals/giraffe.mp3'), image: require('../assets/images/animals/giraffe.png') },
  { name: 'Zebra', sound: require('../assets/sounds/animals/zebra.mp3'), image: require('../assets/images/animals/zebra.png') },
  { name: 'Monkey', sound: require('../assets/sounds/animals/monkey.mp3'), image: require('../assets/images/animals/monkey.png') },
];

const AnimalsLessonScreen = ({ navigation }) => {
  const [sound, setSound] = React.useState();

  async function playSound(soundFile) {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(soundFile);
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Animal Sounds</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.grid}>
          {animals.map((animal, index) => (
            <Animatable.View
              key={animal.name}
              animation="fadeInUp"
              delay={index * 100}
              style={styles.card}
            >
              <TouchableOpacity
                onPress={() => playSound(animal.sound)}
                style={styles.cardContent}
              >
                <Image
                  source={animal.image}
                  style={styles.animalImage}
                  resizeMode="contain"
                />
                <Text style={styles.animalName}>{animal.name}</Text>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#4CAF50',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  card: {
    width: '50%',
    padding: 8,
  },
  cardContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  animalImage: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default AnimalsLessonScreen; 