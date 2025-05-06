import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import { db } from '../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

// Local animal data as fallback
const localAnimals = [
  {
    name: 'Lion',
    image: require('../../assets/images/animals/lion.png'),
    sound: require('../../assets/sounds/animals/lion.mp3'),
    category: 'Wild Animals'
  },
  {
    name: 'Tiger',
    image: require('../../assets/images/animals/tiger.png'),
    sound: require('../../assets/sounds/animals/tiger.mp3'),
    category: 'Wild Animals'
  },
  {
    name: 'Monkey',
    image: require('../../assets/images/animals/monkey.png'),
    sound: require('../../assets/sounds/animals/monkey.mp3'),
    category: 'Wild Animals'
  },
  {
    name: 'Hyena',
    image: require('../../assets/images/animals/hyena.png'),
    sound: require('../../assets/sounds/animals/hyena.mp3'),
    category: 'Wild Animals'
  },
  {
    name: 'Cow',
    image: require('../../assets/images/animals/cow.png'),
    sound: require('../../assets/sounds/animals/cow.mp3'),
    category: 'Farm Animals'
  },
  {
    name: 'Sheep',
    image: require('../../assets/images/animals/sheep.png'),
    sound: require('../../assets/sounds/animals/sheep.mp3'),
    category: 'Farm Animals'
  },
  {
    name: 'Horse',
    image: require('../../assets/images/animals/horse.png'),
    sound: require('../../assets/sounds/animals/horse.mp3'),
    category: 'Farm Animals'
  },
  {
    name: 'Donkey',
    image: require('../../assets/images/animals/donkey.png'),
    sound: require('../../assets/sounds/animals/donkey.mp3'),
    category: 'Farm Animals'
  },
  {
    name: 'Ox',
    image: require('../../assets/images/animals/ox.png'),
    sound: require('../../assets/sounds/animals/ox.mp3'),
    category: 'Farm Animals'
  },
  {
    name: 'Cat',
    image: require('../../assets/images/animals/cat.png'),
    sound: require('../../assets/sounds/animals/cat.mp3'),
    category: 'Pets'
  },
  {
    name: 'Dog',
    image: require('../../assets/images/animals/dog.png'),
    sound: require('../../assets/sounds/animals/dog.mp3'),
    category: 'Pets'
  },
  {
    name: 'Chicken',
    image: require('../../assets/images/animals/chicken.png'),
    sound: require('../../assets/sounds/animals/chicken.mp3'),
    category: 'Farm Animals'
  }
];

// Pre-compute local categories
const localCategories = [...new Set(localAnimals.map(animal => animal.category))];

export default function AnimalSoundsScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('Wild Animals');
  const [sound, setSound] = useState();
  const [animals, setAnimals] = useState(localAnimals);
  const [categories, setCategories] = useState(localCategories);
  const [isLoadingFirebase, setIsLoadingFirebase] = useState(false);

  // Try to load data from Firebase in the background
  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setIsLoadingFirebase(true);
        const animalsCollection = collection(db, 'animals');
        const animalsSnapshot = await getDocs(animalsCollection);
        
        // Only update state if there are animals in Firestore
        if (animalsSnapshot.docs.length > 0) {
          const animalsData = animalsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setAnimals(animalsData);
          
          // Extract unique categories
          const uniqueCategories = [...new Set(animalsData.map(animal => animal.category))];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching animals from Firebase:', error);
        // Already using local data, so no need to revert
      } finally {
        setIsLoadingFirebase(false);
      }
    };
    
    fetchAnimals();
  }, []);

  // Function to play animal sounds
  async function playSound(soundResource) {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      
      let soundObject;
      
      // Handle both Firebase URLs (strings) and local require imports (numbers)
      if (typeof soundResource === 'string') {
        // For Firebase URL
        soundObject = await Audio.Sound.createAsync({ uri: soundResource });
      } else {
        // For local require import
        soundObject = await Audio.Sound.createAsync(soundResource);
      }
      
      setSound(soundObject.sound);
      await soundObject.sound.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }

  // Clean up sounds when component unmounts
  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Filter animals based on selected category
  const filteredAnimals = animals.filter(animal => animal.category === selectedCategory);

  // Define card colors based on category
  const getCategoryColor = (category) => {
    switch(category) {
      case 'Wild Animals':
        return '#FF9800';
      case 'Farm Animals':
        return '#4CAF50';
      case 'Pets':
        return '#2196F3';
      default:
        return '#2196F3';
    }
  };

  // Render the component
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
              key={animal.id || animal.name}
              animation="zoomIn"
              delay={index * 100}
              style={styles.animalCard}
            >
              <TouchableOpacity
                style={[
                  styles.animalButton,
                  { borderColor: getCategoryColor(animal.category) }
                ]}
                onPress={() => {
                  // For Firebase animals, use the URL directly
                  const soundSource = animal.soundUrl || animal.sound;
                  playSound(soundSource);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.imageContainer}>
                  {animal.imageUrl ? (
                    <Image 
                      source={{ uri: animal.imageUrl }}
                      style={styles.animalImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Image 
                      source={animal.image}
                      style={styles.animalImage}
                      resizeMode="contain"
                    />
                  )}
                </View>
                <Text style={styles.animalName}>{animal.name}</Text>
                <View style={[
                  styles.soundIcon,
                  { backgroundColor: getCategoryColor(animal.category) }
                ]}>
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

      {isLoadingFirebase && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.loadingText}>Syncing...</Text>
        </View>
      )}

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
  loadingIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  loadingText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 5,
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
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  imageContainer: {
    width: '100%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  animalImage: {
    width: 80, 
    height: 80,
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