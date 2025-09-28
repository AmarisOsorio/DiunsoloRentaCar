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
import AddContractModal from './modals/addContractModal';

const { width } = Dimensions.get('window');

const ContractsScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [selectedContract, setSelectedContract] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false); // NUEVO ESTADO

  const {
    contracts,
    loading,
    refreshing,
    error,
    fetchContracts,
    deleteContract,
    generateContractPdf,
    createContract // NUEVO MÉTODO (necesitarás agregarlo al hook)
  } = useContracts();

  // ARREGLO: Agregar useEffect para cargar contratos inicialmente
  useEffect(() => {
    console.log('ContractsScreen: Cargando contratos inicialmente');
    fetchContracts();
  }, []);

  // ARREGLO: Agregar logs para debug
  useEffect(() => {
    console.log('ContractsScreen: Estado actual:', {
      contractsCount: contracts.length,
      loading,
      error,
      filteredCount: filteredContracts.length
    });
  }, [contracts, loading, error]);

  // MEJORA: Filtros más específicos siguiendo el diseño de la imagen
  const statusFilters = [
    { key: 'Todos', label: 'Todos', count: contracts.length },
    { key: 'Pendientes', label: 'Pendientes', count: contracts.filter(c => c.status === 'Active').length },
    { key: 'Activos', label: 'Activos', count: contracts.filter(c => c.status === 'Active').length },
    { key: 'Completados', label: 'Completados', count: contracts.filter(c => c.status === 'Finished').length }
  ];

  // ARREGLO: Mejorar la lógica de filtrado con manejo de casos null/undefined
  const filteredContracts = contracts.filter(contract => {
    // ARREGLO: Verificar que el contrato existe y tiene las propiedades necesarias
    if (!contract) return false;

    const matchesSearch = searchText === '' || 
      (contract.leaseData?.tenantName?.toLowerCase().includes(searchText.toLowerCase())) ||
      (contract.statusSheetData?.plate?.toLowerCase().includes(searchText.toLowerCase())) ||
      (contract.statusSheetData?.brandModel?.toLowerCase().includes(searchText.toLowerCase()));
    
    let matchesFilter = true;
    if (selectedFilter === 'Pendientes' || selectedFilter === 'Activos') {
      matchesFilter = contract.status === 'Active';
    } else if (selectedFilter === 'Completados') {
      matchesFilter = contract.status === 'Finished';
    }
    // 'Todos' siempre devuelve true
    
    return matchesSearch && matchesFilter;
  });

  const handleContractPress = (contract) => {
    console.log('ContractsScreen: Seleccionando contrato:', contract._id);
    setSelectedContract(contract);
    setModalVisible(true);
  };

  // NUEVO: Manejar la apertura del modal de agregar
  const handleAddContract = () => {
    console.log('ContractsScreen: Abriendo modal de agregar contrato');
    setAddModalVisible(true);
  };

  // NUEVO: Manejar el guardado de un nuevo contrato
  const handleSaveContract = async (contractData) => {
    try {
      console.log('ContractsScreen: Guardando nuevo contrato:', contractData);
      await createContract(contractData);
      setAddModalVisible(false);
      Alert.alert('Éxito', 'Contrato creado correctamente');
      fetchContracts(); // Recargar la lista
    } catch (error) {
      console.error('ContractsScreen: Error creando contrato:', error);
      Alert.alert('Error', 'No se pudo crear el contrato');
    }
  };

  // ARREGLO: Agregar mejor manejo de errores y loading states
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
              Alert.alert('Éxito', 'Contrato eliminado correctamente');
            } catch (error) {
              console.error('ContractsScreen: Error eliminando contrato:', error);
              Alert.alert('Error', 'No se pudo eliminar el contrato');
            }
          }
        }
      ]
    );
  };

  const handleGeneratePdf = async (contractId) => {
    try {
      console.log('ContractsScreen: Generando PDF para contrato:', contractId);
      await generateContractPdf(contractId);
      Alert.alert('Éxito', 'PDF generado correctamente');
    } catch (error) {
      console.error('ContractsScreen: Error generando PDF:', error);
      Alert.alert('Error', 'No se pudo generar el PDF');
    }
  };

  // MEJORA: Función mejorada para colores de estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return '#00C896'; // Verde moderno
      case 'Finished':
        return '#4285F4'; // Azul moderno
      case 'Canceled':
        return '#EA4335'; // Rojo moderno
      default:
        return '#9AA0A6'; // Gris moderno
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // MEJORA: Card de contrato completamente rediseñada siguiendo el estilo moderno
  const renderContractItem = ({ item, index }) => {
  // CAMBIO: Solo log el primer contrato para evitar spam
  if (index === 0) {
    console.log('ContractsScreen: Renderizando', filteredContracts.length, 'contratos');
  };
    
    return (
      <TouchableOpacity 
        style={[styles.contractCard, { marginTop: index === 0 ? 8 : 0 }]}
        onPress={() => handleContractPress(item)}
        activeOpacity={0.8}
      >
        {/* Header con estado e ícono */}
        <View style={styles.cardHeader}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]}>
              <Ionicons 
                name={getStatusIcon(item.status)} 
                size={12} 
                color="#FFFFFF" 
              />
            </View>
            <Text style={styles.statusLabel}>
              {item.status === 'Active' ? 'Activo' : 
               item.status === 'Finished' ? 'Completado' : 'Cancelado'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {/* Menú de opciones */}}
          >
            <Ionicons name="ellipsis-vertical" size={16} color="#9AA0A6" />
          </TouchableOpacity>
        </View>

        {/* Información principal */}
        <View style={styles.cardBody}>
          <Text style={styles.vehicleTitle}>
            {item.statusSheetData?.brandModel || 'Vehículo N/A'}
          </Text>
          <Text style={styles.clientName}>
            {item.leaseData?.tenantName || 'Cliente N/A'}
          </Text>
          
          {/* Detalles del vehículo */}
          <View style={styles.vehicleDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="car" size={14} color="#9AA0A6" />
              <Text style={styles.detailText}>
                {item.statusSheetData?.plate || 'Sin placa'}
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
              ${item.leaseData?.totalAmount || 0}
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

  // MEJORA: Botones de filtro con contador siguiendo el diseño
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

  // ARREGLO: Mejorar el estado de error con botón de retry
  if (error) {
    console.error('ContractsScreen: Error state:', error);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EA4335" />
          <Text style={styles.errorTitle}>Error al cargar</Text>
          <Text style={styles.errorMessage}>No se pudieron cargar los contratos</Text>
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
      
      {/* MEJORA: Header moderno siguiendo el diseño */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Contratos</Text>
          <Text style={styles.headerSubtitle}>Revisión al día.</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* MEJORA: Search bar moderno */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9AA0A6" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar contratos..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#9AA0A6"
        />
        <TouchableOpacity style={styles.filterIconButton}>
          <Ionicons name="options" size={20} color="#9AA0A6" />
        </TouchableOpacity>
      </View>

      {/* MEJORA: Botón de agregar moderno - ACTUALIZADO */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddContract}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Agregar</Text>
      </TouchableOpacity>

      {/* MEJORA: Filtros horizontales con scroll */}
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

      {/* MEJORA: Lista de contratos con mejor feedback visual */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>
          {selectedFilter} ({filteredContracts.length})
        </Text>
        
        <FlatList
          data={filteredContracts}
          renderItem={renderContractItem}
          keyExtractor={(item) => item._id || `contract-${Math.random()}`} // ARREGLO: Fallback para key
          contentContainerStyle={[
            styles.listContainer,
            filteredContracts.length === 0 && styles.emptyListContainer
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => {
                console.log('ContractsScreen: Pull to refresh');
                fetchContracts();
              }}
              colors={['#4285F4']}
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
                    : 'Agrega tu primer contrato para comenzar'
                }
              </Text>
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
      />

      {/* NUEVO: Modal de agregar contrato */}
      <AddContractModal
        visible={addModalVisible}
        onClose={() => {
          console.log('ContractsScreen: Cerrando modal de agregar');
          setAddModalVisible(false);
        }}
        onSave={handleSaveContract}
        reservations={[]} // Aquí pasarías las reservaciones disponibles
      />
    </SafeAreaView>
  );
};

// Los estilos siguen igual que antes...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // MEJORA: Header style siguiendo la imagen
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#4285F4', // Azul principal como en la imagen
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

  // MEJORA: Search bar moderno
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
  filterIconButton: {
    marginLeft: 12,
  },

  // MEJORA: Botón de agregar prominente
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

  // MEJORA: Filtros horizontales
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

  // MEJORA: Sección de lista
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

  // MEJORA: Cards de contratos completamente rediseñadas
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  deleteButton: {
    backgroundColor: '#FEF7F0',
  },

  // MEJORA: Estados vacío y error
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