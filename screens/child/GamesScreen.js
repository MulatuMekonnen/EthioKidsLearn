import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const games = [
  { id: '1', title: 'Matching Pairs', icon: 'grid' },
  { id: '2', title: 'Counting Game', icon: 'hash' },
  { id: '3', title: 'Color Quiz', icon: 'droplet' },
];

export default function GamesScreen() {
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <Animatable.View animation="bounceIn" duration={1000}>
      <TouchableOpacity
        style={styles.gameCard}
        onPress={() => navigation.navigate('MatchingPairsGame', { gameId: item.id })}
      >
        <Feather name={item.icon} size={24} color="#4A5568" />
        <Text style={styles.gameTitle}>{item.title}</Text>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fun Games</Text>
      <FlatList
        data={games}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.gameList}
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
  gameList: {
    flexGrow: 1,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  gameTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
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