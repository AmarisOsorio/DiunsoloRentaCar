import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const VehicleCard = ({
  vehicle,
  getStatusText,
  onPress,
  navigation
}) => {

  const getVehicleImage = () => {
    if (!vehicle) {
      return 'https://via.placeholder.com/220x140/E5E7EB/9CA3AF?text=Sin+Vehiculo';
    }
    
    if (vehicle?.sideImage) {
      return vehicle.sideImage;
    }
    if (vehicle?.mainViewImage) {
      return vehicle.mainViewImage;
    }
    if (vehicle?.galleryImages && vehicle.galleryImages.length > 0) {
      return vehicle.galleryImages[0];
    }
    return 'https://via.placeholder.com/220x140/E5E7EB/9CA3AF?text=Auto';
  };

  const getVehicleName = () => {
    if (!vehicle) {
      return 'Vehículo no asignado';
    }
    return vehicle.vehicleName || 'Vehículo sin nombre';
  };

  const getVehicleModel = () => {
    if (!vehicle) {
      return '';
    }
    const model = vehicle.model || '';
    return model ? `(${model})` : '';
  };

  const getBrandName = () => {
    if (vehicle?.brandId?.brandName) {
      return vehicle.brandId.brandName;
    }
    return 'Marca';
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Disponible':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          textColor: '#10B981'
        };
      case 'Reservado':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          textColor: '#3B82F6'
        };
      case 'Mantenimiento':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          textColor: '#F59E0B'
        };
      default:
        return {
          backgroundColor: 'rgba(107, 114, 128, 0.15)',
          textColor: '#6B7280'
        };
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation) {
      navigation.navigate('VehicleDetails', { vehicleId: vehicle._id, vehicle: vehicle });
    }
  };

  const status = vehicle.status;
  const statusText = getStatusText(vehicle.status);
  const badgeStyle = getStatusBadgeStyle(status);

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Header with Status Badge */}
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: badgeStyle.backgroundColor }]}>
          <Text style={[styles.statusText, { color: badgeStyle.textColor }]}>{statusText}</Text>
        </View>
      </View>

      {/* Main Content Container */}
      <View style={styles.contentContainer}>
        {/* Left Side - Vehicle Info */}
        <View style={styles.leftContent}>
          {/* Vehicle Name */}
          <Text style={styles.vehicleName}>
            {getVehicleName()} {getVehicleModel()}
          </Text>
          
          {/* Brand Info */}
          <Text style={styles.brandInfo}>
            {getBrandName()} • {vehicle.year}
          </Text>
          
          {/* Details with Icons */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={18} color="#9CA3AF" />
              <Text style={styles.detailText}>
                {vehicle.capacity} personas
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="pricetag-outline" size={18} color="#9CA3AF" />
              <Text style={styles.detailText}>
                ${vehicle.dailyPrice}/día
              </Text>
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
          
          {/* Click indicator */}
          <View style={styles.clickIndicator}>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
  brandInfo: {
    fontSize: 16,
    color: '#0EA5E9',
    fontWeight: '500',
    marginBottom: 24,
  },
  detailsContainer: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
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
  clickIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
});

export default VehicleCard;