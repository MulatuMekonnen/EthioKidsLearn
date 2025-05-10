import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useLanguage } from '../../context/LanguageContext';

export default function AlphabetLessonScreen() {
  const navigation = useNavigation();
  const [currentLetter, setCurrentLetter] = useState('A');
  const { translate } = useLanguage();

  const playAudio = () => {
    // Implement audio playback here
    console.log('Playing audio for letter', currentLetter);
  };

  return (
    <View style={styles.container}>
      <Animatable.Text animation="zoomIn" style={styles.letter}>{currentLetter}</Animatable.Text>
      <Image source={require('../../assets/apple.png')} style={styles.image} />
      <TouchableOpacity style={styles.audioButton} onPress={playAudio}>
        <Feather name="volume-2" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.activityContainer}>
        {/* Implement drag-and-drop activity here */}
        <Text style={styles.activityText}>{translate('alphabet.dragAndDrop')}</Text>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Feather name="arrow-left" size={24} color="white" />
        <Text style={styles.backButtonText}>{translate('common.back')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9C4',
    alignItems: 'center',
    padding: 20,
  },
  letter: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginVertical: 20,
  },
  audioButton: {
    backgroundColor: '#4299E1',
    padding: 10,
    borderRadius: 25,
  },
  activityContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityText: {
    fontSize: 18,
    color: '#4A5568',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4299E1',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});