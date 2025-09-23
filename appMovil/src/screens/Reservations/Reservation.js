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
  
  const {
    reservations,
    loading,
    error,
    refreshReservations,
    deleteReservation
  } = useFetchReservations();

  useEffect(() => {
    if (reservations) {
      filterReservations();
    }
  }, [reservations, searchText]);

  const filterReservations = () => {
    if (!searchText.trim()) {
      setFilteredReservations(reservations || []);
      return;
    }

    const filtered = reservations?.filter(reservation => {
      const vehicleName = reservation.vehicleId?.vehicleName?.toLowerCase() || '';
      const clientName = getClientName(reservation).toLowerCase();
      const status = reservation.status?.toLowerCase() || '';
      const searchLower = searchText.toLowerCase();

      return vehicleName.includes(searchLower) ||
             clientName.includes(searchLower) ||
             status.includes(searchLower);
    }) || [];

    setFilteredReservations(filtered);
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
      case 'Active': return 'Activa';
      case 'Pending': return 'Pendiente';
      case 'Completed': return 'Completado';
      default: return status;
    }
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
          <Text style={styles.addButtonText}>Agregar reserva</Text>
          <View style={styles.addIconContainer}>
            <Ionicons name="add" size={24} color="white" />
          </View>
        </TouchableOpacity>
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
            <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>
              {searchText ? 'Sin resultados' : 'No hay reservas'}
            </Text>
            <Text style={styles.emptyText}>
              {searchText 
                ? 'No se encontraron reservas que coincidan con tu búsqueda' 
                : 'Agrega tu primera reserva para comenzar'
              }
            </Text>
          </View>
        ) : (
          filteredReservations.map((reservation) => (
            <ReservationCard
              key={reservation._id}
              reservation={reservation}
              getStatusText={getStatusText}
              onPress={() => handleCardPress(reservation)}
              navigation={navigation}
            />
          ))
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
    marginBottom: 20,
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
  addIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 4,
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