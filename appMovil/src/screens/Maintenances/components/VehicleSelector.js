import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const VehicleSelector = ({ vehicles, selectedVehicle, onSelectVehicle }) => {
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Disponible':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#10B981'
        };
      case 'Reservado':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          color: '#3B82F6'
        };
      case 'Mantenimiento':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          color: '#F59E0B'
        };
      default:
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#10B981'
        };
    }
  };

  const getVehicleImage = (vehicle) => {
    // Priorizar sideImage, luego mainViewImage, luego primera imagen de galería
    if (vehicle.sideImage) {
      return vehicle.sideImage;
    }
    if (vehicle.mainViewImage) {
      return vehicle.mainViewImage;
    }
    if (vehicle.galleryImages && vehicle.galleryImages.length > 0) {
      return vehicle.galleryImages[0];
    }
    return 'https://via.placeholder.com/300x200/E5E7EB/9CA3AF?text=Auto';
  };

  if (!vehicles || vehicles.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Vehículo a chequear</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay vehículos disponibles</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vehículo a chequear</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.vehicleScrollContainer}
      >
        {vehicles.map((vehicle) => {
          const statusStyle = getStatusColor(vehicle.status);
          const isSelected = selectedVehicle?._id === vehicle._id;
          
          return (
            <TouchableOpacity
              key={vehicle._id}
              style={[
                styles.vehicleCard,
                isSelected && styles.selectedCard
              ]}
              onPress={() => onSelectVehicle(vehicle)}
            >
              {/* Header con estado y checkbox */}
              <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusStyle.color }]} />
                  <Text style={[styles.statusText, { color: statusStyle.color }]}>
                    {vehicle.status}
                  </Text>
                </View>
                
                <View style={styles.checkboxContainer}>
                  <Text style={styles.checkboxLabel}>Seleccionar</Text>
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </View>
              </View>
              
              {/* Imagen del vehículo */}
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: getVehicleImage(vehicle) }}
                  style={styles.vehicleImage}
                  resizeMode="cover"
                />
              </View>
              
              {/* Información del vehículo */}
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName} numberOfLines={2}>
                  {vehicle.vehicleName}
                </Text>
                <Text style={styles.vehicleYear}>{vehicle.year}</Text>
                
                {/* Detalles con iconos */}
                <View style={styles.vehicleDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Ionicons name="people-outline" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>{vehicle.capacity} personas</Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Ionicons name="settings-outline" size={16} color="#6B7280" />
                      <Text style={styles.detailText}>Automático</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  vehicleScrollContainer: {
    paddingRight: 20,
  },
  vehicleCard: {
    width: 320,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedCard: {
    borderColor: '#10B981',
    borderWidth: 2,
    shadowColor: '#10B981',
    shadowOpacity: 0.15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
  checkboxContainer: {
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleImage: {
    width: 280,
    height: 160,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  vehicleInfo: {
    alignItems: 'center',
  },
  vehicleName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 24,
  },
  vehicleYear: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  vehicleDetails: {
    width: '100%',
  },
  detailRow: {
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  emptyContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default VehicleSelector;
