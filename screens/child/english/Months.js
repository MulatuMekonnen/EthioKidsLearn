import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';

const months = [
  { name: 'JANUARY', color: '#5D9CEC', icon: '❄️', sound: require('../../../assets/sounds/months/January .m4a') },
  { name: 'FEBRUARY', color: '#FC6E51', icon: '💝', sound: require('../../../assets/sounds/months/February .m4a') },
  { name: 'MARCH', color: '#48CFAD', icon: '🌱', sound: require('../../../assets/sounds/months/March .m4a') },
  { name: 'APRIL', color: '#FFCE54', icon: '🌷', sound: require('../../../assets/sounds/months/April .m4a') },
  { name: 'MAY', color: '#ED5565', icon: '🌺', sound: require('../../../assets/sounds/months/May.m4a') },
  { name: 'JUNE', color: '#AC92EC', icon: '☀️', sound: require('../../../assets/sounds/months/June .m4a') },
  { name: 'JULY', color: '#FC6E51', icon: '🎆', sound: require('../../../assets/sounds/months/July .m4a') },
  { name: 'AUGUST', color: '#4FC1E9', icon: '🏄', sound: require('../../../assets/sounds/months/August .m4a') },
  { name: 'SEPTEMBER', color: '#A0D468', icon: '🍁', sound: require('../../../assets/sounds/months/September .m4a') },
  { name: 'OCTOBER', color: '#F5AB35', icon: '🎃', sound: require('../../../assets/sounds/months/October .m4a') },
  { name: 'NOVEMBER', color: '#656D78', icon: '🍂', sound: require('../../../assets/sounds/months/November .m4a') },
  { name: 'DECEMBER', color: '#E91E63', icon: '🎁', sound: require('../../../assets/sounds/months/December .m4a') }
];

export default function MonthsOfYearScreen() {
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

  // Function to play month name sound
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
        The 12 Months of a year
      </Animatable.Text>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {months.map((month, index) => (
          <Animatable.View
            key={month.name}
            animation="fadeInRight"
            delay={index * 100}
            style={styles.monthContainer}
          >
            <TouchableOpacity
              style={[styles.monthButton, { backgroundColor: month.color }]}
              activeOpacity={0.8}
              onPress={() => playSound(month.sound)}
            >
              <Text style={styles.monthIcon}>{month.icon}</Text>
              <Text style={styles.monthText}>{month.name}</Text>
            </TouchableOpacity>
          </Animatable.View>
        ))}
      </ScrollView>

      <Animatable.View 
        animation="fadeIn" 
        delay={1300}
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
  monthContainer: {
    marginVertical: 8,
  },
  monthButton: {
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
  monthText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  monthIcon: {
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