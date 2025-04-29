import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import RoleNavigator from './RoleNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  // Bypass authentication check - always render RoleNavigator
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoleNavigator" component={RoleNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;