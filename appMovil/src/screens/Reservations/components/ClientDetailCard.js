import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Para emulador Android usa 10.0.2.2 en lugar de localhost
const API_BASE_URL = 'http://10.0.2.2:4000/api';

const ClientDetailCard = ({ client, clientData, isEditing, onClientChange }) => {
  const [clients, setClients] = useState([]);
  const [showClientModal, setShowClientModal] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchClients();
    }
  }, [isEditing]);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Error al cargar clientes`);
      }

      const clientsData = await response.json();
      setClients(clientsData);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      Alert.alert('Error', 'No se pudieron cargar los clientes');
    } finally {
      setLoadingClients(false);
    }
  };

  const getClientName = () => {
    if (!client) {
      if (clientData && clientData.length > 0) {
        return clientData[0].name;
      }
      return 'Cliente no asignado';
    }
    return `${client.name || ''} ${client.lastName || ''}`.trim() || 'Cliente sin nombre';
  };

  const getClientEmail = () => {
    if (!client) {
      if (clientData && clientData.length > 0) {
        return clientData[0].email;
      }
      return '';
    }
    return client.email || '';
  };

  const getClientPhone = () => {
    if (!client) {
      if (clientData && clientData.length > 0) {
        return clientData[0].phone;
      }
      return '';
    }
    return client.phone || '';
  };

  const handleClientSelect = (selectedClient) => {
    onClientChange(selectedClient);
    setShowClientModal(false);
  };

  const renderClientItem = ({ item }) => (
    <TouchableOpacity
      style={styles.clientModalItem}
      onPress={() => handleClientSelect(item)}
    >
      <View style={styles.clientModalInfo}>
        <Text style={styles.clientModalName}>
          {`${item.name || ''} ${item.lastName || ''}`.trim()}
        </Text>
        <Text style={styles.clientModalEmail}>{item.email}</Text>
        <Text style={styles.clientModalPhone}>{item.phone}</Text>
      </View>
      {client && item._id === client._id && (
        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Cliente beneficiario</Text>
      
      <TouchableOpacity 
        style={[styles.clientCard, isEditing && styles.editableCard]}
        onPress={() => isEditing && setShowClientModal(true)}
        disabled={!isEditing}
      >
        <View style={styles.clientIcon}>
          <Ionicons name="person" size={24} color="#4A90E2" />
        </View>
        
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{getClientName()}</Text>
          <Text style={styles.clientEmail}>{getClientEmail()}</Text>
          <Text style={styles.clientPhone}>{getClientPhone()}</Text>
        </View>

        {isEditing && (
          <View style={styles.editIndicator}>
            <Ionicons name="chevron-forward" size={20} color="#4A90E2" />
          </View>
        )}
      </TouchableOpacity>

      {/* Modal de selección de cliente */}
      <Modal
        visible={showClientModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowClientModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowClientModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Seleccionar Cliente</Text>
            <View style={styles.modalCloseButton} />
          </View>

          {loadingClients ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color="#4A90E2" />
              <Text style={styles.modalLoadingText}>Cargando clientes...</Text>
            </View>
          ) : (
            <FlatList
              data={clients}
              renderItem={renderClientItem}
              keyExtractor={(item) => item._id}
              style={styles.clientList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  clientCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  editableCard: {
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  clientIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  clientPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  editIndicator: {
    marginLeft: 8,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  clientList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  clientModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  clientModalInfo: {
    flex: 1,
  },
  clientModalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 2,
  },
  clientModalEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 1,
  },
  clientModalPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
});