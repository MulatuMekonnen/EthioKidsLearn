import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import TeacherDashboard from '../screens/teacher/TeacherDashboard';
import ProgressManagement from '../screens/teacher/ProgressManagement';
import ReportScreen from '../screens/teacher/ReportScreen';
import SendContent from '../screens/teacher/SendContent';

const Stack = createStackNavigator();

const TeacherNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#101025' }
      }}
    >
      <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
      <Stack.Screen name="ProgressManagement" component={ProgressManagement} />
      <Stack.Screen name="Reports" component={ReportScreen} />
      <Stack.Screen name="SendContent" component={SendContent} />
    </Stack.Navigator>
  );
};

export default TeacherNavigator;