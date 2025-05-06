import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import * as Speech from 'expo-speech';

const wordCategories = [
  {
    name: 'Animals',
    words: [
      { word: 'Owl', image: require('../../assets/images/owl.png') },
      { word: 'Bird', image: require('../../assets/images/bird.png') },
      { word: 'Fish', image: require('../../assets/images/fish.png') },
      { word: 'Cat', image: require('../../assets/images/cat.png') },
      { word: 'Dog', image: require('../../assets/images/dog.png') },
    ]
  },
  {
    name: 'Objects',
    words: [
      { word: 'Car', image: require('../../assets/images/car.png') },
      { word: 'Computer', image: require('../../assets/images/computer.png') },
      { word: 'Book', image: require('../../assets/images/book.png') },
      { word: 'Ball', image: require('../../assets/images/ball.png') },
      { word: 'Phone', image: require('../../assets/images/phone.png') },
    ]
  },
  {
    name: 'Nature',
    words: [
      { word: 'Sun', image: require('../../assets/images/sun.png') },
      { word: 'Tree', image: require('../../assets/images/tree.png') },
      { word: 'Flower', image: require('../../assets/images/flower.png') },
      { word: 'Cloud', image: require('../../assets/images/cloud.png') },
      { word: 'Star', image: require('../../assets/images/star.png') },
    ]
  }
];

export default function WordsScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState(0);

  const handleWordPress = async (word) => {
    try {
      await Speech.speak(word, {
        language: 'en',
        pitch: 1,
        rate: 0.75,
      });
    } catch (error) {
      console.log('Error speaking word:', error);
    }
  };

  const handleCategoryChange = (index) => {
    setSelectedCategory(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animatable.View 
        animation="fadeIn"
        style={styles.header}
      >
        <Text style={styles.headerText}>First English Words for Kids</Text>
      </Animatable.View>

      <View style={styles.categoryContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {wordCategories.map((category, index) => (
            <TouchableOpacity
              key={category.name}
              style={[
                styles.categoryButton,
                selectedCategory === index && styles.selectedCategory
              ]}
              onPress={() => handleCategoryChange(index)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === index && styles.selectedCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wordsGrid}>
          {wordCategories[selectedCategory].words.map((item, index) => (
            <Animatable.View
              key={item.word}
              animation="zoomIn"
              delay={index * 200}
              style={styles.wordCard}
            >
              <TouchableOpacity
                style={styles.wordButton}
                onPress={() => handleWordPress(item.word)}
                activeOpacity={0.7}
              >
                <Image 
                  source={item.image}
                  style={styles.wordImage}
                  resizeMode="contain"
                />
                <Text style={styles.wordText}>{item.word}</Text>
                <View style={styles.speakerIcon}>
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
        delay={1200}
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
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  wordCard: {
    width: '45%',
    aspectRatio: 1,
    margin: 10,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1B41',
    textAlign: 'center',
  },
  speakerIcon: {
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