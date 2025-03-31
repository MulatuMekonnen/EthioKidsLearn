import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';

const colors = [
  { name: 'Red', hex: '#FF0000', amharic: 'ቀይ', oromo: 'Diimaa' },
  { name: 'Blue', hex: '#0000FF', amharic: 'ሰማያዊ', oromo: 'Cuquliisa' },
  { name: 'Green', hex: '#00FF00', amharic: 'አረንጓዴ', oromo: 'Magariisa' },
  { name: 'Yellow', hex: '#FFFF00', amharic: 'ቢጫ', oromo: 'Keelloo' },
  { name: 'Black', hex: '#000000', amharic: 'ጥቁር', oromo: 'Gurraacha' },
  { name: 'White', hex: '#FFFFFF', amharic: 'ነጭ', oromo: 'Adii' },
];

export default function Colors() {
  const navigation = useNavigation();
  const [sound, setSound] = useState();
  const [selectedColor, setSelectedColor] = useState(null);

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/correct.mp3')
    );
    setSound(sound);
    await sound.playAsync();
  }

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Let's Learn Colors!</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.teacherContainer}>
            <Image
              source={require('../../assets/images/teacher.png')}
              style={styles.teacherImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.colorsContainer}>
            {colors.map((color, index) => (
              <Animatable.View
                key={color.name}
                animation="bounceIn"
                delay={index * 100}
                style={styles.colorCard}
              >
                <TouchableOpacity
                  style={[styles.colorBox, { backgroundColor: color.hex }]}
                  onPress={() => {
                    setSelectedColor(color);
                    playSound();
                  }}
                >
                  <Text style={[
                    styles.colorName,
                    { color: color.hex === '#FFFFFF' ? '#000000' : '#FFFFFF' }
                  ]}>
                    {color.name}
                  </Text>
                </TouchableOpacity>
                <View style={styles.translations}>
                  <Text style={styles.translationText}>
                    {color.amharic} • {color.oromo}
                  </Text>
                </View>
              </Animatable.View>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B41',
    padding: 20,
  },
  card: {
    backgroundColor: '#7FFFD4',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    backgroundColor: '#FF7F50',
    padding: 15,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    backgroundColor: '#FFFAF0',
  },
  teacherContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  teacherImage: {
    width: 100,
    height: 100,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  colorCard: {
    width: '45%',
    marginVertical: 10,
    alignItems: 'center',
  },
  colorBox: {
    width: 120,
    height: 120,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  colorName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  translations: {
    marginTop: 5,
    alignItems: 'center',
  },
  translationText: {
    fontSize: 14,
    color: '#1A1B41',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
