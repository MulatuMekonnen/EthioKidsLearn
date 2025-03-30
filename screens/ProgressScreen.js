import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const completedLessons = [
  { id: '1', title: 'Alphabet A-E' },
  { id: '2', title: 'Numbers 1-5' },
  { id: '3', title: 'Colors' },
];

const earnedBadges = [
  { id: '1', title: 'Alphabet Master', icon: 'award' },
  { id: '2', title: 'Math Whiz', icon: 'star' },
];

export default function ProgressScreen() {
  const navigation = useNavigation();

  const renderStar = ({ item, index }) => (
    <Animatable.View
      animation="zoomIn"
      delay={index * 100}
      style={styles.star}
    >
      <Feather name="star" size={24} color="#F6E05E" />
    </Animatable.View>
  );

  const renderBadge = ({ item }) => (
    <Animatable.View animation="bounceIn" style={styles.badge}>
      <Feather name={item.icon} size={24} color="#4A5568" />
      <Text style={styles.badgeTitle}>{item.title}</Text>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Progress</Text>
      <View style={styles.starChart}>
        <FlatList
          data={completedLessons}
          renderItem={renderStar}
          keyExtractor={item => item.id}
          numColumns={5}
        />
      </View>
      <Text style={styles.subtitle}>Earned Badges</Text>
      <FlatList
        data={earnedBadges}
        renderItem={renderBadge}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.badgeList}
      />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Feather name="arrow-left" size={24} color="white" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9C4',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 20,
  },
  starChart: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  star: {
    margin: 5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 10,
  },
  badgeList: {
    flexGrow: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  badgeTitle: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2D3748',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4299E1',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});