import React, { useState, useRef, useEffect } from 'react';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfilePopout from './Components/ProfilePopout';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, TouchableOpacity, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import VehiclesScreen from '../screens/Vehicles/Vehicles';
import ReservationScreen from '../screens/Reservations/Reservation';
import Contracts from '../screens/Contracts/Contracts';
import Usuarios from '../screens/Users/Users';

const Tab = createBottomTabNavigator();

const TabArr = [
  { route: 'HomeEmployee', label: 'Inicio', icon: 'home', component: HomeScreen },
  { route: 'Vehicles', label: 'Vehículos', icon: 'car', component: VehiclesScreen },
  { route: 'Reservations', label: 'Reservas', icon: 'calendar', component: ReservationScreen },
  { route: 'Contracts', label: 'Contratos', icon: 'document-text', component: Contracts },
  { route: 'Clients', label: 'Clientes', icon: 'people', component: Usuarios },
];

const animate1 = { 0: { scale: .5, translateY: 7 }, .92: { translateY: -10 }, 1: { scale: 1.05, translateY: -6 } };
const animate2 = { 0: { scale: 1.05, translateY: -6 }, 1: { scale: 1, translateY: 7 } };
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

const TabButton = (props) => {
  const { item, onPress, accessibilityState } = props;
  const focused = accessibilityState.selected;
  const viewRef = useRef(null);
  const circleRef = useRef(null);
  const textRef = useRef(null);

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

export default function EmployeeTabNavigator() {
  const [showProfile, setShowProfile] = useState(false);
  const navigation = useNavigation();

  const CustomTabBar = (props) => (
    <View style={stylesAnim.tabBar}>
      {props.state.routes.map((route, index) => {
        const item = TabArr.find(t => t.route === route.name);
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
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar
        backgroundColor="#3D83D2"
        barStyle="light-content"
        translucent={false}
        animated={true}
      />
      
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Tab.Navigator
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#3D83D2',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
              height: 65,
            },
            headerTitleStyle: {
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 18,
              alignSelf: 'center',
            },
            headerTintColor: '#fff',
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
              height: Platform.OS === 'ios' ? 80 : 70
            },
            headerRight: () => (
              <TouchableOpacity style={styles.profileButton} onPress={() => setShowProfile(true)}>
                <View style={styles.profileIconCircle}>
                  <Ionicons name="person" size={28} color="#3D83D2" />
                </View>
              </TouchableOpacity>
            ),
          }}
          tabBar={CustomTabBar}
        >
          {TabArr.map((item, idx) => (
            <Tab.Screen
              key={item.route}
              name={item.route}
              component={item.component}
              options={{
                title: item.title || item.label,
              }}
            />
          ))}
        </Tab.Navigator>
      </View>
      <ProfilePopout
        visible={showProfile}
        onClose={() => setShowProfile(false)}
        navigation={navigation}
        onRequestReopen={() => setShowProfile(true)}
        onRequestCloseProfile={() => setShowProfile(false)}
      />
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
    marginRight: 10,
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
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
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