import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

// Import screens
import WelcomeScreen from '../screens/WelcomeScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import TeacherDashboard from '../screens/teacher/TeacherDashboard';
import ProgressManagement from '../screens/teacher/ProgressManagement';
import ReportScreen from '../screens/teacher/ReportScreen';
import SendContent from '../screens/teacher/SendContent';

// Import dashboards
import AdminDashboard from '../screens/admin/AdminDashboard';
import ParentDashboard from '../screens/parent/ParentDashboard';
import ChildDashboard from '../screens/child/ChildDashboard';

// Import other screens
import LessonsScreen from '../screens/LessonsScreen';
import UserManagement from '../screens/admin/UserManagement';
import ContentManagement from '../screens/admin/ContentManagement';
import ProgressReports from '../screens/parent/ProgressReports';

// Import lesson screens
import MathLessons from '../screens/MathLessons';
import EnglishLessons from '../screens/EnglishLessons';

const Stack = createStackNavigator();

const RoleNavigator = () => {
  // Bypass authentication and role checks
  // Directly render all screens without requiring login

  // Define all screens that should be accessible
  const renderAllScreens = () => {
    return (
      <>
        {/* Role Selection Screen */}
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        
        {/* Child Dashboard and Lessons */}
        <Stack.Screen name="ChildDashboard" component={ChildDashboard} initialParams={{ bypassAuth: true }} />
        <Stack.Screen name="Lessons" component={LessonsScreen} />
        
        {/* Parent Dashboard */}
        <Stack.Screen name="ParentDashboard" component={ParentDashboard} initialParams={{ bypassAuth: true }} />
        <Stack.Screen name="ProgressReports" component={ProgressReports} />
        
        {/* Teacher Dashboard */}
        <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} initialParams={{ bypassAuth: true }} />
        <Stack.Screen name="ProgressManagement" component={ProgressManagement} />
        <Stack.Screen name="Reports" component={ReportScreen} />
        <Stack.Screen name="SendContent" component={SendContent} />
        
        {/* Admin Dashboard */}
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} initialParams={{ bypassAuth: true }} />
        <Stack.Screen name="UserManagement" component={UserManagement} />
        <Stack.Screen name="ContentManagement" component={ContentManagement} />
        
        {/* Lesson Screens */}
        <Stack.Screen name="MathsLesson" component={MathLessons} />
        <Stack.Screen name="EnglishLesson" component={EnglishLessons} />
      </>
    );
  };

  return (
    <Stack.Navigator
      initialRouteName="RoleSelection"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#101025' }
      }}
    >
      {renderAllScreens()}
    </Stack.Navigator>
  );
};

export default RoleNavigator;