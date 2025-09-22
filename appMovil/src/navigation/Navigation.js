import { NavigationContainer } from '@react-navigation/native'; // Importa el contenedor de navegación
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Importa el creador de stack navigator
//navbars por rol
import LoginScreen from '../screens/Login/LoginScreen.js';
import AdminTabNavigator from './AdminTabNavigator';
import ManagerTabNavigator from './ManagerTabNavigator';
import EmployeeTabNavigator from './EmployeeTabNavigator';
//paginas en Vehicles
import NewVehicle from '../screens/Vehicles/NewVehicle';
import Brands from '../screens/Vehicles/Brands';
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
        <Stack.Screen name="NewVehicle" component={NewVehicle} options={{ headerShown: false }} />
        <Stack.Screen name="Brands" component={Brands} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
