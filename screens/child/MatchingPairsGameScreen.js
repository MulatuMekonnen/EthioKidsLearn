import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const cards = [
  { id: '1', value: 'A' }, { id: '2', value: 'A' },
  { id: '3', value: 'B' }, { id: '4', value: 'B' },
  { id: '5', value: 'C' }, { id: '6', value: 'C' },
  { id: '7', value: 'D' }, { id: '8', value: 'D' },
];

export default function MatchingPairsGameScreen() {
  const navigation = useNavigation();
  const [shuffledCards, setShuffledCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    shuffleCards();
  }, []);

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setSelectedCards([]);
    setMatchedPairs([]);
    setScore(0);
  };

  const handleCardPress = (card) => {
    if (selectedCards.length === 2 || selectedCards.includes(card) || matchedPairs.includes(card.id)) {
      return;
    }

    const newSelectedCards = [...selectedCards, card];
    setSelectedCards(newSelectedCards);

    if (newSelectedCards.length === 2) {
      if (newSelectedCards[0].value === newSelectedCards[1].value) {
        setMatchedPairs([...matchedPairs, newSelectedCards[0].id, newSelectedCards[1].id]);
        setScore(score + 1);
      }
      setTimeout(() => setSelectedCards([]), 1000);
    }
  };

  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        selectedCards.includes(item) && styles.selectedCard,
        matchedPairs.includes(item.id) && styles.matchedCard,
      ]}
      onPress={() => handleCardPress(item)}
    >
      {(selectedCards.includes(item) || matchedPairs.includes(item.id)) && (
        <Text style={styles.cardText}>{item.value}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.score}>Score: {score}</Text>
      <FlatList
        data={shuffledCards}
        renderItem={renderCard}
        keyExtractor={item => item.id}
        numColumns={4}
        contentContainerStyle={styles.cardGrid}
      />
      <TouchableOpacity style={styles.resetButton} onPress={shuffleCards}>
        <Feather name="refresh-cw" size={24} color="white" />
        <Text style={styles.resetButtonText}>Reset</Text>
      </TouchableOpacity>
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
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 20,
  },
  cardGrid: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    width: 80,
    height: 80,
    backgroundColor: '#4299E1',
    margin: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: '#9F7AEA',
  },
  matchedCard: {
    backgroundColor: '#48BB78',
  },
  cardText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ED8936',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4299E1',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});