import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const GRID_SIZE = 3;
const TILE_MARGIN = 10;
const TILE_SIZE = (width - (GRID_SIZE + 1) * TILE_MARGIN * 2) / GRID_SIZE;

const alphabets = [
  { letter: 'A', color: '#FFFF00', sound: require('../../../assets/sounds/english/a.m4a') },
  { letter: 'B', color: '#FFA500', sound: require('../../../assets/sounds/english/b.m4a') },
  { letter: 'C', color: '#FF0000', sound: require('../../../assets/sounds/english/c.m4a') },
  { letter: 'D', color: '#FF00FF', sound: require('../../../assets/sounds/english/d.m4a') },
  { letter: 'E', color: '#0000FF', sound: require('../../../assets/sounds/english/e.m4a') },
  { letter: 'F', color: '#00FF00', sound: require('../../../assets/sounds/english/f.m4a') },
  { letter: 'G', color: '#FFFFFF', sound: require('../../../assets/sounds/english/g.m4a') },
  { letter: 'H', color: '#1A1B41', textColor: '#FFFFFF', borderColor: '#FFFFFF', sound: require('../../../assets/sounds/english/h.m4a') },
  { letter: 'I', color: '#8B4513', sound: require('../../../assets/sounds/english/i.m4a') },
  { letter: 'J', color: '#FFFF00', sound: require('../../../assets/sounds/english/j.m4a') },
  { letter: 'K', color: '#FFA500', sound: require('../../../assets/sounds/english/k.m4a') },
  { letter: 'L', color: '#FF0000', sound: require('../../../assets/sounds/english/l.m4a') },
  { letter: 'M', color: '#FF00FF', sound: require('../../../assets/sounds/english/m.m4a') },
  { letter: 'N', color: '#0000FF', sound: require('../../../assets/sounds/english/n.m4a') },
  { letter: 'O', color: '#00FF00', sound: require('../../../assets/sounds/english/o.m4a') },
  { letter: 'P', color: '#FFFFFF', sound: require('../../../assets/sounds/english/p.m4a') },
  { letter: 'Q', color: '#1A1B41', textColor: '#FFFFFF', borderColor: '#FFFFFF', sound: require('../../../assets/sounds/english/q.m4a') },
  { letter: 'R', color: '#8B4513', sound: require('../../../assets/sounds/english/r.m4a') },
  { letter: 'S', color: '#FFFF00', sound: require('../../../assets/sounds/english/s.m4a') },
  { letter: 'T', color: '#FFA500', sound: require('../../../assets/sounds/english/t.m4a') },
  { letter: 'U', color: '#FF0000', sound: require('../../../assets/sounds/english/u.m4a') },
  { letter: 'V', color: '#FF00FF', sound: require('../../../assets/sounds/english/v.m4a') },
  { letter: 'W', color: '#0000FF', sound: require('../../../assets/sounds/english/w.m4a') },
  { letter: 'X', color: '#00FF00', sound: require('../../../assets/sounds/english/x.m4a') },
  { letter: 'Y', color: '#FFFFFF', sound: require('../../../assets/sounds/english/y.m4a') },
  { letter: 'Z', color: '#1A1B41', textColor: '#FFFFFF', borderColor: '#FFFFFF', sound: require('../../../assets/sounds/english/z.m4a') },
];

const LetterTile = ({ letter, color, borderColor, textColor, delay, sound, onPlaySound }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const handlePress = () => {
    setIsPressed(true);
    onPlaySound(sound);
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
        <View style={styles.soundIcon}>
          <Ionicons name="volume-high" size={20} color="#FFF" />
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
};

export default function AlphabetsLessonScreen() {
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
        'The sound file for this letter is not available yet.',
        [{ text: 'OK' }]
      );
    }
  }

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
              sound={item.sound}
              onPlaySound={playSound}
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
  soundIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 2,
  },
}); 