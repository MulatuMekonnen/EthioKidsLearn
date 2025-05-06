import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.42;

const colors = [
  { name: 'Red', hex: '#FF0000', amharic: 'ቀይ', oromo: 'Diimaa', image: require('../../../assets/images/words/apple.png') },
  { name: 'Blue', hex: '#0000FF', amharic: 'ሰማያዊ', oromo: 'Cuquliisa', image: require('../../../assets/images/words/ball.png') },
  { name: 'Green', hex: '#00FF00', amharic: 'አረንጓዴ', oromo: 'Magariisa', image: require('../../../assets/images/words/cat.png') },
  { name: 'Yellow', hex: '#FFFF00', amharic: 'ቢጫ', oromo: 'Keelloo', image: require('../../../assets/images/words/house.png') },
  { name: 'Black', hex: '#000000', amharic: 'ጥቁር', oromo: 'Gurraacha', image: require('../../../assets/images/words/dog.png') },
  { name: 'White', hex: '#FFFFFF', amharic: 'ነጭ', oromo: 'Adii', image: require('../../../assets/images/words/elephant.png') },
  { name: 'Orange', hex: '#FFA500', amharic: 'ብርቱካናማ', oromo: 'Burtukaanaa', image: require('../../../assets/images/words/ice-cream.png') },
  { name: 'Purple', hex: '#800080', amharic: 'ወይን ጠጅ', oromo: 'Daamuu', image: require('../../../assets/images/words/fish.png') },
  { name: 'Pink', hex: '#FFC0CB', amharic: 'ሮዝ', oromo: 'Pinki', image: require('../../../assets/images/words/apple.png') },
  { name: 'Brown', hex: '#A52A2A', amharic: 'ቡናማ', oromo: 'Brooni', image: require('../../../assets/images/words/dog.png') },
  { name: 'Gray', hex: '#808080', amharic: 'ግራጫ', oromo: 'Suppee', image: require('../../../assets/images/words/cat.png') },
  { name: 'Gold', hex: '#FFD700', amharic: 'ወርቃማ', oromo: 'Warqii', image: require('../../../assets/images/words/house.png') },
];

export default function Colors() {
  const navigation = useNavigation();
  const [sound, setSound] = useState();
  const [selectedColor, setSelectedColor] = useState(null);
  const [celebration, setCelebration] = useState(false);

  async function playSound(colorName) {
    try {
      const soundFile = 
        colorName === 'celebration' 
          ? require('../../../assets/sounds/correct.mp3')
          : require('../../../assets/sounds/words/cat.mp3'); // Fallback to any existing sound
      
      if (sound) {
        await sound.unloadAsync();
      }
      
      const { sound: newSound } = await Audio.Sound.createAsync(soundFile);
      setSound(newSound);
      await newSound.playAsync();
      
      if (colorName === 'celebration') {
        setCelebration(true);
        setTimeout(() => setCelebration(false), 2000);
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handleColorPress = (color) => {
    setSelectedColor(color);
    playSound('celebration');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Animatable.View animation="bounceIn" style={styles.header}>
          <Text style={styles.headerText}>Let's Learn Colors!</Text>
        </Animatable.View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <View style={styles.teacherWrapper}>
              <Animatable.View 
                animation="pulse" 
                iterationCount="infinite" 
                style={styles.teacherContainer}
              >
                <Image
                  source={require('../../../assets/images/teacher.png')}
                  style={styles.teacherImage}
                  resizeMode="contain"
                />
                <Animatable.View
                  animation={celebration ? "tada" : "fadeIn"}
                  style={styles.speechBubble}
                >
                  <Text style={styles.speechText}>
                    {selectedColor 
                      ? `This is ${selectedColor.name}!` 
                      : "Tap a color to learn!"}
                  </Text>
                </Animatable.View>
              </Animatable.View>
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
                    onPress={() => handleColorPress(color)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.colorName,
                      { 
                        color: ['White', 'Yellow'].includes(color.name) 
                          ? '#000000' 
                          : '#FFFFFF' 
                      }
                    ]}>
                      {color.name}
                    </Text>
                    {selectedColor && selectedColor.name === color.name && (
                      <Animatable.View 
                        animation="pulse" 
                        iterationCount="infinite" 
                        style={styles.selectedIndicator}
                      />
                    )}
                  </TouchableOpacity>
                  
                  {/* Show a small image of that color */}
                  <View style={styles.objectContainer}>
                    <Image 
                      source={color.image}
                      style={styles.objectImage}
                      resizeMode="contain"
                    />
                  </View>
                  
                  <View style={styles.translations}>
                    <Text style={styles.translationText}>
                      {color.amharic} • {color.oromo}
                    </Text>
                  </View>
                </Animatable.View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      <Animatable.View 
        animation="fadeIn" 
        delay={500} 
        style={styles.backButtonContainer}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </Animatable.View>

      {celebration && (
        <Animatable.View 
          animation="fadeIn" 
          style={styles.celebrationContainer}
        >
          {[...Array(20)].map((_, i) => (
            <Animatable.View
              key={i}
              animation="zoomOut"
              duration={2000}
              delay={i * 100}
              style={[
                styles.confetti,
                {
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: colors[Math.floor(Math.random() * colors.length)].hex,
                  transform: [{ rotate: `${Math.random() * 360}deg` }]
                }
              ]}
            />
          ))}
        </Animatable.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B41',
    padding: 15,
  },
  card: {
    flex: 1,
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
    fontSize: 26,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 15,
    backgroundColor: '#FFFAF0',
    minHeight: '100%',
  },
  teacherWrapper: {
    alignItems: 'center',
    marginVertical: 20,
  },
  teacherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  teacherImage: {
    width: 100,
    height: 100,
  },
  speechBubble: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 15,
    maxWidth: 200,
    marginLeft: 10,
    borderWidth: 2,
    borderColor: '#FF7F50',
  },
  speechText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1B41',
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  colorCard: {
    width: CARD_WIDTH,
    marginVertical: 10,
    alignItems: 'center',
  },
  colorBox: {
    width: CARD_WIDTH - 20,
    height: CARD_WIDTH - 20,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  colorName: {
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  objectContainer: {
    marginTop: 10,
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  objectImage: {
    width: 40,
    height: 40,
  },
  translations: {
    marginTop: 5,
    alignItems: 'center',
  },
  translationText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1B41',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    right: 5,
    top: 5,
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#1A1B41',
  },
  backButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  backButton: {
    backgroundColor: '#FF7F50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  celebrationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
