import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ChildLoginScreen from '../screens/auth/ChildLoginScreen';

// Content Viewer Screens
import ImageViewer from '../screens/child/ImageViewer';
import VideoPlayer from '../screens/child/VideoPlayer';
import DocumentViewer from '../screens/child/DocumentViewer';

// Role-based Screens
import AdminPanel from '../screens/admin/AdminPanel';
import TeacherHome from '../screens/teacher/TeacherHome';
import ParentHome from '../screens/parent/ParentHome';
import ParentDashboard from '../screens/parent/ParentDashboard';
import ProgressReport from '../screens/parent/ProgressReport';
import ChildProgress from '../screens/parent/ChildProgress';
import Settings from '../screens/parent/Settings';
import Profile from '../screens/parent/Profile';
import CreateTeacherScreen from '../screens/admin/CreateTeacherScreen';
import ContentManagementScreen from '../screens/admin/ContentManagementScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import ProfileScreen from '../screens/admin/ProfileScreen';
import CreateContentScreen from '../screens/teacher/CreateContentScreen';
import ChildScores from '../screens/teacher/ChildScores';
import ScoresByChild from '../screens/teacher/ScoresByChild';
import QuizScoresScreen from '../screens/teacher/QuizScoresScreen';
import TeacherProfileScreen from '../screens/teacher/ProfileScreen';
import StudentReports from '../screens/teacher/StudentReports';
import StudentProgress from '../screens/teacher/StudentProgress';

// Child Screens
import LessonsScreen from '../screens/child/LessonsScreen';
import StudentDashboard from '../screens/child/StudentDashboard';
import MathLessons from '../screens/child/MathLessons';
import LearnCount from '../screens/child/math/LearnCount';
import Addition from '../screens/child/math/Addition';
import Subtraction from '../screens/child/math/Subtraction';
import Multiplication from '../screens/child/math/Multiplication';
import Division from '../screens/child/math/Division';
import CountGame from '../screens/child/math/CountGame';
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
import ContentsScreen from '../screens/child/ContentsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, userRole, loading } = useAuth();
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

  if (loading || isFirstLaunch === null) {
    return null;
  }

  // Setup screen options with default params handler
  const screenOptions = {
    headerShown: false
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen} 
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ChildLogin" component={ChildLoginScreen} />
          </>
        ) : (
          // Role-based Stack
          <>
            {userRole === 'admin' && (
              <>
                <Stack.Screen name="AdminPanel" component={AdminPanel} />
                <Stack.Screen name="CreateTeacher" component={CreateTeacherScreen} />
                <Stack.Screen name="ManageUsers" component={UserManagementScreen} />
                <Stack.Screen name="ManageContent" component={ContentManagementScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
              </>
            )}
            {userRole === 'teacher' && (
              <>
                <Stack.Screen name="TeacherHome" component={TeacherHome} />
                <Stack.Screen name="CreateContent" component={CreateContentScreen} />
                <Stack.Screen name="ScoresByChild" component={ScoresByChild} />
                <Stack.Screen name="QuizScoresScreen" component={QuizScoresScreen} />
                <Stack.Screen name="StudentReports" component={StudentReports} />
                <Stack.Screen name="StudentProgress" component={StudentProgress} />
                <Stack.Screen name="Profile" component={TeacherProfileScreen} />
                <Stack.Screen name="ContentsScreen" component={ContentsScreen} />
                <Stack.Screen name="ImageViewer" component={ImageViewer} />
                <Stack.Screen name="VideoPlayer" component={VideoPlayer} />
                <Stack.Screen name="DocumentViewer" component={DocumentViewer} />
                {/* Add child screens for teacher access */}
                <Stack.Screen name="LessonsScreen" component={LessonsScreen} />
                <Stack.Screen name="MathLessons" component={MathLessons} />
                <Stack.Screen name="LearnCount" component={LearnCount} />
                <Stack.Screen name="Addition" component={Addition} />
                <Stack.Screen name="Subtraction" component={Subtraction} />
                <Stack.Screen name="Multiplication" component={Multiplication} />
                <Stack.Screen name="Division" component={Division} />
                <Stack.Screen name="CountGame" component={CountGame} />
                <Stack.Screen name="MathQuiz" component={MathQuiz} />
                <Stack.Screen name="EnglishLessons" component={EnglishLessons} />
                <Stack.Screen name="Alphabets" component={Alphabets} />
                <Stack.Screen name="Words" component={Words} />
                <Stack.Screen name="DaysOfWeek" component={DaysOfWeek} />
                <Stack.Screen name="Months" component={Months} />
                <Stack.Screen name="Colors" component={Colors} />
                <Stack.Screen name="EnglishQuiz" component={EnglishQuiz} />
                <Stack.Screen name="AmharicLessonsScreen" component={AmharicLessonsScreen} />
                <Stack.Screen name="OromoLessonScreen" component={OromoLessonScreen} />
                <Stack.Screen name="AnimalSoundsScreen" component={AnimalSoundsScreen} />
                <Stack.Screen name="TimeNavigationScreen" component={TimeNavigationScreen} />
              </>
            )}
            {userRole === 'parent' && (
              <>
                <Stack.Screen name="ParentHome" component={ParentHome} />
                <Stack.Screen name="ParentDashboard" component={ParentDashboard} />
                <Stack.Screen name="Profile" component={Profile} />
                <Stack.Screen name="ProgressReport" component={ProgressReport} />
                <Stack.Screen name="ChildProgress" component={ChildProgress} />
                <Stack.Screen name="Settings" component={Settings} />
                <Stack.Screen name="ChildLogin" component={ChildLoginScreen} />
                <Stack.Screen name="ContentsScreen" component={ContentsScreen} />
                <Stack.Screen name="ImageViewer" component={ImageViewer} />
                <Stack.Screen name="VideoPlayer" component={VideoPlayer} />
                <Stack.Screen name="DocumentViewer" component={DocumentViewer} />
                {/* Child Screens accessible from Parent */}
                <Stack.Screen name="LessonsScreen" component={LessonsScreen} />
                <Stack.Screen name="MathLessons" component={MathLessons} />
                <Stack.Screen name="LearnCount" component={LearnCount} />
                <Stack.Screen name="Addition" component={Addition} />
                <Stack.Screen name="Subtraction" component={Subtraction} />
                <Stack.Screen name="Multiplication" component={Multiplication} />
                <Stack.Screen name="Division" component={Division} />
                <Stack.Screen name="CountGame" component={CountGame} />
                <Stack.Screen name="MathQuiz" component={MathQuiz} />
                <Stack.Screen name="EnglishLessons" component={EnglishLessons} />
                <Stack.Screen name="Alphabets" component={Alphabets} />
                <Stack.Screen name="Words" component={Words} />
                <Stack.Screen name="DaysOfWeek" component={DaysOfWeek} />
                <Stack.Screen name="Months" component={Months} />
                <Stack.Screen name="Colors" component={Colors} />
                <Stack.Screen name="EnglishQuiz" component={EnglishQuiz} />
                <Stack.Screen name="AmharicLessonsScreen" component={AmharicLessonsScreen} />
                <Stack.Screen name="OromoLessonScreen" component={OromoLessonScreen} />
                <Stack.Screen name="AnimalSoundsScreen" component={AnimalSoundsScreen} />
                <Stack.Screen name="TimeNavigationScreen" component={TimeNavigationScreen} />
              </>
            )}
            {userRole === 'child' && (
              <>
                <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
                <Stack.Screen name="LessonsScreen" component={LessonsScreen} />
                <Stack.Screen name="ContentsScreen" component={ContentsScreen} />
                <Stack.Screen name="ImageViewer" component={ImageViewer} />
                <Stack.Screen name="VideoPlayer" component={VideoPlayer} />
                <Stack.Screen name="DocumentViewer" component={DocumentViewer} />
                <Stack.Screen name="MathLessons" component={MathLessons} />
                <Stack.Screen name="LearnCount" component={LearnCount} />
                <Stack.Screen name="Addition" component={Addition} />
                <Stack.Screen name="Subtraction" component={Subtraction} />
                <Stack.Screen name="Multiplication" component={Multiplication} />
                <Stack.Screen name="Division" component={Division} />
                <Stack.Screen name="CountGame" component={CountGame} />
                <Stack.Screen name="MathQuiz" component={MathQuiz} />
                <Stack.Screen name="EnglishLessons" component={EnglishLessons} />
                <Stack.Screen name="Alphabets" component={Alphabets} />
                <Stack.Screen name="Words" component={Words} />
                <Stack.Screen name="DaysOfWeek" component={DaysOfWeek} />
                <Stack.Screen name="Months" component={Months} />
                <Stack.Screen name="Colors" component={Colors} />
                <Stack.Screen name="EnglishQuiz" component={EnglishQuiz} />
                <Stack.Screen name="AmharicLessonsScreen" component={AmharicLessonsScreen} />
                <Stack.Screen name="OromoLessonScreen" component={OromoLessonScreen} />
                <Stack.Screen name="AnimalSoundsScreen" component={AnimalSoundsScreen} />
                <Stack.Screen name="TimeNavigationScreen" component={TimeNavigationScreen} />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
