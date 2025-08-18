import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ConfirmLogout from './ConfirmLogout';
import SuccesLogout from './SuccesLogout';

export default function ProfilePopout({ visible, onClose, navigation, onRequestReopen, onRequestCloseProfile }) {
  const [showLogoutAnim, setShowLogoutAnim] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [showConfirm, setShowConfirm] = useState(false);

  // Maneja la apertura del modal de confirmación
  const handleLogout = () => {
    if (onRequestCloseProfile) onRequestCloseProfile();
    setTimeout(() => setShowConfirm(true), 200);
  };

  // Cuando se cancela el modal de confirmación, reabrir el ProfilePopout
  const handleCancelConfirm = () => {
    setShowConfirm(false);
    if (onRequestReopen) {
      setTimeout(() => onRequestReopen(), 200);
    }
  };

  // Cuando se confirma el logout
  const doLogout = () => {
    if (onRequestCloseProfile) onRequestCloseProfile();
    setShowLogoutAnim(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      setShowLogoutAnim(false);
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }, 1400);
  };

  return (
    <>
      {/* Modal de confirmación de logout extraído */}
      <ConfirmLogout
        visible={showConfirm}
        onCancel={handleCancelConfirm}
        onConfirm={() => { setShowConfirm(false); setTimeout(doLogout, 100); }}
      />
      {/* Modal de animación de logout exitoso extraído */}
      <SuccesLogout
        visible={showLogoutAnim}
      />
      {/* Modal de perfil */}
      <Modal
        visible={visible && !showLogoutAnim}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={[StyleSheet.absoluteFill, { zIndex: 1 }]} activeOpacity={1} onPress={onClose} />
          <Animated.View style={[styles.card, { opacity: fadeAnim, zIndex: 2 }]}> 
            {/* Botón de cerrar */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            {/* Título */}
            <Text style={styles.title}>Mi perfil</Text>
            {/* Icono de usuario */}
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={72} color="#153A8B" style={styles.avatarIcon} />
            </View>
            {/* Nombre y rol */}
            <Text style={styles.name}>Aguacatito</Text>
            <Text style={styles.role}>Administrador</Text>
            {/* Contraseña oculta y botón de editar */}
            <View style={styles.passwordRow}>
              <Text style={styles.password}>••••••••••</Text>
              <TouchableOpacity>
                <Ionicons name="pencil" size={18} color="#fff" style={styles.editIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            {/* Botón de cerrar sesión */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 280,
    backgroundColor: '#153A8B',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: 'center',
    position: 'relative',
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 18,
  },
  avatarContainer: {
    backgroundColor: '#fff',
    borderRadius: 48,
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarIcon: {
    alignSelf: 'center',
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  role: {
    color: '#B1D0FF',
    fontSize: 14,
    marginBottom: 18,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 2,
    marginTop: 2,
  },
  password: {
    color: '#fff',
    fontSize: 16,
    letterSpacing: 2,
    flex: 1,
  },
  editIcon: {
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#fff',
    opacity: 0.3,
    alignSelf: 'stretch',
    marginVertical: 10,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  logoutText: {
    color: '#153A8B',
    fontWeight: 'bold',
    fontSize: 15,
  },
});


