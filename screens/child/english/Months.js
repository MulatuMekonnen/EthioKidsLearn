import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

const months = [
  { name: 'JANUARY', color: '#5D9CEC', icon: '❄️' },
  { name: 'FEBRUARY', color: '#FC6E51', icon: '💝' },
  { name: 'MARCH', color: '#48CFAD', icon: '🌱' },
  { name: 'APRIL', color: '#FFCE54', icon: '🌷' },
  { name: 'MAY', color: '#ED5565', icon: '🌺' },
  { name: 'JUNE', color: '#AC92EC', icon: '☀️' },
  { name: 'JULY', color: '#FC6E51', icon: '🎆' },
  { name: 'AUGUST', color: '#4FC1E9', icon: '🏄' },
  { name: 'SEPTEMBER', color: '#A0D468', icon: '🍁' },
  { name: 'OCTOBER', color: '#F5AB35', icon: '🎃' },
  { name: 'NOVEMBER', color: '#656D78', icon: '🍂' },
  { name: 'DECEMBER', color: '#E91E63', icon: '🎁' }
];

export default function MonthsOfYearScreen() {
  const navigation = useNavigation();

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
              onPress={() => {
                // Handle month selection
              }}
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