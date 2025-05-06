import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const GRID_SIZE = 2;
const TILE_MARGIN = 10;
const TILE_SIZE = (width - (GRID_SIZE + 1) * TILE_MARGIN * 2) / GRID_SIZE;

const numbers = [
  { number: '1', color: '#FFFF00', borderColor: '#00BFFF', sound: require('../../../assets/sounds/maths/1.m4a') },
  { number: '2', color: '#FFA500', sound: require('../../../assets/sounds/maths/2.m4a') },
  { number: '3', color: '#FF0000', sound: require('../../../assets/sounds/maths/3.m4a') },
  { number: '4', color: '#FF00FF', sound: require('../../../assets/sounds/maths/4.m4a') },
  { number: '5', color: '#0000FF', sound: require('../../../assets/sounds/maths/5.m4a') },
  { number: '6', color: '#00FF00', sound: require('../../../assets/sounds/maths/6.m4a') },
  { number: '7', color: '#FFFFFF', sound: require('../../../assets/sounds/maths/7.m4a') },
  { number: '8', color: '#1A1B41', textColor: '#FFFFFF', borderColor: '#FFFFFF', sound: require('../../../assets/sounds/maths/8.m4a') },
  { number: '9', color: '#8B4513', sound: require('../../../assets/sounds/maths/9.m4a') },
  { number: '10', color: '#FFFF00', sound: require('../../../assets/sounds/maths/10.m4a') },
  { number: '11', color: '#FFA500', sound: require('../../../assets/sounds/maths/11.m4a') },
  { number: '12', color: '#FF0000', sound: require('../../../assets/sounds/maths/12.m4a') },
  { number: '13', color: '#FF00FF', sound: require('../../../assets/sounds/maths/13.m4a') },
  { number: '14', color: '#0000FF', sound: require('../../../assets/sounds/maths/14.m4a') },
  { number: '15', color: '#00FF00', sound: require('../../../assets/sounds/maths/15.m4a') },
  { number: '16', color: '#FFFFFF', sound: require('../../../assets/sounds/maths/16.m4a') },
  { number: '17', color: '#1A1B41', textColor: '#FFFFFF', borderColor: '#FFFFFF', sound: require('../../../assets/sounds/maths/17.m4a') },
  { number: '18', color: '#8B4513', sound: require('../../../assets/sounds/maths/18.m4a') },
  { number: '19', color: '#FF00FF', sound: require('../../../assets/sounds/maths/19.m4a') },
  { number: '20', color: '#0000FF', sound: require('../../../assets/sounds/maths/20.m4a') },
];

export default function LearnToCountScreen() {
  const navigation = useNavigation();
  const [sound, setSound] = useState();

  // Clean up sound when component unmounts
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Function to play sound
  async function playSound(soundFile) {
    try {
      // Unload previous sound if it exists
      if (sound) {
        await sound.unloadAsync();
      }
      
      // Load new sound
      const { sound: newSound } = await Audio.Sound.createAsync(soundFile);
      setSound(newSound);
      
      // Play sound
      await newSound.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
      Alert.alert(
        'Sound Not Available',
        'The sound file for this number is not available yet.',
        [{ text: 'OK' }]
      );
    }
  }

  const NumberTile = ({ number, color, borderColor, textColor, delay, sound }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const handlePress = () => {
    setIsPressed(true);
      playSound(sound);
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
          <View style={styles.soundIcon}>
            <Ionicons name="volume-high" size={20} color="#FFF" />
          </View>
      </TouchableOpacity>
    </Animatable.View>
  );
};

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
              sound={item.sound}
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
    fontSize: TILE_SIZE * 0.4,
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
  soundIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    padding: 4,
  },
}); 