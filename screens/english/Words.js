import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';

const words = [
  {
    word: 'Apple',
    image: require('../../assets/images/words/apple.png'),
    sound: require('../../assets/sounds/words/apple.mp3'),
    category: 'Fruits'
  },
  {
    word: 'Ball',
    image: require('../../assets/images/words/ball.png'),
    sound: require('../../assets/sounds/words/ball.mp3'),
    category: 'Toys'
  },
  {
    word: 'Cat',
    image: require('../../assets/images/words/cat.png'),
    sound: require('../../assets/sounds/words/cat.mp3'),
    category: 'Animals'
  },
  {
    word: 'Dog',
    image: require('../../assets/images/words/dog.png'),
    sound: require('../../assets/sounds/words/dog.mp3'),
    category: 'Animals'
  },
  {
    word: 'Elephant',
    image: require('../../assets/images/words/elephant.png'),
    sound: require('../../assets/sounds/words/elephant.mp3'),
    category: 'Animals'
  },
  {
    word: 'Fish',
    image: require('../../assets/images/words/fish.png'),
    sound: require('../../assets/sounds/words/fish.mp3'),
    category: 'Animals'
  },
  {
    word: 'House',
    image: require('../../assets/images/words/house.png'),
    sound: require('../../assets/sounds/words/house.mp3'),
    category: 'Places'
  },
  {
    word: 'Ice Cream',
    image: require('../../assets/images/words/ice-cream.png'),
    sound: require('../../assets/sounds/words/ice-cream.mp3'),
    category: 'Food'
  }
];

const categories = [...new Set(words.map(item => item.category))];

export default function WordsLessonScreen() {
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

  const filteredWords = selectedCategory === 'All' 
    ? words 
    : words.filter(item => item.category === selectedCategory);

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
          {filteredWords.map((item, index) => (
            <Animatable.View
              key={item.word}
              animation="zoomIn"
              delay={index * 100}
              style={styles.wordCard}
            >
              <TouchableOpacity
                style={styles.wordButton}
                onPress={() => playSound(item.sound)}
                activeOpacity={0.7}
              >
                <Image 
                  source={item.image}
                  style={styles.wordImage}
                  resizeMode="contain"
                />
                <Text style={styles.wordText}>{item.word}</Text>
                <View style={styles.soundIcon}>
                  <Image 
                    source={require('../../assets/images/speaker.png')}
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
}); 