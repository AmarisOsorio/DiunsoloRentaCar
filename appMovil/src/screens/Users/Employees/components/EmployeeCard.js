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
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    width: (width - 40) / 2, // 40 = 16 padding left + 16 padding right + 8 gap entre cards
    height: 180, // Altura aumentada para que coincida con los bocetos
    marginHorizontal: 4,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  avatarContainer: {
    width: 55,
    height: 55,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
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
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  roleTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
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
    width: '85%',
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});