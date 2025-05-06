import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

const days = [
  { name: 'MONDAY', color: '#FF9B54', icon: '😊' },
  { name: 'TUESDAY', color: '#CE2D4F', icon: '🌟' },
  { name: 'WEDNESDAY', color: '#4B878B', icon: '🐸' },
  { name: 'THURSDAY', color: '#8B5FBF', icon: '🦄' },
  { name: 'FRIDAY', color: '#01A7C2', icon: '🎉' },
  { name: 'SATURDAY', color: '#F76C5E', icon: '🚀' },
  { name: 'SUNDAY', color: '#6DC066', icon: '🌈' }
];

export default function DaysOfWeekScreen() {
  const navigation = useNavigation();

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
              onPress={() => {
                // Handle day selection
              }}
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