import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SuccessModal({ visible, message, onClose }) {
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();

      // Auto-close after 2 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
    });
  };

  const getDescription = () => {
    if (message === '¡Marca guardada!') return 'Se ha añadido una nueva marca en tu sistema';
    if (message === '¡Se ha actualizado la marca!') return 'La marca se actualiza satisfactoriamente';
    if (message === '¡Se ha eliminado la marca!') return 'La marca se elimina permanentemente';
    return 'Operación completada exitosamente';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }
          ]}
        >
          <View style={styles.iconContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={width * 0.08} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.message}>{message}</Text>
          <Text style={styles.description}>{getDescription()}</Text>

          <TouchableOpacity
            style={styles.okButton}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.08,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: width * 0.04,
    paddingVertical: height * 0.04,
    paddingHorizontal: width * 0.06,
    alignItems: 'center',
    minWidth: width * 0.7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: height * 0.025,
  },
  successIcon: {
    width: width * 0.16,
    height: width * 0.16,
    borderRadius: width * 0.08,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: width * 0.04,
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: height * 0.01,
    fontWeight: '600',
  },
  description: {
    fontSize: width * 0.035,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: height * 0.03,
  },
  okButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.015,
    borderRadius: width * 0.02,
    minWidth: width * 0.25,
  },
  okButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.04,
    fontWeight: '600',
    textAlign: 'center',
  },
});