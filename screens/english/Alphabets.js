import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');
const GRID_SIZE = 3;
const TILE_MARGIN = 10;
const TILE_SIZE = (width - (GRID_SIZE + 1) * TILE_MARGIN * 2) / GRID_SIZE;

const alphabets = [
  { letter: 'A', color: '#FFFF00' },
  { letter: 'B', color: '#FFA500' },
  { letter: 'C', color: '#FF0000' },
  { letter: 'D', color: '#FF00FF' },
  { letter: 'E', color: '#0000FF' },
  { letter: 'F', color: '#00FF00' },
  { letter: 'G', color: '#FFFFFF' },
  { letter: 'H', color: '#1A1B41', textColor: '#FFFFFF', borderColor: '#FFFFFF' },
  { letter: 'I', color: '#8B4513' },
  { letter: 'J', color: '#FFFF00' },
  { letter: 'K', color: '#FFA500' },
  { letter: 'L', color: '#FF0000' },
  { letter: 'M', color: '#FF00FF' },
  { letter: 'N', color: '#0000FF' },
  { letter: 'O', color: '#00FF00' },
  { letter: 'P', color: '#FFFFFF' },
  { letter: 'Q', color: '#1A1B41', textColor: '#FFFFFF', borderColor: '#FFFFFF' },
  { letter: 'R', color: '#8B4513' },
  { letter: 'S', color: '#FFFF00' },
  { letter: 'T', color: '#FFA500' },
  { letter: 'U', color: '#FF0000' },
  { letter: 'V', color: '#FF00FF' },
  { letter: 'W', color: '#0000FF' },
  { letter: 'X', color: '#00FF00' },
  { letter: 'Y', color: '#FFFFFF' },
  { letter: 'Z', color: '#1A1B41', textColor: '#FFFFFF', borderColor: '#FFFFFF' },
];

const LetterTile = ({ letter, color, borderColor, textColor, delay }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const handlePress = () => {
    setIsPressed(true);
    // Add letter pronunciation logic here
    setTimeout(() => setIsPressed(false), 300);
  };

  return (
    <Animatable.View
      animation="zoomIn"
      delay={delay}
      style={styles.tileWrapper}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[
          styles.tile,
          { 
            backgroundColor: color,
            borderColor: borderColor || color,
            transform: [{ scale: isPressed ? 0.95 : 1 }]
          }
        ]}
      >
        <Text style={[
          styles.letter,
          { color: textColor || '#000000' }
        ]}>
          {letter}
        </Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

export default function AlphabetsLessonScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {alphabets.map((item, index) => (
            <LetterTile
              key={item.letter}
              letter={item.letter}
              color={item.color}
              borderColor={item.borderColor}
              textColor={item.textColor}
              delay={index * 100}
            />
          ))}
        </View>
      </ScrollView>

      <Animatable.View 
        animation="fadeIn" 
        delay={2000}
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
  scrollContent: {
    flexGrow: 1,
    padding: TILE_MARGIN,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: TILE_MARGIN,
  },
  tileWrapper: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    padding: TILE_MARGIN,
  },
  tile: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  letter: {
    fontSize: TILE_SIZE * 0.6,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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