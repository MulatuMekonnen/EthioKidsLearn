import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

const menuItems = [
  { name: 'Lessons', route: 'Lessons', color: '#2196F3', delay: 300 },
  { name: 'Progress', route: 'Progress', color: '#FF0000', delay: 500 },
  { name: 'Download', route: 'Download', color: '#FFA500', delay: 700 },
];

export default function ChildDashboard() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {menuItems.map((item) => (
          <Animatable.View
            key={item.name}
            animation="fadeInDown"
            delay={item.delay}
            style={styles.buttonContainer}
          >
            <TouchableOpacity
              style={[styles.button, { backgroundColor: item.color }]}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{item.name}</Text>
            </TouchableOpacity>
          </Animatable.View>
        ))}
      </View>

      <Animatable.View
        animation="fadeInUp"
        delay={900}
        style={styles.logoutContainer}
      >
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.logoutText}>⇨ Logout</Text>
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
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
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
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logoutContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 5,
  },
  logoutText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 