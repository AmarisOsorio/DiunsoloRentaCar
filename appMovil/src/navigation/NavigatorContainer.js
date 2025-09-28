import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../Context/AuthContext';
import StackNavigator from './StackNavigator';
import LoginScreen from '../screens/Login/LoginScreen';
import ForgotPassScreen from '../screens/ForgotPassword/ForgotPassScreen';

const Stack = createNativeStackNavigator();

const AppNavigationContainer = () => {
  const { isAuthenticated } = useAuth();
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={isAuthenticated ? "MainApp" : "Login"}
      >
        {isAuthenticated ? (
          // Main app
          <Stack.Screen name="MainApp" component={StackNavigator} />
        ) : (
          // Auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigationContainer;