import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import { db } from '../../services/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

/**
 * CLOUDINARY SETUP INSTRUCTIONS:
 * 
 * 1. Create a Cloudinary account at https://cloudinary.com/
 * 2. Get your cloud name from the dashboard
 * 3. Create a new folder named 'animals' in your Cloudinary media library
 * 4. Upload all animal images to this folder
 * 5. Replace 'your-cloud-name' below with your actual cloud name
 * 6. Images should have the same filenames as referenced in the code (lion.png, tiger.png, etc.)
 */

// Cloudinary configuration
// Using the provided cloud name: dljxfr5iy
const CLOUDINARY_URL = 'https://res.cloudinary.com/dljxfr5iy/image/upload';

// No need for a fallback image, we'll use an icon instead

/**
 * Helper function to create optimized Cloudinary URLs
 * @param {string} imageName - The name of the image file without path
 * @param {object} options - Cloudinary transformation options
 * @returns {string} - Complete Cloudinary URL
 */
const getCloudinaryUrl = (imageName, options = {}) => {
  // Using a simpler direct URL format that's more likely to work
  return `https://res.cloudinary.com/dljxfr5iy/image/upload/animals/${imageName}`;
};

// Local animal data with Cloudinary URLs
const localAnimals = [
  {
    name: 'Lion',
    imageUrl: getCloudinaryUrl('lion.png'),
    sound: require('../../assets/sounds/animals/lion.mp3'),
    category: 'Wild Animals'
  },
  {
    name: 'Tiger',
    imageUrl: getCloudinaryUrl('tiger.png'),
    sound: require('../../assets/sounds/animals/tiger.mp3'),
    category: 'Wild Animals'
  },
  {
    name: 'Monkey',
    imageUrl: getCloudinaryUrl('monkey.png'),
    sound: require('../../assets/sounds/animals/monkey.mp3'),
    category: 'Wild Animals'
  },
  {
    name: 'giraffe',
    imageUrl: getCloudinaryUrl('giraffe.png'),
    sound: require('../../assets/sounds/animals/giraffe.mp3'),
    category: 'Wild Animals'
  },
  {
    name: 'zebra',
    imageUrl: getCloudinaryUrl('zebra.png'),
    sound: require('../../assets/sounds/animals/zebra.mp3'),
    category: 'Wild Animals'
  },
  {
    name: 'Hyena',
    imageUrl: getCloudinaryUrl('hyena.png'),
    sound: require('../../assets/sounds/animals/hyena.mp3'),
    category: 'Wild Animals'
  },
  {
    name: 'Cow',
    imageUrl: getCloudinaryUrl('cow.png'),
    sound: require('../../assets/sounds/animals/cow.mp3'),
    category: 'Farm Animals'
  },
  {
    name: 'Sheep',
    imageUrl: getCloudinaryUrl('sheep.png'),
    sound: require('../../assets/sounds/animals/sheep.mp3'),
    category: 'Farm Animals'
  },
  {
    name: 'Horse',
    imageUrl: getCloudinaryUrl('horse.png'),
    sound: require('../../assets/sounds/animals/horse.mp3'),
    category: 'Farm Animals'
  },
  {
    name: 'Donkey',
    imageUrl: getCloudinaryUrl('donkey.png'),
    sound: require('../../assets/sounds/animals/donkey.mp3'),
    category: 'Farm Animals'
  },
  {
    name: 'Ox',
    imageUrl: getCloudinaryUrl('ox.png'),
    sound: require('../../assets/sounds/animals/ox.mp3'),
    category: 'Farm Animals'
  },
  {
    name: 'Cat',
    imageUrl: getCloudinaryUrl('cat.png'),
    sound: require('../../assets/sounds/animals/cat.mp3'),
    category: 'Pets'
  },
  {
    name: 'Dog',
    imageUrl: getCloudinaryUrl('dog.png'),
    sound: require('../../assets/sounds/animals/dog.mp3'),
    category: 'Pets'
  },
  {
    name: 'Chicken',
    imageUrl: getCloudinaryUrl('chicken.png'),
    sound: require('../../assets/sounds/animals/chicken.mp3'),
    category: 'Farm Animals'
  }
];

// Pre-compute local categories
const localCategories = [...new Set(localAnimals.map(animal => animal.category))];

// Helper function to upload animals to Firebase
const uploadAnimalsToFirebase = async () => {
  try {
    const animalsCollection = collection(db, 'animals');
    
    for (const animal of localAnimals) {
      await addDoc(animalsCollection, {
        name: animal.name,
        // Use the same Cloudinary URL format for Firebase
        imageUrl: getCloudinaryUrl(`${animal.name.toLowerCase()}.png`),
        category: animal.category,
        // Note: Sound files still need to be uploaded separately to a storage service
      });
    }
    console.log('Animals uploaded to Firebase successfully');
    return true;
  } catch (error) {
    console.error('Error uploading animals to Firebase:', error);
    return false;
  }
};

export default function AnimalSoundsScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('Wild Animals');
  const [sound, setSound] = useState();
  const [animals, setAnimals] = useState(localAnimals);
  const [categories, setCategories] = useState(localCategories);
  const [isLoadingFirebase, setIsLoadingFirebase] = useState(false);
  const [failedImages, setFailedImages] = useState({});
  const [showDebug, setShowDebug] = useState(false);

  // Debug function to test Cloudinary URLs
  const testCloudinaryUrl = () => {
    const testUrl = getCloudinaryUrl('lion.png');
    console.log('Testing Cloudinary URL:', testUrl);
    Alert.alert('Debug Info', `Testing URL: ${testUrl}\n\nFailed Images: ${Object.keys(failedImages).join(', ')}`);
  };

  // Handle image loading errors
  const handleImageError = (animalName) => {
    setFailedImages(prev => ({
      ...prev,
      [animalName]: true
    }));
    console.log(`Failed to load image for ${animalName}`);
  };

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
          console.log('Successfully loaded animals from Firebase');
        } else {
          // If no animals in Firebase, upload them
          console.log('No animals found in Firebase, attempting to upload...');
          const uploadSuccess = await uploadAnimalsToFirebase();
          
          if (uploadSuccess) {
            console.log('Successfully uploaded animals to Firebase, fetching updated data...');
            // Fetch the newly uploaded data
            const updatedSnapshot = await getDocs(animalsCollection);
            const updatedData = updatedSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            setAnimals(updatedData);
            
            // Extract unique categories
            const uniqueCategories = [...new Set(updatedData.map(animal => animal.category))];
            setCategories(uniqueCategories);
          } else {
            console.log('Failed to upload animals to Firebase, using local data');
          }
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
                  {failedImages[animal.name] ? (
                    <View style={styles.placeholderContainer}>
                      <Ionicons name="image-outline" size={60} color="#CCCCCC" />
                      <Text style={styles.placeholderText}>{animal.name}</Text>
                    </View>
                  ) : (
                    <Image 
                      source={typeof animal.imageUrl === 'string' ? { uri: animal.imageUrl } : animal.imageUrl}
                      style={styles.animalImage}
                      resizeMode="contain"
                      onError={() => handleImageError(animal.name)}
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

      {/* Debug button - long press to activate */}
      <TouchableOpacity
        style={styles.debugButton}
        onLongPress={() => {
          setShowDebug(true);
          testCloudinaryUrl();
        }}
      >
        <Ionicons name="bug-outline" size={20} color="#FFFFFF" />
      </TouchableOpacity>
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
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
  },
  placeholderText: {
    color: '#999999',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  debugButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
}); 