import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DeleteVehicleModal from './modals/DeleteVehicleModal';
import useVehicles from './Hooks/useVehicles';

const API_BASE_URL = 'http://10.0.2.2:4000/api';

const VehicleDetailsScreen = ({ route, navigation }) => {
  const { vehicleId, vehicle: initialVehicle } = route.params;
  
  const [vehicle, setVehicle] = useState(initialVehicle || null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { deleteVehicle } = useVehicles();

  useEffect(() => {
    if (vehicleId) {
      fetchVehicleDetails();
    }
  }, [vehicleId]);

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Error al cargar vehículo`);
      }

      const vehicleData = await response.json();
      setVehicle(vehicleData);
    } catch (error) {
      console.error('Error al cargar vehículo:', error);
      Alert.alert('Error', 'No se pudo cargar el vehículo');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
  navigation.navigate('EditVehicle', { vehicleId: vehicleId });
};

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteVehicle(vehicleId);
      setShowDeleteModal(false);
      Alert.alert('Éxito', 'Vehículo eliminado correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el vehículo');
      setShowDeleteModal(false);
    }
  };

  const getVehicleName = () => {
    return vehicle?.vehicleName || 'Vehículo';
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Disponible':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          textColor: '#10B981',
          dotColor: '#10B981'
        };
      case 'Reservado':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          textColor: '#3B82F6',
          dotColor: '#3B82F6'
        };
      case 'Mantenimiento':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          textColor: '#F59E0B',
          dotColor: '#F59E0B'
        };
      default:
        return {
          backgroundColor: 'rgba(107, 114, 128, 0.15)',
          textColor: '#6B7280',
          dotColor: '#6B7280'
        };
    }
  };

  const getVehicleImage = () => {
    if (vehicle?.sideImage) return vehicle.sideImage;
    if (vehicle?.mainViewImage) return vehicle.mainViewImage;
    if (vehicle?.galleryImages && vehicle.galleryImages.length > 0) {
      return vehicle.galleryImages[0];
    }
    return 'https://via.placeholder.com/300x200/E5E7EB/9CA3AF?text=Auto';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles vehículo</Text>
          <View style={styles.editButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.editButton} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>No se encontró el vehículo</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusBadgeStyle(vehicle.status);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles vehículo</Text>
        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
          <Ionicons name="create-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Imagen del vehículo */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getVehicleImage() }}
            style={styles.vehicleImage}
            resizeMode="cover"
          />
          <View style={[styles.statusBadgeImage, { backgroundColor: statusStyle.backgroundColor }]}>
            <View style={[styles.statusDot, { backgroundColor: statusStyle.dotColor }]} />
            <Text style={[styles.statusText, { color: statusStyle.textColor }]}>
              {vehicle.status}
            </Text>
          </View>
        </View>

        {/* Información básica */}
        <View style={styles.basicInfoContainer}>
          <Text style={styles.vehicleNameLarge}>{vehicle.vehicleName}</Text>
          <Text style={styles.vehicleSubtitle}>
            {vehicle.brandName || vehicle.brandId?.brandName || 'Marca'} • {vehicle.model} • {vehicle.year}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Precio por día</Text>
            <Text style={styles.priceValue}>${vehicle.dailyPrice}</Text>
          </View>

          <View style={styles.quickInfoRow}>
            <View style={styles.quickInfoItem}>
              <Ionicons name="people" size={20} color="#4A90E2" />
              <Text style={styles.quickInfoText}>{vehicle.capacity} personas</Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Ionicons name="car" size={20} color="#4A90E2" />
              <Text style={styles.quickInfoText}>{vehicle.vehicleClass}</Text>
            </View>
          </View>
        </View>

        {/* Detalles del vehículo */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Detalles del vehículo</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Placa:</Text>
            <Text style={styles.detailValue}>{vehicle.plate}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Color:</Text>
            <Text style={styles.detailValue}>{vehicle.color}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Número de motor:</Text>
            <Text style={styles.detailValue}>{vehicle.engineNumber}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Número de chasis:</Text>
            <Text style={styles.detailValue}>{vehicle.chassisNumber}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>VIN:</Text>
            <Text style={styles.detailValue}>{vehicle.vinNumber}</Text>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="white" />
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.editActionButton}
            onPress={handleEdit}
          >
            <Ionicons name="create-outline" size={20} color="white" />
            <Text style={styles.editActionButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <DeleteVehicleModal
        visible={showDeleteModal}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        vehicleName={getVehicleName()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  editButton: {
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
    backgroundColor: '#E5E7EB',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  statusBadgeImage: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  basicInfoContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  vehicleNameLarge: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  vehicleSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  priceContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  priceLabel: {
    fontSize: 14,
    color: '#0369A1',
    fontWeight: '500',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0369A1',
  },
  quickInfoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  quickInfoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  quickInfoText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  detailsContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 8,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  editActionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  editActionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VehicleDetailsScreen;
