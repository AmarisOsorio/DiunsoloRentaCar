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
  const [activeTab, setActiveTab] = useState('Todos'); // 'Todos', 'Pending', 'Active', 'Completed'
  
  const {
    maintenances,
    loading,
    error,
    refreshMaintenances,
    deleteMaintenance,
    updateMaintenance
  } = useFetchMaintenances();

  useEffect(() => {
    if (maintenances) {
      filterMaintenances();
    }
  }, [maintenances, searchText, activeTab]);

  const filterMaintenances = () => {
    if (!maintenances) return;

    let filtered = maintenances;

    // Filtrar por búsqueda
    if (searchText.trim()) {
      filtered = maintenances.filter(maintenance => {
        const vehicleName = maintenance.vehicleId?.vehicleName?.toLowerCase() || '';
        const vehicleBrand = maintenance.vehicleId?.brand?.toLowerCase() || '';
        const maintenanceType = maintenance.maintenanceType?.toLowerCase() || '';
        const searchLower = searchText.toLowerCase();

        return vehicleName.includes(searchLower) ||
               vehicleBrand.includes(searchLower) ||
               maintenanceType.includes(searchLower);
      });
    }

    // Filtrar por estado activo (solo si no es "Todos")
    if (activeTab !== 'Todos') {
      filtered = filtered.filter(maintenance => maintenance.status === activeTab);
    }

    setFilteredMaintenances(filtered);
  };

  const handleStatusChange = async (maintenanceId, newStatus) => {
    try {
      // Encontrar el mantenimiento actual
      const maintenance = maintenances.find(m => m._id === maintenanceId);
      if (!maintenance) return;

      // Crear los datos actualizados manteniendo toda la información original
      const updateData = {
        vehicleId: maintenance.vehicleId._id,
        maintenanceType: maintenance.maintenanceType,
        startDate: maintenance.startDate,
        returnDate: maintenance.returnDate,
        status: newStatus
      };

      await updateMaintenance(maintenanceId, updateData);

    } catch (error) {
      console.error('Error al cambiar estado:', error);
      Alert.alert('Error', 'No se pudo cambiar el estado del mantenimiento');
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Active': return 'Activa';
      case 'Pending': return 'Pendiente';
      case 'Completed': return 'Completado';
      default: return status;
    }
  };

  const getTabTitle = (status) => {
    switch (status) {
      case 'Active': return 'Activos';
      case 'Pending': return 'Pendientes';
      case 'Completed': return 'Finalizados';
      default: return status;
    }
  };

  const getMaintenanceCount = (status) => {
    if (!maintenances) return 0;
    return maintenances.filter(maintenance => maintenance.status === status).length;
  };

  const handleAddMaintenance = () => {
    navigation.navigate('AddMaintenance');
  };

  const handleMaintenancePress = (maintenance) => {
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

  const getTabColors = (status) => {
    switch (status) {
      case 'Pending':
        return {
          backgroundColor: '#F59E0B',
          textColor: 'white',
          inactiveBackground: '#F3F4F6',
          inactiveText: '#6B7280'
        };
      case 'Active':
        return {
          backgroundColor: '#10B981',
          textColor: 'white',
          inactiveBackground: '#F3F4F6',
          inactiveText: '#6B7280'
        };
      case 'Completed':
        return {
          backgroundColor: '#6B7280',
          textColor: 'white',
          inactiveBackground: '#F3F4F6',
          inactiveText: '#6B7280'
        };
      default:
        return {
          backgroundColor: '#6B7280',
          textColor: 'white',
          inactiveBackground: '#F3F4F6',
          inactiveText: '#6B7280'
        };
    }
  };

  const renderTabButton = (status) => {
    const isActive = activeTab === status;
    const count = getMaintenanceCount(status);
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
        return 'No se encontraron mantenimientos que coincidan con tu búsqueda';
      }
      return 'Aún no tienes mantenimientos registrados';
    }
    
    const tabName = getTabTitle(activeTab).toLowerCase();
    if (searchText) {
      return `No se encontraron mantenimientos ${tabName} que coincidan con tu búsqueda`;
    }
    return `No hay mantenimientos ${tabName}`;
  };

  const getEmptyStateTitle = () => {
    if (activeTab === 'Todos') {
      if (searchText) {
        return 'Sin resultados';
      }
      return 'Sin mantenimientos';
    }
    
    if (searchText) {
      return 'Sin resultados';
    }
    return `No hay mantenimientos ${getTabTitle(activeTab).toLowerCase()}`;
  };

  const getEmptyIcon = () => {
    if (activeTab === 'Todos') {
      return 'car-outline';
    }
    return activeTab === 'Pending' ? 'time-outline' : 
           activeTab === 'Active' ? 'construct-outline' : 
           'checkmark-circle-outline';
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
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Add Maintenance Button - Moved above tabs */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMaintenance}
        >
          <Ionicons name="add" size={20} color="white" style={styles.addIcon} />
          <Text style={styles.addButtonText}>Agregar</Text>
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
          {renderTabButton('Pending')}
          {renderTabButton('Active')}
          {renderTabButton('Completed')}
        </ScrollView>
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
                onPress={handleAddMaintenance}
              >
                <Text style={styles.emptyActionButtonText}>Agregar mantenimiento</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {getTabTitle(activeTab)} ({filteredMaintenances.length})
              </Text>
            </View>
            {filteredMaintenances.map((maintenance) => (
              <MaintenanceCard
                key={maintenance._id}
                maintenance={maintenance}
                getStatusText={getStatusText}
                onPress={handleMaintenancePress}
                onStatusChange={handleStatusChange}
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
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
  filterButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: 38,
    height: 38,
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
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
  },
  activeTabButton: {
    backgroundColor: '#3B82F6',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabButtonText: {
    color: 'white',
  },
  tabBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabBadgeText: {
    color: 'white',
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
    backgroundColor: '#3B82F6',
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
    backgroundColor: '#3B82F6',
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

export default MaintenanceScreen;