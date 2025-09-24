import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UpdateSuccessModal = ({ visible, onClose, vehicleName, autoClose = true }) => {
  const scaleAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      // Animación de entrada
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Auto cerrar después de 2 segundos si autoClose está habilitado
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, 2000);

        return () => clearTimeout(timer);
      }
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible, autoClose]);

  const handleClose = () => {
    // Animación de salida
    Animated.spring(scaleAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      if (onClose) {
        onClose();
      }
    });
  };

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Icono de éxito */}
          <View style={styles.iconContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={40} color="white" />
            </View>
          </View>

          {/* Título */}
          <Text style={styles.title}>¡Actualización Exitosa!</Text>

          {/* Mensaje */}
          <Text style={styles.message}>
            El mantenimiento de{' '}
            <Text style={styles.vehicleName}>{vehicleName || 'este vehículo'}</Text>
            {' '}ha sido actualizado correctamente.
          </Text>

          {/* Botón de cerrar (opcional, solo si autoClose es false) */}
          {!autoClose && (
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Text style={styles.closeButtonText}>Continuar</Text>
            </TouchableOpacity>
          )}

          {/* Indicador de auto-cierre */}
          {autoClose && (
            <View style={styles.autoCloseIndicator}>
              <Text style={styles.autoCloseText}>Se cerrará automáticamente...</Text>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  vehicleName: {
    fontWeight: '600',
    color: '#1E40AF',
  },
  closeButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  autoCloseIndicator: {
    marginTop: 10,
  },
  autoCloseText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

export default UpdateSuccessModal;