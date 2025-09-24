import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReservationCard from './components/Card';
import { useFetchReservations } from './hooks/useFetchReservations';

const ReservationScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [activeTab, setActiveTab] = useState('Todos'); // 'Todos', 'Pending', 'Active', 'Completed'
  
  const {
    reservations,
    loading,
    error,
    refreshReservations,
    deleteReservation,
    updateReservation
  } = useFetchReservations();

  useEffect(() => {
    if (reservations) {
      filterReservations();
    }
  }, [reservations, searchText, activeTab]);

  const filterReservations = () => {
    if (!reservations) return;

    let filtered = reservations;

    // Filtrar por búsqueda
    if (searchText.trim()) {
      filtered = reservations.filter(reservation => {
        const vehicleName = reservation.vehicleId?.vehicleName?.toLowerCase() || '';
        const vehicleBrand = reservation.vehicleId?.brand?.toLowerCase() || '';
        const clientName = getClientName(reservation).toLowerCase();
        const status = reservation.status?.toLowerCase() || '';
        const searchLower = searchText.toLowerCase();

        return vehicleName.includes(searchLower) ||
               vehicleBrand.includes(searchLower) ||
               clientName.includes(searchLower) ||
               status.includes(searchLower);
      });
    }

    // Filtrar por estado activo (solo si no es "Todos")
    if (activeTab !== 'Todos') {
      filtered = filtered.filter(reservation => reservation.status === activeTab);
    }

    setFilteredReservations(filtered);
  };

  const handleStatusChange = async (reservationId, newStatus) => {
    try {
      // Encontrar la reserva actual
      const reservation = reservations.find(r => r._id === reservationId);
      if (!reservation) return;

      // Crear los datos actualizados manteniendo toda la información original
      const updateData = {
        clientId: reservation.clientId._id,
        vehicleId: reservation.vehicleId._id,
        startDate: reservation.startDate,
        returnDate: reservation.returnDate,
        pricePerDay: reservation.pricePerDay,
        status: newStatus
      };

      await updateReservation(reservationId, updateData);

    } catch (error) {
      console.error('Error al cambiar estado:', error);
      Alert.alert('Error', 'No se pudo cambiar el estado de la reserva');
      throw error; // Re-throw para que el componente Card pueda manejar el error
    }
  };

  const getClientName = (reservation) => {
    // Usar el campo client que es un array con los datos del cliente beneficiario
    if (reservation.client && reservation.client.length > 0) {
      return reservation.client[0].name;
    }
    // Fallback al cliente por populate
    if (reservation.clientId) {
      return `${reservation.clientId.name || ''} ${reservation.clientId.lastName || ''}`.trim() || 'Cliente';
    }
    return 'Cliente sin nombre';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Active': return 'Aprobada';
      case 'Pending': return 'Pendiente';
      case 'Completed': return 'Rechazada';
      default: return status;
    }
  };

  const getTabTitle = (status) => {
    switch (status) {
      case 'Active': return 'Aprobadas';
      case 'Pending': return 'Pendientes';
      case 'Completed': return 'Rechazadas';
      default: return status;
    }
  };

  const getReservationCount = (status) => {
    if (!reservations) return 0;
    return reservations.filter(reservation => reservation.status === status).length;
  };

  const handleAddReservation = () => {
    navigation.navigate('AddReservation');
  };

  const handleCardPress = (reservation) => {
    navigation.navigate('ReservationDetails', { 
      reservationId: reservation._id,
      reservation: reservation // Pasar también el objeto completo como backup
    });
  };

  const handleDeleteReservation = async (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta reserva?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReservation(id);
              Alert.alert('Éxito', 'Reserva eliminada correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la reserva');
            }
          }
        }
      ]
    );
  };

  const getTabColors = (status) => {
    switch (status) {
      case 'Pending':
        return {
          backgroundColor: '#F59E0B',
          textColor: 'white',
          inactiveBackground: '#FEF3C7',
          inactiveText: '#F59E0B'
        };
      case 'Active':
        return {
          backgroundColor: '#10B981',
          textColor: 'white',
          inactiveBackground: '#D1FAE5',
          inactiveText: '#10B981'
        };
      case 'Completed':
        return {
          backgroundColor: '#DC2626',
          textColor: 'white',
          inactiveBackground: '#FEE2E2',
          inactiveText: '#DC2626'
        };
      default:
        return {
          backgroundColor: '#4A90E2',
          textColor: 'white',
          inactiveBackground: '#DBEAFE',
          inactiveText: '#4A90E2'
        };
    }
  };

  const renderTabButton = (status) => {
    const isActive = activeTab === status;
    const count = status === 'Todos' ? reservations?.length || 0 : getReservationCount(status);
    const colors = getTabColors(status);
    
    return (
      <TouchableOpacity
        key={status}
        style={[
          styles.tabButton, 
          {
            backgroundColor: isActive ? colors.backgroundColor : colors.inactiveBackground
          }
        ]}
        onPress={() => setActiveTab(status)}
      >
        <Text style={[
          styles.tabButtonText,
          {
            color: isActive ? colors.textColor : colors.inactiveText
          }
        ]}>
          {status === 'Todos' ? 'Todos' : getTabTitle(status)}
        </Text>
        {count > 0 && (
          <View style={[
            styles.tabBadge,
            {
              backgroundColor: isActive ? 'rgba(255, 255, 255, 0.3)' : '#E5E7EB'
            }
          ]}>
            <Text style={[
              styles.tabBadgeText,
              {
                color: isActive ? 'white' : '#6B7280'
              }
            ]}>
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getEmptyStateMessage = () => {
    if (activeTab === 'Todos') {
      if (searchText) {
        return 'No se encontraron reservas que coincidan con tu búsqueda';
      }
      return 'Aún no tienes reservas registradas';
    }
    
    const tabName = getTabTitle(activeTab).toLowerCase();
    if (searchText) {
      return `No se encontraron reservas ${tabName} que coincidan con tu búsqueda`;
    }
    return `No hay reservas ${tabName}`;
  };

  const getEmptyStateTitle = () => {
    if (activeTab === 'Todos') {
      if (searchText) {
        return 'Sin resultados';
      }
      return 'Sin reservas';
    }
    
    if (searchText) {
      return 'Sin resultados';
    }
    return `No hay reservas ${getTabTitle(activeTab).toLowerCase()}`;
  };

  const getEmptyIcon = () => {
    if (activeTab === 'Todos') {
      return 'calendar-outline';
    }
    return activeTab === 'Pending' ? 'time-outline' : 
           activeTab === 'Active' ? 'checkmark-circle-outline' : 
           'close-circle-outline';
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Error de conexión</Text>
          <Text style={styles.errorText}>No se pueden cargar las reservas</Text>
          <TouchableOpacity onPress={refreshReservations} style={styles.retryButton}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerSubtitle}>Reservas</Text>
          <Text style={styles.headerTitle}>Cada viaje cuenta.</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle-outline" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar reservas..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#9CA3AF"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={20} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      {/* Add Reservation Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddReservation}
        >
          <Ionicons name="add" size={20} color="white" style={styles.addIcon} />
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {/* Status Tabs - Sistema de filtros mejorado */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
        >
          {renderTabButton('Todos')}
          {renderTabButton('Pending')}
          {renderTabButton('Active')}
          {renderTabButton('Completed')}
        </ScrollView>
      </View>

      {/* Reservation List */}
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshReservations}
            colors={['#4A90E2']}
            tintColor="#4A90E2"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading && reservations.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Cargando reservas...</Text>
          </View>
        ) : filteredReservations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={getEmptyIcon()} 
              size={64} 
              color="#D1D5DB" 
            />
            <Text style={styles.emptyTitle}>
              {getEmptyStateTitle()}
            </Text>
            <Text style={styles.emptyText}>
              {getEmptyStateMessage()}
            </Text>
            {!searchText && (activeTab === 'Pending' || activeTab === 'Todos') && (
              <TouchableOpacity 
                style={styles.emptyActionButton}
                onPress={handleAddReservation}
              >
                <Text style={styles.emptyActionButtonText}>Agregar reserva</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeTab === 'Todos' ? `Todas las reservas` : getTabTitle(activeTab)} ({filteredReservations.length})
              </Text>
            </View>
            {filteredReservations.map((reservation) => (
              <ReservationCard
                key={reservation._id}
                reservation={reservation}
                getStatusText={getStatusText}
                onPress={() => handleCardPress(reservation)}
                onStatusChange={handleStatusChange}
                navigation={navigation}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 5,
    fontWeight: '500',
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileButton: {
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
  filterButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  addButtonContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  addIcon: {
    marginRight: 8,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  tabsScrollContainer: {
    paddingHorizontal: 4,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyActionButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyActionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 24,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReservationScreen;