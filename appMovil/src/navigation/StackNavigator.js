import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';

// Import modal/stack screens
import AddMaintenanceScreen from '../screens/Maintenances/AddMaintenance';
import NewVehicleScreen from '../screens/Vehicles/NewVehicle';
import BrandsScreen from '../screens/Vehicles/Brands';
//import AddReservationScreen from '../screens/Reservations/AddReservation';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main tabs */}
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
      />
      
      {/* Add maintenance screen */}
      <Stack.Screen
        name="AddMaintenance"
        component={AddMaintenanceScreen}
        options={{
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true,
        }}
      />

      {/* New vehicle screen */}
      <Stack.Screen
        name="NewVehicle"
        component={NewVehicleScreen}
        options={{
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true,
        }}
      />

      {/* Brands screen */}
      <Stack.Screen
        name="Brands"
        component={BrandsScreen}
        options={{
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true,
        }}
      />
      {/*
      <Stack.Screen
        name="AddReservation"
        component={AddReservationScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
          gestureEnabled: true,
        }}
      />
      */}
    </Stack.Navigator>
  );
};

export default StackNavigator;