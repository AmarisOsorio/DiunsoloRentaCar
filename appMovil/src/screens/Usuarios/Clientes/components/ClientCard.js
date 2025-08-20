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

export default function ClientCard({ cliente, onDetails }) {
  const getInitials = (name, lastName) => {
    const firstName = name || '';
    const lastNameInitial = lastName || '';
    return (firstName.charAt(0) + lastNameInitial.charAt(0)).toUpperCase();
  };

  const getFullName = (name, lastName) => {
    return `${name || ''} ${lastName || ''}`.trim();
  };

  return (
    <View style={styles.card}>
      <View style={styles.avatarContainer}>
        {cliente.foto ? (
          <Image source={{ uri: cliente.foto }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {getInitials(cliente.name, cliente.lastName)}
            </Text>
          </View>
        )}
      </View>
      
      <Text style={styles.clientName} numberOfLines={1}>
        {getFullName(cliente.name, cliente.lastName)}
      </Text>

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
    minHeight: 160,
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
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    minHeight: 20,
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