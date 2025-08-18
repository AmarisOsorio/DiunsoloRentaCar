// Importación de librerías y componentes necesarios
import React, { useState, useRef, useEffect } from 'react';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';
import MorePopout from './Components/submenu';
import ProfilePopout from './Components/ProfilePopout';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
// Importación de las pantallas que se mostrarán en el tab
import HomeAdmin from '../screens/HomeAdmin/HomeAdmin';
import Vehicles from '../screens/Vehicles/Vehicles';
import Reservations from '../screens/Reservations/Reservations';
import Contracts from '../screens/Contracts/Constracts';
import Maintenance from '../screens/Maintenance/Maintenance';
import Clients from '../screens/Users/Clients/Clients';
import Employees from '../screens/Users/Employees/Employees';


// Inicializa el Tab Navigator
const Tab = createBottomTabNavigator();

// Definición de los tabs con iconos y colores actuales
const TabArr = [
  { route: 'HomeAdmin', label: 'Inicio', icon: 'home', component: HomeAdmin },
  { route: 'Vehicles', label: 'Vehículos', icon: 'car', component: Vehicles },
  { route: 'Reservations', label: 'Reservas', icon: 'calendar', component: Reservations },
  { route: 'Contracts', label: 'Contratos', icon: 'document', component: Contracts },
  { route: 'Maintenance', label: 'Mantenimientos', icon: 'build', component: Maintenance, hidden: true },
  { route: 'Clients', label: 'Usuarios', icon: 'people', component: Clients, hidden: true },
  { route: 'Employees', label: 'Empleados', icon: 'person', component: Employees, hidden: true },
]; 

// Animaciones para el tab
const animate1 = { 0: { scale: .5, translateY: 7 }, .92: { translateY: -10 }, 1: { scale: 1.05, translateY: -6 } };
const animate2 = { 0: { scale: 1.05, translateY: -6 }, 1: { scale: 1, translateY: 7 } };
// Animación de círculos
const circle1 = {
  0: { scale: 0, opacity: 0 },
  0.2: { scale: 0.7, opacity: 0.7 },
  0.5: { scale: 1.05, opacity: 1 },
  0.7: { scale: 0.95, opacity: 1 },
  1: { scale: 1, opacity: 1 }
};
const circle2 = {
  0: { scale: 1, opacity: 1 },
  1: { scale: 0, opacity: 0 }
};

// Componente de botón animado para el tab
const TabButton = (props) => {
  // Props del tab
  const { item, onPress, accessibilityState } = props;
  const focused = accessibilityState.selected;
  // Refs para animaciones
  const viewRef = useRef(null);
  const circleRef = useRef(null);
  const textRef = useRef(null);

  // Efecto para animar cuando cambia el foco
  useEffect(() => {
    if (focused) {
      viewRef.current?.animate(animate1);
      circleRef.current?.animate(circle1);
    } else {
      viewRef.current?.animate(animate2);
      circleRef.current?.animate(circle2);
    }
  }, [focused]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={stylesAnim.container}
    >
      <Animatable.View
        ref={viewRef}
        duration={700}
        style={[stylesAnim.container, { justifyContent: 'center', alignItems: 'center' }]}
      >
        <View style={{ alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
          <View style={[stylesAnim.btn, { borderColor: '#fff', backgroundColor: '#fff', marginBottom: 0 }]}> 
            <Animatable.View
              ref={circleRef}
              style={[stylesAnim.circle, { backgroundColor: '#153A8B' }]}
              duration={500}
              useNativeDriver
            />
            <Ionicons name={item.icon + (focused ? '' : '-outline')} size={28} color={focused ? '#fff' : '#153A8B'} />
          </View>
          <Text
            ref={textRef}
            style={[stylesAnim.text, { color: focused ? '#153A8B' : '#153A8B', opacity: 1, marginTop: -6, marginBottom: 0 }]}
          >
            {item.label}
          </Text>
        </View>
      </Animatable.View>
    </TouchableOpacity>
  );
};


// Componente principal del Tab Navigator para el administrador
export default function AdminTabNavigator() {
  // Estado para mostrar/ocultar el popout de perfil y el submenu
  const [showProfile, setShowProfile] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const navigation = useNavigation();
  // TabBar personalizado para poder usar hooks correctamente
  const CustomTabBar = (props) => (
    <>
      <View style={stylesAnim.tabBar}>
        {props.state.routes.map((route, index) => {
          // Oculta los tabs que no deben mostrarse
          const item = TabArr.find(t => t.route === route.name);
          if (item?.hidden) return null;
          return (
            <TabButton
              key={route.key}
              {...props}
              item={item}
              onPress={() => props.navigation.navigate(route.name)}
              accessibilityState={{ selected: props.state.index === index }}
            />
          );
        })}
        {/* Botón Ver más al final del tabBar */}
        <TouchableOpacity
          style={{ alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}
          onPress={() => setShowMore(true)}
          activeOpacity={0.7}
        >
          <View style={{ backgroundColor: '#fff', borderRadius: 20, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.10, shadowRadius: 2, elevation: 2 }}>
            <Ionicons name="ellipsis-vertical" size={28} color="#153A8B" />
          </View>
          <Text style={{ color: '#153A8B', fontWeight: 'bold', fontSize: 12, marginTop: 2 }}>Ver más</Text>
        </TouchableOpacity>
      </View>
      <MorePopout
        visible={showMore}
        onClose={() => setShowMore(false)}
        navigation={props.navigation}
      />
    </>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header superior solo con botón de perfil a la derecha */}
      <View style={styles.headerContainer}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.profileButton} onPress={() => setShowProfile(true)}>
          <View style={styles.profileIconCircle}>
            <Ionicons name="person" size={28} color="#3D83D2" />
          </View>
        </TouchableOpacity>
      </View>
      {/* Popout de perfil */}
      <ProfilePopout
        visible={showProfile}
        onClose={() => setShowProfile(false)}
        navigation={navigation}
        onRequestReopen={() => setShowProfile(true)}
        onRequestCloseProfile={() => setShowProfile(false)}
      />
      {/* Tab Navigator con animación personalizada y tabBar custom */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: '#3D83D2', elevation: 0, shadowOpacity: 0, borderBottomWidth: 0, height: 25 },
          headerTitleStyle: { color: '#fff', fontWeight: 'bold', padding: 0, margin: 0 },
          headerTintColor: '#fff',
        })}
        tabBar={CustomTabBar}
      >
        {/* Definición de las pantallas del tab */}
        {TabArr.map((item, idx) => (
          <Tab.Screen
            key={item.route}
            name={item.route}
            component={item.component}
            options={{
              title: item.label,
              tabBarButton: item.hidden ? () => null : undefined,
            }}
          />
        ))}
      </Tab.Navigator>
    </SafeAreaView>
  );
}

// Estilos para el header y popout
const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3D83D2',
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 18,
    height: 65,
    zIndex: 10,
    borderBottomWidth: 0, 
    elevation: 0,
    shadowOpacity: 0,
  },
  profileButton: {
    backgroundColor: 'transparent',
    borderRadius: 32,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIconCircle: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
});

// Estilos para el navbar animado
const stylesAnim = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 70,
    paddingBottom: 8.5,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    paddingHorizontal: 8,
    height: Platform.OS === 'ios' ? 80 : 70,
  },
  btn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  circle: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#153A8B',
    borderRadius: 25,
    zIndex: -1,
  },
  text: {
    fontSize: 12,
    textAlign: 'center',
    color: '#153A8B',
    fontWeight: 'bold',
    marginTop: 0,
    marginBottom: 0,
    padding: 0,
  },
});
