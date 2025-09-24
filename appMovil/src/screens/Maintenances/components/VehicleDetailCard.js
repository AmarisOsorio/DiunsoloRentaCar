import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Para emulador Android usa 10.0.2.2 en lugar de localhost
const API_BASE_URL = 'http://10.0.2.2:4000/api';

const VehicleDetailCard = ({ vehicle, isEditing, onVehicleChange }) => {
  const [vehicles, setVehicles] = useState([]);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchVehicles();
    }
  }, [isEditing]);

  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Error al cargar vehículos`);
      }

      const vehiclesData = await response.json();
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
      Alert.alert('Error', 'No se pudieron cargar los vehículos');
    } finally {
      setLoadingVehicles(false);
    }
  };

  const getVehicleImage = () => {
    if (!vehicle) {
      return 'https://via.placeholder.com/120x80/E5E7EB/9CA3AF?text=Sin+Vehiculo';
    }
    
    if (vehicle.sideImage) {
      return vehicle.sideImage;
    }
    if (vehicle.mainViewImage) {
      return vehicle.mainViewImage;
    }
    if (vehicle.galleryImages && vehicle.galleryImages.length > 0) {
      return vehicle.galleryImages[0];
    }
    return 'https://via.placeholder.com/120x80/E5E7EB/9CA3AF?text=Auto';
  };

  const getVehicleName = () => {
    if (!vehicle) {
      return 'Vehículo no asignado';
    }
    return vehicle.vehicleName || 'Vehículo sin nombre';
  };

  const handleVehicleSelect = (selectedVehicle) => {
    onVehicleChange(selectedVehicle);
    setShowVehicleModal(false);
  };

  const renderVehicleItem = ({ item }) => (
    <TouchableOpacity
      style={styles.vehicleModalItem}
      onPress={() => handleVehicleSelect(item)}
    >
      <Image 
        source={{ uri: item.sideImage || item.mainViewImage || 'https://via.placeholder.com/60x40/E5E7EB/9CA3AF?text=Auto' }}
        style={styles.vehicleModalImage}
        resizeMode="cover"
      />
      <View style={styles.vehicleModalInfo}>
        <Text style={styles.vehicleModalName}>{item.vehicleName}</Text>
        <Text style={styles.vehicleModalYear}>{item.year}</Text>
      </View>
      {vehicle && item._id === vehicle._id && (
        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Vehículo a chequear</Text>
      
      <TouchableOpacity 
        style={[styles.vehicleCard, isEditing && styles.editableCard]}
        onPress={() => isEditing && setShowVehicleModal(true)}
        disabled={!isEditing}
      >
        <View style={styles.vehicleImageContainer}>
          <Image 
            source={{ uri: getVehicleImage() }}
            style={styles.vehicleImage}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName}>{getVehicleName()}</Text>
          <Text style={styles.vehicleYear}>{vehicle?.year || '2024'}</Text>
          
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>En Mantenimiento</Text>
          </View>
        </View>

        {isEditing && (
          <View style={styles.editIndicator}>
            <Ionicons name="chevron-forward" size={20} color="#4A90E2" />
          </View>
        )}
      </TouchableOpacity>

      {/* Modal de selección de vehículo */}
      <Modal
        visible={showVehicleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVehicleModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowVehicleModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Seleccionar Vehículo</Text>
            <View style={styles.modalCloseButton} />
          </View>

          {loadingVehicles ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color="#4A90E2" />
              <Text style={styles.modalLoadingText}>Cargando vehículos...</Text>
            </View>
          ) : (
            <FlatList
              data={vehicles}
              renderItem={renderVehicleItem}
              keyExtractor={(item) => item._id}
              style={styles.vehicleList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  vehicleCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  editableCard: {
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  vehicleImageContainer: {
    marginRight: 16,
  },
  vehicleImage: {
    width: 120,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  vehicleYear: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  editIndicator: {
    marginLeft: 8,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  vehicleList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  vehicleModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  vehicleModalImage: {
    width: 60,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  vehicleModalInfo: {
    flex: 1,
  },
  vehicleModalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 2,
  },
  vehicleModalYear: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default VehicleDetailCard;

