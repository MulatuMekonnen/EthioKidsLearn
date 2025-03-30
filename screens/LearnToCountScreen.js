import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');
const GRID_SIZE = 3;
const TILE_MARGIN = 10;
const TILE_SIZE = (width - (GRID_SIZE + 1) * TILE_MARGIN * 2) / GRID_SIZE;

const numbers = [
  { number: '1', color: '#FFFF00', borderColor: '#00BFFF' },
  { number: '2', color: '#FFA500' },
  { number: '3', color: '#FF0000' },
  { number: '4', color: '#FF00FF' },
  { number: '5', color: '#0000FF' },
  { number: '6', color: '#00FF00' },
  { number: '7', color: '#FFFFFF' },
  { number: '8', color: '#1A1B41', textColor: '#FFFFFF', borderColor: '#FFFFFF' },
  { number: '9', color: '#8B4513' },
  { number: '10', color: '#FFFF00' },
  { number: '11', color: '#FFA500' },
  { number: '12', color: '#FF0000' },
  { number: '13', color: '#FF00FF' },
  { number: '14', color: '#0000FF' },
  { number: '15', color: '#00FF00' },
  { number: '16', color: '#FFFFFF' },
  { number: '17', color: '#1A1B41', textColor: '#FFFFFF', borderColor: '#FFFFFF' },
  { number: '18', color: '#8B4513' },
  { number: '19', color: '#FF00FF' },
  { number: '20', color: '#0000FF' },
];

const NumberTile = ({ number, color, borderColor, textColor, delay }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const handlePress = () => {
    setIsPressed(true);
    // Add number pronunciation logic here
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
          styles.number,
          { color: textColor || '#000000' }
        ]}>
          {number}
        </Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

export default function LearnToCountScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {numbers.map((item, index) => (
            <NumberTile
              key={item.number}
              number={item.number}
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
  number: {
    fontSize: TILE_SIZE * 0.5,
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