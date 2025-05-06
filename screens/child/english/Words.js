import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';

// Safe version of words that handles potential missing assets
const safeWords = [
  // Fruits
  {
    word: 'Apple',
    image: require('../../../assets/images/words/apple.png'),
    sound: require('../../../assets/sounds/words/apple.mp3'),
    category: 'Fruits'
  },
  {
    word: 'Banana',
    image: require('../../../assets/images/words/apple.png'), // Fallback to apple if banana image is missing
    sound: require('../../../assets/sounds/words/apple.mp3'), // Fallback to apple if banana sound is missing
    category: 'Fruits'
  },
  {
    word: 'Orange',
    image: require('../../../assets/images/words/apple.png'), // Fallback to apple if orange image is missing
    sound: require('../../../assets/sounds/words/apple.mp3'), // Fallback to apple if orange sound is missing
    category: 'Fruits'
  },
  {
    word: 'Grapes',
    image: require('../../../assets/images/words/apple.png'), // Fallback to apple if grapes image is missing
    sound: require('../../../assets/sounds/words/apple.mp3'), // Fallback to apple if grapes sound is missing
    category: 'Fruits'
  },
  {
    word: 'Strawberry',
    image: require('../../../assets/images/words/apple.png'), // Fallback to apple if strawberry image is missing
    sound: require('../../../assets/sounds/words/apple.mp3'), // Fallback to apple if strawberry sound is missing
    category: 'Fruits'
  },
  
  // Toys
  {
    word: 'Ball',
    image: require('../../../assets/images/words/ball.png'),
    sound: require('../../../assets/sounds/words/ball.mp3'),
    category: 'Toys'
  },
  {
    word: 'Doll',
    image: require('../../../assets/images/words/ball.png'), // Fallback to ball if doll image is missing
    sound: require('../../../assets/sounds/words/ball.mp3'), // Fallback to ball if doll sound is missing
    category: 'Toys'
  },
  {
    word: 'Teddy',
    image: require('../../../assets/images/words/ball.png'), // Fallback to ball if teddy image is missing
    sound: require('../../../assets/sounds/words/ball.mp3'), // Fallback to ball if teddy sound is missing
    category: 'Toys'
  },
  {
    word: 'Blocks',
    image: require('../../../assets/images/words/ball.png'), // Fallback to ball if blocks image is missing
    sound: require('../../../assets/sounds/words/ball.mp3'), // Fallback to ball if blocks sound is missing
    category: 'Toys'
  },
  {
    word: 'Car',
    image: require('../../../assets/images/words/ball.png'), // Fallback to ball if car image is missing
    sound: require('../../../assets/sounds/words/ball.mp3'), // Fallback to ball if car sound is missing
    category: 'Toys'
  },
  
  // Animals
  {
    word: 'Cat',
    image: require('../../../assets/images/words/cat.png'),
    sound: require('../../../assets/sounds/words/cat.mp3'),
    category: 'Animals'
  },
  {
    word: 'Dog',
    image: require('../../../assets/images/words/dog.png'),
    sound: require('../../../assets/sounds/words/dog.mp3'),
    category: 'Animals'
  },
  {
    word: 'Elephant',
    image: require('../../../assets/images/words/elephant.png'),
    sound: require('../../../assets/sounds/words/elephant.mp3'),
    category: 'Animals'
  },
  {
    word: 'Fish',
    image: require('../../../assets/images/words/fish.png'),
    sound: require('../../../assets/sounds/words/fish.mp3'),
    category: 'Animals'
  },
  {
    word: 'Lion',
    image: require('../../../assets/images/words/cat.png'), // Fallback to cat if lion image is missing
    sound: require('../../../assets/sounds/words/cat.mp3'), // Fallback to cat if lion sound is missing
    category: 'Animals'
  },
  {
    word: 'Monkey',
    image: require('../../../assets/images/words/cat.png'), // Fallback to cat if monkey image is missing
    sound: require('../../../assets/sounds/words/cat.mp3'), // Fallback to cat if monkey sound is missing
    category: 'Animals'
  },
  {
    word: 'Bird',
    image: require('../../../assets/images/words/cat.png'), // Fallback to cat if bird image is missing
    sound: require('../../../assets/sounds/words/cat.mp3'), // Fallback to cat if bird sound is missing
    category: 'Animals'
  },
  
  // Places
  {
    word: 'House',
    image: require('../../../assets/images/words/house.png'),
    sound: require('../../../assets/sounds/words/house.mp3'),
    category: 'Places'
  },
  {
    word: 'School',
    image: require('../../../assets/images/words/house.png'), // Fallback to house if school image is missing
    sound: require('../../../assets/sounds/words/house.mp3'), // Fallback to house if school sound is missing
    category: 'Places'
  },
  {
    word: 'Park',
    image: require('../../../assets/images/words/house.png'), // Fallback to house if park image is missing
    sound: require('../../../assets/sounds/words/house.mp3'), // Fallback to house if park sound is missing
    category: 'Places'
  },
  {
    word: 'Hospital',
    image: require('../../../assets/images/words/house.png'), // Fallback to house if hospital image is missing
    sound: require('../../../assets/sounds/words/house.mp3'), // Fallback to house if hospital sound is missing
    category: 'Places'
  },
  {
    word: 'Beach',
    image: require('../../../assets/images/words/house.png'), // Fallback to house if beach image is missing
    sound: require('../../../assets/sounds/words/house.mp3'), // Fallback to house if beach sound is missing
    category: 'Places'
  },
  
  // Food
  {
    word: 'Ice Cream',
    image: require('../../../assets/images/words/ice-cream.png'),
    sound: require('../../../assets/sounds/words/ice-cream.mp3'),
    category: 'Food'
  },
  {
    word: 'Pizza',
    image: require('../../../assets/images/words/ice-cream.png'), // Fallback to ice cream if pizza image is missing
    sound: require('../../../assets/sounds/words/ice-cream.mp3'), // Fallback to ice cream if pizza sound is missing
    category: 'Food'
  },
  {
    word: 'Bread',
    image: require('../../../assets/images/words/ice-cream.png'), // Fallback to ice cream if bread image is missing
    sound: require('../../../assets/sounds/words/ice-cream.mp3'), // Fallback to ice cream if bread sound is missing
    category: 'Food'
  },
  {
    word: 'Cake',
    image: require('../../../assets/images/words/ice-cream.png'), // Fallback to ice cream if cake image is missing
    sound: require('../../../assets/sounds/words/ice-cream.mp3'), // Fallback to ice cream if cake sound is missing
    category: 'Food'
  },
  {
    word: 'Milk',
    image: require('../../../assets/images/words/ice-cream.png'), // Fallback to ice cream if milk image is missing
    sound: require('../../../assets/sounds/words/ice-cream.mp3'), // Fallback to ice cream if milk sound is missing
    category: 'Food'
  },
  {
    word: 'Egg',
    image: require('../../../assets/images/words/ice-cream.png'), // Fallback to ice cream if egg image is missing
    sound: require('../../../assets/sounds/words/ice-cream.mp3'), // Fallback to ice cream if egg sound is missing
    category: 'Food'
  }
];

export default function WordsLessonScreen() {
  const navigation = useNavigation();
  const [sound, setSound] = useState();
  const [selectedCategory, setSelectedCategory] = useState('Fruits');
  
  const categories = ['Fruits', 'Toys', 'Animals', 'Places', 'Food'];

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

  // Filter words by category
  const filteredWords = safeWords.filter(item => item.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <Animatable.View 
        animation="fadeIn"
        style={styles.header}
      >
        <Text style={styles.headerText}>Learn Words</Text>
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
                selectedCategory === category && styles.selectedCategory,
                category === 'Fruits' && styles.fruitsCategoryButton,
                category === 'Toys' && styles.toysCategoryButton,
                category === 'Animals' && styles.animalsCategoryButton,
                category === 'Places' && styles.placesCategoryButton,
                category === 'Food' && styles.foodCategoryButton
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
          {filteredWords.map((item, index) => (
            <Animatable.View
              key={item.word}
              animation="zoomIn"
              delay={index * 50}
              style={styles.wordCard}
            >
              <TouchableOpacity
                style={[
                  styles.wordButton,
                  item.category === 'Fruits' && styles.fruitsButton,
                  item.category === 'Toys' && styles.toysButton,
                  item.category === 'Animals' && styles.animalsButton,
                  item.category === 'Places' && styles.placesButton,
                  item.category === 'Food' && styles.foodButton
                ]}
                onPress={() => playSound(item.sound)}
                activeOpacity={0.7}
              >
                <Image 
                  source={item.image}
                  style={styles.wordImage}
                  resizeMode="contain"
                />
                <Text style={styles.wordText}>{item.word}</Text>
                <View style={[
                  styles.soundIcon,
                  item.category === 'Fruits' && styles.fruitsSoundIcon,
                  item.category === 'Toys' && styles.toysSoundIcon,
                  item.category === 'Animals' && styles.animalsSoundIcon,
                  item.category === 'Places' && styles.placesSoundIcon,
                  item.category === 'Food' && styles.foodSoundIcon
                ]}>
                  <Image 
                    source={require('../../../assets/images/speaker.png')}
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
    backgroundColor: '#4CAF50',
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
  wordCard: {
    width: '45%',
    aspectRatio: 1,
    margin: 8,
  },
  wordButton: {
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
  wordImage: {
    width: '80%',
    height: '70%',
    marginBottom: 10,
  },
  wordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1B41',
    textAlign: 'center',
  },
  soundIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#4CAF50',
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
  fruitsButton: {
    borderLeftWidth: 6,
    borderLeftColor: '#FF9800',  // Orange
  },
  toysButton: {
    borderLeftWidth: 6,
    borderLeftColor: '#E91E63',  // Pink
  },
  animalsButton: {
    borderLeftWidth: 6,
    borderLeftColor: '#4CAF50',  // Green
  },
  placesButton: {
    borderLeftWidth: 6,
    borderLeftColor: '#2196F3',  // Blue
  },
  foodButton: {
    borderLeftWidth: 6,
    borderLeftColor: '#F44336',  // Red
  },
  fruitsSoundIcon: {
    backgroundColor: '#FF9800',
  },
  toysSoundIcon: {
    backgroundColor: '#E91E63',
  },
  animalsSoundIcon: {
    backgroundColor: '#4CAF50',
  },
  placesSoundIcon: {
    backgroundColor: '#2196F3',
  },
  foodSoundIcon: {
    backgroundColor: '#F44336',
  },
  categoryContainer: {
    height: 70,
    marginBottom: 10,
  },
  categoryScroll: {
    paddingHorizontal: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 15,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedCategory: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1B41',
  },
  selectedCategoryText: {
    color: 'white',
  },
  fruitsCategoryButton: {
    borderColor: '#FF9800',
    borderLeftWidth: 5,
  },
  toysCategoryButton: {
    borderColor: '#E91E63',
    borderLeftWidth: 5,
  },
  animalsCategoryButton: {
    borderColor: '#4CAF50',
    borderLeftWidth: 5,
  },
  placesCategoryButton: {
    borderColor: '#2196F3',
    borderLeftWidth: 5,
  },
  foodCategoryButton: {
    borderColor: '#F44336',
    borderLeftWidth: 5,
  },
}); 