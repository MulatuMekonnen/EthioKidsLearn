import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

const EnglishLessons = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { childId, childName } = route.params || { childId: '1', childName: 'Child' };
  const { currentTheme } = useTheme();
  const isDarkMode = currentTheme.mode === 'dark';

  const englishTopics = [
    {
      id: 1,
      title: 'Alphabets',
      icon: 'text-outline',
      screen: 'Alphabets',
      color: '#4CAF50',
      description: 'Learn the English alphabet with fun pronunciation and examples.'
    },
    {
      id: 2,
      title: 'Words',
      icon: 'book-outline',
      screen: 'Words',
      color: '#FF9800',
      description: 'Build your vocabulary with common words and their meanings.'
    },
    {
      id: 3,
      title: 'Days of Week',
      icon: 'calendar-outline',
      screen: 'DaysOfWeek',
      color: '#E91E63',
      description: 'Learn the days of the week and practice their pronunciation.'
    },
    {
      id: 4,
      title: 'Months',
      icon: 'calendar-outline',
      screen: 'Months',
      color: '#9C27B0',
      description: 'Explore the months of the year with interactive lessons.'
    },
    {
      id: 5,
      title: 'Colors',
      icon: 'color-palette-outline',
      screen: 'Colors',
      color: '#3F51B5',
      description: 'Learn to identify and name different colors in English.'
    },
    {
      id: 6,
      title: 'English Quiz',
      icon: 'help-circle-outline',
      screen: 'EnglishQuiz',
      color: '#2196F3',
      description: 'Test your English knowledge with fun and interactive quizzes.'
    },
    {
      id: 7,
      title: 'English Content',
      icon: 'library-outline',
      screen: 'ContentsScreen',
      color: '#9C27B0',
      description: 'View and download approved English content from teachers.',
      params: { category: 'english' }
    }
  ];

  const renderEnglishTopic = (topic) => {
    // Make colors brighter in dark mode
    const titleColor = isDarkMode ? '#FFFFFF' : currentTheme.text;
    const descriptionColor = isDarkMode ? '#FFFFFF' : '#555555';
    const cardBackground = isDarkMode ? '#1A1A1A' : 'white';
    const chevronColor = isDarkMode ? '#FFFFFF' : '#BBBBBB';
    
    // Brighter accent color in dark mode
    const topicColor = isDarkMode 
      ? brightifyColor(topic.color) 
      : topic.color;
    
    return (
      <TouchableOpacity
        key={topic.id}
        style={[
          styles.topicCard, 
          { 
            backgroundColor: cardBackground,
            shadowColor: isDarkMode ? '#000000' : '#000000',
            shadowOpacity: isDarkMode ? 0.5 : 0.1,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'transparent',
            borderWidth: isDarkMode ? 1 : 0,
          }
        ]}
        onPress={() => navigation.navigate(topic.screen, topic.params || { childId, childName })}
        activeOpacity={0.7}
      >
        <View style={[styles.cardContent, { borderLeftColor: topicColor, borderLeftWidth: 5 }]}>
          <View style={styles.topicInfo}>
            <Text style={[
              styles.topicTitle, 
              { 
                color: titleColor,
                textShadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.2)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: isDarkMode ? 3 : 1,
              }
            ]}>
              {topic.title}
            </Text>
            <Text style={[
              styles.topicDescription, 
              { 
                color: descriptionColor,
                textShadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: isDarkMode ? 3 : 0,
                fontWeight: isDarkMode ? '500' : '400',
              }
            ]}>
              {topic.description}
            </Text>
          </View>
          <View style={[
            styles.iconContainer, 
            { 
              backgroundColor: topicColor,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 4,
              elevation: 7,
              borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'transparent',
              borderWidth: isDarkMode ? 1 : 0,
            }
          ]}>
            <Ionicons name={topic.icon} size={30} color="#fff" />
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={26} 
            color={chevronColor} 
            style={[
              styles.chevron,
              {
                textShadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: isDarkMode ? 2 : 0,
              }
            ]} 
          />
        </View>
      </TouchableOpacity>
    );
  };

  // Function to brighten colors for dark mode
  const brightifyColor = (hexColor) => {
    // Convert hex to RGB
    let r = parseInt(hexColor.slice(1, 3), 16);
    let g = parseInt(hexColor.slice(3, 5), 16);
    let b = parseInt(hexColor.slice(5, 7), 16);
    
    // Increase brightness
    r = Math.min(255, r + 40);
    g = Math.min(255, g + 40);
    b = Math.min(255, b + 40);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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
        <Text style={[
          styles.headerText,
          {
            color: '#FFFFFF',
            textShadowColor: 'rgba(0, 0, 0, 0.7)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3,
          }
        ]}>English Lessons</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.topicsContainer}>
          {englishTopics.map(topic => renderEnglishTopic(topic))}
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
    fontSize: 22,
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
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  topicDescription: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  chevron: {
    marginLeft: 'auto',
  },
});

export default EnglishLessons; 