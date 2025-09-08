import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MaintenanceCard = ({
  maintenance,
  getStatusText
}) => {

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getVehicleImage = () => {
    if (!maintenance.vehicleId) {
      return 'https://via.placeholder.com/220x140/E5E7EB/9CA3AF?text=Sin+Vehiculo';
    }
    
    // PRIORIDAD: Usar sideImage primero
    if (maintenance.vehicleId?.sideImage) {
      return maintenance.vehicleId.sideImage;
    }
    // Fallback a mainViewImage si no hay sideImage
    if (maintenance.vehicleId?.mainViewImage) {
      return maintenance.vehicleId.mainViewImage;
    }
    // Fallback a primera imagen de galería
    if (maintenance.vehicleId?.galleryImages && maintenance.vehicleId.galleryImages.length > 0) {
      return maintenance.vehicleId.galleryImages[0];
    }
    // Placeholder como último recurso
    return 'https://via.placeholder.com/220x140/E5E7EB/9CA3AF?text=Auto';
  };

  const getVehicleName = () => {
    if (!maintenance.vehicleId) {
      return 'Vehículo no asignado';
    }
    return maintenance.vehicleId?.vehicleName || 'Vehículo sin nombre';
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Active':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          textColor: '#10B981'
        };
      case 'Pending':
        return {
          backgroundColor: 'rgba(251, 146, 60, 0.15)',
          textColor: '#F59E0B'
        };
      case 'Completed':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          textColor: '#3B82F6'
        };
      default:
        return {
          backgroundColor: 'rgba(107, 114, 128, 0.15)',
          textColor: '#6B7280'
        };
    }
  };

  const status = maintenance.status;
  const statusText = getStatusText(maintenance.status);
  const badgeStyle = getStatusBadgeStyle(status);

  return (
    <View style={styles.container}>
      {/* Status Badge - Dinámico basado en el estado de la BD */}
      <View style={[styles.statusBadge, { backgroundColor: badgeStyle.backgroundColor }]}>
        <Text style={[styles.statusText, { color: badgeStyle.textColor }]}>{statusText}</Text>
      </View>

      {/* Main Content Container */}
      <View style={styles.contentContainer}>
        {/* Left Side - Vehicle Info and Dates */}
        <View style={styles.leftContent}>
          {/* Vehicle Name */}
          <Text style={styles.vehicleName}>
            {getVehicleName()}
          </Text>
          
          {/* Maintenance Type */}
          <Text style={styles.maintenanceType}>{maintenance.maintenanceType}</Text>
          
          {/* Dates with Icons */}
          <View style={styles.datesContainer}>
            <View style={styles.dateItem}>
              <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
              <Text style={styles.dateText}>{formatDate(maintenance.startDate)}</Text>
            </View>
            <View style={styles.dateItem}>
              <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
              <Text style={styles.dateText}>{formatDate(maintenance.returnDate)}</Text>
            </View>
          </View>
        </View>

        {/* Right Side - Vehicle Image */}
        <View style={styles.rightContent}>
          <Image
            source={{ uri: getVehicleImage() }}
            style={styles.vehicleImage}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 200,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flex: 1,
  },
  leftContent: {
    flex: 1,
    paddingRight: 20,
  },
  rightContent: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 220,
    height: 140,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  vehicleName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 6,
    lineHeight: 30,
  },
  maintenanceType: {
    fontSize: 16,
    color: '#0EA5E9',
    fontWeight: '500',
    marginBottom: 24,
  },
  datesContainer: {
    gap: 12,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  vehicleImage: {
    width: 220,
    height: 140,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
});

export default MaintenanceCard;