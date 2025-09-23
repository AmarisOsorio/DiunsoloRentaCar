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
    height: 160, // Altura aumentada para que coincida con los bocetos (sin rol tag)
    marginHorizontal: 4,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  avatarContainer: {
    width: 55,
    height: 55,
    marginBottom: 12,
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
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
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