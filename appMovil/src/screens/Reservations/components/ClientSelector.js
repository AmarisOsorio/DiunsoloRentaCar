import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ClientSelector = ({ 
  clients, 
  selectedClient, 
  onSelectClient, 
  clientData, 
  onClientDataChange 
}) => {
  const [showClientModal, setShowClientModal] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  const handleClientSelect = (client) => {
    onSelectClient(client);
    setShowClientModal(false);
    setShowManualForm(false);
  };

  const handleManualClient = () => {
    onSelectClient(null);
    setShowClientModal(false);
    setShowManualForm(true);
  };

  const handleClientDataChange = (field, value) => {
    onClientDataChange({
      ...clientData,
      [field]: value
    });
  };

  const renderClientCard = (client) => {
    const isSelected = selectedClient?._id === client._id;
    const clientName = `${client.name || ''} ${client.lastName || ''}`.trim();
    
    return (
      <TouchableOpacity
        key={client._id}
        style={[styles.clientCard, isSelected && styles.selectedClientCard]}
        onPress={() => handleClientSelect(client)}
      >
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{clientName}</Text>
          <Text style={styles.clientEmail}>{client.email}</Text>
          <Text style={styles.clientPhone}>{client.phone}</Text>
        </View>
        
        <View style={styles.checkboxContainer}>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getDisplayText = () => {
    if (selectedClient) {
      return `${selectedClient.name || ''} ${selectedClient.lastName || ''}`.trim();
    }
    if (showManualForm && clientData.name) {
      return clientData.name;
    }
    return 'Seleccionar cliente';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cliente beneficiario</Text>
      
      <TouchableOpacity 
        style={styles.clientSelector}
        onPress={() => setShowClientModal(true)}
      >
        <Text style={[
          styles.selectedClientText,
          (!selectedClient && !showManualForm) && styles.placeholderText
        ]}>
          {getDisplayText()}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#4A90E2" />
      </TouchableOpacity>

      {/* Formulario manual si está activado */}
      {showManualForm && (
        <View style={styles.manualForm}>
          <Text style={styles.formTitle}>Datos del cliente</Text>
          
          <TextInput
            style={styles.textInput}
            placeholder="Nombre completo"
            value={clientData.name}
            onChangeText={(text) => handleClientDataChange('name', text)}
            placeholderTextColor="#9CA3AF"
          />
          
          <TextInput
            style={styles.textInput}
            placeholder="Teléfono"
            value={clientData.phone}
            onChangeText={(text) => handleClientDataChange('phone', text)}
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
          />
          
          <TextInput
            style={styles.textInput}
            placeholder="Email"
            value={clientData.email}
            onChangeText={(text) => handleClientDataChange('email', text)}
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      )}

      {/* Modal de selección */}
      <Modal
        visible={showClientModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowClientModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Cliente</Text>
            <TouchableOpacity
              onPress={() => setShowClientModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.clientsList}>
            {/* Opción para cliente manual */}
            <TouchableOpacity
              style={styles.manualClientOption}
              onPress={handleManualClient}
            >
              <View style={styles.manualClientContent}>
                <Ionicons name="person-add" size={24} color="#4A90E2" />
                <View style={styles.manualClientText}>
                  <Text style={styles.manualClientTitle}>Nuevo cliente</Text>
                  <Text style={styles.manualClientSubtitle}>Ingresar datos manualmente</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#4A90E2" />
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>O seleccionar cliente existente</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Lista de clientes existentes */}
            {clients.map(renderClientCard)}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  clientSelector: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedClientText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  manualForm: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  clientsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  manualClientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 20,
  },
  manualClientContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  manualClientText: {
    marginLeft: 12,
  },
  manualClientTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
  },
  manualClientSubtitle: {
    fontSize: 14,
    color: '#0284C7',
    marginTop: 2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedClientCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 1,
  },
  clientPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkboxContainer: {
    marginLeft: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
});

export default ClientSelector;