import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

const operations = [
  { name: 'Addition +', route: 'Addition', color: '#2196F3' },
  { name: 'Subtraction -', route: 'Subtraction', color: '#2196F3' },
  { name: 'Multiplication X', route: 'Multiplication', color: '#FF0000' },
  { name: 'Division /', route: 'Division', color: '#FF0000' },
];

export default function ArithmeticScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {operations.map((operation, index) => (
          <Animatable.View 
            key={operation.name}
            animation="fadeInUp"
            delay={300 + (index * 200)}
          >
            <TouchableOpacity
              style={[styles.button, { backgroundColor: operation.color }]}
              onPress={() => navigation.navigate(operation.route)}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{operation.name}</Text>
            </TouchableOpacity>
          </Animatable.View>
        ))}
      </View>

      <Animatable.View 
        animation="fadeIn" 
        delay={1200}
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
    gap: 20,
  },
  button: {
    width: 300,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    elevation: 5,
    marginVertical: 8,
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