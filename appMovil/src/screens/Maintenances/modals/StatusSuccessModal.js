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
    switch (status) {
      case 'Pending':
        return {
          color: '#F59E0B',
          backgroundColor: '#FEF3C7',
          icon: 'time',
          title: 'Pendiente',
          message: 'Mantenimiento marcado como pendiente'
        };
      case 'Active':
        return {
          color: '#10B981',
          backgroundColor: '#D1FAE5',
          icon: 'play',
          title: 'Activo',
          message: 'Mantenimiento iniciado correctamente'
        };
      case 'Completed':
        return {
          color: '#6B7280',
          backgroundColor: '#F3F4F6',
          icon: 'checkmark',
          title: 'Completado',
          message: 'Mantenimiento completado exitosamente'
        };
      default:
        return {
          color: '#6B7280',
          backgroundColor: '#F3F4F6',
          icon: 'checkmark',
          title: 'Actualizado',
          message: 'Estado actualizado correctamente'
        };
    }
  };

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
          {/* Icono de éxito con animación */}
          <View style={[styles.iconContainer, { backgroundColor: statusInfo.backgroundColor }]}>
            <View style={[styles.iconCircle, { backgroundColor: statusInfo.color }]}>
              <Ionicons name={statusInfo.icon} size={28} color="white" />
            </View>
          </View>
          
          {/* Título */}
          <Text style={styles.successTitle}>{statusInfo.message}</Text>
          
          {/* Información del vehículo */}
          {vehicleName && (
            <View style={styles.vehicleInfo}>
              <Ionicons name="car" size={16} color="#6B7280" />
              <Text style={styles.vehicleText}>{vehicleName}</Text>
            </View>
          )}

          {/* Estado actual */}
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
            <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.title}
            </Text>
          </View>

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
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  vehicleText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
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