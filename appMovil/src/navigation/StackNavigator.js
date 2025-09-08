import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator'; // Importa el nuevo TabNavigator mejorado

// Importar las pantallas modales/stack
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
      {/* TabNavigator como pantalla principal */}
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
      />
      
      {/* Pantalla para agregar mantenimiento */}
      <Stack.Screen
        name="AddMaintenance"
        component={AddMaintenanceScreen}
        options={{
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true,
        }}
      />

      {/* Pantalla para agregar vehículo */}
      <Stack.Screen
        name="NewVehicle"
        component={NewVehicleScreen}
        options={{
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true,
        }}
      />

      {/* Pantalla de marcas */}
      <Stack.Screen
        name="Brands"
        component={BrandsScreen}
        options={{
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true,
        }}
      />
      
      {/* Puedes agregar más pantallas aquí */}
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