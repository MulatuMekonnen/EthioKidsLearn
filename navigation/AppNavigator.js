import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

// Auth Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import AuthScreen from '../screens/AuthScreen';
import SignUpScreen from '../screens/SignUpScreen';

// Main Screens
import LessonsScreen from '../screens/LessonsScreen';

// Math Screens
import MathLessons from '../screens/MathLessons';
import LearnCount from '../screens/math/LearnCount';
import Addition from '../screens/math/Addition';
import Subtraction from '../screens/math/Subtraction';
import Multiplication from '../screens/math/Multiplication';
import Division from '../screens/math/Division';
import MathQuiz from '../screens/math/MathQuiz';

// English Screens
import EnglishLessons from '../screens/EnglishLessons';
import Alphabets from '../screens/english/Alphabets';
import Words from '../screens/english/Words';
import DaysOfWeek from '../screens/english/DaysOfWeek';
import Months from '../screens/english/Months';
import Colors from '../screens/english/Colors';
import EnglishQuiz from '../screens/english/EnglishQuiz';

// Other Subjects
import AmharicLessonsScreen from '../screens/AmharicLessonsScreen';
import OromoLessonScreen from '../screens/OromoLessonScreen';
import AnimalSoundsScreen from '../screens/AnimalSoundsScreen';
import TimeNavigationScreen from '../screens/TimeNavigationScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Auth" 
              component={AuthScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="SignUp" 
              component={SignUpScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen
              name="Lessons"
              component={LessonsScreen}
              options={{ 
                title: 'Choose a Subject',
                headerShown: false 
              }}
            />

            {/* Math Routes */}
            <Stack.Screen
              name="MathsLesson"
              component={MathLessons}
              options={{ title: 'Mathematics' }}
            />
            <Stack.Screen 
              name="LearnCount" 
              component={LearnCount}
              options={{ title: 'Learn to Count' }}
            />
            <Stack.Screen 
              name="Addition" 
              component={Addition}
              options={{ title: 'Addition' }}
            />
            <Stack.Screen 
              name="Subtraction" 
              component={Subtraction}
              options={{ title: 'Subtraction' }}
            />
            <Stack.Screen 
              name="Multiplication" 
              component={Multiplication}
              options={{ title: 'Multiplication' }}
            />
            <Stack.Screen 
              name="Division" 
              component={Division}
              options={{ title: 'Division' }}
            />
            <Stack.Screen 
              name="MathQuiz" 
              component={MathQuiz}
              options={{ title: 'Math Quiz' }}
            />

            {/* English Routes */}
            <Stack.Screen
              name="EnglishLesson"
              component={EnglishLessons}
              options={{ title: 'English' }}
            />
            <Stack.Screen name="Alphabets" component={Alphabets} />
            <Stack.Screen name="Words" component={Words} />
            <Stack.Screen name="DaysOfWeek" component={DaysOfWeek} />
            <Stack.Screen name="Months" component={Months} />
            <Stack.Screen name="Colors" component={Colors} />
            <Stack.Screen name="EnglishQuiz" component={EnglishQuiz} />

            {/* Other Subject Routes */}
            <Stack.Screen 
              name="AmharicLesson" 
              component={AmharicLessonsScreen}
              options={{ title: 'አማርኛ' }}
            />
            <Stack.Screen 
              name="OromoLesson" 
              component={OromoLessonScreen}
              options={{ title: 'Afaan Oromo' }}
            />
            <Stack.Screen 
              name="AnimalsLesson" 
              component={AnimalSoundsScreen}
              options={{ title: 'Animals and their Sounds' }}
            />
            <Stack.Screen 
              name="CalendarLesson" 
              component={TimeNavigationScreen}
              options={{ title: 'Days and Months' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 