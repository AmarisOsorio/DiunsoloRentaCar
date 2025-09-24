import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusChangeModal from '../modals/StatusChangeModal';
import StatusSuccessModal from '../modals/StatusSuccessModal';

const MaintenanceCard = ({
  maintenance,
  getStatusText,
  onPress,
  onStatusChange
}) => {
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingNewStatus, setPendingNewStatus] = useState(null);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const   getVehicleImage = () => {
    if (!maintenance.vehicleId) {
      return 'https://via.placeholder.com/180x120/ffffff/ffffff?text=';
    }
    
    // PRIORIDAD: Usar sideImage primero (mejor para vista lateral del carro)
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
    // Placeholder transparente como último recurso
    return 'https://via.placeholder.com/180x120/ffffff/ffffff?text=';
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
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          textColor: '#F59E0B'
        };
      case 'Completed':
        return {
          backgroundColor: 'rgba(107, 114, 128, 0.15)',
          textColor: '#6B7280'
        };
      default:
        return {
          backgroundColor: 'rgba(107, 114, 128, 0.15)',
          textColor: '#6B7280'
        };
    }
  };

  const getStatusToggleIcon = (status) => {
    switch (status) {
      case 'Pending':
        return {
          icon: 'play-circle',
          color: '#10B981',
          nextStatus: 'Active',
          message: 'Marcar como activo'
        };
      case 'Active':
        return {
          icon: 'checkmark-circle',
          color: '#6B7280',
          nextStatus: 'Completed',
          message: 'Marcar como completado'
        };
      case 'Completed':
        return {
          icon: 'refresh-circle',
          color: '#F59E0B',
          nextStatus: 'Pending',
          message: 'Marcar como pendiente'
        };
      default:
        return {
          icon: 'play-circle',
          color: '#10B981',
          nextStatus: 'Active',
          message: 'Marcar como activo'
        };
    }
  };

  const handleStatusToggle = () => {
    const toggleInfo = getStatusToggleIcon(maintenance.status);
    setPendingNewStatus(toggleInfo.nextStatus);
    setShowChangeModal(true);
  };

  const handleConfirmChange = async () => {
    setShowChangeModal(false);
    
    if (onStatusChange && pendingNewStatus) {
      try {
        await onStatusChange(maintenance._id, pendingNewStatus);
        setShowSuccessModal(true);
      } catch (error) {
        // El error ya se maneja en el componente padre
      }
    }
  };

  const handleCancelChange = () => {
    setShowChangeModal(false);
    setPendingNewStatus(null);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setPendingNewStatus(null);
  };

  const status = maintenance.status;
  const statusText = getStatusText(maintenance.status);
  const badgeStyle = getStatusBadgeStyle(status);
  const toggleInfo = getStatusToggleIcon(status);

  return (
    <>
      <TouchableOpacity 
        style={styles.container}
        onPress={() => onPress && onPress(maintenance)}
        activeOpacity={0.7}
      >
        {/* Header with Status Badge and Toggle Button */}
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: badgeStyle.backgroundColor }]}>
            <Text style={[styles.statusText, { color: badgeStyle.textColor }]}>{statusText}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.statusToggleButton, { borderColor: toggleInfo.color }]}
            onPress={handleStatusToggle}
          >
            <Ionicons name={toggleInfo.icon} size={20} color={toggleInfo.color} />
          </TouchableOpacity>
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
      </TouchableOpacity>

      {/* Modales personalizados */}
      <StatusChangeModal
        visible={showChangeModal}
        onCancel={handleCancelChange}
        onConfirm={handleConfirmChange}
        currentStatus={maintenance.status}
        nextStatus={pendingNewStatus}
        vehicleName={getVehicleName()}
      />

      <StatusSuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessClose}
        newStatus={pendingNewStatus}
        vehicleName={getVehicleName()}
        autoClose={true}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 200,
    position: 'relative',
    overflow: 'hidden',
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
  statusToggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  leftContent: {
    flex: 1,
    paddingRight: 150,
  },
  rightContent: {
    position: 'absolute',
    right: 0,
    bottom: -20,
    width: 180,
    height: 120,
  },
  vehicleName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 8,
    lineHeight: 26,
  },
  maintenanceType: {
    fontSize: 16,
    color: '#0EA5E9',
    fontWeight: '500',
    marginBottom: 20,
  },
  datesContainer: {
    gap: 10,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  vehicleImage: {
    width: 180,
    height: 120,
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  },
});

export default MaintenanceCard;