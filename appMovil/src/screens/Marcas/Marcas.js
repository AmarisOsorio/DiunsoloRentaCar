import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BrandCard from '../Marcas/components/BrandCard';
import AddBrandModal from '../Marcas/modals/AddBrandModal';
import EditBrandModal from '../Marcas/modals/EditBrandModal';
import DeleteBrandModal from '../Marcas/modals/DeleteBrandModal';
import SuccessModal from '../Marcas/modals/SuccessModal';
import ConfirmDeleteModal from '../Marcas/modals/ComfirmDeleteModal';
import { useFetchBrands } from '../Marcas/hooks/useFetchBrands'; // Cambiado a useFetchBrands

const { width, height } = Dimensions.get('window');

export default function Marcas() {
  const { 
    brands, 
    loading, 
    error, 
    createBrand, 
    updateBrand, 
    deleteBrand, 
    refreshBrands 
  } = useFetchBrands(); // Usando el nuevo hook
  
  const [modalType, setModalType] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const openModal = (type, brand = null) => {
    setModalType(type);
    setSelectedBrand(brand);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedBrand(null);
  };

  const handleAddBrand = async (brandData) => {
    try {
      await createBrand(brandData);
      closeModal();
      setSuccessMessage('¡Marca guardada!');
      setModalType('success');
    } catch (error) {
      console.error('Error al crear marca:', error);
      // Podrías mostrar un modal de error aquí
    }
  };

  const handleEditBrand = async (brandData) => {
    try {
      await updateBrand(selectedBrand.id, brandData);
      closeModal();
      setSuccessMessage('¡Se ha actualizado la marca!');
      setModalType('success');
    } catch (error) {
      console.error('Error al actualizar marca:', error);
      // Podrías mostrar un modal de error aquí
    }
  };

  const handleDeleteBrand = async () => {
    try {
      await deleteBrand(selectedBrand.id);
      closeModal();
      setSuccessMessage('¡Se ha eliminado la marca!');
      setModalType('success');
    } catch (error) {
      console.error('Error al eliminar marca:', error);
      // Podrías mostrar un modal de error aquí
    }
  };

  const handleRefresh = () => {
    refreshBrands();
  };

  const renderCards = () => {
    const cards = [];
    
    for (let i = 0; i < brands.length; i += 2) {
      cards.push(
        <View key={`row-${i}`} style={styles.cardRow}>
          <BrandCard
            brand={brands[i]}
            onEdit={() => openModal('edit', brands[i])}
            onDelete={() => openModal('delete', brands[i])}
          />
          {brands[i + 1] && (
            <BrandCard
              brand={brands[i + 1]}
              onEdit={() => openModal('edit', brands[i + 1])}
              onDelete={() => openModal('delete', brands[i + 1])}
            />
          )}
        </View>
      );
    }

    return cards;
  };

  // Mostrar loading
  if (loading && brands.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#5B9BD5" />
        
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Marcas</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B9BD5" />
          <Text style={styles.loadingText}>Cargando marcas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#5B9BD5" />
        
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Marcas</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#E74C3C" />
          <Text style={styles.errorTitle}>Error al cargar marcas</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B9BD5" />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Marcas</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchText}>Accede a tu catálogo de marcas aquí</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openModal('add')}
        >
          <Ionicons name="add" size={24} color="#5B9BD5" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsContainer}>
          {brands.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={64} color="#CCC" />
              <Text style={styles.emptyTitle}>No hay marcas</Text>
              <Text style={styles.emptyMessage}>Agrega tu primera marca para comenzar</Text>
            </View>
          ) : (
            renderCards()
          )}
        </View>
      </ScrollView>

      {/* Indicador de loading para acciones */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#5B9BD5" />
        </View>
      )}

      {modalType === 'add' && (
        <AddBrandModal
          visible={true}
          onClose={closeModal}
          onConfirm={handleAddBrand}
        />
      )}

      {modalType === 'edit' && (
        <EditBrandModal
          visible={true}
          brand={selectedBrand}
          onClose={closeModal}
          onConfirm={handleEditBrand}
        />
      )}

      {modalType === 'delete' && (
        <ConfirmDeleteModal
          visible={true}
          brand={selectedBrand}
          onClose={closeModal}
          onConfirm={handleDeleteBrand}
        />
      )}

      {modalType === 'success' && (
        <SuccessModal
          visible={true}
          message={successMessage}
          onClose={closeModal}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#5B9BD5',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  menuButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchText: {
    color: '#666',
    fontSize: 14,
    flex: 1,
  },
  addButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  cardsContainer: {
    paddingVertical: 16,
    paddingBottom: 32,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  // Estados de carga y error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E74C3C',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#5B9BD5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});