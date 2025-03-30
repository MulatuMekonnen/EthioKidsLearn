import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomeScreen from './screens/HomeScreen';
import AuthScreen from './screens/AuthScreen';
import SignUpScreen from './screens/SignUpScreen';
import LessonsScreen from './screens/LessonsScreen';
import MathsLessonScreen from './screens/MathsLessonScreen';
import LearnToCountScreen from './screens/LearnToCountScreen';
import MathQuizScreen from './screens/MathQuizScreen';
import EnglishLessonScreen from './screens/EnglishLessonScreen';
import AlphabetsLessonScreen from './screens/AlphabetsLessonScreen';
import WordsLessonScreen from './screens/WordsLessonScreen';
import EnglishQuizScreen from './screens/EnglishQuizScreen';
import AmharicLessonScreen from './screens/AmharicLessonScreen';
import OromoLessonScreen from './screens/OromoLessonScreen';
import AnimalsLessonScreen from './screens/AnimalsLessonScreen';
import GamesScreen from './screens/GamesScreen';
import MatchingPairsGameScreen from './screens/MatchingPairsGameScreen';
import ProgressScreen from './screens/ProgressScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, userRole } = useAuth();
  
  console.log('AppNavigator - Current user:', user?.email);
  console.log('AppNavigator - User role:', userRole);

  return (
    <Stack.Navigator 
      initialRouteName={user ? "Home" : "Auth"} 
      screenOptions={{ headerShown: false }}
    >
      {user ? (
        // Authenticated stack
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Lessons" component={LessonsScreen} />
          <Stack.Screen name="MathsLesson" component={MathsLessonScreen} />
          <Stack.Screen name="LearnToCount" component={LearnToCountScreen} />
          <Stack.Screen name="MathQuiz" component={MathQuizScreen} />
          <Stack.Screen name="EnglishLesson" component={EnglishLessonScreen} />
          <Stack.Screen name="AlphabetsLesson" component={AlphabetsLessonScreen} />
          <Stack.Screen name="WordsLesson" component={WordsLessonScreen} />
          <Stack.Screen name="EnglishQuiz" component={EnglishQuizScreen} />
          <Stack.Screen name="AmharicLesson" component={AmharicLessonScreen} />
          <Stack.Screen name="OromoLesson" component={OromoLessonScreen} />
          <Stack.Screen name="AnimalsLesson" component={AnimalsLessonScreen} />
          <Stack.Screen name="Games" component={GamesScreen} />
          <Stack.Screen name="MatchingPairsGame" component={MatchingPairsGameScreen} />
          <Stack.Screen name="Progress" component={ProgressScreen} />
        </>
      ) : (
        // Auth stack
        <>
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}