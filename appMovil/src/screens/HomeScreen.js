import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../Context/AuthContext';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'http://10.0.2.2:4000/api';

const HomeScreen = ({ navigation }) => {
  const { userType, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    marcasCount: 0,
    vehiculosCount: 0,
    clientesCount: 0,
    empleadosCount: 0,
    mantenimientosActivos: 0,
    reservasActivas: 0,
    reservasPendientes: 0,
    reservasCompletadas: 0,
    recentActivities: [],
    vehiculosDisponibles: 0,
    vehiculosReservados: 0,
    vehiculosEnMantenimiento: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCounts(),
        fetchRecentActivities()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del panel');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const fetchCounts = async () => {
    try {
      // Usar el nuevo endpoint de estadísticas del dashboard
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        timeout: 10000,
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(prev => ({
          ...prev,
          ...result.data
        }));
        return; // Salir si el nuevo endpoint funciona
      } else {
        console.warn('Error en respuesta de estadísticas:', result.message);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      
      // Fallback: obtener datos individualmente como antes
      const endpoints = [
        { key: 'brands', url: `${API_BASE_URL}/brands` },
        { key: 'vehicles', url: `${API_BASE_URL}/vehicles` },
        { key: 'clients', url: `${API_BASE_URL}/clients` },
        { key: 'employees', url: `${API_BASE_URL}/employees` },
        { key: 'maintenances', url: `${API_BASE_URL}/maintenances` },
        { key: 'reservations', url: `${API_BASE_URL}/reservations` },
      ];

      const promises = endpoints.map(async endpoint => {
        try {
          const response = await fetch(endpoint.url, {
            timeout: 10000,
          });
          
          if (!response.ok) {
            throw new Error(`Error ${response.status}`);
          }
          
          const data = await response.json();
          return { key: endpoint.key, data: Array.isArray(data) ? data : data.data || [] };
        } catch (error) {
          console.warn(`Error fetching ${endpoint.key}:`, error);
          return { key: endpoint.key, data: [] };
        }
      });

      const results = await Promise.all(promises);
      
      let newData = { ...dashboardData };
      
      results.forEach(result => {
        const { key, data } = result;
        
        switch (key) {
          case 'brands':
            newData.marcasCount = data.length;
            break;
          case 'vehicles':
            newData.vehiculosCount = data.length;
            newData.vehiculosDisponibles = data.filter(v => v.status === 'Disponible').length;
            newData.vehiculosReservados = data.filter(v => v.status === 'Reservado').length;
            newData.vehiculosEnMantenimiento = data.filter(v => v.status === 'Mantenimiento').length;
            break;
          case 'clients':
            newData.clientesCount = data.length;
            break;
          case 'employees':
            newData.empleadosCount = Array.isArray(data) ? data.length : data.count || 0;
            break;
          case 'maintenances':
            const maintenances = Array.isArray(data) ? data : data.data || [];
            newData.mantenimientosActivos = maintenances.filter(m => m.status === 'Active').length;
            break;
          case 'reservations':
            const reservations = Array.isArray(data) ? data : data.data || [];
            newData.reservasActivas = reservations.filter(r => r.status === 'Active').length;
            newData.reservasPendientes = reservations.filter(r => r.status === 'Pending').length;
            newData.reservasCompletadas = reservations.filter(r => r.status === 'Completed').length;
            break;
        }
      });
      
      setDashboardData(newData);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      console.log('📱 Obteniendo actividades recientes del frontend...');
      
      const response = await fetch(`${API_BASE_URL}/dashboard/activities`, {
        timeout: 10000,
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📱 Respuesta del servidor:', result);
      
      if (result.success) {
        console.log('📱 Actividades recibidas:', result.data.length);
        setDashboardData(prev => ({
          ...prev,
          recentActivities: result.data
        }));
      } else {
        console.warn('⚠️ Error en respuesta de actividades:', result.message);
        // Mantener actividades vacías si hay error
        setDashboardData(prev => ({
          ...prev,
          recentActivities: []
        }));
      }
    } catch (error) {
      console.error('❌ Error fetching recent activities:', error);
      
      // En caso de error, mostrar mensaje informativo
      setDashboardData(prev => ({
        ...prev,
        recentActivities: [{
          id: 'error',
          type: 'info',
          title: 'No hay actividades recientes',
          description: 'No se pudieron cargar las actividades del sistema',
          time: 'Ahora',
          icon: 'information-circle',
          color: '#9E9E9E'
        }]
      }));
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getUserName = () => {
    if (!user) return 'Usuario';
    
    if (userType === 'Administrador') {
      return 'Administrador';
    } else if (userType === 'Empleado' || userType === 'Gestor') {
      return user.name || 'Empleado';
    } else if (userType === 'Cliente') {
      return user.name || 'Cliente';
    }
    
    return 'Usuario';
  };

  const getQuickActions = () => {
    const baseActions = [];
    
    // Acciones según el tipo de usuario
    if (userType === 'Administrador' || userType === 'Gestor') {
      baseActions.push(
        {
          title: 'Gestionar Vehículos',
          subtitle: 'Ver y administrar flota',
          action: () => navigation.navigate('Vehicles'),
          color: '#4A90E2',
          icon: 'car-sport'
        },
        {
          title: 'Nuevo Mantenimiento',
          subtitle: 'Programar servicio',
          action: () => navigation.navigate('AddMaintenance'),
          color: '#FF9800',
          icon: 'construct'
        },
        {
          title: 'Gestionar Usuarios',
          subtitle: 'Empleados y clientes',
          action: () => navigation.navigate('Users'),
          color: '#9C27B0',
          icon: 'people'
        }
      );
    } else if (userType === 'Empleado') {
      baseActions.push(
        {
          title: 'Ver Clientes',
          subtitle: 'Gestionar clientes',
          action: () => navigation.navigate('Users'),
          color: '#4A90E2',
          icon: 'people'
        },
        {
          title: 'Nueva Reserva',
          subtitle: 'Crear reservación',
          action: () => navigation.navigate('AddReservation'),
          color: '#4CAF50',
          icon: 'calendar-sharp'
        }
      );
    }

    return baseActions;
  };

  const getStatsCards = () => {
    const baseStats = [];

    if (userType === 'Administrador' || userType === 'Gestor') {
      baseStats.push(
        {
          title: 'Total Vehículos',
          value: dashboardData.vehiculosCount.toString(),
          icon: 'car-sport',
          color: '#4A90E2',
          subtitle: `${dashboardData.vehiculosDisponibles} disponibles`
        },
        {
          title: 'Marcas Registradas',
          value: dashboardData.marcasCount.toString(),
          icon: 'pricetag',
          color: '#FF9800',
          subtitle: 'Diferentes marcas'
        },
        {
          title: 'Reservas Activas',
          value: dashboardData.reservasActivas.toString(),
          icon: 'calendar',
          color: '#4CAF50',
          subtitle: `${dashboardData.reservasPendientes} pendientes`
        },
        {
          title: 'Mantenimientos',
          value: dashboardData.mantenimientosActivos.toString(),
          icon: 'construct',
          color: '#F44336',
          subtitle: 'En progreso'
        }
      );
    } else if (userType === 'Empleado') {
      baseStats.push(
        {
          title: 'Clientes Totales',
          value: dashboardData.clientesCount.toString(),
          icon: 'people',
          color: '#4A90E2',
          subtitle: 'Registrados'
        },
        {
          title: 'Reservas del Día',
          value: dashboardData.reservasActivas.toString(),
          icon: 'calendar',
          color: '#4CAF50',
          subtitle: 'Activas hoy'
        }
      );
    }

    return baseStats;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerGreeting}>{getGreeting()}</Text>
        <Text style={styles.headerTitle}>{getUserName()}</Text>
        <Text style={styles.headerSubtitle}>Panel de Control - Diunsolo RentaCar</Text>
      </View>
      <TouchableOpacity style={styles.notificationButton}>
        <Ionicons name="notifications" size={24} color="#FFFFFF" />
        <View style={styles.notificationBadge}>
          <Text style={styles.badgeText}>3</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderStatsCard = (card, index) => (
    <View key={index} style={[styles.statsCard, { borderLeftColor: card.color }]}>
      <View style={styles.statsContent}>
        <View style={[styles.statsIcon, { backgroundColor: `${card.color}20` }]}>
          <Ionicons name={card.icon} size={24} color={card.color} />
        </View>
        <View style={styles.statsText}>
          <Text style={styles.statsValue}>{card.value}</Text>
          <Text style={styles.statsTitle}>{card.title}</Text>
          {card.subtitle && (
            <Text style={styles.statsSubtitle}>{card.subtitle}</Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderQuickAction = (action, index) => (
    <TouchableOpacity
      key={index}
      style={[styles.quickActionButton, { backgroundColor: action.color }]}
      onPress={action.action}
      activeOpacity={0.8}
    >
      <Ionicons name={action.icon} size={28} color="#FFFFFF" />
      <Text style={styles.quickActionTitle}>{action.title}</Text>
      <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
    </TouchableOpacity>
  );

  const renderVehicleStatus = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Estado de Vehículos</Text>
      <View style={styles.vehicleStatusContainer}>
        <View style={styles.statusItem}>
          <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
          <View style={styles.statusInfo}>
            <Text style={styles.statusNumber}>{dashboardData.vehiculosDisponibles}</Text>
            <Text style={styles.statusLabel}>Disponibles</Text>
          </View>
        </View>
        <View style={styles.statusItem}>
          <View style={[styles.statusDot, { backgroundColor: '#2196F3' }]} />
          <View style={styles.statusInfo}>
            <Text style={styles.statusNumber}>{dashboardData.vehiculosReservados}</Text>
            <Text style={styles.statusLabel}>Reservados</Text>
          </View>
        </View>
        <View style={styles.statusItem}>
          <View style={[styles.statusDot, { backgroundColor: '#FF9800' }]} />
          <View style={styles.statusInfo}>
            <Text style={styles.statusNumber}>{dashboardData.vehiculosEnMantenimiento}</Text>
            <Text style={styles.statusLabel}>Mantenimiento</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderActivityItem = (activity, index) => (
    <View key={activity.id} style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: `${activity.color}20` }]}>
        <Ionicons name={activity.icon} size={16} color={activity.color} />
      </View>
      <View style={styles.activityText}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        <Text style={styles.activityDescription}>{activity.description}</Text>
        <Text style={styles.activityTime}>{activity.time}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Cargando panel de control...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const quickActions = getQuickActions();
  const statsCards = getStatsCards();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      {renderHeader()}

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4A90E2']}
            tintColor="#4A90E2"
          />
        }
      >
        {/* Estadísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen General</Text>
          <View style={styles.statsGrid}>
            {statsCards.map((card, index) => renderStatsCard(card, index))}
          </View>
        </View>

        {/* Estado de Vehículos (solo para Admin y Gestor) */}
        {(userType === 'Administrador' || userType === 'Gestor') && renderVehicleStatus()}

        {/* Acciones Rápidas */}
        {quickActions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
            <View style={styles.quickActionsContainer}>
              {quickActions.map((action, index) => renderQuickAction(action, index))}
            </View>
          </View>
        )}

        {/* Actividad Reciente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          <View style={styles.activityContainer}>
            {dashboardData.recentActivities.length > 0 ? (
              dashboardData.recentActivities.map((activity, index) => 
                renderActivityItem(activity, index)
              )
            ) : (
              <View style={styles.emptyActivityContainer}>
                <Ionicons name="information-circle-outline" size={48} color="#9E9E9E" />
                <Text style={styles.emptyActivityText}>No hay actividades recientes</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    justifyContent: 'space-between',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerGreeting: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.8,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    marginTop: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 18,
    letterSpacing: 0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    width: (width - 50) / 2,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statsText: {
    flex: 1,
  },
  statsValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  statsTitle: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  statsSubtitle: {
    fontSize: 11,
    color: '#95A5A6',
    marginTop: 2,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    minWidth: (width - 60) / 2,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  quickActionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  quickActionSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 16,
  },
  vehicleStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusInfo: {
    alignItems: 'center',
  },
  statusNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  activityContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#95A5A6',
  },
  emptyActivityContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyActivityText: {
    marginTop: 12,
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});

export default HomeScreen;