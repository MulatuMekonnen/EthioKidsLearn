import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();

  const menuItems = [
    {
      title: 'Math Quiz',
      icon: 'calculator-outline',
      screen: 'MathQuiz',
      gradient: ['#FF9A9E', '#FAD0C4'],
    },
    {
      title: 'Addition',
      icon: 'add-circle-outline',
      screen: 'Addition',
      gradient: ['#A18CD1', '#FBC2EB'],
    },
    {
      title: 'Words',
      icon: 'book-outline',
      screen: 'Words',
      gradient: ['#84FAB0', '#8FD3F4'],
    },
    {
      title: 'Oromo Lessons',
      icon: 'language-outline',
      screen: 'OromoLesson',
      gradient: ['#FFD1FF', '#FAD0C4'],
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A1B41', '#1F4068']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{user?.email?.split('@')[0] || 'Student'}</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {menuItems.map((item, index) => (
          <Animatable.View
            key={item.screen}
            animation="fadeInUp"
            delay={index * 100}
            style={styles.cardContainer}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate(item.screen)}
              style={styles.card}
            >
              <LinearGradient
                colors={item.gradient}
                style={styles.cardGradient}
              >
                <Ionicons name={item.icon} size={40} color="white" />
                <Text style={styles.cardTitle}>{item.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        ))}
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    color: '#A0A0A0',
    fontSize: 16,
  },
  nameText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  logoutButton: {
    padding: 10,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    marginBottom: 20,
  },
  card: {
    borderRadius: 15,
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
  cardGradient: {
    padding: 20,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default HomeScreen;