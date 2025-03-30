import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 60 = padding (20) * 3 for left, right, and middle gap

const subjects = [
  { id: '1', title: 'Maths', color: '#FF0000', route: 'MathsLesson' },
  { id: '2', title: 'English', color: '#FFFF00', route: 'EnglishLesson' },
  { id: '3', title: 'አማርኛ', color: '#00FF00', route: 'AmharicLesson' },
  { id: '4', title: 'A/Oromo', color: '#FF00FF', route: 'OromoLesson' },
  { id: '5', title: 'Animals and\ntheir Sound', color: '#0088FF', route: 'AnimalsLesson', isWide: true },
  { id: '6', title: 'Days and\nMonths', color: '#FF8800', route: 'CalendarLesson', isWide: true },
];

export default function LessonsScreen() {
  const navigation = useNavigation();
  const userName = "user"; // This should come from your user context/state

  const renderSubjectCard = (subject, index) => {
    const cardStyle = [
      styles.card,
      { backgroundColor: subject.color },
      subject.isWide && styles.wideCard
    ];

    return (
      <Animatable.View
        animation="zoomIn"
        duration={500}
        delay={index * 100}
        key={subject.id}
        style={subject.isWide ? styles.wideCardContainer : styles.cardContainer}
      >
        <TouchableOpacity
          style={cardStyle}
          onPress={() => navigation.navigate(subject.route)}
          activeOpacity={0.8}
        >
          <Text style={styles.cardText}>{subject.title}</Text>
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
        <Text style={styles.greeting}>Hello "{userName}"!</Text>
      </Animatable.View>

      <View style={styles.cardsContainer}>
        {subjects.map((subject, index) => renderSubjectCard(subject, index))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B41',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'System',
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
    color: '#000000',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});