import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl,
  StatusBar,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useContracts from './hooks/useContracts';
import ContractDetailsModal from './modals/ContractDetailsModal';

const { width } = Dimensions.get('window');

const ContractsScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [selectedContract, setSelectedContract] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const {
    contracts,
    loading,
    refreshing,
    error,
    fetchContracts,
    deleteContract,
    generateContractPdf,
    refreshContracts,
    getContractStats,
    searchContracts
  } = useContracts();

  // Debug: Verificar estructura de datos
  useEffect(() => {
    if (contracts.length > 0) {
      console.log('ContractsScreen: Estructura del primer contrato:', {
        id: contracts[0]._id,
        status: contracts[0].status,
        startDate: contracts[0].startDate,
        hasReservation: !!contracts[0].reservationId,
        clientName: contracts[0].reservationId?.clientId?.name,
        vehicleBrand: contracts[0].reservationId?.vehicleId?.brand,
        leaseData: contracts[0].leaseData
      });
    }
  }, [contracts]);

  // Función auxiliar para acceder a datos anidados de forma segura
  const getNestedValue = (obj, path, defaultValue = 'N/A') => {
    return path.split('.').reduce((current, key) => 
      current && current[key] !== undefined ? current[key] : defaultValue, obj
    );
  };

  // Usar estadísticas del hook para filtros
  const contractStats = getContractStats();
  const statusFilters = [
    { key: 'Todos', label: 'Todos', count: contractStats.total },
    { key: 'Active', label: 'Activos', count: contractStats.active },
    { key: 'Finished', label: 'Completados', count: contractStats.finished },
    { key: 'Canceled', label: 'Cancelados', count: contractStats.canceled }
  ];

  // Usar función de búsqueda del hook y filtrar por estado
  const getFilteredContracts = () => {
    let filtered = searchContracts(searchText);
    
    if (selectedFilter !== 'Todos') {
      filtered = filtered.filter(contract => contract.status === selectedFilter);
    }
    
    return filtered;
  };

  const filteredContracts = getFilteredContracts();

  const handleContractPress = (contract) => {
    console.log('ContractsScreen: Seleccionando contrato:', contract._id);
    setSelectedContract(contract);
    setModalVisible(true);
  };

  // Navegación a la nueva pantalla en lugar de modal
  const handleAddContract = () => {
    console.log('ContractsScreen: Navegando a AddContract');
    navigation.navigate('AddContract');
  };

  const handleDeleteContract = async (contractId) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este contrato?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('ContractsScreen: Eliminando contrato:', contractId);
              await deleteContract(contractId);
              setModalVisible(false);
              Alert.alert('Éxito', 'Contrato eliminado correctamente');
            } catch (error) {
              console.error('ContractsScreen: Error eliminando contrato:', error);
              Alert.alert('Error', error.message || 'No se pudo eliminar el contrato');
            }
          }
        }
      ]
    );
  };

  const handleGeneratePdf = async (contractId) => {
    try {
      console.log('ContractsScreen: Generando PDF para contrato:', contractId);
      const result = await generateContractPdf(contractId);
      Alert.alert('Éxito', 'PDF generado correctamente');
      console.log('PDF URL:', result.pdfUrl);
    } catch (error) {
      console.error('ContractsScreen: Error generando PDF:', error);
      Alert.alert('Error', error.message || 'No se pudo generar el PDF');
    }
  };

  // Función para manejar edición de contratos (nueva funcionalidad)
  const handleEditContract = (contract) => {
    console.log('ContractsScreen: Editando contrato:', contract._id);
    navigation.navigate('AddContract', { 
      editMode: true, 
      contractData: contract 
    });
  };

  // Colores y iconos de estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return '#00C896';
      case 'Finished':
        return '#4285F4';
      case 'Canceled':
        return '#EA4335';
      default:
        return '#9AA0A6';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return 'play-circle';
      case 'Finished':
        return 'checkmark-circle';
      case 'Canceled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Active':
        return 'Activo';
      case 'Finished':
        return 'Completado';
      case 'Canceled':
        return 'Cancelado';
      default:
        return 'Sin estado';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatCurrency = (amount) => {
    return `Q ${parseFloat(amount || 0).toFixed(2)}`;
  };

  // Renderizar item de contrato con mejoras
  const renderContractItem = ({ item, index }) => {
    if (index === 0) {
      console.log('ContractsScreen: Renderizando', filteredContracts.length, 'contratos');
    }

    // Extraer datos con valores por defecto
    const clientName = getNestedValue(item, 'reservationId.clientId.name', 'Cliente') + ' ' + 
                      getNestedValue(item, 'reservationId.clientId.lastName', 'N/A');
    const vehicleBrand = getNestedValue(item, 'reservationId.vehicleId.brand', 'Vehículo');
    const vehicleModel = getNestedValue(item, 'reservationId.vehicleId.model', 'N/A');
    const vehiclePlate = getNestedValue(item, 'reservationId.vehicleId.plate', 'Sin placa');
    const totalAmount = getNestedValue(item, 'leaseData.totalAmount', 0);
    const contractId = item._id.slice(-8); // Últimos 8 caracteres del ID
    
    return (
      <TouchableOpacity 
        style={[styles.contractCard, { marginTop: index === 0 ? 8 : 0 }]}
        onPress={() => handleContractPress(item)}
        activeOpacity={0.8}
      >
        {/* Header con estado e ID */}
        <View style={styles.cardHeader}>
          <View style={styles.leftHeader}>
            <View style={styles.statusContainer}>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]}>
                <Ionicons 
                  name={getStatusIcon(item.status)} 
                  size={12} 
                  color="#FFFFFF" 
                />
              </View>
              <Text style={styles.statusLabel}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
            <Text style={styles.contractId}>#{contractId}</Text>
          </View>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => handleContractPress(item)}
          >
            <Ionicons name="ellipsis-vertical" size={16} color="#9AA0A6" />
          </TouchableOpacity>
        </View>

        {/* Información principal */}
        <View style={styles.cardBody}>
          <Text style={styles.vehicleTitle}>
            {vehicleBrand} {vehicleModel}
          </Text>
          <Text style={styles.clientName}>
            {clientName}
          </Text>
          
          {/* Detalles del vehículo */}
          <View style={styles.vehicleDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="car" size={14} color="#9AA0A6" />
              <Text style={styles.detailText}>
                {vehiclePlate}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={14} color="#9AA0A6" />
              <Text style={styles.detailText}>
                {formatDate(item.startDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer con precio y acciones */}
        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.priceValue}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleGeneratePdf(item._id)}
            >
              <Ionicons name="document-text" size={18} color="#4285F4" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditContract(item)}
            >
              <Ionicons name="create" size={18} color="#FF9800" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteContract(item._id)}
            >
              <Ionicons name="trash" size={18} color="#EA4335" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Renderizar botón de filtro
  const renderFilterButton = (filter) => (
    <TouchableOpacity
      key={filter.key}
      style={[
        styles.filterButton,
        selectedFilter === filter.key && styles.activeFilterButton
      ]}
      onPress={() => setSelectedFilter(filter.key)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter.key && styles.activeFilterButtonText
        ]}
      >
        {filter.label}
      </Text>
      {filter.count > 0 && (
        <View style={[
          styles.filterBadge,
          selectedFilter === filter.key && styles.activeFilterBadge
        ]}>
          <Text style={[
            styles.filterBadgeText,
            selectedFilter === filter.key && styles.activeFilterBadgeText
          ]}>
            {filter.count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Estado de error
  if (error) {
    console.error('ContractsScreen: Error state:', error);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EA4335" />
          <Text style={styles.errorTitle}>Error al cargar</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              console.log('ContractsScreen: Reintentando cargar contratos');
              fetchContracts();
            }}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header mejorado */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Contratos</Text>
          <Text style={styles.headerSubtitle}>
            {contractStats.total} contratos • {contractStats.active} activos
          </Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9AA0A6" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por cliente, vehículo o placa..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#9AA0A6"
        />
        {searchText.length > 0 && (
          <TouchableOpacity 
            style={styles.clearSearchButton}
            onPress={() => setSearchText('')}
          >
            <Ionicons name="close" size={20} color="#9AA0A6" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.filterIconButton}>
          <Ionicons name="options" size={20} color="#9AA0A6" />
        </TouchableOpacity>
      </View>

      {/* Botón de agregar mejorado */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddContract}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Nuevo contrato</Text>
      </TouchableOpacity>

      {/* Filtros horizontales */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={statusFilters}
          renderItem={({ item }) => renderFilterButton(item)}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        />
      </View>

      {/* Lista de contratos */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>
          {selectedFilter} ({filteredContracts.length})
        </Text>
        
        <FlatList
          data={filteredContracts}
          renderItem={renderContractItem}
          keyExtractor={(item) => item._id || `contract-${Math.random()}`}
          contentContainerStyle={[
            styles.listContainer,
            filteredContracts.length === 0 && styles.emptyListContainer
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={refreshContracts}
              colors={['#4285F4']}
              tintColor="#4285F4"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text" size={64} color="#E8EAED" />
              <Text style={styles.emptyTitle}>
                {loading ? 'Cargando...' : 'No hay contratos'}
              </Text>
              <Text style={styles.emptyMessage}>
                {loading 
                  ? 'Obteniendo contratos del servidor...'
                  : searchText || selectedFilter !== 'Todos' 
                    ? 'No se encontraron contratos que coincidan con los filtros'
                    : 'Crea tu primer contrato desde una reservación activa'
                }
              </Text>
              {!loading && !searchText && selectedFilter === 'Todos' && (
                <TouchableOpacity 
                  style={styles.emptyActionButton}
                  onPress={handleAddContract}
                >
                  <Text style={styles.emptyActionText}>Crear contrato</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>

      {/* Modal de detalles */}
      <ContractDetailsModal
        visible={modalVisible}
        contract={selectedContract}
        onClose={() => {
          console.log('ContractsScreen: Cerrando modal');
          setModalVisible(false);
        }}
        onDelete={handleDeleteContract}
        onGeneratePdf={handleGeneratePdf}
        onEdit={handleEditContract}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#4285F4',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileButton: {
    marginLeft: 16,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#202124',
  },
  clearSearchButton: {
    marginLeft: 8,
    marginRight: 8,
  },
  filterIconButton: {
    marginLeft: 12,
  },

  // Add button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Filters
  filtersContainer: {
    marginBottom: 8,
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  activeFilterButton: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#5F6368',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  filterBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#E8EAED',
  },
  activeFilterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterBadgeText: {
    fontSize: 12,
    color: '#5F6368',
    fontWeight: '600',
  },
  activeFilterBadgeText: {
    color: '#FFFFFF',
  },

  // List section
  listSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 12,
  },

  // Contract cards
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contractCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftHeader: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5F6368',
  },
  contractId: {
    fontSize: 10,
    color: '#9AA0A6',
    fontFamily: 'monospace',
  },
  moreButton: {
    padding: 4,
  },
  cardBody: {
    marginBottom: 16,
  },
  vehicleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    color: '#5F6368',
    marginBottom: 12,
  },
  vehicleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#9AA0A6',
    marginLeft: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F4',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#9AA0A6',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00C896',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#FFF8E1',
  },
  deleteButton: {
    backgroundColor: '#FEF7F0',
  },

  // Empty and error states
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5F6368',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#9AA0A6',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyActionButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#EA4335',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#9AA0A6',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ContractsScreen;