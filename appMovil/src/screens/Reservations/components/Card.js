import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReservationCard = ({
  reservation,
  getStatusText,
  onPress, // Nueva prop para manejar el click
  navigation // Nueva prop para navegación
}) => {

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVehicleImage = () => {
    if (!reservation.vehicleId) {
      return 'https://via.placeholder.com/220x140/E5E7EB/9CA3AF?text=Sin+Vehiculo';
    }
    
    // PRIORIDAD: Usar sideImage primero
    if (reservation.vehicleId?.sideImage) {
      return reservation.vehicleId.sideImage;
    }
    // Fallback a mainViewImage si no hay sideImage
    if (reservation.vehicleId?.mainViewImage) {
      return reservation.vehicleId.mainViewImage;
    }
    // Fallback a primera imagen de galería
    if (reservation.vehicleId?.galleryImages && reservation.vehicleId.galleryImages.length > 0) {
      return reservation.vehicleId.galleryImages[0];
    }
    // Placeholder como último recurso
    return 'https://via.placeholder.com/220x140/E5E7EB/9CA3AF?text=Auto';
  };

  const getVehicleName = () => {
    if (!reservation.vehicleId) {
      return 'Vehículo no asignado';
    }
    return reservation.vehicleId?.vehicleName || 'Vehículo sin nombre';
  };

  const getVehicleModel = () => {
    if (!reservation.vehicleId) {
      return '';
    }
    const model = reservation.vehicleId?.model || '';
    return model ? `(${model})` : '';
  };

  const getClientName = () => {
    // Usar el campo client que es un array con los datos del cliente beneficiario
    if (reservation.client && reservation.client.length > 0) {
      return reservation.client[0].name;
    }
    // Fallback al cliente por populate
    if (reservation.clientId) {
      return `${reservation.clientId.name || ''} ${reservation.clientId.lastName || ''}`.trim() || 'Cliente';
    }
    return 'Cliente sin nombre';
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

  // Manejar click en la card
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation) {
      navigation.navigate('ReservationDetails', { reservationId: reservation._id });
    }
  };

  const status = reservation.status;
  const statusText = getStatusText(reservation.status);
  const badgeStyle = getStatusBadgeStyle(status);

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Status Badge - Dinámico basado en el estado de la BD */}
      <View style={[styles.statusBadge, { backgroundColor: badgeStyle.backgroundColor }]}>
        <Text style={[styles.statusText, { color: badgeStyle.textColor }]}>{statusText}</Text>
      </View>

      {/* Main Content Container */}
      <View style={styles.contentContainer}>
        {/* Left Side - Client Info and Dates */}
        <View style={styles.leftContent}>
          {/* Client Name */}
          <Text style={styles.clientName}>
            {getClientName()}
          </Text>
          
          {/* Vehicle Info */}
          <Text style={styles.vehicleInfo}>
            {getVehicleName()} {getVehicleModel()}
          </Text>
          
          {/* Dates with Icons */}
          <View style={styles.datesContainer}>
            <View style={styles.dateItem}>
              <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
              <Text style={styles.dateText}>
                {formatDate(reservation.startDate)}
              </Text>
            </View>
            <View style={styles.dateItem}>
              <Ionicons name="time-outline" size={18} color="#9CA3AF" />
              <Text style={styles.dateText}>
                {formatDate(reservation.returnDate)}
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
          
          {/* Indicador visual de que es clickeable */}
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
  clientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 6,
    lineHeight: 30,
  },
  vehicleInfo: {
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

export default ReservationCard;