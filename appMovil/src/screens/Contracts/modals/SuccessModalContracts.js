import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SuccessModal = ({ 
  visible, 
  onOk, 
  title = "¡Éxito!",
  message = "La operación se completó correctamente",
  okText = "Continuar"
}) => {

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onOk}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Success Icon with animation */}
          <View style={styles.iconContainer}>
            <View style={styles.successIconBackground}>
              <Ionicons name="checkmark" size={32} color="#FFFFFF" />
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Action */}
          <TouchableOpacity
            style={styles.okButton}
            onPress={onOk}
          >
            <Text style={styles.okButtonText}>{okText}</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },
  iconContainer: {
    marginBottom: 20,
  },
  successIconBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  okButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    width: '100%',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  okButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default SuccessModal;