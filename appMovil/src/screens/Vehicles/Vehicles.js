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
import { useNavigation } from '@react-navigation/native';
import VehicleCard from './Components/VehicleCard';
import useVehicles from './Hooks/useVehicles';

const VehiclesScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [activeTab, setActiveTab] = useState('Todos');
  
  const {
    vehicles,
    brands,
    loading,
    error,
    refreshVehicles,
    deleteVehicle,
    updateVehicle
  } = useVehicles();

  useEffect(() => {
    if (vehicles) {
      filterVehicles();
    }
  }, [vehicles, searchText, activeTab]);

  const filterVehicles = () => {
    if (!vehicles) return;

    let filtered = vehicles;

    // Filtrar por búsqueda
    if (searchText.trim()) {
      filtered = vehicles.filter(vehicle => {
        const vehicleName = vehicle.vehicleName?.toLowerCase() || '';
        const model = vehicle.model?.toLowerCase() || '';
        const plate = vehicle.plate?.toLowerCase() || '';
        const brandName = vehicle.brandId?.brandName?.toLowerCase() || '';
        const status = vehicle.status?.toLowerCase() || '';
        const searchLower = searchText.toLowerCase();

        return vehicleName.includes(searchLower) ||
               model.includes(searchLower) ||
               plate.includes(searchLower) ||
               brandName.includes(searchLower) ||
               status.includes(searchLower);
      });
    }

    // Filtrar por estado activo
    if (activeTab !== 'Todos') {
      filtered = filtered.filter(vehicle => vehicle.status === activeTab);
    }

    setFilteredVehicles(filtered);
  };

  const handleStatusChange = async (vehicleId, newStatus) => {
    try {
      const vehicle = vehicles.find(v => v._id === vehicleId);
      if (!vehicle) return;

      const updateData = {
        vehicleName: vehicle.vehicleName,
        dailyPrice: vehicle.dailyPrice,
        plate: vehicle.plate,
        brandId: vehicle.brandId._id || vehicle.brandId,
        vehicleClass: vehicle.vehicleClass,
        color: vehicle.color,
        year: vehicle.year,
        capacity: vehicle.capacity,
        model: vehicle.model,
        engineNumber: vehicle.engineNumber,
        chassisNumber: vehicle.chassisNumber,
        vinNumber: vehicle.vinNumber,
        status: newStatus,
        mainViewImage: vehicle.mainViewImage,
        sideImage: vehicle.sideImage,
        galleryImages: vehicle.galleryImages
      };

      await updateVehicle(vehicleId, updateData);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      Alert.alert('Error', 'No se pudo cambiar el estado del vehículo');
      throw error;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Disponible': return 'Disponible';
      case 'Reservado': return 'Reservado';
      case 'Mantenimiento': return 'Mantenimiento';
      default: return status;
    }
  };

  const getTabTitle = (status) => {
    return status === 'Todos' ? 'Todos' : status;
  };

  const getVehicleCount = (status) => {
    if (!vehicles) return 0;
    return vehicles.filter(vehicle => vehicle.status === status).length;
  };

  const handleAddVehicle = () => {
    navigation.navigate('NewVehicle');
  };

  const handleCardPress = (vehicle) => {
    navigation.navigate('VehicleDetails', { 
      vehicleId: vehicle._id,
      vehicle: vehicle
    });
  };

  const handleDeleteVehicle = async (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este vehículo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVehicle(id);
              Alert.alert('Éxito', 'Vehículo eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el vehículo');
            }
          }
        }
      ]
    );
  };

  const getTabColors = (status) => {
    switch (status) {
      case 'Disponible':
        return {
          backgroundColor: '#10B981',
          textColor: 'white',
          inactiveBackground: '#D1FAE5',
          inactiveText: '#10B981'
        };
      case 'Reservado':
        return {
          backgroundColor: '#3B82F6',
          textColor: 'white',
          inactiveBackground: '#DBEAFE',
          inactiveText: '#3B82F6'
        };
      case 'Mantenimiento':
        return {
          backgroundColor: '#F59E0B',
          textColor: 'white',
          inactiveBackground: '#FEF3C7',
          inactiveText: '#F59E0B'
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
    const count = status === 'Todos' ? vehicles?.length || 0 : getVehicleCount(status);
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
          {getTabTitle(status)}
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
        return 'No se encontraron vehículos que coincidan con tu búsqueda';
      }
      return 'Aún no tienes vehículos registrados';
    }
    
    const tabName = getTabTitle(activeTab).toLowerCase();
    if (searchText) {
      return `No se encontraron vehículos ${tabName} que coincidan con tu búsqueda`;
    }
    return `No hay vehículos ${tabName}`;
  };

  const getEmptyStateTitle = () => {
    if (activeTab === 'Todos') {
      if (searchText) {
        return 'Sin resultados';
      }
      return 'Sin vehículos';
    }
    
    if (searchText) {
      return 'Sin resultados';
    }
    return `No hay vehículos ${getTabTitle(activeTab).toLowerCase()}`;
  };

  const getEmptyIcon = () => {
    if (activeTab === 'Todos') {
      return 'car-outline';
    }
    return activeTab === 'Disponible' ? 'checkmark-circle-outline' : 
           activeTab === 'Reservado' ? 'time-outline' : 
           'construct-outline';
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Error de conexión</Text>
          <Text style={styles.errorText}>No se pueden cargar los vehículos</Text>
          <TouchableOpacity onPress={refreshVehicles} style={styles.retryButton}>
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
          <Text style={styles.headerSubtitle}>Vehículos</Text>
          <Text style={styles.headerTitle}>Gestiona tu flota.</Text>
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
            placeholder="Buscar vehículos..."
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

      {/* Add Vehicle Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddVehicle}
        >
          <Ionicons name="add" size={20} color="white" style={styles.addIcon} />
          <Text style={styles.addButtonText}>Agregar vehículo</Text>
        </TouchableOpacity>
      </View>

      {/* Status Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
        >
          {renderTabButton('Todos')}
          {renderTabButton('Disponible')}
          {renderTabButton('Reservado')}
          {renderTabButton('Mantenimiento')}
        </ScrollView>
      </View>

      {/* Vehicle List */}
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshVehicles}
            colors={['#4A90E2']}
            tintColor="#4A90E2"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading && vehicles.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Cargando vehículos...</Text>
          </View>
        ) : filteredVehicles.length === 0 ? (
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
            {!searchText && activeTab === 'Todos' && (
              <TouchableOpacity 
                style={styles.emptyActionButton}
                onPress={handleAddVehicle}
              >
                <Text style={styles.emptyActionButtonText}>Agregar vehículo</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeTab === 'Todos' ? `Todos los vehículos` : getTabTitle(activeTab)} ({filteredVehicles.length})
              </Text>
            </View>
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle._id}
                vehicle={vehicle}
                getStatusText={getStatusText}
                onPress={() => handleCardPress(vehicle)}
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

export default VehiclesScreen;