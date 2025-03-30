import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';

const oromoContent = [
  {
    letter: 'A',
    pronunciation: 'aa',
    example: 'Aadaa',
    meaning: 'Culture',
    sound: require('../assets/sounds/oromo/a.mp3'),
    category: 'Alphabet'
  },
  {
    letter: 'B',
    pronunciation: 'ba',
    example: 'Buna',
    meaning: 'Coffee',
    sound: require('../assets/sounds/oromo/b.mp3'),
    category: 'Alphabet'
  },
  {
    letter: 'C',
    pronunciation: 'ca',
    example: 'Cabbii',
    meaning: 'Butter',
    sound: require('../assets/sounds/oromo/c.mp3'),
    category: 'Alphabet'
  },
  {
    word: 'Abbaa',
    pronunciation: 'Ab-baa',
    meaning: 'Father',
    sound: require('../assets/sounds/oromo/father.mp3'),
    category: 'Family'
  },
  {
    word: 'Haadha',
    pronunciation: 'Haa-dha',
    meaning: 'Mother',
    sound: require('../assets/sounds/oromo/mother.mp3'),
    category: 'Family'
  },
  {
    word: 'Bishaan',
    pronunciation: 'Bi-shaan',
    meaning: 'Water',
    sound: require('../assets/sounds/oromo/water.mp3'),
    category: 'Basic Words'
  },
  {
    word: 'Nyaata',
    pronunciation: 'Nya-ata',
    meaning: 'Food',
    sound: require('../assets/sounds/oromo/food.mp3'),
    category: 'Basic Words'
  },
  {
    word: 'Nagaa',
    pronunciation: 'Na-gaa',
    meaning: 'Peace',
    sound: require('../assets/sounds/oromo/peace.mp3'),
    category: 'Greetings'
  }
];

const categories = [...new Set(oromoContent.map(item => item.category))];

export default function OromoLessonScreen() {
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
      Alert.alert(
        'Sound Not Available',
        'The sound file for this item is not available yet.',
        [{ text: 'OK' }]
      );
    }
  }

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const filteredContent = selectedCategory === 'All' 
    ? oromoContent 
    : oromoContent.filter(item => item.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <Animatable.View 
        animation="fadeIn"
        style={styles.header}
      >
        <Text style={styles.headerText}>Learn Oromo</Text>
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
          {filteredContent.map((item, index) => (
            <Animatable.View
              key={item.letter || item.word}
              animation="zoomIn"
              delay={index * 100}
              style={styles.card}
            >
              <TouchableOpacity
                style={styles.button}
                onPress={() => playSound(item.sound)}
                activeOpacity={0.7}
              >
                <Text style={styles.mainText}>
                  {item.letter || item.word}
                </Text>
                <Text style={styles.pronunciationText}>
                  ({item.pronunciation})
                </Text>
                {item.example && (
                  <Text style={styles.exampleText}>
                    {item.example}
                  </Text>
                )}
                <Text style={styles.meaningText}>
                  {item.meaning}
                </Text>
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
    backgroundColor: '#FFA500',
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
    backgroundColor: '#FFA500',
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
  card: {
    width: '45%',
    aspectRatio: 1,
    margin: 8,
  },
  button: {
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
  mainText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1B41',
    textAlign: 'center',
    marginBottom: 5,
  },
  pronunciationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  exampleText: {
    fontSize: 14,
    color: '#FFA500',
    textAlign: 'center',
    marginBottom: 5,
  },
  meaningText: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
  },
  soundIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FFA500',
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
    backgroundColor: '#FFA500',
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