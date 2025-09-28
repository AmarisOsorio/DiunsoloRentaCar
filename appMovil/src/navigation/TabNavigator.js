import React, { useState, useRef, useEffect } from 'react';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, TouchableOpacity, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../Context/AuthContext.js';
import MorePopout from './Components/submenu.js';
import ProfilePopout from './Components/ProfilePopout.js';

// Screen imports
import HomeScreen from '../screens/HomeScreen.js';
import Vehicles from '../screens/Vehicles/Vehicles.js';
import Reservation from '../screens/Reservations/Reservation.js';
import Maintenance from '../screens/Maintenances/Maintenance.js';
import Users from '../screens/Users/Users.js';
import Contracts from '../screens/Contracts/Contracts.js';

const Tab = createBottomTabNavigator();

// Configuración de tabs según el rol
const TabConfig = {
    Administrador: [
        // Cada objeto representa una pestaña en la barra inferior para el rol Administrador
        { route: 'HomeAdmin', label: 'Inicio', icon: 'home', component: HomeScreen },
        { route: 'Vehicles', label: 'Vehículos', icon: 'car', component: Vehicles },
        { route: 'Reservations', label: 'Reservas', icon: 'calendar', component: Reservation },
        { route: 'Contracts', label: 'Contratos', icon: 'document-text', component: Contracts },
        { route: 'Users', label: 'Usuarios', icon: 'people', component: Users },
        { route: 'Maintenance', label: 'Mantenimientos', icon: 'build', component: Maintenance }
    ],
    Empleado: [
        // Configuración de pestañas para el rol Empleado
        { route: 'Home', label: 'Inicio', icon: 'home', component: HomeScreen },
        { route: 'Vehicles', label: 'Vehículos', icon: 'car', component: Vehicles },
        { route: 'Reservations', label: 'Reservas', icon: 'calendar', component: Reservation },
        { route: 'Users', label: 'Clientes', icon: 'people', component: Users }
    ],
    Gestor: [
        // Configuración de pestañas para el rol Gestor
        { route: 'Home', label: 'Inicio', icon: 'home', component: HomeScreen },
        { route: 'Vehicles', label: 'Vehículos', icon: 'car', component: Vehicles },
        { route: 'Maintenance', label: 'Mantenimientos', icon: 'build', component: Maintenance }
    ]
};

// Animaciones para el botón de la pestaña cuando está enfocado y desenfocado
const animate1 = { 0: { scale: .5, translateY: 7 }, .92: { translateY: -10 }, 1: { scale: 1.05, translateY: -6 } };
const animate2 = { 0: { scale: 1.05, translateY: -6 }, 1: { scale: 1, translateY: 7 } };

// Animaciones para el círculo de fondo del icono
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

// Componente personalizado para cada botón de la barra de pestañas
const TabButton = (props) => {
    const { item, onPress, accessibilityState } = props;
    // Determina si el botón está seleccionado (enfocado)
    const focused = accessibilityState.selected;
    // Referencias para animaciones
    const viewRef = useRef(null);
    const circleRef = useRef(null);
    const textRef = useRef(null);

    // Efecto para animar el botón y el círculo según el estado de enfoque
    useEffect(() => {
        if (focused) {
            viewRef.current?.animate(animate1);
            circleRef.current?.animate(circle1);
        } else {
            viewRef.current?.animate(animate2);
            circleRef.current?.animate(circle2);
        }
    }, [focused]);

    // Renderiza el botón con animaciones y estilos personalizados
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
                        {/* Círculo animado detrás del icono */}
                        <Animatable.View
                            ref={circleRef}
                            style={[stylesAnim.circle, { backgroundColor: '#153A8B' }]}
                            duration={500}
                            useNativeDriver
                        />
                        {/* Icono de la pestaña, cambia entre versión normal y outline según el estado */}
                        <Ionicons name={item.icon + (focused ? '' : '-outline')} size={28} color={focused ? '#fff' : '#153A8B'} />
                    </View>
                    {/* Etiqueta de la pestaña */}
                    <Text
                        style={[stylesAnim.text, { color: focused ? '#153A8B' : '#153A8B', opacity: 1, marginTop: -6, marginBottom: 0 }]}
                    >
                        {item.label}
                    </Text>
                </View>
            </Animatable.View>
        </TouchableOpacity>
    );
};

// Componente principal que gestiona la navegación por pestañas
const TabNavigator = () => {
    // Estado para mostrar el popout de perfil
    const [showProfile, setShowProfile] = useState(false);
    // Estado para mostrar el popout de "Ver más"
    const [showMore, setShowMore] = useState(false);
    // Hook para acceder a la navegación
    const navigation = useNavigation();
    // Hook para obtener el tipo de usuario autenticado
    const { userType } = useAuth();
    console.log('Current user type:', userType);

    // Selecciona la configuración de pestañas según el tipo de usuario
    const currentTabs = TabConfig[userType] || TabConfig.Empleado;
    console.log('Using tabs for role:', userType || 'Empleado');

    // Componente personalizado para la barra de pestañas inferior
    const CustomTabBar = (props) => (
        <View style={stylesAnim.tabBar}>
            {props.state.routes.map((route, index) => {
                // Oculta visualmente los tabs de Usuarios y Mantenimientos para Admin/Administrador,
                // pero las pantallas siguen disponibles desde el submenú "Ver más"
                if ((route.name === 'Users' || route.name === 'Maintenance') && (userType === 'Admin' || userType === 'Administrador')) return null;
                // Busca la configuración del tab actual
                const item = currentTabs.find(t => t.route === route.name);
                return (
                    <TabButton
                        key={route.key}
                        {...props}
                        item={item}
                        // Navega a la pantalla correspondiente al presionar el tab
                        onPress={() => props.navigation.navigate(route.name)}
                        accessibilityState={{ selected: props.state.index === index }}
                    />
                );
            })}
            {/* Botón "Ver más" solo visible para Administrador/Admin */}
            {(userType === 'Administrador' || userType === 'Admin') && (
                <TouchableOpacity
                    style={{ alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}
                    onPress={() => setShowMore(true)}
                    activeOpacity={0.7}
                >
                    <View style={{ backgroundColor: '#fff', borderRadius: 20, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="ellipsis-vertical" size={28} color="#153A8B" />
                    </View>
                    <Text style={{ color: '#153A8B', fontWeight: 'bold', fontSize: 12, marginTop: 2 }}>Ver más</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    // Render principal del componente de navegación por pestañas
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom']}>
            {/* Barra de estado personalizada */}
            <StatusBar
                backgroundColor="#3D83D2"
                barStyle="light-content"
                animated={true}
            />
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                {/* Navegador de pestañas */}
                <Tab.Navigator
                    screenOptions={{
                        // Configuración del header superior
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
                        // Estilos de la barra de pestañas inferior
                        tabBarStyle: {
                            backgroundColor: '#fff',
                            borderTopWidth: 0,
                            elevation: 0,
                            shadowOpacity: 0,
                            height: Platform.OS === 'ios' ? 80 : 70
                        },
                        // Botón de perfil en el header superior
                        headerRight: () => (
                            <TouchableOpacity style={styles.profileButton} onPress={() => setShowProfile(true)}>
                                <View style={styles.profileIconCircle}>
                                    <Ionicons name="person" size={28} color="#3D83D2" />
                                </View>
                            </TouchableOpacity>
                        ),
                    }}
                    // Usa la barra de pestañas personalizada
                    tabBar={CustomTabBar}
                >
                    {/* Renderiza cada pantalla/tab según la configuración del usuario */}
                    {currentTabs.map((item, idx) => (
                        <Tab.Screen
                            key={item.route}
                            name={item.route}
                            component={item.component}
                            options={{
                                title: item.title || item.label,
                                headerTitle: item.label,
                                // No se oculta el tabBarButton aquí, solo en CustomTabBar
                            }}
                        />
                    ))}
                </Tab.Navigator>
            </View>
            {/* Popout de "Ver más" para acceder a pantallas ocultas */}
            <MorePopout
                visible={showMore}
                onClose={() => setShowMore(false)}
                navigation={navigation}
            />
            {/* Popout de perfil para ver y editar información del usuario */}
            <ProfilePopout
                visible={showProfile}
                onClose={() => setShowProfile(false)}
                navigation={navigation}
                onRequestReopen={() => setShowProfile(true)}
                onRequestCloseProfile={() => setShowProfile(false)}
            />
        </SafeAreaView>
    );
};

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

export default TabNavigator;