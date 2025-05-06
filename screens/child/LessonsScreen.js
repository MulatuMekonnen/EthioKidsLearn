import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const subjects = [
  { id: '1', title: 'Math', color: '#FF0000', route: 'MathLessons', icon: 'calculator-outline', description: 'Learn numbers, counting and basic arithmetic' },
  { id: '2', title: 'English', color: '#FFFF00', route: 'EnglishLessons', icon: 'text-outline', description: 'Practice letters, words and basic reading' },
  { id: '3', title: 'አማርኛ', color: '#00FF00', route: 'AmharicLessonsScreen', icon: 'language-outline', description: 'Learn Amharic alphabet and words' },
  { id: '4', title: 'A/Oromo', color: '#FF00FF', route: 'OromoLessonScreen', icon: 'earth-outline', description: 'Learn Oromo language basics' },
  { id: '5', title: 'Animals and their Sound', color: '#0088FF', route: 'AnimalSoundsScreen', icon: 'paw-outline', description: 'Discover animals and their sounds' },
  { id: '6', title: 'Time and Calendar', color: '#FF8800', route: 'TimeNavigationScreen', icon: 'time-outline', description: 'Learn about time, days and months' },
];

export default function LessonsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [activeChild, setActiveChild] = useState(null);
  const userName = activeChild?.name || user?.displayName || user?.email?.split('@')[0] || 'Student';

  useEffect(() => {
    loadActiveChild();
  }, []);

  useEffect(() => {
    // If route params include childId and childName, update active child
    if (route.params?.childId && route.params?.childName) {
      setActiveChild({
        id: route.params.childId,
        name: route.params.childName
      });
      
      // Save active child to AsyncStorage
      saveActiveChild({
        id: route.params.childId,
        name: route.params.childName
      });
    }
  }, [route.params]);

  const loadActiveChild = async () => {
    try {
      const savedActiveChild = await AsyncStorage.getItem('activeChild');
      if (savedActiveChild) {
        setActiveChild(JSON.parse(savedActiveChild));
      } else if (route.params?.childId && route.params?.childName) {
        // Use route params if available
        setActiveChild({
          id: route.params.childId,
          name: route.params.childName
        });
      }
    } catch (error) {
      console.error('Error loading active child:', error);
    }
  };
  
  const saveActiveChild = async (child) => {
    try {
      await AsyncStorage.setItem('activeChild', JSON.stringify(child));
    } catch (error) {
      console.error('Error saving active child:', error);
    }
  };

  const renderSubjectCard = (subject, index) => {
    return (
      <TouchableOpacity
        key={subject.id}
        style={[styles.subjectCard, { borderLeftColor: subject.color, borderLeftWidth: 5 }]}
        onPress={() => navigation.navigate(subject.route, 
          activeChild ? { childId: activeChild.id, childName: activeChild.name } : undefined
        )}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: subject.color }]}>
          <Ionicons name={subject.icon} size={28} color="#fff" />
        </View>
        <View style={styles.subjectContent}>
          <Text style={[styles.subjectTitle, { color: currentTheme?.text || '#fff' }]}>
            {subject.title}
          </Text>
          <Text style={[styles.subjectDescription, { color: currentTheme?.text || 'rgba(255,255,255,0.7)' }]}>
            {subject.description}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={currentTheme?.border || '#ccc'} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme?.background || '#1A1B41' }]}>
      <View style={[styles.header, { backgroundColor: currentTheme?.primary || '#2196F3' }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lessons</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.welcome}>
        <Text style={[styles.greeting, { color: currentTheme?.text || '#fff' }]}>
          Hello {userName}!
        </Text>
        <Text style={[styles.subtitle, { color: currentTheme?.text || 'rgba(255, 255, 255, 0.8)' }]}>
          Choose a subject to learn
        </Text>
      </View>

      {activeChild && (
        <View style={[styles.activeChildBanner, { backgroundColor: currentTheme?.card || '#FFFFFF20' }]}>
          <View style={styles.childAvatarCircle}>
            <Text style={styles.childAvatarText}>
              {activeChild.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={[styles.activeChildText, { color: currentTheme?.text || '#fff' }]}>
              Learning as: {activeChild.name}
            </Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        <View style={styles.subjectsContainer}>
          {subjects.map((subject, index) => renderSubjectCard(subject, index))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  welcome: {
    padding: 20,
    marginBottom: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 5,
    opacity: 0.8,
  },
  activeChildBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  childAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  childAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  activeChildText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  subjectsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  subjectCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  subjectContent: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subjectDescription: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },
});
