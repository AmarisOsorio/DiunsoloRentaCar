import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MaintenanceTypeSelector = ({ maintenanceType, onSelectType }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const maintenanceTypes = [
    'Cambio de aceite',
    'Cambio de filtros',
    'Revisión de frenos',
    'Alineación y balanceo',
    'Cambio de llantas',
    'Revisión de motor',
    'Cambio de batería',
    'Revisión eléctrica',
    'Lavado y encerado',
    'Inspección general',
    'Cambio de bujías',
    'Revisión de transmisión',
    'Cambio de líquidos',
    'Reparación de aire acondicionado',
    'Revisión de suspensión',
    'Cambio de correa de distribución',
    'Revisión de dirección',
    'Mantenimiento preventivo',
    'Reparación mecánica',
    'Otros'
  ];

  const filteredTypes = maintenanceTypes.filter(type =>
    type.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelectType = (type) => {
    onSelectType(type);
    setIsModalVisible(false);
    setSearchText('');
  };

  const renderMaintenanceType = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.typeOption,
        item === maintenanceType && styles.selectedTypeOption
      ]}
      onPress={() => handleSelectType(item)}
    >
      <Text style={[
        styles.typeOptionText,
        item === maintenanceType && styles.selectedTypeOptionText
      ]}>
        {item}
      </Text>
      {item === maintenanceType && (
        <Ionicons name="checkmark" size={20} color="#0369A1" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tipo de mantenimiento</Text>
      
      <TouchableOpacity 
        style={styles.typeSelector}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.selectedType}>{maintenanceType}</Text>
        <Ionicons name="chevron-down" size={20} color="#0369A1" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar tipo de mantenimiento</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar tipo de mantenimiento..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <FlatList
              data={filteredTypes}
              renderItem={renderMaintenanceType}
              keyExtractor={(item) => item}
              style={styles.typesList}
              showsVerticalScrollIndicator={false}
            />
          </View>
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
    color: '#9CA3AF',
    marginBottom: 12,
  },
  typeSelector: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  typesList: {
    paddingHorizontal: 20,
  },
  typeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedTypeOption: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0369A1',
  },
  typeOptionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  selectedTypeOptionText: {
    color: '#0369A1',
    fontWeight: '600',
  },
});

export default MaintenanceTypeSelector;