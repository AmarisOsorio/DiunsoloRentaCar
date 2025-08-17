import { NavigationContainer } from '@react-navigation/native'; // Importa el contenedor de navegación
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Importa el creador de stack navigator

import LoginScreen from '../screens/Login/LoginScreen.js';
import AdminTabNavigator from './AdminTabNavigator';
import ManagerTabNavigator from './ManagerTabNavigator';
import EmployeeTabNavigator from './EmployeeTabNavigator';
export default function Navigation() {

  const Stack = createNativeStackNavigator(); // Crea una instancia del stack navigator

  return (
    <NavigationContainer> 
      <Stack.Navigator
        initialRouteName='Login'
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
        <Stack.Screen name="ManagerTabs" component={ManagerTabNavigator} />
        <Stack.Screen name="EmployeeTabs" component={EmployeeTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}