import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../Context/AuthContext';
import LoginScreen from '../screens/Login/LoginScreen';
import AdminTabNavigator from './AdminTabNavigator';
import ManagerTabNavigator from './ManagerTabNavigator';
import EmployeeTabNavigator from './EmployeeTabNavigator';

// Importar las pantallas modales/stack
import AddMaintenanceScreen from '../screens/Maintenances/AddMaintenance';
import NewVehicleScreen from '../screens/Vehicles/NewVehicle';
import BrandsScreen from '../screens/Vehicles/Brands';
import VehicleDetailsScreen from '../screens/Vehicles/VehicleDetails';
//import AddReservationScreen from '../screens/Reservations/AddReservation';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const { isAuthenticated, userType } = useAuth();

  // Función para obtener el navegador apropiado según el rol
  const getRoleBasedNavigator = () => {
    switch (userType) {
      case 'Administrador':
        return AdminTabNavigator;
      case 'Gestor':
        return ManagerTabNavigator;
      case 'Empleado':
        return EmployeeTabNavigator;
      default:
        return AdminTabNavigator; // Default fallback
    }
  };

  const TabNavigatorComponent = getRoleBasedNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          {/* TabNavigator basado en rol como pantalla principal */}
          <Stack.Screen
            name="MainTabs"
            component={TabNavigatorComponent}
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

          {/* Pantalla de detalles de vehículo */}
          <Stack.Screen
            name="VehicleDetails"
            component={VehicleDetailsScreen}
            options={{
              headerShown: false,
              presentation: 'card',
              gestureEnabled: true,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;