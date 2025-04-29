import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import UnifiedLogin from '../screens/auth/UnifiedLogin';
import UnifiedSignup from '../screens/auth/UnifiedSignup';
import ChildLogin from '../screens/auth/ChildLogin';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#101025' }
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={UnifiedLogin} />
      <Stack.Screen name="Signup" component={UnifiedSignup} />
      <Stack.Screen name="ChildLogin" component={ChildLogin} />
    </Stack.Navigator>
  );
};

export default AuthNavigator; 