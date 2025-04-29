import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4;

const SubjectCard = ({ title, icon, color, onPress, delay }) => (
  <Animatable.View
    animation="zoomIn"
    delay={delay}
    style={[styles.card, { backgroundColor: color }]}
  >
    <TouchableOpacity onPress={onPress} style={styles.cardContent}>
      <Image source={icon} style={styles.cardIcon} resizeMode="contain" />
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  </Animatable.View>
);

const ChildDashboard = ({ navigation }) => {
  const { user } = useAuth();

  const subjects = [
    {
      title: 'Math',
      screen: 'MathLessons',
      icon: require('../../assets/images/math-icon.png'),
      color: '#FF6B6B',
      delay: 100,
    },
    {
      title: 'English',
      screen: 'EnglishLessons',
      icon: require('../../assets/images/english-icon.png'),
      color: '#4ECDC4',
      delay: 200,
    },
    {
      title: 'Animals',
      screen: 'Animals',
      icon: require('../../assets/images/animals-icon.png'),
      color: '#45B7D1',
      delay: 300,
    },
    {
      title: 'Time',
      screen: 'TimeNavigation',
      icon: require('../../assets/images/time-icon.png'),
      color: '#96CEB4',
      delay: 400,
    },
    {
      title: 'Afaan Oromo',
      screen: 'OromoLesson',
      icon: require('../../assets/images/oromo-icon.png'),
      color: '#FFEEAD',
      delay: 500,
    },
  ];

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInDown" style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome back, {user?.displayName || 'Student'}!
        </Text>
        <Text style={styles.subtitle}>What would you like to learn today?</Text>
      </Animatable.View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsContainer}>
          {subjects.map((subject, index) => (
            <SubjectCard
              key={subject.title}
              title={subject.title}
              icon={subject.icon}
              color={subject.color}
              delay={subject.delay}
              onPress={() => navigation.navigate(subject.screen)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B41',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#2196F3',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 15,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    margin: 10,
    borderRadius: 20,
    elevation: 5,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  cardIcon: {
    width: CARD_WIDTH * 0.5,
    height: CARD_WIDTH * 0.5,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

export default ChildDashboard; 