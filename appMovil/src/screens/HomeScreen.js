import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../Context/AuthContext';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://diunsolorentacar.onrender.com/api';
const TIMEOUT_DURATION = 30000; // 30 seconds to account for cold starts



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
    vehiculosEnMantenimiento: 0
  });

  const quickActions = [
    {
      title: 'Agregar Marca',
      subtitle: 'Nueva marca de vehículo',
      action: () => navigation.navigate('Marcas'),
      color: '#4A90E2',
      icon: 'add-circle'
    },
    {
      title: 'Nuevo Mantenimiento',
      subtitle: 'Registrar mantenimiento',
      action: () => navigation.navigate('Maintenance'),
      color: '#E74C3C',
      icon: 'construct'
    }
  ];

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
      const errorMessage = error.message === 'La solicitud tardó demasiado tiempo'
        ? 'El servidor está tardando en responder. Por favor, inténtelo de nuevo.'
        : 'No se pudieron cargar los datos del panel. Verifique su conexión a internet.';
      Alert.alert('Error', errorMessage);
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);
      
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.error) {
        const stats = result.data || {};
        setDashboardData(prev => ({
          ...prev,
          vehiculosCount: stats.vehiculosCount || 0,
          clientesCount: stats.clientesCount || 0,
          empleadosCount: stats.empleadosCount || 0,
          mantenimientosActivos: stats.mantenimientosActivos || 0,
          reservasActivas: stats.reservasActivas || 0,
          reservasPendientes: stats.reservasPendientes || 0,
          reservasCompletadas: stats.reservasCompletadas || 0,
        }));
      } else {
        throw new Error(result.message || 'Error al obtener datos');
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
      if (error.name === 'AbortError') {
        throw new Error('La solicitud tardó demasiado tiempo');
      }
      throw error;
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);
      
      const response = await fetch(`${API_BASE_URL}/dashboard/activities`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.error) {
        const activities = (result.data || []).map(activity => ({
          description: activity.description || activity.title,
          timestamp: activity.time || activity.createdAt,
        }));
        
        setDashboardData(prev => ({
          ...prev,
          recentActivities: activities
        }));
      } else {
        throw new Error(result.message || 'Error al obtener actividades recientes');
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      if (error.name === 'AbortError') {
        throw new Error('La solicitud tardó demasiado tiempo');
      }
      throw error;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.scrollView}
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Bienvenido, {user?.name || 'Usuario'}
          </Text>
          <Text style={styles.roleText}>{userType}</Text>
        </View>

        <View style={styles.quickActionsContainer}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionButton}
              onPress={action.action}
            >
              <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon} size={24} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Estadísticas Generales</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{dashboardData.vehiculosCount}</Text>
              <Text style={styles.statLabel}>Vehículos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{dashboardData.clientesCount}</Text>
              <Text style={styles.statLabel}>Clientes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{dashboardData.reservasActivas}</Text>
              <Text style={styles.statLabel}>Reservas Activas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{dashboardData.mantenimientosActivos}</Text>
              <Text style={styles.statLabel}>Mantenimientos</Text>
            </View>
          </View>
        </View>

        <View style={styles.recentActivityContainer}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          {dashboardData.recentActivities.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{activity.description}</Text>
                <Text style={styles.activityTime}>{activity.timestamp}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  roleText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - 32) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  statsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  recentActivityContainer: {
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityContent: {
    marginLeft: 12,
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default HomeScreen;