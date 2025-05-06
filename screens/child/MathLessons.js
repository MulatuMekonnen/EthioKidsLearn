import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

const MathLessons = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { childId, childName } = route.params || { childId: '1', childName: 'Child' };
  const { currentTheme } = useTheme();

  const mathTopics = [
    {
      id: 1,
      title: 'Learn to Count',
      icon: 'apps-outline',
      screen: 'LearnCount',
      color: '#4CAF50',
      description: 'Learn numbers from 1-20 with fun visual aids and interactive exercises.'
    },
    {
      id: 2,
      title: 'Addition',
      icon: 'add-circle-outline',
      screen: 'Addition',
      color: '#FF9800',
      description: 'Practice adding numbers with easy-to-understand examples and games.'
    },
    {
      id: 3,
      title: 'Subtraction',
      icon: 'remove-circle-outline',
      screen: 'Subtraction',
      color: '#E91E63',
      description: 'Master the basics of subtraction through step-by-step lessons.'
    },
    {
      id: 4,
      title: 'Multiplication',
      icon: 'grid-outline',
      screen: 'Multiplication',
      color: '#9C27B0',
      description: 'Learn multiplication tables and solve fun multiplication puzzles.'
    },
    {
      id: 5,
      title: 'Division',
      icon: 'pie-chart-outline',
      screen: 'Division',
      color: '#3F51B5',
      description: 'Understand division concepts with visual aids and simple problems.'
    },
    {
      id: 6,
      title: 'Math Quiz',
      icon: 'help-circle-outline',
      screen: 'MathQuiz',
      color: '#2196F3',
      description: 'Test your math skills with quizzes covering all the topics you\'ve learned.'
    }
  ];

  const renderMathTopic = (topic) => {
    return (
      <TouchableOpacity
        key={topic.id}
        style={styles.topicCard}
        onPress={() => navigation.navigate(topic.screen, { childId, childName })}
      >
        <View style={[styles.cardContent, { borderLeftColor: topic.color, borderLeftWidth: 5 }]}>
          <View style={styles.topicInfo}>
            <Text style={[styles.topicTitle, { color: currentTheme.text }]}>{topic.title}</Text>
            <Text style={styles.topicDescription}>{topic.description}</Text>
          </View>
          <View style={[styles.iconContainer, { backgroundColor: topic.color }]}>
            <Ionicons name={topic.icon} size={28} color="#fff" />
          </View>
          <Ionicons name="chevron-forward" size={24} color="#bbb" style={styles.chevron} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Mathematics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.topicsContainer}>
          {mathTopics.map(topic => renderMathTopic(topic))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  topicsContainer: {
    padding: 16,
  },
  topicCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  topicInfo: {
    flex: 1,
    marginRight: 12,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
    color: '#757575',
    opacity: 0.7,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  chevron: {
    marginLeft: 'auto',
  },
});

export default MathLessons; 