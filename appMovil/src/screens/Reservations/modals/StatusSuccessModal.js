import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StatusSuccessModal = ({ 
  visible, 
  onClose, 
  newStatus, 
  vehicleName,
  clientName,
  isReservation = false,
  autoClose = true 
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animación de entrada
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto cerrar después de 2.5 segundos si autoClose está habilitado
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, 2500);

        return () => clearTimeout(timer);
      }
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible, autoClose]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getStatusInfo = (status) => {
    if (isReservation) {
      switch (status) {
        case 'Pending':
          return {
            color: '#F59E0B',
            backgroundColor: '#FEF3C7',
            icon: 'time',
            title: 'Pendiente',
            message: 'Reserva marcada como pendiente',
            successMessage: 'La reserva ha sido reactivada correctamente'
          };
        case 'Active':
          return {
            color: '#10B981',
            backgroundColor: '#D1FAE5',
            icon: 'checkmark-circle',
            title: 'Aceptada',
            message: 'Reserva aceptada correctamente',
            successMessage: '¡La reserva ha sido aceptada exitosamente!'
          };
        case 'Completed':
          return {
            color: '#3B82F6',
            backgroundColor: '#DBEAFE',
            icon: 'flag',
            title: 'Completada',
            message: 'Reserva completada exitosamente',
            successMessage: 'La reserva ha sido completada'
          };
        default:
          return {
            color: '#6B7280',
            backgroundColor: '#F3F4F6',
            icon: 'checkmark',
            title: 'Actualizada',
            message: 'Estado actualizado correctamente',
            successMessage: 'El estado ha sido actualizado'
          };
      }
    } else {
      // Maintenance status info (existing)
      switch (status) {
        case 'Pending':
          return {
            color: '#F59E0B',
            backgroundColor: '#FEF3C7',
            icon: 'time',
            title: 'Pendiente',
            message: 'Mantenimiento marcado como pendiente',
            successMessage: 'El mantenimiento ha sido reactivado'
          };
        case 'Active':
          return {
            color: '#10B981',
            backgroundColor: '#D1FAE5',
            icon: 'play',
            title: 'Activo',
            message: 'Mantenimiento iniciado correctamente',
            successMessage: 'El mantenimiento ha sido iniciado'
          };
        case 'Completed':
          return {
            color: '#6B7280',
            backgroundColor: '#F3F4F6',
            icon: 'checkmark',
            title: 'Completado',
            message: 'Mantenimiento completado exitosamente',
            successMessage: 'El mantenimiento ha sido completado'
          };
        default:
          return {
            color: '#6B7280',
            backgroundColor: '#F3F4F6',
            icon: 'checkmark',
            title: 'Actualizado',
            message: 'Estado actualizado correctamente',
            successMessage: 'El estado ha sido actualizado'
          };
      }
    }
  };

  // Detectar si es una acción de rechazo de reserva
  const isRejectAction = newStatus === 'Completed' && isReservation;
  
  if (!visible) return null;

  const statusInfo = getStatusInfo(newStatus);

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={[
          styles.modalOverlay,
          {
            opacity: opacityAnim,
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          {/* Ícono de éxito con animación */}
          <View style={[styles.iconContainer, { backgroundColor: statusInfo.backgroundColor }]}>
            <View style={[styles.iconCircle, { backgroundColor: statusInfo.color }]}>
              <Ionicons 
                name={isRejectAction ? "close-circle" : statusInfo.icon} 
                size={28} 
                color="white" 
              />
            </View>
          </View>
          
          {/* Título dinámico basado en el tipo de acción */}
          <Text style={styles.successTitle}>
            {isRejectAction ? '¡Reserva rechazada!' : statusInfo.successMessage}
          </Text>
          
          {/* Información del vehículo y cliente */}
          <View style={styles.detailsContainer}>
            {vehicleName && (
              <View style={styles.detailItem}>
                <Ionicons name="car" size={16} color="#6B7280" />
                <Text style={styles.detailText}>{vehicleName}</Text>
              </View>
            )}
            {clientName && isReservation && (
              <View style={styles.detailItem}>
                <Ionicons name="person" size={16} color="#6B7280" />
                <Text style={styles.detailText}>{clientName}</Text>
              </View>
            )}
          </View>

          {/* Estado actual */}
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
            <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.title}
            </Text>
          </View>

          {/* Mensaje adicional para reservas rechazadas */}
          {isRejectAction && (
            <Text style={styles.additionalMessage}>
              El vehículo ahora está disponible para nuevas reservas
            </Text>
          )}

          {/* Botón OK */}
          <TouchableOpacity 
            style={[styles.okButton, { backgroundColor: statusInfo.color }]}
            onPress={handleClose}
          >
            <Text style={styles.okButtonText}>Perfecto</Text>
          </TouchableOpacity>

          {/* Indicador de auto-close */}
          {autoClose && (
            <Text style={styles.autoCloseText}>Se cerrará automáticamente</Text>
          )}
        </Animated.View>
      </Animated.View>
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
    minWidth: 300,
    maxWidth: 360,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 16,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
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
  additionalMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  okButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: 120,
    alignItems: 'center',
  },
  okButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  autoCloseText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default StatusSuccessModal;