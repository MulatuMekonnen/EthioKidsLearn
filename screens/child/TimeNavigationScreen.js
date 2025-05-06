import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

export default function TimeNavigationScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animatable.View 
          animation="fadeInDown" 
          delay={300}
        >
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#2196F3' }]}
            onPress={() => navigation.navigate('DaysOfWeek')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Days of the week</Text>
          </TouchableOpacity>
        </Animatable.View>

        <Animatable.View 
          animation="fadeInUp" 
          delay={500}
        >
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FF0000' }]}
            onPress={() => navigation.navigate('Months')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Months of a year</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>

      <Animatable.View 
        animation="fadeIn" 
        delay={700}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  button: {
    width: 300,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
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
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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