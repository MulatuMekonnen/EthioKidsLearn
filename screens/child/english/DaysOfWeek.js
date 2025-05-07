import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';

const days = [
  { name: 'MONDAY', color: '#FF9B54', icon: '😊', sound: require('../../../assets/sounds/days/Monday .m4a') },
  { name: 'TUESDAY', color: '#CE2D4F', icon: '🌟', sound: require('../../../assets/sounds/days/Tuesday .m4a') },
  { name: 'WEDNESDAY', color: '#4B878B', icon: '🐸', sound: require('../../../assets/sounds/days/Wednesday .m4a') },
  { name: 'THURSDAY', color: '#8B5FBF', icon: '🦄', sound: require('../../../assets/sounds/days/Thursday .m4a') },
  { name: 'FRIDAY', color: '#01A7C2', icon: '🎉', sound: require('../../../assets/sounds/days/Friday .m4a') },
  { name: 'SATURDAY', color: '#F76C5E', icon: '🚀', sound: require('../../../assets/sounds/days/Saturday .m4a') },
  { name: 'SUNDAY', color: '#6DC066', icon: '🌈', sound: require('../../../assets/sounds/days/Sunday .m4a') }
];

export default function DaysOfWeekScreen() {
  const navigation = useNavigation();
  const [sound, setSound] = useState();

  // Clean up sound resources when component unmounts
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Function to play day name sound
  async function playSound(soundFile) {
    try {
      // Unload any previous sound
      if (sound) {
        await sound.unloadAsync();
      }
      
      // Load and play the new sound
      const { sound: newSound } = await Audio.Sound.createAsync(soundFile);
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animatable.Text 
        animation="fadeIn"
        style={styles.title}
      >
        The 7 days of a week
      </Animatable.Text>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {days.map((day, index) => (
          <Animatable.View
            key={day.name}
            animation="fadeInLeft"
            delay={index * 100}
            style={styles.dayContainer}
          >
            <TouchableOpacity
              style={[styles.dayButton, { backgroundColor: day.color }]}
              activeOpacity={0.8}
              onPress={() => playSound(day.sound)}
            >
              <Text style={styles.dayIcon}>{day.icon}</Text>
              <Text style={styles.dayText}>{day.name}</Text>
            </TouchableOpacity>
          </Animatable.View>
        ))}
      </ScrollView>

      <Animatable.View 
        animation="fadeIn" 
        delay={800}
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
  title: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dayContainer: {
    marginVertical: 8,
  },
  dayButton: {
    width: '100%',
    height: 70,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dayIcon: {
    fontSize: 30,
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