import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import AuthScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// Role-based Screens
import AdminPanel from '../screens/admin/AdminPanel';
import TeacherHome from '../screens/teacher/TeacherHome';
import ParentHome from '../screens/parent/ParentHome';

// Child / Parent-child shared lesson screens
import LessonsScreen from '../screens/child/LessonsScreen';
import MathLessons from '../screens/child/MathLessons';
import LearnCount from '../screens/child/math/LearnCount';
import Addition from '../screens/child/math/Addition';
import Subtraction from '../screens/child/math/Subtraction';
import Multiplication from '../screens/child/math/Multiplication';
import Division from '../screens/child/math/Division';
import MathQuiz from '../screens/child/math/MathQuiz';
import EnglishLessons from '../screens/child/EnglishLessons';
import Alphabets from '../screens/child/english/Alphabets';
import Words from '../screens/child/english/Words';
import DaysOfWeek from '../screens/child/english/DaysOfWeek';
import Months from '../screens/child/english/Months';
import Colors from '../screens/child/english/Colors';
import EnglishQuiz from '../screens/child/english/EnglishQuiz';
import AmharicLessonsScreen from '../screens/child/AmharicLessonsScreen';
import OromoLessonScreen from '../screens/child/OromoLessonScreen';
import AnimalSoundsScreen from '../screens/child/AnimalSoundsScreen';
import TimeNavigationScreen from '../screens/child/TimeNavigationScreen';
import ParentDashboard from '../screens/parent/ParentDashboard';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, userRole } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    (async () => {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched === null) {
        await AsyncStorage.setItem('hasLaunched', 'true');
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    })();
  }, []);

  if (isFirstLaunch === null) return null;

  return (
    <NavigationContainer>
      {/* Unauthenticated Stack */}
      {!user ? (
        <Stack.Navigator
          initialRouteName={isFirstLaunch ? 'Welcome' : 'Auth'}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>

      ) : userRole === 'admin' ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="AdminPanel" component={AdminPanel} />
        </Stack.Navigator>

      ) : userRole === 'teacher' ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="TeacherHome" component={TeacherHome} />
        </Stack.Navigator>

      ) : userRole === 'parent' ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Parent sees home, then can navigate through full lesson flow */}
          <Stack.Screen name="ParentHome" component={ParentHome} />
          <Stack.Screen name="ChildDashboard" component={LessonsScreen} />
          <Stack.Screen name="ParentDashboard" component={ParentDashboard} />

          {/* Include all lesson screens under the same navigator */}
          <Stack.Screen name="Lessons" component={LessonsScreen} />
          <Stack.Screen name="MathsLesson" component={MathLessons} />
          <Stack.Screen name="LearnCount" component={LearnCount} />
          <Stack.Screen name="Addition" component={Addition} />
          <Stack.Screen name="Subtraction" component={Subtraction} />
          <Stack.Screen name="Multiplication" component={Multiplication} />
          <Stack.Screen name="Division" component={Division} />
          <Stack.Screen name="MathQuiz" component={MathQuiz} />
          <Stack.Screen name="EnglishLesson" component={EnglishLessons} />
          <Stack.Screen name="Alphabets" component={Alphabets} />
          <Stack.Screen name="Words" component={Words} />
          <Stack.Screen name="DaysOfWeek" component={DaysOfWeek} />
          <Stack.Screen name="Months" component={Months} />
          <Stack.Screen name="Colors" component={Colors} />
          <Stack.Screen name="EnglishQuiz" component={EnglishQuiz} />
          <Stack.Screen name="AmharicLesson" component={AmharicLessonsScreen} />
          <Stack.Screen name="OromoLesson" component={OromoLessonScreen} />
          <Stack.Screen name="AnimalsLesson" component={AnimalSoundsScreen} />
          <Stack.Screen name="CalendarLesson" component={TimeNavigationScreen} />
        </Stack.Navigator>

      ) : (
        /* child role fallback - same as parent for direct app flow */
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Lessons" component={LessonsScreen} />
          <Stack.Screen name="MathsLesson" component={MathLessons} />
          <Stack.Screen name="LearnCount" component={LearnCount} />
          <Stack.Screen name="Addition" component={Addition} />
          <Stack.Screen name="Subtraction" component={Subtraction} />
          <Stack.Screen name="Multiplication" component={Multiplication} />
          <Stack.Screen name="Division" component={Division} />
          <Stack.Screen name="MathQuiz" component={MathQuiz} />
          <Stack.Screen name="EnglishLesson" component={EnglishLessons} />
          <Stack.Screen name="Alphabets" component={Alphabets} />
          <Stack.Screen name="Words" component={Words} />
          <Stack.Screen name="DaysOfWeek" component={DaysOfWeek} />
          <Stack.Screen name="Months" component={Months} />
          <Stack.Screen name="Colors" component={Colors} />
          <Stack.Screen name="EnglishQuiz" component={EnglishQuiz} />
          <Stack.Screen name="AmharicLesson" component={AmharicLessonsScreen} />
          <Stack.Screen name="OromoLesson" component={OromoLessonScreen} />
          <Stack.Screen name="AnimalsLesson" component={AnimalSoundsScreen} />
          <Stack.Screen name="CalendarLesson" component={TimeNavigationScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
