import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';

// Import modal/stack screens
import AddMaintenanceScreen from '../screens/Maintenances/AddMaintenance';
import NewVehicleScreen from '../screens/Vehicles/NewVehicle';
import EditVehicleScreen from '../screens/Vehicles/EditVehicle';
import BrandsScreen from '../screens/Vehicles/Brands';
import VehicleDetailsScreen from '../screens/Vehicles/VehicleDetails';
import MaintenanceDetailsScreen from '../screens/Maintenances/MaintenanceDetails';
import AddReservationScreen from '../screens/Reservations/AddReservation';
import ReservationDetailsScreen from '../screens/Reservations/ReservationDetails';
import EditReservationScreen from '../screens/Reservations/EditReservationScreen';

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

      {/* Pantalla detalles mantenimiento */}
      <Stack.Screen
        name="MaintenanceDetails"
        component={MaintenanceDetailsScreen}
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

      {/* Pantalla para editar vehículo */}
      <Stack.Screen
        name="EditVehicle"
        component={EditVehicleScreen}
        options={{
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true,
        }}
      />

      {/* Pantalla detalles vehículo */}
      <Stack.Screen
        name="VehicleDetails"
        component={VehicleDetailsScreen}
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
      
      {/* Pantalla para agregar reserva */}
      <Stack.Screen
        name="AddReservation"
        component={AddReservationScreen}
        options={{
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true,
        }}
      />

      {/* Pantalla detalles reserva */}
      <Stack.Screen
        name="ReservationDetails"
        component={ReservationDetailsScreen}
        options={{
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true,
        }}
      />

      {/* Pantalla para editar reserva */}
      <Stack.Screen
        name="EditReservation"
        component={EditReservationScreen}
        options={{
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;