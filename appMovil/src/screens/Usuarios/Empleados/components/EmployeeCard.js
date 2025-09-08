import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function EmployeeCard({ empleado, onDetails }) {
  const getInitials = (nombre) => {
    return nombre
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getRoleColor = (rol) => {
    switch (rol) {
      case 'Administrador':
        return '#E74C3C';
      case 'Gestor':
        return '#F39C12';
      case 'Empleado':
        return '#3498DB';
      default:
        return '#95A5A6';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.avatarContainer}>
        {empleado.foto ? (
          <Image source={{ uri: empleado.foto }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{getInitials(empleado.nombre)}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.employeeName} numberOfLines={1}>
        {empleado.nombre}
      </Text>

      <View style={[styles.roleTag, { backgroundColor: getRoleColor(empleado.rol) }]}>
        <Text style={styles.roleText}>{empleado.rol}</Text>
      </View>

      <TouchableOpacity
        style={styles.detailsButton}
        onPress={onDetails}
      >
        <Text style={styles.detailsButtonText}>Detalles</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: (width - 48) / 2,
    minHeight: 180,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    minHeight: 20,
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  roleText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  detailsButton: {
    backgroundColor: '#5B9BD5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    width: '100%',
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});