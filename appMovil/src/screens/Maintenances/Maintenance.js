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
import MaintenanceCard from './components/Card';
import { useFetchMaintenances } from './hooks/useFetchMaintenances';

const MaintenanceScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredMaintenances, setFilteredMaintenances] = useState([]);
  
  const {
    maintenances,
    loading,
    error,
    refreshMaintenances,
    deleteMaintenance
  } = useFetchMaintenances();

  useEffect(() => {
    if (maintenances) {
      filterMaintenances();
    }
  }, [maintenances, searchText]);

  const filterMaintenances = () => {
    if (!searchText.trim()) {
      setFilteredMaintenances(maintenances || []);
      return;
    }

    const filtered = maintenances?.filter(maintenance => {
      const vehicleName = maintenance.vehicleId?.vehicleName?.toLowerCase() || '';
      const vehicleBrand = maintenance.vehicleId?.brand?.toLowerCase() || '';
      const maintenanceType = maintenance.maintenanceType?.toLowerCase() || '';
      const searchLower = searchText.toLowerCase();

      return vehicleName.includes(searchLower) ||
             vehicleBrand.includes(searchLower) ||
             maintenanceType.includes(searchLower);
    }) || [];

    setFilteredMaintenances(filtered);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Active': return 'Activa';
      case 'Pending': return 'Pendiente';
      case 'Completed': return 'Completado';
      default: return status;
    }
  };

  const handleAddMaintenance = () => {
    navigation.navigate('AddMaintenance');
  };

  const handleMaintenancePress = (maintenance) => {
    // Navegar a la pantalla de detalles
    navigation.navigate('MaintenanceDetails', { 
      maintenanceId: maintenance._id 
    });
  };

  const handleDeleteMaintenance = async (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este mantenimiento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMaintenance(id);
              Alert.alert('Éxito', 'Mantenimiento eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el mantenimiento');
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
          <Text style={styles.errorText}>No se pueden cargar los mantenimientos</Text>
          <TouchableOpacity onPress={refreshMaintenances} style={styles.retryButton}>
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
          <Text style={styles.headerSubtitle}>Mantenimiento</Text>
          <Text style={styles.headerTitle}>Revisión al día.</Text>
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
            placeholder="Buscar mantenimientos..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Add Maintenance Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMaintenance}
        >
          <Text style={styles.addButtonText}>Agregar mantenimiento</Text>
          <View style={styles.addIconContainer}>
            <Ionicons name="add" size={24} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Maintenance List */}
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshMaintenances}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading && maintenances.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Cargando mantenimientos...</Text>
          </View>
        ) : filteredMaintenances.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>
              {searchText ? 'Sin resultados' : 'No hay mantenimientos'}
            </Text>
            <Text style={styles.emptyText}>
              {searchText 
                ? 'No se encontraron mantenimientos que coincidan con tu búsqueda' 
                : 'Agrega tu primer mantenimiento para comenzar'
              }
            </Text>
          </View>
        ) : (
          filteredMaintenances.map((maintenance) => (
            <MaintenanceCard
              key={maintenance._id}
              maintenance={maintenance}
              getStatusText={getStatusText}
              onPress={handleMaintenancePress}
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
    backgroundColor: '#3B82F6',
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
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#3B82F6',
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
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
});

export default MaintenanceScreen;