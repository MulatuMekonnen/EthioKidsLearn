import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

const englishTopics = [
  { id: '1', title: 'Alphabets', color: '#FF6B6B', route: 'Alphabets' },
  { id: '2', title: 'Words', color: '#4ECDC4', route: 'Words' },
  { id: '3', title: 'Days of\nWeek', color: '#45B7D1', route: 'DaysOfWeek' },
  { id: '4', title: 'Months', color: '#96CEB4', route: 'Months' },
  { id: '5', title: 'Colors', color: '#FFEEAD', route: 'Colors' },
  { id: '6', title: 'English Quiz', color: '#FF9F9F', route: 'EnglishQuiz', isWide: true },
];

const EnglishLessons = ({ navigation }) => {
  const renderEnglishCard = (topic, index) => {
    const cardStyle = [
      styles.card,
      { backgroundColor: topic.color },
      topic.isWide && styles.wideCard
    ];

    return (
      <Animatable.View
        animation="zoomIn"
        duration={500}
        delay={index * 100}
        key={topic.id}
        style={topic.isWide ? styles.wideCardContainer : styles.cardContainer}
      >
        <TouchableOpacity
          style={cardStyle}
          onPress={() => navigation.navigate(topic.route)}
          activeOpacity={0.8}
        >
          <Text style={styles.cardText}>{topic.title}</Text>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animatable.View 
        animation="fadeInDown" 
        duration={800} 
        style={styles.header}
      >
        <Text style={styles.headerText}>English</Text>
        <Text style={styles.subtitle}>Choose your lesson</Text>
      </Animatable.View>

      <View style={styles.cardsContainer}>
        {englishTopics.map((topic, index) => renderEnglishCard(topic, index))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B41',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardContainer: {
    width: cardWidth,
    marginBottom: 20,
  },
  wideCardContainer: {
    width: '100%',
    marginBottom: 20,
  },
  card: {
    height: cardWidth,
    borderRadius: 20,
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
    padding: 10,
  },
  wideCard: {
    width: '100%',
    height: cardWidth * 0.5,
  },
  cardText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default EnglishLessons; 