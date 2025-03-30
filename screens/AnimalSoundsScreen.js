import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';

const animals = [
  {
    name: 'Lion',
    image: require('../assets/images/animals/lion.png'),
    sound: require('../assets/sounds/animals/lion.mp3'),
    category: 'Wild Animals'
  },
  {
    name: 'Tiger',
    image: require('../assets/images/animals/tiger.png'),
    sound: require('../assets/sounds/animals/tiger.mp3'),
    category: 'Wild Animals'
  },
  {
    name: 'Monkey',
    image: require('../assets/images/animals/monkey.png'),
    sound: require('../assets/sounds/animals/monkey.mp3'),
    category: 'Wild Animals'
  },
  {
    name: 'Hyena',
    image: require('../assets/images/animals/hyena.png'),
    sound: require('../assets/sounds/animals/hyena.mp3'),
    category: 'Wild Animals'
  },
  {
    name: 'Cow',
    image: require('../assets/images/animals/cow.png'),
    sound: require('../assets/sounds/animals/cow.mp3'),
    category: 'Farm Animals'
  },
  {
    name: 'Sheep',
    image: require('../assets/images/animals/sheep.png'),
    sound: require('../assets/sounds/animals/sheep.mp3'),
    category: 'Farm Animals'
  },
  {
    name: 'Horse',
    image: require('../assets/images/animals/horse.png'),
    sound: require('../assets/sounds/animals/horse.mp3'),
    category: 'Farm Animals'
  },
  {
    name: 'Donkey',
    image: require('../assets/images/animals/donkey.png'),
    sound: require('../assets/sounds/animals/donkey.mp3'),
    category: 'Farm Animals'
  },
  {
    name: 'Ox',
    image: require('../assets/images/animals/ox.png'),
    sound: require('../assets/sounds/animals/ox.mp3'),
    category: 'Farm Animals'
  },
  {
    name: 'Cat',
    image: require('../assets/images/animals/cat.png'),
    sound: require('../assets/sounds/animals/cat.mp3'),
    category: 'Pets'
  },
  {
    name: 'Dog',
    image: require('../assets/images/animals/dog.png'),
    sound: require('../assets/sounds/animals/dog.mp3'),
    category: 'Pets'
  },
  {
    name: 'Chicken',
    image: require('../assets/images/animals/chicken.png'),
    sound: require('../assets/sounds/animals/chicken.mp3'),
    category: 'Farm Animals'
  }
];

const categories = [...new Set(animals.map(animal => animal.category))];

export default function AnimalSoundsScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sound, setSound] = useState();

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

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const filteredAnimals = selectedCategory === 'All' 
    ? animals 
    : animals.filter(animal => animal.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <Animatable.View 
        animation="fadeIn"
        style={styles.header}
      >
        <Text style={styles.headerText}>Animal Sounds</Text>
      </Animatable.View>

      <View style={styles.categoryContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'All' && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory('All')}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === 'All' && styles.selectedCategoryText
            ]}>All</Text>
          </TouchableOpacity>
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
          {filteredAnimals.map((animal, index) => (
            <Animatable.View
              key={animal.name}
              animation="zoomIn"
              delay={index * 100}
              style={styles.animalCard}
            >
              <TouchableOpacity
                style={styles.animalButton}
                onPress={() => playSound(animal.sound)}
                activeOpacity={0.7}
              >
                <Image 
                  source={animal.image}
                  style={styles.animalImage}
                  resizeMode="contain"
                />
                <Text style={styles.animalName}>{animal.name}</Text>
                <View style={styles.soundIcon}>
                  <Image 
                    source={require('../assets/images/speaker.png')}
                    style={styles.speakerImage}
                  />
                </View>
              </TouchableOpacity>
            </Animatable.View>
          ))}
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
    backgroundColor: '#2196F3',
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
  animalCard: {
    width: '45%',
    aspectRatio: 1,
    margin: 8,
  },
  animalButton: {
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
  animalImage: {
    width: '80%',
    height: '70%',
    marginBottom: 10,
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1B41',
    textAlign: 'center',
  },
  soundIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#2196F3',
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
}); 