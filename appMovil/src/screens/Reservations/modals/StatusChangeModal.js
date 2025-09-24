import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StatusChangeModal = ({ 
  visible, 
  onCancel, 
  onConfirm, 
  currentStatus, 
  nextStatus, 
  vehicleName,
  clientName,
  isReservation = false 
}) => {
  
  const getStatusInfo = (status) => {
    if (isReservation) {
      switch (status) {
        case 'Pending':
          return {
            color: '#F59E0B',
            backgroundColor: '#FEF3C7',
            icon: 'time-outline',
            title: 'Pendiente'
          };
        case 'Active':
          return {
            color: '#10B981',
            backgroundColor: '#D1FAE5',
            icon: 'checkmark-circle-outline',
            title: 'Activa'
          };
        case 'Completed':
          return {
            color: '#3B82F6',
            backgroundColor: '#DBEAFE',
            icon: 'flag-outline',
            title: 'Completada'
          };
        default:
          return {
            color: '#6B7280',
            backgroundColor: '#F3F4F6',
            icon: 'help-circle-outline',
            title: 'Desconocido'
          };
      }
    } else {
      // Maintenance status info (existing)
      switch (status) {
        case 'Pending':
          return {
            color: '#F59E0B',
            backgroundColor: '#FEF3C7',
            icon: 'time-outline',
            title: 'Pendiente'
          };
        case 'Active':
          return {
            color: '#10B981',
            backgroundColor: '#D1FAE5',
            icon: 'play-circle-outline',
            title: 'Activo'
          };
        case 'Completed':
          return {
            color: '#6B7280',
            backgroundColor: '#F3F4F6',
            icon: 'checkmark-circle-outline',
            title: 'Completado'
          };
        default:
          return {
            color: '#6B7280',
            backgroundColor: '#F3F4F6',
            icon: 'help-circle-outline',
            title: 'Desconocido'
          };
      }
    }
  };

  const getTransitionMessage = (from, to) => {
    if (isReservation) {
      if (from === 'Pending' && to === 'Active') {
        return 'aceptar la reserva';
      }
      if (from === 'Pending' && to === 'Completed') {
        return 'rechazar la reserva';
      }
      if (from === 'Active' && to === 'Completed') {
        return 'completar la reserva';
      }
      if (from === 'Completed' && to === 'Pending') {
        return 'reactivar la reserva';
      }
      return 'cambiar el estado de la reserva';
    } else {
      // Maintenance messages (existing)
      if (from === 'Pending' && to === 'Active') {
        return 'iniciar el mantenimiento';
      }
      if (from === 'Active' && to === 'Completed') {
        return 'completar el mantenimiento';
      }
      if (from === 'Completed' && to === 'Pending') {
        return 'reiniciar el mantenimiento';
      }
      return 'cambiar el estado del mantenimiento';
    }
  };

  const getConfirmationText = (from, to) => {
    if (isReservation) {
      if (from === 'Pending' && to === 'Active') {
        return 'Esta acción aceptará la reserva y el vehículo quedará marcado como reservado.';
      }
      if (from === 'Pending' && to === 'Completed') {
        return 'Esta acción rechazará la reserva y liberará el vehículo para otras reservas.';
      }
      if (from === 'Active' && to === 'Completed') {
        return 'Esta acción marcará la reserva como completada y liberará el vehículo.';
      }
      return `¿Estás seguro de que deseas ${getTransitionMessage(from, to)}?`;
    } else {
      return `¿Estás seguro de que deseas ${getTransitionMessage(from, to)}?`;
    }
  };

  if (!visible) return null;

  const fromInfo = getStatusInfo(currentStatus);
  const toInfo = getStatusInfo(nextStatus);
  const action = getTransitionMessage(currentStatus, nextStatus);
  const confirmationText = getConfirmationText(currentStatus, nextStatus);

  // Color especial para acciones de rechazo
  const isRejectAction = currentStatus === 'Pending' && nextStatus === 'Completed' && isReservation;
  const confirmButtonColor = isRejectAction ? '#DC2626' : toInfo.color;
  const confirmButtonIcon = isRejectAction ? 'close-circle-outline' : toInfo.icon;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header con ícono */}
          <View style={styles.iconContainer}>
            <View style={[styles.iconBackground, { backgroundColor: fromInfo.backgroundColor }]}>
              <Ionicons name={fromInfo.icon} size={32} color={fromInfo.color} />
            </View>
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={20} color="#9CA3AF" />
            </View>
            <View style={[styles.iconBackground, { backgroundColor: toInfo.backgroundColor }]}>
              <Ionicons name={toInfo.icon} size={32} color={toInfo.color} />
            </View>
          </View>
          
          {/* Título */}
          <Text style={styles.modalTitle}>
            {isReservation ? 'Cambiar estado de reserva' : 'Cambiar estado'}
          </Text>
          
          {/* Mensaje de confirmación */}
          <Text style={styles.modalMessage}>
            {confirmationText}
          </Text>
          
          {/* Información del vehículo y cliente */}
          <View style={styles.detailsContainer}>
            {vehicleName && (
              <View style={styles.detailItem}>
                <Ionicons name="car-outline" size={16} color="#6B7280" />
                <Text style={styles.detailText}>{vehicleName}</Text>
              </View>
            )}
            {clientName && isReservation && (
              <View style={styles.detailItem}>
                <Ionicons name="person-outline" size={16} color="#6B7280" />
                <Text style={styles.detailText}>{clientName}</Text>
              </View>
            )}
          </View>

          {/* Transición de estados */}
          <View style={styles.statusTransition}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: fromInfo.color }]} />
              <Text style={[styles.statusText, { color: fromInfo.color }]}>
                {fromInfo.title}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color="#D1D5DB" />
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: toInfo.color }]} />
              <Text style={[styles.statusText, { color: toInfo.color }]}>
                {toInfo.title}
              </Text>
            </View>
          </View>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.confirmButton, { backgroundColor: confirmButtonColor }]}
              onPress={onConfirm}
            >
              <Ionicons name={confirmButtonIcon} size={16} color="white" style={styles.buttonIcon} />
              <Text style={styles.confirmButtonText}>
                {isRejectAction ? 'Rechazar' : 'Confirmar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 10,
    minWidth: 320,
    maxWidth: 400,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowContainer: {
    marginHorizontal: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
  },
  statusTransition: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 6,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StatusChangeModal;